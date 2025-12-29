import { DeviceState } from '../types';
import { 
  Exercise, 
  ValidationResult, 
  ValidationError,
  Assertion 
} from './types';
import { 
  getStatePath, 
  deepEqual,
  normalizeInterfaceName 
} from './shared-assertions';

/**
 * RuntimeValidator - Browser-compatible validation of device state
 * 
 * This validator runs in the browser and checks student's terminal session
 * state against exercise objectives. It does NOT execute commands - it only
 * validates the final savedState after "write memory" is run.
 * 
 * NO Node.js dependencies (no fs, path, etc.)
 */
export class RuntimeValidator {
  /**
   * Validate a terminal session's saved state against exercise assertions
   * 
   * @param exercise - Exercise definition with assertions
   * @param deviceState - Current device state from CLISession
   * @returns ValidationResult with success status and any errors
   */
  validate(exercise: Exercise, deviceState: DeviceState): ValidationResult {
    const errors: ValidationError[] = [];
    
    // First check: Is configuration saved?
    if (!deviceState.configSaved) {
      errors.push({
        assertion: {
          type: 'config-saved',
          expectedValue: true,
          description: 'Configuration not saved! Run "write memory" to save your changes.',
          diagnosticCommand: 'show running-config'
        },
        actualValue: false,
        message: 'Configuration has not been saved. You must run "write memory" before validation.'
      });
      
      return {
        success: false,
        errors
      };
    }
    
    // Get the saved state to validate against
    const savedState = deviceState.savedState;
    
    if (!savedState) {
      errors.push({
        assertion: {
          type: 'config-saved',
          expectedValue: true,
          description: 'No saved configuration found',
          diagnosticCommand: 'show running-config'
        },
        actualValue: null,
        message: 'No saved state found. This should not happen if configSaved is true.'
      });
      
      return {
        success: false,
        errors
      };
    }
    
    // Second check: Are there unsaved changes?
    const unsavedChanges = this.detectUnsavedChanges(deviceState, savedState);
    if (unsavedChanges.length > 0) {
      errors.push({
        assertion: {
          type: 'config-saved',
          expectedValue: true,
          description: 'Configuration has unsaved changes',
          diagnosticCommand: 'show running-config'
        },
        actualValue: false,
        message: `You have unsaved changes! Run "write memory" to save them. Changes detected: ${unsavedChanges.join(', ')}`
      });
      
      return {
        success: false,
        errors
      };
    }
    
    // Validate each assertion
    for (const assertion of exercise.assertions) {
      const error = this.validateAssertion(assertion, savedState);
      if (error) {
        errors.push(error);
      }
    }
    
    return {
      success: errors.length === 0,
      errors
    };
  }
  
  /**
   * Detect unsaved changes by comparing running state with saved state
   * Returns array of change descriptions (empty if no changes)
   */
  private detectUnsavedChanges(
    runningState: DeviceState,
    savedState: Partial<DeviceState>
  ): string[] {
    const changes: string[] = [];
    
    // Compare hostname
    if (runningState.hostname !== savedState.hostname) {
      changes.push(`hostname (running: ${runningState.hostname}, saved: ${savedState.hostname})`);
    }
    
    // Compare enableSecret
    if (runningState.enableSecret !== savedState.enableSecret) {
      changes.push(`enable secret`);
    }
    
    // Compare interfaces
    if (!deepEqual(runningState.interfaces, savedState.interfaces || {})) {
      changes.push(`interfaces`);
    }
    
    // Compare vlans
    if (!deepEqual(runningState.vlans, savedState.vlans || {})) {
      changes.push(`VLANs`);
    }
    
    // Compare svis
    if (!deepEqual(runningState.svis, savedState.svis || {})) {
      changes.push(`SVIs`);
    }
    
    // Compare ipDefaultGateway
    if (runningState.ipDefaultGateway !== savedState.ipDefaultGateway) {
      changes.push(`default gateway`);
    }
    
    // Compare routes
    if (!deepEqual(runningState.routes, savedState.routes || [])) {
      changes.push(`routes`);
    }
    
    // Compare ospf
    if (!deepEqual(runningState.ospf, savedState.ospf)) {
      changes.push(`OSPF configuration`);
    }
    
    // Compare ssh
    if (!deepEqual(runningState.ssh, savedState.ssh)) {
      changes.push(`SSH configuration`);
    }
    
    // Compare line config
    if (!deepEqual(runningState.line, savedState.line)) {
      changes.push(`line configuration`);
    }
    
    return changes;
  }
  
  /**
   * Validate a single assertion against saved state
   * Returns ValidationError if assertion fails, null if passes
   */
  private validateAssertion(
    assertion: Assertion, 
    savedState: Partial<DeviceState>
  ): ValidationError | null {
    switch (assertion.type) {
      case 'config-saved':
        // Already checked before this point
        return null;
        
      case 'state-path':
        return this.validateStatePath(assertion, savedState);
        
      case 'interface-exists':
        return this.validateInterfaceExists(assertion, savedState);
        
      case 'ospf-network':
        return this.validateOSPFNetwork(assertion, savedState);
        
      case 'vlan-exists':
        return this.validateVLANExists(assertion, savedState);
        
      default:
        return {
          assertion,
          message: `Unknown assertion type: ${assertion.type}`
        };
    }
  }
  
  /**
   * Validate a state-path assertion (e.g., hostname, interfaces.g0/0.ip)
   */
  private validateStatePath(
    assertion: Assertion,
    savedState: Partial<DeviceState>
  ): ValidationError | null {
    if (!assertion.path) {
      return {
        assertion,
        message: 'state-path assertion requires a path'
      };
    }
    
    const actualValue = getStatePath(savedState, assertion.path);
    
    if (!deepEqual(actualValue, assertion.expectedValue)) {
      return {
        assertion,
        actualValue,
        message: `Expected ${assertion.path} to be ${JSON.stringify(assertion.expectedValue)}, but got ${JSON.stringify(actualValue)}`
      };
    }
    
    return null;
  }
  
  /**
   * Validate that an interface exists (or doesn't exist)
   */
  private validateInterfaceExists(
    assertion: Assertion,
    savedState: Partial<DeviceState>
  ): ValidationError | null {
    const { interfaceName, shouldExist } = assertion.expectedValue;
    const normalized = normalizeInterfaceName(interfaceName);
    
    const interfaces = savedState.interfaces || {};
    const exists = normalized in interfaces;
    
    if (exists !== shouldExist) {
      const action = shouldExist ? 'exist but was not found' : 'not exist but was found';
      return {
        assertion,
        actualValue: exists,
        message: `Interface ${interfaceName} should ${action}`
      };
    }
    
    return null;
  }
  
  /**
   * Validate that an OSPF network is advertised
   */
  private validateOSPFNetwork(
    assertion: Assertion,
    savedState: Partial<DeviceState>
  ): ValidationError | null {
    const { network, wildcard, area } = assertion.expectedValue;
    
    if (!savedState.ospf || !savedState.ospf.networks) {
      return {
        assertion,
        actualValue: null,
        message: 'OSPF is not configured'
      };
    }
    
    // Check if this network exists in OSPF configuration
    const found = savedState.ospf.networks.find(n => 
      n.ip === network && 
      n.wildcard === wildcard && 
      n.area === area
    );
    
    if (!found) {
      return {
        assertion,
        actualValue: savedState.ospf.networks,
        message: `OSPF network ${network} ${wildcard} area ${area} not found`
      };
    }
    
    return null;
  }
  
  /**
   * Validate that a VLAN exists with optional name check
   */
  private validateVLANExists(
    assertion: Assertion,
    savedState: Partial<DeviceState>
  ): ValidationError | null {
    const { vlanId, name } = assertion.expectedValue;
    
    if (!savedState.vlans) {
      return {
        assertion,
        actualValue: null,
        message: 'No VLANs configured'
      };
    }
    
    const vlan = savedState.vlans[vlanId];
    
    if (!vlan) {
      return {
        assertion,
        actualValue: Object.keys(savedState.vlans),
        message: `VLAN ${vlanId} not found`
      };
    }
    
    // If name is specified, check it matches
    if (name && vlan.name !== name) {
      return {
        assertion,
        actualValue: vlan.name,
        message: `VLAN ${vlanId} has name "${vlan.name}" but expected "${name}"`
      };
    }
    
    return null;
  }
}

