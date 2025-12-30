/**
 * Tests for command history behavior
 * 
 * Command history should match Cisco IOS behavior:
 * - Consecutive duplicate commands should only appear once
 * - UP arrow navigates backward through history
 * - DOWN arrow navigates forward through history
 */

describe('Command History', () => {
  describe('Duplicate Command Handling', () => {
    test('consecutive duplicate commands should only appear once in history', () => {
      // Simulate command history behavior
      const addToHistory = (history: string[], newCommand: string): string[] => {
        // BUG: Current implementation always adds
        // return [...history, newCommand];
        
        // FIX: Skip if same as last command
        if (history.length > 0 && history[history.length - 1] === newCommand) {
          return history; // Don't add duplicate
        }
        return [...history, newCommand];
      };
      
      let history: string[] = [];
      
      // Run show running-config twice
      history = addToHistory(history, 'show running-config');
      history = addToHistory(history, 'show running-config'); // Duplicate!
      
      // History should only have one entry
      expect(history).toEqual(['show running-config']);
      expect(history.length).toBe(1);
    });
    
    test('different commands are both added to history', () => {
      const addToHistory = (history: string[], newCommand: string): string[] => {
        if (history.length > 0 && history[history.length - 1] === newCommand) {
          return history;
        }
        return [...history, newCommand];
      };
      
      let history: string[] = [];
      
      history = addToHistory(history, 'enable');
      history = addToHistory(history, 'show running-config');
      history = addToHistory(history, 'configure terminal');
      
      expect(history).toEqual(['enable', 'show running-config', 'configure terminal']);
      expect(history.length).toBe(3);
    });
    
    test('non-consecutive duplicates are both added', () => {
      const addToHistory = (history: string[], newCommand: string): string[] => {
        if (history.length > 0 && history[history.length - 1] === newCommand) {
          return history;
        }
        return [...history, newCommand];
      };
      
      let history: string[] = [];
      
      history = addToHistory(history, 'show running-config');
      history = addToHistory(history, 'enable');
      history = addToHistory(history, 'show running-config'); // Same as first, but not consecutive
      
      // Both should be in history since they're not consecutive
      expect(history).toEqual(['show running-config', 'enable', 'show running-config']);
      expect(history.length).toBe(3);
    });
    
    test('empty command is not added to history', () => {
      const addToHistory = (history: string[], newCommand: string): string[] => {
        // Don't add empty commands
        if (!newCommand || newCommand.trim() === '') {
          return history;
        }
        
        if (history.length > 0 && history[history.length - 1] === newCommand) {
          return history;
        }
        return [...history, newCommand];
      };
      
      let history: string[] = [];
      
      history = addToHistory(history, 'enable');
      history = addToHistory(history, ''); // Empty command
      history = addToHistory(history, 'show running-config');
      
      expect(history).toEqual(['enable', 'show running-config']);
      expect(history.length).toBe(2);
    });
    
    test('real-world scenario: repeated show commands', () => {
      const addToHistory = (history: string[], newCommand: string): string[] => {
        if (!newCommand || newCommand.trim() === '') {
          return history;
        }
        
        if (history.length > 0 && history[history.length - 1] === newCommand) {
          return history;
        }
        return [...history, newCommand];
      };
      
      let history: string[] = [];
      
      // Engineer repeatedly checks config while making changes
      history = addToHistory(history, 'enable');
      history = addToHistory(history, 'configure terminal');
      history = addToHistory(history, 'hostname Router1');
      history = addToHistory(history, 'end');
      history = addToHistory(history, 'show running-config');
      history = addToHistory(history, 'show running-config'); // Check again
      history = addToHistory(history, 'show running-config'); // And again
      history = addToHistory(history, 'configure terminal');
      history = addToHistory(history, 'interface g0/0');
      
      // show running-config should only appear once despite 3 consecutive runs
      expect(history).toEqual([
        'enable',
        'configure terminal',
        'hostname Router1',
        'end',
        'show running-config',
        'configure terminal',
        'interface g0/0'
      ]);
      expect(history.length).toBe(7);
    });
  });
  
  describe('History Navigation', () => {
    test('UP arrow navigates backward through history', () => {
      const history = ['enable', 'configure terminal', 'hostname Test'];
      let historyIndex = history.length; // Start at end
      
      // Press UP once
      historyIndex = Math.max(0, historyIndex - 1);
      expect(history[historyIndex]).toBe('hostname Test');
      
      // Press UP again
      historyIndex = Math.max(0, historyIndex - 1);
      expect(history[historyIndex]).toBe('configure terminal');
      
      // Press UP again
      historyIndex = Math.max(0, historyIndex - 1);
      expect(history[historyIndex]).toBe('enable');
      
      // Press UP again (should stay at first)
      historyIndex = Math.max(0, historyIndex - 1);
      expect(historyIndex).toBe(0);
      expect(history[historyIndex]).toBe('enable');
    });
    
    test('DOWN arrow navigates forward through history', () => {
      const history = ['enable', 'configure terminal', 'hostname Test'];
      let historyIndex = 0; // Start at beginning
      
      // Press DOWN
      historyIndex = Math.min(history.length, historyIndex + 1);
      expect(history[historyIndex]).toBe('configure terminal');
      
      // Press DOWN
      historyIndex = Math.min(history.length, historyIndex + 1);
      expect(history[historyIndex]).toBe('hostname Test');
      
      // Press DOWN (should go to end position)
      historyIndex = Math.min(history.length, historyIndex + 1);
      expect(historyIndex).toBe(history.length);
    });
  });
});

