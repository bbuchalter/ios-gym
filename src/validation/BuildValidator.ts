import * as fs from 'fs';
import * as path from 'path';
import Ajv from 'ajv';
import { CLIEngine } from '../cli/engine';
import { CLISession } from '../cli-session';
import { loadGrammar } from '../grammar/loader';
import { Exercise, BuildResult, ValidationError } from './types';
import { RuntimeValidator } from './RuntimeValidator';
import { ModeType } from '../types';

/**
 * BuildValidator - Node.js build-time validation of exercises
 * 
 * This validator runs at build time in Node.js and:
 * 1. Validates exercise JSON against schema
 * 2. Loads appropriate device grammar
 * 3. Executes all commands in a simulated CLI session
 * 4. Validates the final savedState matches assertions
 * 
 * This catches bugs like interface naming errors (g1/0/* vs g0/*) before deployment.
 */
export class BuildValidator {
  private ajv: Ajv;
  private schemaPath: string;
  private runtimeValidator: RuntimeValidator;
  
  constructor(schemaPath?: string) {
    this.ajv = new Ajv({ allErrors: true });
    this.schemaPath = schemaPath || path.join(__dirname, '../exercises/schema.json');
    this.runtimeValidator = new RuntimeValidator();
  }
  
  /**
   * Validate an exercise JSON file
   * 
   * @param exercisePath - Path to exercise JSON file
   * @returns BuildResult with validation status and errors
   */
  async validateExercise(exercisePath: string): Promise<BuildResult> {
    const errors: ValidationError[] = [];
    const executionErrors: string[] = [];
    let commandsExecuted = 0;
    
    // Step 1: Load and parse JSON
    let exercise: Exercise;
    try {
      const content = fs.readFileSync(exercisePath, 'utf-8');
      exercise = JSON.parse(content);
    } catch (err) {
      return {
        success: false,
        errors: [],
        executionErrors: [`Failed to load exercise: ${err}`],
        exerciseId: 'unknown',
        commandsExecuted: 0
      };
    }
    
    // Step 2: Validate against JSON Schema
    const schemaValidation = this.validateSchema(exercise);
    if (!schemaValidation.valid) {
      return {
        success: false,
        errors: [],
        executionErrors: schemaValidation.errors,
        exerciseId: exercise.id,
        commandsExecuted: 0
      };
    }
    
    // Step 3: Load appropriate grammar for device model
    let grammar;
    try {
      const grammarPath = this.getGrammarPath(exercise.deviceModel);
      grammar = loadGrammar(grammarPath);
    } catch (err) {
      return {
        success: false,
        errors: [],
        executionErrors: [`Failed to load grammar for ${exercise.deviceModel}: ${err}`],
        exerciseId: exercise.id,
        commandsExecuted: 0
      };
    }
    
    // Step 4: Execute commands in simulated session
    const engine = new CLIEngine(grammar);
    const session = new CLISession(grammar, exercise.deviceModel);
    
    // Extract commands from goals structure
    const commands = this.extractCommands(exercise);
    
    for (const command of commands) {
      try {
        const result = engine.executeCommand(session, command);
        commandsExecuted++;
        
        // Check for invalid command (output contains error markers)
        if (result.output && result.output.length > 0) {
          const hasError = result.output.some(line => 
            line.includes('Invalid input') || 
            line.includes('Incomplete command') ||
            line.includes('Ambiguous command')
          );
          if (hasError) {
            executionErrors.push(`Command "${command}" returned error: ${result.output.join(' ')}`);
          }
        }
        
        // Handle password prompts with mock responses
        if (result.passwordPrompt) {
          const mockPassword = this.getMockPassword(result.passwordPrompt.handler);
          engine.submitPassword(session, mockPassword);
        }
      } catch (err) {
        executionErrors.push(`Exception executing "${command}": ${err}`);
      }
    }
    
    // If there were execution errors, return early
    if (executionErrors.length > 0) {
      return {
        success: false,
        errors: [],
        executionErrors,
        exerciseId: exercise.id,
        commandsExecuted
      };
    }
    
    // Step 4.5: Validate diagnostic commands
    const diagnosticCommandErrors = this.validateDiagnosticCommands(exercise, engine, session);
    
    // Step 5: Validate savedState against assertions
    // Use RuntimeValidator to check assertions (same logic as browser)
    const validationResult = this.runtimeValidator.validate(exercise, session.deviceState);
    
    return {
      success: validationResult.success && diagnosticCommandErrors.length === 0,
      errors: validationResult.errors,
      executionErrors: executionErrors.length > 0 ? executionErrors : undefined,
      diagnosticCommandErrors: diagnosticCommandErrors.length > 0 ? diagnosticCommandErrors : undefined,
      exerciseId: exercise.id,
      commandsExecuted
    };
  }
  
  /**
   * Validate exercise against JSON Schema
   */
  private validateSchema(exercise: Exercise): { valid: boolean; errors: string[] } {
    const schema = JSON.parse(fs.readFileSync(this.schemaPath, 'utf-8'));
    const validate = this.ajv.compile(schema);
    const valid = validate(exercise);
    
    if (!valid && validate.errors) {
      const errors = validate.errors.map(err => 
        `${err.instancePath} ${err.message}`
      );
      return { valid: false, errors };
    }
    
    return { valid: true, errors: [] };
  }
  
  /**
   * Extract flat list of commands from hierarchical goals structure
   */
  private extractCommands(exercise: Exercise): string[] {
    const commands: string[] = [];
    
    for (const goal of exercise.goals) {
      for (const step of goal.steps) {
        if (step.command) {
          commands.push(step.command);
        }
      }
    }
    
    return commands;
  }
  
  /**
   * Validate that all diagnostic commands are executable on this device
   * Returns array of error messages for invalid diagnostic commands
   */
  private validateDiagnosticCommands(
    exercise: Exercise, 
    engine: CLIEngine, 
    session: CLISession
  ): string[] {
    const errors: string[] = [];
    const diagnosticCommands = new Set<string>();
    
    // Collect unique diagnostic commands from assertions
    for (const assertion of exercise.assertions) {
      if (assertion.diagnosticCommand) {
        diagnosticCommands.add(assertion.diagnosticCommand);
      }
    }
    
    // Test each diagnostic command
    for (const command of diagnosticCommands) {
      try {
        // Diagnostic commands should work in privileged mode
        // Create a fresh session in privileged mode for testing
        const grammar = loadGrammar(this.getGrammarPath(exercise.deviceModel));
        const testSession = new CLISession(grammar, exercise.deviceModel);
        testSession.modeStack.push(ModeType.PRIV_EXEC);
        
        const result = engine.executeCommand(testSession, command);
        
        // Check for command errors
        if (result.output && result.output.length > 0) {
          const hasError = result.output.some(line => 
            line.includes('Invalid input') || 
            line.includes('Incomplete command') ||
            line.includes('Ambiguous command') ||
            line.includes('% Unknown command')
          );
          
          if (hasError) {
            errors.push(`Diagnostic command "${command}" is invalid: ${result.output[0]}`);
          }
        }
      } catch (err) {
        errors.push(`Diagnostic command "${command}" threw exception: ${err}`);
      }
    }
    
    return errors;
  }
  
  /**
   * Get grammar file path for device model
   */
  private getGrammarPath(deviceModel: string): string {
    const projectRoot = path.join(__dirname, '../..');
    
    if (deviceModel === '2960-switch') {
      return path.join(projectRoot, 'grammar/commands-2960-switch.yaml');
    } else if (deviceModel === '1941-router') {
      return path.join(projectRoot, 'grammar/commands-1941-router.yaml');
    } else {
      throw new Error(`Unknown device model: ${deviceModel}`);
    }
  }
  
  /**
   * Get mock password for password prompts during build validation
   * Always returns 'cisco' for any password prompt
   */
  private getMockPassword(handler: string): string {
    // For build-time validation, always use 'cisco' as password
    // This matches the common convention in exercises
    return 'cisco';
  }
}

