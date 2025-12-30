import { RuntimeValidator } from '../validation/RuntimeValidator';
import { BuildValidator } from '../validation/BuildValidator';
import { Exercise } from '../validation/types';
import { createInitialState } from '../cli/state';
import * as fs from 'fs';
import * as path from 'path';

describe('RuntimeValidator', () => {
  let validator: RuntimeValidator;
  
  beforeEach(() => {
    validator = new RuntimeValidator();
  });
  
  test('should fail if config not saved', () => {
    const exercise: Exercise = {
      id: 'test-01',
      title: 'Test Exercise',
      deviceModel: '2960-switch',
      goals: [],
      assertions: [
        {
          type: 'config-saved',
          description: 'Configuration must be saved',
          diagnosticCommand: 'show running-config'
        }
      ]
    };
    
    const deviceState = createInitialState('2960-switch');
    deviceState.configSaved = false;
    
    const result = validator.validate(exercise, deviceState);
    
    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain('not been saved');
  });
  
  test('should fail if there are unsaved changes', () => {
    const exercise: Exercise = {
      id: 'test-unsaved',
      title: 'Test Unsaved Changes',
      deviceModel: '2960-switch',
      goals: [],
      assertions: [
        {
          type: 'config-saved',
          description: 'Configuration must be saved',
          diagnosticCommand: 'show running-config'
        }
      ]
    };
    
    const deviceState = createInitialState('2960-switch');
    deviceState.hostname = 'NewSwitch';
    deviceState.configSaved = true;
    
    // Create saved state with old hostname
    const savedState = createInitialState('2960-switch');
    savedState.hostname = 'Switch';
    deviceState.savedState = savedState;
    
    const result = validator.validate(exercise, deviceState);
    
    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain('unsaved changes');
    expect(result.errors[0].message).toContain('hostname');
  });
  
  test('should pass if config is saved and no unsaved changes', () => {
    const exercise: Exercise = {
      id: 'test-saved',
      title: 'Test Saved Config',
      deviceModel: '2960-switch',
      goals: [],
      assertions: [
        {
          type: 'config-saved',
          description: 'Configuration must be saved',
          diagnosticCommand: 'show running-config'
        }
      ]
    };
    
    const deviceState = createInitialState('2960-switch');
    deviceState.hostname = 'MySwitch';
    deviceState.configSaved = true;
    
    // Create saved state that matches current state
    const savedState = createInitialState('2960-switch');
    savedState.hostname = 'MySwitch';
    deviceState.savedState = savedState;
    
    const result = validator.validate(exercise, deviceState);
    
    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
  
  test('should detect multiple types of unsaved changes', () => {
    const exercise: Exercise = {
      id: 'test-multiple-unsaved',
      title: 'Test Multiple Unsaved Changes',
      deviceModel: '2960-switch',
      goals: [],
      assertions: [
        {
          type: 'config-saved',
          description: 'Configuration must be saved',
          diagnosticCommand: 'show running-config'
        }
      ]
    };
    
    const deviceState = createInitialState('2960-switch');
    deviceState.hostname = 'NewSwitch';
    deviceState.enableSecret = 'newpassword';
    deviceState.vlans['100'] = { name: 'NewVLAN' };
    deviceState.configSaved = true;
    
    // Create saved state with old values
    const savedState = createInitialState('2960-switch');
    savedState.hostname = 'OldSwitch';
    savedState.enableSecret = 'oldpassword';
    savedState.vlans = {};
    deviceState.savedState = savedState;
    
    const result = validator.validate(exercise, deviceState);
    
    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain('unsaved changes');
    expect(result.errors[0].message).toContain('hostname');
    expect(result.errors[0].message).toContain('enable secret');
    expect(result.errors[0].message).toContain('VLANs');
  });
  
  test('should validate hostname correctly', () => {
    const exercise: Exercise = {
      id: 'test-02',
      title: 'Test Hostname',
      deviceModel: '2960-switch',
      goals: [],
      assertions: [
        {
          type: 'config-saved',
          description: 'Configuration must be saved',
          diagnosticCommand: 'show running-config'
        },
        {
          type: 'state-path',
          path: 'hostname',
          expectedValue: 'TestSwitch',
          description: 'Hostname should be TestSwitch',
          diagnosticCommand: 'show running-config'
        }
      ]
    };
    
    const deviceState = createInitialState('2960-switch');
    deviceState.hostname = 'TestSwitch';
    deviceState.configSaved = true;
    deviceState.savedState = { ...deviceState };
    
    const result = validator.validate(exercise, deviceState);
    
    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
  
  test('should fail if hostname is wrong', () => {
    const exercise: Exercise = {
      id: 'test-03',
      title: 'Test Wrong Hostname',
      deviceModel: '2960-switch',
      goals: [],
      assertions: [
        {
          type: 'config-saved',
          description: 'Configuration must be saved',
          diagnosticCommand: 'show running-config'
        },
        {
          type: 'state-path',
          path: 'hostname',
          expectedValue: 'ExpectedName',
          description: 'Hostname should be ExpectedName',
          diagnosticCommand: 'show running-config'
        }
      ]
    };
    
    const deviceState = createInitialState('2960-switch');
    deviceState.hostname = 'WrongName';
    deviceState.configSaved = true;
    deviceState.savedState = { ...deviceState };
    
    const result = validator.validate(exercise, deviceState);
    
    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain('ExpectedName');
  });
  
  test('should validate VLAN exists', () => {
    const exercise: Exercise = {
      id: 'test-04',
      title: 'Test VLAN',
      deviceModel: '2960-switch',
      goals: [],
      assertions: [
        {
          type: 'config-saved',
          description: 'Configuration must be saved',
          diagnosticCommand: 'show running-config'
        },
        {
          type: 'vlan-exists',
          expectedValue: { vlanId: '100', name: 'Students' },
          description: 'VLAN 100 should exist',
          diagnosticCommand: 'show vlan brief'
        }
      ]
    };
    
    const deviceState = createInitialState('2960-switch');
    deviceState.vlans['100'] = { name: 'Students' };
    deviceState.configSaved = true;
    deviceState.savedState = { ...deviceState };
    
    const result = validator.validate(exercise, deviceState);
    
    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
  
  test('should validate interface configuration', () => {
    const exercise: Exercise = {
      id: 'test-05',
      title: 'Test Interface',
      deviceModel: '2960-switch',
      goals: [],
      assertions: [
        {
          type: 'config-saved',
          description: 'Configuration must be saved',
          diagnosticCommand: 'show running-config'
        },
        {
          type: 'state-path',
          path: 'interfaces.vlan1.ip',
          expectedValue: '192.168.1.10',
          description: 'VLAN 1 should have IP 192.168.1.10',
          diagnosticCommand: 'show ip interface brief'
        },
        {
          type: 'state-path',
          path: 'interfaces.vlan1.adminUp',
          expectedValue: true,
          description: 'VLAN 1 should be enabled',
          diagnosticCommand: 'show ip interface brief'
        }
      ]
    };
    
    const deviceState = createInitialState('2960-switch');
    deviceState.interfaces.vlan1.ip = '192.168.1.10';
    deviceState.interfaces.vlan1.mask = '255.255.255.0';
    deviceState.interfaces.vlan1.adminUp = true;
    deviceState.configSaved = true;
    deviceState.savedState = { ...deviceState };
    
    const result = validator.validate(exercise, deviceState);
    
    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

describe('BuildValidator', () => {
  let validator: BuildValidator;
  
  beforeEach(() => {
    validator = new BuildValidator();
  });
  
  test('should validate lesson-01 exercise file', async () => {
    const exercisePath = path.join(__dirname, '../exercises/lesson-01-setting-hostname-and-saving-configuration.json');
    
    const result = await validator.validateExercise(exercisePath);
    
    expect(result.success).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.commandsExecuted).toBeGreaterThan(0);
  });
  
  test('should catch invalid interface names', async () => {
    // Create a test exercise with invalid interface for 2960-switch
    const testExercise: Exercise = {
      id: 'test-invalid-interface',
      title: 'Test Invalid Interface',
      deviceModel: '2960-switch',
      goals: [
        {
          section: 'Test',
          steps: [
            { objective: 'Enter privileged mode', command: 'enable' },
            { objective: 'Enter config mode', command: 'configure terminal' },
            { objective: 'Configure invalid interface', command: 'interface g1/0/1' } // Invalid for 2960!
          ]
        }
      ],
      assertions: [
        {
          type: 'config-saved',
          description: 'Config saved',
          diagnosticCommand: 'show running-config'
        }
      ]
    };
    
    // Write temporary test file
    const testPath = path.join(__dirname, '../exercises/test-invalid.json');
    fs.writeFileSync(testPath, JSON.stringify(testExercise, null, 2));
    
    try {
      const result = await validator.validateExercise(testPath);
      
      expect(result.success).toBe(false);
      expect(result.executionErrors).toBeDefined();
      expect(result.executionErrors!.length).toBeGreaterThan(0);
    } finally {
      // Clean up test file
      fs.unlinkSync(testPath);
    }
  });
});

