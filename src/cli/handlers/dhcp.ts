import { ExecutionResult, ModeType } from "../../types";
import { CLISession } from "../../cli-session";

/**
 * Handle ip dhcp excluded-address command
 */
export function handleDhcpExcludedAddress(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  const start = args[action.start_from] || args["start"];
  const end = args[action.end_from] || args["end"] || start; // If no end, use start (single address)
  
  session.deviceState.dhcp.excludedAddresses.push({ start, end });
  
  return { output: [] };
}

/**
 * Handle no ip dhcp excluded-address command
 */
export function handleDhcpRemoveExcludedAddress(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  const start = args[action.start_from] || args["start"];
  const end = args[action.end_from] || args["end"] || start;
  
  session.deviceState.dhcp.excludedAddresses = session.deviceState.dhcp.excludedAddresses.filter(
    range => !(range.start === start && range.end === end)
  );
  
  return { output: [] };
}

/**
 * Handle ip dhcp pool command - enter DHCP pool config mode
 */
export function handleDhcpPoolEnter(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  const poolName = args[action.name_from] || args["name"];
  
  // Create pool if it doesn't exist
  if (!session.deviceState.dhcp.pools[poolName]) {
    session.deviceState.dhcp.pools[poolName] = {
      name: poolName
    };
  }
  
  // Set current pool cursor for subsequent commands
  session.modeStack.currentDhcpPool = poolName;
  
  // Push to DHCP pool config mode
  session.modeStack.push(ModeType.DHCP_POOL_CONFIG);
  
  return { output: [], newMode: ModeType.DHCP_POOL_CONFIG };
}

/**
 * Handle no ip dhcp pool command - remove pool
 */
export function handleDhcpPoolRemove(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  const poolName = args[action.name_from] || args["name"];
  
  delete session.deviceState.dhcp.pools[poolName];
  
  return { output: [] };
}

/**
 * Handle network command within DHCP pool config
 */
export function handleDhcpPoolNetwork(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  const poolName = session.modeStack.currentDhcpPool;
  
  if (!poolName || !session.deviceState.dhcp.pools[poolName]) {
    return { output: ["% No DHCP pool selected"] };
  }
  
  const network = args[action.network_from] || args["network"];
  const mask = args[action.mask_from] || args["mask"];
  
  session.deviceState.dhcp.pools[poolName].network = network;
  session.deviceState.dhcp.pools[poolName].mask = mask;
  
  return { output: [] };
}

/**
 * Handle default-router command within DHCP pool config
 */
export function handleDhcpPoolDefaultRouter(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  const poolName = session.modeStack.currentDhcpPool;
  
  if (!poolName || !session.deviceState.dhcp.pools[poolName]) {
    return { output: ["% No DHCP pool selected"] };
  }
  
  const gateway = args[action.gateway_from] || args["gateway"];
  session.deviceState.dhcp.pools[poolName].defaultRouter = gateway;
  
  return { output: [] };
}

/**
 * Handle dns-server command within DHCP pool config
 */
export function handleDhcpPoolDnsServer(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  const poolName = session.modeStack.currentDhcpPool;
  
  if (!poolName || !session.deviceState.dhcp.pools[poolName]) {
    return { output: ["% No DHCP pool selected"] };
  }
  
  const dns = args[action.dns_from] || args["dns"];
  session.deviceState.dhcp.pools[poolName].dnsServer = dns;
  
  return { output: [] };
}
