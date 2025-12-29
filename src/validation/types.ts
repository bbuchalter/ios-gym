import { DeviceState, DeviceModel } from '../types';

/**
 * Exercise definition with hierarchical goals structure
 */
export interface Exercise {
  id: string;
  title: string;
  deviceModel: DeviceModel;
  
  goals: Goal[];
  assertions: Assertion[];
  
  // For backward compatibility during migration
  legacyCommands?: string[];
}

/**
 * A goal represents a logical grouping of steps (e.g., "Basic Setup", "Configure Routed Port")
 */
export interface Goal {
  section: string;
  steps: Step[];
}

/**
 * A step is a single action with its objective, command, and optional teaching point
 */
export interface Step {
  objective: string;           // What we're trying to accomplish
  command?: string;            // The command to execute (optional for objectives-only mode)
  teachingPoint?: string;      // Inline explanation for key concepts
}

/**
 * Assertion types for validation
 */
export type AssertionType = 
  | 'state-path'
  | 'config-saved'
  | 'interface-exists'
  | 'ospf-network'
  | 'vlan-exists';

/**
 * Assertion definition for validating device state
 */
export interface Assertion {
  type: AssertionType;
  path?: string;                    // For state-path assertions (e.g., "hostname", "interfaces.g0/0.ip")
  expectedValue?: any;              // Expected value for comparison
  description: string;              // User-friendly error message
  diagnosticCommand?: string;       // Show command to help debug (e.g., "show running-config")
}

/**
 * Validation result from RuntimeValidator or BuildValidator
 */
export interface ValidationResult {
  success: boolean;
  errors: ValidationError[];
  warnings?: string[];
}

/**
 * Detailed validation error with context
 */
export interface ValidationError {
  assertion: Assertion;
  actualValue?: any;
  message: string;
}

/**
 * Build-time validation result with additional context
 */
export interface BuildResult extends ValidationResult {
  exerciseId: string;
  commandsExecuted: number;
  executionErrors?: string[];
  diagnosticCommandErrors?: string[];
}

