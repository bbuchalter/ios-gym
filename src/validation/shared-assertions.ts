import { Assertion } from './types';
import { DeviceState } from '../types';

/**
 * Build a state-path assertion to check a nested property in device state
 * 
 * @example
 * buildStatePathAssertion('hostname', 'CorporateSwitch', 'Hostname should be set to CorporateSwitch')
 * buildStatePathAssertion('interfaces.g0/0.ip', '192.168.1.1', 'GigabitEthernet0/0 should have IP 192.168.1.1')
 */
export function buildStatePathAssertion(
  path: string,
  expectedValue: any,
  description: string,
  diagnosticCommand?: string
): Assertion {
  return {
    type: 'state-path',
    path,
    expectedValue,
    description,
    diagnosticCommand: diagnosticCommand || 'show running-config'
  };
}

/**
 * Build a config-saved assertion to ensure write memory was executed
 */
export function buildConfigSavedAssertion(): Assertion {
  return {
    type: 'config-saved',
    expectedValue: true,
    description: 'Configuration not saved! Run "write memory" to save your changes.',
    diagnosticCommand: 'show running-config'
  };
}

/**
 * Build an interface-exists assertion to verify an interface is configured
 * 
 * @param interfaceName - Interface name (will be normalized, e.g., "gi0/0" -> "g0/0")
 * @param shouldExist - Whether the interface should exist (default: true)
 */
export function buildInterfaceExistsAssertion(
  interfaceName: string,
  shouldExist: boolean = true
): Assertion {
  const action = shouldExist ? 'should be configured' : 'should not exist';
  return {
    type: 'interface-exists',
    expectedValue: { interfaceName, shouldExist },
    description: `Interface ${interfaceName} ${action}`,
    diagnosticCommand: 'show ip interface brief'
  };
}

/**
 * Build an OSPF network assertion to verify a network is advertised
 * 
 * @param network - Network address (e.g., "192.168.1.0")
 * @param wildcard - Wildcard mask (e.g., "0.0.0.255")
 * @param area - OSPF area (e.g., 0)
 */
export function buildOSPFNetworkAssertion(
  network: string,
  wildcard: string,
  area: number
): Assertion {
  return {
    type: 'ospf-network',
    expectedValue: { network, wildcard, area },
    description: `OSPF should advertise network ${network} ${wildcard} area ${area}`,
    diagnosticCommand: 'show running-config | section router ospf'
  };
}

/**
 * Build a VLAN-exists assertion to verify a VLAN is configured
 * 
 * @param vlanId - VLAN ID as string (e.g., "100")
 * @param name - Optional VLAN name to verify
 */
export function buildVLANExistsAssertion(
  vlanId: string,
  name?: string
): Assertion {
  const nameDesc = name ? ` with name "${name}"` : '';
  return {
    type: 'vlan-exists',
    expectedValue: { vlanId, name },
    description: `VLAN ${vlanId}${nameDesc} should be configured`,
    diagnosticCommand: 'show vlan brief'
  };
}

/**
 * Get a nested property from state using dot notation path
 * Handles interface names with slashes (e.g., "interfaces.g0/0.ip")
 * 
 * @param state - Device state to query
 * @param path - Dot-notation path (e.g., "hostname", "interfaces.g0/0.ip")
 */
export function getStatePath(state: Partial<DeviceState>, path: string): any {
  const parts = path.split('.');
  let current: any = state;
  
  for (const part of parts) {
    if (current === null || current === undefined) {
      return undefined;
    }
    current = current[part];
  }
  
  return current;
}

/**
 * Deep equality check for comparing expected and actual values
 * Handles primitives, arrays, and objects
 */
export function deepEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (a === null || b === null || a === undefined || b === undefined) {
    return a === b;
  }
  
  if (typeof a !== typeof b) return false;
  
  if (typeof a !== 'object') return a === b;
  
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  
  if (Array.isArray(a)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  for (const key of keysA) {
    if (!keysB.includes(key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }
  
  return true;
}

/**
 * Normalize interface name for comparison
 * (e.g., "gi0/0" -> "g0/0", "GigabitEthernet0/0" -> "g0/0")
 */
export function normalizeInterfaceName(ifname: string): string {
  let normalized = ifname.toLowerCase().trim();
  
  // Handle "vlan 10" -> "vlan10"
  normalized = normalized.replace(/^vlan\s+/, "vlan");
  
  // Handle gigabitethernet -> g
  normalized = normalized.replace(/^gigabitethernet/, "g");
  normalized = normalized.replace(/^gi/, "g");
  
  // Handle fastethernet -> fa
  normalized = normalized.replace(/^fastethernet/, "fa");
  
  return normalized;
}

