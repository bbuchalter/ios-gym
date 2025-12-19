# Quick Start Guide

## Starting the Server

The server is currently running on http://localhost:3000

If you need to restart it:
```bash
npm start
```

## Testing the CLI

### Via Web Browser
1. Open http://localhost:3000 in your browser
2. You'll see a terminal interface with the initial prompt: `Switch> `
3. Start typing commands!

### Basic Command Examples

#### Example 1: Change Hostname
```
Switch> enable
Switch# configure terminal
Switch(config)# hostname Router1
Router1(config)# end
Router1#
```

#### Example 2: Tab Completion
Try typing and pressing TAB:
- `conf` + TAB → completes to `configure`
- `configure t` + TAB → completes to `terminal`
- `int` + TAB → shows available interface completions

#### Example 3: Configure an Interface
```
Router1# configure terminal
Router1(config)# interface g0/1
Router1(config-if)# ip address 192.168.1.1 255.255.255.0
Router1(config-if)# no shutdown
Router1(config-if)# exit
Router1(config)# end
Router1#
```

#### Example 4: View Configuration
```
Router1# show running-config
Router1# show ip interface brief
Router1# show vlan brief
Router1# show ip route
```

## Running an Exercise

The exercise panel on the right side of the web interface shows:
- **Exercise Info**: Current exercise title
- **Instructions**: What you need to configure
- **Status**: Whether requirements are met
- **Hints**: Contextual help

### Exercise 1: Hostname + Enable Secret
Try completing the first exercise:
1. Set hostname to "CorporateSwitch2"
2. Set enable secret to "C1sc0R0ck$"

Commands:
```
Switch> enable
Switch# configure terminal
Switch(config)# hostname CorporateSwitch2
CorporateSwitch2(config)# enable secret C1sc0R0ck$
CorporateSwitch2(config)# end
```

The exercise status will update in real-time as you meet requirements!

## Testing IOS-Style Abbreviations

The system supports IOS-style command abbreviation:
- `en` = `enable`
- `conf t` = `configure terminal`
- `int g0/1` = `interface g0/1`
- `sh run` = `show running-config`
- `sh ip int br` = `show ip interface brief`

## API Testing

### Health Check
```bash
curl http://localhost:3000/health
```

Expected output:
```json
{"status":"ok","sessions":0}
```

### List Exercises
```bash
curl http://localhost:3000/api/exercises
```

Returns all 9 available exercises in JSON format.

## Supported Device Configurations

### VLANs
```
Switch(config)# vlan 100
Switch(config)# name Sales
Switch(config)# vlan 200
Switch(config)# name Engineering
```

### Switchports
```
Switch(config)# interface fa0/2
Switch(config-if)# switchport mode access
Switch(config-if)# switchport access vlan 100
Switch(config-if)# no shutdown
```

### Trunk Ports
```
Switch(config)# interface g0/1
Switch(config-if)# switchport mode trunk
Switch(config-if)# switchport trunk allowed vlan 1,100,200
```

### Static Routes
```
Router(config)# ip route 0.0.0.0 0.0.0.0 192.168.1.1
Router(config)# ip route 0.0.0.0 0.0.0.0 192.168.1.2 254
```

### OSPF
```
Router(config)# router ospf 1
Router(config-router)# network 192.168.1.0 0.0.0.255 area 0
Router(config-router)# network 10.0.0.0 0.255.255.255 area 0
Router(config-router)# exit
Router(config)# interface g0/0
Router(config-if)# ip ospf cost 10
```

### SSH Configuration
```
Router(config)# ip domain-name cisco.com
Router(config)# crypto key generate rsa modulus 1024
Router(config)# ip ssh version 2
Router(config)# username admin secret Cyb3rPatriot
Router(config)# line vty 0 4
Router(config-line)# login local
Router(config-line)# transport input ssh
Router(config-line)# exit
```

## Troubleshooting

### Server won't start
```bash
# Check if port 3000 is already in use
lsof -i :3000

# Kill any existing process
kill -9 <PID>

# Restart the server
npm start
```

### Build errors
```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Browser can't connect
1. Check server is running: `curl http://localhost:3000/health`
2. Check browser console for errors (F12)
3. Verify WebSocket connection is not blocked by firewall

## Next Steps

1. Try all 9 exercises in order (they build on each other)
2. Experiment with tab completion in different contexts
3. Test command abbreviations
4. View your configuration with `show running-config`
5. Try invalid commands to see error messages

Enjoy learning IOS CLI commands!

