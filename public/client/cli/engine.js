import { CommandParser } from "./parser.js";
import { TabCompleter } from "./completer.js";
import { HandlerRegistry } from "./handlers/index.js";
/**
 * Main CLI engine that coordinates parsing, completion, and execution
 */
export class CLIEngine {
    constructor(grammar) {
        this.parser = new CommandParser(grammar);
        this.completer = new TabCompleter(grammar);
        this.handlerRegistry = new HandlerRegistry(grammar.templates);
    }
    /**
     * Execute a command line
     */
    executeCommand(session, line) {
        const mode = session.modeStack.getCurrentMode();
        // Parse the command
        const parseResult = this.parser.parse(line, mode);
        if (!parseResult.success || !parseResult.command) {
            return {
                output: [parseResult.error || "% Invalid command"]
            };
        }
        // Execute the command
        const result = this.handlerRegistry.execute(session, parseResult.command, parseResult.args || {});
        return result;
    }
    /**
     * Get tab completion suggestions
     */
    getCompletion(session, line, cursorPos) {
        const mode = session.modeStack.getCurrentMode();
        const state = session.deviceState;
        return this.completer.complete(line, cursorPos, mode, state);
    }
}
