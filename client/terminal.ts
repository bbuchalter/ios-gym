// Main terminal application - orchestrates UI, WebSocket, and exercise management

import { TerminalUI } from "./terminal-ui";
import { WebSocketClient, WSMessage } from "./websocket-client";
import { ExerciseManager } from "./exercise-manager";
import { CommandHandler } from "./command-handler";

class IOSTerminal {
  private terminalUI: TerminalUI;
  private wsClient: WebSocketClient;
  private exerciseManager: ExerciseManager;
  private commandHandler: CommandHandler;
  
  constructor() {
    this.terminalUI = new TerminalUI("terminal");
    this.wsClient = new WebSocketClient();
    this.exerciseManager = new ExerciseManager();
    this.commandHandler = new CommandHandler();
    
    this.setupTerminal();
    this.setupWebSocket();
    this.setupExercises();
  }
  
  private setupTerminal(): void {
    // Show welcome message
    this.terminalUI.writeln("IOS CLI Typing Trainer");
    this.terminalUI.writeln("Connecting to server...");
    this.terminalUI.writeln("");
    
    // Handle terminal input
    this.terminalUI.onData((data: string) => {
      this.handleInput(data);
    });
  }
  
  private setupWebSocket(): void {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}`;
    
    this.wsClient.onOpen(() => {
      this.updateConnectionStatus("connected");
      this.terminalUI.writeln("Connected to server.");
      this.terminalUI.writeln("");
    });
    
    this.wsClient.onClose(() => {
      this.updateConnectionStatus("disconnected");
      this.terminalUI.writeln("\r\n\r\nDisconnected from server.");
    });
    
    this.wsClient.onError((error) => {
      console.error("WebSocket error:", error);
      this.updateConnectionStatus("disconnected");
    });
    
    // Register message handlers
    this.wsClient.on("output", (msg) => this.handleOutputMessage(msg));
    this.wsClient.on("prompt", (msg) => this.handlePromptMessage(msg));
    this.wsClient.on("completion", (msg) => this.handleCompletionMessage(msg));
    this.wsClient.on("exercise_status", (msg) => this.handleExerciseStatusMessage(msg));
    this.wsClient.on("error", (msg) => this.handleErrorMessage(msg));
    
    this.wsClient.connect(wsUrl);
  }
  
  private setupExercises(): void {
    this.exerciseManager.loadExercises();
    
    this.exerciseManager.onExerciseLoad((exerciseId) => {
      // Send load exercise message to server
      this.wsClient.send({
        type: "load_exercise",
        data: { exerciseId }
      });
      
      // Show notification in terminal
      const exercise = this.exerciseManager.getExercises().find(ex => ex.id === exerciseId);
      if (exercise) {
        this.terminalUI.writeln(`\r\n--- Exercise Loaded: ${exercise.title} ---\r\n`);
        this.terminalUI.displayPrompt();
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
    if (data === "\x1b[A") { // Up arrow
      this.handleArrowUp();
      return;
    }
    
    if (data === "\x1b[B") { // Down arrow
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
    
    if (line.trim()) {
      // Send to server
      this.wsClient.send({
        type: "command",
        data: { 
          line: line,
          promptLength: this.terminalUI.getPrompt().length
        }
      });
    } else {
      // Empty line, just show prompt again
      this.terminalUI.displayPrompt();
    }
  }
  
  private handleTab(): void {
    this.wsClient.send({
      type: "tab",
      data: {
        line: this.commandHandler.getCurrentLine(),
        cursorPos: this.commandHandler.getCursorPos()
      }
    });
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
  
  private handleOutputMessage(message: WSMessage): void {
    const lines = message.data?.lines || [];
    
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
  
  private handlePromptMessage(message: WSMessage): void {
    const prompt = message.data?.text || "Switch> ";
    this.terminalUI.setPrompt(prompt);
    this.terminalUI.displayPrompt();
  }
  
  private handleCompletionMessage(message: WSMessage): void {
    const data = message.data;
    
    if (data.type === "complete") {
      // Single completion: auto-complete
      const value = data.value || "";
      this.commandHandler.appendToLine(value);
      this.terminalUI.write(value);
    } else if (data.type === "list") {
      // Multiple options: display list
      if (data.options && data.options.length > 0) {
        this.terminalUI.writeln("");
        this.terminalUI.writeln(data.options.join("  "));
        this.terminalUI.displayPrompt();
        this.terminalUI.write(this.commandHandler.getCurrentLine());
      }
    }
  }
  
  private handleExerciseStatusMessage(message: WSMessage): void {
    this.exerciseManager.updateStatus(message.data);
  }
  
  private handleErrorMessage(message: WSMessage): void {
    const errorMsg = message.data?.message || "Unknown error";
    this.terminalUI.writeln(`\r\n% Error: ${errorMsg}`);
  }
  
  private updateConnectionStatus(status: "connected" | "disconnected"): void {
    const statusEl = document.getElementById("connection-status");
    if (statusEl) {
      statusEl.textContent = status === "connected" ? "Connected" : "Disconnected";
      statusEl.className = status;
    }
  }
}

// Initialize terminal when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    new IOSTerminal();
  });
} else {
  new IOSTerminal();
}
