# Architecture Overview

## TL;DR

**This is a static web application.** Only `public/` gets deployed. Everything else is for development and testing.

## Directory Structure

### 📁 public/ - **THE DEPLOYABLE STATIC SITE** ⭐

```
public/
├── index.html              # Main HTML
├── styles.css              # Styles
├── commands.json           # Command grammar (18KB)
├── exercises.json          # Exercises (10KB)
├── terminal-static.js      # Main app
├── *.js                    # App modules (~50KB)
└── cli/                    # CLI engine modules
```

**This is what users get!**
- Total size: ~85KB (~25KB gzipped)
- Deploy to GitHub Pages, Netlify, Vercel, etc.
- Works standalone - no server needed

### 📁 client/ - Source Code for Browser App

```
client/
├── terminal-static.ts      # Main application
├── terminal-ui.ts          # xterm.js wrapper
├── command-handler.ts      # Input handling
├── exercise-manager.ts     # Exercise UI
├── cli/                    # CLI engine
│   ├── engine.ts
│   ├── parser.ts
│   ├── completer.ts
│   └── handlers/
└── exercise/
    └── validator.ts
```

**Build:** `client/` → (TypeScript compiler) → `public/`

### 📁 src/ - Test Infrastructure (NOT DEPLOYED)

```
src/
├── cli/                    # CLI engine (for testing)
├── server/                 # Session management (for testing)
├── exercise/               # Validators (for testing)
└── __tests__/              # Jest tests (136 tests)
```

**Purpose:** Fast Node.js-based testing
- Jest runs against `dist/` (compiled from `src/`)
- Tests run in Node.js (fast, no browser needed)
- Kept separate from `client/` to avoid test/browser conflicts

### 📁 dist/ - Test Build Output (NOT DEPLOYED)

Compiled JavaScript from `src/` for running tests.

## Code Duplication: src/cli vs client/cli

**Yes, the CLI engine exists in both places (~64KB duplicated).**

### Why?

**Separate Concerns:**
- `src/cli/` - Optimized for Node.js testing (CommonJS, Session class)
- `client/cli/` - Optimized for browser (ES6 modules, CLISession class)

**Benefits of Duplication:**
✅ Clean separation - browser and test code don't interfere
✅ Fast tests - Node.js environment, no browser mocking
✅ Independent evolution - Can optimize each separately
✅ Type safety - Different Session types (Session vs CLISession)
✅ Simpler builds - No complex shared configuration

**Cost:**
❌ 64KB duplicated source code
❌ Changes need to be made in both places

**Trade-off Decision:** The duplication is worth it for simplicity and test speed. In a larger project, you'd consolidate, but for an MVP, this is pragmatic.

## Why This Structure?

### Two Separate Builds

**1. Production Build (client/ → public/)**
```
TypeScript (client/) 
  → ES6 Modules (public/)
  → Browser loads directly
  → This is what users get!
```

**2. Test Build (src/ → dist/)**
```
TypeScript (src/)
  → CommonJS (dist/)
  → Jest runs in Node.js
  → Fast, reliable testing
```

### Why Keep src/?

**Could we test client/ directly?**
Yes, but it's complicated:
- Need jsdom (fake browser environment)
- Need to mock fetch() for JSON loading
- Slower test execution
- More complex setup

**Current approach is simpler:**
- `src/` has same CLI logic as `client/`
- Tests run fast in Node.js
- No browser mocking needed
- 136 tests pass reliably

### Why Not Delete src/?

**Tradeoff Analysis:**

**Keep src/ (current):**
✅ Tests run in 1 second
✅ No browser complexity
✅ Simpler test code
✅ Proven to work
❌ Code duplication (src/ and client/ have same CLI logic)

**Delete src/ (alternative):**
✅ Single source of truth
✅ Tests run against what users get
❌ Need jsdom for all tests
❌ Need to mock fetch/window
❌ Slower tests (~2-3 seconds)
❌ More complex test setup

**Decision:** Keep `src/` for testing convenience. The duplication is worth it for fast, reliable tests.

## Build Process

### Development
```bash
# 1. Build browser app
npm run build
# Compiles client/ → public/

# 2. Serve locally
npm start
# Serves public/ on http://localhost:3000

# 3. Run tests
npm test
# Runs Jest against src/ code
```

### What Gets Built

**For Browser (client/ → public/):**
1. TypeScript → JavaScript (ES6 modules)
2. Add `.js` extensions to imports (browser requirement)
3. YAML → JSON (browsers can't parse YAML)

**For Tests (src/ → dist/):**
1. TypeScript → JavaScript (CommonJS)
2. Keep for Jest execution

## Deployment

**Deploy only `public/` directory:**

```bash
# GitHub Pages
git subtree push --prefix public origin gh-pages

# Netlify
cd public && netlify deploy

# Vercel
vercel --prod

# Any server
cp -r public/* /var/www/html/
```

**Do NOT deploy:**
- ❌ src/
- ❌ dist/
- ❌ client/
- ❌ node_modules/
- ❌ *.yaml files

## File Sizes

| Directory | Size | Purpose |
|-----------|------|---------|
| **public/** | ~85KB | Deploy this! |
| client/ | ~150KB | Source code |
| src/ | ~120KB | Test code |
| dist/ | ~200KB | Test build |
| node_modules/ | ~100MB | Dependencies |

**Deployed size: 85KB** (0.085% of development size!)

## Summary

**For Users:**
- Download/deploy `public/` directory
- Open `index.html` in browser
- Everything works!

**For Developers:**
- Edit `client/` for features
- Edit `src/__tests__/` for tests
- Run `npm run build` to update `public/`
- Deploy `public/` when ready

**The build process exists to:**
1. Compile TypeScript to JavaScript
2. Convert YAML to JSON  
3. Make ES6 modules browser-compatible
4. Optimize for production

Simple! 🎉

