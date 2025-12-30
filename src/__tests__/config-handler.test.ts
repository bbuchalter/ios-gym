import { handlePersist, handleSet } from "../cli/handlers/config";
import { CLISession } from "../cli-session";
import { CommandGrammar } from "../types";

describe("Config Handlers", () => {
  let session: CLISession;
  
  beforeEach(() => {
    const mockGrammar = {
      version: "0.1",
      description: "Test",
      deviceModel: "2960-switch",
      settings: { keyword_abbrev: { enabled: true, min_prefix: 2 }, case_insensitive: true },
      modes: {},
      arg_types: {},
      state_schema: {},
      commands: {},
      templates: {}
    } as CommandGrammar;
    
    session = new CLISession(mockGrammar);
  });

  describe("handlePersist", () => {
    test("should capture state snapshot when saving", () => {
      // Configure the device
      session.deviceState.hostname = "CorporateSwitch";
      session.deviceState.enableSecret = "cisco123";
      session.deviceState.vlans["100"] = { name: "Sales" };
      
      // Save the configuration
      const result = handlePersist(session, {}, { output: "Building configuration...\n[OK]" });
      
      // Verify save was acknowledged
      expect(result.output).toEqual(["Building configuration...", "[OK]"]);
      
      // Verify configSaved flag is set
      expect(session.deviceState.configSaved).toBe(true);
      
      // Verify savedState contains the snapshot
      expect(session.deviceState.savedState).not.toBeNull();
      expect(session.deviceState.savedState?.hostname).toBe("CorporateSwitch");
      expect(session.deviceState.savedState?.enableSecret).toBe("cisco123");
      expect(session.deviceState.savedState?.vlans?.["100"]).toEqual({ name: "Sales" });
    });

    test("should not include savedState or configSaved in the snapshot", () => {
      // Configure and save
      session.deviceState.hostname = "Router1";
      handlePersist(session, {}, {});
      
      // Verify savedState doesn't contain itself
      expect(session.deviceState.savedState).not.toBeNull();
      expect(session.deviceState.savedState).not.toHaveProperty("savedState");
      expect(session.deviceState.savedState).not.toHaveProperty("configSaved");
    });

    test("should create deep copy of state", () => {
      // Configure the device
      session.deviceState.hostname = "Switch1";
      session.deviceState.vlans["100"] = { name: "Sales" };
      
      // Save the configuration
      handlePersist(session, {}, {});
      
      // Modify current state after save
      session.deviceState.hostname = "Switch2";
      session.deviceState.vlans["100"].name = "Marketing";
      session.deviceState.vlans["200"] = { name: "Engineering" };
      
      // Verify savedState still has original values
      expect(session.deviceState.savedState?.hostname).toBe("Switch1");
      expect(session.deviceState.savedState?.vlans?.["100"]).toEqual({ name: "Sales" });
      expect(session.deviceState.savedState?.vlans?.["200"]).toBeUndefined();
    });

    test("should overwrite previous savedState on subsequent saves", () => {
      // First configuration and save
      session.deviceState.hostname = "Switch1";
      handlePersist(session, {}, {});
      expect(session.deviceState.savedState?.hostname).toBe("Switch1");
      
      // Change configuration and save again
      session.deviceState.hostname = "Switch2";
      handlePersist(session, {}, {});
      
      // Verify savedState has new values
      expect(session.deviceState.savedState?.hostname).toBe("Switch2");
    });

    test("should use default output when not specified", () => {
      const result = handlePersist(session, {}, {});
      expect(result.output).toEqual(["Building configuration...", "[OK]"]);
    });

    test("should use custom output when specified", () => {
      const customOutput = "Destination filename [startup-config]?\nBuilding configuration...\n[OK]";
      const result = handlePersist(session, {}, { output: customOutput });
      expect(result.output).toEqual([
        "Destination filename [startup-config]?",
        "Building configuration...",
        "[OK]"
      ]);
    });

    test("should capture complex state with interfaces and routes", () => {
      // Configure complex state
      session.deviceState.hostname = "Router1";
      session.deviceState.interfaces["g0/1"] = {
        adminUp: true,
        l2mode: "routed",
        accessVlan: null,
        trunkAllowed: null,
        ip: "192.168.1.1",
        mask: "255.255.255.0"
      };
      session.deviceState.routes.push({
        dest: "0.0.0.0",
        mask: "0.0.0.0",
        nextHop: "192.168.1.254",
        ad: 1
      });
      session.deviceState.ospf.processId = 1;
      session.deviceState.ospf.networks.push({
        ip: "192.168.1.0",
        wildcard: "0.0.0.255",
        area: 0
      });
      
      // Save
      handlePersist(session, {}, {});
      
      // Verify all complex data is captured
      expect(session.deviceState.savedState?.interfaces?.["g0/1"]).toEqual({
        adminUp: true,
        l2mode: "routed",
        accessVlan: null,
        trunkAllowed: null,
        ip: "192.168.1.1",
        mask: "255.255.255.0"
      });
      expect(session.deviceState.savedState?.routes).toHaveLength(1);
      expect(session.deviceState.savedState?.routes?.[0]).toEqual({
        dest: "0.0.0.0",
        mask: "0.0.0.0",
        nextHop: "192.168.1.254",
        ad: 1
      });
      expect(session.deviceState.savedState?.ospf?.processId).toBe(1);
      expect(session.deviceState.savedState?.ospf?.networks).toHaveLength(1);
    });
  });

  describe("handleSet", () => {
    test("should set state value from action.value", () => {
      const result = handleSet(
        session,
        {},
        { path: "hostname", value: "TestRouter" }
      );
      
      expect(session.deviceState.hostname).toBe("TestRouter");
      expect(result.output).toEqual([]);
    });

    test("should set state value from args", () => {
      const result = handleSet(
        session,
        { name: "CorporateSwitch" },
        { path: "hostname", value_from: "name" }
      );
      
      expect(session.deviceState.hostname).toBe("CorporateSwitch");
      expect(result.output).toEqual([]);
    });

    test("should parse integer values", () => {
      handleSet(
        session,
        { processId: "1" },
        { path: "ospf.processId", value_from: "processId" }
      );
      
      expect(session.deviceState.ospf.processId).toBe(1);
      expect(typeof session.deviceState.ospf.processId).toBe("number");
    });
  });
});

