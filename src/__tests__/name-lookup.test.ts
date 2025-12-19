import { CLIEngine } from "../cli/engine";
import { CLISession } from "../cli-session";
import { CommandGrammar, ModeType } from "../types";
import { loadGrammar } from "../grammar/loader";
import * as path from "path";

describe("Name Lookup Behavior", () => {
  let grammar: CommandGrammar;
  let engine: CLIEngine;
  let session: CLISession;

  beforeAll(() => {
    const grammarPath = path.join(process.cwd(), "commands.yaml");
    grammar = loadGrammar(grammarPath);
  });

  beforeEach(() => {
    engine = new CLIEngine(grammar);
    session = new CLISession(grammar);
  });

  describe("Single-word unrecognized commands", () => {
    test("should trigger name lookup for 'end' in USER_EXEC mode", () => {
      const result = engine.executeCommand(session, "end");
      
      expect(result.nameLookup).toBeDefined();
      expect(result.nameLookup?.hostname).toBe("end");
      expect(result.output).toEqual([]);
    });

    test("should trigger name lookup for random word", () => {
      const result = engine.executeCommand(session, "test");
      
      expect(result.nameLookup).toBeDefined();
      expect(result.nameLookup?.hostname).toBe("test");
    });

    test("should trigger name lookup for misspelled command", () => {
      const result = engine.executeCommand(session, "cofigure");
      
      expect(result.nameLookup).toBeDefined();
      expect(result.nameLookup?.hostname).toBe("cofigure");
    });

    test("should trigger name lookup for Linux commands", () => {
      const result = engine.executeCommand(session, "ls");
      
      expect(result.nameLookup).toBeDefined();
      expect(result.nameLookup?.hostname).toBe("ls");
    });

    test("should trigger name lookup for hostname-like strings", () => {
      const result = engine.executeCommand(session, "router1");
      
      expect(result.nameLookup).toBeDefined();
      expect(result.nameLookup?.hostname).toBe("router1");
    });
  });

  describe("Multi-word invalid commands", () => {
    test("should show error (not name lookup) for multi-word commands", () => {
      const result = engine.executeCommand(session, "show invalid command");
      
      expect(result.nameLookup).toBeUndefined();
      expect(result.output.length).toBeGreaterThan(0);
      expect(result.output.join("\n")).toContain("^");
    });

    test("should show error for partially matching commands", () => {
      const result = engine.executeCommand(session, "enable secret");
      
      // "enable" doesn't take "secret" in USER_EXEC mode
      expect(result.nameLookup).toBeUndefined();
      expect(result.output.length).toBeGreaterThan(0);
    });
  });

  describe("Valid commands should not trigger name lookup", () => {
    test("should execute 'enable' normally", () => {
      const result = engine.executeCommand(session, "enable");
      
      expect(result.nameLookup).toBeUndefined();
      // Mode should change to PRIV_EXEC (no password when not set)
      expect(session.modeStack.getCurrentMode()).toBe(ModeType.PRIV_EXEC);
    });

    test("should execute 'exit' normally", () => {
      const result = engine.executeCommand(session, "exit");
      
      expect(result.nameLookup).toBeUndefined();
      expect(result.sessionEnd).toBe(true);
    });

    test("should execute abbreviated commands normally", () => {
      const result = engine.executeCommand(session, "en");
      
      expect(result.nameLookup).toBeUndefined();
      // Mode should change to PRIV_EXEC (no password when not set)
      expect(session.modeStack.getCurrentMode()).toBe(ModeType.PRIV_EXEC);
    });
  });

  describe("Mode-specific name lookup behavior", () => {
    test("should trigger name lookup in PRIV_EXEC mode", () => {
      // First get to PRIV_EXEC
      session.modeStack.push(ModeType.PRIV_EXEC);
      
      const result = engine.executeCommand(session, "invalid");
      
      expect(result.nameLookup).toBeDefined();
      expect(result.nameLookup?.hostname).toBe("invalid");
    });

    test("should trigger name lookup in GLOBAL_CONFIG mode", () => {
      session.modeStack.push(ModeType.PRIV_EXEC);
      session.modeStack.push(ModeType.GLOBAL_CONFIG);
      
      const result = engine.executeCommand(session, "invalid");
      
      expect(result.nameLookup).toBeDefined();
      expect(result.nameLookup?.hostname).toBe("invalid");
    });
  });
});

