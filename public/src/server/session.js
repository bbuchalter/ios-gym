import { ModeStack } from "../cli/modes.js";
import { createInitialState } from "../cli/state.js";
/**
 * CLI session state for a single WebSocket connection
 */
export class Session {
    constructor(id, grammar, exerciseData) {
        this.activeExerciseId = null;
        this.id = id;
        this.modeStack = new ModeStack(grammar);
        this.deviceState = createInitialState();
        this.exerciseData = exerciseData;
    }
    /**
     * Get the current prompt text
     */
    getPrompt() {
        return this.modeStack.getPrompt(this.deviceState.hostname);
    }
    /**
     * Load an exercise and set initial device state
     */
    loadExercise(exerciseId) {
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
    /**
     * Get the active exercise
     */
    getActiveExercise() {
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
    constructor(grammar, exerciseData) {
        this.sessions = new Map();
        this.grammar = grammar;
        this.exerciseData = exerciseData;
    }
    /**
     * Create a new session
     */
    createSession(id) {
        const session = new Session(id, this.grammar, this.exerciseData);
        this.sessions.set(id, session);
        return session;
    }
    /**
     * Get an existing session
     */
    getSession(id) {
        return this.sessions.get(id);
    }
    /**
     * Delete a session
     */
    deleteSession(id) {
        this.sessions.delete(id);
    }
    /**
     * Get all active session IDs
     */
    getActiveSessionIds() {
        return Array.from(this.sessions.keys());
    }
}
