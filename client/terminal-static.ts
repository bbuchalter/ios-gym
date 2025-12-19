// Static terminal application - no WebSocket, all logic runs in browser

import { TerminalUI } from "./terminal-ui";
import { ExerciseManager } from "./exercise-manager";
import { CommandHandler } from "./command-handler";
import { CLIEngine } from "../src/cli/engine";
import { CLISession } from "./cli-session";
import { ExerciseValidator } from "../src/exercise/validator";
import { loadGrammar, loadExercises } from "./grammar-loader";
import { CommandGrammar, ExerciseData } from "../src/types";

class StaticIOSTerminal {
  private terminalUI: TerminalUI;
  private exerciseManager: ExerciseManager;
  private commandHandler: CommandHandler;
  private cliEngine: CLIEngine | null = null;
  private session: CLISession | null = null;
  private validator: ExerciseValidator | null = null;
  
  constructor() {
    this.terminalUI = new TerminalUI("terminal");
    this.exerciseManager = new ExerciseManager();
    this.commandHandler = new CommandHandler();
    
    this.initialize();
  }
  
  private async initialize(): Promise<void> {
    this.terminalUI.writeln("IOS CLI Typing Trainer (Static Mode)");
    this.terminalUI.writeln("Loading...");
    this.terminalUI.writeln("");
    
    try {
      // Load grammar and exercises
      const [grammar, exercises] = await Promise.all([
        loadGrammar(),
        loadExercises()
      ]);
      
      // Initialize CLI components
      this.cliEngine = new CLIEngine(grammar);
      this.session = new CLISession(grammar, exercises);
      this.validator = new ExerciseValidator();
      
      // Setup terminal
      this.setupTerminal();
      
      // Setup exercises
      await this.setupExercises(exercises);
      
      this.terminalUI.writeln("Ready!");
      this.terminalUI.writeln("");
      this.terminalUI.displayPrompt();
      
    } catch (error) {
      console.error("Initialization error:", error);
      this.terminalUI.writeln("Error: Failed to initialize. Please refresh the page.");
    }
  }
  
  private setupTerminal(): void {
    this.terminalUI.onData((data: string) => {
      this.handleInput(data);
    });
  }
  
  private async setupExercises(exercisesData: ExerciseData): Promise<void> {
    // Manually set exercises since we have the data
    (this.exerciseManager as any).exercises = exercisesData.exercises;
    (this.exerciseManager as any).render();
    
    this.exerciseManager.onExerciseLoad((exerciseId) => {
      if (this.session) {
        this.session.loadExercise(exerciseId);
        this.terminalUI.writeln(`\r\n--- Exercise Loaded: ${exerciseId} ---\r\n`);
        this.terminalUI.setPrompt(this.session.getPrompt());
        this.terminalUI.displayPrompt();
        
        // Run initial validation
        this.validateExercise();
      }
    });
  }
  
  private handleInput(data: string): void {
    const code = data.charCodeAt(0);
    
    // Enter key
    if (code === 13) {
      this.handleEnter();
      return;
    }
    
    // Tab key
    if (code === 9) {
      this.handleTab();
      return;
    }
    
    // Backspace / Delete
    if (code === 127 || code === 8) {
      this.handleBackspace();
      return;
    }
    
    // Ctrl+C
    if (code === 3) {
      this.handleCtrlC();
      return;
    }
    
    // Arrow keys
    if (data === "\x1b[A") {
      this.handleArrowUp();
      return;
    }
    
    if (data === "\x1b[B") {
      this.handleArrowDown();
      return;
    }
    
    // Regular character input
    if (code >= 32 && code < 127) {
      this.commandHandler.insertChar(data);
      this.terminalUI.write(data);
    }
  }
  
  private handleEnter(): void {
    this.terminalUI.write("\r\n");
    
    const line = this.commandHandler.submitCommand();
    
    if (line.trim() && this.cliEngine && this.session) {
      // Execute command
      const result = this.cliEngine.executeCommand(this.session, line);
      
      // Display output
      if (result.output && result.output.length > 0) {
        this.displayOutput(result.output);
      }
      
      // Check for session end
      if (result.sessionEnd) {
        this.terminalUI.writeln("\r\nSession ended. Refresh page to restart.");
        return;
      }
      
      // Update prompt
      this.terminalUI.setPrompt(this.session.getPrompt());
      
      // Validate exercise if active
      this.validateExercise();
    }
    
    this.terminalUI.displayPrompt();
  }
  
  private handleTab(): void {
    if (!this.cliEngine || !this.session) return;
    
    const completion = this.cliEngine.getCompletion(
      this.session,
      this.commandHandler.getCurrentLine(),
      this.commandHandler.getCursorPos()
    );
    
    if (completion.type === "complete") {
      const value = completion.value || "";
      this.commandHandler.appendToLine(value);
      this.terminalUI.write(value);
    } else if (completion.type === "list") {
      if (completion.options && completion.options.length > 0) {
        this.terminalUI.writeln("");
        this.terminalUI.writeln(completion.options.join("  "));
        this.terminalUI.displayPrompt();
        this.terminalUI.write(this.commandHandler.getCurrentLine());
      }
    }
  }
  
  private handleBackspace(): void {
    if (this.commandHandler.backspace()) {
      this.terminalUI.write("\b \b");
    }
  }
  
  private handleCtrlC(): void {
    this.terminalUI.writeln("^C");
    this.commandHandler.cancel();
    this.terminalUI.displayPrompt();
  }
  
  private handleArrowUp(): void {
    const line = this.commandHandler.historyUp();
    if (line !== null) {
      this.redrawLine(line);
    }
  }
  
  private handleArrowDown(): void {
    const line = this.commandHandler.historyDown();
    if (line !== null) {
      this.redrawLine(line);
    }
  }
  
  private redrawLine(newLine: string): void {
    const oldLine = this.commandHandler.getCurrentLine();
    this.terminalUI.clearCurrentLine(oldLine.length);
    this.commandHandler.replaceCurrentLine(newLine);
    this.terminalUI.write(newLine);
  }
  
  private displayOutput(lines: string[]): void {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this is a caret marker line (starts with spaces and ^)
      if (i === 0 && line.match(/^\s*\^/)) {
        // Add prompt length spacing before the caret marker
        const adjustedLine = " ".repeat(this.terminalUI.getPrompt().length) + line;
        this.terminalUI.writeln(adjustedLine);
      } else {
        this.terminalUI.writeln(line);
      }
    }
  }
  
  private validateExercise(): void {
    if (!this.session || !this.validator) return;
    
    const exercise = this.session.getActiveExercise();
    if (!exercise) return;
    
    const validation = this.validator.validate(this.session.deviceState, exercise);
    
    this.exerciseManager.updateStatus({
      passed: validation.passed,
      unmetRequirements: validation.unmetRequirements,
      hints: exercise.hints
    });
  }
}

// Initialize terminal when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new StaticIOSTerminal();
  });
} else {
  new StaticIOSTerminal();
}

