import { setStatePath } from "../state.js";
/**
 * Handle basic configuration commands
 */
export function handleSet(session, args, action) {
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
export function handlePersist(session, args, action) {
    // Capture a snapshot of the current state (excluding savedState to avoid recursion)
    const { savedState, configSaved, ...stateToSave } = session.deviceState;
    session.deviceState.savedState = JSON.parse(JSON.stringify(stateToSave));
    session.deviceState.configSaved = true;
    const output = action.output || "Building configuration...\n[OK]";
    return { output: output.split("\n") };
}
