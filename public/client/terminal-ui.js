// Terminal UI wrapper for xterm.js
export class TerminalUI {
    constructor(containerId) {
        this.prompt = "Switch> ";
        this.initTerminal(containerId);
    }
    initTerminal(containerId) {
        // Create terminal instance
        this.term = new Terminal({
            cursorBlink: true,
            theme: {
                background: "#1e1e1e",
                foreground: "#d4d4d4",
                cursor: "#ffffff",
                selection: "#264f78",
                black: "#000000",
                red: "#cd3131",
                green: "#0dbc79",
                yellow: "#e5e510",
                blue: "#2472c8",
                magenta: "#bc3fbc",
                cyan: "#11a8cd",
                white: "#e5e5e5",
                brightBlack: "#666666",
                brightRed: "#f14c4c",
                brightGreen: "#23d18b",
                brightYellow: "#f5f543",
                brightBlue: "#3b8eea",
                brightMagenta: "#d670d6",
                brightCyan: "#29b8db",
                brightWhite: "#ffffff"
            },
            fontFamily: "'Courier New', Courier, monospace",
            fontSize: 14,
            lineHeight: 1.2
        });
        // Add fit addon
        this.fitAddon = new FitAddon.FitAddon();
        this.term.loadAddon(this.fitAddon);
        // Open terminal in DOM
        const container = document.getElementById(containerId);
        if (container) {
            this.term.open(container);
            this.fitAddon.fit();
        }
        // Handle window resize
        window.addEventListener("resize", () => {
            this.fitAddon.fit();
        });
        // Handle terminal input
        this.term.onData((data) => {
            if (this.onDataCallback) {
                this.onDataCallback(data);
            }
        });
    }
    onData(callback) {
        this.onDataCallback = callback;
    }
    write(text) {
        this.term.write(text);
    }
    writeln(text) {
        this.term.writeln(text);
        this.scrollToBottom();
    }
    writeLines(lines) {
        for (const line of lines) {
            this.term.writeln(line);
        }
        this.scrollToBottom();
    }
    setPrompt(prompt) {
        this.prompt = prompt;
    }
    getPrompt() {
        return this.prompt;
    }
    displayPrompt() {
        this.term.write(this.prompt);
        this.scrollToBottom();
    }
    clearCurrentLine(lineLength) {
        this.term.write("\r" + this.prompt + " ".repeat(lineLength) + "\r" + this.prompt);
    }
    clear() {
        this.term.clear();
    }
    fit() {
        this.fitAddon.fit();
    }
    scrollToBottom() {
        // Scroll the xterm viewport to show the bottom (current line)
        if (this.term.element) {
            const viewport = this.term.element.querySelector('.xterm-viewport');
            if (viewport) {
                viewport.scrollTop = viewport.scrollHeight;
            }
        }
    }
}
