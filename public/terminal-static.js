// Static terminal application - no WebSocket, all logic runs in browser
import { TerminalUI } from "./terminal-ui.js";
import { ExerciseManager } from "./exercise-manager.js";
import { CommandHandler } from "./command-handler.js";
import { CLIEngine } from "./cli/engine.js";
import { CLISession } from "./cli-session.js";
import { ExerciseValidator } from "./exercise/validator.js";
import { loadGrammar, loadExercises } from "./grammar-loader.js";
class StaticIOSTerminal {
    constructor() {
        this.cliEngine = null;
        this.session = null;
        this.validator = null;
        this.terminalUI = new TerminalUI("terminal");
        this.exerciseManager = new ExerciseManager();
        this.commandHandler = new CommandHandler();
        this.initialize();
    }
    async initialize() {
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
        }
        catch (error) {
            console.error("Initialization error:", error);
            this.terminalUI.writeln("Error: Failed to initialize. Please refresh the page.");
        }
    }
    setupTerminal() {
        this.terminalUI.onData((data) => {
            this.handleInput(data);
        });
    }
    async setupExercises(exercisesData) {
        // Manually set exercises since we have the data
        this.exerciseManager.exercises = exercisesData.exercises;
        this.exerciseManager.render();
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
    handleEnter() {
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
    handleTab() {
        if (!this.cliEngine || !this.session)
            return;
        const completion = this.cliEngine.getCompletion(this.session, this.commandHandler.getCurrentLine(), this.commandHandler.getCursorPos());
        if (completion.type === "complete") {
            const value = completion.value || "";
            this.commandHandler.appendToLine(value);
            this.terminalUI.write(value);
        }
        else if (completion.type === "list") {
            if (completion.options && completion.options.length > 0) {
                this.terminalUI.writeln("");
                this.terminalUI.writeln(completion.options.join("  "));
                this.terminalUI.displayPrompt();
                this.terminalUI.write(this.commandHandler.getCurrentLine());
            }
        }
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
    displayOutput(lines) {
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
    validateExercise() {
        if (!this.session || !this.validator)
            return;
        const exercise = this.session.getActiveExercise();
        if (!exercise)
            return;
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
}
else {
    new StaticIOSTerminal();
}
