import { normalizeInterfaceName, ensureInterface } from "../state.js";
/**
 * Handle interface configuration commands
 */
export function handleIfEnter(session, args, action) {
    const ifname = normalizeInterfaceName(args[action.if_from]);
    // Ensure interface exists
    ensureInterface(session.deviceState, ifname);
    // Set current interface cursor
    session.modeStack.currentInterface = ifname;
    // Push to interface config mode
    const targetMode = action.mode;
    session.modeStack.push(targetMode);
    return { output: [] };
}
export function handleIfSet(session, args, action) {
    const ifname = session.modeStack.currentInterface;
    if (!ifname) {
        return { output: ["% Not in interface configuration mode"] };
    }
    const iface = session.deviceState.interfaces[ifname];
    if (!iface) {
        return { output: ["% Interface not found"] };
    }
    const path = action.path;
    const valueFrom = action.value_from;
    const value = valueFrom ? args[valueFrom] : action.value;
    // Set the interface property
    iface[path] = value;
    return { output: [] };
}
export function handleIfSetIp(session, args, action) {
    const ifname = session.modeStack.currentInterface;
    if (!ifname) {
        return { output: ["% Not in interface configuration mode"] };
    }
    const iface = session.deviceState.interfaces[ifname];
    if (!iface) {
        return { output: ["% Interface not found"] };
    }
    iface.ip = args[action.ip_from];
    iface.mask = args[action.mask_from];
    return { output: [] };
}
export function handleIfSetTrunkAllowed(session, args, action) {
    const ifname = session.modeStack.currentInterface;
    if (!ifname) {
        return { output: ["% Not in interface configuration mode"] };
    }
    const iface = session.deviceState.interfaces[ifname];
    if (!iface) {
        return { output: ["% Interface not found"] };
    }
    iface.trunkAllowed = args[action.list_from];
    return { output: [] };
}
