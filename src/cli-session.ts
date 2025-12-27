// Browser-safe CLI session - no exercises, no server dependencies

import { ModeStack } from "./cli/modes";
import { DeviceState, CommandGrammar, DeviceModel } from "./types";
import { createInitialState } from "./cli/state";

/**
 * CLI session for browser-based terminal emulator
 * Simplified version without exercise support
 */
export class CLISession {
  public modeStack: ModeStack;
  public deviceState: DeviceState;
  public pendingPasswordPrompt: {
    handler: string;
    handlerArgs?: Record<string, any>;
    attempts?: number;
  } | null = null;
  
  /**
   * Create a new CLI session
   * @param grammar - Command grammar defining available commands and templates
   * @param deviceModel - Optional device model override (defaults to grammar.deviceModel)
   */
  constructor(grammar: CommandGrammar, deviceModel?: DeviceModel) {
    this.modeStack = new ModeStack(grammar);
    
    // Use deviceModel from grammar if not explicitly provided
    const model = deviceModel ?? grammar.deviceModel;
    this.deviceState = createInitialState(model);
    
    // Validate that device model matches grammar (warn if mismatch)
    if (this.deviceState.deviceModel !== grammar.deviceModel) {
      console.warn(
        `Device model mismatch: state=${this.deviceState.deviceModel}, grammar=${grammar.deviceModel}`
      );
    }
  }
  
  public getPrompt(): string {
    return this.modeStack.getPrompt(this.deviceState.hostname);
  }
}

