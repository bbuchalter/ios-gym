import {
  CommandGrammar,
  CommandDef,
  Token,
  ArgToken,
  ParseResult,
  ModeType
} from "../types";

/**
 * Command parser with IOS-style abbreviation support
 */
export class CommandParser {
  private grammar: CommandGrammar;
  private argTypePatterns: Map<string, RegExp>;
  
  constructor(grammar: CommandGrammar) {
    this.grammar = grammar;
    
    // Compile argument type patterns
    this.argTypePatterns = new Map();
    for (const [typeName, typeConfig] of Object.entries(grammar.arg_types)) {
      this.argTypePatterns.set(typeName, new RegExp(typeConfig.pattern));
    }
  }
  
  /**
   * Parse a command line in the given mode
   */
  public parse(line: string, mode: ModeType): ParseResult {
    const trimmed = line.trim();
    
    if (!trimmed) {
      return { success: false, error: "% Incomplete command" };
    }
    
    const modeCommands = this.grammar.commands[mode] || [];
    const tokens = this.tokenizeLine(trimmed);
    
    // Try to match against each command definition
    let bestMatchLength = 0;
    for (const cmdDef of modeCommands) {
      const result = this.matchCommand(tokens, cmdDef, trimmed);
      if (result.success) {
        return result;
      }
      // Track how far we got in matching
      if (result.matchedLength && result.matchedLength > bestMatchLength) {
        bestMatchLength = result.matchedLength;
      }
    }
    
    // Check if this looks like a hostname lookup attempt
    // IOS triggers name lookup for single unrecognized words that don't match any command
    const shouldTriggerNameLookup = tokens.length === 1 && bestMatchLength === 0;
    
    if (shouldTriggerNameLookup) {
      return {
        success: false,
        shouldTriggerNameLookup: true,
        lookupHostname: tokens[0]
      };
    }
    
    // Generate error message with caret marker showing where parsing failed
    const errorPos = bestMatchLength > 0 ? bestMatchLength : 0;
    const marker = " ".repeat(errorPos) + "^";
    const error = marker + "\n% Invalid input detected at '^' marker.";
    
    return { success: false, error };
  }
  
  /**
   * Tokenize a command line
   */
  private tokenizeLine(line: string): string[] {
    const tokens: string[] = [];
    let current = "";
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === " " && !inQuotes) {
        if (current) {
          tokens.push(current);
          current = "";
        }
      } else {
        current += char;
      }
    }
    
    if (current) {
      tokens.push(current);
    }
    
    return tokens;
  }
  
  /**
   * Match tokens against a command definition
   */
  private matchCommand(tokens: string[], cmdDef: CommandDef, originalLine: string): ParseResult {
    const args: Record<string, string> = {};
    let tokenIndex = 0;
    let defIndex = 0;
    let charPosition = 0;
    
    // Pre-calculate token positions in original line for accurate error reporting
    const tokenPositions: number[] = [];
    let searchPos = 0;
    for (const token of tokens) {
      const pos = originalLine.indexOf(token, searchPos);
      tokenPositions.push(pos);
      searchPos = pos + token.length;
    }
    
    while (defIndex < cmdDef.tokens.length) {
      const defToken = cmdDef.tokens[defIndex];
      
      // Handle keyword tokens
      if (typeof defToken === "string") {
        if (tokenIndex >= tokens.length) {
          return { success: false, matchedLength: charPosition };
        }
        
        if (!this.matchKeyword(tokens[tokenIndex], defToken)) {
          // Return position of this token (where the mismatch occurred)
          return { success: false, matchedLength: tokenPositions[tokenIndex] };
        }
        
        // Update character position to end of this token
        charPosition = tokenPositions[tokenIndex] + tokens[tokenIndex].length;
        
        tokenIndex++;
        defIndex++;
        continue;
      }
      
      // Handle argument tokens
      const argToken = defToken as ArgToken;
      const argType = argToken.arg || argToken.optional_arg;
      const isOptional = !!argToken.optional_arg;
      
      if (!argType) {
        return { success: false, matchedLength: charPosition };
      }
      
      // For REST_OF_LINE, consume all remaining tokens
      if (argType === "REST_OF_LINE") {
        if (tokenIndex >= tokens.length) {
          if (isOptional) {
            defIndex++;
            continue;
          }
          return { success: false, matchedLength: charPosition };
        }
        
        args[argToken.name] = tokens.slice(tokenIndex).join(" ");
        tokenIndex = tokens.length;
        defIndex++;
        continue;
      }
      
      // Regular argument matching
      if (tokenIndex >= tokens.length) {
        if (isOptional) {
          defIndex++;
          continue;
        }
        return { success: false, matchedLength: charPosition };
      }
      
      const token = tokens[tokenIndex];
      
      if (this.validateArgType(token, argType)) {
        args[argToken.name] = token;
        
        // Update character position
        charPosition = tokenPositions[tokenIndex] + token.length;
        
        tokenIndex++;
        defIndex++;
      } else if (isOptional) {
        defIndex++;
      } else {
        // Invalid argument - point to this token
        return { success: false, matchedLength: tokenPositions[tokenIndex] };
      }
    }
    
    // All tokens must be consumed
    if (tokenIndex !== tokens.length) {
      // Point to the extra token
      return { success: false, matchedLength: tokenPositions[tokenIndex] };
    }
    
    return {
      success: true,
      command: cmdDef,
      args
    };
  }
  
  /**
   * Match a token against a keyword with IOS-style abbreviation
   */
  private matchKeyword(token: string, keyword: string): boolean {
    const caseInsensitive = this.grammar.settings.case_insensitive;
    
    const tokenLower = caseInsensitive ? token.toLowerCase() : token;
    const keywordLower = caseInsensitive ? keyword.toLowerCase() : keyword;
    
    // Exact match
    if (tokenLower === keywordLower) {
      return true;
    }
    
    // Abbreviation match
    if (this.grammar.settings.keyword_abbrev.enabled) {
      const minPrefix = this.grammar.settings.keyword_abbrev.min_prefix;
      
      if (tokenLower.length >= minPrefix && keywordLower.startsWith(tokenLower)) {
        return true;
      }
    }
    
    return false;
  }
  
  /**
   * Validate a token against an argument type
   */
  private validateArgType(token: string, argType: string): boolean {
    const pattern = this.argTypePatterns.get(argType);
    
    if (!pattern) {
      return false;
    }
    
    return pattern.test(token);
  }
  
  /**
   * Get all possible keywords that match a prefix in a given mode
   */
  public getMatchingKeywords(prefix: string, mode: ModeType): string[] {
    const matches: Set<string> = new Set();
    const modeCommands = this.grammar.commands[mode] || [];
    
    for (const cmdDef of modeCommands) {
      for (const token of cmdDef.tokens) {
        if (typeof token === "string") {
          if (this.matchKeyword(prefix, token)) {
            matches.add(token);
          }
        }
      }
    }
    
    return Array.from(matches).sort();
  }
}

