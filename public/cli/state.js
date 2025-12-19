/**
 * Create initial device state matching the schema from commands.yaml
 */
export function createInitialState() {
    return {
        hostname: "Switch",
        enableSecret: null,
        interfaces: {},
        vlans: {
            "1": {
                name: "default"
            }
        },
        svis: {},
        ipDefaultGateway: null,
        routes: [],
        ospf: {
            processId: null,
            networks: [],
            ifCosts: {}
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
        }
    };
}
/**
 * Deep clone device state for immutable updates
 */
export function cloneState(state) {
    return JSON.parse(JSON.stringify(state));
}
/**
 * Get a nested property from state using dot notation path
 */
export function getStatePath(state, path) {
    const parts = path.split(".");
    let current = state;
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
export function setStatePath(state, path, value) {
    const parts = path.split(".");
    let current = state;
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
export function normalizeInterfaceName(ifname) {
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
 * Ensure interface exists in state
 */
export function ensureInterface(state, ifname) {
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
