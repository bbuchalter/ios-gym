import { CLIEngine } from "../cli/engine";
import { loadGrammar } from "../grammar/loader";
import { loadExercises } from "../exercise/loader";
import { ExerciseValidator } from "../exercise/validator";
import { SessionManager } from "../server/session";
import * as path from "path";

describe("Exercise Completion Tests", () => {
  let engine: CLIEngine;
  let sessionManager: SessionManager;
  let validator: ExerciseValidator;

  beforeAll(() => {
    const grammarPath = path.join(process.cwd(), "commands.yaml");
    const exercisesPath = path.join(process.cwd(), "exercises.yaml");
    const grammar = loadGrammar(grammarPath);
    const exercises = loadExercises(exercisesPath);
    
    engine = new CLIEngine(grammar);
    sessionManager = new SessionManager(grammar, exercises);
    validator = new ExerciseValidator();
  });

  describe("Exercise 1: Basics - hostname + enable secret", () => {
    let session: any;

    beforeEach(() => {
      session = sessionManager.createSession("test-ex001");
      session.loadExercise("ex-001-basics-hostname-enable-secret");
    });

    test("should load exercise correctly", () => {
      expect(session.activeExerciseId).toBe("ex-001-basics-hostname-enable-secret");
      expect(session.deviceState.hostname).toBe("Switch");
    });

    test("should complete exercise with correct configuration", () => {
      const exercise = session.getActiveExercise();
      
      // Enter privileged mode
      engine.executeCommand(session, "enable");
      
      // Enter config mode
      engine.executeCommand(session, "configure terminal");
      
      // Set hostname
      engine.executeCommand(session, "hostname CorporateSwitch2");
      
      // Set enable secret
      engine.executeCommand(session, "enable secret C1sc0R0ck$");
      
      // Validate
      const result = validator.validate(session.deviceState, exercise);
      
      expect(result.passed).toBe(true);
      expect(result.unmetRequirements).toHaveLength(0);
      expect(session.deviceState.hostname).toBe("CorporateSwitch2");
      expect(session.deviceState.enableSecret).toBe("C1sc0R0ck$");
    });

    test("should fail with incorrect hostname", () => {
      const exercise = session.getActiveExercise();
      
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "hostname WrongName");
      engine.executeCommand(session, "enable secret C1sc0R0ck$");
      
      const result = validator.validate(session.deviceState, exercise);
      
      expect(result.passed).toBe(false);
      expect(result.unmetRequirements.length).toBeGreaterThan(0);
    });
    
    test("should fail with incorrect enable secret", () => {
      const exercise = session.getActiveExercise();
      
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "hostname CorporateSwitch2");
      engine.executeCommand(session, "enable secret WrongPassword");
      
      const result = validator.validate(session.deviceState, exercise);
      
      expect(result.passed).toBe(false);
      expect(result.unmetRequirements).toHaveLength(1);
      expect(result.unmetRequirements[0].type).toBe("state_equals");
    });
    
    test("should work with abbreviated commands", () => {
      const exercise = session.getActiveExercise();
      
      engine.executeCommand(session, "en");
      engine.executeCommand(session, "conf t");
      engine.executeCommand(session, "hostname CorporateSwitch2");
      engine.executeCommand(session, "enable secret C1sc0R0ck$");
      
      const result = validator.validate(session.deviceState, exercise);
      
      expect(result.passed).toBe(true);
    });
  });

  describe("Exercise 2: L2 switch management - SVI + ip default-gateway", () => {
    let session: any;

    beforeEach(() => {
      session = sessionManager.createSession("test-ex002");
      session.loadExercise("ex-002-l2-mgmt-ip-default-gateway");
    });

    test("should complete exercise correctly", () => {
      const exercise = session.getActiveExercise();
      
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      
      // Configure VLAN 1 SVI (use "vlan1" without space - as parser expects)
      engine.executeCommand(session, "interface vlan1");
      engine.executeCommand(session, "ip address 172.16.16.3 255.255.255.0");
      engine.executeCommand(session, "no shutdown");
      engine.executeCommand(session, "exit");
      
      // Set default gateway
      engine.executeCommand(session, "ip default-gateway 172.16.16.1");
      
      const result = validator.validate(session.deviceState, exercise);
      
      expect(result.passed).toBe(true);
      expect(result.unmetRequirements).toHaveLength(0);
      expect(session.deviceState.interfaces["vlan1"].ip).toBe("172.16.16.3");
      expect(session.deviceState.ipDefaultGateway).toBe("172.16.16.1");
    });

    test("should fail without default gateway", () => {
      const exercise = session.getActiveExercise();
      
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "interface vlan 1");
      engine.executeCommand(session, "ip address 172.16.16.3 255.255.255.0");
      engine.executeCommand(session, "no shutdown");
      
      const result = validator.validate(session.deviceState, exercise);
      
      expect(result.passed).toBe(false);
    });
  });

  describe("Exercise 3: VLAN database + access ports", () => {
    let session: any;

    beforeEach(() => {
      session = sessionManager.createSession("test-ex003");
      session.loadExercise("ex-003-vlan-db-and-access-ports");
    });

    test("should complete exercise correctly", () => {
      const exercise = session.getActiveExercise();
      
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      
      // Create VLANs
      engine.executeCommand(session, "vlan 100");
      engine.executeCommand(session, "vlan 200");
      
      // Configure Fa0/2
      engine.executeCommand(session, "interface fa0/2");
      engine.executeCommand(session, "switchport mode access");
      engine.executeCommand(session, "switchport access vlan 100");
      engine.executeCommand(session, "exit");
      
      // Configure Fa0/3
      engine.executeCommand(session, "interface fa0/3");
      engine.executeCommand(session, "switchport mode access");
      engine.executeCommand(session, "switchport access vlan 200");
      
      const result = validator.validate(session.deviceState, exercise);
      
      expect(result.passed).toBe(true);
      expect(result.unmetRequirements).toHaveLength(0);
      expect(session.deviceState.vlans["100"]).toBeDefined();
      expect(session.deviceState.vlans["200"]).toBeDefined();
      expect(session.deviceState.interfaces["fa0/2"].accessVlan).toBe("100");
      expect(session.deviceState.interfaces["fa0/3"].accessVlan).toBe("200");
    });

    test("should fail with wrong VLAN assignment", () => {
      const exercise = session.getActiveExercise();
      
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "vlan 100");
      engine.executeCommand(session, "vlan 200");
      engine.executeCommand(session, "interface fa0/2");
      engine.executeCommand(session, "switchport mode access");
      engine.executeCommand(session, "switchport access vlan 200"); // Wrong VLAN
      
      const result = validator.validate(session.deviceState, exercise);
      
      expect(result.passed).toBe(false);
    });
    
    test("should allow VLAN naming", () => {
      const exercise = session.getActiveExercise();
      
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "vlan 100");
      engine.executeCommand(session, "name Sales");
      engine.executeCommand(session, "vlan 200");
      engine.executeCommand(session, "name Engineering");
      engine.executeCommand(session, "interface fa0/2");
      engine.executeCommand(session, "switchport mode access");
      engine.executeCommand(session, "switchport access vlan 100");
      engine.executeCommand(session, "exit");
      engine.executeCommand(session, "interface fa0/3");
      engine.executeCommand(session, "switchport mode access");
      engine.executeCommand(session, "switchport access vlan 200");
      
      const result = validator.validate(session.deviceState, exercise);
      
      expect(result.passed).toBe(true);
      expect(session.deviceState.vlans["100"].name).toBe("Sales");
      expect(session.deviceState.vlans["200"].name).toBe("Engineering");
    });
  });

  describe("Exercise 4: Trunking - restrict allowed VLANs", () => {
    let session: any;

    beforeEach(() => {
      session = sessionManager.createSession("test-ex004");
      session.loadExercise("ex-004-trunk-allowed-vlans");
    });

    test("should complete exercise correctly", () => {
      const exercise = session.getActiveExercise();
      
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      
      // Configure Fa0/1 as trunk
      engine.executeCommand(session, "interface fa0/1");
      engine.executeCommand(session, "switchport mode trunk");
      engine.executeCommand(session, "switchport trunk allowed vlan 1,100,200");
      engine.executeCommand(session, "exit");
      
      // Configure G0/1 as trunk
      engine.executeCommand(session, "interface g0/1");
      engine.executeCommand(session, "switchport mode trunk");
      engine.executeCommand(session, "switchport trunk allowed vlan 1,100,200");
      
      const result = validator.validate(session.deviceState, exercise);
      
      expect(result.passed).toBe(true);
      expect(result.unmetRequirements).toHaveLength(0);
      expect(session.deviceState.interfaces["fa0/1"].l2mode).toBe("trunk");
      expect(session.deviceState.interfaces["fa0/1"].trunkAllowed).toBe("1,100,200");
      expect(session.deviceState.interfaces["g0/1"].trunkAllowed).toBe("1,100,200");
    });

    test("should fail with wrong VLAN list", () => {
      const exercise = session.getActiveExercise();
      
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "interface fa0/1");
      engine.executeCommand(session, "switchport mode trunk");
      engine.executeCommand(session, "switchport trunk allowed vlan 1,100"); // Missing 200
      
      const result = validator.validate(session.deviceState, exercise);
      
      expect(result.passed).toBe(false);
    });
  });

  describe("Exercise 5: Layer 3 switch - routed port with no switchport", () => {
    let session: any;

    beforeEach(() => {
      session = sessionManager.createSession("test-ex005");
      session.loadExercise("ex-005-l3-switch-no-switchport-and-ip");
    });

    test("should complete exercise correctly", () => {
      const exercise = session.getActiveExercise();
      
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "interface g1/0/2");
      engine.executeCommand(session, "no switchport");
      engine.executeCommand(session, "ip address 35.72.12.1 255.255.255.252");
      engine.executeCommand(session, "no shutdown");
      
      const result = validator.validate(session.deviceState, exercise!);
      
      expect(result.passed).toBe(true);
      expect(result.unmetRequirements).toHaveLength(0);
      expect(session.deviceState.interfaces["g1/0/2"].l2mode).toBe("routed");
      expect(session.deviceState.interfaces["g1/0/2"].ip).toBe("35.72.12.1");
      expect(session.deviceState.interfaces["g1/0/2"].adminUp).toBe(true);
    });

    test("should fail with wrong IP address", () => {
      const exercise = session.getActiveExercise();
      
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "interface g1/0/2");
      engine.executeCommand(session, "no switchport");
      engine.executeCommand(session, "ip address 192.168.1.1 255.255.255.0"); // Wrong IP
      engine.executeCommand(session, "no shutdown");
      
      const result = validator.validate(session.deviceState, exercise);
      
      // Should fail because IP doesn't match requirement
      expect(result.passed).toBe(false);
      expect(result.unmetRequirements.length).toBeGreaterThan(0);
    });
  });

  describe("Exercise 6: Static routing - default + floating backup", () => {
    let session: any;

    beforeEach(() => {
      session = sessionManager.createSession("test-ex006");
      session.loadExercise("ex-006-static-default-and-floating-default");
    });

    test("should complete exercise correctly", () => {
      const exercise = session.getActiveExercise();
      
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      
      // Primary default route
      engine.executeCommand(session, "ip route 0.0.0.0 0.0.0.0 35.72.13.1");
      
      // Floating backup route
      engine.executeCommand(session, "ip route 0.0.0.0 0.0.0.0 35.72.13.2 254");
      
      const result = validator.validate(session.deviceState, exercise);
      
      expect(result.passed).toBe(true);
      expect(result.unmetRequirements).toHaveLength(0);
      expect(session.deviceState.routes).toHaveLength(2);
      expect(session.deviceState.routes[0].ad).toBe(1);
      expect(session.deviceState.routes[1].ad).toBe(254);
    });

    test("should fail without floating route", () => {
      const exercise = session.getActiveExercise();
      
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "ip route 0.0.0.0 0.0.0.0 35.72.13.1");
      
      const result = validator.validate(session.deviceState, exercise);
      
      expect(result.passed).toBe(false);
    });

    test("should fail with wrong AD on backup route", () => {
      const exercise = session.getActiveExercise();
      
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "ip route 0.0.0.0 0.0.0.0 35.72.13.1");
      engine.executeCommand(session, "ip route 0.0.0.0 0.0.0.0 35.72.13.2 100"); // Wrong AD
      
      const result = validator.validate(session.deviceState, exercise);
      
      expect(result.passed).toBe(false);
    });
  });

  describe("Exercise 7: OSPF - process 1, area 0", () => {
    let session: any;

    beforeEach(() => {
      session = sessionManager.createSession("test-ex007");
      session.loadExercise("ex-007-ospf-area0-process1");
    });

    test("should complete exercise correctly", () => {
      const exercise = session.getActiveExercise();
      
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      
      // Configure OSPF
      engine.executeCommand(session, "router ospf 1");
      engine.executeCommand(session, "network 35.72.12.2 0.0.0.0 area 0");
      
      const result = validator.validate(session.deviceState, exercise);
      
      expect(result.passed).toBe(true);
      expect(result.unmetRequirements).toHaveLength(0);
      expect(session.deviceState.ospf.processId).toBe(1);
      expect(session.deviceState.ospf.networks).toHaveLength(1);
      expect(session.deviceState.ospf.networks[0].area).toBe(0);
    });

    test("should fail with wrong process ID", () => {
      const exercise = session.getActiveExercise();
      
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "router ospf 2"); // Wrong process
      engine.executeCommand(session, "network 35.72.12.2 0.0.0.0 area 0");
      
      const result = validator.validate(session.deviceState, exercise);
      
      expect(result.passed).toBe(false);
    });

    test("should fail with wrong area", () => {
      const exercise = session.getActiveExercise();
      
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "router ospf 1");
      engine.executeCommand(session, "network 35.72.12.2 0.0.0.0 area 1"); // Wrong area
      
      const result = validator.validate(session.deviceState, exercise);
      
      expect(result.passed).toBe(false);
    });
  });

  describe("Exercise 8: OSPF - set interface cost", () => {
    let session: any;

    beforeEach(() => {
      session = sessionManager.createSession("test-ex008");
      session.loadExercise("ex-008-ospf-interface-cost");
    });

    test("should complete exercise correctly", () => {
      const exercise = session.getActiveExercise();
      
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      
      // Set cost on g0/0
      engine.executeCommand(session, "interface g0/0");
      engine.executeCommand(session, "ip ospf cost 10");
      engine.executeCommand(session, "exit");
      
      // Set cost on g0/2
      engine.executeCommand(session, "interface g0/2");
      engine.executeCommand(session, "ip ospf cost 30");
      
      const result = validator.validate(session.deviceState, exercise);
      
      expect(result.passed).toBe(true);
      expect(result.unmetRequirements).toHaveLength(0);
      expect(session.deviceState.ospf.ifCosts["g0/0"]).toBe(10);
      expect(session.deviceState.ospf.ifCosts["g0/2"]).toBe(30);
    });

    test("should fail with wrong cost values", () => {
      const exercise = session.getActiveExercise();
      
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "interface g0/0");
      engine.executeCommand(session, "ip ospf cost 20"); // Wrong cost
      engine.executeCommand(session, "exit");
      engine.executeCommand(session, "interface g0/2");
      engine.executeCommand(session, "ip ospf cost 30");
      
      const result = validator.validate(session.deviceState, exercise);
      
      expect(result.passed).toBe(false);
    });
  });

  describe("Exercise 9: SSH - domain, keys, user, vty lines", () => {
    let session: any;

    beforeEach(() => {
      session = sessionManager.createSession("test-ex009");
      session.loadExercise("ex-009-ssh-setup-vty");
    });

    test("should complete exercise correctly", () => {
      const exercise = session.getActiveExercise();
      
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      
      // Configure SSH
      engine.executeCommand(session, "ip domain-name cisco.com");
      engine.executeCommand(session, "crypto key generate rsa modulus 1024");
      engine.executeCommand(session, "ip ssh version 2");
      engine.executeCommand(session, "username admin secret Cyb3rPatriot");
      
      // Configure VTY lines
      engine.executeCommand(session, "line vty 0 4");
      engine.executeCommand(session, "login local");
      engine.executeCommand(session, "transport input ssh");
      
      const result = validator.validate(session.deviceState, exercise);
      
      expect(result.passed).toBe(true);
      expect(result.unmetRequirements).toHaveLength(0);
      expect(session.deviceState.ssh.domainName).toBe("cisco.com");
      expect(session.deviceState.ssh.rsaModulus).toBe(1024);
      expect(session.deviceState.ssh.sshVersion).toBe(2);
      expect(session.deviceState.ssh.users["admin"].secret).toBe("Cyb3rPatriot");
      expect(session.deviceState.ssh.vty.login).toBe("local");
      expect(session.deviceState.ssh.vty.transport).toEqual(["ssh"]);
    });

    test("should fail without RSA keys", () => {
      const exercise = session.getActiveExercise();
      
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "ip domain-name cisco.com");
      // Skip: crypto key generate rsa
      engine.executeCommand(session, "ip ssh version 2");
      engine.executeCommand(session, "username admin secret Cyb3rPatriot");
      engine.executeCommand(session, "line vty 0 4");
      engine.executeCommand(session, "login local");
      engine.executeCommand(session, "transport input ssh");
      
      const result = validator.validate(session.deviceState, exercise);
      
      expect(result.passed).toBe(false);
    });

    test("should fail with wrong username", () => {
      const exercise = session.getActiveExercise();
      
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "ip domain-name cisco.com");
      engine.executeCommand(session, "crypto key generate rsa modulus 1024");
      engine.executeCommand(session, "ip ssh version 2");
      engine.executeCommand(session, "username wronguser secret Cyb3rPatriot"); // Wrong user
      engine.executeCommand(session, "line vty 0 4");
      engine.executeCommand(session, "login local");
      engine.executeCommand(session, "transport input ssh");
      
      const result = validator.validate(session.deviceState, exercise);
      
      expect(result.passed).toBe(false);
    });
    
    test("should fail without vty configuration", () => {
      const exercise = session.getActiveExercise();
      
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "ip domain-name cisco.com");
      engine.executeCommand(session, "crypto key generate rsa modulus 1024");
      engine.executeCommand(session, "ip ssh version 2");
      engine.executeCommand(session, "username admin secret Cyb3rPatriot");
      // Skip vty configuration
      
      const result = validator.validate(session.deviceState, exercise);
      
      expect(result.passed).toBe(false);
      expect(result.unmetRequirements.length).toBeGreaterThan(0);
    });
    
    test("should validate all SSH components individually", () => {
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      
      // Add domain
      engine.executeCommand(session, "ip domain-name cisco.com");
      expect(session.deviceState.ssh.domainName).toBe("cisco.com");
      
      // Generate keys
      engine.executeCommand(session, "crypto key generate rsa modulus 1024");
      expect(session.deviceState.ssh.rsaModulus).toBe(1024);
      
      // Set version
      engine.executeCommand(session, "ip ssh version 2");
      expect(session.deviceState.ssh.sshVersion).toBe(2);
      
      // Create user
      engine.executeCommand(session, "username admin secret Cyb3rPatriot");
      expect(session.deviceState.ssh.users["admin"]).toBeDefined();
      expect(session.deviceState.ssh.users["admin"].secret).toBe("Cyb3rPatriot");
    });
  });

  describe("All Exercises: Completion Workflow", () => {
    test("should be able to load and complete each exercise", () => {
      const exercises = [
        "ex-001-basics-hostname-enable-secret",
        "ex-002-l2-mgmt-ip-default-gateway",
        "ex-003-vlan-db-and-access-ports",
        "ex-004-trunk-allowed-vlans",
        "ex-005-l3-switch-no-switchport-and-ip",
        "ex-006-static-default-and-floating-default",
        "ex-007-ospf-area0-process1",
        "ex-008-ospf-interface-cost",
        "ex-009-ssh-setup-vty"
      ];

      for (const exerciseId of exercises) {
        const session = sessionManager.createSession(`test-${exerciseId}`);
        const loaded = session.loadExercise(exerciseId);
        
        expect(loaded).toBe(true);
        expect(session.activeExerciseId).toBe(exerciseId);
        expect(session.getActiveExercise()).toBeDefined();
        
        sessionManager.deleteSession(`test-${exerciseId}`);
      }
    });

    test("should reset device state when loading new exercise", () => {
      const session = sessionManager.createSession("test-reset");
      
      // Load first exercise and make changes
      session.loadExercise("ex-001-basics-hostname-enable-secret");
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      engine.executeCommand(session, "hostname Modified");
      
      expect(session.deviceState.hostname).toBe("Modified");
      
      // Load second exercise
      session.loadExercise("ex-002-l2-mgmt-ip-default-gateway");
      
      // State should be reset
      expect(session.deviceState.hostname).toBe("Switch");
      expect(session.activeExerciseId).toBe("ex-002-l2-mgmt-ip-default-gateway");
    });
    
    test("should maintain mode stack correctly across exercises", () => {
      const session = sessionManager.createSession("test-modes");
      
      session.loadExercise("ex-001-basics-hostname-enable-secret");
      engine.executeCommand(session, "enable");
      engine.executeCommand(session, "configure terminal");
      
      // Should be in GLOBAL_CONFIG
      expect(session.getPrompt()).toContain("(config)#");
      
      // Load new exercise
      session.loadExercise("ex-003-vlan-db-and-access-ports");
      
      // Should reset to USER_EXEC
      expect(session.getPrompt()).toContain(">");
    });
  });

  describe("Exercise Requirements Validation", () => {
    test("each exercise should have valid requirements", () => {
      const session = sessionManager.createSession("test-requirements");
      
      const exercises = [
        "ex-001-basics-hostname-enable-secret",
        "ex-002-l2-mgmt-ip-default-gateway",
        "ex-003-vlan-db-and-access-ports",
        "ex-004-trunk-allowed-vlans",
        "ex-005-l3-switch-no-switchport-and-ip",
        "ex-006-static-default-and-floating-default",
        "ex-007-ospf-area0-process1",
        "ex-008-ospf-interface-cost",
        "ex-009-ssh-setup-vty"
      ];

      for (const exerciseId of exercises) {
        session.loadExercise(exerciseId);
        const exercise = session.getActiveExercise();
        
        expect(exercise).toBeDefined();
        
        if (exercise) {
          expect(exercise.requirements).toBeDefined();
          expect(exercise.requirements.length).toBeGreaterThan(0);
          expect(exercise.hints).toBeDefined();
          expect(exercise.instructions).toBeDefined();
          
          // Initial state should not pass (unless exercise has no requirements)
          const result = validator.validate(session.deviceState, exercise);
          expect(result.unmetRequirements.length).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });
});

