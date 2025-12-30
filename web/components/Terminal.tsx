'use client';

import { useEffect, useRef } from 'react';
import { FitAddon } from '@xterm/addon-fit';
import { Terminal as XTerm } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';

import { CLIEngine } from '@src/cli/engine';
import { CLISession } from '@src/cli-session';

import { useLessonCounter } from '@/lib/LessonCounterContext';
import { useTerminalRegistry } from '@/lib/TerminalRegistryContext';

import type { CommandGrammar, DeviceModel } from '@src/types';

interface TerminalProps {
  terminalId?: string;
  grammar: CommandGrammar;
  deviceModel?: DeviceModel; // Optional override (defaults to grammar.deviceModel)
  sessionRef?: React.RefObject<CLISession | null>; // Optional external ref for Exercise component
  onKeyboardShortcut?: (event: KeyboardEvent) => void; // Keyboard shortcut handler for Exercise navigation
}

export default function Terminal({
  terminalId,
  grammar,
  deviceModel,
  sessionRef: externalSessionRef,
  onKeyboardShortcut,
}: TerminalProps) {
  const counter = useLessonCounter();
  const finalTerminalId = terminalId || counter.getTerminalId();
  const registry = useTerminalRegistry();
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const engineRef = useRef<CLIEngine | null>(null);
  const internalSessionRef = useRef<CLISession | null>(null);
  // Use external sessionRef if provided, otherwise use internal
  const sessionRef = externalSessionRef || internalSessionRef;

  // Store keyboard shortcut handler in ref to always have latest version
  const keyboardShortcutRef = useRef(onKeyboardShortcut);
  useEffect(() => {
    keyboardShortcutRef.current = onKeyboardShortcut;
  }, [onKeyboardShortcut]);

  // Use refs for values accessed in handlers to avoid stale closures
  const currentLineRef = useRef('');
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const sessionEndedRef = useRef(false);
  const passwordModeRef = useRef(false);
  const nameLookupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const inNameLookupRef = useRef(false);
  const paginationRef = useRef<{
    lines: string[];
    currentIndex: number;
    linesPerPage: number;
  } | null>(null);

  // Register with the terminal registry on mount
  useEffect(() => {
    registry.register();
    return () => {
      registry.unregister();
    };
  }, [registry]);

  useEffect(() => {
    if (!containerRef.current || terminalRef.current) return;

    // Initialize XTerm with modern theme
    const terminal = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: '"Courier New", Courier, monospace',
      theme: {
        background: '#0f172a', // slate-950
        foreground: '#e2e8f0', // slate-200
        cursor: '#22d3ee', // cyan-400
        cursorAccent: '#0f172a',
        selectionBackground: '#1e40af88', // blue-800 with transparency
      },
      cols: 80,
      rows: 20,
      scrollback: 1000,
    });

    // Load fit addon
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);

    // Open terminal in container
    terminal.open(containerRef.current);

    // Apply fit after a delay
    setTimeout(() => {
      try {
        fitAddon.fit();
      } catch (e) {
        console.error(`Terminal ${finalTerminalId} - Fit error:`, e);
      }
    }, 100);

    // Initialize CLI
    const engine = new CLIEngine(grammar);
    const session = new CLISession(grammar, deviceModel);

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;
    engineRef.current = engine;
    sessionRef.current = session;

    // Display initial prompt
    terminal.write(session.getPrompt());

    // Ensure terminal is focused
    setTimeout(() => {
      terminal.focus();
      // Mark terminal as ready after initialization is complete
      registry.markReady();
    }, 200);

    // Helper functions
    const scrollToBottom = () => {
      if (terminal.element) {
        const viewport = terminal.element.querySelector('.xterm-viewport');
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }
    };

    const abortNameLookup = () => {
      if (nameLookupTimeoutRef.current) {
        clearTimeout(nameLookupTimeoutRef.current);
        nameLookupTimeoutRef.current = null;
      }
      if (inNameLookupRef.current) {
        inNameLookupRef.current = false;
        terminal.writeln('% Name lookup aborted');
        terminal.write(sessionRef.current!.getPrompt());
        scrollToBottom();
      }
    };

    const startNameLookup = (hostname: string) => {
      inNameLookupRef.current = true;
      terminal.writeln(`Translating "${hostname}"...domain server (255.255.255.255)`);

      // Set timeout for 5 seconds (simulating DNS lookup timeout)
      nameLookupTimeoutRef.current = setTimeout(() => {
        if (inNameLookupRef.current) {
          inNameLookupRef.current = false;
          terminal.writeln('% Name lookup aborted');
          terminal.write(sessionRef.current!.getPrompt());
          scrollToBottom();
        }
      }, 5000); // 5 seconds
    };

    const replaceCurrentLine = (newLine: string) => {
      const oldLength = currentLineRef.current.length;
      for (let i = 0; i < oldLength; i++) {
        terminal.write('\b \b');
      }
      terminal.write(newLine);
      currentLineRef.current = newLine;
    };

    const showPaginatedLines = (count: number) => {
      if (!paginationRef.current) return false;

      const { lines, currentIndex } = paginationRef.current;
      const endIndex = Math.min(currentIndex + count, lines.length);

      // Clear the --More-- prompt
      terminal.write('\r' + ' '.repeat(8) + '\r');

      // Show lines
      for (let i = currentIndex; i < endIndex; i++) {
        if (i > currentIndex) terminal.write('\r\n');
        // eslint-disable-next-line security/detect-object-injection
        terminal.write(lines[i]);
      }

      paginationRef.current.currentIndex = endIndex;

      // Check if we have more lines
      if (endIndex < lines.length) {
        terminal.write('\r\n--More--');
        return true; // Still in pagination mode
      } else {
        // Done with pagination
        terminal.write('\r\n');
        terminal.write(sessionRef.current!.getPrompt());
        paginationRef.current = null;
        scrollToBottom();
        return false; // Exit pagination mode
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle Exercise keyboard shortcuts (Cmd/Ctrl + [, ], or \)
      if (
        keyboardShortcutRef.current &&
        (event.metaKey || event.ctrlKey) &&
        (event.key === '[' || event.key === ']' || event.key === '\\')
      ) {
        event.preventDefault();
        event.stopPropagation();
        keyboardShortcutRef.current(event);
        lastKeyboardEvent = null;
        return;
      }

      // Detect CTRL+SHIFT+6 (requires all three keys)
      if (event.ctrlKey && event.shiftKey && event.key === '^') {
        event.preventDefault();
        if (inNameLookupRef.current) {
          abortNameLookup();
        }
        lastKeyboardEvent = null;
        return;
      }
    };

    // Attach keyboard listener to terminal element
    if (terminal.element) {
      terminal.element.addEventListener('keydown', handleKeyDown);
    }

    // Handle input
    const handleData = (data: string) => {
      // Clear the keyboard event tracker after handling
      lastKeyboardEvent = null;

      // Handle pagination mode
      if (paginationRef.current) {
        const lowerData = data.toLowerCase();

        // Space bar - show next page
        if (data === ' ') {
          showPaginatedLines(paginationRef.current.linesPerPage);
          return;
        }

        // Enter key - show next line
        if (data.charCodeAt(0) === 13) {
          showPaginatedLines(1);
          return;
        }

        // Q or q - quit pagination
        if (lowerData === 'q') {
          // Clear the --More-- prompt
          terminal.write('\r' + ' '.repeat(8) + '\r\n');
          terminal.write(sessionRef.current!.getPrompt());
          paginationRef.current = null;
          scrollToBottom();
          return;
        }

        // Ignore other input in pagination mode
        return;
      }

      if (sessionEndedRef.current && data.charCodeAt(0) === 13) {
        // Restart session on Enter
        sessionEndedRef.current = false;
        currentLineRef.current = '';
        historyRef.current = [];
        historyIndexRef.current = -1;

        terminal.clear();
        const newEngine = new CLIEngine(grammar);
        const newSession = new CLISession(grammar);
        engineRef.current = newEngine;
        sessionRef.current = newSession;

        terminal.write(newSession.getPrompt());
        return;
      }

      const code = data.charCodeAt(0);

      // Block most input during name lookup (except CTRL+SHIFT+6 which is handled above)
      if (inNameLookupRef.current) {
        return;
      }

      // Enter key
      if (code === 13) {
        terminal.write('\r\n');
        const line = currentLineRef.current.trim();

        // Check if we're in password mode
        if (passwordModeRef.current) {
          // Submit password (without trimming - passwords may have whitespace)
          const password = currentLineRef.current;
          const result = engineRef.current!.submitPassword(sessionRef.current!, password);

          if (result.output && result.output.length > 0) {
            result.output.forEach((outputLine) => {
              terminal.writeln(outputLine);
            });
          }

          // Check if we need to re-prompt for password
          if (result.passwordPrompt) {
            // Stay in password mode and show prompt again
            terminal.write(result.passwordPrompt.prompt);
            currentLineRef.current = '';
            scrollToBottom();
            return;
          }

          // Password phase complete (success or final failure)
          passwordModeRef.current = false;
          currentLineRef.current = '';
          terminal.write(sessionRef.current!.getPrompt());
          scrollToBottom();
          return;
        }

        if (line) {
          historyRef.current = [...historyRef.current, line];
          historyIndexRef.current = historyRef.current.length;

          const result = engineRef.current!.executeCommand(sessionRef.current!, line);

          // Check if this should trigger a name lookup
          if (result.nameLookup) {
            startNameLookup(result.nameLookup.hostname);
            currentLineRef.current = '';
            return;
          }

          if (result.output && result.output.length > 0) {
            const prompt = sessionRef.current!.getPrompt();

            // Check if output should be paginated
            if (result.paginated) {
              // Initialize pagination
              const linesPerPage = 20; // Show 20 lines at a time
              paginationRef.current = {
                lines: result.output,
                currentIndex: 0,
                linesPerPage,
              };

              // Show first page
              showPaginatedLines(linesPerPage);
              currentLineRef.current = '';
              scrollToBottom();
              return;
            }

            // Non-paginated output
            result.output.forEach((outputLine, index) => {
              if (index === 0 && outputLine.match(/^\s*\^/)) {
                terminal.writeln(' '.repeat(prompt.length) + outputLine);
              } else {
                terminal.writeln(outputLine);
              }
            });
          }

          if (result.sessionEnd) {
            sessionEndedRef.current = true;
            terminal.writeln('\r\nSession ended. Press Enter to restart.');
            scrollToBottom();
            return;
          }

          // Check if we need to prompt for password
          if (result.passwordPrompt) {
            passwordModeRef.current = true;
            terminal.write(result.passwordPrompt.prompt);
            currentLineRef.current = '';
            scrollToBottom();
            return;
          }
        }

        currentLineRef.current = '';
        terminal.write(sessionRef.current!.getPrompt());
        scrollToBottom();
        return;
      }

      // Tab key (disabled in password mode)
      if (code === 9) {
        if (passwordModeRef.current) {
          return; // Ignore tab in password mode
        }

        const completion = engineRef.current!.getCompletion(
          sessionRef.current!,
          currentLineRef.current,
          currentLineRef.current.length
        );

        if (completion.type === 'complete' && completion.value) {
          currentLineRef.current += completion.value;
          terminal.write(completion.value);
        } else if (
          completion.type === 'list' &&
          completion.options &&
          completion.options.length > 0
        ) {
          terminal.writeln('');
          terminal.writeln(completion.options.join('  '));
          terminal.write(sessionRef.current!.getPrompt());
          terminal.write(currentLineRef.current);
          scrollToBottom();
        }
        return;
      }

      // Backspace / Delete
      if (code === 127 || code === 8) {
        if (currentLineRef.current.length > 0) {
          currentLineRef.current = currentLineRef.current.slice(0, -1);
          // Only echo backspace if not in password mode
          if (!passwordModeRef.current) {
            terminal.write('\b \b');
          }
        }
        return;
      }

      // Ctrl+C
      if (code === 3) {
        terminal.writeln('^C');
        currentLineRef.current = '';
        // Cancel password mode on Ctrl+C
        if (passwordModeRef.current) {
          passwordModeRef.current = false;
          sessionRef.current!.pendingPasswordPrompt = null;
        }
        terminal.write(sessionRef.current!.getPrompt());
        return;
      }

      // Arrow Up (disabled in password mode)
      if (data === '\x1b[A') {
        if (passwordModeRef.current) {
          return; // Ignore arrow keys in password mode
        }
        if (historyIndexRef.current > 0) {
          historyIndexRef.current--;
          replaceCurrentLine(historyRef.current[historyIndexRef.current]);
        }
        return;
      }

      // Arrow Down (disabled in password mode)
      if (data === '\x1b[B') {
        if (passwordModeRef.current) {
          return; // Ignore arrow keys in password mode
        }
        if (historyIndexRef.current < historyRef.current.length - 1) {
          historyIndexRef.current++;
          replaceCurrentLine(historyRef.current[historyIndexRef.current]);
        } else {
          historyIndexRef.current = historyRef.current.length;
          replaceCurrentLine('');
        }
        return;
      }

      // Regular character input
      if (code >= 32 && code < 127) {
        currentLineRef.current += data;
        // Only echo if not in password mode
        if (!passwordModeRef.current) {
          terminal.write(data);
        }
      }
    };

    const dataDisposable = terminal.onData(handleData);

    // Handle resize
    const handleResize = () => {
      if (fitAddonRef.current) {
        fitAddonRef.current.fit();
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);

      // Remove keyboard listener
      if (terminal.element) {
        terminal.element.removeEventListener('keydown', handleKeyDown);
      }

      dataDisposable.dispose();

      // Clean up name lookup timeout if active
      if (nameLookupTimeoutRef.current) {
        clearTimeout(nameLookupTimeoutRef.current);
        nameLookupTimeoutRef.current = null;
      }

      if (terminalRef.current) {
        terminalRef.current.dispose();
        terminalRef.current = null;
      }
    };
    // registry and sessionRef are intentionally omitted - registry is stable, sessionRef is assigned within effect
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grammar, deviceModel, finalTerminalId]);

  return (
    <div className="overflow-hidden rounded-lg border border-gray-700 bg-gray-800">
      <div className="flex items-center justify-between border-b border-gray-700 bg-gray-900 px-4 py-2 font-mono text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          <span className="h-2 w-2 rounded-full bg-yellow-500" />
          <span className="h-2 w-2 rounded-full bg-green-500" />
          <span className="ml-4 text-gray-300">{finalTerminalId}</span>
        </div>
        <span className="text-gray-500">
          {grammar.deviceModel === '2960-switch' ? 'Catalyst 2960' : 'Cisco 1941'}
        </span>
      </div>
      <div
        ref={containerRef}
        className="cursor-text overflow-auto p-4"
        style={{
          minHeight: '400px',
          maxWidth: '100%',
          backgroundColor: '#1f2937',
        }}
        onClick={() => terminalRef.current?.focus()}
      />
    </div>
  );
}
