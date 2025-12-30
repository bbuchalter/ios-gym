# AI Agent Context

This document provides essential context for AI coding agents working on this project.

## Target Audience

**Middle school students** participating in the **CyberPatriot** competition, specifically the Cisco NetAcademy Packet Tracer challenges.

### Tone Guidelines

When creating or modifying content:
- Use clear, encouraging language appropriate for 11-14 year olds
- Avoid unnecessary jargon; explain technical terms when first introduced
- Keep instructions step-by-step and explicit
- Use teaching points to explain "why" not just "what"
- Celebrate success; provide constructive guidance on errors
- Examples should use age-appropriate context (school networks, student/teacher VLANs)

## Project Purpose

A Cisco IOS CLI training simulator that mirrors Packet Tracer command-line behavior. Students practice switch and router configuration in a browser-based terminal before using actual Packet Tracer.

## Design Philosophy

### Display Modes: "Tell Me" vs "Challenge Me"

Two modes serve different learning stages:

| Mode | Purpose | Shows Commands | Shows Teaching Points |
|------|---------|----------------|----------------------|
| Tell Me | First-time learning | Yes | Yes |
| Challenge Me | Testing retention | No | Yes |

**Key decision**: Teaching points remain visible in Challenge mode because they explain *concepts* (why), not *commands* (what). Students should understand the purpose even when figuring out commands themselves.

### Progressive Disclosure in Validation UI

Three states with distinct visual treatment:

| State | Color | Content |
|-------|-------|---------|
| Before validation | Blue | Manual verification hints (teaches how to check work) |
| After failure | Red | Specific errors with diagnostic commands |
| After success | Green | Celebration + reinforces manual verification skill |

**Key decision**: Show manual verification before automated validation to teach real-world troubleshooting skills used in competition.

### Saved State Validation

Validation checks the **saved configuration** (startup-config), not running-config.

**Why this matters**:
- In real Cisco devices, unsaved config is lost on reboot
- CyberPatriot requires saved configurations
- Teaches the critical `write memory` habit

Students who forget to save get a friendly error prompting them to run `write memory`.

## Cisco IOS Domain Knowledge

### Configuration States

```
Running Config (RAM)  ──write memory──>  Startup Config (NVRAM)
     ↑                                          ↓
 Changes here                              Loads on boot
```

- Commands modify running-config immediately
- `write memory` (or `copy run start`) saves to startup-config
- Validation checks startup-config to ensure students save their work

### Interface Naming

The system normalizes interface names to abbreviated lowercase:

| Input | Normalized |
|-------|------------|
| `GigabitEthernet0/1` | `g0/1` |
| `gi0/1` | `g0/1` |
| `FastEthernet0/1` | `fa0/1` |
| `Vlan1` | `vlan1` |

Always use normalized names in state paths (e.g., `interfaces.g0/1.ip`).

### Device Models

| Model | Type | Interfaces |
|-------|------|------------|
| `2960-switch` | Layer 2 switch | `fa0/1-24`, `g0/1-2`, `vlan1` |
| `1941-router` | Router | `g0/0-1`, `vlan1` |

**Common bug**: Using `g1/0/1` (3-tier switch naming) on `2960-switch`. The 2960 uses `g0/1` format.

## Exercise Authoring Reference

### Assertion Types

| Type | Purpose | Key Fields |
|------|---------|------------|
| `config-saved` | Verify student saved config | (none) |
| `state-path` | Check specific value | `path`, `expectedValue` |
| `interface-exists` | Verify interface configured | `interfaceName`, `shouldExist` |
| `vlan-exists` | Verify VLAN exists | `vlanId` (string), `name` (optional) |
| `ospf-network` | Verify OSPF network statement | `network`, `wildcard`, `area` |

### Common State Paths

| Path | Description | Example Value |
|------|-------------|---------------|
| `hostname` | Device hostname | `"MySwitch"` |
| `enableSecret` | Enable password | `"cisco"` |
| `ipDefaultGateway` | Default gateway | `"192.168.1.1"` |
| `interfaces.vlan1.ip` | Interface IP | `"192.168.1.10"` |
| `interfaces.vlan1.mask` | Subnet mask | `"255.255.255.0"` |
| `interfaces.vlan1.adminUp` | Interface enabled | `true` |
| `interfaces.fa0/1.l2mode` | Layer 2 mode | `"access"`, `"trunk"`, `"routed"` |
| `interfaces.fa0/1.accessVlan` | Access VLAN | `"100"` (string) |
| `vlans.100.name` | VLAN name | `"STUDENTS"` |

### Exercise JSON Structure

```json
{
  "id": "lesson-XX-descriptive-name",
  "title": "Human Readable Title",
  "deviceModel": "2960-switch",
  "goals": [
    {
      "section": "Section Name",
      "steps": [
        {
          "objective": "What student should do",
          "command": "the command to type",
          "teachingPoint": "Optional explanation of why"
        }
      ]
    }
  ],
  "assertions": [
    {
      "type": "config-saved",
      "description": "Configuration must be saved",
      "diagnosticCommand": "show running-config"
    }
  ]
}
```

### Validation Commands

Build-time validation runs all exercise commands and tests assertions. Always include `write memory` as the final step and `config-saved` as the first assertion.

```bash
npm run validate:exercises  # Validates all exercise JSON files
```

## Build & Development

Key commands (details in package.json):

| Command | Purpose |
|---------|---------|
| `npm test` | Run all tests |
| `npm run validate:exercises` | Validate exercise JSON files |
| `npm run web:build` | Build web app (includes exercise validation) |
| `npm run hooks:install` | Install git pre-commit hooks |

Pre-commit hooks run tests, linting, and exercise validation automatically.

