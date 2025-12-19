import { ModeType } from "../types.js";
/**
 * Mode stack for tracking current CLI mode and context
 */
export class ModeStack {
    constructor(grammar) {
        this.stack = [];
        // Context cursors for certain modes
        this.currentInterface = null;
        this.currentVlan = null;
        this.currentOspfProcess = null;
        this.grammar = grammar;
        this.stack = [ModeType.USER_EXEC];
    }
    /**
     * Get current mode (top of stack)
     */
    getCurrentMode() {
        return this.stack[this.stack.length - 1];
    }
    /**
     * Push a new mode onto the stack
     */
    push(mode) {
        this.stack.push(mode);
    }
    /**
     * Pop one mode from the stack
     */
    pop() {
        if (this.stack.length > 1) {
            return this.stack.pop() || null;
        }
        return null;
    }
    /**
     * Pop until we reach a specific mode
     */
    popTo(mode) {
        while (this.stack.length > 1 && this.getCurrentMode() !== mode) {
            this.stack.pop();
        }
    }
    /**
     * Generate the prompt for current mode and hostname
     */
    getPrompt(hostname) {
        const mode = this.getCurrentMode();
        const modeConfig = this.grammar.modes[mode];
        if (!modeConfig) {
            return `${hostname}> `;
        }
        // Replace {hostname} placeholder
        let prompt = modeConfig.prompt.replace("{hostname}", hostname);
        // Add space for cleaner display
        return prompt + " ";
    }
    /**
     * Reset to USER_EXEC mode
     */
    reset() {
        this.stack = [ModeType.USER_EXEC];
        this.currentInterface = null;
        this.currentVlan = null;
        this.currentOspfProcess = null;
    }
    /**
     * Get the full stack for debugging
     */
    getStack() {
        return [...this.stack];
    }
}
