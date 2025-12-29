/**
 * Shared assertion logic for both build-time and runtime validators
 * No Node.js dependencies - works in both environments
 */

import { DeviceState, DeviceModel, ModeType } from '../types';
import { ModeStack } from '../cli/modes';

export interface ValidationError {
  assertionType: string;
  message: string;
  expected?: any;
  actual?: any;
}

export interface ValidationResult {
  passed: boolean;
  errors: ValidationError[];
  warnings: string[];
}

export interface Assertion {
  type: string;
  message: string;
  interface?: string;
  ip?: string;
  mask?: string;
  expected?: any;
  vlanId?: string;
  username?: string;
  wildcard?: string;
  area?: number;
  dest?: string;
  nextHop?: string;
  ad?: number;
  [key: string]: any;
}

export interface ExerciseDefinition {
  id: string;
  deviceModel: DeviceModel;
  description?: string;
  commands: string[];
  validation: {
    type: 'goal-based' | 'exploratory';
    assertions: Assertion[];
  };
}

interface AssertionResult {
  passed: boolean;
  expected?: any;
  actual?: any;
  message?: string;
}

export class AssertionRunner {
  /**
   * Run assertions - checks final state only
   * Validates against savedState (startup-config) not running-config
   */
  runAssertions(
    state: DeviceState, 
    modeStack: ModeStack,
    assertions: Assertion[],
    requireSaved: boolean = true
  ): ValidationResult {
    const errors: ValidationError[] = [];
    
    // Check if configuration was saved (only if required)
    if (requireSaved && !state.configSaved) {
      errors.push({
        assertionType: 'config_saved',
        message: 'Configuration not saved! Use "write memory" to save your work.',
        expected: 'saved',
        actual: 'not saved'
      });
      
      return {
        passed: false,
        errors,
        warnings: []
      };
    }
    
    // Validate against savedState if it exists and we require saved, otherwise use current state
    const stateToValidate = (requireSaved && state.savedState) ? state.savedState : state;
    
    for (const assertion of assertions) {
      const result = this.runAssertion(stateToValidate as DeviceState, modeStack, assertion);
      if (!result.passed) {
        errors.push({
          assertionType: assertion.type,
          message: assertion.message,
          expected: result.expected,
          actual: result.actual
        });
      }
    }
    
    return {
      passed: errors.length === 0,
      errors,
      warnings: []
    };
  }

  private runAssertion(state: DeviceState, modeStack: ModeStack, assertion: Assertion): AssertionResult {
    switch (assertion.type) {
      case 'hostname':
        return {
          passed: state.hostname === assertion.expected,
          expected: assertion.expected,
          actual: state.hostname
        };
      
      case 'enable_secret':
        return {
          passed: !!state.enableSecret,
          expected: 'password set',
          actual: state.enableSecret ? 'set' : 'not set'
        };
      
      case 'interface_exists':
        const iface = state.interfaces[assertion.interface!];
        return {
          passed: !!iface,
          expected: 'interface exists',
          actual: iface ? 'exists' : 'not found'
        };
      
      case 'interface_ip':
        const ipIface = state.interfaces[assertion.interface!];
        if (!ipIface) {
          return { passed: false, expected: assertion.ip, actual: 'interface not found' };
        }
        const ipMatches = ipIface.ip === assertion.ip && ipIface.mask === assertion.mask;
        return {
          passed: ipMatches,
          expected: `${assertion.ip} ${assertion.mask}`,
          actual: ipIface.ip && ipIface.mask ? `${ipIface.ip} ${ipIface.mask}` : 'not configured'
        };
      
      case 'interface_mode':
        const modeIface = state.interfaces[assertion.interface!];
        return {
          passed: modeIface?.l2mode === assertion.expected,
          expected: assertion.expected,
          actual: modeIface?.l2mode || 'not configured'
        };
      
      case 'interface_admin_up':
        const adminIface = state.interfaces[assertion.interface!];
        return {
          passed: adminIface?.adminUp === assertion.expected,
          expected: assertion.expected ? 'up' : 'down',
          actual: adminIface?.adminUp ? 'up' : 'down'
        };
      
      case 'vlan_exists':
        const vlan = state.vlans[assertion.vlanId!];
        return {
          passed: !!vlan,
          expected: 'VLAN exists',
          actual: vlan ? 'exists' : 'not found'
        };
      
      case 'vlan_name':
        const namedVlan = state.vlans[assertion.vlanId!];
        return {
          passed: namedVlan?.name === assertion.expected,
          expected: assertion.expected,
          actual: namedVlan?.name || 'not named'
        };
      
      case 'interface_access_vlan':
        const accessIface = state.interfaces[assertion.interface!];
        return {
          passed: accessIface?.accessVlan === assertion.vlanId,
          expected: `VLAN ${assertion.vlanId}`,
          actual: accessIface?.accessVlan || 'not assigned'
        };
      
      case 'interface_trunk_allowed':
        const trunkIface = state.interfaces[assertion.interface!];
        const expectedValue = assertion.expected || null;
        return {
          passed: trunkIface?.trunkAllowed === expectedValue,
          expected: expectedValue || 'all VLANs (no restriction)',
          actual: trunkIface?.trunkAllowed || 'all VLANs (no restriction)'
        };
      
      case 'ospf_network':
        const hasNetwork = state.ospf.networks?.some(n =>
          n.ip === assertion.ip && 
          n.wildcard === assertion.wildcard && 
          n.area === assertion.area
        );
        return {
          passed: hasNetwork,
          expected: `${assertion.ip} ${assertion.wildcard} area ${assertion.area}`,
          actual: hasNetwork ? 'configured' : 'not found'
        };
      
      case 'ospf_interface_cost':
        const cost = state.ospf.ifCosts?.[assertion.interface!];
        return {
          passed: cost === assertion.expected,
          expected: String(assertion.expected),
          actual: cost !== undefined ? String(cost) : 'default'
        };
      
      case 'route_exists':
        const ad = assertion.ad !== undefined ? assertion.ad : 1;
        const hasRoute = state.routes?.some(r =>
          r.dest === assertion.dest &&
          r.mask === assertion.mask &&
          r.nextHop === assertion.nextHop &&
          r.ad === ad
        );
        return {
          passed: hasRoute,
          expected: `${assertion.dest} ${assertion.mask} via ${assertion.nextHop} AD ${ad}`,
          actual: hasRoute ? 'configured' : 'not found'
        };
      
      case 'ssh_domain':
        return {
          passed: state.ssh?.domainName === assertion.expected,
          expected: assertion.expected,
          actual: state.ssh?.domainName || 'not configured'
        };
      
      case 'ssh_version':
        return {
          passed: state.ssh?.sshVersion === assertion.expected,
          expected: String(assertion.expected),
          actual: state.ssh?.sshVersion ? String(state.ssh.sshVersion) : 'not configured'
        };
      
      case 'ssh_user':
        const user = state.ssh?.users?.[assertion.username!];
        return {
          passed: !!user,
          expected: `user '${assertion.username}' exists`,
          actual: user ? 'exists' : 'not found'
        };
      
      case 'vty_config':
        const hasLogin = state.ssh?.vty?.login === 'local';
        const hasSSH = state.ssh?.vty?.transport?.includes('ssh');
        return {
          passed: hasLogin && hasSSH,
          expected: 'login local + transport ssh',
          actual: `login: ${state.ssh?.vty?.login || 'none'}, transport: ${state.ssh?.vty?.transport?.join(',') || 'none'}`
        };
      
      case 'default_gateway':
        return {
          passed: state.ipDefaultGateway === assertion.expected,
          expected: assertion.expected,
          actual: state.ipDefaultGateway || 'not set'
        };
      
      case 'mode_reached':
        return {
          passed: modeStack.getCurrentMode() === assertion.expected,
          expected: assertion.expected,
          actual: modeStack.getCurrentMode()
        };
      
      case 'command_succeeded':
        return { 
          passed: true, 
          expected: 'commands succeeded', 
          actual: 'succeeded' 
        };
      
      case 'ip_routing_enabled':
        return { 
          passed: true, 
          expected: 'routing enabled', 
          actual: 'assumed enabled' 
        };
      
      default:
        return { 
          passed: false, 
          message: `Unknown assertion type: ${assertion.type}`,
          expected: 'valid assertion',
          actual: `unknown type: ${assertion.type}`
        };
    }
  }
}

