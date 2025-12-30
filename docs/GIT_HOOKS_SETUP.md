# Git Hooks

This project uses [Lefthook](https://github.com/evilmartians/lefthook) for fast, parallel Git hook execution.

## Installation

Install hooks using npm:

```bash
npm run hooks:install
```

This installs hooks defined in [`lefthook.yml`](../lefthook.yml).

## Available Hooks

### pre-commit

Runs validation checks **in parallel** before every commit:

- **Grammar sync** - Ensure YAML and JSON grammar files match
  - `grammar/commands-2960-switch.yaml` ↔ `web/public/commands-2960-switch.json`
  - `grammar/commands-1941-router.yaml` ↔ `web/public/commands-1941-router.json`
- **TypeScript types** - Validate with `tsc --noEmit`
- **Tests** - Run all Jest tests
- **Web linting** - ESLint checks on web directory
- **Prettier** - Code formatting validation on web directory
- **YAML validation** - Syntax validation for grammar files

**Performance:** All checks run in parallel, reducing commit time from ~14s to ~6s.

See [../docs/HOOKS.md](../docs/HOOKS.md) for complete documentation.

## Configuration

Hook configuration is in [`lefthook.yml`](../lefthook.yml) at the project root.

### Why Lefthook?

- **Parallel execution** - Multiple checks run simultaneously
- **Fast** - Only 5-6 seconds vs 14+ seconds sequential
- **Declarative** - YAML configuration is easy to read and modify
- **Cross-platform** - Works on macOS, Linux, and Windows
- **npm-based** - No manual symlinks needed

## Updating Hooks

1. Edit [`lefthook.yml`](../lefthook.yml)
2. Commit changes
3. Team members get updates automatically on next `npm install` or `npm run hooks:install`

