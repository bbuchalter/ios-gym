import { CLIEngine } from "../cli/engine";
import { CLISession } from "../cli-session";
import { loadGrammar } from "../grammar/loader";
import { ModeType } from "../types";
import * as path from "path";

describe("Device Command Isolation", () => {
  describe("2960 Switch - Should have switchport commands", () => {
    let engine: CLIEngine;
    let session: CLISession;

    beforeEach(() => {
      const grammarPath = path.join(__dirname, "../../commands-2960-switch.yaml");
      const grammar = loadGrammar(grammarPath);
      engine = new CLIEngine(grammar);
      session = new CLISession(grammar, '2960-switch');
      session.modeStack.push(ModeType.PRIV_EXEC);
      session.modeStack.push(ModeType.GLOBAL_CONFIG);
    });

    test("'switchport mode access' works on switch", () => {
      // First enter interface config mode
      const ifResult = engine.executeCommand(session, "interface fa0/1");
      expect(ifResult.output).not.toContain("Invalid input");
      session.modeStack.push(ModeType.IF_CONFIG);
      session.modeStack.currentInterface = "fa0/1";
      
      // Verify switchport command exists and works
      const swResult = engine.executeCommand(session, "switchport mode access");
      expect(swResult.output).not.toContain("Invalid input");
      expect(session.deviceState.interfaces["fa0/1"].l2mode).toBe("access");
    });

    test("'switchport mode trunk' works on switch", () => {
      // Enter interface config mode
      engine.executeCommand(session, "interface g0/1");
      session.modeStack.push(ModeType.IF_CONFIG);
      session.modeStack.currentInterface = "g0/1";
      
      // Verify trunk mode works
      const result = engine.executeCommand(session, "switchport mode trunk");
      expect(result.output).not.toContain("Invalid input");
      expect(session.deviceState.interfaces["g0/1"].l2mode).toBe("trunk");
    });

    test("FastEthernet interface names work on switch", () => {
      const result = engine.executeCommand(session, "interface fa0/1");
      expect(result.output).not.toContain("Invalid input");
      expect(result.output.some(line => line.includes("Invalid input") || line.includes("%"))).toBe(false);
    });

    test("'no switchport' works on switch (Layer 3 switch feature)", () => {
      // Enter interface config mode
      engine.executeCommand(session, "interface g0/1");
      session.modeStack.push(ModeType.IF_CONFIG);
      session.modeStack.currentInterface = "g0/1";
      
      // Verify "no switchport" works (converts to routed port)
      const result = engine.executeCommand(session, "no switchport");
      expect(result.output).not.toContain("Invalid input");
      expect(session.deviceState.interfaces["g0/1"].l2mode).toBe("routed");
    });
  });

  describe("1941 Router - Should reject switchport commands", () => {
    let engine: CLIEngine;
    let session: CLISession;

    beforeEach(() => {
      const grammarPath = path.join(__dirname, "../../commands-1941-router.yaml");
      const grammar = loadGrammar(grammarPath);
      engine = new CLIEngine(grammar);
      session = new CLISession(grammar, '1941-router');
      session.modeStack.push(ModeType.PRIV_EXEC);
      session.modeStack.push(ModeType.GLOBAL_CONFIG);
    });

    test("'switchport mode access' rejected on router", () => {
      // Enter interface config mode
      const ifResult = engine.executeCommand(session, "interface g0/0");
      expect(ifResult.output).not.toContain("Invalid input");
      session.modeStack.push(ModeType.IF_CONFIG);
      session.modeStack.currentInterface = "g0/0";
      
      // Verify switchport command doesn't exist (returns parse error)
      const swResult = engine.executeCommand(session, "switchport mode access");
      expect(swResult.output.some(line => line.includes("Invalid input") || line.includes("%"))).toBe(true);
    });

    test("'switchport mode trunk' rejected on router", () => {
      // Enter interface config mode
      engine.executeCommand(session, "interface g0/1");
      session.modeStack.push(ModeType.IF_CONFIG);
      session.modeStack.currentInterface = "g0/1";
      
      // Verify trunk mode doesn't exist
      const result = engine.executeCommand(session, "switchport mode trunk");
      expect(result.output.some(line => line.includes("Invalid input") || line.includes("%"))).toBe(true);
    });

    test("'no switchport' command rejected on router", () => {
      // Enter interface config mode
      engine.executeCommand(session, "interface g0/0");
      session.modeStack.push(ModeType.IF_CONFIG);
      session.modeStack.currentInterface = "g0/0";
      
      // Verify "no switchport" doesn't exist (not needed on routers)
      const result = engine.executeCommand(session, "no switchport");
      expect(result.output.some(line => line.includes("Invalid input") || line.includes("%"))).toBe(true);
    });

    test("can set IP address without 'no switchport'", () => {
      // Router interfaces are routed by default, no "no switchport" needed
      engine.executeCommand(session, "interface g0/0");
      session.modeStack.push(ModeType.IF_CONFIG);
      session.modeStack.currentInterface = "g0/0";
      
      const result = engine.executeCommand(session, "ip address 10.0.0.1 255.255.255.0");
      expect(result.output).not.toContain("Invalid input");
      expect(session.deviceState.interfaces["g0/0"].ip).toBe("10.0.0.1");
    });

    test("FastEthernet interface names rejected on router", () => {
      const result = engine.executeCommand(session, "interface fa0/1");
      expect(result.output.some(line => line.includes("Invalid input") || line.includes("%"))).toBe(true);
    });

    test("GigabitEthernet0/0 format works on router", () => {
      const result = engine.executeCommand(session, "interface g0/0");
      expect(result.output).not.toContain("Invalid input");
      expect(result.output.some(line => line.includes("Invalid input") || line.includes("%"))).toBe(false);
    });

    test("router interfaces are routed by default", () => {
      // Verify interfaces start with l2mode: "routed"
      expect(session.deviceState.interfaces["g0/0"].l2mode).toBe("routed");
      expect(session.deviceState.interfaces["g0/1"].l2mode).toBe("routed");
    });
  });

  describe("Both devices support common commands", () => {
    test("2960 switch supports 'show ip interface brief'", () => {
      const grammarPath = path.join(__dirname, "../../commands-2960-switch.yaml");
      const grammar = loadGrammar(grammarPath);
      const engine = new CLIEngine(grammar);
      const session = new CLISession(grammar, '2960-switch');
      
      const result = engine.executeCommand(session, "show ip interface brief");
      expect(result.output).toBeDefined();
      expect(result.output.length).toBeGreaterThan(0);
    });

    test("1941 router supports 'show ip interface brief'", () => {
      const grammarPath = path.join(__dirname, "../../commands-1941-router.yaml");
      const grammar = loadGrammar(grammarPath);
      const engine = new CLIEngine(grammar);
      const session = new CLISession(grammar, '1941-router');
      
      const result = engine.executeCommand(session, "show ip interface brief");
      expect(result.output).toBeDefined();
      expect(result.output.length).toBeGreaterThan(0);
    });

    test("both support 'ip route' static routing", () => {
      // Test switch
      const switchGrammarPath = path.join(__dirname, "../../commands-2960-switch.yaml");
      const switchGrammar = loadGrammar(switchGrammarPath);
      const switchEngine = new CLIEngine(switchGrammar);
      const switchSession = new CLISession(switchGrammar, '2960-switch');
      switchSession.modeStack.push(ModeType.PRIV_EXEC);
      switchSession.modeStack.push(ModeType.GLOBAL_CONFIG);
      
      const switchResult = switchEngine.executeCommand(switchSession, "ip route 0.0.0.0 0.0.0.0 10.0.0.1");
      expect(switchResult.output).not.toContain("Invalid input");
      expect(switchSession.deviceState.routes.length).toBe(1);
      
      // Test router
      const routerGrammarPath = path.join(__dirname, "../../commands-1941-router.yaml");
      const routerGrammar = loadGrammar(routerGrammarPath);
      const routerEngine = new CLIEngine(routerGrammar);
      const routerSession = new CLISession(routerGrammar, '1941-router');
      routerSession.modeStack.push(ModeType.PRIV_EXEC);
      routerSession.modeStack.push(ModeType.GLOBAL_CONFIG);
      
      const routerResult = routerEngine.executeCommand(routerSession, "ip route 0.0.0.0 0.0.0.0 10.0.0.1");
      expect(routerResult.output).not.toContain("Invalid input");
      expect(routerSession.deviceState.routes.length).toBe(1);
    });

    test("both support 'router ospf' configuration", () => {
      // Test switch
      const switchGrammarPath = path.join(__dirname, "../../commands-2960-switch.yaml");
      const switchGrammar = loadGrammar(switchGrammarPath);
      const switchEngine = new CLIEngine(switchGrammar);
      const switchSession = new CLISession(switchGrammar, '2960-switch');
      switchSession.modeStack.push(ModeType.PRIV_EXEC);
      switchSession.modeStack.push(ModeType.GLOBAL_CONFIG);
      
      const switchResult = switchEngine.executeCommand(switchSession, "router ospf 1");
      expect(switchResult.output).not.toContain("Invalid input");
      expect(switchSession.deviceState.ospf.processId).toBe(1);
      
      // Test router
      const routerGrammarPath = path.join(__dirname, "../../commands-1941-router.yaml");
      const routerGrammar = loadGrammar(routerGrammarPath);
      const routerEngine = new CLIEngine(routerGrammar);
      const routerSession = new CLISession(routerGrammar, '1941-router');
      routerSession.modeStack.push(ModeType.PRIV_EXEC);
      routerSession.modeStack.push(ModeType.GLOBAL_CONFIG);
      
      const routerResult = routerEngine.executeCommand(routerSession, "router ospf 1");
      expect(routerResult.output).not.toContain("Invalid input");
      expect(routerSession.deviceState.ospf.processId).toBe(1);
    });

    test("both support 'show running-config'", () => {
      // Test switch
      const switchGrammarPath = path.join(__dirname, "../../commands-2960-switch.yaml");
      const switchGrammar = loadGrammar(switchGrammarPath);
      const switchEngine = new CLIEngine(switchGrammar);
      const switchSession = new CLISession(switchGrammar, '2960-switch');
      
      const switchResult = switchEngine.executeCommand(switchSession, "show running-config");
      expect(switchResult.output).toBeDefined();
      expect(switchResult.output.length).toBeGreaterThan(0);
      expect(switchResult.paginated).toBe(true);
      
      // Test router
      const routerGrammarPath = path.join(__dirname, "../../commands-1941-router.yaml");
      const routerGrammar = loadGrammar(routerGrammarPath);
      const routerEngine = new CLIEngine(routerGrammar);
      const routerSession = new CLISession(routerGrammar, '1941-router');
      
      const routerResult = routerEngine.executeCommand(routerSession, "show running-config");
      expect(routerResult.output).toBeDefined();
      expect(routerResult.output.length).toBeGreaterThan(0);
      expect(routerResult.paginated).toBe(true);
    });
  });
});

