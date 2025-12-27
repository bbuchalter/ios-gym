# Git Hooks

This directory contains Git hooks that are tracked in the repository.

## Installation

To use these hooks, create symlinks from `.git/hooks/` to this directory:

```bash
# From the project root
ln -sf ../../hooks/pre-commit .git/hooks/pre-commit
```

## Available Hooks

### pre-commit

Runs before every commit to validate:
- Grammar files are synchronized:
  - `commands-2960-switch.yaml` ↔ `web/public/commands-2960-switch.json`
  - `commands-1941-router.yaml` ↔ `web/public/commands-1941-router.json`
- TypeScript types are valid (`tsc --noEmit`)
- All tests pass (`jest`)

See [../HOOKS.md](../HOOKS.md) for complete documentation.

## Why Track Hooks in Git?

Tracking hooks in the repository ensures:
1. All team members use the same validation checks
2. Hook updates are versioned and shared automatically
3. New contributors can easily install hooks
4. Consistency across development environments

## Updating Hooks

When you modify hooks in this directory, the changes will automatically apply to anyone who has installed them via symlink. Remember to commit your changes so others get the updates too!

