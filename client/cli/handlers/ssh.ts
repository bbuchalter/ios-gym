import { ExecutionResult, ModeType } from "../../types";
import { CLISession } from "../../cli-session";

/**
 * Handle SSH and VTY configuration commands
 */

export function handleSshUserSet(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  const username = args[action.user_from];
  const secret = args[action.secret_from];
  
  session.deviceState.ssh.users[username] = {
    secret
  };
  
  return { output: [] };
}

export function handleLineVtyEnter(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  const start = args[action.start || "start"];
  const end = args[action.end || "end"];
  const range = action.range.replace("{start}", start).replace("{end}", end);
  
  session.deviceState.ssh.vty.range = range;
  
  // Push to VTY config mode
  const targetMode = action.mode as ModeType;
  session.modeStack.push(targetMode);
  
  return { output: [] };
}

