import { SchemaValidator } from '../validation/schema-validator';

describe('SchemaValidator', () => {
  let validator: SchemaValidator;
  
  beforeEach(() => {
    validator = new SchemaValidator();
  });
  
  describe('Valid exercises', () => {
    test('validates minimal valid exercise', () => {
      const exercise = {
        id: 'test-exercise',
        deviceModel: '2960-switch',
        commands: ['enable'],
        validation: {
          type: 'exploratory',
          assertions: []
        }
      };
      
      const result = validator.validateExercise(exercise);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    test('validates exercise with goal-based validation', () => {
      const exercise = {
        id: 'hostname-test',
        deviceModel: '2960-switch',
        description: 'Test hostname configuration',
        commands: [
          'enable',
          'configure terminal',
          'hostname TestSwitch'
        ],
        validation: {
          type: 'goal-based',
          assertions: [
            {
              type: 'hostname',
              expected: 'TestSwitch',
              message: 'Hostname should be TestSwitch'
            }
          ]
        }
      };
      
      const result = validator.validateExercise(exercise);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    test('validates exercise with interface assertions', () => {
      const exercise = {
        id: 'interface-test',
        deviceModel: '2960-switch',
        commands: [
          'enable',
          'configure terminal',
          'interface g0/1',
          'ip address 192.168.1.1 255.255.255.0'
        ],
        validation: {
          type: 'goal-based',
          assertions: [
            {
              type: 'interface_ip',
              interface: 'g0/1',
              ip: '192.168.1.1',
              mask: '255.255.255.0',
              message: 'Interface should have IP'
            }
          ]
        }
      };
      
      const result = validator.validateExercise(exercise);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    test('validates 1941-router device model', () => {
      const exercise = {
        id: 'router-test',
        deviceModel: '1941-router',
        commands: ['enable'],
        validation: {
          type: 'exploratory',
          assertions: []
        }
      };
      
      const result = validator.validateExercise(exercise);
      expect(result.valid).toBe(true);
    });
  });
  
  describe('Invalid exercises', () => {
    test('rejects missing required field: id', () => {
      const exercise = {
        deviceModel: '2960-switch',
        commands: ['enable'],
        validation: {
          type: 'exploratory',
          assertions: []
        }
      };
      
      const result = validator.validateExercise(exercise);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('id'))).toBe(true);
    });
    
    test('rejects missing required field: deviceModel', () => {
      const exercise = {
        id: 'test',
        commands: ['enable'],
        validation: {
          type: 'exploratory',
          assertions: []
        }
      };
      
      const result = validator.validateExercise(exercise);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('deviceModel'))).toBe(true);
    });
    
    test('rejects missing required field: commands', () => {
      const exercise = {
        id: 'test',
        deviceModel: '2960-switch',
        validation: {
          type: 'exploratory',
          assertions: []
        }
      };
      
      const result = validator.validateExercise(exercise);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('commands'))).toBe(true);
    });
    
    test('rejects missing required field: validation', () => {
      const exercise = {
        id: 'test',
        deviceModel: '2960-switch',
        commands: ['enable']
      };
      
      const result = validator.validateExercise(exercise);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('validation'))).toBe(true);
    });
    
    test('rejects invalid id format (uppercase)', () => {
      const exercise = {
        id: 'TestExercise',
        deviceModel: '2960-switch',
        commands: ['enable'],
        validation: {
          type: 'exploratory',
          assertions: []
        }
      };
      
      const result = validator.validateExercise(exercise);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('pattern'))).toBe(true);
    });
    
    test('rejects invalid id format (spaces)', () => {
      const exercise = {
        id: 'test exercise',
        deviceModel: '2960-switch',
        commands: ['enable'],
        validation: {
          type: 'exploratory',
          assertions: []
        }
      };
      
      const result = validator.validateExercise(exercise);
      expect(result.valid).toBe(false);
    });
    
    test('rejects invalid deviceModel', () => {
      const exercise = {
        id: 'test',
        deviceModel: 'unknown-device',
        commands: ['enable'],
        validation: {
          type: 'exploratory',
          assertions: []
        }
      };
      
      const result = validator.validateExercise(exercise);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('enum') || e.includes('2960-switch'))).toBe(true);
    });
    
    test('rejects empty commands array', () => {
      const exercise = {
        id: 'test',
        deviceModel: '2960-switch',
        commands: [],
        validation: {
          type: 'exploratory',
          assertions: []
        }
      };
      
      const result = validator.validateExercise(exercise);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('commands') || e.includes('minItems') || e.includes('NOT have fewer'))).toBe(true);
    });
    
    test('rejects invalid validation type', () => {
      const exercise = {
        id: 'test',
        deviceModel: '2960-switch',
        commands: ['enable'],
        validation: {
          type: 'invalid-type',
          assertions: []
        }
      };
      
      const result = validator.validateExercise(exercise);
      expect(result.valid).toBe(false);
    });
    
    test('rejects assertion without message', () => {
      const exercise = {
        id: 'test',
        deviceModel: '2960-switch',
        commands: ['enable'],
        validation: {
          type: 'goal-based',
          assertions: [
            {
              type: 'hostname',
              expected: 'Test'
            }
          ]
        }
      };
      
      const result = validator.validateExercise(exercise);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('message'))).toBe(true);
    });
    
    test('rejects invalid assertion type', () => {
      const exercise = {
        id: 'test',
        deviceModel: '2960-switch',
        commands: ['enable'],
        validation: {
          type: 'goal-based',
          assertions: [
            {
              type: 'invalid_assertion',
              message: 'Test'
            }
          ]
        }
      };
      
      const result = validator.validateExercise(exercise);
      expect(result.valid).toBe(false);
    });
  });
});

