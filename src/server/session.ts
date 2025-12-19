import { ModeStack } from "../cli/modes";
import { DeviceState, CommandGrammar, ExerciseData } from "../types";
import { createInitialState } from "../cli/state";

/**
 * CLI session state for a single WebSocket connection
 */
export class Session {
  public id: string;
  public modeStack: ModeStack;
  public deviceState: DeviceState;
  public activeExerciseId: string | null = null;
  public exerciseData: ExerciseData;
  
  constructor(
    id: string,
    grammar: CommandGrammar,
    exerciseData: ExerciseData
  ) {
    this.id = id;
    this.modeStack = new ModeStack(grammar);
    this.deviceState = createInitialState();
    this.exerciseData = exerciseData;
  }
  
  /**
   * Get the current prompt text
   */
  public getPrompt(): string {
    return this.modeStack.getPrompt(this.deviceState.hostname);
  }
  
  /**
   * Load an exercise and set initial device state
   */
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
      ...profile.start_state,
      configSaved: false,  // Reset config saved flag when loading exercise
      savedState: null     // Reset saved state when loading exercise
    };
    
    this.activeExerciseId = exerciseId;
    this.modeStack.reset();
    
    return true;
  }
  
  /**
   * Get the active exercise
   */
  public getActiveExercise() {
    if (!this.activeExerciseId) {
      return null;
    }
    
    return this.exerciseData.exercises.find(ex => ex.id === this.activeExerciseId);
  }
}

/**
 * Session manager to track all active sessions
 */
export class SessionManager {
  private sessions = new Map<string, Session>();
  private grammar: CommandGrammar;
  private exerciseData: ExerciseData;
  
  constructor(grammar: CommandGrammar, exerciseData: ExerciseData) {
    this.grammar = grammar;
    this.exerciseData = exerciseData;
  }
  
  /**
   * Create a new session
   */
  public createSession(id: string): Session {
    const session = new Session(id, this.grammar, this.exerciseData);
    this.sessions.set(id, session);
    return session;
  }
  
  /**
   * Get an existing session
   */
  public getSession(id: string): Session | undefined {
    return this.sessions.get(id);
  }
  
  /**
   * Delete a session
   */
  public deleteSession(id: string): void {
    this.sessions.delete(id);
  }
  
  /**
   * Get all active session IDs
   */
  public getActiveSessionIds(): string[] {
    return Array.from(this.sessions.keys());
  }
}

