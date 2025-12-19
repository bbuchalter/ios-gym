import { ModeType, CommandGrammar } from "../types";

/**
 * Mode stack for tracking current CLI mode and context
 */
export class ModeStack {
  private stack: ModeType[] = [];
  private grammar: CommandGrammar;
  
  // Context cursors for certain modes
  public currentInterface: string | null = null;
  public currentVlan: string | null = null;
  public currentOspfProcess: number | null = null;
  
  constructor(grammar: CommandGrammar) {
    this.grammar = grammar;
    this.stack = [ModeType.USER_EXEC];
  }
  
  /**
   * Get current mode (top of stack)
   */
  public getCurrentMode(): ModeType {
    return this.stack[this.stack.length - 1];
  }
  
  /**
   * Push a new mode onto the stack
   */
  public push(mode: ModeType): void {
    this.stack.push(mode);
  }
  
  /**
   * Pop one mode from the stack
   */
  public pop(): ModeType | null {
    if (this.stack.length > 1) {
      return this.stack.pop() || null;
    }
    return null;
  }
  
  /**
   * Pop until we reach a specific mode
   */
  public popTo(mode: ModeType): void {
    while (this.stack.length > 1 && this.getCurrentMode() !== mode) {
      this.stack.pop();
    }
  }
  
  /**
   * Generate the prompt for current mode and hostname
   */
  public getPrompt(hostname: string): string {
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
  public reset(): void {
    this.stack = [ModeType.USER_EXEC];
    this.currentInterface = null;
    this.currentVlan = null;
    this.currentOspfProcess = null;
  }
  
  /**
   * Get the full stack for debugging
   */
  public getStack(): ModeType[] {
    return [...this.stack];
  }
}

