# IOS Gym

A **comprehensive, interactive web application** for learning Cisco IOS network configuration - from basic CLI navigation to advanced OSPF routing.

🌐 **Live at [iosgym.com](https://iosgym.com)**

🎓 **Perfect for:**
- CyberPatriot competitors
- CCNA certification students
- Network engineering beginners
- High school/college networking courses
- Self-learners building home labs

## 🚀 Quick Start

```bash
npm install
npm run web:build
npm run web:start
```

Open http://localhost:3000 - start learning immediately!

**It's a static site** - no server required, runs entirely in your browser!

---

## 📚 The Learning Experience

**11 comprehensive lessons in one scrollable page** - read, practice, master!

#### What You'll Learn
1. **Lesson 1:** CLI Navigation & Modes
2. **Lesson 2:** Setting Hostname
3. **Lesson 3:** Security (Enable Secret)
4. **Lesson 4:** IP Addressing & Management
5. **Lesson 5:** VLANs & Network Segmentation
6. **Lesson 6:** Trunk Ports & Inter-Switch Links
7. **Lesson 7:** SSH Secure Remote Access
8. **Lesson 8:** Layer 3 Switching (Routed Ports)
9. **Lesson 9:** Static Routing & Floating Routes
10. **Lesson 10:** OSPF Dynamic Routing
11. **Lesson 11:** OSPF Cost & Traffic Engineering

#### Features
- ✅ **11 interactive terminals** - practice each concept immediately
- ✅ **50+ visual diagrams** - understand topology and concepts
- ✅ **Real-world examples** - ISPs, schools, enterprise networks
- ✅ **CyberPatriot tips** - competition-specific guidance
- ✅ **Career guidance** - certifications, salaries, job paths
- ✅ **100% test coverage** - all 9 core exercises validated
- ✅ **No tab switching** - scroll to learn, practice inline
- ✅ **Mobile-friendly** - learn anywhere
- ✅ **Works offline** - no internet required after loading

**Perfect for:** First-time learners, classroom instruction, self-paced study, CyberPatriot competition prep

---

## ✨ Core Features

### Realistic CLI Engine
- **6 Modes:** USER_EXEC (`>`), PRIV_EXEC (`#`), GLOBAL_CONFIG, IF_CONFIG, ROUTER_OSPF_CONFIG, LINE_VTY_CONFIG
- **IOS-style Abbreviations:** `conf t` = `configure terminal`, `int g0/1` = `interface gigabitethernet0/1`
- **Tab Completion:** Context-aware suggestions for keywords and arguments
- **Smart Parsing:** Token-based command parsing with argument validation
- **Error Messages:** Realistic IOS error output

### Comprehensive Command Support
- **Navigation:** `enable`, `configure terminal`, `exit`, `end`
- **Basic Config:** `hostname`, `enable secret`, `write memory`
- **Interfaces:** `interface`, `ip address`, `no shutdown`, `no switchport`
- **VLANs:** `vlan`, `name`, `switchport mode`, `switchport access vlan`, `switchport trunk allowed vlan`
- **Routing:** `ip route` (with floating routes), `ip default-gateway`, `router ospf`, `network area`, `ip ospf cost`
- **SSH:** `ip domain-name`, `crypto key generate rsa`, `ip ssh version`, `username secret`, `line vty`, `login local`, `transport input`
- **Show Commands:** `show running-config`, `show vlan brief`, `show ip interface brief`, `show ip route`, `show ip protocols`

### State-Based Exercise Validation
- ✅ **Not string matching** - validates actual device state
- ✅ **Real-time feedback** - see what requirements remain
- ✅ **Contextual hints** - get unstuck quickly
- ✅ **9 built-in exercises** - covering all CyberPatriot scenarios

---

## 📖 Usage Examples

### Basic Navigation
```
Switch> enable
Switch# configure terminal
Switch(config)# hostname CorporateSwitch
CorporateSwitch(config)# end
CorporateSwitch# write memory
```

### Tab Completion
```
CorporateSwitch# conf<TAB>         → configure
CorporateSwitch# configure t<TAB>  → terminal
CorporateSwitch(config)# int<TAB>  → interface
```

### VLAN Configuration
```
Switch(config)# vlan 100
Switch(config)# name Students
Switch(config)# interface fa0/2
Switch(config-if)# switchport mode access
Switch(config-if)# switchport access vlan 100
Switch(config-if)# exit
```

### OSPF Routing
```
Router(config)# router ospf 1
Router(config-router)# network 192.168.1.0 0.0.0.255 area 0
Router(config-router)# exit
Router(config)# interface g0/0
Router(config-if)# ip ospf cost 10
```

---

## 🏗️ Project Structure

```
ios-gym/
├── commands-2960-switch.yaml  # Catalyst 2960 switch grammar (source)
├── commands-1941-router.yaml  # Cisco 1941 router grammar (source)
│
├── src/                   # CLI engine & tests (Node.js/TypeScript)
│   ├── cli/               # CLI engine (parser, completer, handlers, state)
│   ├── grammar/           # YAML loader
│   ├── cli-session.ts     # Session management
│   └── __tests__/         # Jest tests (159 tests, all passing)
│
├── web/                   # Next.js web application
│   ├── app/               # Next.js app (page.tsx, layout.tsx)
│   ├── components/        # React components (Terminal, LessonSection, etc.)
│   ├── lib/               # Client utilities (terminal manager, hooks)
│   ├── public/            # Static assets
│   │   ├── commands-2960-switch.json  # Generated from commands-2960-switch.yaml
│   │   └── commands-1941-router.json  # Generated from commands-1941-router.yaml
│   └── out/               # ⭐ STATIC BUILD - Deploy this!
│       └── index.html     # Complete course with embedded terminals
│
└── scripts/               # Build scripts
    └── dev-with-grammar.js # Dev server with grammar auto-rebuild
```

**Production bundle:** Optimized Next.js static export in `web/out/`

---

## 🚢 Deployment

This is a **pure static site** - deploy `web/out/` to any hosting service!

### GitHub Pages (FREE)
```bash
npm run web:build
git subtree push --prefix web/out origin gh-pages
# Live at: https://yourusername.github.io/ios-gym/
```

### Netlify (FREE)
```bash
npm install -g netlify-cli
npm run web:build
cd web/out && netlify deploy --prod
# Or drag-and-drop web/out/ folder to netlify.com/drop
```

### Any Static Server
```bash
# Build first
npm run web:build

# Serve the web/out/ directory
python3 -m http.server 8080 --directory web/out

# Or copy to web server
cp -r web/out/* /var/www/html/ios-trainer/
```

**No server-side code!** Everything runs in the browser for instant response and offline capability.

---

## 💻 Development

### Development Commands

#### Development Server (Recommended)
```bash
npm run web:dev
```
- 🔥 **Hot reload:** Automatically restarts when CLI code changes
- 🔄 **Auto-rebuild grammar:** Watches `commands-2960-switch.yaml`, `commands-1941-router.yaml` and `src/` for changes
- ⚡ **Fast feedback:** See changes in seconds
- 🎯 **Use this for:** Day-to-day development

#### Production Build
```bash
npm run web:build
```
- 📦 **Builds grammars:** Converts YAML files → `web/public/*.json`
- 🏗️ **Optimizes Next.js:** Creates production-ready static export
- 📊 **Output:** Generates optimized files in `web/out/`
- 🎯 **Use this for:** Deployment preparation

#### Production Server
```bash
npm run web:start
```
- 🚀 **Serves production build:** Runs the optimized static site
- 🔒 **No hot reload:** Requires rebuild to see changes
- 🎯 **Use this for:** Testing the production build locally

### Manual Grammar Build
```bash
npm run build:grammar
```
Converts all device grammar YAML files to JSON (usually not needed - `web:dev` and `web:build` do this automatically). Builds both:
- `commands-2960-switch.yaml` → `web/public/commands-2960-switch.json`
- `commands-1941-router.yaml` → `web/public/commands-1941-router.json`

### Testing
```bash
# Run all tests (8 suites, 159 tests)
npm test

# Watch mode for TDD
npm run test:watch

# Coverage report
npm run test:coverage
```

**Test Coverage:** All 9 core exercises validated, 159 tests passing.

---

## 🎯 What Makes This Special

### 1. Comprehensive & Standalone
- **All-in-one:** From basic CLI to advanced OSPF in one resource
- **No tab switching:** Read → Practice → Continue in one flow
- **Self-contained:** No external dependencies after loading

### 2. Pedagogically Sound
- **Progressive difficulty:** Basics first, advanced topics later
- **Immediate practice:** Every concept has a terminal right below it
- **Visual learning:** 50+ diagrams showing real network topologies
- **Real-world context:** ISP networks, schools, enterprise examples

### 3. Competition & Career Ready
- **CyberPatriot aligned:** All common scenarios covered
- **CCNA concepts:** Routing, switching, security fundamentals
- **Professional skills:** Commands and workflows used in production
- **Career guidance:** Certifications, salaries, next steps

### 4. Modern Development
- **TypeScript:** Type-safe, maintainable code
- **159 tests:** Comprehensive test coverage
- **Git hooks:** Pre-commit validation
- **Clean architecture:** Separation of concerns

---

## 📚 Additional Documentation

- **`.claude.md`** - AI assistant guidelines and git policies
- **`HOOKS.md`** - Git hooks documentation
- **`ARCHITECTURE.md`** - Technical architecture details
- **`TESTING.md`** - Test suite documentation
- **`CLEANUP_PLAN.md`** - Rationale for file organization

---

## 🤝 Contributing

Contributions welcome! This project follows:
- **TypeScript** for type safety
- **Jest** for testing (maintain 100% test coverage)
- **Git hooks** for quality (never bypass with --no-verify)
- **State-based validation** (not string matching)

See `.claude.md` for detailed development guidelines.

---

## 📜 License

MIT - See [LICENSE](LICENSE) file for details.

---

## ⚖️ Legal Notices

### Trademark Disclaimer

Cisco, IOS, CCNA, Catalyst, Packet Tracer, and related terms are trademarks or registered trademarks of Cisco Systems, Inc. and/or its affiliates in the United States and certain other countries.

CyberPatriot is a registered trademark of the Air Force Association.

This project is an independent educational tool and is not affiliated with, endorsed by, or sponsored by Cisco Systems, Inc., the Air Force Association, or any other mentioned organizations. All trademarks are the property of their respective owners.

### Educational Use

This software is provided for educational purposes only. It simulates Cisco IOS command-line interfaces for learning and training. It is not a substitute for official Cisco training materials or certification programs.

---

## 🎓 Educational Impact

This platform teaches the skills needed for:
- **CyberPatriot Cisco Networking Challenge**
- **Cisco CCNA Certification**
- **CompTIA Network+ Certification**
- **Junior Network Administrator roles** ($70k-$120k+)
- **Understanding how the internet actually works**

**Every network engineer started where you are now. Start your journey!** 🚀
