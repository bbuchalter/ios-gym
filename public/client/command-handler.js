// Command input handling and history management
export class CommandHandler {
    constructor() {
        this.currentLine = "";
        this.cursorPos = 0;
        this.commandHistory = [];
        this.historyIndex = -1;
    }
    getCurrentLine() {
        return this.currentLine;
    }
    getCursorPos() {
        return this.cursorPos;
    }
    insertChar(char) {
        this.currentLine =
            this.currentLine.slice(0, this.cursorPos) +
                char +
                this.currentLine.slice(this.cursorPos);
        this.cursorPos++;
    }
    backspace() {
        if (this.cursorPos > 0) {
            this.currentLine =
                this.currentLine.slice(0, this.cursorPos - 1) +
                    this.currentLine.slice(this.cursorPos);
            this.cursorPos--;
            return true;
        }
        return false;
    }
    submitCommand() {
        const line = this.currentLine;
        if (line.trim()) {
            this.commandHistory.push(line);
            this.historyIndex = this.commandHistory.length;
        }
        this.currentLine = "";
        this.cursorPos = 0;
        return line;
    }
    cancel() {
        this.currentLine = "";
        this.cursorPos = 0;
    }
    replaceCurrentLine(newLine) {
        const oldLine = this.currentLine;
        this.currentLine = newLine;
        this.cursorPos = newLine.length;
        return oldLine;
    }
    historyUp() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const line = this.commandHistory[this.historyIndex];
            this.currentLine = line;
            this.cursorPos = line.length;
            return line;
        }
        return null;
    }
    historyDown() {
        if (this.historyIndex < this.commandHistory.length - 1) {
            this.historyIndex++;
            const line = this.commandHistory[this.historyIndex];
            this.currentLine = line;
            this.cursorPos = line.length;
            return line;
        }
        else if (this.historyIndex < this.commandHistory.length) {
            this.historyIndex = this.commandHistory.length;
            this.currentLine = "";
            this.cursorPos = 0;
            return "";
        }
        return null;
    }
    appendToLine(text) {
        this.currentLine += text;
        this.cursorPos += text.length;
    }
    getHistory() {
        return [...this.commandHistory];
    }
    clearHistory() {
        this.commandHistory = [];
        this.historyIndex = -1;
    }
}
