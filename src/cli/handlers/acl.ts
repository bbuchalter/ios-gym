import { ExecutionResult, AccessList, StandardAclEntry, ExtendedAclEntry } from "../../types";
import { CLISession } from "../../cli-session";

/**
 * Handle Access Control List (ACL) commands
 */

/**
 * Add a standard ACL entry (1-99)
 */
export function handleAclAddStd(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  const number = parseInt(args[action.number_from], 10);
  const aclAction = args[action.action_from] as 'permit' | 'deny';
  
  // Determine source
  let source: string;
  let sourceWildcard: string | undefined;
  
  if (action.source === 'any') {
    source = 'any';
  } else if (action.source === 'host') {
    source = `host ${args[action.source_ip_from]}`;
  } else {
    // Network with wildcard
    source = args[action.source_ip_from];
    sourceWildcard = args[action.source_wildcard_from];
  }
  
  const entry: StandardAclEntry = {
    action: aclAction,
    source,
    sourceWildcard
  };
  
  // Ensure ACL exists
  if (!session.deviceState.accessLists[number]) {
    session.deviceState.accessLists[number] = {
      number,
      type: 'standard',
      entries: []
    };
  }
  
  // Add entry
  (session.deviceState.accessLists[number] as AccessList).entries.push(entry);
  
  return { output: [] };
}

/**
 * Add an extended ACL entry (100-199)
 */
export function handleAclAddExt(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  const number = parseInt(args[action.number_from], 10);
  const aclAction = args[action.action_from] as 'permit' | 'deny';
  const protocol = args[action.protocol_from];
  
  // Determine source
  let source: string;
  let sourceWildcard: string | undefined;
  
  if (action.source === 'any') {
    source = 'any';
  } else if (action.source === 'host') {
    source = `host ${args[action.source_ip_from]}`;
  } else if (args[action.source_ip_from]) {
    source = args[action.source_ip_from];
    sourceWildcard = args[action.source_wildcard_from];
  } else {
    source = 'any';
  }
  
  // Determine destination
  let destination: string;
  let destWildcard: string | undefined;
  
  if (action.destination === 'any') {
    destination = 'any';
  } else if (action.destination === 'host') {
    destination = `host ${args[action.dest_ip_from]}`;
  } else if (args[action.dest_ip_from]) {
    destination = args[action.dest_ip_from];
    destWildcard = args[action.dest_wildcard_from];
  } else {
    destination = 'any';
  }
  
  const entry: ExtendedAclEntry = {
    action: aclAction,
    protocol,
    source,
    sourceWildcard,
    destination,
    destWildcard
  };
  
  // Ensure ACL exists
  if (!session.deviceState.accessLists[number]) {
    session.deviceState.accessLists[number] = {
      number,
      type: 'extended',
      entries: []
    };
  }
  
  // Add entry
  (session.deviceState.accessLists[number] as AccessList).entries.push(entry);
  
  return { output: [] };
}

/**
 * Remove an entire ACL
 */
export function handleAclRemove(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  const number = parseInt(args[action.number_from], 10);
  
  delete session.deviceState.accessLists[number];
  
  return { output: [] };
}

/**
 * Apply ACL to interface
 */
export function handleAclApply(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  const ifname = session.modeStack.currentInterface;
  
  if (!ifname) {
    return { output: ["% Not in interface configuration mode"] };
  }
  
  const number = parseInt(args[action.number_from], 10);
  const direction = action.direction as 'in' | 'out';
  
  // Ensure interface exists in state
  if (!session.deviceState.interfaces[ifname]) {
    return { output: [`% Interface ${ifname} not found`] };
  }
  
  if (direction === 'in') {
    session.deviceState.interfaces[ifname].accessGroupIn = number;
  } else {
    session.deviceState.interfaces[ifname].accessGroupOut = number;
  }
  
  return { output: [] };
}

/**
 * Remove ACL from interface
 */
export function handleAclRemoveApply(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  const ifname = session.modeStack.currentInterface;
  
  if (!ifname) {
    return { output: ["% Not in interface configuration mode"] };
  }
  
  const direction = action.direction as 'in' | 'out';
  
  // Ensure interface exists in state
  if (!session.deviceState.interfaces[ifname]) {
    return { output: [`% Interface ${ifname} not found`] };
  }
  
  if (direction === 'in') {
    session.deviceState.interfaces[ifname].accessGroupIn = undefined;
  } else {
    session.deviceState.interfaces[ifname].accessGroupOut = undefined;
  }
  
  return { output: [] };
}
