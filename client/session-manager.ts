// Session manager for client-side (simplified version for tests)

import { CLISession } from "./cli-session";
import { CommandGrammar, ExerciseData } from "../src/types";

export class SessionManager {
  private sessions = new Map<string, CLISession>();
  private grammar: CommandGrammar;
  private exerciseData: ExerciseData;
  
  constructor(grammar: CommandGrammar, exerciseData: ExerciseData) {
    this.grammar = grammar;
    this.exerciseData = exerciseData;
  }
  
  public createSession(id: string): CLISession {
    const session = new CLISession(this.grammar, this.exerciseData);
    this.sessions.set(id, session);
    return session;
  }
  
  public getSession(id: string): CLISession | undefined {
    return this.sessions.get(id);
  }
  
  public deleteSession(id: string): void {
    this.sessions.delete(id);
  }
  
  public getActiveSessionIds(): string[] {
    return Array.from(this.sessions.keys());
  }
}

