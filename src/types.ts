// Shared TypeScript types for IOS CLI Trainer

export enum ModeType {
  USER_EXEC = "USER_EXEC",
  PRIV_EXEC = "PRIV_EXEC",
  GLOBAL_CONFIG = "GLOBAL_CONFIG",
  IF_CONFIG = "IF_CONFIG",
  ROUTER_OSPF_CONFIG = "ROUTER_OSPF_CONFIG",
  LINE_VTY_CONFIG = "LINE_VTY_CONFIG"
}

export interface DeviceState {
  hostname: string;
  enableSecret: string | null;
  interfaces: Record<string, InterfaceConfig>;
  vlans: Record<string, VlanConfig>;
  svis: Record<string, SviConfig>;
  ipDefaultGateway: string | null;
  routes: RouteEntry[];
  ospf: OspfConfig;
  ssh: SshConfig;
}

export interface InterfaceConfig {
  adminUp: boolean;
  l2mode: "access" | "trunk" | "routed" | null;
  accessVlan: string | null;
  trunkAllowed: string | null;
  ip: string | null;
  mask: string | null;
}

export interface VlanConfig {
  name: string;
}

export interface SviConfig {
  ip: string;
  mask: string;
  adminUp: boolean;
}

export interface RouteEntry {
  dest: string;
  mask: string;
  nextHop: string;
  ad: number;
}

export interface OspfConfig {
  processId: number | null;
  networks: OspfNetwork[];
  ifCosts: Record<string, number>;
}

export interface OspfNetwork {
  ip: string;
  wildcard: string;
  area: number;
}

export interface SshConfig {
  domainName: string | null;
  rsaModulus: number | null;
  sshVersion: number | null;
  users: Record<string, UserConfig>;
  vty: VtyConfig;
}

export interface UserConfig {
  secret: string;
}

export interface VtyConfig {
  range: string | null;
  login: string | null;
  transport: string[];
}

// Grammar types from commands.yaml
export interface CommandGrammar {
  version: string;
  description: string;
  settings: GrammarSettings;
  modes: Record<ModeType, ModeConfig>;
  arg_types: Record<string, ArgTypeConfig>;
  state_schema: any;
  commands: Record<ModeType, CommandDef[]>;
  templates: Record<string, string>;
}

export interface GrammarSettings {
  keyword_abbrev: {
    enabled: boolean;
    min_prefix: number;
  };
  case_insensitive: boolean;
}

export interface ModeConfig {
  prompt: string;
}

export interface ArgTypeConfig {
  pattern: string;
}

export interface CommandDef {
  name: string;
  tokens: Token[];
  action: ActionDef;
  help?: string;
  output?: string;
  guard?: GuardDef;
  complete?: CompleteDef;
}

export type Token = string | ArgToken;

export interface ArgToken {
  arg?: string;
  optional_arg?: string;
  name: string;
}

export interface ActionDef {
  type: string;
  mode?: string;
  path?: string;
  value?: any;
  value_from?: string;
  template?: string;
  [key: string]: any;
}

export interface GuardDef {
  requires_cursor?: string;
}

export interface CompleteDef {
  arg: string;
  from_state?: string;
  defaults?: string[];
}

// Parse results
export interface ParseResult {
  success: boolean;
  command?: CommandDef;
  args?: Record<string, string>;
  error?: string;
  matchedLength?: number;  // How many characters matched before failure
}

// Command execution result
export interface ExecutionResult {
  output: string[];
  newMode?: ModeType;
  sessionEnd?: boolean;
}

// Tab completion result
export interface CompletionResult {
  type: "complete" | "list";
  value?: string;
  options?: string[];
}

// Exercise types
export interface ExerciseData {
  version: string;
  description: string;
  devices: Record<string, DeviceProfile>;
  exercises: Exercise[];
}

export interface DeviceProfile {
  start_state: Partial<DeviceState>;
}

export interface Exercise {
  id: string;
  title: string;
  device_profile: string;
  instructions: string;
  requirements: Requirement[];
  hints: string[];
}

export interface Requirement {
  type: string;
  [key: string]: any;
}

export interface ValidationResult {
  passed: boolean;
  unmetRequirements: UnmetRequirement[];
}

export interface UnmetRequirement {
  type: string;
  description: string;
}

// WebSocket message types
export interface WSMessage {
  type: "command" | "tab" | "output" | "prompt" | "exercise_status" | "init" | "load_exercise";
  data?: any;
}

export interface CommandMessage extends WSMessage {
  type: "command";
  data: {
    line: string;
  };
}

export interface TabMessage extends WSMessage {
  type: "tab";
  data: {
    line: string;
    cursorPos: number;
  };
}

export interface OutputMessage extends WSMessage {
  type: "output";
  data: {
    lines: string[];
  };
}

export interface PromptMessage extends WSMessage {
  type: "prompt";
  data: {
    text: string;
  };
}

export interface ExerciseStatusMessage extends WSMessage {
  type: "exercise_status";
  data: {
    exerciseId: string;
    passed: boolean;
    unmetRequirements: UnmetRequirement[];
    hints: string[];
  };
}

