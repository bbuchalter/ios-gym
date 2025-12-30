# Git Hooks

This project uses [Lefthook](https://github.com/evilmartians/lefthook) for fast, parallel Git hook execution.

## Pre-Commit Hook

**Configuration:** [`lefthook.yml`](lefthook.yml)  
**Installed at:** `.git/hooks/pre-commit` (managed by Lefthook)

Runs validation checks **in parallel** before every commit:

- ✅ Grammar files synchronized (Switch + Router)
- ✅ TypeScript types valid
- ✅ All tests pass (328 tests)
- ✅ Web linting (ESLint)
- ✅ Code formatting (Prettier)
- ✅ YAML syntax valid

### Performance

**Parallel execution** reduces commit time:
- Sequential (old bash): ~14+ seconds
- Parallel (Lefthook): ~5-6 seconds

All checks run simultaneously, so total time equals the slowest check, not the sum.

### What it does:

1. **Grammar sync** - Validates YAML ↔ JSON consistency
2. **TypeScript** - Type checking with `tsc --noEmit`
3. **Tests** - Runs full Jest suite (21 test files, 328 tests)
4. **Web linting** - ESLint validation including:
   - React/TypeScript rules
   - Tailwind CSS class ordering
   - Import validation
   - Security checks
5. **Prettier** - Code formatting validation
6. **YAML** - Syntax validation for grammar files

All checks must pass for commit to succeed.

### Output:

```
╭────────────────────────────────────╮
│ lefthook v1.13.6  hook: pre-commit │
╰────────────────────────────────────╯
┃  grammar-sync-router ❯ ✓ Router grammar synchronized
┃  grammar-sync-switch ❯ ✓ Switch grammar synchronized
┃  web-prettier ❯ All matched files use Prettier code style!
┃  typecheck ❯ (running...)
┃  yaml-lint ❯ ✔ YAML Lint successful.
┃  tests ❯ Test Suites: 21 passed, 21 total
┃  web-lint ❯ (running...)

summary: (done in 5.58 seconds)
✓ grammar-sync-router (0.32 seconds)
✓ grammar-sync-switch (0.34 seconds)
✓ web-prettier (1.45 seconds)
✓ typecheck (1.77 seconds)
✓ yaml-lint (2.47 seconds)
✓ tests (3.51 seconds)
✓ web-lint (5.56 seconds)
```

### If Checks Fail:

**DO NOT bypass with `--no-verify`!** Instead:

1. **Grammar sync:** Run `npm run build:grammar`
2. **TypeScript errors:** Run `npx tsc --noEmit`
3. **Test failures:** Run `npm test`
4. **Linting errors:** Run `cd web && npm run lint -- --fix`
5. **Formatting:** Run `cd web && npm run format`
6. **YAML errors:** Run `npm run lint:yaml`

Fix the issues, then commit normally.

## Installation

Install Lefthook hooks using npm:

```bash
npm run hooks:install
```

This installs all hooks configured in [`lefthook.yml`](lefthook.yml).

### First Time Setup

After cloning the repository:

```bash
npm install              # Installs lefthook package
npm run hooks:install    # Installs Git hooks
```

### Verification

Make a test commit to verify hooks are working:

```bash
touch test.txt
git add test.txt
git commit -m "Test hooks"
```

You should see Lefthook run all validation checks in parallel.

## Benefits

1. **Fast**: Parallel execution (~5-6s vs ~14s sequential)
2. **Catch errors early**: Find issues before they reach CI/CD
3. **Maintain quality**: All code passes validation before commit
4. **Team consistency**: Same checks for everyone via [`lefthook.yml`](lefthook.yml)
5. **Cross-platform**: Works on macOS, Linux, Windows
6. **No symlinks**: Managed by npm, not manual file operations

## Configuration

All hooks are configured in [`lefthook.yml`](lefthook.yml) at the project root.

### Adding New Checks

Edit [`lefthook.yml`](lefthook.yml) and add new commands:

```yaml
pre-commit:
  parallel: true
  commands:
    my-check:
      run: npm run my-check
```

After editing:
1. Commit the updated [`lefthook.yml`](lefthook.yml)
2. Team members get updates on next `npm install` or `npm run hooks:install`

### Disabling Specific Checks

To skip a check temporarily (not recommended):

```bash
LEFTHOOK_EXCLUDE=tests git commit -m "Skip tests this time"
```

## Troubleshooting

### Hooks not running

Reinstall hooks:
```bash
npm run hooks:install
```

### Check what hooks are installed

```bash
npx lefthook dump
```

### Run hooks manually

```bash
npx lefthook run pre-commit
```


