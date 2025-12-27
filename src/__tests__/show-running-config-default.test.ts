import { CLIEngine } from "../cli/engine";
import { CLISession } from "../cli-session";
import { loadGrammar } from "../grammar/loader";
import { ModeType } from "../types";
import * as path from "path";

describe("show running-config default output", () => {
  let engine: CLIEngine;
  let session: CLISession;

  beforeEach(() => {
    const grammarPath = path.join(__dirname, "../../commands-2960-switch.yaml");
    const grammar = loadGrammar(grammarPath);
    engine = new CLIEngine(grammar);
    session = new CLISession(grammar);
  });

  test("should match exact output of unconfigured 2960 switch", () => {
    // Fresh switch - no configuration changes
    // Move to privileged mode
    session.modeStack.push(ModeType.PRIV_EXEC);
    
    // Execute show running-config
    const result = engine.executeCommand(session, "show running-config");
    
    // Expected output from a real Cisco 2960 switch
    const expectedLines = [
      "Building configuration...",
      "",
      "Current configuration : 1080 bytes",
      "!",
      "version 15.0",
      "no service timestamps log datetime msec",
      "no service timestamps debug datetime msec",
      "no service password-encryption",
      "!",
      "hostname Switch",
      "!",
      "!",
      "!",
      "!",
      "!",
      "!",
      "spanning-tree mode pvst",
      "spanning-tree extend system-id",
      "!",
      "interface FastEthernet0/1",
      "!",
      "interface FastEthernet0/2",
      "!",
      "interface FastEthernet0/3",
      "!",
      "interface FastEthernet0/4",
      "!",
      "interface FastEthernet0/5",
      "!",
      "interface FastEthernet0/6",
      "!",
      "interface FastEthernet0/7",
      "!",
      "interface FastEthernet0/8",
      "!",
      "interface FastEthernet0/9",
      "!",
      "interface FastEthernet0/10",
      "!",
      "interface FastEthernet0/11",
      "!",
      "interface FastEthernet0/12",
      "!",
      "interface FastEthernet0/13",
      "!",
      "interface FastEthernet0/14",
      "!",
      "interface FastEthernet0/15",
      "!",
      "interface FastEthernet0/16",
      "!",
      "interface FastEthernet0/17",
      "!",
      "interface FastEthernet0/18",
      "!",
      "interface FastEthernet0/19",
      "!",
      "interface FastEthernet0/20",
      "!",
      "interface FastEthernet0/21",
      "!",
      "interface FastEthernet0/22",
      "!",
      "interface FastEthernet0/23",
      "!",
      "interface FastEthernet0/24",
      "!",
      "interface GigabitEthernet0/1",
      "!",
      "interface GigabitEthernet0/2",
      "!",
      "interface Vlan1",
      " no ip address",
      " shutdown",
      "!",
      "!",
      "!",
      "!",
      "line con 0",
      "!",
      "line vty 0 4",
      " login",
      "line vty 5 15",
      " login",
      "!",
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
    session.deviceState.hostname = "MySwitch";
    
    // Move to privileged mode
    session.modeStack.push(ModeType.PRIV_EXEC);
    
    // Execute show running-config
    const result = engine.executeCommand(session, "show running-config");
    
    // Find the hostname line
    const hostnameLine = result.output.find(line => line.startsWith("hostname "));
    expect(hostnameLine).toBe("hostname MySwitch");
  });

  test("should show VLANs when configured (but not default VLAN 1)", () => {
    // Add a VLAN
    session.deviceState.vlans["10"] = { name: "SALES" };
    session.deviceState.vlans["20"] = { name: "ENGINEERING" };
    
    // Move to privileged mode
    session.modeStack.push(ModeType.PRIV_EXEC);
    
    // Execute show running-config
    const result = engine.executeCommand(session, "show running-config");
    
    // Should contain VLAN 10 and 20
    const outputStr = result.output.join("\n");
    expect(outputStr).toContain("vlan 10");
    expect(outputStr).toContain("name SALES");
    expect(outputStr).toContain("vlan 20");
    expect(outputStr).toContain("name ENGINEERING");
    
    // Should NOT have a "vlan 1" section (it's implicit)
    const vlan1Line = result.output.find(line => line.trim() === "vlan 1");
    expect(vlan1Line).toBeUndefined();
  });
});

