import { CommandGrammar, ExecutionResult, CompletionResult } from "../types";
import { Session } from "../server/session";
import { CommandParser } from "./parser";
import { TabCompleter } from "./completer";
import { HandlerRegistry } from "./handlers";

/**
 * Main CLI engine that coordinates parsing, completion, and execution
 */
export class CLIEngine {
  private parser: CommandParser;
  private completer: TabCompleter;
  private handlerRegistry: HandlerRegistry;
  
  constructor(grammar: CommandGrammar) {
    this.parser = new CommandParser(grammar);
    this.completer = new TabCompleter(grammar);
    this.handlerRegistry = new HandlerRegistry(grammar.templates);
  }
  
  /**
   * Execute a command line
   */
  public executeCommand(session: Session, line: string): ExecutionResult {
    const mode = session.modeStack.getCurrentMode();
    
    // Parse the command
    const parseResult = this.parser.parse(line, mode);
    
    if (!parseResult.success || !parseResult.command) {
      return {
        output: [parseResult.error || "% Invalid command"]
      };
    }
    
    // Execute the command
    const result = this.handlerRegistry.execute(
      session,
      parseResult.command,
      parseResult.args || {}
    );
    
    return result;
  }
  
  /**
   * Get tab completion suggestions
   */
  public getCompletion(
    session: Session,
    line: string,
    cursorPos: number
  ): CompletionResult {
    const mode = session.modeStack.getCurrentMode();
    const state = session.deviceState;
    
    return this.completer.complete(line, cursorPos, mode, state);
  }
}

