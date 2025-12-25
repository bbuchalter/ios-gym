import { ExecutionResult, ModeType } from "../../types";
import { CLISession } from "../../cli-session";

/**
 * Handle mode transition actions
 */

export function handleModePush(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  const targetMode = action.mode as ModeType;
  session.modeStack.push(targetMode);
  
  return { output: [] };
}

export function handleModePop(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  session.modeStack.pop();
  return { output: [] };
}

export function handleModePopTo(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  const targetMode = action.mode as ModeType;
  const wasInConfigMode = session.modeStack.getCurrentMode() !== ModeType.PRIV_EXEC;
  session.modeStack.popTo(targetMode);
  
  // If exiting from config mode to PRIV_EXEC with 'end', show system message
  if (targetMode === ModeType.PRIV_EXEC && wasInConfigMode) {
    const output: string[] = [];
    
    // Check if logging synchronous is enabled
    if (session.deviceState.line.console.loggingSynchronous) {
      // With logging synchronous, message appears but is synchronized
      output.push("%SYS-5-CONFIG_I: Configured from console by console");
    } else {
      // Without logging synchronous, message might interrupt (but we just show it)
      output.push("%SYS-5-CONFIG_I: Configured from console by console");
    }
    
    return { output };
  }
  
  return { output: [] };
}

export function handleSessionEnd(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  return {
    output: ["Goodbye!"],
    sessionEnd: true
  };
}

export function handleEnableWithPassword(
  session: CLISession,
  args: Record<string, string>,
  action: any
): ExecutionResult {
  // Check if enable secret is set
  if (session.deviceState.enableSecret) {
    // Password prompt required
    return {
      output: [],
      passwordPrompt: {
        prompt: "Password: ",
        handler: "verify_enable_password",
        handlerArgs: { targetMode: action.mode }
      }
    };
  }
  
  // No password set, proceed directly
  const targetMode = action.mode as ModeType;
  session.modeStack.push(targetMode);
  return { output: [] };
}

export function handleVerifyEnablePassword(
  session: CLISession,
  password: string,
  args: Record<string, any>
): ExecutionResult {
  const targetMode = args.targetMode as ModeType;
  
  if (password === session.deviceState.enableSecret) {
    // Correct password - clear attempts and grant access
    if (session.pendingPasswordPrompt) {
      session.pendingPasswordPrompt = null;
    }
    session.modeStack.push(targetMode);
    return { output: [] };
  } else {
    // Incorrect password - track attempts
    const currentAttempt = (session.pendingPasswordPrompt?.attempts || 0) + 1;
    
    if (currentAttempt < 3) {
      // Re-prompt for password (attempts 1 and 2)
      return {
        output: [],
        passwordPrompt: {
          prompt: "Password: ",
          handler: "verify_enable_password",
          handlerArgs: { targetMode, attempt: currentAttempt }
        }
      };
    } else {
      // Third failed attempt - show error
      return {
        output: ["% Bad secrets"]
      };
    }
  }
}

