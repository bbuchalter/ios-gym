// Browser-safe CLI session - no exercises, no server dependencies

import { ModeStack } from "./cli/modes";
import { DeviceState, CommandGrammar } from "./types";
import { createInitialState } from "./cli/state";

/**
 * CLI session for browser-based terminal emulator
 * Simplified version without exercise support
 */
export class CLISession {
  public modeStack: ModeStack;
  public deviceState: DeviceState;
  
  constructor(grammar: CommandGrammar) {
    this.modeStack = new ModeStack(grammar);
    this.deviceState = createInitialState();
  }
  
  public getPrompt(): string {
    return this.modeStack.getPrompt(this.deviceState.hostname);
  }
}

