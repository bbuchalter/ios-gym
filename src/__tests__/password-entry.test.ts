import { CLIEngine } from "../cli/engine";
import { CLISession } from "../cli-session";
import { loadGrammar } from "../grammar/loader";
import * as path from "path";

describe("Password Entry Tests - Understanding Password Entry in IOS", () => {
  let engine: CLIEngine;
  let session: CLISession;

  beforeEach(() => {
    const grammarPath = path.join(process.cwd(), "commands-2960-switch.yaml");
    const grammar = loadGrammar(grammarPath);
    
    engine = new CLIEngine(grammar);
    session = new CLISession(grammar);
  });

  describe("Enable without password configured", () => {
    test("should enter privileged mode directly when no enable secret is set", () => {
      expect(session.getPrompt()).toBe("Switch> ");
      expect(session.deviceState.enableSecret).toBeNull();
      
      const result = engine.executeCommand(session, "enable");
      
      expect(result.passwordPrompt).toBeUndefined();
      expect(session.getPrompt()).toBe("Switch# ");
    });
  });

  describe("Enable with password configured", () => {
    beforeEach(() => {
      // Configure enable secret
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "enable secret Cyb3rS3cur3!");
      engine.executeCommand(session, "end");
      engine.executeCommand(session, "disable");
      
      expect(session.getPrompt()).toBe("Switch> ");
      expect(session.deviceState.enableSecret).toBe("Cyb3rS3cur3!");
    });

    test("should prompt for password when enable secret is configured", () => {
      const result = engine.executeCommand(session, "enable");
      
      // Should return a password prompt
      expect(result.passwordPrompt).toBeDefined();
      expect(result.passwordPrompt?.prompt).toBe("Password: ");
      expect(result.passwordPrompt?.handler).toBe("verify_enable_password");
      
      // Should not change mode yet
      expect(session.getPrompt()).toBe("Switch> ");
      
      // Should store pending password prompt
      expect(session.pendingPasswordPrompt).toBeDefined();
      expect(session.pendingPasswordPrompt?.handler).toBe("verify_enable_password");
    });

    test("should accept correct password and enter privileged mode", () => {
      // Request enable
      const enableResult = engine.executeCommand(session, "enable");
      expect(enableResult.passwordPrompt).toBeDefined();
      expect(session.getPrompt()).toBe("Switch> ");
      
      // Submit correct password
      const passwordResult = engine.submitPassword(session, "Cyb3rS3cur3!");
      
      // Should succeed silently (no output on success is IOS behavior)
      expect(passwordResult.output).toEqual([]);
      
      // Should be in privileged mode now
      expect(session.getPrompt()).toBe("Switch# ");
      
      // Should clear pending prompt
      expect(session.pendingPasswordPrompt).toBeNull();
    });

    test("should reject incorrect password after 3 attempts", () => {
      // Request enable
      engine.executeCommand(session, "enable");
      expect(session.getPrompt()).toBe("Switch> ");
      
      // First wrong password - should re-prompt
      let result = engine.submitPassword(session, "WrongPassword1");
      expect(result.output).toEqual([]);
      expect(result.passwordPrompt).toBeDefined();
      expect(result.passwordPrompt?.prompt).toBe("Password: ");
      expect(session.pendingPasswordPrompt).toBeDefined();
      expect(session.pendingPasswordPrompt?.attempts).toBe(1);
      
      // Second wrong password - should re-prompt
      result = engine.submitPassword(session, "WrongPassword2");
      expect(result.output).toEqual([]);
      expect(result.passwordPrompt).toBeDefined();
      expect(result.passwordPrompt?.prompt).toBe("Password: ");
      expect(session.pendingPasswordPrompt).toBeDefined();
      expect(session.pendingPasswordPrompt?.attempts).toBe(2);
      
      // Third wrong password - should show error
      result = engine.submitPassword(session, "WrongPassword3");
      expect(result.output).toEqual(["% Bad secrets"]);
      expect(result.passwordPrompt).toBeUndefined();
      
      // Should remain in user exec mode
      expect(session.getPrompt()).toBe("Switch> ");
      
      // Should clear pending prompt
      expect(session.pendingPasswordPrompt).toBeNull();
    });

    test("should be case-sensitive for password verification", () => {
      engine.executeCommand(session, "enable");
      
      // Try with different case 3 times
      let result = engine.submitPassword(session, "cyb3rs3cur3!");
      expect(result.passwordPrompt).toBeDefined(); // Re-prompt on first attempt
      
      result = engine.submitPassword(session, "CYB3RS3CUR3!");
      expect(result.passwordPrompt).toBeDefined(); // Re-prompt on second attempt
      
      result = engine.submitPassword(session, "CYBERPATROL");
      expect(result.output).toEqual(["% Bad secrets"]); // Error on third attempt
      expect(session.getPrompt()).toBe("Switch> ");
    });

    test("should handle passwords with spaces correctly", () => {
      // First, enter the existing password to get to priv exec
      engine.executeCommand(session, "enable");
      engine.submitPassword(session, "Cyb3rS3cur3!");
      
      // Set a new password with spaces
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "enable secret My P@ssw0rd 123");
      engine.executeCommand(session, "end");
      engine.executeCommand(session, "disable");
      
      // Request enable
      engine.executeCommand(session, "enable");
      
      // Submit password with spaces
      const result = engine.submitPassword(session, "My P@ssw0rd 123");
      
      expect(result.output).toEqual([]);
      expect(session.getPrompt()).toBe("Switch# ");
    });

    test("should handle empty password submission", () => {
      engine.executeCommand(session, "enable");
      
      // Submit empty password 3 times
      let result = engine.submitPassword(session, "");
      expect(result.passwordPrompt).toBeDefined(); // Re-prompt
      
      result = engine.submitPassword(session, "");
      expect(result.passwordPrompt).toBeDefined(); // Re-prompt
      
      result = engine.submitPassword(session, "");
      expect(result.output).toEqual(["% Bad secrets"]);
      expect(session.getPrompt()).toBe("Switch> ");
    });

    test("should allow correct password on second or third attempt", () => {
      // First attempt - wrong password (re-prompt)
      engine.executeCommand(session, "enable");
      let result = engine.submitPassword(session, "wrong1");
      expect(result.passwordPrompt).toBeDefined();
      expect(session.pendingPasswordPrompt?.attempts).toBe(1);
      
      // Second attempt - correct password
      result = engine.submitPassword(session, "Cyb3rS3cur3!");
      expect(result.output).toEqual([]);
      expect(session.getPrompt()).toBe("Switch# ");
      
      // Reset and test third attempt
      engine.executeCommand(session, "disable");
      engine.executeCommand(session, "enable");
      
      // Two wrong attempts
      result = engine.submitPassword(session, "wrong1");
      expect(result.passwordPrompt).toBeDefined();
      result = engine.submitPassword(session, "wrong2");
      expect(result.passwordPrompt).toBeDefined();
      expect(session.pendingPasswordPrompt?.attempts).toBe(2);
      
      // Third attempt - correct password
      result = engine.submitPassword(session, "Cyb3rS3cur3!");
      expect(result.output).toEqual([]);
      expect(session.getPrompt()).toBe("Switch# ");
    });

    test("should not accept password submission without pending prompt", () => {
      // Try to submit password without requesting enable first
      const result = engine.submitPassword(session, "Cyb3rS3cur3!");
      
      expect(result.output).toEqual(["% No password prompt pending"]);
      expect(session.getPrompt()).toBe("Switch> ");
    });
  });

  describe("Three-attempt behavior", () => {
    beforeEach(() => {
      // Configure enable secret for these tests
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "enable secret TestSecret123");
      engine.executeCommand(session, "end");
      engine.executeCommand(session, "disable");
    });

    test("should re-prompt on first incorrect attempt", () => {
      engine.executeCommand(session, "enable");
      
      const result = engine.submitPassword(session, "WrongPassword");
      
      // Should not show error, should re-prompt
      expect(result.output).toEqual([]);
      expect(result.passwordPrompt).toBeDefined();
      expect(result.passwordPrompt?.prompt).toBe("Password: ");
      expect(session.pendingPasswordPrompt).toBeDefined();
      expect(session.pendingPasswordPrompt?.attempts).toBe(1);
    });

    test("should re-prompt on second incorrect attempt", () => {
      engine.executeCommand(session, "enable");
      
      // First wrong attempt
      let result = engine.submitPassword(session, "Wrong1");
      expect(result.passwordPrompt).toBeDefined();
      expect(session.pendingPasswordPrompt?.attempts).toBe(1);
      
      // Second wrong attempt
      result = engine.submitPassword(session, "Wrong2");
      expect(result.output).toEqual([]);
      expect(result.passwordPrompt).toBeDefined();
      expect(result.passwordPrompt?.prompt).toBe("Password: ");
      expect(session.pendingPasswordPrompt?.attempts).toBe(2);
    });

    test("should show error only on third incorrect attempt", () => {
      engine.executeCommand(session, "enable");
      
      // First two attempts - re-prompt
      let result = engine.submitPassword(session, "Wrong1");
      expect(result.passwordPrompt).toBeDefined();
      
      result = engine.submitPassword(session, "Wrong2");
      expect(result.passwordPrompt).toBeDefined();
      
      // Third attempt - show error
      result = engine.submitPassword(session, "Wrong3");
      expect(result.output).toEqual(["% Bad secrets"]);
      expect(result.passwordPrompt).toBeUndefined();
      expect(session.pendingPasswordPrompt).toBeNull();
    });

    test("should reset attempt count for new enable command", () => {
      // First enable session - fail all 3 attempts
      engine.executeCommand(session, "enable");
      engine.submitPassword(session, "Wrong1");
      engine.submitPassword(session, "Wrong2");
      let result = engine.submitPassword(session, "Wrong3");
      expect(result.output).toEqual(["% Bad secrets"]);
      
      // New enable session - should start fresh with 3 attempts
      engine.executeCommand(session, "enable");
      expect(session.pendingPasswordPrompt?.attempts).toBeUndefined(); // Fresh start
      
      result = engine.submitPassword(session, "Wrong1");
      expect(result.passwordPrompt).toBeDefined(); // First attempt of new session
      expect(session.pendingPasswordPrompt?.attempts).toBe(1);
    });
  });

  describe("Password workflow integration", () => {
    test("should work in complete workflow: configure, test, use", () => {
      // Step 1: Start in user exec
      expect(session.getPrompt()).toBe("Switch> ");
      
      // Step 2: Enter privileged mode (no password set yet)
      engine.executeCommand(session, "enable");
      expect(session.getPrompt()).toBe("Switch# ");
      
      // Step 3: Configure enable secret
      engine.executeCommand(session, "configure terminal");
      expect(session.getPrompt()).toBe("Switch(config)# ");
      
      engine.executeCommand(session, "enable secret MySecret123");
      expect(session.deviceState.enableSecret).toBe("MySecret123");
      
      // Step 4: Return to privileged mode
      engine.executeCommand(session, "end");
      expect(session.getPrompt()).toBe("Switch# ");
      
      // Step 5: Return to user mode
      engine.executeCommand(session, "disable");
      expect(session.getPrompt()).toBe("Switch> ");
      
      // Step 6: Try to enable again - should prompt for password
      let result = engine.executeCommand(session, "enable");
      expect(result.passwordPrompt).toBeDefined();
      expect(session.getPrompt()).toBe("Switch> ");
      
      // Step 7: Enter correct password
      result = engine.submitPassword(session, "MySecret123");
      expect(result.output).toEqual([]);
      expect(session.getPrompt()).toBe("Switch# ");
      
      // Step 8: Verify we can run privileged commands
      engine.executeCommand(session, "configure terminal");
      expect(session.getPrompt()).toBe("Switch(config)# ");
    });

    test("should update password and use new password", () => {
      // Set initial password
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "enable secret OldPassword");
      engine.executeCommand(session, "end");
      engine.executeCommand(session, "disable");
      
      // Verify old password works
      engine.executeCommand(session, "enable");
      let result = engine.submitPassword(session, "OldPassword");
      expect(session.getPrompt()).toBe("Switch# ");
      
      // Change password
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "enable secret NewPassword");
      engine.executeCommand(session, "end");
      engine.executeCommand(session, "disable");
      
      // Old password should not work (try 3 times)
      engine.executeCommand(session, "enable");
      result = engine.submitPassword(session, "OldPassword");
      expect(result.passwordPrompt).toBeDefined(); // Re-prompt
      
      result = engine.submitPassword(session, "OldPassword");
      expect(result.passwordPrompt).toBeDefined(); // Re-prompt
      
      result = engine.submitPassword(session, "OldPassword");
      expect(result.output).toEqual(["% Bad secrets"]);
      expect(session.getPrompt()).toBe("Switch> ");
      
      // New password should work
      engine.executeCommand(session, "enable");
      result = engine.submitPassword(session, "NewPassword");
      expect(result.output).toEqual([]);
      expect(session.getPrompt()).toBe("Switch# ");
    });

    test("should maintain password across mode transitions", () => {
      // Set password
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "enable secret TestPass123");
      
      // Go through various modes
      engine.executeCommand(session, "interface g0/1");
      expect(session.getPrompt()).toBe("Switch(config-if)# ");
      
      engine.executeCommand(session, "exit");
      expect(session.getPrompt()).toBe("Switch(config)# ");
      
      engine.executeCommand(session, "router ospf 1");
      expect(session.getPrompt()).toBe("Switch(config-router)# ");
      
      engine.executeCommand(session, "end");
      expect(session.getPrompt()).toBe("Switch# ");
      
      // Return to user mode
      engine.executeCommand(session, "disable");
      expect(session.getPrompt()).toBe("Switch> ");
      
      // Password should still be set
      const result = engine.executeCommand(session, "enable");
      expect(result.passwordPrompt).toBeDefined();
      
      // And should work
      const passwordResult = engine.submitPassword(session, "TestPass123");
      expect(session.getPrompt()).toBe("Switch# ");
    });
  });

  describe("Special characters in passwords", () => {
    test("should handle passwords with special characters", () => {
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "enable secret P@$$w0rd!#%&*()");
      engine.executeCommand(session, "end");
      engine.executeCommand(session, "disable");
      
      engine.executeCommand(session, "enable");
      const result = engine.submitPassword(session, "P@$$w0rd!#%&*()");
      
      expect(result.output).toEqual([]);
      expect(session.getPrompt()).toBe("Switch# ");
    });

    test("should handle passwords with numbers", () => {
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "enable secret 123456789");
      engine.executeCommand(session, "end");
      engine.executeCommand(session, "disable");
      
      engine.executeCommand(session, "enable");
      const result = engine.submitPassword(session, "123456789");
      
      expect(result.output).toEqual([]);
      expect(session.getPrompt()).toBe("Switch# ");
    });

    test("should handle very long passwords", () => {
      const longPassword = "ThisIsAVeryLongPasswordThatSomeoneDecidedToUseForSomeReason123!@#";
      
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, `enable secret ${longPassword}`);
      engine.executeCommand(session, "end");
      engine.executeCommand(session, "disable");
      
      engine.executeCommand(session, "enable");
      const result = engine.submitPassword(session, longPassword);
      
      expect(result.output).toEqual([]);
      expect(session.getPrompt()).toBe("Switch# ");
    });
  });
});

