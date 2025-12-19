'use client';

import { useEffect, useRef } from 'react';
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

export default function Terminal({ terminalId, grammar }: TerminalProps) {
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
    
    // Initialize XTerm with modern theme
    const terminal = new XTerm({
      cursorBlink: true,
      fontSize: 14,
      fontFamily: '"Courier New", Courier, monospace',
      theme: {
        background: '#0f172a',  // slate-950
        foreground: '#e2e8f0',  // slate-200
        cursor: '#22d3ee',      // cyan-400
        cursorAccent: '#0f172a',
        selectionBackground: '#1e40af88'  // blue-800 with transparency
      },
      cols: 80,
      rows: 20,
      scrollback: 1000
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
        console.error(`Terminal ${terminalId} - Fit error:`, e);
      }
    }, 100);
    
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
    
    // Ensure terminal is focused
    setTimeout(() => {
      terminal.focus();
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
    
    const replaceCurrentLine = (newLine: string) => {
      const oldLength = currentLineRef.current.length;
      for (let i = 0; i < oldLength; i++) {
        terminal.write('\b \b');
      }
      terminal.write(newLine);
      currentLineRef.current = newLine;
    };
    
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
      dataDisposable.dispose();
      if (terminalRef.current) {
        terminalRef.current.dispose();
        terminalRef.current = null;
      }
    };
  }, [grammar, terminalId]);
  
  return (
    <div className="bg-slate-950 rounded-xl overflow-hidden my-8 border border-slate-700/50 shadow-2xl shadow-cyan-500/10">
      <div className="bg-gradient-to-r from-slate-800 to-slate-900 border-b border-slate-700/50 px-4 py-3 flex items-center gap-2">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-slate-600"></div>
          <div className="w-3 h-3 rounded-full bg-slate-600"></div>
          <div className="w-3 h-3 rounded-full bg-slate-600"></div>
        </div>
        <div className="text-slate-400 text-sm font-mono ml-2">
          {terminalId}
        </div>
      </div>
      <div 
        ref={containerRef} 
        className="terminal-embed cursor-text" 
        style={{ 
          minHeight: '400px',
          width: '100%',
          backgroundColor: '#0f172a'
        }}
        onClick={() => terminalRef.current?.focus()}
      />
    </div>
  );
}
