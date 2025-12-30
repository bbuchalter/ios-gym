import { LessonValidator, ExerciseDefinition } from '../validation/lesson-validator';
import { createInitialState } from '../cli/state';
import { ModeStack } from '../cli/modes';
import { loadGrammar } from '../grammar/loader';
import * as path from 'path';
import { ModeType } from '../types';

describe('LessonValidator - Assertion Types', () => {
  let validator: LessonValidator;
  
  beforeEach(() => {
    validator = new LessonValidator();
  });
  
  describe('hostname assertion', () => {
    test('passes when hostname matches', () => {
      const state = createInitialState('2960-switch');
      state.hostname = 'TestSwitch';
      
      const grammarPath = path.join(process.cwd(), 'grammar/commands-2960-switch.yaml');
      const grammar = loadGrammar(grammarPath);
      const modeStack = new ModeStack(grammar);
      
      const result = validator.runAssertions(state, modeStack, [
        { type: 'hostname', expected: 'TestSwitch', message: 'Hostname should be TestSwitch' }
      ], false);
      
      expect(result.passed).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
    
    test('fails when hostname does not match', () => {
      const state = createInitialState('2960-switch');
      state.hostname = 'Switch';
      
      const grammarPath = path.join(process.cwd(), 'grammar/commands-2960-switch.yaml');
      const grammar = loadGrammar(grammarPath);
      const modeStack = new ModeStack(grammar);
      
      const result = validator.runAssertions(state, modeStack, [
        { type: 'hostname', expected: 'TestSwitch', message: 'Hostname should be TestSwitch' }
      ], false);
      
      expect(result.passed).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].message).toBe('Hostname should be TestSwitch');
      expect(result.errors[0].expected).toBe('TestSwitch');
      expect(result.errors[0].actual).toBe('Switch');
    });
  });
  
  describe('enable_secret assertion', () => {
    test('passes when password is set', () => {
      const state = createInitialState('2960-switch');
      state.enableSecret = 'MyPassword';
      
      const grammarPath = path.join(process.cwd(), 'grammar/commands-2960-switch.yaml');
      const grammar = loadGrammar(grammarPath);
      const modeStack = new ModeStack(grammar);
      
      const result = validator.runAssertions(state, modeStack, [
        { type: 'enable_secret', message: 'Password should be set' }
      ], false);
      
      expect(result.passed).toBe(true);
    });
    
    test('fails when password is not set', () => {
      const state = createInitialState('2960-switch');
      state.enableSecret = null;
      
      const grammarPath = path.join(process.cwd(), 'grammar/commands-2960-switch.yaml');
      const grammar = loadGrammar(grammarPath);
      const modeStack = new ModeStack(grammar);
      
      const result = validator.runAssertions(state, modeStack, [
        { type: 'enable_secret', message: 'Password should be set' }
      ], false);
      
      expect(result.passed).toBe(false);
    });
  });
  
  describe('interface assertions', () => {
    test('interface_ip passes with correct IP and mask', () => {
      const state = createInitialState('2960-switch');
      state.interfaces['g0/1'] = {
        adminUp: true,
        l2mode: 'routed',
        ip: '192.168.1.1',
        mask: '255.255.255.0',
        accessVlan: null,
        trunkAllowed: null
      };
      
      const grammarPath = path.join(process.cwd(), 'grammar/commands-2960-switch.yaml');
      const grammar = loadGrammar(grammarPath);
      const modeStack = new ModeStack(grammar);
      
      const result = validator.runAssertions(state, modeStack, [
        {
          type: 'interface_ip',
          interface: 'g0/1',
          ip: '192.168.1.1',
          mask: '255.255.255.0',
          message: 'Interface should have IP 192.168.1.1/24'
        }
      ], false);
      
      expect(result.passed).toBe(true);
    });
    
    test('interface_ip fails with wrong IP', () => {
      const state = createInitialState('2960-switch');
      state.interfaces['g0/1'] = {
        adminUp: true,
        l2mode: 'routed',
        ip: '192.168.1.2',
        mask: '255.255.255.0',
        accessVlan: null,
        trunkAllowed: null
      };
      
      const grammarPath = path.join(process.cwd(), 'grammar/commands-2960-switch.yaml');
      const grammar = loadGrammar(grammarPath);
      const modeStack = new ModeStack(grammar);
      
      const result = validator.runAssertions(state, modeStack, [
        {
          type: 'interface_ip',
          interface: 'g0/1',
          ip: '192.168.1.1',
          mask: '255.255.255.0',
          message: 'Interface should have IP 192.168.1.1/24'
        }
      ], false);
      
      expect(result.passed).toBe(false);
      expect(result.errors[0].expected).toBe('192.168.1.1 255.255.255.0');
      expect(result.errors[0].actual).toBe('192.168.1.2 255.255.255.0');
    });
    
    test('interface_mode validates routed port', () => {
      const state = createInitialState('2960-switch');
      state.interfaces['g0/2'] = {
        adminUp: true,
        l2mode: 'routed',
        ip: null,
        mask: null,
        accessVlan: null,
        trunkAllowed: null
      };
      
      const grammarPath = path.join(process.cwd(), 'grammar/commands-2960-switch.yaml');
      const grammar = loadGrammar(grammarPath);
      const modeStack = new ModeStack(grammar);
      
      const result = validator.runAssertions(state, modeStack, [
        {
          type: 'interface_mode',
          interface: 'g0/2',
          expected: 'routed',
          message: 'Interface should be routed'
        }
      ], false);
      
      expect(result.passed).toBe(true);
    });
    
    test('interface_admin_up validates enabled interface', () => {
      const state = createInitialState('2960-switch');
      state.interfaces['g0/1'] = {
        adminUp: true,
        l2mode: null,
        ip: null,
        mask: null,
        accessVlan: null,
        trunkAllowed: null
      };
      
      const grammarPath = path.join(process.cwd(), 'grammar/commands-2960-switch.yaml');
      const grammar = loadGrammar(grammarPath);
      const modeStack = new ModeStack(grammar);
      
      const result = validator.runAssertions(state, modeStack, [
        {
          type: 'interface_admin_up',
          interface: 'g0/1',
          expected: true,
          message: 'Interface should be up'
        }
      ], false);
      
      expect(result.passed).toBe(true);
    });
  });
  
  describe('VLAN assertions', () => {
    test('vlan_exists passes when VLAN exists', () => {
      const state = createInitialState('2960-switch');
      state.vlans['100'] = { name: 'TestVLAN' };
      
      const grammarPath = path.join(process.cwd(), 'grammar/commands-2960-switch.yaml');
      const grammar = loadGrammar(grammarPath);
      const modeStack = new ModeStack(grammar);
      
      const result = validator.runAssertions(state, modeStack, [
        { type: 'vlan_exists', vlanId: '100', message: 'VLAN 100 should exist' }
      ], false);
      
      expect(result.passed).toBe(true);
    });
    
    test('vlan_name validates VLAN name', () => {
      const state = createInitialState('2960-switch');
      state.vlans['100'] = { name: 'Students' };
      
      const grammarPath = path.join(process.cwd(), 'grammar/commands-2960-switch.yaml');
      const grammar = loadGrammar(grammarPath);
      const modeStack = new ModeStack(grammar);
      
      const result = validator.runAssertions(state, modeStack, [
        {
          type: 'vlan_name',
          vlanId: '100',
          expected: 'Students',
          message: 'VLAN 100 should be named Students'
        }
      ], false);
      
      expect(result.passed).toBe(true);
    });
    
    test('interface_access_vlan validates VLAN assignment', () => {
      const state = createInitialState('2960-switch');
      state.interfaces['fa0/2'] = {
        adminUp: false,
        l2mode: 'access',
        ip: null,
        mask: null,
        accessVlan: '100',
        trunkAllowed: null
      };
      
      const grammarPath = path.join(process.cwd(), 'grammar/commands-2960-switch.yaml');
      const grammar = loadGrammar(grammarPath);
      const modeStack = new ModeStack(grammar);
      
      const result = validator.runAssertions(state, modeStack, [
        {
          type: 'interface_access_vlan',
          interface: 'fa0/2',
          vlanId: '100',
          message: 'Interface should be in VLAN 100'
        }
      ], false);
      
      expect(result.passed).toBe(true);
    });
    
    test('interface_trunk_allowed validates trunk VLAN list', () => {
      const state = createInitialState('2960-switch');
      state.interfaces['g0/1'] = {
        adminUp: false,
        l2mode: 'trunk',
        ip: null,
        mask: null,
        accessVlan: null,
        trunkAllowed: '1,100,200'
      };
      
      const grammarPath = path.join(process.cwd(), 'grammar/commands-2960-switch.yaml');
      const grammar = loadGrammar(grammarPath);
      const modeStack = new ModeStack(grammar);
      
      const result = validator.runAssertions(state, modeStack, [
        {
          type: 'interface_trunk_allowed',
          interface: 'g0/1',
          expected: '1,100,200',
          message: 'Trunk should allow VLANs 1,100,200'
        }
      ], false);
      
      expect(result.passed).toBe(true);
    });
  });
  
  describe('OSPF assertions', () => {
    test('ospf_network validates network statement', () => {
      const state = createInitialState('2960-switch');
      state.ospf.processId = 1;
      state.ospf.networks = [
        { ip: '192.168.1.0', wildcard: '0.0.0.255', area: 0 }
      ];
      
      const grammarPath = path.join(process.cwd(), 'grammar/commands-2960-switch.yaml');
      const grammar = loadGrammar(grammarPath);
      const modeStack = new ModeStack(grammar);
      
      const result = validator.runAssertions(state, modeStack, [
        {
          type: 'ospf_network',
          ip: '192.168.1.0',
          wildcard: '0.0.0.255',
          area: 0,
          message: 'OSPF should advertise network'
        }
      ], false);
      
      expect(result.passed).toBe(true);
    });
    
    test('ospf_interface_cost validates cost setting', () => {
      const state = createInitialState('2960-switch');
      state.ospf.ifCosts = { 'g0/1': 10 };
      
      const grammarPath = path.join(process.cwd(), 'grammar/commands-2960-switch.yaml');
      const grammar = loadGrammar(grammarPath);
      const modeStack = new ModeStack(grammar);
      
      const result = validator.runAssertions(state, modeStack, [
        {
          type: 'ospf_interface_cost',
          interface: 'g0/1',
          expected: 10,
          message: 'Interface cost should be 10'
        }
      ], false);
      
      expect(result.passed).toBe(true);
    });
  });
  
  describe('SSH assertions', () => {
    test('ssh_domain validates domain name', () => {
      const state = createInitialState('2960-switch');
      state.ssh = {
        domainName: 'cisco.com',
        rsaModulus: null,
        sshVersion: null,
        users: {},
        vty: { range: null, login: null, transport: [] }
      };
      
      const grammarPath = path.join(process.cwd(), 'grammar/commands-2960-switch.yaml');
      const grammar = loadGrammar(grammarPath);
      const modeStack = new ModeStack(grammar);
      
      const result = validator.runAssertions(state, modeStack, [
        {
          type: 'ssh_domain',
          expected: 'cisco.com',
          message: 'SSH domain should be set'
        }
      ], false);
      
      expect(result.passed).toBe(true);
    });
    
    test('ssh_user validates user creation', () => {
      const state = createInitialState('2960-switch');
      state.ssh = {
        domainName: null,
        rsaModulus: null,
        sshVersion: null,
        users: { admin: { secret: 'password123' } },
        vty: { range: null, login: null, transport: [] }
      };
      
      const grammarPath = path.join(process.cwd(), 'grammar/commands-2960-switch.yaml');
      const grammar = loadGrammar(grammarPath);
      const modeStack = new ModeStack(grammar);
      
      const result = validator.runAssertions(state, modeStack, [
        {
          type: 'ssh_user',
          username: 'admin',
          message: 'User admin should exist'
        }
      ], false);
      
      expect(result.passed).toBe(true);
    });
    
    test('vty_config validates VTY line configuration', () => {
      const state = createInitialState('2960-switch');
      state.ssh = {
        domainName: null,
        rsaModulus: null,
        sshVersion: null,
        users: {},
        vty: { 
          range: '0 4', 
          login: 'local', 
          transport: ['ssh'] 
        }
      };
      
      const grammarPath = path.join(process.cwd(), 'grammar/commands-2960-switch.yaml');
      const grammar = loadGrammar(grammarPath);
      const modeStack = new ModeStack(grammar);
      
      const result = validator.runAssertions(state, modeStack, [
        {
          type: 'vty_config',
          message: 'VTY should be configured for SSH'
        }
      ], false);
      
      expect(result.passed).toBe(true);
    });
  });
  
  describe('route assertions', () => {
    test('route_exists validates static route', () => {
      const state = createInitialState('1941-router');
      state.routes = [
        { dest: '0.0.0.0', mask: '0.0.0.0', nextHop: '192.168.1.1', ad: 1 }
      ];
      
      const grammarPath = path.join(process.cwd(), 'grammar/commands-1941-router.yaml');
      const grammar = loadGrammar(grammarPath);
      const modeStack = new ModeStack(grammar);
      
      const result = validator.runAssertions(state, modeStack, [
        {
          type: 'route_exists',
          dest: '0.0.0.0',
          mask: '0.0.0.0',
          nextHop: '192.168.1.1',
          message: 'Default route should exist'
        }
      ], false);
      
      expect(result.passed).toBe(true);
    });
    
    test('route_exists validates floating static route with AD', () => {
      const state = createInitialState('1941-router');
      state.routes = [
        { dest: '0.0.0.0', mask: '0.0.0.0', nextHop: '192.168.1.1', ad: 1 },
        { dest: '0.0.0.0', mask: '0.0.0.0', nextHop: '192.168.1.2', ad: 254 }
      ];
      
      const grammarPath = path.join(process.cwd(), 'grammar/commands-1941-router.yaml');
      const grammar = loadGrammar(grammarPath);
      const modeStack = new ModeStack(grammar);
      
      const result = validator.runAssertions(state, modeStack, [
        {
          type: 'route_exists',
          dest: '0.0.0.0',
          mask: '0.0.0.0',
          nextHop: '192.168.1.2',
          ad: 254,
          message: 'Floating backup route should exist'
        }
      ], false);
      
      expect(result.passed).toBe(true);
    });
  });
  
  describe('mode assertion', () => {
    test('mode_reached validates current mode', () => {
      const state = createInitialState('2960-switch');
      
      const grammarPath = path.join(process.cwd(), 'grammar/commands-2960-switch.yaml');
      const grammar = loadGrammar(grammarPath);
      const modeStack = new ModeStack(grammar);
      modeStack.push(ModeType.PRIV_EXEC);
      modeStack.push(ModeType.GLOBAL_CONFIG);
      
      const result = validator.runAssertions(state, modeStack, [
        {
          type: 'mode_reached',
          expected: ModeType.GLOBAL_CONFIG,
          message: 'Should be in config mode'
        }
      ], false);
      
      expect(result.passed).toBe(true);
    });
  });
  
  describe('command_succeeded assertion', () => {
    test('always passes for exploratory exercises', () => {
      const state = createInitialState('2960-switch');
      
      const grammarPath = path.join(process.cwd(), 'grammar/commands-2960-switch.yaml');
      const grammar = loadGrammar(grammarPath);
      const modeStack = new ModeStack(grammar);
      
      const result = validator.runAssertions(state, modeStack, [
        {
          type: 'command_succeeded',
          message: 'Commands should succeed'
        }
      ], false);
      
      expect(result.passed).toBe(true);
    });
  });
});

describe('LessonValidator - Exercise Validation', () => {
  let validator: LessonValidator;
  
  beforeEach(() => {
    validator = new LessonValidator();
  });
  
  test('validates simple hostname exercise', () => {
    const exercise: ExerciseDefinition = {
      id: 'hostname-test',
      deviceModel: '2960-switch',
      commands: [
        'enable',
        'configure terminal',
        'hostname MySwitch',
        'end'
      ],
      validation: {
        type: 'goal-based',
        assertions: [
          {
            type: 'hostname',
            expected: 'MySwitch',
            message: 'Hostname should be MySwitch'
          }
        ]
      }
    };
    
    const result = validator.validateExercise(exercise);
    expect(result.passed).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
  
  test('validates interface IP configuration', () => {
    const exercise: ExerciseDefinition = {
      id: 'interface-ip-test',
      deviceModel: '2960-switch',
      commands: [
        'enable',
        'configure terminal',
        'interface vlan 1',
        'ip address 192.168.1.100 255.255.255.0',
        'no shutdown',
        'end'
      ],
      validation: {
        type: 'goal-based',
        assertions: [
          {
            type: 'interface_ip',
            interface: 'vlan1',
            ip: '192.168.1.100',
            mask: '255.255.255.0',
            message: 'VLAN 1 should have IP'
          },
          {
            type: 'interface_admin_up',
            interface: 'vlan1',
            expected: true,
            message: 'VLAN 1 should be enabled'
          }
        ]
      }
    };
    
    const result = validator.validateExercise(exercise);
    expect(result.passed).toBe(true);
  });
  
  test('detects command execution errors', () => {
    const exercise: ExerciseDefinition = {
      id: 'invalid-command-test',
      deviceModel: '2960-switch',
      commands: [
        'enable',
        'configure terminal',
        'interface g99/99/99'  // Invalid interface
      ],
      validation: {
        type: 'goal-based',
        assertions: []
      }
    };
    
    const result = validator.validateExercise(exercise);
    expect(result.passed).toBe(false);
    expect(result.errors.some(e => e.message.includes('Command failed'))).toBe(true);
  });
  
  test('detects missing configuration', () => {
    const exercise: ExerciseDefinition = {
      id: 'missing-config-test',
      deviceModel: '2960-switch',
      commands: [
        'enable',
        'configure terminal',
        'interface g0/1',
        // Missing: ip address command
        'no shutdown',
        'end'
      ],
      validation: {
        type: 'goal-based',
        assertions: [
          {
            type: 'interface_ip',
            interface: 'g0/1',
            ip: '10.0.0.1',
            mask: '255.255.255.0',
            message: 'Interface should have IP'
          }
        ]
      }
    };
    
    const result = validator.validateExercise(exercise);
    expect(result.passed).toBe(false);
    expect(result.errors[0].message).toBe('Interface should have IP');
    expect(result.errors[0].actual).toBe('not configured');
  });
  
  test('handles password prompts automatically', () => {
    const exercise: ExerciseDefinition = {
      id: 'password-test',
      deviceModel: '2960-switch',
      commands: [
        'enable',
        'configure terminal',
        'enable secret TestPass123',
        'end',
        'disable',
        'enable'
        // Validator should auto-supply TestPass123
      ],
      validation: {
        type: 'goal-based',
        assertions: [
          {
            type: 'enable_secret',
            message: 'Password should be set'
          }
        ]
      }
    };
    
    const result = validator.validateExercise(exercise);
    expect(result.passed).toBe(true);
  });
  
  test('validates VLAN creation and assignment', () => {
    const exercise: ExerciseDefinition = {
      id: 'vlan-test',
      deviceModel: '2960-switch',
      commands: [
        'enable',
        'configure terminal',
        'vlan 100',
        'name Students',
        'exit',
        'interface fa0/2',
        'switchport mode access',
        'switchport access vlan 100',
        'end'
      ],
      validation: {
        type: 'goal-based',
        assertions: [
          {
            type: 'vlan_exists',
            vlanId: '100',
            message: 'VLAN 100 should exist'
          },
          {
            type: 'vlan_name',
            vlanId: '100',
            expected: 'Students',
            message: 'VLAN 100 should be named Students'
          },
          {
            type: 'interface_access_vlan',
            interface: 'fa0/2',
            vlanId: '100',
            message: 'fa0/2 should be in VLAN 100'
          }
        ]
      }
    };
    
    const result = validator.validateExercise(exercise);
    expect(result.passed).toBe(true);
  });
});

describe('Goal-based validation behavior', () => {
  let validator: LessonValidator;
  
  beforeEach(() => {
    validator = new LessonValidator();
  });
  
  test('allows alternative command sequences with same result', () => {
    // Student configures things in different order
    const exercise: ExerciseDefinition = {
      id: 'flexible-test',
      deviceModel: '2960-switch',
      commands: [
        'enable',
        'configure terminal',
        'hostname MySwitch',  // Could be done in any order
        'vlan 100',
        'exit',
        'end'
      ],
      validation: {
        type: 'goal-based',
        assertions: [
          { type: 'hostname', expected: 'MySwitch', message: 'Hostname' },
          { type: 'vlan_exists', vlanId: '100', message: 'VLAN' }
        ]
      }
    };
    
    const result = validator.validateExercise(exercise);
    expect(result.passed).toBe(true);
  });
  
  test('validates complex multi-assertion exercise', () => {
    const exercise: ExerciseDefinition = {
      id: 'complex-test',
      deviceModel: '2960-switch',
      commands: [
        'enable',
        'configure terminal',
        'hostname CorporateSwitch',
        'vlan 100',
        'name Students',
        'exit',
        'interface vlan 100',
        'ip address 10.0.0.1 255.255.255.0',
        'no shutdown',
        'end'
      ],
      validation: {
        type: 'goal-based',
        assertions: [
          { type: 'hostname', expected: 'CorporateSwitch', message: 'Hostname' },
          { type: 'vlan_exists', vlanId: '100', message: 'VLAN 100' },
          { type: 'vlan_name', vlanId: '100', expected: 'Students', message: 'VLAN name' },
          { type: 'interface_ip', interface: 'vlan100', ip: '10.0.0.1', mask: '255.255.255.0', message: 'SVI IP' },
          { type: 'interface_admin_up', interface: 'vlan100', expected: true, message: 'SVI enabled' }
        ]
      }
    };
    
    const result = validator.validateExercise(exercise);
    expect(result.passed).toBe(true);
    expect(result.errors).toHaveLength(0);
  });
});

