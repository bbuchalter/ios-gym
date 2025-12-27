import { CLIEngine } from "../cli/engine";
import { CLISession } from "../cli-session";
import { loadGrammar } from "../grammar/loader";
import * as path from "path";

describe("No Command Tests - Removing Configuration", () => {
  let engine: CLIEngine;
  let session: CLISession;

  beforeEach(() => {
    const grammarPath = path.join(process.cwd(), "commands-2960-switch.yaml");
    const grammar = loadGrammar(grammarPath);
    
    engine = new CLIEngine(grammar);
    session = new CLISession(grammar);
  });

  describe("no hostname command", () => {
    test("should reset hostname to default 'Switch'", () => {
      // Set a custom hostname
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "hostname Router1");
      
      expect(session.deviceState.hostname).toBe("Router1");
      expect(session.getPrompt()).toBe("Router1(config)# ");
      
      // Remove hostname (reset to default)
      engine.executeCommand(session, "no hostname");
      
      expect(session.deviceState.hostname).toBe("Switch");
      expect(session.getPrompt()).toBe("Switch(config)# ");
    });

    test("should work when hostname is already at default", () => {
      // Don't change hostname, just try to remove it
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      
      expect(session.deviceState.hostname).toBe("Switch");
      
      // Remove hostname (already at default)
      const result = engine.executeCommand(session, "no hostname");
      
      expect(result.output).toEqual([]);
      expect(session.deviceState.hostname).toBe("Switch");
    });

    test("should reset hostname after multiple changes", () => {
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      
      // Change hostname multiple times
      engine.executeCommand(session, "hostname Router1");
      expect(session.deviceState.hostname).toBe("Router1");
      
      engine.executeCommand(session, "hostname CoreSwitch");
      expect(session.deviceState.hostname).toBe("CoreSwitch");
      
      engine.executeCommand(session, "hostname DistributionLayer");
      expect(session.deviceState.hostname).toBe("DistributionLayer");
      
      // Reset to default
      engine.executeCommand(session, "no hostname");
      expect(session.deviceState.hostname).toBe("Switch");
    });
  });

  describe("no enable secret command", () => {
    test("should remove enable secret password", () => {
      // Set a password
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "enable secret MyPassword123");
      
      expect(session.deviceState.enableSecret).toBe("MyPassword123");
      
      // Remove the password
      engine.executeCommand(session, "no enable secret");
      
      expect(session.deviceState.enableSecret).toBeNull();
    });

    test("should work when no secret is set", () => {
      // Don't set a password, just try to remove it
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      
      expect(session.deviceState.enableSecret).toBeNull();
      
      // Remove (non-existent) secret
      const result = engine.executeCommand(session, "no enable secret");
      
      expect(result.output).toEqual([]);
      expect(session.deviceState.enableSecret).toBeNull();
    });

    test("should allow enable without password after removal", () => {
      // Set a password
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "enable secret TestSecret");
      engine.executeCommand(session, "end");
      engine.executeCommand(session, "disable");
      
      // Verify password is required
      let result = engine.executeCommand(session, "enable");
      expect(result.passwordPrompt).toBeDefined();
      
      // Cancel by going back to config
      session.pendingPasswordPrompt = null;
      engine.executeCommand(session, "enable");
      engine.submitPassword(session, "TestSecret");
      engine.executeCommand(session, "configure terminal");
      
      // Remove the password
      engine.executeCommand(session, "no enable secret");
      engine.executeCommand(session, "end");
      engine.executeCommand(session, "disable");
      
      // Now enable should work without password
      result = engine.executeCommand(session, "enable");
      expect(result.passwordPrompt).toBeUndefined();
      expect(session.getPrompt()).toBe("Switch# ");
    });
  });

  describe("Workflow: Set and Remove Configuration", () => {
    test("should handle complete configuration lifecycle", () => {
      // Start in user exec
      expect(session.getPrompt()).toBe("Switch> ");
      
      // Enter config mode
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      
      // Set hostname
      engine.executeCommand(session, "hostname Lab-Router");
      expect(session.deviceState.hostname).toBe("Lab-Router");
      expect(session.getPrompt()).toBe("Lab-Router(config)# ");
      
      // Set password
      engine.executeCommand(session, "enable secret Lab@Pass123");
      expect(session.deviceState.enableSecret).toBe("Lab@Pass123");
      
      // Exit and test password
      engine.executeCommand(session, "end");
      engine.executeCommand(session, "disable");
      expect(session.getPrompt()).toBe("Lab-Router> ");
      
      let result = engine.executeCommand(session, "enable");
      expect(result.passwordPrompt).toBeDefined();
      
      // Enter correct password
      result = engine.submitPassword(session, "Lab@Pass123");
      expect(session.getPrompt()).toBe("Lab-Router# ");
      
      // Go back to config and remove everything
      engine.executeCommand(session, "configure terminal");
      
      engine.executeCommand(session, "no enable secret");
      expect(session.deviceState.enableSecret).toBeNull();
      
      engine.executeCommand(session, "no hostname");
      expect(session.deviceState.hostname).toBe("Switch");
      expect(session.getPrompt()).toBe("Switch(config)# ");
      
      // Exit and verify no password needed
      engine.executeCommand(session, "end");
      engine.executeCommand(session, "disable");
      
      result = engine.executeCommand(session, "enable");
      expect(result.passwordPrompt).toBeUndefined();
      expect(session.getPrompt()).toBe("Switch# ");
    });

    test("should handle partial removal (hostname only)", () => {
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      
      // Set both
      engine.executeCommand(session, "hostname TestRouter");
      engine.executeCommand(session, "enable secret TestPass");
      
      // Remove only hostname
      engine.executeCommand(session, "no hostname");
      
      expect(session.deviceState.hostname).toBe("Switch");
      expect(session.deviceState.enableSecret).toBe("TestPass");
    });

    test("should handle partial removal (secret only)", () => {
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      
      // Set both
      engine.executeCommand(session, "hostname TestRouter");
      engine.executeCommand(session, "enable secret TestPass");
      
      // Remove only secret
      engine.executeCommand(session, "no enable secret");
      
      expect(session.deviceState.hostname).toBe("TestRouter");
      expect(session.deviceState.enableSecret).toBeNull();
    });

    test("should allow re-setting after removal", () => {
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      
      // Set, remove, set again
      engine.executeCommand(session, "hostname Router1");
      expect(session.deviceState.hostname).toBe("Router1");
      
      engine.executeCommand(session, "no hostname");
      expect(session.deviceState.hostname).toBe("Switch");
      
      engine.executeCommand(session, "hostname Router2");
      expect(session.deviceState.hostname).toBe("Router2");
      
      // Same for secret
      engine.executeCommand(session, "enable secret Pass1");
      expect(session.deviceState.enableSecret).toBe("Pass1");
      
      engine.executeCommand(session, "no enable secret");
      expect(session.deviceState.enableSecret).toBeNull();
      
      engine.executeCommand(session, "enable secret Pass2");
      expect(session.deviceState.enableSecret).toBe("Pass2");
    });
  });

  describe("Command abbreviation support", () => {
    test("should support 'no' with abbreviated commands", () => {
      engine.executeCommand(session, "en");
      engine.executeCommand(session, "conf t");
      
      // Set full commands
      engine.executeCommand(session, "hostname TestDevice");
      engine.executeCommand(session, "enable secret TestSecret");
      
      // Remove with abbreviations
      engine.executeCommand(session, "no hos");
      expect(session.deviceState.hostname).toBe("Switch");
      
      engine.executeCommand(session, "no en sec");
      expect(session.deviceState.enableSecret).toBeNull();
    });
  });

  describe("Error cases and edge cases", () => {
    test("should not accept 'no hostname' with arguments", () => {
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      
      const result = engine.executeCommand(session, "no hostname SomeValue");
      
      // Should be invalid command (doesn't match the 'no hostname' pattern)
      expect(result.output[0]).toContain("%");
    });

    test("should not accept 'no enable secret' with arguments", () => {
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      
      const result = engine.executeCommand(session, "no enable secret SomeValue");
      
      // Should be invalid command
      expect(result.output[0]).toContain("%");
    });
  });

  describe("Tab completion with 'no' command", () => {
    test("should provide completion suggestions for 'no' commands", () => {
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      
      // Tab after "no "
      const completion = engine.getCompletion(session, "no ", 3);
      
      // Should include both hostname and enable as options
      expect(completion.type).toBe("list");
      if (completion.options) {
        expect(completion.options).toContain("hostname");
        expect(completion.options).toContain("enable");
      }
    });
  });
});


