import { ExecutionResult } from "../../types";
import { CLISession } from "../../cli-session";

/**
 * Handle show commands with template rendering
 */

export function handleRender(
  session: CLISession,
  args: Record<string, string>,
  action: any,
  templates: Record<string, string>
): ExecutionResult {
  const templateName = action.template;
  const template = templates[templateName];
  
  if (!template) {
    return { output: ["% Template not found"] };
  }
  
  const rendered = renderTemplate(template, session);
  let lines = rendered.split("\n");
  
  // Remove trailing empty lines (YAML pipe syntax adds trailing newline)
  while (lines.length > 0 && lines[lines.length - 1] === "") {
    lines.pop();
  }
  
  // Mark output as paginated if it's longer than 20 lines
  // This matches typical IOS behavior where long show commands trigger pagination
  const paginated = lines.length > 20;
  
  return { output: lines, paginated };
}

/**
 * Expand abbreviated interface name to full form for display
 * fa0/1 -> FastEthernet0/1
 * g0/1 -> GigabitEthernet0/1
 * vlan1 -> Vlan1
 */
function expandInterfaceName(name: string): string {
  // Handle FastEthernet
  if (name.startsWith('fa')) {
    return 'FastEthernet' + name.substring(2);
  }
  // Handle GigabitEthernet
  if (name.startsWith('g') && name.match(/^g\d/)) {
    return 'GigabitEthernet' + name.substring(1);
  }
  // Handle Vlan
  if (name.startsWith('vlan')) {
    return 'Vlan' + name.substring(4);
  }
  return name;
}

/**
 * Abbreviate interface name for show vlan brief
 * fa0/1 -> Fa0/1
 * g0/1 -> Gig0/1
 * vlan1 -> Vlan1
 */
function abbreviateInterfaceForVlan(name: string): string {
  // Handle FastEthernet
  if (name.startsWith('fa')) {
    return 'Fa' + name.substring(2);
  }
  // Handle GigabitEthernet
  if (name.startsWith('g') && name.match(/^g\d/)) {
    return 'Gig' + name.substring(1);
  }
  // Handle Vlan
  if (name.startsWith('vlan')) {
    return 'Vlan' + name.substring(4);
  }
  return name;
}

/**
 * Simple template renderer
 * Supports:
 * - {variable} interpolation
 * - {#if condition}...{#endif} conditionals
 * - {#vlans}...{#end} loops over vlans
 * - {#interfaces}...{#end} loops over interfaces
 * - {#routes}...{#end} loops over routes
 */
function renderTemplate(template: string, session: CLISession): string {
  const state = session.deviceState;
  let result = template;
  
  // Replace simple variables
  result = result.replace(/{hostname}/g, state.hostname);
  result = result.replace(/{enableSecret}/g, state.enableSecret || "");
  result = result.replace(/{ipDefaultGateway}/g, state.ipDefaultGateway || "");
  result = result.replace(/{ospf\.processId}/g, String(state.ospf.processId || ""));
  
  // Handle conditionals
  result = result.replace(/{#if\s+enableSecret}([\s\S]*?){#endif}/g, (match, content) => {
    return state.enableSecret ? content : "";
  });
  
  result = result.replace(/{#if\s+ipDefaultGateway}([\s\S]*?){#endif}/g, (match, content) => {
    return state.ipDefaultGateway ? content : "";
  });
  
  result = result.replace(/{#if\s+ospf\.processId}([\s\S]*?){#endif}/g, (match, content) => {
    return state.ospf.processId ? content : "";
  });
  
  // Handle VLAN loop (skip VLAN 1 and system VLANs 1002-1005 in show running-config)
  result = result.replace(/{#vlans}([\s\S]*?){#endvlans}/g, (match, content) => {
    const vlanLines: string[] = [];
    
    for (const [id, vlan] of Object.entries(state.vlans)) {
      // Skip VLAN 1 in show running-config (it's implicit)
      // Skip system VLANs 1002-1005 (they exist but aren't in running-config)
      if (id === "1" || (parseInt(id) >= 1002 && parseInt(id) <= 1005)) {
        continue;
      }
      
      let line = content;
      line = line.replace(/{id}/g, id);
      line = line.replace(/{name}/g, vlan.name || "");
      line = line.replace(/{name_or_default}/g, vlan.name || `VLAN${id.padStart(4, "0")}`);
      vlanLines.push(line);
    }
    
    return vlanLines.join("");
  });
  
  // Handle VLAN loop with ports (for show vlan brief)
  result = result.replace(/{#vlans_with_ports}([\s\S]*?){#endvlans_with_ports}/g, (match, content) => {
    const vlanLines: string[] = [];
    
    // Sort VLANs numerically
    const sortedVlans = Object.entries(state.vlans).sort(([a], [b]) => parseInt(a) - parseInt(b));
    
    for (const [id, vlan] of sortedVlans) {
      // Find all interfaces in this VLAN
      const portsInVlan: string[] = [];
      
      for (const [ifName, iface] of Object.entries(state.interfaces)) {
        // Skip routed interfaces and vlan interfaces
        if (iface.l2mode === "routed" || ifName.startsWith("vlan")) {
          continue;
        }
        
        // Check if interface is in this VLAN
        const ifVlan = iface.accessVlan || "1"; // Default to VLAN 1 if not assigned
        if (ifVlan === id) {
          portsInVlan.push(abbreviateInterfaceForVlan(ifName));
        }
      }
      
      // Format the ports list with wrapping (4 ports per line to match IOS)
      let portsFormatted = "";
      if (portsInVlan.length > 0) {
        const chunks: string[][] = [];
        for (let i = 0; i < portsInVlan.length; i += 4) {
          chunks.push(portsInVlan.slice(i, i + 4));
        }
        
        portsFormatted = chunks.map((chunk, idx) => {
          if (idx === 0) {
            return chunk.join(", ");
          } else {
            // Continuation lines are indented to align under the Ports column (48 chars)
            return "\n" + " ".repeat(48) + chunk.join(", ");
          }
        }).join("");
      }
      
      let line = content;
      line = line.replace(/{id}/g, id.padEnd(4));
      line = line.replace(/{name}/g, (vlan.name || "").padEnd(32));
      line = line.replace(/{name_or_default}/g, (vlan.name || `VLAN${id.padStart(4, "0")}`).padEnd(32));
      line = line.replace(/{status}/g, "active".padEnd(9));
      line = line.replace(/{ports}/g, portsFormatted);
      vlanLines.push(line);
    }
    
    return vlanLines.join("");
  });
  
  // Handle interface loop
  result = result.replace(/{#interfaces}([\s\S]*?){#endifaces_end}/g, (match, content) => {
    const ifLines: string[] = [];
    
    for (const [name, iface] of Object.entries(state.interfaces)) {
      let line = content;
      const fullName = expandInterfaceName(name);
      line = line.replace(/{name_full}/g, fullName);
      line = line.replace(/{name_full_padded}/g, fullName.padEnd(22));
      line = line.replace(/{name}/g, name);
      line = line.replace(/{name_padded}/g, name.padEnd(22));
      line = line.replace(/{ip}/g, iface.ip || "");
      line = line.replace(/{mask}/g, iface.mask || "");
      line = line.replace(/{ip_or_unassigned}/g, iface.ip ? iface.ip.padEnd(15) : "unassigned".padEnd(15));
      line = line.replace(/{l2mode}/g, iface.l2mode || "");
      line = line.replace(/{accessVlan}/g, iface.accessVlan || "");
      line = line.replace(/{trunkAllowed}/g, iface.trunkAllowed || "");
      
      // Status field: "administratively down" only for explicitly shutdown interfaces (like Vlan1)
      // Regular interfaces that are just down show "down"
      // Status column is 20 chars wide, followed by 2 spaces before Protocol
      // But "administratively down" is 21 chars (overflows by 1), so only 1 space before Protocol
      let status: string;
      if (iface.adminUp) {
        status = "up".padEnd(20) + "  "; // 20 chars + 2 spaces
      } else if (name === "vlan1") {
        // "administratively down" is 21 chars + 1 space (overflows column by 1)
        status = "administratively down ";
      } else {
        status = "down".padEnd(20) + "  "; // 20 chars + 2 spaces
      }
      line = line.replace(/{status}/g, status);
      line = line.replace(/{protocol}/g, iface.adminUp ? "up" : "down");
      
      // Handle nested conditionals (use [\s\S] to match newlines)
      // Note: Vlan interfaces are L3 by default, don't show "no switchport" for them
      line = line.replace(/{#if\s+l2mode\s+==\s+"routed"}([\s\S]*?)(?={#endif)/g, (_m: string, c: string) => {
        return (iface.l2mode === "routed" && !name.startsWith("vlan")) ? c : "";
      });
      line = line.replace(/{#if\s+l2mode\s+==\s+"access"}([\s\S]*?)(?={#endif)/g, (_m: string, c: string) => {
        return iface.l2mode === "access" ? c : "";
      });
      line = line.replace(/{#if\s+l2mode\s+==\s+"trunk"}([\s\S]*?)(?={#endif)/g, (_m: string, c: string) => {
        return iface.l2mode === "trunk" ? c : "";
      });
      line = line.replace(/{#if\s+accessVlan}([\s\S]*?)(?={#endif)/g, (_m: string, c: string) => {
        return iface.accessVlan ? c : "";
      });
      line = line.replace(/{#if\s+trunkAllowed}([\s\S]*?)(?={#endif)/g, (_m: string, c: string) => {
        return iface.trunkAllowed ? c : "";
      });
      line = line.replace(/{#if\s+ip}([\s\S]*?)(?={#endif)/g, (_m: string, c: string) => {
        return iface.ip ? c : "";
      });
      line = line.replace(/{#if\s+adminUp}([\s\S]*?)(?={#endif)/g, (_m: string, c: string) => {
        return iface.adminUp ? c : "";
      });
      line = line.replace(/{#if\s+name\s+==\s+"vlan1"}([\s\S]*?)(?={#endif)/g, (_m: string, c: string) => {
        return name === "vlan1" ? c : "";
      });
      line = line.replace(/{#if\s+name\s+!=\s+"vlan1"}([\s\S]*?)(?={#endif)/g, (_m: string, c: string) => {
        return name !== "vlan1" ? c : "";
      });
      line = line.replace(/{#endif}/g, "");
      
      ifLines.push(line);
    }
    
    return ifLines.join("");
  });
  
  // Handle route loop
  result = result.replace(/{#routes}([\s\S]*?){#endroutes}/g, (match, content) => {
    const routeLines: string[] = [];
    
    for (const route of state.routes) {
      let line = content;
      line = line.replace(/{dest}/g, route.dest);
      line = line.replace(/{mask}/g, route.mask);
      line = line.replace(/{nextHop}/g, route.nextHop);
      line = line.replace(/{ad}/g, String(route.ad));
      routeLines.push(line);
    }
    
    return routeLines.join("");
  });
  
  // Handle OSPF networks loop
  result = result.replace(/{#ospf\.networks}([\s\S]*?){#end}/g, (match, content) => {
    const networkLines: string[] = [];
    
    for (const network of state.ospf.networks) {
      let line = content;
      line = line.replace(/{ip}/g, network.ip);
      line = line.replace(/{wildcard}/g, network.wildcard);
      line = line.replace(/{area}/g, String(network.area));
      networkLines.push(line);
    }
    
    return networkLines.join("");
  });
  
  // Handle access lists loop
  result = result.replace(/{#access_lists}([\s\S]*?){#end_access_lists}/g, (match, content) => {
    const aclLines: string[] = [];
    
    // Sort ACLs by number
    const sortedAcls = Object.values(state.accessLists).sort((a, b) => a.number - b.number);
    
    for (const acl of sortedAcls) {
      let aclBlock = content;
      
      // Handle ACL type conditionals
      if (acl.type === 'standard') {
        // Remove extended conditional content
        aclBlock = aclBlock.replace(/{#if\s+type\s+==\s+"extended"}[\s\S]*?{#endif}/g, '');
        // Process standard conditional content
        aclBlock = aclBlock.replace(/{#if\s+type\s+==\s+"standard"}([\s\S]*?){#endif}/g, '$1');
      } else {
        // Remove standard conditional content
        aclBlock = aclBlock.replace(/{#if\s+type\s+==\s+"standard"}[\s\S]*?{#endif}/g, '');
        // Process extended conditional content
        aclBlock = aclBlock.replace(/{#if\s+type\s+==\s+"extended"}([\s\S]*?){#endif}/g, '$1');
      }
      
      aclBlock = aclBlock.replace(/{number}/g, String(acl.number));
      aclBlock = aclBlock.replace(/{type}/g, acl.type);
      
      // Handle entries loop
      aclBlock = aclBlock.replace(/{#entries}([\s\S]*?){#end_entries}/g, (_m: string, entryContent: string) => {
        const entryLines: string[] = [];
        
        for (const entry of acl.entries) {
          let entryLine = entryContent;
          entryLine = entryLine.replace(/{action}/g, entry.action);
          
          // Format source display
          let sourceDisplay = '';
          if (entry.source === 'any') {
            sourceDisplay = 'any';
          } else if (entry.source.startsWith('host ')) {
            sourceDisplay = entry.source;
          } else if (entry.sourceWildcard) {
            sourceDisplay = `${entry.source} ${entry.sourceWildcard}`;
          } else {
            sourceDisplay = entry.source;
          }
          entryLine = entryLine.replace(/{source_display}/g, sourceDisplay);
          
          // Format destination display (only for extended ACLs)
          if ('destination' in entry) {
            const extEntry = entry as { destination: string; destWildcard?: string; protocol: string };
            let destDisplay = '';
            if (extEntry.destination === 'any') {
              destDisplay = 'any';
            } else if (extEntry.destination.startsWith('host ')) {
              destDisplay = extEntry.destination;
            } else if (extEntry.destWildcard) {
              destDisplay = `${extEntry.destination} ${extEntry.destWildcard}`;
            } else {
              destDisplay = extEntry.destination;
            }
            entryLine = entryLine.replace(/{dest_display}/g, destDisplay);
            entryLine = entryLine.replace(/{protocol}/g, extEntry.protocol);
          } else {
            entryLine = entryLine.replace(/{dest_display}/g, '');
            entryLine = entryLine.replace(/{protocol}/g, '');
          }
          
          entryLines.push(entryLine);
        }
        
        return entryLines.join('');
      });
      
      aclLines.push(aclBlock);
    }
    
    return aclLines.join('');
  });
  
  return result;
}

