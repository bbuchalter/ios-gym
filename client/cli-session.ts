// Client-side CLI session (replaces server-side Session)

import { ModeStack } from "../src/cli/modes";
import { DeviceState, CommandGrammar, ExerciseData, Exercise } from "../src/types";
import { createInitialState } from "../src/cli/state";

export class CLISession {
  public id: string = "browser-session"; // For compatibility with CLI engine
  public modeStack: ModeStack;
  public deviceState: DeviceState;
  public activeExerciseId: string | null = null;
  public exerciseData: ExerciseData; // Public for compatibility
  
  constructor(grammar: CommandGrammar, exerciseData: ExerciseData) {
    this.modeStack = new ModeStack(grammar);
    this.deviceState = createInitialState();
    this.exerciseData = exerciseData;
  }
  
  public getPrompt(): string {
    return this.modeStack.getPrompt(this.deviceState.hostname);
  }
  
  public loadExercise(exerciseId: string): boolean {
    const exercise = this.exerciseData.exercises.find(ex => ex.id === exerciseId);
    
    if (!exercise) {
      return false;
    }
    
    const profile = this.exerciseData.devices[exercise.device_profile];
    
    if (!profile) {
      return false;
    }
    
    // Merge profile start_state into device state
    this.deviceState = {
      ...createInitialState(),
      ...profile.start_state
    };
    
    this.activeExerciseId = exerciseId;
    this.modeStack.reset();
    
    return true;
  }
  
  public getActiveExercise(): Exercise | null {
    if (!this.activeExerciseId) {
      return null;
    }
    
    return this.exerciseData.exercises.find(ex => ex.id === this.activeExerciseId) || null;
  }
}

