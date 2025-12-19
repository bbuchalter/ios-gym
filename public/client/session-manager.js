// Session manager for client-side (simplified version for tests)
import { CLISession } from "./cli-session.js";
export class SessionManager {
    constructor(grammar, exerciseData) {
        this.sessions = new Map();
        this.grammar = grammar;
        this.exerciseData = exerciseData;
    }
    createSession(id) {
        const session = new CLISession(this.grammar, this.exerciseData);
        this.sessions.set(id, session);
        return session;
    }
    getSession(id) {
        return this.sessions.get(id);
    }
    deleteSession(id) {
        this.sessions.delete(id);
    }
    getActiveSessionIds() {
        return Array.from(this.sessions.keys());
    }
}
