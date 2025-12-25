import { CLIEngine } from "../cli/engine";
import { CLISession } from "../cli-session";
import { CommandGrammar } from "../types";
import { loadGrammar } from "../grammar/loader";
import * as path from "path";

describe("Logging Synchronous Tests", () => {
  let grammar: CommandGrammar;
  let engine: CLIEngine;
  let session: CLISession;

  beforeEach(() => {
    const grammarPath = path.join(process.cwd(), "commands.yaml");
    grammar = loadGrammar(grammarPath);
    engine = new CLIEngine(grammar);
    session = new CLISession(grammar);
  });

  describe("System Message on 'end' Command", () => {
    it("should display system message when exiting config mode with 'end'", () => {
      // Navigate to config mode
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      
      // Exit with 'end'
      const result = engine.executeCommand(session, "end");
      
      expect(result.output).toContain("%SYS-5-CONFIG_I: Configured from console by console");
      expect(session.modeStack.getCurrentMode()).toBe("PRIV_EXEC");
    });

    it("should display system message when exiting from interface config with 'end'", () => {
      // Navigate deep into config
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "interface vlan 1");
      
      // Exit with 'end'
      const result = engine.executeCommand(session, "end");
      
      expect(result.output).toContain("%SYS-5-CONFIG_I: Configured from console by console");
      expect(session.modeStack.getCurrentMode()).toBe("PRIV_EXEC");
    });

    it("should NOT display system message when using 'exit' one level at a time", () => {
      // Navigate to interface config
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "interface vlan 1");
      
      // Exit one level at a time
      const result1 = engine.executeCommand(session, "exit");
      expect(result1.output).toEqual([]);
      expect(session.modeStack.getCurrentMode()).toBe("GLOBAL_CONFIG");
      
      const result2 = engine.executeCommand(session, "exit");
      expect(result2.output).toEqual([]);
      expect(session.modeStack.getCurrentMode()).toBe("PRIV_EXEC");
    });

    it("should NOT display system message when already in PRIV_EXEC", () => {
      // Start in privileged mode
      engine.executeCommand(session, "enable");
      
      // Try to use 'end' (though it's not available in PRIV_EXEC normally)
      // This test just ensures we don't show the message when not coming from config
      expect(session.modeStack.getCurrentMode()).toBe("PRIV_EXEC");
    });
  });

  describe("Line Console Configuration", () => {
    it("should enter line console config mode", () => {
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      
      const result = engine.executeCommand(session, "line console 0");
      
      expect(result.output).toEqual([]);
      expect(session.modeStack.getCurrentMode()).toBe("LINE_CONSOLE_CONFIG");
      expect(session.getPrompt()).toBe("Switch(config-line)# ");
    });

    it("should configure logging synchronous", () => {
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "line console 0");
      
      // Initially false
      expect(session.deviceState.line.console.loggingSynchronous).toBe(false);
      
      // Enable logging synchronous
      const result = engine.executeCommand(session, "logging synchronous");
      
      expect(result.output).toEqual([]);
      expect(session.deviceState.line.console.loggingSynchronous).toBe(true);
    });

    it("should disable logging synchronous with 'no' command", () => {
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "line console 0");
      
      // Enable it first
      engine.executeCommand(session, "logging synchronous");
      expect(session.deviceState.line.console.loggingSynchronous).toBe(true);
      
      // Disable it
      const result = engine.executeCommand(session, "no logging synchronous");
      
      expect(result.output).toEqual([]);
      expect(session.deviceState.line.console.loggingSynchronous).toBe(false);
    });

    it("should exit line console config with 'exit'", () => {
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "line console 0");
      
      const result = engine.executeCommand(session, "exit");
      
      expect(result.output).toEqual([]);
      expect(session.modeStack.getCurrentMode()).toBe("GLOBAL_CONFIG");
    });

    it("should exit line console config with 'end' and show system message", () => {
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "line console 0");
      
      const result = engine.executeCommand(session, "end");
      
      expect(result.output).toContain("%SYS-5-CONFIG_I: Configured from console by console");
      expect(session.modeStack.getCurrentMode()).toBe("PRIV_EXEC");
    });
  });

  describe("Complete Workflow", () => {
    it("should complete the full logging synchronous configuration workflow", () => {
      // Start from user mode
      expect(session.getPrompt()).toBe("Switch> ");
      
      // Enter privileged mode
      engine.executeCommand(session, "enable");
      expect(session.getPrompt()).toBe("Switch# ");
      
      // Enter global config
      engine.executeCommand(session, "configure terminal");
      expect(session.getPrompt()).toBe("Switch(config)# ");
      
      // Enter interface config (go deep)
      engine.executeCommand(session, "interface vlan 1");
      expect(session.getPrompt()).toBe("Switch(config-if)# ");
      
      // Exit with 'end' - should show message
      let result = engine.executeCommand(session, "end");
      expect(result.output).toContain("%SYS-5-CONFIG_I: Configured from console by console");
      expect(session.getPrompt()).toBe("Switch# ");
      
      // Configure logging synchronous
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "line console 0");
      expect(session.getPrompt()).toBe("Switch(config-line)# ");
      
      engine.executeCommand(session, "logging synchronous");
      expect(session.deviceState.line.console.loggingSynchronous).toBe(true);
      
      // Exit with 'end' - should still show message (but synchronized)
      result = engine.executeCommand(session, "end");
      expect(result.output).toContain("%SYS-5-CONFIG_I: Configured from console by console");
      expect(session.getPrompt()).toBe("Switch# ");
    });
  });
});

