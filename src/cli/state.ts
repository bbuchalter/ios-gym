import { DeviceState, DeviceModel } from "../types";

/**
 * Create initial device state for specific Cisco hardware models
 * @param deviceModel - '2960-switch' for Catalyst 2960 or '1941-router' for Cisco 1941 ISR
 */
export function createInitialState(deviceModel: DeviceModel = '2960-switch'): DeviceState {
  const interfaces: DeviceState["interfaces"] = {};
  
  // Base state shared by all devices
  const baseState = {
    deviceModel,
    enableSecret: null,
    servicePasswordEncryption: false, // service password-encryption
    ipRouting: deviceModel === '1941-router', // Enabled by default on routers, disabled on switches
    vlans: {
      "1": {
        name: "default"
      },
      "1002": {
        name: "fddi-default"
      },
      "1003": {
        name: "token-ring-default"
      },
      "1004": {
        name: "fddinet-default"
      },
      "1005": {
        name: "trnet-default"
      }
    },
    svis: {},
    ipDefaultGateway: null,
    routes: [],
    ospf: {
      processId: null,
      networks: [],
      ifCosts: {},
      defaultInformationOriginate: false
    },
    ssh: {
      domainName: null,
      rsaModulus: null,
      sshVersion: null,
      users: {},
      vty: {
        range: null,
        login: null,
        transport: []
      }
    },
    line: {
      console: {
        loggingSynchronous: false
      }
    },
    configSaved: false,
    savedState: null
  };
  
  if (deviceModel === '2960-switch') {
    // Catalyst 2960 switch: 24 FastEthernet + 2 GigabitEthernet + Vlan1 (Layer 2 only)
    // FastEthernet interfaces (fa0/1 through fa0/24)
    for (let i = 1; i <= 24; i++) {
      interfaces[`fa0/${i}`] = {
        adminUp: false,
        l2mode: null,  // Layer 2 by default on switches
        accessVlan: null,
        trunkAllowed: null,
        ip: null,
        mask: null
      };
    }
    
    // GigabitEthernet interfaces (g0/1 and g0/2)
    interfaces["g0/1"] = {
      adminUp: false,
      l2mode: null,
      accessVlan: null,
      trunkAllowed: null,
      ip: null,
      mask: null
    };
    interfaces["g0/2"] = {
      adminUp: false,
      l2mode: null,
      accessVlan: null,
      trunkAllowed: null,
      ip: null,
      mask: null
    };
    
    // Vlan1 management interface
    interfaces["vlan1"] = {
      adminUp: false,
      l2mode: "routed",
      accessVlan: null,
      trunkAllowed: null,
      ip: null,
      mask: null
    };
    
    return {
      ...baseState,
      hostname: "Switch",
      ipRouting: false, // 2960 is Layer 2 only - no routing capability
      interfaces
    };
  } else if (deviceModel === '3650-24ps') {
    // Catalyst 3650-24PS: 24 main GigabitEthernet + 4 uplink module + Vlan1 (Layer 3 capable)
    // Verified against Packet Tracer output - stackable naming g1/0/x (stack 1, module 0, port x)
    
    // Main 24 GigabitEthernet ports (g1/0/1 through g1/0/24)
    for (let i = 1; i <= 24; i++) {
      interfaces[`g1/0/${i}`] = {
        adminUp: false,
        l2mode: null,  // Can be Layer 2 or Layer 3
        accessVlan: null,
        trunkAllowed: null,
        ip: null,
        mask: null
      };
    }
    
    // Uplink module ports (g1/1/1 through g1/1/4)
    for (let i = 1; i <= 4; i++) {
      interfaces[`g1/1/${i}`] = {
        adminUp: false,
        l2mode: null,
        accessVlan: null,
        trunkAllowed: null,
        ip: null,
        mask: null
      };
    }
    
    // Vlan1 management interface (administratively down by default)
    interfaces["vlan1"] = {
      adminUp: false,  // Matches "shutdown" in Packet Tracer
      l2mode: "routed",
      accessVlan: null,
      trunkAllowed: null,
      ip: null,
      mask: null
    };
    
    return {
      ...baseState,
      hostname: "Switch", // Matches Packet Tracer default
      ipRouting: false, // "no ip cef" in PT means routing disabled by default
      interfaces
    };
  } else {
    // Cisco 1941 ISR router: 2 GigabitEthernet + Vlan1
    // Stored as abbreviated form (g0/0, g0/1) per user preference
    interfaces["g0/0"] = {
      adminUp: false,
      l2mode: "routed",  // Routed by default on routers
      accessVlan: null,
      trunkAllowed: null,
      ip: null,
      mask: null
    };
    interfaces["g0/1"] = {
      adminUp: false,
      l2mode: "routed",
      accessVlan: null,
      trunkAllowed: null,
      ip: null,
      mask: null
    };
    
    // Vlan1 management interface (routers have this too)
    interfaces["vlan1"] = {
      adminUp: false,
      l2mode: "routed",
      accessVlan: null,
      trunkAllowed: null,
      ip: null,
      mask: null
    };
    
    return {
      ...baseState,
      hostname: "Router",
      interfaces
    };
  }
}

/**
 * Deep clone device state for immutable updates
 */
export function cloneState(state: DeviceState): DeviceState {
  return JSON.parse(JSON.stringify(state));
}

/**
 * Get a nested property from state using dot notation path
 */
export function getStatePath(state: DeviceState, path: string): any {
  const parts = path.split(".");
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
 * Set a nested property in state using dot notation path
 */
export function setStatePath(state: DeviceState, path: string, value: any): void {
  const parts = path.split(".");
  let current: any = state;
  
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!(part in current)) {
      current[part] = {};
    }
    current = current[part];
  }
  
  current[parts[parts.length - 1]] = value;
}

/**
 * Normalize interface name (e.g., "gi0/1" -> "g0/1", "GigabitEthernet0/1" -> "g0/1")
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

/**
 * Validate if an interface name is valid for the device model
 */
export function isValidInterface(state: DeviceState, ifname: string): boolean {
  const normalized = normalizeInterfaceName(ifname);
  
  // Check if interface already exists
  if (state.interfaces[normalized]) {
    return true;
  }
  
  // Device-specific validation for interfaces that could exist
  if (state.deviceModel === '2960-switch') {
    // 2960: fa0/1-24, g0/1-2, vlans (Layer 2 only)
    if (/^fa0\/(1[0-9]|2[0-4]|[1-9])$/.test(normalized)) return true;
    if (/^g0\/[12]$/.test(normalized)) return true;
    if (/^vlan\d+$/.test(normalized)) return true;
  } else if (state.deviceModel === '3650-24ps') {
    // 3650-24PS: g1/0/1-24 (main), g1/1/1-4 (uplink), vlans (Layer 3 capable)
    if (/^g1\/0\/(1[0-9]|2[0-4]|[1-9])$/.test(normalized)) return true;
    if (/^g1\/1\/[1-4]$/.test(normalized)) return true;
    if (/^vlan\d+$/.test(normalized)) return true;
  } else if (state.deviceModel === '1941-router') {
    // 1941: g0/0-1, vlans (no FastEthernet on routers)
    if (/^g0\/[01]$/.test(normalized)) return true;
    if (/^vlan\d+$/.test(normalized)) return true;
  }
  
  return false;
}

/**
 * Ensure interface exists in state
 */
export function ensureInterface(state: DeviceState, ifname: string): void {
  const normalized = normalizeInterfaceName(ifname);
  
  if (!state.interfaces[normalized]) {
    state.interfaces[normalized] = {
      adminUp: false,
      l2mode: null,
      accessVlan: null,
      trunkAllowed: null,
      ip: null,
      mask: null
    };
  }
}

