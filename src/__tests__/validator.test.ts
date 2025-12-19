import { ExerciseValidator } from "../exercise/validator";
import { createInitialState } from "../cli/state";
import { Exercise, DeviceState } from "../types";

describe("ExerciseValidator", () => {
  let validator: ExerciseValidator;

  beforeEach(() => {
    validator = new ExerciseValidator();
  });

  describe("state_equals requirement", () => {
    test("should pass when state matches", () => {
      const state = createInitialState();
      state.hostname = "Router1";
      
      const exercise: Exercise = {
        id: "test",
        title: "Test",
        device_profile: "L2_SWITCH",
        instructions: "",
        requirements: [
          { type: "state_equals", path: "hostname", value: "Router1" }
        ],
        hints: []
      };
      
      const result = validator.validate(state, exercise);
      expect(result.passed).toBe(true);
      expect(result.unmetRequirements).toHaveLength(0);
    });

    test("should fail when state doesn't match", () => {
      const state = createInitialState();
      state.hostname = "Router1";
      
      const exercise: Exercise = {
        id: "test",
        title: "Test",
        device_profile: "L2_SWITCH",
        instructions: "",
        requirements: [
          { type: "state_equals", path: "hostname", value: "Router2" }
        ],
        hints: []
      };
      
      const result = validator.validate(state, exercise);
      expect(result.passed).toBe(false);
      expect(result.unmetRequirements).toHaveLength(1);
    });
  });

  describe("vlan_exists requirement", () => {
    test("should pass when VLAN exists", () => {
      const state = createInitialState();
      state.vlans["100"] = { name: "Sales" };
      
      const exercise: Exercise = {
        id: "test",
        title: "Test",
        device_profile: "L2_SWITCH",
        instructions: "",
        requirements: [
          { type: "vlan_exists", vlan: "100" }
        ],
        hints: []
      };
      
      const result = validator.validate(state, exercise);
      expect(result.passed).toBe(true);
    });

    test("should fail when VLAN doesn't exist", () => {
      const state = createInitialState();
      
      const exercise: Exercise = {
        id: "test",
        title: "Test",
        device_profile: "L2_SWITCH",
        instructions: "",
        requirements: [
          { type: "vlan_exists", vlan: "100" }
        ],
        hints: []
      };
      
      const result = validator.validate(state, exercise);
      expect(result.passed).toBe(false);
    });
  });

  describe("if_ip_equals requirement", () => {
    test("should pass when interface IP matches", () => {
      const state = createInitialState();
      state.interfaces["g0/1"] = {
        adminUp: true,
        l2mode: "routed",
        accessVlan: null,
        trunkAllowed: null,
        ip: "192.168.1.1",
        mask: "255.255.255.0"
      };
      
      const exercise: Exercise = {
        id: "test",
        title: "Test",
        device_profile: "ROUTER",
        instructions: "",
        requirements: [
          {
            type: "if_ip_equals",
            ifname: "g0/1",
            ip: "192.168.1.1",
            mask: "255.255.255.0"
          }
        ],
        hints: []
      };
      
      const result = validator.validate(state, exercise);
      expect(result.passed).toBe(true);
    });
  });

  describe("if_admin_up requirement", () => {
    test("should pass when interface is administratively up", () => {
      const state = createInitialState();
      state.interfaces["g0/1"] = {
        adminUp: true,
        l2mode: null,
        accessVlan: null,
        trunkAllowed: null,
        ip: null,
        mask: null
      };
      
      const exercise: Exercise = {
        id: "test",
        title: "Test",
        device_profile: "ROUTER",
        instructions: "",
        requirements: [
          { type: "if_admin_up", ifname: "g0/1" }
        ],
        hints: []
      };
      
      const result = validator.validate(state, exercise);
      expect(result.passed).toBe(true);
    });

    test("should fail when interface is administratively down", () => {
      const state = createInitialState();
      state.interfaces["g0/1"] = {
        adminUp: false,
        l2mode: null,
        accessVlan: null,
        trunkAllowed: null,
        ip: null,
        mask: null
      };
      
      const exercise: Exercise = {
        id: "test",
        title: "Test",
        device_profile: "ROUTER",
        instructions: "",
        requirements: [
          { type: "if_admin_up", ifname: "g0/1" }
        ],
        hints: []
      };
      
      const result = validator.validate(state, exercise);
      expect(result.passed).toBe(false);
    });
  });

  describe("route_exists requirement", () => {
    test("should pass when route exists with correct parameters", () => {
      const state = createInitialState();
      state.routes.push({
        dest: "0.0.0.0",
        mask: "0.0.0.0",
        nextHop: "192.168.1.1",
        ad: 1
      });
      
      const exercise: Exercise = {
        id: "test",
        title: "Test",
        device_profile: "ROUTER",
        instructions: "",
        requirements: [
          {
            type: "route_exists",
            dest: "0.0.0.0",
            mask: "0.0.0.0",
            nextHop: "192.168.1.1",
            ad: 1
          }
        ],
        hints: []
      };
      
      const result = validator.validate(state, exercise);
      expect(result.passed).toBe(true);
    });
  });

  describe("ospf_network_exists requirement", () => {
    test("should pass when OSPF network is configured", () => {
      const state = createInitialState();
      state.ospf.processId = 1;
      state.ospf.networks.push({
        ip: "192.168.1.0",
        wildcard: "0.0.0.255",
        area: 0
      });
      
      const exercise: Exercise = {
        id: "test",
        title: "Test",
        device_profile: "ROUTER",
        instructions: "",
        requirements: [
          {
            type: "ospf_network_exists",
            ip: "192.168.1.0",
            wildcard: "0.0.0.255",
            area: 0
          }
        ],
        hints: []
      };
      
      const result = validator.validate(state, exercise);
      expect(result.passed).toBe(true);
    });
  });

  describe("Multiple requirements", () => {
    test("should pass only when all requirements are met", () => {
      const state = createInitialState();
      state.hostname = "CorporateSwitch";
      state.enableSecret = "cisco123";
      state.vlans["100"] = { name: "Sales" };
      
      const exercise: Exercise = {
        id: "test",
        title: "Test",
        device_profile: "L2_SWITCH",
        instructions: "",
        requirements: [
          { type: "state_equals", path: "hostname", value: "CorporateSwitch" },
          { type: "state_equals", path: "enableSecret", value: "cisco123" },
          { type: "vlan_exists", vlan: "100" }
        ],
        hints: []
      };
      
      const result = validator.validate(state, exercise);
      expect(result.passed).toBe(true);
      expect(result.unmetRequirements).toHaveLength(0);
    });

    test("should fail when any requirement is not met", () => {
      const state = createInitialState();
      state.hostname = "CorporateSwitch";
      state.enableSecret = "cisco123";
      // Missing VLAN 100
      
      const exercise: Exercise = {
        id: "test",
        title: "Test",
        device_profile: "L2_SWITCH",
        instructions: "",
        requirements: [
          { type: "state_equals", path: "hostname", value: "CorporateSwitch" },
          { type: "state_equals", path: "enableSecret", value: "cisco123" },
          { type: "vlan_exists", vlan: "100" }
        ],
        hints: []
      };
      
      const result = validator.validate(state, exercise);
      expect(result.passed).toBe(false);
      expect(result.unmetRequirements).toHaveLength(1);
      expect(result.unmetRequirements[0].type).toBe("vlan_exists");
    });
  });
});

