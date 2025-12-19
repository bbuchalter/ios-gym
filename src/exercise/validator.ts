import {
  DeviceState,
  Exercise,
  Requirement,
  ValidationResult,
  UnmetRequirement
} from "../types";
import { normalizeInterfaceName, getStatePath } from "../cli/state";

/**
 * Exercise validation engine
 */
export class ExerciseValidator {
  /**
   * Validate device state against exercise requirements
   */
  public validate(state: DeviceState, exercise: Exercise): ValidationResult {
    const unmetRequirements: UnmetRequirement[] = [];
    
    for (const req of exercise.requirements) {
      if (!this.checkRequirement(state, req, exercise)) {
        unmetRequirements.push(this.describeUnmetRequirement(req));
      }
    }
    
    return {
      passed: unmetRequirements.length === 0,
      unmetRequirements
    };
  }
  
  /**
   * Check a single requirement
   */
  private checkRequirement(state: DeviceState, req: Requirement, exercise: Exercise): boolean {
    switch (req.type) {
      case "state_equals":
        return this.checkStateEquals(state, req);
      
      case "vlan_exists":
        return this.checkVlanExists(state, req);
      
      case "if_access_vlan_equals":
        return this.checkIfAccessVlanEquals(state, req);
      
      case "if_trunk_allowed_equals":
        return this.checkIfTrunkAllowedEquals(state, req);
      
      case "if_l2mode_equals":
        return this.checkIfL2ModeEquals(state, req);
      
      case "if_ip_equals":
        return this.checkIfIpEquals(state, req);
      
      case "if_admin_up":
        return this.checkIfAdminUp(state, req);
      
      case "svi_ip_equals":
        return this.checkSviIpEquals(state, req);
      
      case "route_exists":
        return this.checkRouteExists(state, req);
      
      case "ospf_process_equals":
        return this.checkOspfProcessEquals(state, req);
      
      case "ospf_network_exists":
        return this.checkOspfNetworkExists(state, req);
      
      case "ospf_if_cost_equals":
        return this.checkOspfIfCostEquals(state, req);
      
      case "ssh_user_secret_equals":
        return this.checkSshUserSecretEquals(state, req);
      
      case "config_saved":
        return this.checkConfigSaved(state, exercise);
      
      default:
        console.warn(`Unknown requirement type: ${req.type}`);
        return false;
    }
  }
  
  private checkStateEquals(state: DeviceState, req: Requirement): boolean {
    const value = getStatePath(state, req.path);
    
    // Deep equality check for arrays
    if (Array.isArray(req.value)) {
      return JSON.stringify(value) === JSON.stringify(req.value);
    }
    
    return value === req.value;
  }
  
  private checkVlanExists(state: DeviceState, req: Requirement): boolean {
    return !!state.vlans[req.vlan];
  }
  
  private checkIfAccessVlanEquals(state: DeviceState, req: Requirement): boolean {
    const ifname = normalizeInterfaceName(req.ifname);
    const iface = state.interfaces[ifname];
    
    if (!iface) return false;
    
    return iface.accessVlan === req.vlan;
  }
  
  private checkIfTrunkAllowedEquals(state: DeviceState, req: Requirement): boolean {
    const ifname = normalizeInterfaceName(req.ifname);
    const iface = state.interfaces[ifname];
    
    if (!iface || !iface.trunkAllowed) return false;
    
    // Parse the trunk allowed list
    const allowed = iface.trunkAllowed.split(",").map((v: string) => v.trim());
    const expected = req.vlans || [];
    
    if (allowed.length !== expected.length) return false;
    
    return expected.every((v: string) => allowed.includes(v));
  }
  
  private checkIfL2ModeEquals(state: DeviceState, req: Requirement): boolean {
    const ifname = normalizeInterfaceName(req.ifname);
    const iface = state.interfaces[ifname];
    
    if (!iface) return false;
    
    return iface.l2mode === req.l2mode;
  }
  
  private checkIfIpEquals(state: DeviceState, req: Requirement): boolean {
    const ifname = normalizeInterfaceName(req.ifname);
    const iface = state.interfaces[ifname];
    
    if (!iface) return false;
    
    return iface.ip === req.ip && iface.mask === req.mask;
  }
  
  private checkIfAdminUp(state: DeviceState, req: Requirement): boolean {
    const ifname = normalizeInterfaceName(req.ifname);
    const iface = state.interfaces[ifname];
    
    if (!iface) return false;
    
    return iface.adminUp === true;
  }
  
  private checkSviIpEquals(state: DeviceState, req: Requirement): boolean {
    // SVIs are stored as regular interfaces with "vlan" prefix
    const ifname = `vlan${req.vlan}`;
    const iface = state.interfaces[ifname];
    
    if (!iface) return false;
    
    return iface.ip === req.ip && iface.mask === req.mask;
  }
  
  private checkRouteExists(state: DeviceState, req: Requirement): boolean {
    return state.routes.some(route =>
      route.dest === req.dest &&
      route.mask === req.mask &&
      route.nextHop === req.nextHop &&
      route.ad === req.ad
    );
  }
  
  private checkOspfProcessEquals(state: DeviceState, req: Requirement): boolean {
    return state.ospf.processId === req.value;
  }
  
  private checkOspfNetworkExists(state: DeviceState, req: Requirement): boolean {
    return state.ospf.networks.some(network =>
      network.ip === req.ip &&
      network.wildcard === req.wildcard &&
      network.area === req.area
    );
  }
  
  private checkOspfIfCostEquals(state: DeviceState, req: Requirement): boolean {
    const ifname = normalizeInterfaceName(req.ifname);
    return state.ospf.ifCosts[ifname] === req.cost;
  }
  
  private checkSshUserSecretEquals(state: DeviceState, req: Requirement): boolean {
    const user = state.ssh.users[req.user];
    
    if (!user) return false;
    
    return user.secret === req.secret;
  }
  
  private checkConfigSaved(state: DeviceState, exercise: Exercise): boolean {
    // Check if a saved state exists
    if (!state.savedState || !state.configSaved) {
      return false;
    }
    
    // Validate that the saved state meets all OTHER requirements (excluding config_saved itself)
    const otherRequirements = exercise.requirements.filter(req => req.type !== "config_saved");
    
    // Create a temporary state object from savedState for validation
    const savedStateForValidation = {
      ...state.savedState,
      configSaved: false,
      savedState: null
    } as DeviceState;
    
    // Create a temporary exercise without config_saved requirement to avoid recursion
    const tempExercise: Exercise = {
      ...exercise,
      requirements: otherRequirements
    };
    
    // Check all other requirements against the saved state
    for (const req of otherRequirements) {
      if (!this.checkRequirement(savedStateForValidation, req, tempExercise)) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Generate a human-readable description of an unmet requirement
   */
  private describeUnmetRequirement(req: Requirement): UnmetRequirement {
    switch (req.type) {
      case "state_equals":
        return {
          type: req.type,
          description: `${req.path} should equal ${JSON.stringify(req.value)}`
        };
      
      case "vlan_exists":
        return {
          type: req.type,
          description: `VLAN ${req.vlan} should exist`
        };
      
      case "if_access_vlan_equals":
        return {
          type: req.type,
          description: `Interface ${req.ifname} should be in access VLAN ${req.vlan}`
        };
      
      case "if_trunk_allowed_equals":
        return {
          type: req.type,
          description: `Interface ${req.ifname} should allow VLANs ${req.vlans.join(",")}`
        };
      
      case "if_l2mode_equals":
        return {
          type: req.type,
          description: `Interface ${req.ifname} should have l2mode ${req.l2mode}`
        };
      
      case "if_ip_equals":
        return {
          type: req.type,
          description: `Interface ${req.ifname} should have IP ${req.ip} ${req.mask}`
        };
      
      case "if_admin_up":
        return {
          type: req.type,
          description: `Interface ${req.ifname} should be administratively up`
        };
      
      case "svi_ip_equals":
        return {
          type: req.type,
          description: `VLAN ${req.vlan} SVI should have IP ${req.ip} ${req.mask}`
        };
      
      case "route_exists":
        return {
          type: req.type,
          description: `Route ${req.dest}/${req.mask} via ${req.nextHop} (AD ${req.ad}) should exist`
        };
      
      case "ospf_process_equals":
        return {
          type: req.type,
          description: `OSPF process ID should be ${req.value}`
        };
      
      case "ospf_network_exists":
        return {
          type: req.type,
          description: `OSPF network ${req.ip} ${req.wildcard} area ${req.area} should exist`
        };
      
      case "ospf_if_cost_equals":
        return {
          type: req.type,
          description: `Interface ${req.ifname} OSPF cost should be ${req.cost}`
        };
      
      case "ssh_user_secret_equals":
        return {
          type: req.type,
          description: `SSH user ${req.user} should exist with correct secret`
        };
      
      case "config_saved":
        return {
          type: req.type,
          description: `Configuration must be saved (use 'write memory' or 'copy running-config startup-config')`
        };
      
      default:
        return {
          type: req.type,
          description: `Unknown requirement type: ${req.type}`
        };
    }
  }
}

