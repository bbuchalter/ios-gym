# Git Hooks

This project uses Git hooks to ensure code quality before commits and pushes.

## Pre-Commit Hook

**Source:** `hooks/pre-commit` (tracked in git)  
**Installed at:** `.git/hooks/pre-commit` (symlink)

Runs automatically before every commit to validate:
- ✅ Grammar files are synchronized
- ✅ TypeScript types are valid
- ✅ All tests pass

### What it does:
1. Checks that grammar YAML files and their JSON counterparts are in sync:
   - `commands-2960-switch.yaml` ↔ `web/public/commands-2960-switch.json`
   - `commands-1941-router.yaml` ↔ `web/public/commands-1941-router.json`
2. Validates TypeScript types with `tsc --noEmit` (type checking without compilation)
3. Runs the test suite (`jest`)
4. Blocks the commit if any check fails

### Output:
```
🔍 Running pre-commit checks...

📝 Checking grammar files are synchronized...
✓ Grammar files are synchronized
🔍 Checking TypeScript types...
✓ TypeScript types are valid
🧪 Running tests...
✓ All tests passed

✓ All pre-commit checks passed! 🎉
```

### If Checks Fail:
**DO NOT bypass with `--no-verify`!** Instead:
1. **Grammar files out of sync:** Run `npm run build:grammar`
2. **TypeScript type errors:** Run `npx tsc --noEmit` to see type errors
3. **Test failures:** Run `npm test` to see detailed test output
4. Fix the issues
5. Commit again normally

See `.claude.md` for full git commit policy.

## Pre-Push Hook

**Location:** `.git/hooks/pre-push`

Runs automatically before pushing to remote to validate:
- ✅ Full test suite passes
- ✅ Build succeeds

### What it does:
1. Runs the complete test suite with output
2. Verifies the build still works
3. Blocks the push if either fails

### Output:
```
🚀 Running pre-push checks...

🧪 Running full test suite...
Test Suites: 7 passed, 7 total
Tests:       58 passed, 58 total
✓ All tests passed
📦 Verifying build...
✓ Build successful

✓ All pre-push checks passed! Ready to push 🚀
```

### If Checks Fail:
**DO NOT bypass with `--no-verify`!** Instead:
1. Run `npm test` to see full test output
2. Run `npm run build` to check build
3. Fix all failures
4. Push again normally

See `.claude.md` for full git commit policy.

## Installation

The hooks are stored in the `hooks/` directory (tracked in git) and need to be installed into `.git/hooks/`.

### First Time Setup

Run this command from the project root to install the hooks:

```bash
ln -sf ../../hooks/pre-commit .git/hooks/pre-commit
```

This creates a symlink from `.git/hooks/pre-commit` to the tracked `hooks/pre-commit` file, so any updates to the hook will automatically apply to your local git hooks.

### Verification

Test that the hook is installed and working:

```bash
./hooks/pre-commit
```

If you see the checks running successfully, the hook is properly installed and will run automatically on every commit.

## Benefits

1. **Catch errors early**: Find build and test failures before they reach the repository
2. **Maintain quality**: Ensure all committed code passes tests
3. **Save time**: Prevent CI/CD failures by validating locally first
4. **Team consistency**: Everyone runs the same checks before committing

## Troubleshooting

### Hook not running
Check if the hook is executable:
```bash
ls -la .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

### Tests failing
Run tests manually to see detailed output:
```bash
npm test
```

### TypeScript type errors
Run type checking manually to see detailed errors:
```bash
npx tsc --noEmit
```

## Adding More Checks

To add linting or other checks, edit the hook files in the `hooks/` directory:
- `hooks/pre-commit`
- `hooks/pre-push`

The changes will automatically apply since `.git/hooks/` contains symlinks to these files.

Example adding ESLint:
```bash
echo "🔎 Checking code style..."
if ! npm run lint > /dev/null 2>&1; then
    print_error "Linting failed!"
    exit 1
fi
print_success "Code style checks passed"
```

After editing, commit the updated hook file so other developers get the changes too.


