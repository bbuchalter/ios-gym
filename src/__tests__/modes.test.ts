import { ModeStack } from "../cli/modes";
import { ModeType } from "../types";
import { loadGrammar } from "../grammar/loader";
import * as path from "path";

describe("ModeStack", () => {
  let modeStack: ModeStack;

  beforeEach(() => {
    const grammarPath = path.join(process.cwd(), "commands.yaml");
    const grammar = loadGrammar(grammarPath);
    modeStack = new ModeStack(grammar);
  });

  describe("Initial State", () => {
    test("should start in USER_EXEC mode", () => {
      expect(modeStack.getCurrentMode()).toBe(ModeType.USER_EXEC);
    });

    test("should generate correct initial prompt", () => {
      expect(modeStack.getPrompt("Switch")).toBe("Switch> ");
    });
  });

  describe("Mode Transitions", () => {
    test("should push to PRIV_EXEC mode", () => {
      modeStack.push(ModeType.PRIV_EXEC);
      expect(modeStack.getCurrentMode()).toBe(ModeType.PRIV_EXEC);
      expect(modeStack.getPrompt("Switch")).toBe("Switch# ");
    });

    test("should push to GLOBAL_CONFIG mode", () => {
      modeStack.push(ModeType.PRIV_EXEC);
      modeStack.push(ModeType.GLOBAL_CONFIG);
      expect(modeStack.getCurrentMode()).toBe(ModeType.GLOBAL_CONFIG);
      expect(modeStack.getPrompt("Router1")).toBe("Router1(config)# ");
    });

    test("should push to IF_CONFIG mode", () => {
      modeStack.push(ModeType.PRIV_EXEC);
      modeStack.push(ModeType.GLOBAL_CONFIG);
      modeStack.push(ModeType.IF_CONFIG);
      expect(modeStack.getCurrentMode()).toBe(ModeType.IF_CONFIG);
      expect(modeStack.getPrompt("Router1")).toBe("Router1(config-if)# ");
    });

    test("should pop one mode level", () => {
      modeStack.push(ModeType.PRIV_EXEC);
      modeStack.push(ModeType.GLOBAL_CONFIG);
      modeStack.push(ModeType.IF_CONFIG);
      
      modeStack.pop();
      expect(modeStack.getCurrentMode()).toBe(ModeType.GLOBAL_CONFIG);
    });

    test("should not pop below USER_EXEC", () => {
      const result = modeStack.pop();
      expect(result).toBeNull();
      expect(modeStack.getCurrentMode()).toBe(ModeType.USER_EXEC);
    });

    test("should popTo specific mode", () => {
      modeStack.push(ModeType.PRIV_EXEC);
      modeStack.push(ModeType.GLOBAL_CONFIG);
      modeStack.push(ModeType.IF_CONFIG);
      
      modeStack.popTo(ModeType.PRIV_EXEC);
      expect(modeStack.getCurrentMode()).toBe(ModeType.PRIV_EXEC);
    });
  });

  describe("Context Cursors", () => {
    test("should track current interface", () => {
      modeStack.currentInterface = "g0/1";
      expect(modeStack.currentInterface).toBe("g0/1");
    });

    test("should track current VLAN", () => {
      modeStack.currentVlan = "100";
      expect(modeStack.currentVlan).toBe("100");
    });

    test("should track current OSPF process", () => {
      modeStack.currentOspfProcess = 1;
      expect(modeStack.currentOspfProcess).toBe(1);
    });
  });

  describe("Reset", () => {
    test("should reset to initial state", () => {
      modeStack.push(ModeType.PRIV_EXEC);
      modeStack.push(ModeType.GLOBAL_CONFIG);
      modeStack.currentInterface = "g0/1";
      modeStack.currentVlan = "100";
      
      modeStack.reset();
      
      expect(modeStack.getCurrentMode()).toBe(ModeType.USER_EXEC);
      expect(modeStack.currentInterface).toBeNull();
      expect(modeStack.currentVlan).toBeNull();
    });
  });

  describe("Prompt Generation", () => {
    test("should update prompt when hostname changes", () => {
      expect(modeStack.getPrompt("Switch")).toBe("Switch> ");
      expect(modeStack.getPrompt("Router1")).toBe("Router1> ");
    });

    test("should show correct prompts for all modes", () => {
      expect(modeStack.getPrompt("R1")).toBe("R1> ");
      
      modeStack.push(ModeType.PRIV_EXEC);
      expect(modeStack.getPrompt("R1")).toBe("R1# ");
      
      modeStack.push(ModeType.GLOBAL_CONFIG);
      expect(modeStack.getPrompt("R1")).toBe("R1(config)# ");
      
      modeStack.push(ModeType.IF_CONFIG);
      expect(modeStack.getPrompt("R1")).toBe("R1(config-if)# ");
      
      modeStack.pop();
      modeStack.push(ModeType.CONFIG_VLAN);
      expect(modeStack.getPrompt("R1")).toBe("R1(config-vlan)# ");
      
      modeStack.pop();
      modeStack.push(ModeType.ROUTER_OSPF_CONFIG);
      expect(modeStack.getPrompt("R1")).toBe("R1(config-router)# ");
      
      modeStack.pop();
      modeStack.push(ModeType.LINE_VTY_CONFIG);
      expect(modeStack.getPrompt("R1")).toBe("R1(config-line)# ");
    });
  });
});

