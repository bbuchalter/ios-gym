import { ExecutionResult, CommandDef } from "../../types";
import { CLISession } from "../../cli-session";
import {
  handleModePush,
  handleModePop,
  handleModePopTo,
  handleSessionEnd,
  handleEnableWithPassword,
  handleVerifyEnablePassword
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
import {
  handleAclAddStd,
  handleAclAddExt,
  handleAclRemove,
  handleAclApply,
  handleAclRemoveApply
} from "./acl";
import {
  handleNatIfInside,
  handleNatIfOutside,
  handleNatIfRemoveInside,
  handleNatIfRemoveOutside,
  handleNatOverloadEnable,
  handleNatOverloadDisable,
  handleNatStaticAdd,
  handleNatStaticRemove
} from "./nat";
import {
  handleDhcpExcludedAddress,
  handleDhcpRemoveExcludedAddress,
  handleDhcpPoolEnter,
  handleDhcpPoolRemove,
  handleDhcpPoolNetwork,
  handleDhcpPoolDefaultRouter,
  handleDhcpPoolDnsServer
} from "./dhcp";

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
    session: CLISession,
    command: CommandDef,
    args: Record<string, string>
  ): ExecutionResult {
    const action = command.action;
    
    // Dispatch to appropriate handler first
    let result: ExecutionResult;
    
    switch (action.type) {
      case "mode_push":
        return handleModePush(session, args, action);
      
      case "enable_with_password":
        return handleEnableWithPassword(session, args, action);
      
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
      
      case "acl_add_std":
        return handleAclAddStd(session, args, action);
      
      case "acl_add_ext":
        return handleAclAddExt(session, args, action);
      
      case "acl_remove":
        return handleAclRemove(session, args, action);
      
      case "acl_apply":
        return handleAclApply(session, args, action);
      
      case "acl_remove_apply":
        return handleAclRemoveApply(session, args, action);
      
      case "nat_if_inside":
        return handleNatIfInside(session, args, action);
      
      case "nat_if_outside":
        return handleNatIfOutside(session, args, action);
      
      case "nat_if_remove_inside":
        return handleNatIfRemoveInside(session, args, action);
      
      case "nat_if_remove_outside":
        return handleNatIfRemoveOutside(session, args, action);
      
      case "nat_overload_enable":
        return handleNatOverloadEnable(session, args, action);
      
      case "nat_overload_disable":
        return handleNatOverloadDisable(session, args, action);
      
      case "nat_static_add":
        return handleNatStaticAdd(session, args, action);
      
      case "nat_static_remove":
        return handleNatStaticRemove(session, args, action);
      
      case "dhcp_excluded_address":
        return handleDhcpExcludedAddress(session, args, action);
      
      case "dhcp_remove_excluded_address":
        return handleDhcpRemoveExcludedAddress(session, args, action);
      
      case "dhcp_pool_enter":
        return handleDhcpPoolEnter(session, args, action);
      
      case "dhcp_pool_remove":
        return handleDhcpPoolRemove(session, args, action);
      
      case "dhcp_pool_network":
        return handleDhcpPoolNetwork(session, args, action);
      
      case "dhcp_pool_default_router":
        return handleDhcpPoolDefaultRouter(session, args, action);
      
      case "dhcp_pool_dns_server":
        return handleDhcpPoolDnsServer(session, args, action);
      
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
  
  /**
   * Execute a password verification handler
   */
  public executePasswordHandler(
    session: CLISession,
    password: string,
    handlerType: string,
    handlerArgs?: Record<string, any>
  ): ExecutionResult {
    switch (handlerType) {
      case "verify_enable_password":
        return handleVerifyEnablePassword(session, password, handlerArgs || {});
      
      default:
        return {
          output: [`% Password handler '${handlerType}' not implemented`]
        };
    }
  }
}

