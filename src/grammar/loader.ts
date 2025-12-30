import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import { CommandGrammar } from "../types";

/**
 * Load and parse a device-specific grammar file
 */
export function loadGrammar(filePath: string): CommandGrammar {
  const content = fs.readFileSync(filePath, "utf8");
  const grammar = yaml.load(content) as CommandGrammar;
  return grammar;
}

/**
 * Get the default grammar path (Catalyst 2960 switch)
 */
export function getDefaultGrammarPath(): string {
  return path.join(process.cwd(), "grammar/commands-2960-switch.yaml");
}

