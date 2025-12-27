// Shared TypeScript types for IOS CLI Trainer

// Device model literal types for specific Cisco hardware
export type DeviceModel = '2960-switch' | '1941-router';

export enum ModeType {
  USER_EXEC = "USER_EXEC",
  PRIV_EXEC = "PRIV_EXEC",
  GLOBAL_CONFIG = "GLOBAL_CONFIG",
  IF_CONFIG = "IF_CONFIG",
  CONFIG_VLAN = "CONFIG_VLAN",
  ROUTER_OSPF_CONFIG = "ROUTER_OSPF_CONFIG",
  LINE_VTY_CONFIG = "LINE_VTY_CONFIG",
  LINE_CONSOLE_CONFIG = "LINE_CONSOLE_CONFIG"
}

export interface DeviceState {
  deviceModel: DeviceModel;
  hostname: string;
  enableSecret: string | null;
  interfaces: Record<string, InterfaceConfig>;
  vlans: Record<string, VlanConfig>;
  svis: Record<string, SviConfig>;
  ipDefaultGateway: string | null;
  routes: RouteEntry[];
  ospf: OspfConfig;
  ssh: SshConfig;
  line: {
    console: LineConfig;
  };
  configSaved: boolean;
  savedState: Partial<DeviceState> | null;
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

export interface LineConfig {
  loggingSynchronous: boolean;
}

// Grammar types from commands.yaml
export interface CommandGrammar {
  version: string;
  description: string;
  deviceModel: DeviceModel;
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
  shouldTriggerNameLookup?: boolean; // True if this looks like a hostname attempt
  lookupHostname?: string; // The hostname to look up
}

// Command execution result
export interface ExecutionResult {
  output: string[];
  newMode?: ModeType;
  sessionEnd?: boolean;
  paginated?: boolean; // If true, output should be shown one page at a time with --More--
  passwordPrompt?: {
    prompt: string;
    handler: string; // Handler type to invoke after password is entered
    handlerArgs?: Record<string, any>; // Additional args for handler
  };
  nameLookup?: {
    hostname: string; // The unrecognized word being looked up
  };
}

// Tab completion result
export interface CompletionResult {
  type: "complete" | "list";
  value?: string;
  options?: string[];
}


