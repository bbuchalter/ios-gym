// Browser-safe CLI session - no exercises, no server dependencies
import { ModeStack } from "./cli/modes.js";
import { createInitialState } from "./cli/state.js";
/**
 * CLI session for browser-based terminal emulator
 * Simplified version without exercise support
 */
export class CLISession {
    constructor(grammar) {
        this.modeStack = new ModeStack(grammar);
        this.deviceState = createInitialState();
    }
    getPrompt() {
        return this.modeStack.getPrompt(this.deviceState.hostname);
    }
}
