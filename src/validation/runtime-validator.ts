/**
 * Runtime validator for browser use
 * Re-exports AssertionRunner without Node.js dependencies (fs, loadGrammar, etc.)
 */

import { AssertionRunner } from './assertion-runner';

export type { 
  ValidationError, 
  ValidationResult, 
  Assertion, 
  ExerciseDefinition 
} from './assertion-runner';

// Simple alias for browser use
export class RuntimeValidator extends AssertionRunner {}

