# Git Hooks

This project uses Git hooks to ensure code quality before commits and pushes.

## Pre-Commit Hook

**Location:** `.git/hooks/pre-commit`

Runs automatically before every commit to validate:
- ✅ TypeScript build succeeds
- ✅ All tests pass

### What it does:
1. Builds the TypeScript code (`npm run build`)
2. Runs the test suite (`jest`)
3. Blocks the commit if either fails

### Output:
```
🔍 Running pre-commit checks...

📦 Building TypeScript...
✓ Build successful
🧪 Running tests...
✓ All tests passed

✓ All pre-commit checks passed! 🎉
```

### Bypassing (not recommended):
If you absolutely need to commit without running checks:
```bash
git commit --no-verify -m "your message"
```

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

### Bypassing (not recommended):
If you absolutely need to push without running checks:
```bash
git push --no-verify
```

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

