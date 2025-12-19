import { ExecutionResult, CommandDef } from "../../types";
import { Session } from "../../server/session";
import {
  handleModePush,
  handleModePop,
  handleModePopTo,
  handleSessionEnd
} from "./mode";
import { handleSet, handlePersist } from "./config";
import {
  handleIfEnter,
  handleIfSet,
  handleIfSetIp,
  handleIfSetTrunkAllowed
} from "./interface";
import { handleVlanEnter, handleVlanSetName } from "./vlan";
import {
  handleRouteAdd,
  handleOspfEnter,
  handleOspfNetworkAdd,
  handleOspfIfCostSet
} from "./routing";
import { handleSshUserSet, handleLineVtyEnter } from "./ssh";
import { handleRender } from "./show";

/**
 * Handler registry and dispatcher
 */

export class HandlerRegistry {
  private templates: Record<string, string>;
  
  constructor(templates: Record<string, string>) {
    this.templates = templates;
  }
  
  /**
   * Execute a command's action
   */
  public execute(
    session: Session,
    command: CommandDef,
    args: Record<string, string>
  ): ExecutionResult {
    const action = command.action;
    
    // Dispatch to appropriate handler first
    let result: ExecutionResult;
    
    switch (action.type) {
      case "mode_push":
        return handleModePush(session, args, action);
      
      case "mode_pop":
        return handleModePop(session, args, action);
      
      case "mode_pop_to":
        return handleModePopTo(session, args, action);
      
      case "session_end":
        return handleSessionEnd(session, args, action);
      
      case "set":
        return handleSet(session, args, action);
      
      case "persist":
        return handlePersist(session, args, action);
      
      case "render":
        return handleRender(session, args, action, this.templates);
      
      case "if_enter":
        return handleIfEnter(session, args, action);
      
      case "if_set":
        return handleIfSet(session, args, action);
      
      case "if_set_ip":
        return handleIfSetIp(session, args, action);
      
      case "if_set_trunk_allowed":
        return handleIfSetTrunkAllowed(session, args, action);
      
      case "vlan_enter":
        return handleVlanEnter(session, args, action);
      
      case "vlan_set_name":
        return handleVlanSetName(session, args, action);
      
      case "route_add":
        return handleRouteAdd(session, args, action);
      
      case "ospf_enter":
        return handleOspfEnter(session, args, action);
      
      case "ospf_network_add":
        return handleOspfNetworkAdd(session, args, action);
      
      case "ospf_if_cost_set":
        return handleOspfIfCostSet(session, args, action);
      
      case "ssh_user_set":
        return handleSshUserSet(session, args, action);
      
      case "line_vty_enter":
        return handleLineVtyEnter(session, args, action);
      
      default:
        result = {
          output: [`% Action type '${action.type}' not implemented`]
        };
    }
    
    // Check for static output and merge with action result
    if (command.output) {
      let output = command.output;
      
      // Replace placeholders in output
      for (const [key, value] of Object.entries(args)) {
        output = output.replace(new RegExp(`{${key}}`, "g"), value);
      }
      
      result.output = output.split("\n");
    }
    
    return result;
  }
}

