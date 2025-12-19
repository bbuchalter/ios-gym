import {
  createInitialState,
  cloneState,
  getStatePath,
  setStatePath,
  normalizeInterfaceName,
  ensureInterface
} from "../cli/state";

describe("Device State Management", () => {
  describe("createInitialState", () => {
    test("should create initial state with default values", () => {
      const state = createInitialState();
      
      expect(state.hostname).toBe("Switch");
      expect(state.enableSecret).toBeNull();
      expect(state.interfaces).toEqual({});
      expect(state.vlans["1"]).toEqual({ name: "default" });
      expect(state.routes).toEqual([]);
      expect(state.ospf.processId).toBeNull();
    });
  });

  describe("cloneState", () => {
    test("should create deep copy of state", () => {
      const state = createInitialState();
      state.hostname = "Router1";
      state.routes.push({
        dest: "0.0.0.0",
        mask: "0.0.0.0",
        nextHop: "192.168.1.1",
        ad: 1
      });
      
      const cloned = cloneState(state);
      
      expect(cloned).toEqual(state);
      expect(cloned).not.toBe(state);
      expect(cloned.routes).not.toBe(state.routes);
    });
  });

  describe("getStatePath", () => {
    test("should get nested property value", () => {
      const state = createInitialState();
      state.ssh.domainName = "cisco.com";
      
      expect(getStatePath(state, "hostname")).toBe("Switch");
      expect(getStatePath(state, "ssh.domainName")).toBe("cisco.com");
      expect(getStatePath(state, "ospf.processId")).toBeNull();
    });

    test("should return undefined for non-existent path", () => {
      const state = createInitialState();
      
      expect(getStatePath(state, "nonexistent.path")).toBeUndefined();
    });
  });

  describe("setStatePath", () => {
    test("should set nested property value", () => {
      const state = createInitialState();
      
      setStatePath(state, "hostname", "Router1");
      expect(state.hostname).toBe("Router1");
      
      setStatePath(state, "ssh.domainName", "test.com");
      expect(state.ssh.domainName).toBe("test.com");
      
      setStatePath(state, "ospf.processId", 1);
      expect(state.ospf.processId).toBe(1);
    });

    test("should create intermediate objects if needed", () => {
      const state = createInitialState();
      
      setStatePath(state, "ssh.vty.login", "local");
      expect(state.ssh.vty.login).toBe("local");
    });
  });

  describe("normalizeInterfaceName", () => {
    test("should normalize GigabitEthernet variants", () => {
      expect(normalizeInterfaceName("GigabitEthernet0/1")).toBe("g0/1");
      expect(normalizeInterfaceName("gi0/1")).toBe("g0/1");
      expect(normalizeInterfaceName("g0/1")).toBe("g0/1");
    });

    test("should normalize FastEthernet variants", () => {
      expect(normalizeInterfaceName("FastEthernet0/1")).toBe("fa0/1");
      expect(normalizeInterfaceName("fa0/1")).toBe("fa0/1");
    });

    test("should normalize VLAN interfaces", () => {
      expect(normalizeInterfaceName("vlan 1")).toBe("vlan1");
      expect(normalizeInterfaceName("vlan1")).toBe("vlan1");
      expect(normalizeInterfaceName("vlan 100")).toBe("vlan100");
    });

    test("should handle case insensitivity", () => {
      expect(normalizeInterfaceName("GIGABITETHERNET0/1")).toBe("g0/1");
      expect(normalizeInterfaceName("Gi0/1")).toBe("g0/1");
    });
  });

  describe("ensureInterface", () => {
    test("should create interface if it doesn't exist", () => {
      const state = createInitialState();
      
      ensureInterface(state, "g0/1");
      
      expect(state.interfaces["g0/1"]).toBeDefined();
      expect(state.interfaces["g0/1"].adminUp).toBe(false);
      expect(state.interfaces["g0/1"].l2mode).toBeNull();
    });

    test("should not overwrite existing interface", () => {
      const state = createInitialState();
      
      ensureInterface(state, "g0/1");
      state.interfaces["g0/1"].adminUp = true;
      state.interfaces["g0/1"].ip = "192.168.1.1";
      
      ensureInterface(state, "g0/1");
      
      expect(state.interfaces["g0/1"].adminUp).toBe(true);
      expect(state.interfaces["g0/1"].ip).toBe("192.168.1.1");
    });
  });
});

