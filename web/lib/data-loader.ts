import type { CommandGrammar, DeviceModel } from '@src/types';

/**
 * Load command grammar for a specific Cisco device model
 * @param deviceModel - '2960-switch' for Catalyst 2960 or '1941-router' for Cisco 1941 ISR
 * @returns Command grammar with device-specific commands and templates
 */
export async function loadGrammar(deviceModel: DeviceModel = '2960-switch'): Promise<CommandGrammar> {
  const filename = `/commands-${deviceModel}.json`;
  const response = await fetch(filename);
  
  if (!response.ok) {
    throw new Error(`Failed to load grammar for ${deviceModel}`);
  }
  
  const grammar: CommandGrammar = await response.json();
  
  // Validate that loaded grammar matches requested device model
  if (grammar.deviceModel !== deviceModel) {
    throw new Error(
      `Grammar mismatch: expected ${deviceModel}, got ${grammar.deviceModel}`
    );
  }
  
  return grammar;
}

/**
 * Load Catalyst 2960 switch grammar
 */
export function load2960SwitchGrammar(): Promise<CommandGrammar> {
  return loadGrammar('2960-switch');
}

/**
 * Load Cisco 1941 ISR router grammar
 */
export function load1941RouterGrammar(): Promise<CommandGrammar> {
  return loadGrammar('1941-router');
}

