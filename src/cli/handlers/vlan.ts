import { ExecutionResult } from "../../types";
import { CLISession } from "../../cli-session";

/**
 * Handle VLAN configuration commands
 */

export function handleVlanEnter(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  const vlanId = args[action.vlan_from];
  
  // Create VLAN if it doesn't exist
  if (!session.deviceState.vlans[vlanId]) {
    session.deviceState.vlans[vlanId] = {
      name: `VLAN${vlanId.padStart(4, "0")}`
    };
  }
  
  // Set current VLAN cursor
  session.modeStack.currentVlan = vlanId;
  
  return { output: [] };
}

export function handleVlanSetName(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  const vlanId = session.modeStack.currentVlan;
  
  if (!vlanId) {
    return { output: ["% Not in VLAN context"] };
  }
  
  const vlan = session.deviceState.vlans[vlanId];
  
  if (!vlan) {
    return { output: ["% VLAN not found"] };
  }
  
  vlan.name = args[action.name_from];
  
  return { output: [] };
}

