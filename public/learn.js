// Integrated Learning Experience - Multiple Independent Terminals

import { CLIEngine } from '../src/cli/engine.js';
import { CLISession } from './cli-session.js';
import { loadGrammar, loadExercises } from './grammar-loader.js';

class LearnTerminal {
  constructor(elementId) {
    this.elementId = elementId;
    this.terminal = null;
    this.fitAddon = null;
    this.session = null;
    this.engine = null;
    this.currentLine = '';
    this.cursorPos = 0;
    this.history = [];
    this.historyIndex = -1;
    this.sessionEnded = false;
    this.grammar = null;
    this.exercises = null;
  }

  async initialize(grammar, exercises) {
    // Store grammar and exercises for restart
    this.grammar = grammar;
    this.exercises = exercises;

    const container = document.getElementById(this.elementId);
    if (!container) {
      console.error(`Terminal container ${this.elementId} not found`);
      return;
    }

    // Remove loading state
    container.classList.remove('loading');

    // Create terminal instance if it doesn't exist
    if (!this.terminal) {
      this.terminal = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        fontFamily: '"Courier New", Courier, monospace',
        theme: {
          background: '#1e1e1e',
          foreground: '#d4d4d4',
          cursor: '#4ec9b0',
          selection: '#264f78'
        },
        cols: 80,
        rows: 20
      });

      // Create fit addon
      this.fitAddon = new FitAddon.FitAddon();
      this.terminal.loadAddon(this.fitAddon);

      // Open terminal
      this.terminal.open(container);
      this.fitAddon.fit();
    }

    // Initialize CLI components
    this.engine = new CLIEngine(grammar);
    this.session = new CLISession(grammar, exercises);

    // Setup terminal handlers
    this.setupHandlers();

    // Display initial prompt
    this.terminal.writeln(`IOS CLI Practice Terminal`);
    this.terminal.writeln('');
    this.displayPrompt();

    // Handle window resize
    window.addEventListener('resize', () => {
      this.fitAddon.fit();
    });
  }

  setupHandlers() {
    this.terminal.onData((data) => {
      this.handleInput(data);
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
    if (data === '\x1b[A') {
      this.handleArrowUp();
      return;
    }

    if (data === '\x1b[B') {
      this.handleArrowDown();
      return;
    }

    // Regular character input
    if (code >= 32 && code < 127) {
      this.insertChar(data);
      this.terminal.write(data);
    }
  }

  handleEnter() {
    // If session ended, restart on Enter
    if (this.sessionEnded) {
      this.restartSession();
      return;
    }

    this.terminal.write('\r\n');

    const line = this.currentLine.trim();

    if (line) {
      // Add to history
      this.history.push(line);
      this.historyIndex = this.history.length;

      // Execute command
      const result = this.engine.executeCommand(this.session, line);

      // Display output
      if (result.output && result.output.length > 0) {
        this.displayOutput(result.output);
      }

      // Check for session end
      if (result.sessionEnd) {
        this.sessionEnded = true;
        this.terminal.writeln('\r\nSession ended. Press Enter to restart.');
        // Scroll to show end message
        if (this.terminal.element) {
          const viewport = this.terminal.element.querySelector('.xterm-viewport');
          if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
          }
        }
        return;
      }
    }

    // Reset input
    this.currentLine = '';
    this.cursorPos = 0;
    this.displayPrompt();
  }

  handleTab() {
    const completion = this.engine.getCompletion(
      this.session,
      this.currentLine,
      this.cursorPos
    );

    if (completion.type === 'complete') {
      const value = completion.value || '';
      this.currentLine += value;
      this.cursorPos += value.length;
      this.terminal.write(value);
    } else if (completion.type === 'list') {
      if (completion.options && completion.options.length > 0) {
        this.terminal.writeln('');
        this.terminal.writeln(completion.options.join('  '));
        this.displayPrompt();
        this.terminal.write(this.currentLine);
        // Scroll to show completion options
        if (this.terminal.element) {
          const viewport = this.terminal.element.querySelector('.xterm-viewport');
          if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
          }
        }
      }
    }
  }

  handleBackspace() {
    if (this.cursorPos > 0) {
      this.currentLine = this.currentLine.slice(0, -1);
      this.cursorPos--;
      this.terminal.write('\b \b');
    }
  }

  handleCtrlC() {
    this.terminal.writeln('^C');
    this.currentLine = '';
    this.cursorPos = 0;
    this.displayPrompt();
  }

  handleArrowUp() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.replaceCurrentLine(this.history[this.historyIndex]);
    }
  }

  handleArrowDown() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.replaceCurrentLine(this.history[this.historyIndex]);
    } else {
      this.historyIndex = this.history.length;
      this.replaceCurrentLine('');
    }
  }

  replaceCurrentLine(newLine) {
    // Clear current line
    const oldLength = this.currentLine.length;
    for (let i = 0; i < oldLength; i++) {
      this.terminal.write('\b \b');
    }

    // Write new line
    this.currentLine = newLine;
    this.cursorPos = newLine.length;
    this.terminal.write(newLine);
  }

  insertChar(char) {
    this.currentLine += char;
    this.cursorPos++;
  }

  displayPrompt() {
    const prompt = this.session.getPrompt();
    this.terminal.write(prompt);
    // Ensure cursor is visible by scrolling terminal viewport
    if (this.terminal.element) {
      const viewport = this.terminal.element.querySelector('.xterm-viewport');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }

  displayOutput(lines) {
    const prompt = this.session.getPrompt();
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check if this is a caret marker line
      if (i === 0 && line.match(/^\s*\^/)) {
        const adjustedLine = ' '.repeat(prompt.length) + line;
        this.terminal.writeln(adjustedLine);
      } else {
        this.terminal.writeln(line);
      }
    }
    // Ensure cursor is visible by scrolling terminal viewport
    if (this.terminal.element) {
      const viewport = this.terminal.element.querySelector('.xterm-viewport');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }

  async restartSession() {
    this.sessionEnded = false;
    
    // Clear terminal
    this.terminal.clear();
    
    // Reset state
    this.currentLine = '';
    this.cursorPos = 0;
    this.history = [];
    this.historyIndex = -1;
    
    // Reinitialize session
    this.engine = new CLIEngine(this.grammar);
    this.session = new CLISession(this.grammar, this.exercises);
    
    // Display initial prompt
    this.terminal.writeln(`IOS CLI Practice Terminal`);
    this.terminal.writeln('');
    this.displayPrompt();
  }
}

// Global Terminal Manager
class TerminalManager {
  constructor() {
    this.terminals = new Map();
    this.grammar = null;
    this.exercises = null;
  }

  async initialize() {
    try {
      // Load grammar and exercises once
      [this.grammar, this.exercises] = await Promise.all([
        loadGrammar(),
        loadExercises()
      ]);

      // Find all terminal elements
      const terminalElements = document.querySelectorAll('[id^="terminal-"]');

      // Initialize each terminal
      for (const element of terminalElements) {
        const terminalId = element.id;
        const terminal = new LearnTerminal(terminalId);
        await terminal.initialize(this.grammar, this.exercises);
        this.terminals.set(terminalId, terminal);
      }

      console.log(`Initialized ${this.terminals.size} terminals`);
    } catch (error) {
      console.error('Failed to initialize terminals:', error);
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    const manager = new TerminalManager();
    manager.initialize();
  });
} else {
  const manager = new TerminalManager();
  manager.initialize();
}

// Smooth scrolling for better UX
document.addEventListener('DOMContentLoaded', () => {
  // Add fade-in animation to sections as they scroll into view
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '0';
        entry.target.style.transform = 'translateY(20px)';
        setTimeout(() => {
          entry.target.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, 100);
      }
    });
  }, {
    threshold: 0.1
  });

  // Observe all lesson sections
  document.querySelectorAll('.lesson-section').forEach(section => {
    observer.observe(section);
  });

  // Click to copy code blocks
  document.querySelectorAll('code').forEach(codeBlock => {
    if (codeBlock.textContent.length > 3 && !codeBlock.closest('.prompt-ex')) {
      codeBlock.style.cursor = 'pointer';
      codeBlock.title = 'Click to copy';

      codeBlock.addEventListener('click', () => {
        const text = codeBlock.textContent;
        navigator.clipboard.writeText(text).then(() => {
          // Visual feedback
          const originalBg = codeBlock.style.backgroundColor;
          codeBlock.style.backgroundColor = '#4ec9b0';
          setTimeout(() => {
            codeBlock.style.backgroundColor = originalBg;
          }, 200);
        }).catch(err => {
          console.error('Failed to copy:', err);
        });
      });
    }
  });

  // Add progress indicator (optional)
  const progressBar = document.createElement('div');
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: linear-gradient(90deg, #007acc, #4ec9b0);
    z-index: 1000;
    transition: width 0.3s ease;
  `;
  document.body.appendChild(progressBar);

  window.addEventListener('scroll', () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrolled = window.scrollY;
    const progress = (scrolled / documentHeight) * 100;
    progressBar.style.width = progress + '%';
  });
});

export { TerminalManager, LearnTerminal };

