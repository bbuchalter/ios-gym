import { TabCompleter } from "../cli/completer";
import { loadGrammar } from "../grammar/loader";
import { ModeType } from "../types";
import { createInitialState } from "../cli/state";
import * as path from "path";

describe("TabCompleter", () => {
  let completer: TabCompleter;
  let state: any;

  beforeEach(() => {
    const grammarPath = path.join(process.cwd(), "commands.yaml");
    const grammar = loadGrammar(grammarPath);
    completer = new TabCompleter(grammar);
    state = createInitialState();
  });

  describe("USER_EXEC Mode", () => {
    test("should complete 'en' to 'enable'", () => {
      const result = completer.complete("en", 2, ModeType.USER_EXEC, state);
      
      expect(result.type).toBe("complete");
      expect(result.value).toBe("able");
    });

    test("should complete 'show' exactly", () => {
      const result = completer.complete("show", 4, ModeType.USER_EXEC, state);
      
      // Should not add anything since 'show' is a complete match
      expect(result.type).toBe("complete");
      expect(result.value).toBe("");
    });

    test("should complete 'sh' to 'show' (single match)", () => {
      const result = completer.complete("sh", 2, ModeType.USER_EXEC, state);
      
      // 'sh' uniquely matches 'show' so it should complete
      expect(result.type).toBe("complete");
      expect(result.value).toBe("ow");
    });

    test("should complete with trailing space 'enable '", () => {
      const result = completer.complete("enable ", 7, ModeType.USER_EXEC, state);
      
      // No further options after 'enable '
      expect(result.type).toBe("list");
    });
  });

  describe("PRIV_EXEC Mode", () => {
    test("should complete 'conf' to 'configure'", () => {
      const result = completer.complete("conf", 4, ModeType.PRIV_EXEC, state);
      
      expect(result.type).toBe("complete");
      expect(result.value).toBe("igure");
    });

    test("should complete 'configure t' to 'configure terminal'", () => {
      const result = completer.complete("configure t", 11, ModeType.PRIV_EXEC, state);
      
      expect(result.type).toBe("complete");
      expect(result.value).toBe("erminal");
    });

    test("should complete 'terminal' after 'configure ' (single option)", () => {
      const result = completer.complete("configure ", 10, ModeType.PRIV_EXEC, state);
      
      // Only one option after 'configure' which is 'terminal'
      expect(result.type).toBe("complete");
      expect(result.value).toBe("terminal");
    });

    test("should complete 'sh' to 'show'", () => {
      const result = completer.complete("sh", 2, ModeType.PRIV_EXEC, state);
      
      expect(result.type).toBe("complete");
      expect(result.value).toBe("ow");
    });

    test("should list show command options after 'show '", () => {
      const result = completer.complete("show ", 5, ModeType.PRIV_EXEC, state);
      
      expect(result.type).toBe("list");
      expect(result.options).toContain("running-config");
      expect(result.options).toContain("vlan");
      expect(result.options).toContain("ip");
    });
  });

  describe("GLOBAL_CONFIG Mode", () => {
    test("should complete 'host' to 'hostname'", () => {
      const result = completer.complete("host", 4, ModeType.GLOBAL_CONFIG, state);
      
      expect(result.type).toBe("complete");
      expect(result.value).toBe("name");
    });

    test("should complete 'int' to 'interface'", () => {
      const result = completer.complete("int", 3, ModeType.GLOBAL_CONFIG, state);
      
      expect(result.type).toBe("complete");
      expect(result.value).toBe("erface");
    });

    test("should show nothing after 'interface ' (IOS doesn't autocomplete interface names)", () => {
      const result = completer.complete("interface ", 10, ModeType.GLOBAL_CONFIG, state);
      
      expect(result.type).toBe("list");
      expect(result.options).toBeDefined();
      // IOS doesn't autocomplete interface names - user must type them
      expect(result.options).toEqual([]);
    });

    test("should complete 'interface v' to 'interface vlan'", () => {
      const result = completer.complete("interface v", 11, ModeType.GLOBAL_CONFIG, state);
      
      // Should complete just the keyword 'vlan', not suggest specific VLAN IDs
      expect(result.type).toBe("complete");
      expect(result.value).toBe("lan");
    });

    test("should show nothing after 'interface vlan '", () => {
      const result = completer.complete("interface vlan ", 15, ModeType.GLOBAL_CONFIG, state);
      
      expect(result.type).toBe("list");
      expect(result.options).toBeDefined();
      // IOS doesn't show anything - no placeholders, no suggestions
      // User must type the VLAN number manually
      expect(result.options).toEqual([]);
    });

    test("should complete 'vl' to 'vlan'", () => {
      const result = completer.complete("vl", 2, ModeType.GLOBAL_CONFIG, state);
      
      expect(result.type).toBe("complete");
      expect(result.value).toBe("an");
    });

    test("should complete 'router o' to 'router ospf'", () => {
      const result = completer.complete("router o", 8, ModeType.GLOBAL_CONFIG, state);
      
      expect(result.type).toBe("complete");
      expect(result.value).toBe("spf");
    });
  });

  describe("IF_CONFIG Mode", () => {
    test("should complete 'ip add' to 'ip address'", () => {
      const result = completer.complete("ip add", 6, ModeType.IF_CONFIG, state);
      
      expect(result.type).toBe("complete");
      expect(result.value).toBe("ress");
    });

    test("should complete 'no sh' to 'no shutdown'", () => {
      const result = completer.complete("no sh", 5, ModeType.IF_CONFIG, state);
      
      expect(result.type).toBe("complete");
      expect(result.value).toBe("utdown");
    });

    test("should complete 'switchport m' to 'switchport mode'", () => {
      const result = completer.complete("switchport m", 12, ModeType.IF_CONFIG, state);
      
      expect(result.type).toBe("complete");
      expect(result.value).toBe("ode");
    });

    test("should list mode options after 'switchport mode '", () => {
      const result = completer.complete("switchport mode ", 16, ModeType.IF_CONFIG, state);
      
      expect(result.type).toBe("list");
      expect(result.options).toContain("access");
      expect(result.options).toContain("trunk");
    });
  });

  describe("Partial Completion", () => {
    test("should handle completion in middle of word", () => {
      const result = completer.complete("ena", 3, ModeType.USER_EXEC, state);
      
      expect(result.type).toBe("complete");
      expect(result.value).toBe("ble");
    });

    test("should handle empty string", () => {
      const result = completer.complete("", 0, ModeType.USER_EXEC, state);
      
      expect(result.type).toBe("list");
      expect(result.options).toBeDefined();
    });

    test("should handle completion at end of multi-word command", () => {
      const result = completer.complete("configure term", 14, ModeType.PRIV_EXEC, state);
      
      expect(result.type).toBe("complete");
      expect(result.value).toBe("inal");
    });
  });

  describe("Case Insensitivity", () => {
    test("should complete case-insensitive 'ENABLE'", () => {
      const result = completer.complete("ENABLE", 6, ModeType.USER_EXEC, state);
      
      // Should recognize it's complete
      expect(result.type).toBe("complete");
    });

    test("should complete case-insensitive 'En'", () => {
      const result = completer.complete("En", 2, ModeType.USER_EXEC, state);
      
      expect(result.type).toBe("complete");
      expect(result.value).toBe("able");
    });
  });

  describe("No Matches", () => {
    test("should return empty list for invalid command", () => {
      const result = completer.complete("invalid", 7, ModeType.USER_EXEC, state);
      
      expect(result.type).toBe("list");
      expect(result.options).toEqual([]);
    });

    test("should return empty list for command not in mode", () => {
      const result = completer.complete("configure", 9, ModeType.USER_EXEC, state);
      
      // configure is not available in USER_EXEC
      expect(result.type).toBe("list");
      expect(result.options).toEqual([]);
    });
  });
});

