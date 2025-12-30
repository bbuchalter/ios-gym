/**
 * Utilities for working with exercise definitions
 */

export interface Step {
  objective: string;
  command: string;
  teachingPoint?: string;
  keyCommand?: boolean;
  critical?: boolean;
}

export interface GoalSection {
  section: string;
  steps: Step[];
}

export interface ExerciseV2 {
  id: string;
  title: string;
  deviceModel: string;
  description?: string;
  goals: GoalSection[];
  assertions: any[];
}

/**
 * Extract flat command list from hierarchical goals structure
 * Used for backward compatibility and validation
 */
export function extractCommands(exercise: ExerciseV2): string[] {
  const commands: string[] = [];
  
  for (const section of exercise.goals) {
    for (const step of section.steps) {
      if (step.command) {
        commands.push(step.command);
      }
    }
  }
  
  return commands;
}

/**
 * Check if exercise uses v2 format (hierarchical goals)
 */
export function isExerciseV2(exercise: any): exercise is ExerciseV2 {
  return exercise.goals !== undefined && Array.isArray(exercise.goals);
}

/**
 * Convert v2 exercise to v1 format for validation
 */
export function v2ToV1(exercise: ExerciseV2): any {
  return {
    id: exercise.id,
    deviceModel: exercise.deviceModel,
    description: exercise.description,
    commands: extractCommands(exercise),
    validation: {
      type: 'goal-based',
      assertions: exercise.assertions
    }
  };
}

