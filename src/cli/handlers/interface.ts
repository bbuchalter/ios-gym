import { ExecutionResult, ModeType } from "../../types";
import { CLISession } from "../../cli-session";
import { normalizeInterfaceName, ensureInterface, isValidInterface } from "../state";

/**
 * Handle interface configuration commands
 */

export function handleIfEnter(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  const ifname = normalizeInterfaceName(args[action.if_from]);
  
  // Validate interface exists for this device model
  if (!isValidInterface(session.deviceState, ifname)) {
    // Calculate error marker position:
    // The Terminal component automatically adds spaces equal to prompt length
    // for error markers, so we only need to account for the command text
    const commandText = "interface ";
    const spaces = " ".repeat(commandText.length);
    
    return { 
      output: [
        `${spaces}^`,
        `% Invalid input detected at '^' marker.`
      ] 
    };
  }
  
  // Ensure interface exists (will create if valid but not yet created)
  ensureInterface(session.deviceState, ifname);
  
  // Set current interface cursor
  session.modeStack.currentInterface = ifname;
  
  // Push to interface config mode
  const targetMode = action.mode as ModeType;
  session.modeStack.push(targetMode);
  
  return { output: [] };
}

export function handleIfSet(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
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
  (iface as any)[path] = value;
  
  return { output: [] };
}

export function handleIfSetIp(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
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

export function handleIfSetTrunkAllowed(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
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

