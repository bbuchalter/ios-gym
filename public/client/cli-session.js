// Client-side CLI session (replaces server-side Session)
import { ModeStack } from "../src/cli/modes.js";
import { createInitialState } from "../src/cli/state.js";
export class CLISession {
    constructor(grammar, exerciseData) {
        this.id = "browser-session"; // For compatibility with CLI engine
        this.activeExerciseId = null;
        this.modeStack = new ModeStack(grammar);
        this.deviceState = createInitialState();
        this.exerciseData = exerciseData;
    }
    getPrompt() {
        return this.modeStack.getPrompt(this.deviceState.hostname);
    }
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
    getActiveExercise() {
        if (!this.activeExerciseId) {
            return null;
        }
        return this.exerciseData.exercises.find(ex => ex.id === this.activeExerciseId) || null;
    }
}
