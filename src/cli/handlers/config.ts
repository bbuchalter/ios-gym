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
  // In a real system, this would save to persistent storage
  // For MVP, just acknowledge
  const output = action.output || "Building configuration...\n[OK]";
  
  return { output: output.split("\n") };
}

