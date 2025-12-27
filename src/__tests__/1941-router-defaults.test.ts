import { CLIEngine } from "../cli/engine";
import { CLISession } from "../cli-session";
import { loadGrammar } from "../grammar/loader";
import { ModeType } from "../types";
import * as path from "path";

describe("Cisco 1941 router default output", () => {
  let engine: CLIEngine;
  let session: CLISession;

  beforeEach(() => {
    const grammarPath = path.join(__dirname, "../../commands-1941-router.yaml");
    const grammar = loadGrammar(grammarPath);
    engine = new CLIEngine(grammar);
    session = new CLISession(grammar, '1941-router');
  });

  test("should match exact output of unconfigured 1941 router", () => {
    // Fresh router - no configuration changes
    // Move to privileged mode
    session.modeStack.push(ModeType.PRIV_EXEC);
    
    // Execute show running-config
    const result = engine.executeCommand(session, "show running-config");
    
    // Expected output from a real Cisco 1941 router (based on actual output)
    const expectedLines = [
      "Building configuration...",
      "",
      "Current configuration : 608 bytes",
      "!",
      "version 15.1",
      "no service timestamps log datetime msec",
      "no service timestamps debug datetime msec",
      "no service password-encryption",
      "!",
      "hostname Router",
      "!",
      "!",
      "!",
      "!",
      "!",
      "!",
      "!",
      "!",
      "ip cef",
      "no ipv6 cef",
      "!",
      "!",
      "!",
      "!",
      "license udi pid CISCO1941/K9 sn FTX15242K0C-",
      "!",
      "!",
      "!",
      "!",
      "!",
      "!",
      "!",
      "!",
      "!",
      "!",
      "!",
      "spanning-tree mode pvst",
      "!",
      "!",
      "!",
      "!",
      "!",
      "!",
      "interface GigabitEthernet0/0",
      " no ip address",
      " duplex auto",
      " speed auto",
      "!",
      "interface GigabitEthernet0/1",
      " no ip address",
      " duplex auto",
      " speed auto",
      "!",
      "interface Vlan1",
      " no ip address",
      " shutdown",
      "!",
      "ip classless",
      "!",
      "ip flow-export version 9",
      "!",
      "!",
      "!",
      "!",
      "!",
      "!",
      "!",
      "line con 0",
      "!",
      "line aux 0",
      "!",
      "line vty 0 4",
      " login",
      "!",
      "!",
      "!",
      "end"
    ];
    
    // Verify exact match
    expect(result.output).toEqual(expectedLines);
    
    // Also verify it's paginated (since it's >20 lines)
    expect(result.paginated).toBe(true);
    expect(result.output.length).toBe(expectedLines.length);
  });

  test("should show hostname when configured", () => {
    // Configure a hostname
    session.deviceState.hostname = "BorderRouter";
    
    // Move to privileged mode
    session.modeStack.push(ModeType.PRIV_EXEC);
    
    // Execute show running-config
    const result = engine.executeCommand(session, "show running-config");
    
    // Find the hostname line
    const hostnameLine = result.output.find(line => line.startsWith("hostname "));
    expect(hostnameLine).toBe("hostname BorderRouter");
  });

  test("show ip interface brief displays router interfaces correctly", () => {
    // Move to privileged mode
    session.modeStack.push(ModeType.PRIV_EXEC);
    
    // Execute show ip interface brief
    const result = engine.executeCommand(session, "show ip interface brief");
    
    const outputStr = result.output.join("\n");
    
    // Should show GigabitEthernet0/0, 0/1, and Vlan1
    expect(outputStr).toContain("GigabitEthernet0/0");
    expect(outputStr).toContain("GigabitEthernet0/1");
    expect(outputStr).toContain("Vlan1");
    
    // Interfaces should show as "unassigned" and "administratively down"
    expect(outputStr).toContain("unassigned");
    expect(outputStr).toContain("administratively down");
  });

  test("show vlan brief works on router", () => {
    // Move to privileged mode
    session.modeStack.push(ModeType.PRIV_EXEC);
    
    // Execute show vlan brief
    const result = engine.executeCommand(session, "show vlan brief");
    
    const outputStr = result.output.join("\n");
    
    // Expected output from a real Cisco 1941 router
    // Should show VLANs 1, 1002-1005 with no ports (empty Ports column)
    expect(outputStr).toContain("1    default");
    expect(outputStr).toContain("1002 fddi-default");
    expect(outputStr).toContain("1003 token-ring-default");
    expect(outputStr).toContain("1004 fddinet-default");
    expect(outputStr).toContain("1005 trnet-default");
    
    // Should have active status
    expect(outputStr).toContain("active");
  });

  test("default hostname is Router", () => {
    expect(session.deviceState.hostname).toBe("Router");
  });

  test("interfaces are named correctly (stored as g0/0, g0/1)", () => {
    // Check that interfaces exist in state with correct names
    expect(session.deviceState.interfaces["g0/0"]).toBeDefined();
    expect(session.deviceState.interfaces["g0/1"]).toBeDefined();
    expect(session.deviceState.interfaces["vlan1"]).toBeDefined();
  });

  test("router interfaces are routed by default", () => {
    // Router interfaces should have l2mode: "routed" by default
    expect(session.deviceState.interfaces["g0/0"].l2mode).toBe("routed");
    expect(session.deviceState.interfaces["g0/1"].l2mode).toBe("routed");
    expect(session.deviceState.interfaces["vlan1"].l2mode).toBe("routed");
  });

  test("router interfaces can accept IP addresses without 'no switchport'", () => {
    // Move to interface config mode
    session.modeStack.push(ModeType.PRIV_EXEC);
    session.modeStack.push(ModeType.GLOBAL_CONFIG);
    
    const ifResult = engine.executeCommand(session, "interface g0/0");
    expect(ifResult.output).not.toContain("Invalid input");
    session.modeStack.push(ModeType.IF_CONFIG);
    session.modeStack.currentInterface = "g0/0";
    
    // Set IP address directly (no "no switchport" needed on routers)
    const ipResult = engine.executeCommand(session, "ip address 10.0.0.1 255.255.255.0");
    expect(ipResult.output).not.toContain("Invalid input");
    
    // Verify IP was set
    expect(session.deviceState.interfaces["g0/0"].ip).toBe("10.0.0.1");
    expect(session.deviceState.interfaces["g0/0"].mask).toBe("255.255.255.0");
  });

  test("device model is set to 1941-router", () => {
    expect(session.deviceState.deviceModel).toBe("1941-router");
  });
});

