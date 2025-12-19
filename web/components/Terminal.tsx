'use client';

import { useEffect, useRef, useState } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

// Import from src/ via @src/* aliases
import { CLIEngine } from '@src/cli/engine';
import { CLISession } from '@src/cli-session';
import type { CommandGrammar } from '@src/types';

interface TerminalProps {
  terminalId: string;
  grammar: CommandGrammar;
}

export function Terminal({ terminalId, grammar }: TerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const engineRef = useRef<CLIEngine | null>(null);
  const sessionRef = useRef<CLISession | null>(null);
  
  // Use refs for values accessed in handlers to avoid stale closures
  const currentLineRef = useRef('');
  const historyRef = useRef<string[]>([]);
  const historyIndexRef = useRef(-1);
  const sessionEndedRef = useRef(false);
  
  useEffect(() => {
    if (!containerRef.current || terminalRef.current) return;
    
    // Initialize XTerm
    const terminal = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: '"Courier New", Courier, monospace',
      theme: {
        background: '#1e1e1e',
        foreground: '#d4d4d4',
        cursor: '#4ec9b0',
        selectionBackground: '#264f78'
      },
      cols: 80,
      rows: 20
    });
    
    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(containerRef.current);
    
    // Delay fit to allow container to render
    setTimeout(() => {
      fitAddon.fit();
    }, 10);
    
    // Initialize CLI
    const engine = new CLIEngine(grammar);
    const session = new CLISession(grammar);
    
    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;
    engineRef.current = engine;
    sessionRef.current = session;
    
    // Display initial prompt
    terminal.writeln('IOS CLI Practice Terminal');
    terminal.writeln('');
    terminal.write(session.getPrompt());
    
    // Handle input
    const handleData = (data: string) => {
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
        
        terminal.writeln('IOS CLI Practice Terminal');
        terminal.writeln('');
        terminal.write(newSession.getPrompt());
        return;
      }
      
      const code = data.charCodeAt(0);
      
      // Enter key
      if (code === 13) {
        terminal.write('\r\n');
        const line = currentLineRef.current.trim();
        
        if (line) {
          historyRef.current = [...historyRef.current, line];
          historyIndexRef.current = historyRef.current.length;
          
          const result = engineRef.current!.executeCommand(sessionRef.current!, line);
          
          if (result.output && result.output.length > 0) {
            const prompt = sessionRef.current!.getPrompt();
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
        }
        
        currentLineRef.current = '';
        terminal.write(sessionRef.current!.getPrompt());
        scrollToBottom();
        return;
      }
      
      // Tab key
      if (code === 9) {
        const completion = engineRef.current!.getCompletion(
          sessionRef.current!,
          currentLineRef.current,
          currentLineRef.current.length
        );
        
        if (completion.type === 'complete' && completion.value) {
          currentLineRef.current += completion.value;
          terminal.write(completion.value);
        } else if (completion.type === 'list' && completion.options && completion.options.length > 0) {
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
          terminal.write('\b \b');
        }
        return;
      }
      
      // Ctrl+C
      if (code === 3) {
        terminal.writeln('^C');
        currentLineRef.current = '';
        terminal.write(sessionRef.current!.getPrompt());
        return;
      }
      
      // Arrow Up
      if (data === '\x1b[A') {
        if (historyIndexRef.current > 0) {
          historyIndexRef.current--;
          replaceCurrentLine(historyRef.current[historyIndexRef.current]);
        }
        return;
      }
      
      // Arrow Down
      if (data === '\x1b[B') {
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
        terminal.write(data);
      }
    };
    
    const replaceCurrentLine = (newLine: string) => {
      const oldLength = currentLineRef.current.length;
      for (let i = 0; i < oldLength; i++) {
        terminal.write('\b \b');
      }
      terminal.write(newLine);
      currentLineRef.current = newLine;
    };
    
    const scrollToBottom = () => {
      if (terminal.element) {
        const viewport = terminal.element.querySelector('.xterm-viewport');
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
      }
    };
    
    terminal.onData(handleData);
    
    // Handle resize
    const handleResize = () => fitAddon.fit();
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      terminal.dispose();
    };
  }, [grammar]); // Only reinitialize when grammar changes
  
  return (
    <div className="bg-[#1e1e1e] rounded-lg overflow-hidden my-8 border-2 border-primary shadow-xl">
      <div className="bg-gradient-to-r from-primary to-secondary text-text-bright p-3 font-semibold text-sm">
        Practice Terminal - {terminalId}
      </div>
      <div ref={containerRef} className="terminal-embed" style={{ minHeight: '400px' }} />
    </div>
  );
}

