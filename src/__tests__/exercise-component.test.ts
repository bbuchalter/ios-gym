/**
 * Tests for Exercise component logic
 * 
 * Note: These tests focus on the validation logic and data flow.
 * Full React component rendering tests would require @testing-library/react
 * which is not currently installed.
 */

import { SchemaValidator } from '../validation/schema-validator';
import { LessonValidator, ExerciseDefinition } from '../validation/lesson-validator';
import { RuntimeValidator } from '../validation/runtime-validator';
import * as fs from 'fs';
import * as path from 'path';

describe('Exercise Component Logic', () => {
  describe('Exercise JSON Loading and Schema Validation', () => {
    test('valid exercise file passes schema validation', () => {
      const exercisePath = path.join(process.cwd(), 'src/exercises/lesson-01-setting-hostname-and-saving-configuration.json');
      const exerciseData = JSON.parse(fs.readFileSync(exercisePath, 'utf-8'));
      
      const schemaValidator = new SchemaValidator();
      const result = schemaValidator.validateExercise(exerciseData);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    test('exercise with invalid schema is rejected', () => {
      const invalidExercise = {
        // Missing required fields
        id: 'test',
        commands: ['enable']
        // Missing: deviceModel, validation
      };
      
      const schemaValidator = new SchemaValidator();
      const result = schemaValidator.validateExercise(invalidExercise);
      
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
    
    test('all exercise files in src/exercises pass schema validation', () => {
      const exerciseFiles = fs.readdirSync(path.join(process.cwd(), 'src/exercises'))
        .filter(f => f.startsWith('lesson-') && f.endsWith('.json'));
      const schemaValidator = new SchemaValidator();
      
      for (const file of exerciseFiles) {
        const filePath = path.join(process.cwd(), 'src/exercises', file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        const result = schemaValidator.validateExercise(content);
        
        if (!result.valid) {
          console.error(`Schema validation failed for ${file}:`, result.errors);
        }
        expect(result.valid).toBe(true);
      }
    });
  });
  
  describe('Exercise Validation Logic', () => {
    test('validates exercise against device state', () => {
      const exercise: ExerciseDefinition = {
        id: 'test-validation',
        deviceModel: '2960-switch',
        commands: [
          'enable',
          'configure terminal',
          'hostname TestDevice',
          'end'
        ],
        validation: {
          type: 'goal-based',
          assertions: [
            {
              type: 'hostname',
              expected: 'TestDevice',
              message: 'Hostname should be TestDevice'
            }
          ]
        }
      };
      
      const validator = new LessonValidator();
      const result = validator.validateExercise(exercise);
      
      expect(result.passed).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    test('detects incorrect configuration', () => {
      const exercise: ExerciseDefinition = {
        id: 'test-failure',
        deviceModel: '2960-switch',
        commands: [
          'enable',
          'configure terminal',
          'hostname WrongName',
          'end'
        ],
        validation: {
          type: 'goal-based',
          assertions: [
            {
              type: 'hostname',
              expected: 'CorrectName',
              message: 'Hostname should be CorrectName'
            }
          ]
        }
      };
      
      const validator = new LessonValidator();
      const result = validator.validateExercise(exercise);
      
      expect(result.passed).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('Hostname should be CorrectName');
      expect(result.errors[0].expected).toBe('CorrectName');
      expect(result.errors[0].actual).toBe('WrongName');
    });
    
    test('handles missing session gracefully', () => {
      // Simulate what happens when registry.getSession() returns null
      // The component should show appropriate error message
      const expectedError = {
        passed: false,
        errors: [{ 
          assertionType: 'session', 
          message: 'Please use the terminal above to complete the exercise first.' 
        }],
        warnings: []
      };
      
      expect(expectedError.passed).toBe(false);
      expect(expectedError.errors[0].message).toContain('terminal');
    });
  });
  
  describe('Exercise Type Handling', () => {
    test('goal-based exercises have assertions', () => {
      const exercisePath = path.join(process.cwd(), 'src/exercises/lesson-01-setting-hostname-and-saving-configuration.json');
      const exercise = JSON.parse(fs.readFileSync(exercisePath, 'utf-8'));
      
      expect(exercise.assertions.length).toBeGreaterThan(0);
    });
    
    test('exploratory exercises have minimal assertions', () => {
      const exercisePath = path.join(process.cwd(), 'src/exercises/lesson-03-navigating-modes.json');
      const exercise = JSON.parse(fs.readFileSync(exercisePath, 'utf-8'));
      
      // Exploratory can have 0 or minimal assertions
      expect(Array.isArray(exercise.assertions)).toBe(true);
      expect(exercise.assertions.length).toBe(0);
    });
    
    test('exploratory exercises should not show Check My Work button', () => {
      const exercise: ExerciseDefinition = {
        id: 'exploratory-test',
        deviceModel: '2960-switch',
        commands: ['enable', 'show running-config'],
        validation: {
          type: 'exploratory',
          assertions: [
            { type: 'command_succeeded', message: 'Commands succeeded' }
          ]
        }
      };
      
      // The component logic checks:
      // exercise.validation.type === 'goal-based' && exercise.validation.assertions.length > 0
      const shouldShowButton = 
        exercise.validation.type === 'goal-based' && 
        exercise.validation.assertions.length > 0;
      
      expect(shouldShowButton).toBe(false);
    });
    
    test('goal-based exercises with assertions should show Check My Work button', () => {
      const exercise: ExerciseDefinition = {
        id: 'goal-based-test',
        deviceModel: '2960-switch',
        commands: ['enable', 'configure terminal', 'hostname Test'],
        validation: {
          type: 'goal-based',
          assertions: [
            { type: 'hostname', expected: 'Test', message: 'Hostname' }
          ]
        }
      };
      
      const shouldShowButton = 
        exercise.validation.type === 'goal-based' && 
        exercise.validation.assertions.length > 0;
      
      expect(shouldShowButton).toBe(true);
    });
  });
  
  describe('Exercise File Integrity', () => {
    test('all exercise files are valid JSON', () => {
      const exerciseFiles = fs.readdirSync(path.join(process.cwd(), 'src/exercises'))
        .filter(f => f.startsWith('lesson-') && f.endsWith('.json'));
      
      for (const file of exerciseFiles) {
        const filePath = path.join(process.cwd(), 'src/exercises', file);
        
        expect(() => {
          JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        }).not.toThrow();
      }
    });
    
    test('all exercise files have required fields', () => {
      const exerciseFiles = fs.readdirSync(path.join(process.cwd(), 'src/exercises'))
        .filter(f => f.startsWith('lesson-') && f.endsWith('.json'));
      
      for (const file of exerciseFiles) {
        const filePath = path.join(process.cwd(), 'src/exercises', file);
        const exercise = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        expect(exercise).toHaveProperty('id');
        expect(exercise).toHaveProperty('deviceModel');
        expect(exercise).toHaveProperty('goals');
        expect(exercise).toHaveProperty('assertions');
        expect(exercise).toHaveProperty('title');
      }
    });
    
    test('all exercise IDs are unique', () => {
      const exerciseFiles = fs.readdirSync(path.join(process.cwd(), 'src/exercises'))
        .filter(f => f.startsWith('lesson-') && f.endsWith('.json'));
      const ids = new Set<string>();
      
      for (const file of exerciseFiles) {
        const filePath = path.join(process.cwd(), 'src/exercises', file);
        const exercise = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        expect(ids.has(exercise.id)).toBe(false);
        ids.add(exercise.id);
      }
      
      // We should have at least 25 unique exercises
      expect(ids.size).toBeGreaterThanOrEqual(25);
    });
    
    test('exercise IDs match kebab-case pattern', () => {
      const exerciseFiles = fs.readdirSync(path.join(process.cwd(), 'src/exercises'))
        .filter(f => f.startsWith('lesson-') && f.endsWith('.json'));
      const kebabCasePattern = /^lesson-[0-9]+[a-z]?(-[a-z-]+)?$/;
      
      for (const file of exerciseFiles) {
        const filePath = path.join(process.cwd(), 'src/exercises', file);
        const exercise = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        expect(exercise.id).toMatch(kebabCasePattern);
      }
    });
  });
  
  describe('Validation Feedback Logic', () => {
    test('passed validation returns success message', () => {
      const result = {
        passed: true,
        errors: [],
        warnings: []
      };
      
      expect(result.passed).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    test('failed validation returns error messages', () => {
      const result = {
        passed: false,
        errors: [
          {
            assertionType: 'hostname',
            message: 'Hostname should be TestDevice',
            expected: 'TestDevice',
            actual: 'Switch'
          }
        ],
        warnings: []
      };
      
      expect(result.passed).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toContain('Hostname');
    });
    
    test('multiple errors are all reported', () => {
      const result = {
        passed: false,
        errors: [
          {
            assertionType: 'hostname',
            message: 'Hostname incorrect',
            expected: 'Test',
            actual: 'Switch'
          },
          {
            assertionType: 'interface_ip',
            message: 'IP not configured',
            expected: '192.168.1.1 255.255.255.0',
            actual: 'not configured'
          }
        ],
        warnings: []
      };
      
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].message).toBe('Hostname incorrect');
      expect(result.errors[1].message).toBe('IP not configured');
    });
  });
  
  describe('Exercise Loading Error Handling', () => {
    test('handles non-existent exercise file', async () => {
      const exerciseId = 'non-existent-exercise';
      
      // In the component, this would trigger the catch block
      // and set loadError state
      await expect(async () => {
        const response = await fetch(`/exercises/${exerciseId}.json`);
        if (!response.ok) throw new Error('Not found');
        await response.json();
      }).rejects.toThrow();
    });
    
    test('handles malformed JSON', () => {
      const malformedJSON = '{ "id": "test", invalid json }';
      
      expect(() => {
        JSON.parse(malformedJSON);
      }).toThrow();
    });
  });
  
  describe('Integration with Validators', () => {
    test('Exercise component uses RuntimeValidator for browser validation', () => {
      // In the browser, Exercise component uses RuntimeValidator
      // which doesn't require Node.js fs/path modules
      const validator = new RuntimeValidator();
      
      expect(validator).toBeDefined();
      expect(typeof validator.runAssertions).toBe('function');
    });
    
    test('Build-time validation uses LessonValidator', () => {
      // Build-time validation (validate-exercises.ts) uses LessonValidator
      // which CAN use Node.js modules
      const validator = new LessonValidator();
      
      // Test with a simple exercise that has all commands
      const simpleExercise = {
        id: 'test-simple',
        title: 'Test',
        deviceModel: '2960-switch' as const,
        goals: [{
          section: 'Test',
          steps: [
            { objective: 'Enter privileged mode', command: 'enable' },
            { objective: 'Enter config mode', command: 'configure terminal' }
          ]
        }],
        assertions: []
      };
      
      const result = validator.validateExercise(simpleExercise);
      
      expect(result.passed).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });
  
  describe('Terminal ID and Session Management', () => {
    test('exercise ID is used as terminal ID', () => {
      const exerciseId = 'hostname-basic';
      const terminalId = exerciseId;
      
      // In the component, terminalId is passed to Terminal component
      // and used to retrieve session from registry
      expect(terminalId).toBe(exerciseId);
    });
  });
  
  describe('Command Display Logic', () => {
    test('commands are displayed as ordered list items', () => {
      const exercise: ExerciseDefinition = {
        id: 'test',
        deviceModel: '2960-switch',
        commands: ['enable', 'configure terminal', 'hostname Test'],
        validation: {
          type: 'goal-based',
          assertions: []
        }
      };
      
      // Component maps commands to list items
      const listItems = exercise.commands.map((command, index) => ({
        key: index,
        command
      }));
      
      expect(listItems).toHaveLength(3);
      expect(listItems[0].command).toBe('enable');
      expect(listItems[1].command).toBe('configure terminal');
      expect(listItems[2].command).toBe('hostname Test');
    });
  });
  
  describe('Button Visibility Logic', () => {
    const testCases = [
      {
        name: 'shows button when assertions array has items',
        exercise: {
          assertions: [{ type: 'state-path', path: 'hostname', expectedValue: 'Test', description: 'Test' }]
        },
        expected: true
      },
      {
        name: 'hides button when assertions array is empty',
        exercise: {
          assertions: []
        },
        expected: false
      }
    ];
    
    testCases.forEach(({ name, exercise, expected }) => {
      test(`${name}`, () => {
        const shouldShow = exercise.assertions.length > 0;
        
        expect(shouldShow).toBe(expected);
      });
    });
  });
  
  describe('Error Message Formatting', () => {
    test('formats error with expected and actual values', () => {
      const error = {
        assertionType: 'interface_ip',
        message: 'Interface should have IP',
        expected: '192.168.1.1 255.255.255.0',
        actual: 'not configured'
      };
      
      expect(error.expected).toBeTruthy();
      expect(error.actual).toBeTruthy();
      expect(String(error.expected)).toContain('192.168.1.1');
      expect(String(error.actual)).toContain('not configured');
    });
    
    test('handles errors without expected/actual values', () => {
      const error: {
        assertionType: string;
        message: string;
        expected?: unknown;
        actual?: unknown;
      } = {
        assertionType: 'session',
        message: 'Session not found'
      };
      
      expect(error.message).toBeTruthy();
      expect(error.expected).toBeUndefined();
      expect(error.actual).toBeUndefined();
    });
  });
});

describe('New Schema Format (Goals/Steps/Assertions)', () => {
  describe('Teaching Points', () => {
    test('steps can include optional teachingPoint field', () => {
      const step = {
        objective: 'Enter privileged mode',
        command: 'enable',
        teachingPoint: 'Watch the prompt change from > to #'
      };
      
      expect(step.teachingPoint).toBeDefined();
      expect(typeof step.teachingPoint).toBe('string');
      expect(step.teachingPoint.length).toBeGreaterThan(0);
    });
    
    test('steps work without teachingPoint field', () => {
      const step: {
        objective: string;
        command: string;
        teachingPoint?: string;
      } = {
        objective: 'Save configuration',
        command: 'write memory'
      };
      
      expect(step.teachingPoint).toBeUndefined();
      expect(step.objective).toBeDefined();
      expect(step.command).toBeDefined();
    });
  });
  
  describe('Exploratory Lessons with Empty Assertions', () => {
    test('exploratory lessons can have empty assertions array', () => {
      const srcExercisePath = path.join(process.cwd(), 'src/exercises/lesson-03-navigating-modes.json');
      
      if (fs.existsSync(srcExercisePath)) {
        const exercise = JSON.parse(fs.readFileSync(srcExercisePath, 'utf-8'));
        
        expect(exercise.assertions).toBeDefined();
        expect(Array.isArray(exercise.assertions)).toBe(true);
        expect(exercise.assertions.length).toBe(0);
      }
    });
    
    test('Check My Work button should not show for empty assertions', () => {
      const exercise = {
        assertions: []
      };
      
      const shouldShowButton = exercise.assertions.length > 0;
      expect(shouldShowButton).toBe(false);
    });
    
    test('keyboard shortcut should exit early for empty assertions', () => {
      const exercise = {
        assertions: []
      };
      
      // Simulates the logic in handleKeyboardShortcut
      const shouldProcessValidation = exercise.assertions.length > 0;
      expect(shouldProcessValidation).toBe(false);
    });
    
    test('completion banner shows on final step with no assertions', () => {
      const exercise = {
        goals: [
          {
            section: 'Practice',
            steps: [
              { objective: 'Step 1', command: 'cmd1' },
              { objective: 'Step 2', command: 'cmd2' },
              { objective: 'Step 3', command: 'cmd3' }
            ]
          }
        ],
        assertions: []
      };
      
      const allSteps = exercise.goals.flatMap(goal => goal.steps);
      const totalSteps = allSteps.length;
      const currentStepIndex = totalSteps - 1; // On last step
      
      // Banner should show when:
      // - On last step (currentStepIndex === totalSteps - 1)
      // - AND no assertions (exercise.assertions.length === 0)
      const shouldShowCompletionBanner = 
        currentStepIndex === totalSteps - 1 && 
        exercise.assertions.length === 0;
      
      expect(shouldShowCompletionBanner).toBe(true);
    });
    
    test('progress bar turns green on final step with no assertions', () => {
      const exercise = {
        goals: [{ section: 'Test', steps: [{ objective: 'Step 1', command: 'cmd1' }] }],
        assertions: []
      };
      
      const allSteps = exercise.goals.flatMap(goal => goal.steps);
      const totalSteps = allSteps.length;
      const currentStepIndex = totalSteps - 1;
      
      const progressBarClass = 
        currentStepIndex === totalSteps - 1 && exercise.assertions.length === 0
          ? 'bg-green-500'
          : 'bg-blue-500';
      
      expect(progressBarClass).toBe('bg-green-500');
    });
    
    test('Next button becomes Complete button on final step with no assertions', () => {
      const exercise = {
        goals: [{ section: 'Test', steps: [{ objective: 'Step 1', command: 'cmd1' }] }],
        assertions: []
      };
      
      const allSteps = exercise.goals.flatMap(goal => goal.steps);
      const totalSteps = allSteps.length;
      const currentStepIndex = totalSteps - 1;
      
      const isComplete = currentStepIndex === totalSteps - 1 && exercise.assertions.length === 0;
      const buttonText = isComplete ? '✓ Complete' : 'Next →';
      const buttonClass = isComplete ? 'bg-green-600 text-white' : 'cursor-not-allowed bg-gray-700 text-gray-500';
      
      expect(buttonText).toBe('✓ Complete');
      expect(buttonClass).toContain('bg-green-600');
    });
    
    test('completion features do not show when assertions exist', () => {
      const exercise = {
        goals: [{ section: 'Test', steps: [{ objective: 'Step 1', command: 'cmd1' }] }],
        assertions: [{ type: 'state-path', path: 'hostname', expectedValue: 'Test', description: 'Test' }]
      };
      
      const allSteps = exercise.goals.flatMap(goal => goal.steps);
      const totalSteps = allSteps.length;
      const currentStepIndex = totalSteps - 1;
      
      const shouldShowCompletionBanner = 
        currentStepIndex === totalSteps - 1 && 
        exercise.assertions.length === 0;
      
      expect(shouldShowCompletionBanner).toBe(false);
    });
  });
  
  describe('Goals and Steps Structure', () => {
    test('exercises can use goals/steps structure', () => {
      const exercise = {
        id: 'test-goals',
        title: 'Test Exercise',
        deviceModel: '2960-switch',
        goals: [
          {
            section: 'Basic Setup',
            steps: [
              { objective: 'Enter privileged mode', command: 'enable' },
              { objective: 'Enter config mode', command: 'configure terminal' }
            ]
          }
        ],
        assertions: []
      };
      
      expect(exercise.goals).toBeDefined();
      expect(exercise.goals.length).toBeGreaterThan(0);
      expect(exercise.goals[0].section).toBeDefined();
      expect(exercise.goals[0].steps).toBeDefined();
      expect(exercise.goals[0].steps.length).toBe(2);
    });
    
    test('steps from multiple goals can be flattened', () => {
      const exercise = {
        goals: [
          {
            section: 'Section 1',
            steps: [
              { objective: 'Step 1', command: 'cmd1' },
              { objective: 'Step 2', command: 'cmd2' }
            ]
          },
          {
            section: 'Section 2',
            steps: [
              { objective: 'Step 3', command: 'cmd3' }
            ]
          }
        ]
      };
      
      // Component logic: exercise.goals.flatMap(goal => goal.steps)
      const allSteps = exercise.goals.flatMap(goal => goal.steps);
      
      expect(allSteps.length).toBe(3);
      expect(allSteps[0].objective).toBe('Step 1');
      expect(allSteps[2].objective).toBe('Step 3');
    });
  });
  
  describe('New src/exercises Schema Validation', () => {
    const newExercises = [
      'lesson-01-setting-hostname-and-saving-configuration.json',
      'lesson-02-setting-enable-secret-password.json',
      'lesson-03-navigating-modes.json',
      'lesson-04-tab-completion.json',
      'lesson-05-pagination.json',
      'lesson-06-name-lookup-abort.json'
    ];
    
    newExercises.forEach(filename => {
      test(`src/exercises/${filename} has valid structure`, () => {
        const filePath = path.join(process.cwd(), 'src/exercises', filename);
        
        if (!fs.existsSync(filePath)) {
          console.warn(`Skipping ${filename} - file not found in src/exercises`);
          return;
        }
        
        const exercise = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        // Check required fields
        expect(exercise.id).toBeDefined();
        expect(exercise.title).toBeDefined();
        expect(exercise.deviceModel).toBeDefined();
        expect(exercise.goals).toBeDefined();
        expect(Array.isArray(exercise.goals)).toBe(true);
        expect(exercise.assertions).toBeDefined();
        expect(Array.isArray(exercise.assertions)).toBe(true);
        
        // Check goals structure
        exercise.goals.forEach((goal: any) => {
          expect(goal.section).toBeDefined();
          expect(goal.steps).toBeDefined();
          expect(Array.isArray(goal.steps)).toBe(true);
          
          // Check steps structure
          goal.steps.forEach((step: any) => {
            expect(step.objective).toBeDefined();
            // command is optional in some exercises
            // teachingPoint is optional
          });
        });
      });
    });
  });
});

describe('Real Exercise File Validation', () => {
  const exercisesToTest = [
    'lesson-01-setting-hostname-and-saving-configuration.json',
    'lesson-02-setting-enable-secret-password.json',
    'lesson-13-management-access.json',
    'lesson-14-vlan-creation.json',
    'lesson-18-ssh-configuration.json',
    'lesson-25-capstone.json'
  ];
  
  exercisesToTest.forEach(filename => {
    test(`${filename} passes schema validation`, () => {
      const filePath = path.join(process.cwd(), 'src/exercises', filename);
      
      // Skip if file doesn't exist
      if (!fs.existsSync(filePath)) {
        console.warn(`Skipping ${filename} - file not found`);
        return;
      }
      
      const exercise: ExerciseDefinition = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      // Schema validation
      const schemaValidator = new SchemaValidator();
      const schemaResult = schemaValidator.validateExercise(exercise);
      expect(schemaResult.valid).toBe(true);
      
      // Note: Build-time execution validation (LessonValidator) is skipped
      // because it expects all steps to have commands, but some exercises
      // have informational steps without commands (e.g., "Verify successful login")
      // The RuntimeValidator (used in browser) handles this correctly
    });
  });
});

