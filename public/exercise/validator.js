import { normalizeInterfaceName, getStatePath } from "../cli/state.js";
/**
 * Exercise validation engine
 */
export class ExerciseValidator {
    /**
     * Validate device state against exercise requirements
     */
    validate(state, exercise) {
        const unmetRequirements = [];
        for (const req of exercise.requirements) {
            if (!this.checkRequirement(state, req)) {
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
    checkRequirement(state, req) {
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
            default:
                console.warn(`Unknown requirement type: ${req.type}`);
                return false;
        }
    }
    checkStateEquals(state, req) {
        const value = getStatePath(state, req.path);
        // Deep equality check for arrays
        if (Array.isArray(req.value)) {
            return JSON.stringify(value) === JSON.stringify(req.value);
        }
        return value === req.value;
    }
    checkVlanExists(state, req) {
        return !!state.vlans[req.vlan];
    }
    checkIfAccessVlanEquals(state, req) {
        const ifname = normalizeInterfaceName(req.ifname);
        const iface = state.interfaces[ifname];
        if (!iface)
            return false;
        return iface.accessVlan === req.vlan;
    }
    checkIfTrunkAllowedEquals(state, req) {
        const ifname = normalizeInterfaceName(req.ifname);
        const iface = state.interfaces[ifname];
        if (!iface || !iface.trunkAllowed)
            return false;
        // Parse the trunk allowed list
        const allowed = iface.trunkAllowed.split(",").map((v) => v.trim());
        const expected = req.vlans || [];
        if (allowed.length !== expected.length)
            return false;
        return expected.every((v) => allowed.includes(v));
    }
    checkIfL2ModeEquals(state, req) {
        const ifname = normalizeInterfaceName(req.ifname);
        const iface = state.interfaces[ifname];
        if (!iface)
            return false;
        return iface.l2mode === req.l2mode;
    }
    checkIfIpEquals(state, req) {
        const ifname = normalizeInterfaceName(req.ifname);
        const iface = state.interfaces[ifname];
        if (!iface)
            return false;
        return iface.ip === req.ip && iface.mask === req.mask;
    }
    checkIfAdminUp(state, req) {
        const ifname = normalizeInterfaceName(req.ifname);
        const iface = state.interfaces[ifname];
        if (!iface)
            return false;
        return iface.adminUp === true;
    }
    checkSviIpEquals(state, req) {
        // SVIs are stored as regular interfaces with "vlan" prefix
        const ifname = `vlan${req.vlan}`;
        const iface = state.interfaces[ifname];
        if (!iface)
            return false;
        return iface.ip === req.ip && iface.mask === req.mask;
    }
    checkRouteExists(state, req) {
        return state.routes.some(route => route.dest === req.dest &&
            route.mask === req.mask &&
            route.nextHop === req.nextHop &&
            route.ad === req.ad);
    }
    checkOspfProcessEquals(state, req) {
        return state.ospf.processId === req.value;
    }
    checkOspfNetworkExists(state, req) {
        return state.ospf.networks.some(network => network.ip === req.ip &&
            network.wildcard === req.wildcard &&
            network.area === req.area);
    }
    checkOspfIfCostEquals(state, req) {
        const ifname = normalizeInterfaceName(req.ifname);
        return state.ospf.ifCosts[ifname] === req.cost;
    }
    checkSshUserSecretEquals(state, req) {
        const user = state.ssh.users[req.user];
        if (!user)
            return false;
        return user.secret === req.secret;
    }
    /**
     * Generate a human-readable description of an unmet requirement
     */
    describeUnmetRequirement(req) {
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
            default:
                return {
                    type: req.type,
                    description: `Unknown requirement type: ${req.type}`
                };
        }
    }
}
