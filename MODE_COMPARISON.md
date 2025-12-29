# Display Mode Comparison - Compact Design

## Design Philosophy

**Goal**: Minimize vertical space so students can see instructions and terminal simultaneously without scrolling.

**Solution**: Compact table/list formats instead of card-based layouts.

## Side-by-Side Comparison

### "Tell Me" Mode 📖

**Perfect for:**
- First-time learners
- Students who need guidance
- Building confidence
- Learning new concepts

**What's Shown (Compact Table):**

```
[📖 Tell Me]  [🎯 Challenge]

Basic Configuration
┌────┬─────────────────────────────────────┬──────────────────────┐
│ #  │ What to do                          │ Command              │
├────┼─────────────────────────────────────┼──────────────────────┤
│ 1  │ Enter privileged mode               │ enable               │
├────┼─────────────────────────────────────┼──────────────────────┤
│ 2  │ Enter global configuration mode     │ configure terminal   │
│    │ 💡 This is where you make changes   │                      │
├────┼─────────────────────────────────────┼──────────────────────┤
│ 3  │ Set the hostname to 'MySwitch'      │ hostname MySwitch    │
│    │ 💡 Hostname appears in the prompt   │                      │
├────┼─────────────────────────────────────┼──────────────────────┤
│ 4  │ Exit to privileged mode             │ end                  │
│    │ 💡 'end' exits from any config mode │                      │
└────┴─────────────────────────────────────┴──────────────────────┘

[Terminal appears here - always visible below]
```

**Visual Design:**
- Clean table layout (fits in ~300px height)
- Inline teaching points (no extra boxes)
- Commands in right column (easy to scan)
- Minimal padding and margins

---

### "Challenge" Mode 🎯

**Perfect for:**
- Advanced students
- Second attempts
- Competition practice
- Testing understanding

**What's Shown (Compact List):**

```
[📖 Tell Me]  [🎯 Challenge]  Commands hidden

Basic Configuration
 1. Enter privileged mode
 2. Enter global configuration mode
    💡 This is where you make changes to the device
 3. Set the hostname to 'MySwitch'
    💡 Hostname appears in the prompt and helps identify your device
 4. Exit to privileged mode
    💡 'end' command exits from any configuration mode directly

[Terminal appears here - always visible below]
```

**Visual Design:**
- Simple numbered list (fits in ~200px height)
- Purple border for differentiation
- Inline teaching points (small text)
- Even more compact than Tell Me mode

## Key Differences

| Feature | Tell Me Mode | Challenge Me Mode |
|---------|-------------|-------------------|
| **Commands** | ✅ Shown explicitly | ❌ Hidden |
| **Objectives** | ✅ Shown | ✅ Shown |
| **Teaching Points** | ✅ Shown | ✅ Shown |
| **Color Scheme** | Blue (friendly) | Purple (advanced) |
| **Layout** | Spacious | Compact |
| **Difficulty** | Beginner | Advanced |

## What Stays the Same

Regardless of mode, students always see:

1. **Section headers** - "Basic Configuration", "Save Configuration"
2. **Teaching points** - Conceptual explanations (💡)
3. **Terminal** - Same interactive CLI
4. **Validation** - Same "Check My Work" button
5. **Feedback** - Same error/success messages

## Learning Progression

### Recommended Flow

```
First Time:
┌─────────────┐
│ Tell Me     │ → Complete exercise → Learn commands
└─────────────┘

Second Time:
┌─────────────┐
│ Challenge   │ → Try without help → Test understanding
└─────────────┘

If Stuck:
┌─────────────┐
│ Toggle back │ → Check command → Continue learning
│ to Tell Me  │
└─────────────┘
```

### Example Student Journey

**Lesson 1, First Attempt (Tell Me Mode):**
1. Student reads: "Enter privileged mode"
2. Sees command box: `enable`
3. Types it, sees prompt change
4. Reads teaching point, understands why
5. Completes all steps successfully
6. Clicks "Check My Work" → ✅ Pass!

**Lesson 1, Second Attempt (Challenge Mode):**
1. Student reads: "Enter privileged mode"
2. NO command shown - must remember
3. Types `enable` from memory
4. Continues through all steps
5. Clicks "Check My Work" → ✅ Pass!
6. Feels accomplished! 🎉

## Implementation

### Usage in page.tsx

```typescript
// Default mode (Tell Me)
<Exercise 
  exercise={lesson01 as any}
  grammar={grammar}
/>

// Start in Challenge mode
<Exercise 
  exercise={lesson01 as any}
  grammar={grammar}
  initialMode="challenge-me"
/>
```

### Toggle Behavior

- State managed within Exercise component
- Instant switching (no page reload)
- Persists during validation
- Resets on page refresh (intentional - fresh start)

## Accessibility

- ✅ Keyboard navigable (Tab to buttons, Enter to toggle)
- ✅ Clear visual indicators (active button highlighted)
- ✅ Screen reader friendly (descriptive button text)
- ✅ Color contrast meets WCAG standards

## Mobile Responsive

- Toggle buttons stack on small screens
- Cards remain readable on mobile
- Terminal adapts to screen size
- Teaching points wrap properly

## CyberPatriot Alignment

**Challenge Mode mirrors competition format:**
- Students get objectives/requirements
- No step-by-step commands provided
- Must figure out configuration themselves
- Teaching points = conceptual hints (like documentation)

This prepares students for the actual competition environment where they receive requirements but must determine the implementation themselves.

