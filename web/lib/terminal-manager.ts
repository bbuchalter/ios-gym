import { loadGrammar } from './data-loader';

import type { CommandGrammar } from '@src/types';


export class TerminalManager {
  private grammar: CommandGrammar | null = null;

  async initialize() {
    this.grammar = await loadGrammar();
    return this.grammar;
  }

  getGrammar() {
    if (!this.grammar) {
      throw new Error('TerminalManager not initialized');
    }
    return this.grammar;
  }
}
