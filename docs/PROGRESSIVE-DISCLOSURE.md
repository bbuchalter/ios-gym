# Progressive Disclosure - Exercise Validation UI

## Implementation: Option 6

The Exercise component now implements **progressive disclosure** for verification content, showing different information based on the student's validation state.

## Three States

### State 1: Before Validation (Blue Box)
**When:** Student hasn't clicked "Check My Work" yet

**Shows:**
- 💡 Optional manual verification hint
- Show command to use
- What to look for
- Educational note
- Encourages trying the automated check

**Purpose:** 
- Teaches manual verification workflow
- Doesn't force students to use automation
- Provides alternative path for learning

### State 2: After Validation Fails (Red Box)
**When:** Student clicks "Check My Work" but config is incorrect

**Shows:**
- ✗ Specific errors with expected vs actual values
- Actionable error messages
- Show commands to diagnose issues
- Encouragement to fix and retry

**Purpose:**
- Clear feedback on what's wrong
- Teaches debugging with show commands
- Guides toward correct solution

### State 3: After Validation Passes (Green Box)
**When:** Student clicks "Check My Work" and config is correct

**Shows:**
- ✓ Success message
- Manual verification as learning tool
- "This is how pros verify their work"
- Same show commands but in success context

**Purpose:**
- Celebrates success
- Reinforces manual verification skills
- Prepares for real-world scenarios without automation

## Usage

```tsx
<Exercise 
  exerciseId="layer3-routed-port" 
  grammar={grammar} 
  TerminalComponent={Terminal}
  showManualVerification={true}
  manualVerificationContent={{
    showCommand: 'show ip interface brief',
    expectedItems: [
      'GigabitEthernet0/2 with IP address 35.72.12.1',
      'Status: up, Protocol: up'
    ],
    note: 'Notice how routed ports appear just like SVIs!'
  }}
/>
```

## Benefits

1. **No Duplication:** Manual verification content defined once, displayed contextually
2. **Progressive Learning:** Students see appropriate info for their current state
3. **Teaches Both Methods:** Automated validation + manual verification skills
4. **Real-World Prep:** Manual verification is essential for CyberPatriot and jobs
5. **Flexible:** Can omit manual verification if not needed (`showManualVerification={false}`)

## Visual Flow

```
┌─────────────────────────────────────┐
│  Commands List                      │
│  1. enable                          │
│  2. configure terminal              │
│  ...                                │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  Terminal (Interactive)             │
│  Switch>                            │
└─────────────────────────────────────┘
           ↓
┌─────────────────────────────────────┐
│  ✓ Check My Work (Button)           │
└─────────────────────────────────────┘
           ↓
    ┌──────┴──────┐
    │             │
Not Clicked    Clicked
    │             │
    ↓             ↓
┌─────────┐  ┌─────────┐
│ Blue    │  │ Red or  │
│ Manual  │  │ Green   │
│ Hint    │  │ Result  │
└─────────┘  └─────────┘
```

## Enhanced Error Messages

Validation errors now include:
- Specific what's wrong
- Expected vs actual values
- Show commands to diagnose
- Encouragement to retry

Example error output:
```
✗ Configuration Incomplete

• Interface g0/2 should be a routed port (did you use 'no switchport'?)
  Expected: routed
  Found: not configured

💡 How to Check Your Configuration:
  • show ip interface brief — Check interface IPs and status
  • show running-config — See all your configuration
  • show vlan brief — Check VLANs (if applicable)
```

## Future Enhancements

Could add:
- Specific show command per assertion type (interface errors → show ip interface brief)
- Diff view showing what changed
- Hint system that reveals progressively
- Time tracking (how long to complete)
- Retry counter

