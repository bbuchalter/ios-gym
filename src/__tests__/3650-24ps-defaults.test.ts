import { CLIEngine } from "../cli/engine";
import { CLISession } from "../cli-session";
import { loadGrammar } from "../grammar/loader";
import { createInitialState } from "../cli/state";
import { ModeType } from "../types";
import * as path from "path";

describe("Catalyst 3650-24PS Default Behavior", () => {
  let engine: CLIEngine;
  let session: CLISession;

  beforeEach(() => {
    const grammarPath = path.join(__dirname, "../../grammar/commands-3650-24ps.yaml");
    const grammar = loadGrammar(grammarPath);
    engine = new CLIEngine(grammar);
    session = new CLISession(grammar, '3650-24ps');
  });

  test("initial state has correct interface count (29 total)", () => {
    // 24 main ports (g1/0/1-24) + 4 uplink ports (g1/1/1-4) + 1 Vlan1 = 29
    const state = createInitialState('3650-24ps');
    expect(Object.keys(state.interfaces).length).toBe(29);
  });

  test("has all 24 main GigabitEthernet ports (g1/0/1-24)", () => {
    const state = createInitialState('3650-24ps');
    for (let i = 1; i <= 24; i++) {
      expect(state.interfaces[`g1/0/${i}`]).toBeDefined();
      expect(state.interfaces[`g1/0/${i}`].adminUp).toBe(false);
    }
  });

  test("has 4 uplink module ports (g1/1/1-4)", () => {
    const state = createInitialState('3650-24ps');
    expect(state.interfaces["g1/1/1"]).toBeDefined();
    expect(state.interfaces["g1/1/2"]).toBeDefined();
    expect(state.interfaces["g1/1/3"]).toBeDefined();
    expect(state.interfaces["g1/1/4"]).toBeDefined();
  });

  test("Vlan1 is administratively down by default", () => {
    const state = createInitialState('3650-24ps');
    expect(state.interfaces["vlan1"]).toBeDefined();
    expect(state.interfaces["vlan1"].adminUp).toBe(false);
    expect(state.interfaces["vlan1"].ip).toBe(null);
  });

  test("hostname defaults to 'Switch'", () => {
    const state = createInitialState('3650-24ps');
    expect(state.hostname).toBe('Switch');
  });

  test("ip routing is disabled by default", () => {
    const state = createInitialState('3650-24ps');
    expect(state.ipRouting).toBe(false); // "no ip cef" in Packet Tracer
  });

  test("device model is set to 3650-24ps", () => {
    expect(session.deviceState.deviceModel).toBe("3650-24ps");
  });

  test("show ip interface brief contains 3650 stackable interface names", () => {
    session.modeStack.push(ModeType.PRIV_EXEC);
    const result = engine.executeCommand(session, "show ip interface brief");
    const outputStr = result.output.join("\n");
    
    // Verify stackable naming g1/0/x (stack 1, module 0, port x)
    expect(outputStr).toContain("GigabitEthernet1/0/1");
    expect(outputStr).toContain("GigabitEthernet1/0/24");
    expect(outputStr).toContain("GigabitEthernet1/1/1");
    expect(outputStr).toContain("GigabitEthernet1/1/4");
    expect(outputStr).toContain("Vlan1");
    
    // Interfaces should show as "unassigned" and "administratively down"
    expect(outputStr).toContain("unassigned");
    expect(outputStr).toContain("administratively down");
  });

  test("show vlan brief includes all 28 physical ports in VLAN 1", () => {
    session.modeStack.push(ModeType.PRIV_EXEC);
    const result = engine.executeCommand(session, "show vlan brief");
    const outputStr = result.output.join("\n");
    
    // VLAN 1 should include all 24 main ports + 4 uplink ports
    expect(outputStr).toContain("Gig1/0/1");
    expect(outputStr).toContain("Gig1/0/24");
    expect(outputStr).toContain("Gig1/1/1");
    expect(outputStr).toContain("Gig1/1/4");
    
    // Default VLANs should exist
    expect(outputStr).toContain("default");
    expect(outputStr).toContain("1002 fddi-default");
    expect(outputStr).toContain("1003 token-ring-default");
    expect(outputStr).toContain("1004 fddinet-default");
    expect(outputStr).toContain("1005 trnet-default");
  });

  test("show running-config includes key 3650 defaults", () => {
    session.modeStack.push(ModeType.PRIV_EXEC);
    const result = engine.executeCommand(session, "show running-config");
    const outputStr = result.output.join("\n");
    
    // Key config items
    expect(outputStr).toContain("hostname Switch");
    expect(outputStr).toContain("interface GigabitEthernet1/0/1");
    expect(outputStr).toContain("interface GigabitEthernet1/0/24");
    expect(outputStr).toContain("interface GigabitEthernet1/1/1");
    expect(outputStr).toContain("interface Vlan1");
    expect(outputStr).toContain("no ip address");
    expect(outputStr).toContain("shutdown");
  });

  test("ip routing command works (Layer 3 capable)", () => {
    session.modeStack.push(ModeType.PRIV_EXEC);
    session.modeStack.push(ModeType.GLOBAL_CONFIG);
    
    // Initially routing is disabled
    expect(session.deviceState.ipRouting).toBe(false);
    
    // Enable IP routing
    engine.executeCommand(session, "ip routing");
    expect(session.deviceState.ipRouting).toBe(true);
    
    // Disable IP routing
    engine.executeCommand(session, "no ip routing");
    expect(session.deviceState.ipRouting).toBe(false);
  });

  test("no switchport command works (routed ports)", () => {
    session.modeStack.push(ModeType.PRIV_EXEC);
    session.modeStack.push(ModeType.GLOBAL_CONFIG);
    
    // Enter interface config
    engine.executeCommand(session, "interface g1/0/1");
    session.modeStack.push(ModeType.IF_CONFIG);
    session.modeStack.currentInterface = "g1/0/1";
    
    // Initially interface is Layer 2 (l2mode is null)
    expect(session.deviceState.interfaces["g1/0/1"].l2mode).toBe(null);
    
    // Convert to routed port
    engine.executeCommand(session, "no switchport");
    expect(session.deviceState.interfaces["g1/0/1"].l2mode).toBe("routed");
  });

  test("interfaces can be configured with IP after no switchport", () => {
    session.modeStack.push(ModeType.PRIV_EXEC);
    session.modeStack.push(ModeType.GLOBAL_CONFIG);
    
    // Enter interface config
    engine.executeCommand(session, "interface g1/0/1");
    session.modeStack.push(ModeType.IF_CONFIG);
    session.modeStack.currentInterface = "g1/0/1";
    
    // Convert to routed port and set IP
    engine.executeCommand(session, "no switchport");
    engine.executeCommand(session, "ip address 10.0.0.1 255.255.255.0");
    
    // Verify IP was set
    expect(session.deviceState.interfaces["g1/0/1"].ip).toBe("10.0.0.1");
    expect(session.deviceState.interfaces["g1/0/1"].mask).toBe("255.255.255.0");
    expect(session.deviceState.interfaces["g1/0/1"].l2mode).toBe("routed");
  });

  test("uplink ports (g1/1/x) can also be routed ports", () => {
    session.modeStack.push(ModeType.PRIV_EXEC);
    session.modeStack.push(ModeType.GLOBAL_CONFIG);
    
    // Enter interface config for uplink port
    engine.executeCommand(session, "interface g1/1/1");
    session.modeStack.push(ModeType.IF_CONFIG);
    session.modeStack.currentInterface = "g1/1/1";
    
    // Convert to routed port
    engine.executeCommand(session, "no switchport");
    expect(session.deviceState.interfaces["g1/1/1"].l2mode).toBe("routed");
  });
});

