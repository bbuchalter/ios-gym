import {
  CommandGrammar,
  CompletionResult,
  ModeType,
  DeviceState,
  CommandDef,
  Token,
  ArgToken
} from "../types";

/**
 * Tab completion engine
 */
export class TabCompleter {
  private grammar: CommandGrammar;
  
  constructor(grammar: CommandGrammar) {
    this.grammar = grammar;
  }
  
  /**
   * Get completion suggestions for a partial command line
   */
  public complete(
    line: string,
    cursorPos: number,
    mode: ModeType,
    state: DeviceState
  ): CompletionResult {
    const beforeCursor = line.substring(0, cursorPos);
    const tokens = this.tokenizeLine(beforeCursor);
    const lastToken = tokens.length > 0 ? tokens[tokens.length - 1] : "";
    const isTrailingSpace = beforeCursor.endsWith(" ");
    
    const modeCommands = this.grammar.commands[mode] || [];
    const candidates: Set<string> = new Set();
    
    // Find matching command patterns
    for (const cmdDef of modeCommands) {
      const matches = this.getCompletionCandidates(
        tokens,
        isTrailingSpace,
        cmdDef,
        state
      );
      matches.forEach(m => candidates.add(m));
    }
    
    const candidateArray = Array.from(candidates).sort();
    
    if (candidateArray.length === 0) {
      return { type: "list", options: [] };
    }
    
    if (candidateArray.length === 1) {
      // Single match: complete it (unless it's a placeholder)
      const completion = candidateArray[0];
      
      // Don't auto-complete placeholders (e.g., <number>, <A.B.C.D>)
      // Show them as a list instead
      if (completion.startsWith("<") && completion.endsWith(">")) {
        return { type: "list", options: candidateArray };
      }
      
      // If we're completing a partial token, replace it
      if (!isTrailingSpace && lastToken) {
        return { type: "complete", value: completion.substring(lastToken.length) };
      } else {
        return { type: "complete", value: completion };
      }
    }
    
    // Multiple matches: show list
    return { type: "list", options: candidateArray };
  }
  
  /**
   * Get completion candidates for a command definition
   */
  private getCompletionCandidates(
    tokens: string[],
    isTrailingSpace: boolean,
    cmdDef: CommandDef,
    state: DeviceState
  ): string[] {
    const candidates: string[] = [];
    let tokenIndex = 0;
    let defIndex = 0;
    
    // Try to match up to where user has typed
    while (defIndex < cmdDef.tokens.length && tokenIndex < tokens.length) {
      const defToken = cmdDef.tokens[defIndex];
      const userToken = tokens[tokenIndex];
      
      if (typeof defToken === "string") {
        // Keyword token
        if (this.matchKeywordPrefix(userToken, defToken)) {
          // Check if this is the last token and not a trailing space
          // If so, this is a partial match we want to complete
          if (tokenIndex === tokens.length - 1 && !isTrailingSpace) {
            candidates.push(defToken);
          }
          tokenIndex++;
          defIndex++;
        } else {
          // No match, this command doesn't apply
          return [];
        }
      } else {
        // Argument token
        const argToken = defToken as ArgToken;
        const argType = argToken.arg || argToken.optional_arg;
        
        if (!argType) {
          // No argument type defined, skip
          tokenIndex++;
          defIndex++;
          continue;
        }
        
        if (argType === "REST_OF_LINE") {
          // Rest of line consumes everything
          return [];
        }
        
        // Check if this is the last token and we're trying to complete it
        if (tokenIndex === tokens.length - 1 && !isTrailingSpace) {
          // Get suggestions for this argument type and filter by user's partial input
          const suggestions = this.getSuggestionsForArgType(
            argType,
            state,
            cmdDef
          );
          
          // Filter suggestions that start with the user's partial input
          const filtered = suggestions.filter(suggestion =>
            this.matchKeywordPrefix(userToken, suggestion)
          );
          
          if (filtered.length > 0) {
            // For multi-word suggestions, only complete to the first word boundary
            // For example: if suggestions are ["vlan 1", "vlan 100"], and user typed "v",
            // we should only complete to "vlan", not suggest "vlan 1", "vlan 100"
            const firstWords = new Set<string>();
            
            filtered.forEach(suggestion => {
              const firstWord = suggestion.split(' ')[0];
              if (firstWord) {
                firstWords.add(firstWord);
              }
            });
            
            candidates.push(...Array.from(firstWords));
          }
          
          // Don't continue - we found matches for this partial argument
          return candidates;
        }
        
        // Otherwise, just advance past this argument
        tokenIndex++;
        defIndex++;
      }
    }
    
    // If we've consumed all user tokens AND there's a trailing space,
    // suggest next token(s)
    if (tokenIndex === tokens.length && isTrailingSpace) {
      if (defIndex < cmdDef.tokens.length) {
        // There are more tokens in the command definition to suggest
        const nextToken = cmdDef.tokens[defIndex];
        
        if (typeof nextToken === "string") {
          // Next is a keyword
          candidates.push(nextToken);
        } else {
          // Next is an argument - suggest based on type
          const argToken = nextToken as ArgToken;
          const argType = argToken.arg || argToken.optional_arg;
          
          if (argType) {
            // IOS doesn't show suggestions for interface names or VLAN IDs
            // Users must type them manually
            if (argType === "IFNAME" || argType === "VLAN_ID") {
              // Don't show any suggestions - return empty
              return candidates;
            }
            
            const suggestions = this.getSuggestionsForArgType(
              argType,
              state,
              cmdDef
            );
            candidates.push(...suggestions);
          }
        }
      }
      
      // Handle multi-word arguments: if the last user token matches the start of
      // multi-word suggestions from a previous argument, suggest the continuation
      if (tokens.length > 0 && defIndex > 0) {
        const prevDefToken = cmdDef.tokens[defIndex - 1];
        
        // Check if the previous token was an argument
        if (typeof prevDefToken !== "string") {
          const argToken = prevDefToken as ArgToken;
          const argType = argToken.arg || argToken.optional_arg;
          
          if (argType) {
            const suggestions = this.getSuggestionsForArgType(
              argType,
              state,
              cmdDef
            );
            
            const lastUserToken = tokens[tokens.length - 1];
            const multiWordMatches = suggestions.filter(s => 
              s.startsWith(lastUserToken + " ")
            );
            
            if (multiWordMatches.length > 0) {
              // Extract the word(s) after the last user token
              const nextWords = multiWordMatches.map(s => {
                const afterMatch = s.substring(lastUserToken.length + 1); // +1 for the space
                return afterMatch;
              });
              
              // Check if these look like identifiers (numbers, interface patterns)
              // IOS doesn't autocomplete interface identifiers or VLAN numbers
              // and doesn't show anything - just return empty to match IOS behavior
              const looksLikeIdentifier = nextWords.every(word => 
                /^\d+$/.test(word) || // pure numbers (VLAN IDs)
                /^\d+\/\d+/.test(word) // interface patterns like 0/0
              );
              
              if (!looksLikeIdentifier) {
                // Only show completions if they're not identifiers
                candidates.push(...nextWords);
              }
              // If they are identifiers, don't add anything (return empty)
            }
          }
        }
      }
    }
    
    return candidates;
  }
  
  /**
   * Get suggestions for an argument type
   */
  private getSuggestionsForArgType(
    argType: string,
    state: DeviceState,
    cmdDef: CommandDef
  ): string[] {
    switch (argType) {
      case "IFNAME":
        // IOS doesn't autocomplete interface names - only use defaults for pattern matching
        // Don't include interfaces from state as those would show actual configured interfaces
        const defaults = cmdDef.complete?.defaults || [
          "g0/0", "g0/1", "g0/2", "fa0/1", "fa0/2", "vlan 1", "vlan 100", "vlan 200"
        ];
        return defaults;
      
      case "VLAN_ID":
        // Suggest existing VLANs
        const vlanIds = Object.keys(state.vlans);
        return vlanIds.length > 0 ? vlanIds : ["10", "20", "100", "200"];
      
      case "IP":
        return ["<A.B.C.D>"];
      
      case "MASK":
        return ["255.255.255.0", "255.255.255.252", "255.255.0.0"];
      
      case "WORD":
        return ["<word>"];
      
      case "INT":
        return ["<number>"];
      
      case "REST_OF_LINE":
        return ["<text>"];
      
      default:
        return [`<${argType.toLowerCase()}>`];
    }
  }
  
  /**
   * Check if user token matches keyword prefix
   */
  private matchKeywordPrefix(userToken: string, keyword: string): boolean {
    const caseInsensitive = this.grammar.settings.case_insensitive;
    
    const tokenLower = caseInsensitive ? userToken.toLowerCase() : userToken;
    const keywordLower = caseInsensitive ? keyword.toLowerCase() : keyword;
    
    return keywordLower.startsWith(tokenLower);
  }
  
  /**
   * Tokenize a line (same logic as parser)
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
}

