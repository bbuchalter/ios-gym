import { ExecutionResult, ModeType } from "../../types";
import { Session } from "../../server/session";
import { setStatePath } from "../state";

/**
 * Handle basic configuration commands
 */

export function handleSet(
  session: Session,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  const path = action.path;
  const valueFrom = action.value_from;
  let value = valueFrom ? args[valueFrom] : action.value;
  
  // Parse integers for numeric fields
  if (valueFrom && args[valueFrom]) {
    const strValue = args[valueFrom];
    if (/^\d+$/.test(strValue)) {
      const numValue = parseInt(strValue, 10);
      if (!isNaN(numValue)) {
        value = numValue;
      }
    }
  }
  
  setStatePath(session.deviceState, path, value);
  
  return { output: [] };
}

export function handlePersist(
  session: Session,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  // Capture a snapshot of the current state (excluding savedState to avoid recursion)
  const { savedState, configSaved, ...stateToSave } = session.deviceState;
  session.deviceState.savedState = JSON.parse(JSON.stringify(stateToSave));
  session.deviceState.configSaved = true;
  
  const output = action.output || "Building configuration...\n[OK]";
  
  return { output: output.split("\n") };
}

