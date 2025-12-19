import { handleModePush, handleModePop, handleModePopTo, handleCLISessionEnd } from "./mode.js";
import { handleSet, handlePersist } from "./config.js";
import { handleIfEnter, handleIfSet, handleIfSetIp, handleIfSetTrunkAllowed } from "./interface.js";
import { handleVlanEnter, handleVlanSetName } from "./vlan.js";
import { handleRouteAdd, handleOspfEnter, handleOspfNetworkAdd, handleOspfIfCostSet } from "./routing.js";
import { handleSshUserSet, handleLineVtyEnter } from "./ssh.js";
import { handleRender } from "./show.js";
/**
 * Handler registry and dispatcher
 */
export class HandlerRegistry {
    constructor(templates) {
        this.templates = templates;
    }
    /**
     * Execute a command's action
     */
    execute(session, command, args) {
        const action = command.action;
        // Dispatch to appropriate handler first
        let result;
        switch (action.type) {
            case "mode_push":
                return handleModePush(session, args, action);
            case "mode_pop":
                return handleModePop(session, args, action);
            case "mode_pop_to":
                return handleModePopTo(session, args, action);
            case "session_end":
                return handleCLISessionEnd(session, args, action);
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
