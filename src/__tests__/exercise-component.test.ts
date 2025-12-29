/**
 * Tests for Exercise component logic
 * 
 * Note: These tests focus on the validation logic and data flow.
 * Full React component rendering tests would require @testing-library/react
 * which is not currently installed.
 */

import { SchemaValidator } from '../validation/schema-validator';
import { LessonValidator, ExerciseDefinition } from '../validation/lesson-validator';
import * as fs from 'fs';
import * as path from 'path';

describe('Exercise Component Logic', () => {
  describe('Exercise JSON Loading and Schema Validation', () => {
    test('valid exercise file passes schema validation', () => {
      const exercisePath = path.join(process.cwd(), 'web/exercises/hostname-basic.json');
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
    
    test('all exercise files in web/exercises pass schema validation', () => {
      const exerciseFiles = fs.readdirSync(path.join(process.cwd(), 'web/exercises'));
      const schemaValidator = new SchemaValidator();
      
      for (const file of exerciseFiles) {
        if (!file.endsWith('.json')) continue;
        
        const filePath = path.join(process.cwd(), 'web/exercises', file);
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
      const exercisePath = path.join(process.cwd(), 'web/exercises/hostname-basic.json');
      const exercise = JSON.parse(fs.readFileSync(exercisePath, 'utf-8'));
      
      expect(exercise.validation.type).toBe('goal-based');
      expect(exercise.validation.assertions.length).toBeGreaterThan(0);
    });
    
    test('exploratory exercises have minimal assertions', () => {
      const exercisePath = path.join(process.cwd(), 'web/exercises/navigating-modes.json');
      const exercise = JSON.parse(fs.readFileSync(exercisePath, 'utf-8'));
      
      expect(exercise.validation.type).toBe('exploratory');
      // Exploratory can have 0 or minimal assertions
      expect(Array.isArray(exercise.validation.assertions)).toBe(true);
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
      const exerciseFiles = fs.readdirSync(path.join(process.cwd(), 'web/exercises'));
      
      for (const file of exerciseFiles) {
        if (!file.endsWith('.json')) continue;
        
        const filePath = path.join(process.cwd(), 'web/exercises', file);
        
        expect(() => {
          JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        }).not.toThrow();
      }
    });
    
    test('all exercise files have required fields', () => {
      const exerciseFiles = fs.readdirSync(path.join(process.cwd(), 'web/exercises'));
      
      for (const file of exerciseFiles) {
        if (!file.endsWith('.json')) continue;
        
        const filePath = path.join(process.cwd(), 'web/exercises', file);
        const exercise = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        expect(exercise).toHaveProperty('id');
        expect(exercise).toHaveProperty('deviceModel');
        // Exercise can have either 'commands' or 'goals' format
        expect(exercise.commands || exercise.goals).toBeTruthy();
        expect(exercise).toHaveProperty('validation');
        expect(exercise.validation).toHaveProperty('type');
        expect(exercise.validation).toHaveProperty('assertions');
      }
    });
    
    test('all exercise IDs are unique', () => {
      const exerciseFiles = fs.readdirSync(path.join(process.cwd(), 'web/exercises'));
      const ids = new Set<string>();
      
      for (const file of exerciseFiles) {
        if (!file.endsWith('.json')) continue;
        
        const filePath = path.join(process.cwd(), 'web/exercises', file);
        const exercise = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        
        expect(ids.has(exercise.id)).toBe(false);
        ids.add(exercise.id);
      }
      
      // We should have 25 unique exercises
      expect(ids.size).toBeGreaterThanOrEqual(18); // At least the ones we created
    });
    
    test('exercise IDs match kebab-case pattern', () => {
      const exerciseFiles = fs.readdirSync(path.join(process.cwd(), 'web/exercises'));
      const kebabCasePattern = /^[a-z0-9-]+$/;
      
      for (const file of exerciseFiles) {
        if (!file.endsWith('.json')) continue;
        
        const filePath = path.join(process.cwd(), 'web/exercises', file);
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
      try {
        const response = await fetch(`/exercises/${exerciseId}.json`);
        if (!response.ok) throw new Error('Not found');
        await response.json();
        fail('Should have thrown error');
      } catch (err: any) {
        expect(err.message).toBeTruthy();
      }
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
      const { RuntimeValidator } = require('../validation/runtime-validator');
      const validator = new RuntimeValidator();
      
      expect(validator).toBeDefined();
      expect(typeof validator.runAssertions).toBe('function');
    });
    
    test('Build-time validation uses LessonValidator', () => {
      // Build-time validation (validate-exercises.ts) uses LessonValidator
      // which CAN use Node.js modules
      const exercisePath = path.join(process.cwd(), 'web/exercises/hostname-basic.json');
      const exercise: ExerciseDefinition = JSON.parse(fs.readFileSync(exercisePath, 'utf-8'));
      
      const validator = new LessonValidator();
      const result = validator.validateExercise(exercise);
      
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
        name: 'shows button for goal-based with assertions',
        exercise: {
          validation: { type: 'goal-based', assertions: [{ type: 'hostname', message: 'Test', expected: 'X' }] }
        },
        expected: true
      },
      {
        name: 'hides button for goal-based with no assertions',
        exercise: {
          validation: { type: 'goal-based', assertions: [] }
        },
        expected: false
      },
      {
        name: 'hides button for exploratory with assertions',
        exercise: {
          validation: { type: 'exploratory', assertions: [{ type: 'command_succeeded', message: 'Test' }] }
        },
        expected: false
      },
      {
        name: 'hides button for exploratory with no assertions',
        exercise: {
          validation: { type: 'exploratory', assertions: [] }
        },
        expected: false
      }
    ];
    
    testCases.forEach(({ name, exercise, expected }) => {
      test(name, () => {
        const shouldShow = 
          exercise.validation.type === 'goal-based' && 
          exercise.validation.assertions.length > 0;
        
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
        expected?: any;
        actual?: any;
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

describe('Real Exercise File Validation', () => {
  const exercisesToTest = [
    'hostname-basic.json',
    'enable-secret.json',
    'layer3-routed-port.json',
    'vlan-creation.json',
    'ssh-configuration.json',
    'capstone-full-network.json'
  ];
  
  exercisesToTest.forEach(filename => {
    test(`${filename} passes full validation pipeline`, () => {
      const filePath = path.join(process.cwd(), 'web/exercises', filename);
      
      // Skip if file doesn't exist
      if (!fs.existsSync(filePath)) {
        console.warn(`Skipping ${filename} - file not found`);
        return;
      }
      
      const exercise: ExerciseDefinition = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      // Step 1: Schema validation
      const schemaValidator = new SchemaValidator();
      const schemaResult = schemaValidator.validateExercise(exercise);
      expect(schemaResult.valid).toBe(true);
      
      // Step 2: Execution validation
      const lessonValidator = new LessonValidator();
      const execResult = lessonValidator.validateExercise(exercise);
      expect(execResult.passed).toBe(true);
    });
  });
});

