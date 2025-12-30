import { CLIEngine } from "../cli/engine";
import { CLISession } from "../cli-session";
import { loadGrammar } from "../grammar/loader";
import { ModeType } from "../types";
import * as path from "path";

describe("Invalid Interface Validation", () => {
  describe("2960 Switch - Invalid interfaces should be rejected", () => {
    let engine: CLIEngine;
    let session: CLISession;

    beforeEach(() => {
      const grammarPath = path.join(__dirname, "../../grammar/commands-2960-switch.yaml");
      const grammar = loadGrammar(grammarPath);
      engine = new CLIEngine(grammar);
      session = new CLISession(grammar, "2960-switch");
      
      // Start in privileged EXEC mode
      session.modeStack.push(ModeType.PRIV_EXEC);
      
      // Enter global config mode
      engine.executeCommand(session, "configure terminal");
    });

    test("Stackable interface g1/0/1 should be rejected on 2960", () => {
      const result = engine.executeCommand(session, "interface g1/0/1");
      
      expect(result.output).toContain("% Invalid input detected at '^' marker.");
      expect(result.output.some(line => line.includes("^"))).toBe(true);
      
      // Should NOT create the interface
      expect(session.deviceState.interfaces["g1/0/1"]).toBeUndefined();
      
      // Should NOT enter interface config mode
      expect(session.modeStack.getCurrentMode()).toBe(ModeType.GLOBAL_CONFIG);
    });

    test("Stackable interface g1/0/2 should be rejected on 2960", () => {
      const result = engine.executeCommand(session, "interface g1/0/2");
      
      expect(result.output).toContain("% Invalid input detected at '^' marker.");
      expect(session.deviceState.interfaces["g1/0/2"]).toBeUndefined();
      expect(session.modeStack.getCurrentMode()).toBe(ModeType.GLOBAL_CONFIG);
    });

    test("Invalid GigabitEthernet g0/3 should be rejected (2960 only has g0/1-2)", () => {
      const result = engine.executeCommand(session, "interface g0/3");
      
      expect(result.output).toContain("% Invalid input detected at '^' marker.");
      expect(session.deviceState.interfaces["g0/3"]).toBeUndefined();
      expect(session.modeStack.getCurrentMode()).toBe(ModeType.GLOBAL_CONFIG);
    });

    test("Invalid FastEthernet fa0/25 should be rejected (2960 only has fa0/1-24)", () => {
      const result = engine.executeCommand(session, "interface fa0/25");
      
      expect(result.output).toContain("% Invalid input detected at '^' marker.");
      expect(session.deviceState.interfaces["fa0/25"]).toBeUndefined();
      expect(session.modeStack.getCurrentMode()).toBe(ModeType.GLOBAL_CONFIG);
    });

    test("Invalid FastEthernet fa0/0 should be rejected (numbering starts at 1)", () => {
      const result = engine.executeCommand(session, "interface fa0/0");
      
      expect(result.output).toContain("% Invalid input detected at '^' marker.");
      expect(session.deviceState.interfaces["fa0/0"]).toBeUndefined();
    });

    test("Completely invalid interface g99/99/99 should be rejected", () => {
      const result = engine.executeCommand(session, "interface g99/99/99");
      
      expect(result.output).toContain("% Invalid input detected at '^' marker.");
      expect(session.deviceState.interfaces["g99/99/99"]).toBeUndefined();
    });

    test("Valid interface g0/1 should be accepted", () => {
      const result = engine.executeCommand(session, "interface g0/1");
      
      expect(result.output).not.toContain("Invalid input");
      expect(result.output).not.toContain("^");
      expect(session.modeStack.getCurrentMode()).toBe(ModeType.IF_CONFIG);
      expect(session.deviceState.interfaces["g0/1"]).toBeDefined();
    });

    test("Valid interface g0/2 should be accepted", () => {
      const result = engine.executeCommand(session, "interface g0/2");
      
      expect(result.output).not.toContain("Invalid input");
      expect(session.modeStack.getCurrentMode()).toBe(ModeType.IF_CONFIG);
      expect(session.deviceState.interfaces["g0/2"]).toBeDefined();
    });

    test("Valid FastEthernet fa0/1 should be accepted", () => {
      const result = engine.executeCommand(session, "interface fa0/1");
      
      expect(result.output).not.toContain("Invalid input");
      expect(session.modeStack.getCurrentMode()).toBe(ModeType.IF_CONFIG);
      expect(session.deviceState.interfaces["fa0/1"]).toBeDefined();
    });

    test("Valid FastEthernet fa0/24 should be accepted", () => {
      const result = engine.executeCommand(session, "interface fa0/24");
      
      expect(result.output).not.toContain("Invalid input");
      expect(session.modeStack.getCurrentMode()).toBe(ModeType.IF_CONFIG);
      expect(session.deviceState.interfaces["fa0/24"]).toBeDefined();
    });

    test("Valid VLAN interface should be accepted", () => {
      const result = engine.executeCommand(session, "interface vlan 100");
      
      expect(result.output).not.toContain("Invalid input");
      expect(session.modeStack.getCurrentMode()).toBe(ModeType.IF_CONFIG);
      expect(session.deviceState.interfaces["vlan100"]).toBeDefined();
    });
  });

  describe("1941 Router - Invalid interfaces should be rejected", () => {
    let engine: CLIEngine;
    let session: CLISession;

    beforeEach(() => {
      const grammarPath = path.join(__dirname, "../../grammar/commands-1941-router.yaml");
      const grammar = loadGrammar(grammarPath);
      engine = new CLIEngine(grammar);
      session = new CLISession(grammar, "1941-router");
      
      // Start in privileged EXEC mode
      session.modeStack.push(ModeType.PRIV_EXEC);
      
      // Enter global config mode
      engine.executeCommand(session, "configure terminal");
    });

    test("Invalid interface g0/2 should be rejected (1941 only has g0/0-1)", () => {
      const result = engine.executeCommand(session, "interface g0/2");
      
      expect(result.output).toContain("% Invalid input detected at '^' marker.");
      expect(session.deviceState.interfaces["g0/2"]).toBeUndefined();
      expect(session.modeStack.getCurrentMode()).toBe(ModeType.GLOBAL_CONFIG);
    });

    test("Stackable interface g1/0/1 should be rejected on 1941", () => {
      const result = engine.executeCommand(session, "interface g1/0/1");
      
      expect(result.output).toContain("% Invalid input detected at '^' marker.");
      expect(session.deviceState.interfaces["g1/0/1"]).toBeUndefined();
      expect(session.modeStack.getCurrentMode()).toBe(ModeType.GLOBAL_CONFIG);
    });

    test("FastEthernet should be rejected on router (routers don't have FastEthernet)", () => {
      const result = engine.executeCommand(session, "interface fa0/1");
      
      expect(result.output.some(line => line.includes("% Invalid input detected at '^' marker."))).toBe(true);
      expect(session.deviceState.interfaces["fa0/1"]).toBeUndefined();
      expect(session.modeStack.getCurrentMode()).toBe(ModeType.GLOBAL_CONFIG);
    });

    test("Valid interface g0/0 should be accepted", () => {
      const result = engine.executeCommand(session, "interface g0/0");
      
      expect(result.output).not.toContain("Invalid input");
      expect(session.modeStack.getCurrentMode()).toBe(ModeType.IF_CONFIG);
      expect(session.deviceState.interfaces["g0/0"]).toBeDefined();
    });

    test("Valid interface g0/1 should be accepted", () => {
      const result = engine.executeCommand(session, "interface g0/1");
      
      expect(result.output).not.toContain("Invalid input");
      expect(session.modeStack.getCurrentMode()).toBe(ModeType.IF_CONFIG);
      expect(session.deviceState.interfaces["g0/1"]).toBeDefined();
    });

    test("Valid VLAN interface should be accepted", () => {
      const result = engine.executeCommand(session, "interface vlan 1");
      
      expect(result.output).not.toContain("Invalid input");
      expect(session.modeStack.getCurrentMode()).toBe(ModeType.IF_CONFIG);
      expect(session.deviceState.interfaces["vlan1"]).toBeDefined();
    });
  });

  describe("Interface validation with abbreviations", () => {
    let engine: CLIEngine;
    let session: CLISession;

    beforeEach(() => {
      const grammarPath = path.join(__dirname, "../../grammar/commands-2960-switch.yaml");
      const grammar = loadGrammar(grammarPath);
      engine = new CLIEngine(grammar);
      session = new CLISession(grammar, "2960-switch");
      
      session.modeStack.push(ModeType.PRIV_EXEC);
      engine.executeCommand(session, "configure terminal");
    });

    test("Abbreviated 'gi' form should work for valid interfaces", () => {
      const result = engine.executeCommand(session, "interface gi0/1");
      
      expect(result.output).not.toContain("Invalid input");
      expect(session.modeStack.getCurrentMode()).toBe(ModeType.IF_CONFIG);
      expect(session.deviceState.interfaces["g0/1"]).toBeDefined();
    });

    test("Abbreviated 'gi' form should reject invalid interfaces", () => {
      const result = engine.executeCommand(session, "interface gi1/0/1");
      
      expect(result.output).toContain("% Invalid input detected at '^' marker.");
      expect(session.deviceState.interfaces["g1/0/1"]).toBeUndefined();
    });

    test("Full 'gigabitethernet' form should work for valid interfaces", () => {
      const result = engine.executeCommand(session, "interface gigabitethernet0/2");
      
      expect(result.output).not.toContain("Invalid input");
      expect(session.modeStack.getCurrentMode()).toBe(ModeType.IF_CONFIG);
      expect(session.deviceState.interfaces["g0/2"]).toBeDefined();
    });

    test("Full 'gigabitethernet' form should reject invalid interfaces", () => {
      const result = engine.executeCommand(session, "interface gigabitethernet1/0/2");
      
      expect(result.output).toContain("% Invalid input detected at '^' marker.");
      expect(session.deviceState.interfaces["g1/0/2"]).toBeUndefined();
    });
  });

  describe("Error message formatting", () => {
    let engine: CLIEngine;
    let session: CLISession;

    beforeEach(() => {
      const grammarPath = path.join(__dirname, "../../grammar/commands-2960-switch.yaml");
      const grammar = loadGrammar(grammarPath);
      engine = new CLIEngine(grammar);
      session = new CLISession(grammar, "2960-switch");
      
      session.modeStack.push(ModeType.PRIV_EXEC);
      engine.executeCommand(session, "configure terminal");
    });

    test("Error marker should point to the interface argument", () => {
      const result = engine.executeCommand(session, "interface g1/0/1");
      
      // Should have two lines: the caret line and the error message
      expect(result.output).toHaveLength(2);
      expect(result.output[0]).toContain("^");
      expect(result.output[1]).toBe("% Invalid input detected at '^' marker.");
    });

    test("Error marker spacing should be appropriate", () => {
      const result = engine.executeCommand(session, "interface g99/99/99");
      
      // The caret should appear in the output
      expect(result.output[0]).toMatch(/\s+\^/);
      expect(result.output[1]).toBe("% Invalid input detected at '^' marker.");
    });

    test("Error marker should account for default hostname length", () => {
      // The Terminal component adds spaces equal to prompt length automatically
      // Our handler only needs to add spaces for the command text
      // "interface " = 10 chars
      const result = engine.executeCommand(session, "interface g1/0/1");
      
      const expectedSpaces = "interface ".length;
      const expectedMarker = " ".repeat(expectedSpaces) + "^";
      
      expect(result.output[0]).toBe(expectedMarker);
      expect(result.output[1]).toBe("% Invalid input detected at '^' marker.");
    });

    test("Error marker should account for short hostname", () => {
      // Change to short hostname
      engine.executeCommand(session, "hostname R1");
      
      // Terminal component adds prompt spacing, we just add command text spacing
      // "interface " = 10 chars
      const result = engine.executeCommand(session, "interface g1/0/1");
      
      const expectedSpaces = "interface ".length;
      const expectedMarker = " ".repeat(expectedSpaces) + "^";
      
      expect(result.output[0]).toBe(expectedMarker);
      expect(result.output[1]).toBe("% Invalid input detected at '^' marker.");
    });

    test("Error marker should account for long hostname", () => {
      // Change to long hostname
      engine.executeCommand(session, "hostname CorporateDistributionSwitch1");
      
      // Terminal component adds prompt spacing, we just add command text spacing
      // "interface " = 10 chars (regardless of hostname length)
      const result = engine.executeCommand(session, "interface g1/0/1");
      
      const expectedSpaces = "interface ".length;
      const expectedMarker = " ".repeat(expectedSpaces) + "^";
      
      expect(result.output[0]).toBe(expectedMarker);
      expect(result.output[1]).toBe("% Invalid input detected at '^' marker.");
    });

    test("Error marker should work in different modes", () => {
      // Test in privileged EXEC mode (different prompt format)
      engine.executeCommand(session, "end");
      
      // Now in priv exec: "Switch# " = 8 chars
      // But interface command only works in config mode, so go back
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "hostname TestRouter");
      
      // Terminal component adds prompt spacing, we just add command text spacing
      // "interface " = 10 chars
      const result = engine.executeCommand(session, "interface g1/0/1");
      
      const expectedSpaces = "interface ".length;
      const expectedMarker = " ".repeat(expectedSpaces) + "^";
      
      expect(result.output[0]).toBe(expectedMarker);
    });
  });
});

