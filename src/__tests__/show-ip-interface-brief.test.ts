import { CLIEngine } from "../cli/engine";
import { CLISession } from "../cli-session";
import { loadGrammar } from "../grammar/loader";
import { ModeType } from "../types";
import * as path from "path";

describe("show ip interface brief", () => {
  let engine: CLIEngine;
  let session: CLISession;

  beforeEach(() => {
    const grammarPath = path.join(__dirname, "../../commands-2960-switch.yaml");
    const grammar = loadGrammar(grammarPath);
    engine = new CLIEngine(grammar);
    session = new CLISession(grammar);
  });

  test("should match exact default output of unconfigured 2960 switch", () => {
    // Fresh switch - no configuration changes
    // Move to privileged mode
    session.modeStack.push(ModeType.PRIV_EXEC);
    
    // Execute show ip interface brief
    const result = engine.executeCommand(session, "show ip interface brief");
    
    // Expected output from a real Cisco 2960 switch
    const expectedLines = [
      "Interface              IP-Address      OK? Method Status                Protocol",
      "FastEthernet0/1        unassigned      YES manual down                  down",
      "FastEthernet0/2        unassigned      YES manual down                  down",
      "FastEthernet0/3        unassigned      YES manual down                  down",
      "FastEthernet0/4        unassigned      YES manual down                  down",
      "FastEthernet0/5        unassigned      YES manual down                  down",
      "FastEthernet0/6        unassigned      YES manual down                  down",
      "FastEthernet0/7        unassigned      YES manual down                  down",
      "FastEthernet0/8        unassigned      YES manual down                  down",
      "FastEthernet0/9        unassigned      YES manual down                  down",
      "FastEthernet0/10       unassigned      YES manual down                  down",
      "FastEthernet0/11       unassigned      YES manual down                  down",
      "FastEthernet0/12       unassigned      YES manual down                  down",
      "FastEthernet0/13       unassigned      YES manual down                  down",
      "FastEthernet0/14       unassigned      YES manual down                  down",
      "FastEthernet0/15       unassigned      YES manual down                  down",
      "FastEthernet0/16       unassigned      YES manual down                  down",
      "FastEthernet0/17       unassigned      YES manual down                  down",
      "FastEthernet0/18       unassigned      YES manual down                  down",
      "FastEthernet0/19       unassigned      YES manual down                  down",
      "FastEthernet0/20       unassigned      YES manual down                  down",
      "FastEthernet0/21       unassigned      YES manual down                  down",
      "FastEthernet0/22       unassigned      YES manual down                  down",
      "FastEthernet0/23       unassigned      YES manual down                  down",
      "FastEthernet0/24       unassigned      YES manual down                  down",
      "GigabitEthernet0/1     unassigned      YES manual down                  down",
      "GigabitEthernet0/2     unassigned      YES manual down                  down",
      "Vlan1                  unassigned      YES manual administratively down down"
    ];
    
    // Verify exact match
    expect(result.output).toEqual(expectedLines);
    
    // Will be paginated since there are 28 lines total (header + 27 interfaces)
    expect(result.paginated).toBe(true);
    expect(result.output.length).toBe(28);
  });

  test("should show IP address when interface is configured", () => {
    // Configure an interface with an IP
    session.deviceState.interfaces["g0/1"].ip = "192.168.1.1";
    session.deviceState.interfaces["g0/1"].mask = "255.255.255.0";
    session.deviceState.interfaces["g0/1"].adminUp = true;
    
    // Move to privileged mode
    session.modeStack.push(ModeType.PRIV_EXEC);
    
    // Execute show ip interface brief
    const result = engine.executeCommand(session, "show ip interface brief");
    
    // Find the g0/1 line
    const g01Line = result.output.find(line => line.startsWith("GigabitEthernet0/1"));
    expect(g01Line).toBe("GigabitEthernet0/1     192.168.1.1     YES manual up                    up");
  });

  test("should show 'up' status when interface is enabled", () => {
    // Enable an interface
    session.deviceState.interfaces["fa0/1"].adminUp = true;
    
    // Move to privileged mode
    session.modeStack.push(ModeType.PRIV_EXEC);
    
    // Execute show ip interface brief
    const result = engine.executeCommand(session, "show ip interface brief");
    
    // Find the fa0/1 line
    const fa01Line = result.output.find(line => line.startsWith("FastEthernet0/1"));
    expect(fa01Line).toContain("up                    up");
  });

  test("should show 'down' status for disabled regular interfaces", () => {
    // Regular interfaces that are not enabled should show "down"
    session.modeStack.push(ModeType.PRIV_EXEC);
    
    const result = engine.executeCommand(session, "show ip interface brief");
    
    // Check a FastEthernet interface
    const fa01Line = result.output.find(line => line.startsWith("FastEthernet0/1"));
    expect(fa01Line).toContain("down                  down");
    expect(fa01Line).not.toContain("administratively");
  });

  test("should show 'administratively down' for Vlan1", () => {
    // Vlan1 should show "administratively down" by default
    session.modeStack.push(ModeType.PRIV_EXEC);
    
    const result = engine.executeCommand(session, "show ip interface brief");
    
    // Check Vlan1
    const vlan1Line = result.output.find(line => line.startsWith("Vlan1"));
    expect(vlan1Line).toBe("Vlan1                  unassigned      YES manual administratively down down");
  });

  test("should work in user EXEC mode", () => {
    // Stay in user mode (default)
    expect(session.modeStack.getCurrentMode()).toBe(ModeType.USER_EXEC);
    
    // Execute show ip interface brief in user mode
    const result = engine.executeCommand(session, "show ip interface brief");
    
    // Verify the command works and has correct output
    expect(result.output).toBeDefined();
    expect(result.output.length).toBeGreaterThan(0);
    expect(result.output[0]).toContain("Interface");
    expect(result.output[0]).toContain("IP-Address");
  });
});

