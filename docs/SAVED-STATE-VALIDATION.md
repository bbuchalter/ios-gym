# Saved State Validation

## Overview

The validation system now checks the **saved configuration** (startup-config), not just the running configuration. This ensures students actually save their work with `write memory`.

## How It Works

### Device State Tracking

The CLI engine tracks two states:
1. **Running Config** (`deviceState`) - Current in-memory configuration
2. **Startup Config** (`deviceState.savedState`) - What was saved with `write memory`

When a student runs `write memory`:
```typescript
// In config.ts handlePersist()
session.deviceState.savedState = cloneState(deviceState);
session.deviceState.configSaved = true;
```

### Validation Behavior

**Runtime Validation (Browser - `requireSaved: true` by default)**
```typescript
validator.runAssertions(state, modeStack, assertions);  // Checks savedState
```

1. First checks if `configSaved` is true
2. If not saved → immediate error: "Configuration not saved! Use 'write memory'"
3. If saved → validates against `savedState` (not current state)

**Build-Time Validation (`requireSaved: false`)**
```typescript
validator.runAssertions(state, modeStack, assertions, false);  // Checks current state
```

- Validates against current state
- Doesn't require `write memory` (exercises include it in commands)
- Used by `validate-exercises.ts` script

## Student Experience

### Scenario 1: Forgot to Save
```
Student configures everything correctly but forgets write memory
↓
Clicks "Check My Work"
↓
⚠️ Configuration Not Saved
Your configuration looks correct, but you need to save it!
Use "write memory" to save your work.
```

### Scenario 2: Saved Correctly
```
Student configures and runs write memory
↓
Clicks "Check My Work"  
↓
✓ Excellent work! Configuration is correct!
```

### Scenario 3: Made Changes After Saving
```
Student saves, then makes more changes without saving again
↓
Clicks "Check My Work"
↓
Validates against OLD saved state (before the changes)
↓
May show errors if new changes broke things
```

## Special Handling in ValidationFeedback

The component detects if the ONLY error is "not saved":

```typescript
const onlyConfigNotSaved = 
  result.errors.length === 1 && 
  result.errors[0].assertionType === 'config_saved';
```

Shows friendlier message:
- **Only not saved:** "⚠️ Configuration Not Saved" (yellow/warning tone)
- **Other errors:** "✗ Configuration Incomplete" (red/error tone)

## Why This Matters

### Real-World Alignment
- In real Cisco devices, unsaved config is lost on reboot
- CyberPatriot competitions require saved configuration
- Professional practice: always save your work

### Teaching Value
- Reinforces `write memory` habit
- Shows difference between running-config and startup-config
- Prepares for real scenarios where this distinction matters

## API

### AssertionRunner.runAssertions()

```typescript
runAssertions(
  state: DeviceState,
  modeStack: ModeStack,
  assertions: Assertion[],
  requireSaved: boolean = true  // Default: check saved state
): ValidationResult
```

**Parameters:**
- `state` - Device state to validate
- `modeStack` - Current mode stack
- `assertions` - Array of assertions to check
- `requireSaved` - If true, validates savedState and requires configSaved flag

**Returns:**
- `ValidationResult` with passed/failed status and errors

### Usage Examples

**Runtime (Browser) - Require Saved:**
```typescript
const validator = new RuntimeValidator();
const result = validator.runAssertions(
  session.deviceState,
  session.modeStack,
  exercise.validation.assertions
  // requireSaved defaults to true
);
```

**Build-Time - Don't Require Saved:**
```typescript
const validator = new LessonValidator();
const result = validator.runAssertions(
  session.deviceState,
  session.modeStack,
  exercise.validation.assertions,
  false  // Don't require saved (commands include write memory)
);
```

**Unit Tests - Don't Require Saved:**
```typescript
const result = validator.runAssertions(state, modeStack, [
  { type: 'hostname', expected: 'Test', message: 'Hostname' }
], false);  // Test against current state
```

## Implementation Details

### Assertion Runner Logic

```typescript
if (requireSaved && !state.configSaved) {
  return {
    passed: false,
    errors: [{ 
      assertionType: 'config_saved',
      message: 'Configuration not saved! Use "write memory"...'
    }]
  };
}

const stateToValidate = (requireSaved && state.savedState) 
  ? state.savedState 
  : state;

// Run assertions against stateToValidate...
```

### Edge Cases Handled

1. **No saved state yet:** Uses current state if savedState is null
2. **Build-time validation:** Skips saved check entirely
3. **Unit tests:** Can test assertions without save requirement
4. **Multiple saves:** Latest savedState is used

## Future Enhancements

Could add:
- Warning if running-config differs from startup-config
- "You have unsaved changes" indicator
- Diff view showing what changed since last save
- Auto-save option for practice mode

