/**
 * Handle mode transition actions
 */
export function handleModePush(session, args, action) {
    const targetMode = action.mode;
    session.modeStack.push(targetMode);
    return { output: [] };
}
export function handleModePop(session, args, action) {
    session.modeStack.pop();
    return { output: [] };
}
export function handleModePopTo(session, args, action) {
    const targetMode = action.mode;
    session.modeStack.popTo(targetMode);
    return { output: [] };
}
export function handleSessionEnd(session, args, action) {
    return {
        output: ["Goodbye!"],
        sessionEnd: true
    };
}
