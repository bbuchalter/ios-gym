import { CLIEngine } from "../cli/engine";
import { CLISession } from "../cli-session";
import { loadGrammar } from "../grammar/loader";
import * as path from "path";

describe("CLI Integration Tests", () => {
  let engine: CLIEngine;
  let session: CLISession;

  beforeEach(() => {
    const grammarPath = path.join(process.cwd(), "commands-2960-switch.yaml");
    const grammar = loadGrammar(grammarPath);
    
    engine = new CLIEngine(grammar);
    session = new CLISession(grammar);
  });

  describe("Basic Navigation Workflow", () => {
    test("should navigate through modes correctly", () => {
      expect(session.getPrompt()).toBe("Switch> ");
      
      // Enable
      engine.executeCommand(session, "enable");
      expect(session.getPrompt()).toBe("Switch# ");
      
      // Configure terminal
      const result = engine.executeCommand(session, "configure terminal");
      expect(session.getPrompt()).toBe("Switch(config)# ");
      expect(result.output).toContain("Enter configuration commands, one per line.  End with CNTL/Z.");
      
      // Exit to priv exec
      engine.executeCommand(session, "exit");
      expect(session.getPrompt()).toBe("Switch# ");
      
      // Back to config mode
      engine.executeCommand(session, "configure terminal");
      expect(session.getPrompt()).toBe("Switch(config)# ");
      
      // End (jump to priv exec)
      engine.executeCommand(session, "end");
      expect(session.getPrompt()).toBe("Switch# ");
    });
  });

  describe("Hostname Configuration Workflow", () => {
    test("should change hostname and update prompt", () => {
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      
      expect(session.deviceState.hostname).toBe("Switch");
      
      engine.executeCommand(session, "hostname Router1");
      
      expect(session.deviceState.hostname).toBe("Router1");
      expect(session.getPrompt()).toBe("Router1(config)# ");
    });
  });

  describe("Interface Configuration Workflow", () => {
    test("should configure interface with IP and admin status", () => {
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "interface g0/1");
      
      expect(session.getPrompt()).toBe("Switch(config-if)# ");
      expect(session.modeStack.currentInterface).toBe("g0/1");
      
      engine.executeCommand(session, "ip address 192.168.1.1 255.255.255.0");
      engine.executeCommand(session, "no shutdown");
      
      const iface = session.deviceState.interfaces["g0/1"];
      expect(iface.ip).toBe("192.168.1.1");
      expect(iface.mask).toBe("255.255.255.0");
      expect(iface.adminUp).toBe(true);
    });

    test("should configure VLAN interface (multi-word interface name)", () => {
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "interface vlan 1");
      
      expect(session.getPrompt()).toBe("Switch(config-if)# ");
      // Interface names are normalized internally (vlan 1 -> vlan1)
      expect(session.modeStack.currentInterface).toBe("vlan1");
      
      engine.executeCommand(session, "ip address 192.168.1.254 255.255.255.0");
      engine.executeCommand(session, "no shutdown");
      
      const iface = session.deviceState.interfaces["vlan1"];
      expect(iface).toBeDefined();
      expect(iface.ip).toBe("192.168.1.254");
      expect(iface.mask).toBe("255.255.255.0");
      expect(iface.adminUp).toBe(true);
    });
  });

  describe("VLAN Configuration Workflow", () => {
    test("should create VLANs with names", () => {
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      
      engine.executeCommand(session, "vlan 100");
      expect(session.deviceState.vlans["100"]).toBeDefined();
      expect(session.getPrompt()).toBe("Switch(config-vlan)# ");
      
      engine.executeCommand(session, "name Sales");
      expect(session.deviceState.vlans["100"].name).toBe("Sales");
      
      engine.executeCommand(session, "exit");
      expect(session.getPrompt()).toBe("Switch(config)# ");
      
      engine.executeCommand(session, "vlan 200");
      expect(session.getPrompt()).toBe("Switch(config-vlan)# ");
      engine.executeCommand(session, "name Engineering");
      
      expect(session.deviceState.vlans["200"].name).toBe("Engineering");
    });
  });

  describe("Switchport Configuration Workflow", () => {
    test("should configure access port", () => {
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "vlan 100");
      engine.executeCommand(session, "exit");
      engine.executeCommand(session, "interface fa0/2");
      engine.executeCommand(session, "switchport mode access");
      engine.executeCommand(session, "switchport access vlan 100");
      
      const iface = session.deviceState.interfaces["fa0/2"];
      expect(iface.l2mode).toBe("access");
      expect(iface.accessVlan).toBe("100");
    });

    test("should configure trunk port", () => {
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "interface g0/1");
      engine.executeCommand(session, "switchport mode trunk");
      engine.executeCommand(session, "switchport trunk allowed vlan 1,100,200");
      
      const iface = session.deviceState.interfaces["g0/1"];
      expect(iface.l2mode).toBe("trunk");
      expect(iface.trunkAllowed).toBe("1,100,200");
    });
  });

  describe("Routing Configuration Workflow", () => {
    test("should add static routes", () => {
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      
      engine.executeCommand(session, "ip route 0.0.0.0 0.0.0.0 192.168.1.1");
      
      expect(session.deviceState.routes).toHaveLength(1);
      expect(session.deviceState.routes[0]).toEqual({
        dest: "0.0.0.0",
        mask: "0.0.0.0",
        nextHop: "192.168.1.1",
        ad: 1
      });
    });

    test("should add floating static route with custom AD", () => {
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      
      engine.executeCommand(session, "ip route 0.0.0.0 0.0.0.0 192.168.1.2 254");
      
      expect(session.deviceState.routes).toHaveLength(1);
      expect(session.deviceState.routes[0].ad).toBe(254);
    });
  });

  describe("OSPF Configuration Workflow", () => {
    test("should configure OSPF", () => {
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "router ospf 1");
      
      expect(session.deviceState.ospf.processId).toBe(1);
      expect(session.getPrompt()).toBe("Switch(config-router)# ");
      
      engine.executeCommand(session, "network 192.168.1.0 0.0.0.255 area 0");
      
      expect(session.deviceState.ospf.networks).toHaveLength(1);
      expect(session.deviceState.ospf.networks[0]).toEqual({
        ip: "192.168.1.0",
        wildcard: "0.0.0.255",
        area: 0
      });
    });

    test("should configure OSPF interface cost", () => {
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "interface g0/1");
      engine.executeCommand(session, "ip ospf cost 10");
      
      expect(session.deviceState.ospf.ifCosts["g0/1"]).toBe(10);
    });
  });

  describe("SSH Configuration Workflow", () => {
    test("should configure SSH completely", () => {
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      
      engine.executeCommand(session, "ip domain-name cisco.com");
      expect(session.deviceState.ssh.domainName).toBe("cisco.com");
      
      engine.executeCommand(session, "crypto key generate rsa modulus 1024");
      expect(session.deviceState.ssh.rsaModulus).toBe(1024);
      
      engine.executeCommand(session, "ip ssh version 2");
      expect(session.deviceState.ssh.sshVersion).toBe(2);
      
      engine.executeCommand(session, "username admin secret Cyb3rPatriot");
      expect(session.deviceState.ssh.users["admin"]).toEqual({
        secret: "Cyb3rPatriot"
      });
      
      engine.executeCommand(session, "line vty 0 4");
      expect(session.getPrompt()).toBe("Switch(config-line)# ");
      
      engine.executeCommand(session, "login local");
      expect(session.deviceState.ssh.vty.login).toBe("local");
      
      engine.executeCommand(session, "transport input ssh");
      expect(session.deviceState.ssh.vty.transport).toEqual(["ssh"]);
    });
  });

  describe("Command Abbreviation in Workflows", () => {
    test("should work with abbreviated commands", () => {
      engine.executeCommand(session, "en");
      expect(session.getPrompt()).toBe("Switch# ");
      
      engine.executeCommand(session, "conf t");
      expect(session.getPrompt()).toBe("Switch(config)# ");
      
      engine.executeCommand(session, "int g0/1");
      expect(session.getPrompt()).toBe("Switch(config-if)# ");
    });
  });

  // Exercise validation tests removed - exercise functionality deleted
});

