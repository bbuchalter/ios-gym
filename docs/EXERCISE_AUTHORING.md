# Exercise Authoring Guide

This guide explains how to create and validate exercises for the Cisco IOS CLI training application.

## Overview

Exercises are defined in JSON format with:
- **Hierarchical goals structure** - Organized into sections with steps
- **Validation assertions** - Automated checks against saved device state
- **Teaching points** - Inline explanations for key concepts

## File Structure

```
src/exercises/
  ├── schema.json                                                # JSON Schema for validation
  ├── lesson-01-setting-hostname-and-saving-configuration.json  # Exercise 1
  ├── lesson-02-setting-enable-secret-password.json             # Exercise 2
  ├── lesson-03-creating-vlans.json                             # Exercise 3
  └── ...
```

## Exercise Format

### Basic Structure

```json
{
  "id": "lesson-01-setting-hostname-and-saving-configuration",
  "title": "Setting Hostname and Saving Configuration",
  "deviceModel": "2960-switch",
  "goals": [...],
  "assertions": [...]
}
```

**Note:** The `id` field should match the filename (without `.json` extension) and follow the pattern: `lesson-XX-title-in-kebab-case`

### Device Models

- `"2960-switch"` - Cisco Catalyst 2960 Switch
  - Interfaces: `fa0/1-24`, `g0/1-2`, `vlan1`
  - Layer 2 by default

- `"1941-router"` - Cisco 1941 ISR Router
  - Interfaces: `g0/0-1`, `vlan1`
  - Layer 3 (routed) by default

### Goals Structure

Goals are organized into sections, each containing steps:

```json
{
  "goals": [
    {
      "section": "Basic Configuration",
      "steps": [
        {
          "objective": "Enter privileged mode",
          "command": "enable"
        },
        {
          "objective": "Enter global configuration mode",
          "command": "configure terminal",
          "teachingPoint": "This is where you make changes to the device."
        }
      ]
    }
  ]
}
```

#### Step Properties

- **objective** (required): What the student is trying to accomplish
- **command** (optional): The command to execute
  - Omit for objectives-only mode
- **teachingPoint** (optional): Inline explanation for key concepts
  - Displayed in a highlighted box below the command

### Assertions

Assertions validate the final saved device state. Students must run `write memory` before validation.

#### Config Saved Assertion

Always include this first to ensure students save their work:

```json
{
  "type": "config-saved",
  "description": "Configuration must be saved with 'write memory'",
  "diagnosticCommand": "show running-config"
}
```

#### State Path Assertion

Check a specific value in device state using dot notation:

```json
{
  "type": "state-path",
  "path": "hostname",
  "expectedValue": "MySwitch",
  "description": "Hostname should be set to 'MySwitch'",
  "diagnosticCommand": "show running-config | include hostname"
}
```

**Common paths:**
- `hostname` - Device hostname
- `enableSecret` - Enable password
- `interfaces.vlan1.ip` - VLAN 1 IP address
- `interfaces.vlan1.mask` - VLAN 1 subnet mask
- `interfaces.vlan1.adminUp` - Interface enabled (true/false)
- `interfaces.fa0/1.l2mode` - Layer 2 mode ("access", "trunk", or "routed")
- `interfaces.fa0/1.accessVlan` - Access VLAN (string, e.g., "100")
- `ipDefaultGateway` - Default gateway IP

#### Interface Exists Assertion

Verify an interface is configured:

```json
{
  "type": "interface-exists",
  "expectedValue": {
    "interfaceName": "g0/0",
    "shouldExist": true
  },
  "description": "Interface g0/0 should be configured",
  "diagnosticCommand": "show ip interface brief"
}
```

#### VLAN Exists Assertion

Verify a VLAN is configured with optional name check:

```json
{
  "type": "vlan-exists",
  "expectedValue": {
    "vlanId": "100",
    "name": "STUDENTS"
  },
  "description": "VLAN 100 should exist with name 'STUDENTS'",
  "diagnosticCommand": "show vlan brief"
}
```

**Note:** `vlanId` is always a string, even for numeric VLANs.

#### OSPF Network Assertion

Verify an OSPF network is advertised:

```json
{
  "type": "ospf-network",
  "expectedValue": {
    "network": "192.168.1.0",
    "wildcard": "0.0.0.255",
    "area": 0
  },
  "description": "OSPF should advertise network 192.168.1.0 0.0.0.255 area 0",
  "diagnosticCommand": "show running-config | section router ospf"
}
```

## Validation Workflow

### Build-Time Validation

Runs automatically before deployment:

```bash
npm run validate:exercises
```

**What it does:**
1. Validates JSON against schema
2. Loads appropriate device grammar
3. Executes all commands in simulated CLI session
4. Checks final saved state against assertions
5. Reports any errors

**Catches:**
- Invalid JSON syntax
- Schema violations
- Invalid commands
- Interface naming bugs (e.g., `g1/0/1` on 2960-switch)
- Invalid diagnostic commands (commands that don't work on the device)
- Assertion failures

### Runtime Validation

Runs in browser when student clicks "Check My Work":

1. Checks if `configSaved` is true
2. If not, shows error: "Configuration not saved!"
3. Validates saved state against assertions
4. Shows specific errors or success message

## Best Practices

### 1. Always Check Config Saved First

```json
{
  "assertions": [
    {
      "type": "config-saved",
      "description": "Configuration must be saved with 'write memory'",
      "diagnosticCommand": "show running-config"
    },
    // ... other assertions
  ]
}
```

### 2. Use Clear, Actionable Descriptions

❌ Bad: "Hostname wrong"
✅ Good: "Hostname should be set to 'CorporateSwitch'"

### 3. Include Diagnostic Commands

Help students debug by showing relevant `show` commands. These are validated at build-time to ensure they work on the device:

```json
{
  "diagnosticCommand": "show ip interface brief"
}
```

**Important:** Diagnostic commands must be valid for the device model. The build validator will test each diagnostic command and fail if any are invalid. Use simple commands like:
- `show running-config`
- `show ip interface brief`
- `show vlan brief`

Avoid pipe commands (`|`) or complex syntax that may not be implemented in the simulator.

### 4. Add Teaching Points for Key Concepts

```json
{
  "objective": "Enable the interface",
  "command": "no shutdown",
  "teachingPoint": "Interfaces are administratively down by default. 'no shutdown' brings them up."
}
```

### 5. Test Interface Names for Device Model

- **2960-switch**: `fa0/1-24`, `g0/1-2`
- **1941-router**: `g0/0-1`

❌ Wrong: `g1/0/1` on 2960-switch
✅ Right: `g0/1` on 2960-switch

### 6. Use Normalized Interface Names in Paths

Always use abbreviated, lowercase names:
- `fa0/1` not `FastEthernet0/1`
- `g0/0` not `GigabitEthernet0/0`
- `vlan1` not `Vlan1`

## Testing Your Exercise

### 1. Validate JSON Structure

```bash
npm run validate:exercises
```

### 2. Check Specific Exercise

The validator will show which exercise failed:

```
  Validating lesson-05.json... ❌ FAIL
    Execution Errors:
      - Command "interface g1/0/1" failed: Invalid input
```

### 3. Test in Browser

1. Add exercise to page.tsx
2. Run development server
3. Complete exercise manually
4. Click "Check My Work"
5. Verify error messages are helpful

## Common Issues

### Interface Not Found

**Error:** `Interface g1/0/1 should be configured`

**Cause:** Wrong interface name for device model

**Fix:** Check device model and use correct interface names

### Config Not Saved

**Error:** `Configuration not saved! Run "write memory"`

**Cause:** Missing `write memory` command in steps

**Fix:** Add `write memory` as final step

### State Path Not Found

**Error:** `Expected interfaces.fa0/1.accessVlan to be "100", but got undefined`

**Cause:** Interface not configured or wrong path

**Fix:** 
1. Verify commands create the expected state
2. Check path uses correct property names
3. Run build validator to see actual state

### VLAN ID Type Mismatch

**Error:** `VLAN 100 not found`

**Cause:** `vlanId` must be string, not number

**Fix:**
```json
{
  "expectedValue": {
    "vlanId": "100",  // ✅ String
    "name": "STUDENTS"
  }
}
```

## Example: Complete Exercise

```json
{
  "id": "lesson-05-configuring-access-port",
  "title": "Configuring Access Port",
  "deviceModel": "2960-switch",
  "goals": [
    {
      "section": "Configure Access Port",
      "steps": [
        {
          "objective": "Enter privileged mode",
          "command": "enable"
        },
        {
          "objective": "Enter global configuration mode",
          "command": "configure terminal"
        },
        {
          "objective": "Create VLAN 100",
          "command": "vlan 100"
        },
        {
          "objective": "Name it 'STUDENTS'",
          "command": "name STUDENTS"
        },
        {
          "objective": "Exit VLAN configuration",
          "command": "exit"
        },
        {
          "objective": "Enter interface FastEthernet0/1",
          "command": "interface fa0/1",
          "teachingPoint": "FastEthernet ports are common on switches. You can abbreviate 'FastEthernet' as 'fa'."
        },
        {
          "objective": "Set switchport mode to access",
          "command": "switchport mode access",
          "teachingPoint": "Access mode means this port connects to an end device, not another switch."
        },
        {
          "objective": "Assign port to VLAN 100",
          "command": "switchport access vlan 100"
        },
        {
          "objective": "Enable the interface",
          "command": "no shutdown"
        },
        {
          "objective": "Exit to privileged mode",
          "command": "end"
        },
        {
          "objective": "Save configuration",
          "command": "write memory"
        }
      ]
    }
  ],
  "assertions": [
    {
      "type": "config-saved",
      "description": "Configuration must be saved with 'write memory'",
      "diagnosticCommand": "show running-config"
    },
    {
      "type": "vlan-exists",
      "expectedValue": {
        "vlanId": "100",
        "name": "STUDENTS"
      },
      "description": "VLAN 100 should exist with name 'STUDENTS'",
      "diagnosticCommand": "show vlan brief"
    },
    {
      "type": "state-path",
      "path": "interfaces.fa0/1.l2mode",
      "expectedValue": "access",
      "description": "FastEthernet0/1 should be in access mode",
      "diagnosticCommand": "show interfaces fa0/1 switchport"
    },
    {
      "type": "state-path",
      "path": "interfaces.fa0/1.accessVlan",
      "expectedValue": "100",
      "description": "FastEthernet0/1 should be assigned to VLAN 100",
      "diagnosticCommand": "show interfaces fa0/1 switchport"
    },
    {
      "type": "state-path",
      "path": "interfaces.fa0/1.adminUp",
      "expectedValue": true,
      "description": "FastEthernet0/1 should be enabled",
      "diagnosticCommand": "show ip interface brief"
    }
  ]
}
```

## Getting Help

- Check build validator output for detailed errors
- Review existing exercises for examples
- Test commands manually in terminal first
- Use `show running-config` to see actual state structure

