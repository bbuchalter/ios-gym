import { CLIEngine } from "../cli/engine";
import { Session } from "../server/session";
import { SessionManager } from "../server/session";
import { loadGrammar } from "../grammar/loader";
import { loadExercises } from "../exercise/loader";
import * as path from "path";

describe("CLI Integration Tests", () => {
  let engine: CLIEngine;
  let sessionManager: SessionManager;
  let session: Session;

  beforeEach(() => {
    const grammarPath = path.join(process.cwd(), "commands.yaml");
    const exercisesPath = path.join(process.cwd(), "exercises.yaml");
    const grammar = loadGrammar(grammarPath);
    const exercises = loadExercises(exercisesPath);
    
    engine = new CLIEngine(grammar);
    sessionManager = new SessionManager(grammar, exercises);
    session = sessionManager.createSession("test-session");
  });

  describe("Basic Navigation Workflow", () => {
    test("should navigate through modes correctly", () => {
      expect(session.getPrompt()).toBe("Switch> ");
      
      // Enable
      engine.executeCommand(session, "enable");
      expect(session.getPrompt()).toBe("Switch# ");
      
      // Configure terminal
      engine.executeCommand(session, "configure terminal");
      expect(session.getPrompt()).toBe("Switch(config)# ");
      
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
  });

  describe("VLAN Configuration Workflow", () => {
    test("should create VLANs with names", () => {
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      
      engine.executeCommand(session, "vlan 100");
      expect(session.deviceState.vlans["100"]).toBeDefined();
      
      engine.executeCommand(session, "name Sales");
      expect(session.deviceState.vlans["100"].name).toBe("Sales");
      
      engine.executeCommand(session, "vlan 200");
      engine.executeCommand(session, "name Engineering");
      
      expect(session.deviceState.vlans["200"].name).toBe("Engineering");
    });
  });

  describe("Switchport Configuration Workflow", () => {
    test("should configure access port", () => {
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "vlan 100");
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
      engine.executeCommand(session, "interface g0/0");
      engine.executeCommand(session, "ip ospf cost 10");
      
      expect(session.deviceState.ospf.ifCosts["g0/0"]).toBe(10);
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

  describe("Save Valid Config Workflow", () => {
    test("should fail exercise when config not saved", () => {
      const { ExerciseValidator } = require("../exercise/validator");
      const validator = new ExerciseValidator();
      
      // Load exercise
      session.loadExercise("ex-001-basics-hostname-enable-secret");
      
      // Configure device correctly
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "hostname CorporateSwitch2");
      engine.executeCommand(session, "enable secret C1sc0R0ck$");
      engine.executeCommand(session, "end");
      
      // Verify state is correct
      expect(session.deviceState.hostname).toBe("CorporateSwitch2");
      expect(session.deviceState.enableSecret).toBe("C1sc0R0ck$");
      
      // But exercise should fail because config not saved
      const exercise = session.getActiveExercise();
      const result = validator.validate(session.deviceState, exercise);
      
      expect(result.passed).toBe(false);
      expect(result.unmetRequirements.some((r: any) => r.type === "config_saved")).toBe(true);
    });

    test("should fail exercise when saved before configuration", () => {
      const { ExerciseValidator } = require("../exercise/validator");
      const validator = new ExerciseValidator();
      
      // Load exercise
      session.loadExercise("ex-001-basics-hostname-enable-secret");
      
      // Save BEFORE configuring (wrong order)
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "write memory");
      
      // Then configure
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "hostname CorporateSwitch2");
      engine.executeCommand(session, "enable secret C1sc0R0ck$");
      engine.executeCommand(session, "end");
      
      // Exercise should fail because saved state doesn't meet requirements
      const exercise = session.getActiveExercise();
      const result = validator.validate(session.deviceState, exercise);
      
      expect(result.passed).toBe(false);
      expect(result.unmetRequirements.some((r: any) => r.type === "config_saved")).toBe(true);
    });

    test("should pass exercise when configured then saved correctly", () => {
      const { ExerciseValidator } = require("../exercise/validator");
      const validator = new ExerciseValidator();
      
      // Load exercise
      session.loadExercise("ex-001-basics-hostname-enable-secret");
      
      // Configure device correctly
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "hostname CorporateSwitch2");
      engine.executeCommand(session, "enable secret C1sc0R0ck$");
      engine.executeCommand(session, "end");
      
      // Save configuration (correct order)
      engine.executeCommand(session, "write memory");
      
      // Exercise should pass
      const exercise = session.getActiveExercise();
      const result = validator.validate(session.deviceState, exercise);
      
      expect(result.passed).toBe(true);
      expect(result.unmetRequirements).toHaveLength(0);
    });

    test("should fail if config modified after valid save", () => {
      const { ExerciseValidator } = require("../exercise/validator");
      const validator = new ExerciseValidator();
      
      // Load exercise
      session.loadExercise("ex-001-basics-hostname-enable-secret");
      
      // Configure and save correctly
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "hostname CorporateSwitch2");
      engine.executeCommand(session, "enable secret C1sc0R0ck$");
      engine.executeCommand(session, "end");
      engine.executeCommand(session, "write memory");
      
      // Modify config after save
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "hostname DifferentName");
      engine.executeCommand(session, "end");
      
      // Exercise should fail (current state doesn't match even though saved state was valid)
      const exercise = session.getActiveExercise();
      const result = validator.validate(session.deviceState, exercise);
      
      expect(result.passed).toBe(false);
      expect(result.unmetRequirements.length).toBeGreaterThan(0);
    });

    test("should use copy running-config startup-config as alternative save command", () => {
      const { ExerciseValidator } = require("../exercise/validator");
      const validator = new ExerciseValidator();
      
      // Load exercise
      session.loadExercise("ex-001-basics-hostname-enable-secret");
      
      // Configure device correctly
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "hostname CorporateSwitch2");
      engine.executeCommand(session, "enable secret C1sc0R0ck$");
      engine.executeCommand(session, "end");
      
      // Save using alternative command
      engine.executeCommand(session, "copy running-config startup-config");
      
      // Exercise should pass
      const exercise = session.getActiveExercise();
      const result = validator.validate(session.deviceState, exercise);
      
      expect(result.passed).toBe(true);
      expect(result.unmetRequirements).toHaveLength(0);
    });

    test("should fail if partial config saved", () => {
      const { ExerciseValidator } = require("../exercise/validator");
      const validator = new ExerciseValidator();
      
      // Load exercise
      session.loadExercise("ex-001-basics-hostname-enable-secret");
      
      // Configure only hostname
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "hostname CorporateSwitch2");
      engine.executeCommand(session, "end");
      
      // Save partial config
      engine.executeCommand(session, "write memory");
      
      // Complete configuration after save
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "enable secret C1sc0R0ck$");
      engine.executeCommand(session, "end");
      
      // Exercise should fail (saved state missing enable secret)
      const exercise = session.getActiveExercise();
      const result = validator.validate(session.deviceState, exercise);
      
      expect(result.passed).toBe(false);
      expect(result.unmetRequirements.some((r: any) => r.type === "config_saved")).toBe(true);
    });

    test("should pass when resaving after fixing config", () => {
      const { ExerciseValidator } = require("../exercise/validator");
      const validator = new ExerciseValidator();
      
      // Load exercise
      session.loadExercise("ex-001-basics-hostname-enable-secret");
      
      // Configure only hostname and save (incomplete)
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "hostname CorporateSwitch2");
      engine.executeCommand(session, "end");
      engine.executeCommand(session, "write memory");
      
      // Complete configuration
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "enable secret C1sc0R0ck$");
      engine.executeCommand(session, "end");
      
      // Save again with complete config
      engine.executeCommand(session, "write memory");
      
      // Exercise should now pass
      const exercise = session.getActiveExercise();
      const result = validator.validate(session.deviceState, exercise);
      
      expect(result.passed).toBe(true);
      expect(result.unmetRequirements).toHaveLength(0);
    });
  });
});

