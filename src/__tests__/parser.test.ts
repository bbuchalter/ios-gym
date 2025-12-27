import { CommandParser } from "../cli/parser";
import { loadGrammar } from "../grammar/loader";
import { ModeType } from "../types";
import * as path from "path";

describe("CommandParser", () => {
  let parser: CommandParser;

  beforeAll(() => {
    const grammarPath = path.join(process.cwd(), "commands-2960-switch.yaml");
    const grammar = loadGrammar(grammarPath);
    parser = new CommandParser(grammar);
  });

  describe("User EXEC Mode", () => {
    test("should parse 'enable' command", () => {
      const result = parser.parse("enable", ModeType.USER_EXEC);
      expect(result.success).toBe(true);
      expect(result.command?.name).toBe("enable");
    });

    test("should parse 'exit' command", () => {
      const result = parser.parse("exit", ModeType.USER_EXEC);
      expect(result.success).toBe(true);
      expect(result.command?.name).toBe("exit");
    });

    test("should trigger name lookup for invalid single-word command", () => {
      const result = parser.parse("invalid-command", ModeType.USER_EXEC);
      expect(result.success).toBe(false);
      expect(result.shouldTriggerNameLookup).toBe(true);
      expect(result.lookupHostname).toBe("invalid-command");
    });
  });

  describe("Privileged EXEC Mode", () => {
    test("should parse 'configure terminal' command", () => {
      const result = parser.parse("configure terminal", ModeType.PRIV_EXEC);
      expect(result.success).toBe(true);
      expect(result.command?.name).toBe("configure_terminal");
    });

    test("should parse 'show running-config' command", () => {
      const result = parser.parse("show running-config", ModeType.PRIV_EXEC);
      expect(result.success).toBe(true);
      expect(result.command?.name).toBe("show_running_config_priv");
    });

    test("should parse 'show vlan brief' command", () => {
      const result = parser.parse("show vlan brief", ModeType.PRIV_EXEC);
      expect(result.success).toBe(true);
      expect(result.command?.name).toBe("show_vlan_brief");
    });
  });

  describe("Global Config Mode", () => {
    test("should parse 'hostname' command with argument", () => {
      const result = parser.parse("hostname Router1", ModeType.GLOBAL_CONFIG);
      expect(result.success).toBe(true);
      expect(result.command?.name).toBe("hostname");
      expect(result.args?.hostname).toBe("Router1");
    });

    test("should parse 'enable secret' command", () => {
      const result = parser.parse("enable secret mypassword", ModeType.GLOBAL_CONFIG);
      expect(result.success).toBe(true);
      expect(result.command?.name).toBe("enable_secret");
      expect(result.args?.secret).toBe("mypassword");
    });

    test("should parse 'vlan' command", () => {
      const result = parser.parse("vlan 100", ModeType.GLOBAL_CONFIG);
      expect(result.success).toBe(true);
      expect(result.command?.name).toBe("vlan");
      expect(result.args?.vlan).toBe("100");
    });

    test("should parse 'interface' command", () => {
      const result = parser.parse("interface g0/1", ModeType.GLOBAL_CONFIG);
      expect(result.success).toBe(true);
      expect(result.command?.name).toBe("interface");
      expect(result.args?.ifname).toBe("g0/1");
    });

    test("should parse 'ip route' command with all arguments", () => {
      const result = parser.parse(
        "ip route 0.0.0.0 0.0.0.0 192.168.1.1 254",
        ModeType.GLOBAL_CONFIG
      );
      expect(result.success).toBe(true);
      expect(result.command?.name).toBe("ip_route");
      expect(result.args?.dest).toBe("0.0.0.0");
      expect(result.args?.mask).toBe("0.0.0.0");
      expect(result.args?.nextHop).toBe("192.168.1.1");
      expect(result.args?.ad).toBe("254");
    });

    test("should parse 'ip route' command without optional AD", () => {
      const result = parser.parse(
        "ip route 10.0.0.0 255.0.0.0 192.168.1.1",
        ModeType.GLOBAL_CONFIG
      );
      expect(result.success).toBe(true);
      expect(result.command?.name).toBe("ip_route");
      expect(result.args?.ad).toBeUndefined();
    });
  });

  describe("Interface Config Mode", () => {
    test("should parse 'ip address' command", () => {
      const result = parser.parse(
        "ip address 192.168.1.1 255.255.255.0",
        ModeType.IF_CONFIG
      );
      expect(result.success).toBe(true);
      expect(result.command?.name).toBe("ip_address");
      expect(result.args?.ip).toBe("192.168.1.1");
      expect(result.args?.mask).toBe("255.255.255.0");
    });

    test("should parse 'no shutdown' command", () => {
      const result = parser.parse("no shutdown", ModeType.IF_CONFIG);
      expect(result.success).toBe(true);
      expect(result.command?.name).toBe("no_shutdown");
    });

    test("should parse 'switchport mode access' command", () => {
      const result = parser.parse("switchport mode access", ModeType.IF_CONFIG);
      expect(result.success).toBe(true);
      expect(result.command?.name).toBe("switchport_mode_access");
    });

    test("should parse 'switchport access vlan' command", () => {
      const result = parser.parse("switchport access vlan 100", ModeType.IF_CONFIG);
      expect(result.success).toBe(true);
      expect(result.command?.name).toBe("switchport_access_vlan");
      expect(result.args?.vlan).toBe("100");
    });
  });

  describe("Command Abbreviation", () => {
    test("should accept 'conf t' for 'configure terminal'", () => {
      const result = parser.parse("conf t", ModeType.PRIV_EXEC);
      expect(result.success).toBe(true);
      expect(result.command?.name).toBe("configure_terminal");
    });

    test("should accept 'en' for 'enable'", () => {
      const result = parser.parse("en", ModeType.USER_EXEC);
      expect(result.success).toBe(true);
      expect(result.command?.name).toBe("enable");
    });

    test("should accept 'int g0/1' for 'interface g0/1'", () => {
      const result = parser.parse("int g0/1", ModeType.GLOBAL_CONFIG);
      expect(result.success).toBe(true);
      expect(result.command?.name).toBe("interface");
    });

    test("should accept 'sh run' for 'show running-config'", () => {
      const result = parser.parse("sh run", ModeType.PRIV_EXEC);
      expect(result.success).toBe(true);
      expect(result.command?.name).toBe("show_running_config_priv");
    });
  });

  describe("Argument Validation", () => {
    test("should accept valid IP address", () => {
      const result = parser.parse(
        "ip address 192.168.1.1 255.255.255.0",
        ModeType.IF_CONFIG
      );
      expect(result.success).toBe(true);
    });

    test("should reject invalid VLAN ID format", () => {
      const result = parser.parse("vlan abc", ModeType.GLOBAL_CONFIG);
      expect(result.success).toBe(false);
    });
  });

  describe("Error Messages with Caret Marker", () => {
    test("should show caret at invalid command position", () => {
      const result = parser.parse("invalid command", ModeType.USER_EXEC);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain("^");
      expect(result.error).toContain("% Invalid input detected at '^' marker.");
    });

    test("should show caret at position of unknown keyword", () => {
      const result = parser.parse("set hostname", ModeType.GLOBAL_CONFIG);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain("^");
      // Caret should be at the beginning since 'set' is invalid
      const lines = result.error!.split("\n");
      expect(lines[0]).toMatch(/^\^/);
    });

    test("should show caret after valid keyword when next keyword is invalid", () => {
      const result = parser.parse("configure invalid", ModeType.PRIV_EXEC);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain("^");
      // Caret should be at or after "configure " (around position 10)
      const lines = result.error!.split("\n");
      expect(lines[0].indexOf("^")).toBeGreaterThanOrEqual(9);
    });

    test("should show caret at extra token position", () => {
      const result = parser.parse("enable extra tokens", ModeType.USER_EXEC);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain("^");
      // Caret should point to "extra" after "enable "
      const lines = result.error!.split("\n");
      expect(lines[0].indexOf("^")).toBeGreaterThanOrEqual(7);
    });

    test("should show caret for partial valid command", () => {
      const result = parser.parse("hostname", ModeType.GLOBAL_CONFIG);
      
      // 'hostname' needs an argument
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    test("should show error marker format matches IOS style", () => {
      // Use a multi-word command to trigger caret error (not name lookup)
      const result = parser.parse("show invalid", ModeType.PRIV_EXEC);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      
      // Should have two lines: marker line and error message
      const lines = result.error!.split("\n");
      expect(lines.length).toBeGreaterThanOrEqual(2);
      expect(lines[0]).toContain("^");
      expect(lines[1]).toBe("% Invalid input detected at '^' marker.");
    });

    test("should position caret correctly for multi-word command", () => {
      const result = parser.parse("show running-config extra", ModeType.PRIV_EXEC);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain("^");
      
      // Caret should be after "show running-config " (20+ characters)
      const lines = result.error!.split("\n");
      const caretPos = lines[0].indexOf("^");
      expect(caretPos).toBeGreaterThan(19);
    });

    test("should handle incomplete command error", () => {
      const result = parser.parse("", ModeType.USER_EXEC);
      
      expect(result.success).toBe(false);
      expect(result.error).toBe("% Incomplete command");
    });

    test("should show caret for invalid argument type", () => {
      const result = parser.parse("vlan abc", ModeType.GLOBAL_CONFIG);
      
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error).toContain("^");
      
      // Caret should point at or after "vlan " position
      const lines = result.error!.split("\n");
      const caretPos = lines[0].indexOf("^");
      expect(caretPos).toBeGreaterThanOrEqual(4); // At or after "vlan "
    });
  });
});

