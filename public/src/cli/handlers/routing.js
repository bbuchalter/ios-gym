/**
 * Handle routing commands (static routes and OSPF)
 */
export function handleRouteAdd(session, args, action) {
    const dest = args[action.dest_from];
    const mask = args[action.mask_from];
    const nextHop = args[action.nextHop_from];
    const ad = args[action.ad_from]
        ? parseInt(args[action.ad_from], 10)
        : action.ad_default || 1;
    session.deviceState.routes.push({
        dest,
        mask,
        nextHop,
        ad
    });
    return { output: [] };
}
export function handleOspfEnter(session, args, action) {
    const pid = parseInt(args[action.pid_from], 10);
    // Set OSPF process ID
    session.deviceState.ospf.processId = pid;
    session.modeStack.currentOspfProcess = pid;
    // Push to OSPF config mode
    const targetMode = action.mode;
    session.modeStack.push(targetMode);
    return { output: [] };
}
export function handleOspfNetworkAdd(session, args, action) {
    const ip = args[action.ip_from];
    const wildcard = args[action.wildcard_from];
    const area = parseInt(args[action.area_from], 10);
    session.deviceState.ospf.networks.push({
        ip,
        wildcard,
        area
    });
    return { output: [] };
}
export function handleOspfIfCostSet(session, args, action) {
    const ifname = session.modeStack.currentInterface;
    if (!ifname) {
        return { output: ["% Not in interface configuration mode"] };
    }
    const cost = parseInt(args[action.cost_from], 10);
    session.deviceState.ospf.ifCosts[ifname] = cost;
    return { output: [] };
}
