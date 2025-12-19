import { ExecutionResult, ModeType } from "../../types";
import { CLISession } from "../../cli-session";

/**
 * Handle mode transition actions
 */

export function handleModePush(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  const targetMode = action.mode as ModeType;
  session.modeStack.push(targetMode);
  
  return { output: [] };
}

export function handleModePop(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  session.modeStack.pop();
  return { output: [] };
}

export function handleModePopTo(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  const targetMode = action.mode as ModeType;
  session.modeStack.popTo(targetMode);
  
  return { output: [] };
}

export function handleSessionEnd(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  return {
    output: ["Goodbye!"],
    sessionEnd: true
  };
}

