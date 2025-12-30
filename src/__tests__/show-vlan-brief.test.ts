import { CLIEngine } from "../cli/engine";
import { CLISession } from "../cli-session";
import { loadGrammar } from "../grammar/loader";
import { ModeType } from "../types";
import * as path from "path";

describe("show vlan brief", () => {
  let engine: CLIEngine;
  let session: CLISession;

  beforeEach(() => {
    const grammarPath = path.join(__dirname, "../../grammar/commands-2960-switch.yaml");
    const grammar = loadGrammar(grammarPath);
    engine = new CLIEngine(grammar);
    session = new CLISession(grammar);
  });

  test("should match exact default output of unconfigured 2960 switch", () => {
    // Fresh switch - no configuration changes
    // Move to privileged mode
    session.modeStack.push(ModeType.PRIV_EXEC);
    
    // Execute show vlan brief
    const result = engine.executeCommand(session, "show vlan brief");
    
    // Expected output from a real Cisco 2960 switch
    const expectedLines = [
      "",
      "VLAN Name                             Status    Ports",
      "---- -------------------------------- --------- -------------------------------",
      "1    default                          active    Fa0/1, Fa0/2, Fa0/3, Fa0/4",
      "                                                Fa0/5, Fa0/6, Fa0/7, Fa0/8",
      "                                                Fa0/9, Fa0/10, Fa0/11, Fa0/12",
      "                                                Fa0/13, Fa0/14, Fa0/15, Fa0/16",
      "                                                Fa0/17, Fa0/18, Fa0/19, Fa0/20",
      "                                                Fa0/21, Fa0/22, Fa0/23, Fa0/24",
      "                                                Gig0/1, Gig0/2",
      "1002 fddi-default                     active    ",
      "1003 token-ring-default               active    ",
      "1004 fddinet-default                  active    ",
      "1005 trnet-default                    active    "
    ];
    
    // Verify exact match
    expect(result.output).toEqual(expectedLines);
    
    // Should NOT be paginated (less than 20 lines)
    expect(result.paginated).toBe(false);
  });

  test("should show custom VLANs without ports when created", () => {
    // Add custom VLANs
    session.deviceState.vlans["10"] = { name: "SALES" };
    session.deviceState.vlans["20"] = { name: "ENGINEERING" };
    
    // Move to privileged mode
    session.modeStack.push(ModeType.PRIV_EXEC);
    
    // Execute show vlan brief
    const result = engine.executeCommand(session, "show vlan brief");
    
    // Find VLAN 10 and 20
    const vlan10Line = result.output.find(line => line.startsWith("10  "));
    const vlan20Line = result.output.find(line => line.startsWith("20  "));
    
    expect(vlan10Line).toContain("SALES");
    expect(vlan10Line).toContain("active");
    expect(vlan20Line).toContain("ENGINEERING");
    expect(vlan20Line).toContain("active");
  });

  test("should show ports assigned to custom VLANs", () => {
    // Add custom VLAN
    session.deviceState.vlans["100"] = { name: "Students" };
    
    // Assign some ports to VLAN 100
    session.deviceState.interfaces["fa0/1"].accessVlan = "100";
    session.deviceState.interfaces["fa0/2"].accessVlan = "100";
    session.deviceState.interfaces["fa0/3"].accessVlan = "100";
    
    // Move to privileged mode
    session.modeStack.push(ModeType.PRIV_EXEC);
    
    // Execute show vlan brief
    const result = engine.executeCommand(session, "show vlan brief");
    
    // Find VLAN 100 line
    const vlan100Line = result.output.find(line => line.startsWith("100 "));
    expect(vlan100Line).toContain("Students");
    expect(vlan100Line).toContain("Fa0/1");
    expect(vlan100Line).toContain("Fa0/2");
    expect(vlan100Line).toContain("Fa0/3");
    
    // VLAN 1 should no longer have fa0/1, fa0/2, fa0/3
    // Find the VLAN 1 section (first line plus continuation lines)
    const vlan1StartIdx = result.output.findIndex(line => line.startsWith("1   "));
    const vlan1EndIdx = result.output.findIndex((line, idx) => idx > vlan1StartIdx && line.match(/^\d/));
    const vlan1Lines = result.output.slice(vlan1StartIdx, vlan1EndIdx === -1 ? vlan1StartIdx + 10 : vlan1EndIdx);
    const vlan1Text = vlan1Lines.join(" ");
    
    // Use regex with word boundaries to avoid matching Fa0/10 when looking for Fa0/1
    expect(vlan1Text).not.toMatch(/\bFa0\/1[,\s]/);
    expect(vlan1Text).not.toMatch(/\bFa0\/2[,\s]/);
    expect(vlan1Text).not.toMatch(/\bFa0\/3[,\s]/);
    // But should still have Fa0/4 and others
    expect(vlan1Text).toContain("Fa0/4");
  });

  test("should not show routed interfaces or vlan interfaces in port list", () => {
    // Configure an interface as routed
    session.deviceState.interfaces["g0/1"].l2mode = "routed";
    session.deviceState.interfaces["g0/1"].ip = "192.168.1.1";
    
    // Move to privileged mode
    session.modeStack.push(ModeType.PRIV_EXEC);
    
    // Execute show vlan brief
    const result = engine.executeCommand(session, "show vlan brief");
    
    // VLAN 1 should not include g0/1 (it's routed now)
    const outputText = result.output.join("\n");
    const vlan1Section = outputText.substring(
      outputText.indexOf("1    default"),
      outputText.indexOf("1002")
    );
    
    expect(vlan1Section).not.toContain("Gig0/1");
    // Vlan1 interface should never appear in VLAN port lists
    expect(outputText).not.toContain("Vlan1");
  });

  test("should work in user EXEC mode", () => {
    // Stay in user mode (default)
    expect(session.modeStack.getCurrentMode()).toBe(ModeType.USER_EXEC);
    
    // Execute show vlan brief - should work in user mode too
    const result = engine.executeCommand(session, "show vlan brief");
    
    // Verify the command works
    expect(result.output).toBeDefined();
    expect(result.output.length).toBeGreaterThan(0);
    expect(result.output[1]).toContain("VLAN Name");
  });
});

