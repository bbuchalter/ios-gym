import { ExecutionResult, ModeType } from "../../types";
import { Session } from "../../server/session";

/**
 * Handle mode transition actions
 */

export function handleModePush(
  session: Session,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  const targetMode = action.mode as ModeType;
  session.modeStack.push(targetMode);
  
  return { output: [] };
}

export function handleModePop(
  session: Session,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  session.modeStack.pop();
  return { output: [] };
}

export function handleModePopTo(
  session: Session,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  const targetMode = action.mode as ModeType;
  session.modeStack.popTo(targetMode);
  
  return { output: [] };
}

export function handleSessionEnd(
  session: Session,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  return {
    output: ["Goodbye!"],
    sessionEnd: true
  };
}

