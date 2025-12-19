import type { CommandGrammar } from '@src/types';

export async function loadGrammar(): Promise<CommandGrammar> {
  const response = await fetch('/commands.json');
  if (!response.ok) {
    throw new Error('Failed to load command grammar');
  }
  return response.json();
}

