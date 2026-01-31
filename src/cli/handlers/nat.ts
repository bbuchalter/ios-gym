import { ExecutionResult } from "../../types";
import { CLISession } from "../../cli-session";
import { normalizeInterfaceName } from "../state";

/**
 * Handle Network Address Translation (NAT/PAT) commands
 */

/**
 * Mark interface as NAT inside
 */
export function handleNatIfInside(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  const ifname = session.modeStack.currentInterface;
  
  if (!ifname) {
    return { output: ["% Not in interface configuration mode"] };
  }
  
  if (!session.deviceState.interfaces[ifname]) {
    return { output: [`% Interface ${ifname} not found`] };
  }
  
  session.deviceState.interfaces[ifname].natInside = true;
  session.deviceState.interfaces[ifname].natOutside = false; // Can't be both
  
  return { output: [] };
}

/**
 * Mark interface as NAT outside
 */
export function handleNatIfOutside(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  const ifname = session.modeStack.currentInterface;
  
  if (!ifname) {
    return { output: ["% Not in interface configuration mode"] };
  }
  
  if (!session.deviceState.interfaces[ifname]) {
    return { output: [`% Interface ${ifname} not found`] };
  }
  
  session.deviceState.interfaces[ifname].natOutside = true;
  session.deviceState.interfaces[ifname].natInside = false; // Can't be both
  
  return { output: [] };
}

/**
 * Remove NAT inside designation
 */
export function handleNatIfRemoveInside(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  const ifname = session.modeStack.currentInterface;
  
  if (!ifname) {
    return { output: ["% Not in interface configuration mode"] };
  }
  
  if (!session.deviceState.interfaces[ifname]) {
    return { output: [`% Interface ${ifname} not found`] };
  }
  
  session.deviceState.interfaces[ifname].natInside = undefined;
  
  return { output: [] };
}

/**
 * Remove NAT outside designation
 */
export function handleNatIfRemoveOutside(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  const ifname = session.modeStack.currentInterface;
  
  if (!ifname) {
    return { output: ["% Not in interface configuration mode"] };
  }
  
  if (!session.deviceState.interfaces[ifname]) {
    return { output: [`% Interface ${ifname} not found`] };
  }
  
  session.deviceState.interfaces[ifname].natOutside = undefined;
  
  return { output: [] };
}

/**
 * Enable PAT (overload)
 */
export function handleNatOverloadEnable(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  const acl = parseInt(args[action.acl_from], 10);
  const ifname = normalizeInterfaceName(args[action.interface_from]);
  
  session.deviceState.nat.overload = true;
  session.deviceState.nat.overloadAcl = acl;
  session.deviceState.nat.overloadInterface = ifname;
  
  return { output: [] };
}

/**
 * Disable PAT (overload)
 */
export function handleNatOverloadDisable(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  session.deviceState.nat.overload = false;
  session.deviceState.nat.overloadAcl = undefined;
  session.deviceState.nat.overloadInterface = undefined;
  
  return { output: [] };
}

/**
 * Add static NAT mapping
 */
export function handleNatStaticAdd(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  const insideLocal = args[action.inside_local_from];
  const insideGlobal = args[action.inside_global_from];
  
  // Check if mapping already exists
  const exists = session.deviceState.nat.staticMappings.some(
    m => m.insideLocal === insideLocal && m.insideGlobal === insideGlobal
  );
  
  if (!exists) {
    session.deviceState.nat.staticMappings.push({
      insideLocal,
      insideGlobal
    });
  }
  
  return { output: [] };
}

/**
 * Remove static NAT mapping
 */
export function handleNatStaticRemove(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  const insideLocal = args[action.inside_local_from];
  const insideGlobal = args[action.inside_global_from];
  
  session.deviceState.nat.staticMappings = session.deviceState.nat.staticMappings.filter(
    m => !(m.insideLocal === insideLocal && m.insideGlobal === insideGlobal)
  );
  
  return { output: [] };
}
