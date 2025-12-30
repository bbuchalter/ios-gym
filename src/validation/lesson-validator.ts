import { CLIEngine } from '../cli/engine';
import { CLISession } from '../cli-session';
import { loadGrammar } from '../grammar/loader';
import { DeviceModel } from '../types';
import * as path from 'path';
import { 
  AssertionRunner, 
  ValidationError, 
  ValidationResult, 
  Assertion, 
  ExerciseDefinition 
} from './assertion-runner';

export type { ValidationError, ValidationResult, Assertion, ExerciseDefinition };

export class LessonValidator extends AssertionRunner {
  /**
   * Validate exercise by executing commands and checking final state
   * Goal-based: doesn't care about command order, only final result
   */
  validateExercise(exercise: ExerciseDefinition): ValidationResult {
    const grammarPath = path.join(
      process.cwd(),
      exercise.deviceModel === '2960-switch' 
        ? 'grammar/commands-2960-switch.yaml' 
        : 'grammar/commands-1941-router.yaml'
    );
    
    const grammar = loadGrammar(grammarPath);
    const engine = new CLIEngine(grammar);
    const session = new CLISession(grammar, exercise.deviceModel);
    
    // Execute all commands
    const commandErrors: string[] = [];
    
    for (const command of exercise.commands) {
      // Auto-supply passwords if needed
      if (session.pendingPasswordPrompt) {
        // Extract password from previous enable secret command
        const passwordCmd = exercise.commands.find(c => c.includes('enable secret'));
        if (passwordCmd) {
          const password = passwordCmd.split('enable secret')[1].trim();
          engine.submitPassword(session, password);
        }
      }
      
      const result = engine.executeCommand(session, command);
      
      // Check for errors (but allow name lookups in exploratory exercises)
      if (result.output?.some(line => 
        line.includes('Invalid input detected') || 
        (line.includes('% Invalid') && !line.includes('Name lookup'))
      )) {
        commandErrors.push(`Command failed: "${command}" - ${result.output.join(' ')}`);
      }
    }
    
    if (commandErrors.length > 0) {
      return {
        passed: false,
        errors: commandErrors.map(msg => ({ 
          assertionType: 'command_execution', 
          message: msg 
        })),
        warnings: []
      };
    }
    
    // Check goal-based assertions against final state
    // For build-time validation, we don't require saved state (commands include write memory)
    return this.runAssertions(session.deviceState, session.modeStack, exercise.validation.assertions, false);
  }
}

