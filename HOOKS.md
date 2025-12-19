# Git Hooks

This project uses Git hooks to ensure code quality before commits and pushes.

## Pre-Commit Hook

**Location:** `.git/hooks/pre-commit`

Runs automatically before every commit to validate:
- ✅ Grammar files are synchronized
- ✅ TypeScript build succeeds
- ✅ All tests pass

### What it does:
1. Checks that `commands.yaml` and `web/public/commands.json` are in sync
2. Builds the TypeScript code (`npm run build`)
3. Runs the test suite (`jest`)
4. Blocks the commit if any check fails

### Output:
```
🔍 Running pre-commit checks...

📝 Checking grammar files are synchronized...
✓ Grammar files are synchronized
📦 Building TypeScript...
✓ Build successful
🧪 Running tests...
✓ All tests passed

✓ All pre-commit checks passed! 🎉
```

### If Checks Fail:
**DO NOT bypass with `--no-verify`!** Instead:
1. If grammar files are out of sync: Run `npm run build:grammar`
2. Run `npm test` to see detailed test failures
3. Run `npm run build` to see build errors
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

The hooks are already installed in `.git/hooks/` and are executable. They will run automatically.

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

### Build failing
Run build manually to see errors:
```bash
npm run build
```

## Adding More Checks

To add linting or other checks, edit the hook files:
- `.git/hooks/pre-commit`
- `.git/hooks/pre-push`

Example adding ESLint:
```bash
echo "🔎 Checking code style..."
if ! npm run lint > /dev/null 2>&1; then
    print_error "Linting failed!"
    exit 1
fi
print_success "Code style checks passed"
```


