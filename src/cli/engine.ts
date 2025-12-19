import { CommandGrammar, ExecutionResult, CompletionResult } from "../types";
import { CLISession } from "../cli-session";
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
  public executeCommand(session: CLISession, line: string): ExecutionResult {
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
    
    // Store password prompt state if present
    if (result.passwordPrompt) {
      session.pendingPasswordPrompt = {
        handler: result.passwordPrompt.handler,
        handlerArgs: result.passwordPrompt.handlerArgs
      };
    }
    
    return result;
  }
  
  /**
   * Submit password for pending password prompt
   */
  public submitPassword(session: CLISession, password: string): ExecutionResult {
    if (!session.pendingPasswordPrompt) {
      return {
        output: ["% No password prompt pending"]
      };
    }
    
    const currentAttempts = session.pendingPasswordPrompt.attempts || 0;
    
    const result = this.handlerRegistry.executePasswordHandler(
      session,
      password,
      session.pendingPasswordPrompt.handler,
      session.pendingPasswordPrompt.handlerArgs
    );
    
    // If result has a password prompt, update attempts count
    if (result.passwordPrompt) {
      session.pendingPasswordPrompt = {
        handler: result.passwordPrompt.handler,
        handlerArgs: result.passwordPrompt.handlerArgs,
        attempts: currentAttempts + 1
      };
    } else {
      // Clear pending prompt if no re-prompt
      session.pendingPasswordPrompt = null;
    }
    
    return result;
  }
  
  /**
   * Get tab completion suggestions
   */
  public getCompletion(
    session: CLISession,
    line: string,
    cursorPos: number
  ): CompletionResult {
    const mode = session.modeStack.getCurrentMode();
    const state = session.deviceState;
    
    return this.completer.complete(line, cursorPos, mode, state);
  }
}

