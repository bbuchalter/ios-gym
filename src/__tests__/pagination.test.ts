import { CLIEngine } from "../cli/engine";
import { CLISession } from "../cli-session";
import { loadGrammar } from "../grammar/loader";
import { ModeType } from "../types";
import * as path from "path";

describe("Pagination Tests", () => {
  let engine: CLIEngine;
  let session: CLISession;

  beforeEach(() => {
    const grammarPath = path.join(__dirname, "../../commands-2960-switch.yaml");
    const grammar = loadGrammar(grammarPath);
    engine = new CLIEngine(grammar);
    session = new CLISession(grammar);
  });

  describe("show running-config pagination", () => {
    test("should mark output as paginated when output exceeds 20 lines", () => {
      // Set up a configuration with enough data to trigger pagination
      session.deviceState.hostname = "TestSwitch";
      session.deviceState.enableSecret = "secret123";
      
      // Add multiple VLANs
      session.deviceState.vlans = {
        "1": { name: "default" },
        "10": { name: "SALES" },
        "20": { name: "ENGINEERING" },
        "30": { name: "HR" },
        "40": { name: "GUEST" }
      };
      
      // Add multiple interfaces
      session.deviceState.interfaces = {
        "g0/0": { adminUp: true, l2mode: "access", accessVlan: "10", trunkAllowed: null, ip: null, mask: null },
        "g0/1": { adminUp: true, l2mode: "access", accessVlan: "20", trunkAllowed: null, ip: null, mask: null },
        "g0/2": { adminUp: true, l2mode: "trunk", accessVlan: null, trunkAllowed: "1,10,20,30", ip: null, mask: null },
        "g1/0": { adminUp: false, l2mode: "access", accessVlan: "1", trunkAllowed: null, ip: null, mask: null },
        "g1/1": { adminUp: true, l2mode: "routed", accessVlan: null, trunkAllowed: null, ip: "192.168.1.1", mask: "255.255.255.0" }
      };
      
      // Add some routes
      session.deviceState.routes = [
        { dest: "0.0.0.0", mask: "0.0.0.0", nextHop: "192.168.1.254", ad: 1 },
        { dest: "10.0.0.0", mask: "255.0.0.0", nextHop: "192.168.1.1", ad: 1 }
      ];
      
      // Move to privileged mode
      session.modeStack.push(ModeType.PRIV_EXEC);
      
      // Execute show running-config
      const result = engine.executeCommand(session, "show running-config");
      
      // Verify the result
      expect(result.output).toBeDefined();
      expect(result.output.length).toBeGreaterThan(20);
      expect(result.paginated).toBe(true);
    });

    test("should paginate even unconfigured switch (realistic 2960 output)", () => {
      // Fresh switch with default interfaces (24 FastEthernet + 2 GigabitEthernet + Vlan1)
      // This simulates a real 2960 switch which has many default interfaces
      session.deviceState.hostname = "Switch";
      
      // Move to privileged mode
      session.modeStack.push(ModeType.PRIV_EXEC);
      
      // Execute show running-config on a fresh/unconfigured switch
      const result = engine.executeCommand(session, "show running-config");
      
      // Verify that even an unconfigured switch generates enough output to paginate
      // (because of all the default interfaces)
      expect(result.output).toBeDefined();
      expect(result.output.length).toBeGreaterThan(20);
      expect(result.paginated).toBe(true);
    });

    test("should work in user EXEC mode", () => {
      // Set up configuration
      session.deviceState.hostname = "TestSwitch";
      
      // Stay in user mode (default)
      expect(session.modeStack.getCurrentMode()).toBe(ModeType.USER_EXEC);
      
      // Execute show running-config in user mode
      const result = engine.executeCommand(session, "show running-config");
      
      // Verify the command works in user mode
      expect(result.output).toBeDefined();
      expect(result.output.length).toBeGreaterThan(0);
      expect(result).toHaveProperty('paginated');
    });
  });

  describe("other show commands", () => {
    test("show vlan brief should not trigger pagination by default", () => {
      // Add a few VLANs
      session.deviceState.vlans = {
        "1": { name: "default" },
        "10": { name: "SALES" },
        "20": { name: "ENGINEERING" }
      };
      
      // Move to privileged mode
      session.modeStack.push(ModeType.PRIV_EXEC);
      
      // Execute show vlan brief
      const result = engine.executeCommand(session, "show vlan brief");
      
      // Verify short output doesn't paginate
      expect(result.output).toBeDefined();
      expect(result.output.length).toBeLessThanOrEqual(20);
      expect(result.paginated).toBeFalsy();
    });

    test("show ip interface brief should not trigger pagination by default", () => {
      // Add a few interfaces
      session.deviceState.interfaces = {
        "g0/0": { adminUp: true, l2mode: "access", accessVlan: "1", trunkAllowed: null, ip: null, mask: null },
        "g0/1": { adminUp: false, l2mode: "access", accessVlan: "1", trunkAllowed: null, ip: null, mask: null }
      };
      
      // Move to privileged mode
      session.modeStack.push(ModeType.PRIV_EXEC);
      
      // Execute show ip interface brief
      const result = engine.executeCommand(session, "show ip interface brief");
      
      // Verify short output doesn't paginate
      expect(result.output).toBeDefined();
      expect(result.output.length).toBeLessThanOrEqual(20);
      expect(result.paginated).toBeFalsy();
    });
  });
});

