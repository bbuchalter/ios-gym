# Tailwind Responsive Design Guidelines

This project enforces responsive design best practices using [eslint-plugin-tailwindcss](https://github.com/francoismassart/eslint-plugin-tailwindcss) (beta version with Tailwind v4 support) to prevent over-complicated responsive patterns.

## Philosophy

**Rely on Tailwind's natural responsive behavior** instead of adding multiple breakpoints for every property. Tailwind's rem-based spacing and typography scale naturally across viewports.

## ESLint Plugin

We use the official [`eslint-plugin-tailwindcss@beta`](https://github.com/francoismassart/eslint-plugin-tailwindcss) which includes several helpful rules:

- **`tailwindcss/classnames-order`** - Enforces consistent ordering of Tailwind classes
- **`tailwindcss/no-custom-classname`** - Warns about non-Tailwind classes (disabled for v4 compatibility)
- **`tailwindcss/no-contradicting-classname`** - Catches conflicting classes like `p-4 p-6`
- **`tailwindcss/enforces-negative-arbitrary-values`** - Ensures correct negative value syntax
- **`tailwindcss/enforces-shorthand`** - Prefers shorthand like `p-4` over `px-4 py-4`

See the [full documentation](https://github.com/francoismassart/eslint-plugin-tailwindcss) for all rules.

### Tailwind v4 Compatibility Note

The beta plugin has partial support for Tailwind v4. We've configured it to skip config file loading (`config: false`) since Tailwind v4 uses CSS-first configuration via `@import "tailwindcss"`.

The core linting rules (class ordering, enforcing shorthands, etc.) work correctly. Some rules that require full Tailwind config introspection may have limited functionality, but the most valuable rules for code quality are fully functional.

## Project-Specific Guidelines

While the ESLint plugin catches technical issues, follow these patterns for better responsive design:

### ❌ Bad: Over-complicated breakpoints

```tsx
<div className="p-2 sm:p-3 md:p-4 lg:p-6">
  Too many padding breakpoints
</div>

<h1 className="text-sm sm:text-base md:text-lg lg:text-xl">
  Too many text size breakpoints
</h1>

<div className="gap-2 sm:gap-3 md:gap-4 lg:gap-5">
  Too many gap breakpoints
</div>
```

### ✅ Good: Minimal breakpoints

```tsx
<div className="p-4">
  Single value - scales naturally
</div>

<h1 className="text-2xl lg:text-3xl">
  One breakpoint for major layout shift
</h1>

<div className="gap-4">
  Simple gap - works well at all sizes
</div>
```

## When to Use Breakpoints

### ✅ Good use cases for breakpoints:

1. **Layout changes** - Flex direction, grid columns
   ```tsx
   <div className="flex-col sm:flex-row">
   <div className="grid-cols-2 lg:grid-cols-4">
   ```

2. **Major size changes** - One breakpoint for desktop emphasis
   ```tsx
   <h1 className="text-3xl lg:text-4xl">
   ```

3. **Show/hide elements** - Display utilities
   ```tsx
   <div className="hidden lg:block">
   ```

### ❌ Avoid breakpoints for:

1. **Spacing** - Use single values for padding, margin, gap
   - ❌ `p-2 sm:p-4 md:p-6`
   - ✅ `p-4`

2. **Text sizes** - Use one size or at most one breakpoint
   - ❌ `text-sm sm:text-base md:text-lg`
   - ✅ `text-lg` or `text-2xl lg:text-3xl`

3. **Margins** - Let natural spacing work
   - ❌ `mt-4 sm:mt-6 md:mt-8 lg:mt-12`
   - ✅ `mt-8`

## Why This Matters

1. **Simpler code** - Easier to read and maintain
2. **Better scaling** - Rem-based values adapt to user preferences
3. **Faster development** - Less time tweaking breakpoints
4. **Consistent UX** - Predictable scaling across devices
5. **Smaller bundle** - Fewer class names = smaller CSS

## Mobile-First Strategy

1. **Start with mobile** - Design looks good on small screens first
2. **Add one breakpoint** - Only when desktop needs emphasis
3. **Use `lg:` primarily** - Skip `sm:` and `md:` unless needed for layout changes
4. **Trust Tailwind** - Let the framework handle responsive scaling

## Examples from the Codebase

### ✅ Good - Simple and Effective

```tsx
// Header
<header className="px-4 py-6">
  <h1 className="text-3xl font-bold">IOS Gym</h1>
</header>

// Skill cards grid
<div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
  <SkillCard />
</div>

// Section title
<h2 className="text-2xl font-bold mt-10 mb-4">

// Info box
<InfoBox className="p-4 my-4">
```

### ❌ Bad - Over-complicated (Caught by Linter)

```tsx
// Too many padding breakpoints
<header className="px-2 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6 lg:py-8">

// Complex text sizing
<h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl">

// Excessive spacing variations
<div className="gap-2 sm:gap-3 md:gap-4 lg:gap-5 xl:gap-6">
```

## Running the Linter

```bash
# Check all files
npm run lint

# Check specific file
npm run lint -- components/MyComponent.tsx

# Auto-fix issues (if possible)
npm run lint -- --fix
```

## Disabling Rules (When Necessary)

If you have a legitimate reason to bypass a rule:

```tsx
{/* eslint-disable-next-line tailwindcss/classnames-order */}
<div className="p-2 sm:p-3 md:p-4 lg:p-6">
```

Or disable specific rules in your ESLint config:

```javascript
{
  rules: {
    'tailwindcss/no-custom-classname': 'off', // Allow custom classes
    'tailwindcss/classnames-order': 'warn',   // Downgrade to warning
  }
}
```

**But ask yourself first:** Do I really need all these breakpoints, or am I over-engineering?

## Questions?

If you're unsure whether a pattern is acceptable:
1. Try using a single value first
2. Add ONE breakpoint only if absolutely needed
3. Ask during code review if still uncertain

Remember: **Less is more** when it comes to responsive breakpoints!

