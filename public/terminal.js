// Main terminal application - orchestrates UI, WebSocket, and exercise management
import { TerminalUI } from "./terminal-ui.js";
import { WebSocketClient } from "./websocket-client.js";
import { ExerciseManager } from "./exercise-manager.js";
import { CommandHandler } from "./command-handler.js";
class IOSTerminal {
    constructor() {
        this.terminalUI = new TerminalUI("terminal");
        this.wsClient = new WebSocketClient();
        this.exerciseManager = new ExerciseManager();
        this.commandHandler = new CommandHandler();
        this.setupTerminal();
        this.setupWebSocket();
        this.setupExercises();
    }
    setupTerminal() {
        // Show welcome message
        this.terminalUI.writeln("IOS CLI Typing Trainer");
        this.terminalUI.writeln("Connecting to server...");
        this.terminalUI.writeln("");
        // Handle terminal input
        this.terminalUI.onData((data) => {
            this.handleInput(data);
        });
    }
    setupWebSocket() {
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
    setupExercises() {
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
    handleInput(data) {
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
    handleEnter() {
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
        }
        else {
            // Empty line, just show prompt again
            this.terminalUI.displayPrompt();
        }
    }
    handleTab() {
        this.wsClient.send({
            type: "tab",
            data: {
                line: this.commandHandler.getCurrentLine(),
                cursorPos: this.commandHandler.getCursorPos()
            }
        });
    }
    handleBackspace() {
        if (this.commandHandler.backspace()) {
            this.terminalUI.write("\b \b");
        }
    }
    handleCtrlC() {
        this.terminalUI.writeln("^C");
        this.commandHandler.cancel();
        this.terminalUI.displayPrompt();
    }
    handleArrowUp() {
        const line = this.commandHandler.historyUp();
        if (line !== null) {
            this.redrawLine(line);
        }
    }
    handleArrowDown() {
        const line = this.commandHandler.historyDown();
        if (line !== null) {
            this.redrawLine(line);
        }
    }
    redrawLine(newLine) {
        const oldLine = this.commandHandler.getCurrentLine();
        this.terminalUI.clearCurrentLine(oldLine.length);
        this.commandHandler.replaceCurrentLine(newLine);
        this.terminalUI.write(newLine);
    }
    handleOutputMessage(message) {
        const lines = message.data?.lines || [];
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Check if this is a caret marker line (starts with spaces and ^)
            if (i === 0 && line.match(/^\s*\^/)) {
                // Add prompt length spacing before the caret marker
                const adjustedLine = " ".repeat(this.terminalUI.getPrompt().length) + line;
                this.terminalUI.writeln(adjustedLine);
            }
            else {
                this.terminalUI.writeln(line);
            }
        }
    }
    handlePromptMessage(message) {
        const prompt = message.data?.text || "Switch> ";
        this.terminalUI.setPrompt(prompt);
        this.terminalUI.displayPrompt();
    }
    handleCompletionMessage(message) {
        const data = message.data;
        if (data.type === "complete") {
            // Single completion: auto-complete
            const value = data.value || "";
            this.commandHandler.appendToLine(value);
            this.terminalUI.write(value);
        }
        else if (data.type === "list") {
            // Multiple options: display list
            if (data.options && data.options.length > 0) {
                this.terminalUI.writeln("");
                this.terminalUI.writeln(data.options.join("  "));
                this.terminalUI.displayPrompt();
                this.terminalUI.write(this.commandHandler.getCurrentLine());
            }
        }
    }
    handleExerciseStatusMessage(message) {
        this.exerciseManager.updateStatus(message.data);
    }
    handleErrorMessage(message) {
        const errorMsg = message.data?.message || "Unknown error";
        this.terminalUI.writeln(`\r\n% Error: ${errorMsg}`);
    }
    updateConnectionStatus(status) {
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
}
else {
    new IOSTerminal();
}
