# Display Modes: Tell Me vs Challenge Me

The Exercise component now supports two interactive display modes that students can toggle between.

## Mode Toggle UI

A compact toggle bar appears at the top of each exercise:

```
[📖 Tell Me]  [🎯 Challenge]
```

**Design Goals:**
- Minimal vertical space (< 40px)
- Clear active state (highlighted button)
- Easy to toggle (one click)
- Visible mode indicator

## Tell Me What To Do Mode (Default)

**Target Audience**: Beginners, first-time learners

**What Students See:**
- ✅ Full objectives with clear descriptions
- ✅ Exact commands to type (in highlighted boxes)
- ✅ Teaching points with lightbulb icons
- ✅ Step-by-step numbered cards
- ✅ Visual hierarchy with colors

**Example Display:**

```
▶ Basic Configuration

┌─────────────────────────────────────────────────────────┐
│  1  Enter privileged mode                               │
│                                                         │
│     Type this command:                                  │
│     enable                                              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  2  Enter global configuration mode                     │
│                                                         │
│     Type this command:                                  │
│     configure terminal                                  │
│                                                         │
│     💡 This is where you make changes to the device.    │
│        Watch for the (config)# prompt.                  │
└─────────────────────────────────────────────────────────┘
```

**Benefits:**
- Clear guidance for students who need hand-holding
- Teaching points provide context and explanation
- Reduces frustration for beginners
- Builds confidence through successful completion

## Challenge Me Mode

**Target Audience**: Advanced students, second attempts, competition practice

**What Students See:**
- ✅ Objectives only (what to accomplish)
- ✅ Teaching points still shown (conceptual help)
- ❌ NO commands shown (figure it out yourself)
- ✅ Purple/gradient styling to indicate advanced mode
- ✅ Warning badge: "Advanced mode - Figure out the commands yourself!"

**Example Display:**

```
▶ Basic Configuration

┌─────────────────────────────────────────────────────────┐
│  1  Enter privileged mode                               │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  2  Enter global configuration mode                     │
│                                                         │
│     💡 This is where you make changes to the device.    │
│        Watch for the (config)# prompt.                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  3  Set the hostname to 'MySwitch'                      │
│                                                         │
│     💡 The hostname appears in the prompt and helps     │
│        identify your device in a network.               │
└─────────────────────────────────────────────────────────┘
```

**Benefits:**
- Tests true understanding (not just copying)
- Prepares for competition scenarios
- Encourages problem-solving
- Students can still see teaching points for conceptual help
- Can toggle back to "Tell Me" mode if stuck

## Design Decisions

### Why Keep Teaching Points in Challenge Mode?

Teaching points provide **conceptual understanding**, not just commands:
- "This is where you make changes" (explains purpose)
- "The hostname appears in the prompt" (explains behavior)
- "CRITICAL: Cisco IOS does not save automatically" (important concept)

These help students understand **why** they're doing something, not just **what** to do.

### Visual Differentiation

**Tell Me Mode:**
- Blue color scheme (friendly, instructional)
- Command boxes with "Type this command:" labels
- Larger, more spacious cards
- Green command text (positive reinforcement)

**Challenge Me Mode:**
- Purple/gradient color scheme (advanced, challenging)
- No command boxes
- Tighter spacing (more objectives visible)
- Purple numbered badges
- Warning indicator at top

### Progressive Learning Path

**Suggested workflow:**
1. **First attempt**: Use "Tell Me" mode to learn
2. **Practice**: Complete the exercise following instructions
3. **Second attempt**: Switch to "Challenge Me" mode
4. **Test knowledge**: Try to complete without seeing commands
5. **Toggle back**: If stuck, switch to "Tell Me" to check

## Implementation Details

### Component State

```typescript
const [displayMode, setDisplayMode] = useState<DisplayMode>('tell-me');
```

- State is local to each Exercise component
- Defaults to 'tell-me' (beginner-friendly)
- Can be overridden with `initialMode` prop
- Persists during validation (doesn't reset)

### Mode Toggle Button

```typescript
<button onClick={() => setDisplayMode('tell-me')}>
  📖 Tell Me What To Do
</button>
<button onClick={() => setDisplayMode('challenge-me')}>
  🎯 Challenge Me
</button>
```

- Instant switching (no page reload)
- Visual feedback (active button highlighted)
- Accessible (keyboard navigable)

### Rendering Logic

```typescript
{displayMode === 'tell-me' ? (
  // Full display with commands
) : (
  // Objectives only, no commands
)}
```

- Same data structure (Exercise JSON)
- Different rendering based on mode
- Teaching points shown in both modes
- Commands only shown in "Tell Me" mode

## Future Enhancements (Optional)

1. **Remember preference**: Save mode choice to localStorage
2. **Per-lesson tracking**: Remember which mode was used for each lesson
3. **Hint system**: In Challenge mode, add "Show me a hint" button that reveals one command at a time
4. **Timer**: Track how long students take in each mode
5. **Badge system**: Award badges for completing in Challenge mode

## Pedagogical Benefits

### Tell Me Mode
- Reduces cognitive load for beginners
- Builds muscle memory through repetition
- Provides immediate context with teaching points
- Prevents frustration from getting stuck

### Challenge Mode
- Tests retention and understanding
- Simulates real-world scenarios (no instructions)
- Prepares for CyberPatriot competition format
- Builds confidence through problem-solving

### Toggle Ability
- Students control their learning pace
- Can switch mid-exercise if stuck
- Encourages trying harder mode after mastery
- No penalty for using "Tell Me" mode

