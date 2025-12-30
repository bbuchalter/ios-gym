import { SchemaValidator } from '../validation/schema-validator';

describe('SchemaValidator', () => {
  let validator: SchemaValidator;
  
  beforeEach(() => {
    validator = new SchemaValidator();
  });
  
  describe('Valid exercises', () => {
    test('validates minimal valid exercise', () => {
      const exercise = {
        id: 'lesson-99-test-exercise',
        title: 'Test Exercise',
        deviceModel: '2960-switch',
        goals: [{
          section: 'Test Section',
          steps: [{
            objective: 'Enter privileged mode',
            command: 'enable'
          }]
        }],
        assertions: []
      };
      
      const result = validator.validateExercise(exercise);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    test('validates exercise with assertions', () => {
      const exercise = {
        id: 'lesson-99-hostname-test',
        title: 'Hostname Test',
        deviceModel: '2960-switch',
        goals: [{
          section: 'Configure Hostname',
          steps: [
            { objective: 'Enter privileged mode', command: 'enable' },
            { objective: 'Enter config mode', command: 'configure terminal' },
            { objective: 'Set hostname', command: 'hostname TestSwitch' }
          ]
        }],
        assertions: [
          {
            type: 'state-path',
            path: 'hostname',
            expectedValue: 'TestSwitch',
            description: 'Hostname should be TestSwitch',
            diagnosticCommand: 'show running-config'
          }
        ]
      };
      
      const result = validator.validateExercise(exercise);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    test('validates exercise with teaching points', () => {
      const exercise = {
        id: 'lesson-99-interface-test',
        title: 'Interface Test',
        deviceModel: '2960-switch',
        goals: [{
          section: 'Configure Interface',
          steps: [
            { 
              objective: 'Enter privileged mode', 
              command: 'enable',
              teachingPoint: 'This is a teaching point'
            }
          ]
        }],
        assertions: []
      };
      
      const result = validator.validateExercise(exercise);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    test('validates 1941-router device model', () => {
      const exercise = {
        id: 'lesson-99-router-test',
        title: 'Router Test',
        deviceModel: '1941-router',
        goals: [{
          section: 'Test',
          steps: [{ objective: 'Enter privileged mode', command: 'enable' }]
        }],
        assertions: []
      };
      
      const result = validator.validateExercise(exercise);
      expect(result.valid).toBe(true);
    });
  });
  
  describe('Invalid exercises', () => {
    test('rejects missing required field: id', () => {
      const exercise = {
        title: 'Test',
        deviceModel: '2960-switch',
        goals: [{ section: 'Test', steps: [{ objective: 'Test', command: 'enable' }] }],
        assertions: []
      };
      
      const result = validator.validateExercise(exercise);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('id'))).toBe(true);
    });
    
    test('rejects missing required field: deviceModel', () => {
      const exercise = {
        id: 'lesson-99-test',
        title: 'Test',
        goals: [{ section: 'Test', steps: [{ objective: 'Test', command: 'enable' }] }],
        assertions: []
      };
      
      const result = validator.validateExercise(exercise);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('deviceModel'))).toBe(true);
    });
    
    test('rejects missing required field: goals', () => {
      const exercise = {
        id: 'lesson-99-test',
        title: 'Test',
        deviceModel: '2960-switch',
        assertions: []
      };
      
      const result = validator.validateExercise(exercise);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('goals'))).toBe(true);
    });
    
    test('rejects missing required field: assertions', () => {
      const exercise = {
        id: 'lesson-99-test',
        title: 'Test',
        deviceModel: '2960-switch',
        goals: [{ section: 'Test', steps: [{ objective: 'Test', command: 'enable' }] }]
      };
      
      const result = validator.validateExercise(exercise);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('assertions'))).toBe(true);
    });
    
    test('rejects invalid id format (uppercase)', () => {
      const exercise = {
        id: 'TestExercise',
        title: 'Test',
        deviceModel: '2960-switch',
        goals: [{ section: 'Test', steps: [{ objective: 'Test', command: 'enable' }] }],
        assertions: []
      };
      
      const result = validator.validateExercise(exercise);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('pattern'))).toBe(true);
    });
    
    test('rejects invalid id format (spaces)', () => {
      const exercise = {
        id: 'test exercise',
        title: 'Test',
        deviceModel: '2960-switch',
        goals: [{ section: 'Test', steps: [{ objective: 'Test', command: 'enable' }] }],
        assertions: []
      };
      
      const result = validator.validateExercise(exercise);
      expect(result.valid).toBe(false);
    });
    
    test('rejects invalid deviceModel', () => {
      const exercise = {
        id: 'lesson-99-test',
        title: 'Test',
        deviceModel: 'unknown-device',
        goals: [{ section: 'Test', steps: [{ objective: 'Test', command: 'enable' }] }],
        assertions: []
      };
      
      const result = validator.validateExercise(exercise);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('enum') || e.includes('2960-switch'))).toBe(true);
    });
    
    test('rejects empty goals array', () => {
      const exercise = {
        id: 'lesson-99-test',
        title: 'Test',
        deviceModel: '2960-switch',
        goals: [],
        assertions: []
      };
      
      const result = validator.validateExercise(exercise);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('goals') || e.includes('minItems') || e.includes('NOT have fewer'))).toBe(true);
    });
    
    test('rejects assertion without description', () => {
      const exercise = {
        id: 'lesson-99-test',
        title: 'Test',
        deviceModel: '2960-switch',
        goals: [{ section: 'Test', steps: [{ objective: 'Test', command: 'enable' }] }],
        assertions: [
          {
            type: 'state-path',
            path: 'hostname',
            expectedValue: 'Test'
          }
        ]
      };
      
      const result = validator.validateExercise(exercise);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('description'))).toBe(true);
    });
    
    test('rejects invalid assertion type', () => {
      const exercise = {
        id: 'lesson-99-test',
        title: 'Test',
        deviceModel: '2960-switch',
        goals: [{ section: 'Test', steps: [{ objective: 'Test', command: 'enable' }] }],
        assertions: [
          {
            type: 'invalid-assertion-type',
            description: 'Test'
          }
        ]
      };
      
      const result = validator.validateExercise(exercise);
      expect(result.valid).toBe(false);
    });
  });
});

