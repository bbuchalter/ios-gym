# IOS CLI Typing Trainer

A **pure static web application** for learning Cisco-style CLI commands with:
- Mode-aware prompts (`>`, `#`, `(config)#`, `(config-if)#`, etc.)
- Tab completion (keyword + argument suggestions)
- IOS-style error messages and abbreviation support
- Structured exercises that validate **device state**, not just typed strings
- Real-time exercise validation with hints
- **No server required** - runs entirely in your browser!

## 🎓 Learning Modes

This project offers **three ways to learn** - choose what works best for you:

### 📖 `learn.html` - Integrated Learning (RECOMMENDED FOR BEGINNERS)
**One long scrollable page** - read concept, practice immediately, scroll down!
- ✅ No tabs, no clicking around - just scroll
- ✅ 7 lessons from basics to SSH
- ✅ Each lesson has embedded terminal
- ✅ Perfect for first-time students
- ✅ Great for classroom instruction
- ✅ Mobile-friendly

### 🎮 `index.html` - Interactive Trainer (FOR PRACTICE & MASTERY)
**Full-featured trainer** with 10 exercises and progress tracking
- ✅ All 10 CyberPatriot-style exercises
- ✅ Progress tracking and achievements
- ✅ Real-time hints and validation
- ✅ Perfect for skill mastery

### 📚 `tutorial.html` - Reference Guide (FOR REVIEW)
**Complete tutorial** with navigation and detailed explanations
- ✅ Command reference
- ✅ Visual concept diagrams
- ✅ Network fundamentals
- ✅ Perfect for review and lookup

---

## Features

### CLI Engine
- **6 Mode Stack**: USER_EXEC, PRIV_EXEC, GLOBAL_CONFIG, IF_CONFIG, ROUTER_OSPF_CONFIG, LINE_VTY_CONFIG
- **IOS-style Abbreviation**: `conf t` = `configure terminal`, `int g0/1` = `interface g0/1`
- **Tab Completion**: Context-aware suggestions for keywords and arguments
- **Smart Parsing**: Token-based command parsing with argument validation

### Supported Commands
- **Basic**: `enable`, `configure terminal`, `exit`, `end`, `hostname`, `enable secret`
- **Interfaces**: `interface`, `ip address`, `no shutdown`, `no switchport`
- **VLANs**: `vlan`, `name`, `switchport mode`, `switchport access vlan`, `switchport trunk allowed vlan`
- **Routing**: `ip route` (with floating routes), `router ospf`, `network area`, `ip ospf cost`
- **SSH**: `ip domain-name`, `crypto key generate rsa`, `ip ssh version`, `username secret`, `line vty`, `login local`, `transport input`
- **Show Commands**: `show running-config`, `show vlan brief`, `show ip interface brief`, `show ip route`

### Exercise System
- 9 built-in exercises covering CyberPatriot-style tasks
- State-based validation (not command string matching)
- Real-time feedback with unmet requirements
- Contextual hints for each exercise

## Quick Start

### Installation & Running

```bash
npm install
npm run build
npm start
```

The static server will start on http://localhost:3000

### Access the Application

Open your browser to http://localhost:3000 to access the CLI trainer.

**Note:** This is a pure static application - all logic runs in your browser! No backend server needed.

## Project Structure

```
ios-practice/
├── commands.yaml          # Command grammar (source)
├── exercises.yaml         # Exercises (source)
│
├── client/                # Browser application source (TypeScript)
│   ├── terminal-static.ts # Main application
│   ├── cli/               # CLI engine
│   ├── exercise/          # Exercise validator
│   └── *.ts               # UI components
│
├── src/                   # Test infrastructure (Node.js)
│   ├── cli/               # CLI engine (for testing)
│   ├── server/            # Session management (for testing)
│   └── __tests__/         # Jest tests
│
└── public/                # ⭐ DEPLOY THIS! Static site
    ├── index.html
    ├── styles.css
    ├── commands.json      # 18KB
    ├── exercises.json     # 10KB
    └── *.js               # Compiled from client/ (~50KB)
```

**What gets deployed:** Only the `public/` directory (~85KB total)

## Usage Examples

### Basic Navigation
```
Switch> enable
Switch# configure terminal
Switch(config)# hostname Router1
Router1(config)# end
Router1#
```

### Tab Completion
```
Router1# conf<TAB>         → configure
Router1# configure t<TAB>  → terminal
Router1(config)# int<TAB>  → interface
```

### Interface Configuration
```
Router1(config)# interface g0/1
Router1(config-if)# ip address 192.168.1.1 255.255.255.0
Router1(config-if)# no shutdown
Router1(config-if)# exit
```

### VLAN Configuration
```
Switch(config)# vlan 100
Switch(config)# name Sales
Switch(config)# interface fa0/2
Switch(config-if)# switchport mode access
Switch(config-if)# switchport access vlan 100
```

### OSPF Configuration
```
Router(config)# router ospf 1
Router(config-router)# network 192.168.1.0 0.0.0.255 area 0
Router(config-router)# exit
Router(config)# interface g0/0
Router(config-if)# ip ospf cost 10
```

## Deployment

This is a **static site** - deploy the `public/` directory to any hosting service!

### Quick Deploy Options

**GitHub Pages (FREE):**
```bash
npm run build
git subtree push --prefix public origin gh-pages
# Live at: https://yourusername.github.io/ios-practice/
```

**Netlify (FREE):**
```bash
npm install -g netlify-cli
cd public && netlify deploy --prod
# Or drag-and-drop public/ folder to netlify.com/drop
```

**Vercel (FREE):**
```bash
npm install -g vercel
vercel --prod
```

**Any Static Server:**
```bash
# Just serve the public/ directory
python3 -m http.server 8080 --directory public
# Or copy to your web server
cp -r public/* /var/www/html/ios-trainer/
```

**Bundle Size:** ~85KB total (~25KB gzipped)

## Development

### Build
```bash
npm run build
```

### Development Mode
```bash
npm run dev
```

### Watch Mode
```bash
npm run watch
```

### Testing
```bash
# Run all tests (71 tests)
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

**Test Suite**: 130 tests with 98.5% pass rate. See [TESTING.md](TESTING.md) for details.

## Architecture

This is a **pure static web application** - all logic runs in the browser:

**Browser-Based (TypeScript → JavaScript)**
- xterm.js for terminal UI
- CLI engine with parser, completer, and command handlers
- Exercise validation engine
- Session management (in-memory)
- Exercise status panel with real-time feedback

**No server required!** Everything runs client-side for instant response and offline capability.

## Grammar Files

### `commands.yaml`
Defines CLI modes, command grammar, argument types, and output templates.

Key features:
- Token-based command definitions
- Typed arguments (IP, IFNAME, VLAN_ID, etc.)
- Action handlers for state mutations
- Template-based output rendering

### `exercises.yaml`
Defines device profiles and exercises with:
- Initial device state
- Requirements (state-based validation)
- Instructions and hints

## License

MIT
