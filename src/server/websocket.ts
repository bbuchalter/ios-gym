import * as WebSocket from "ws";
import { SessionManager } from "./session";
import { CLIEngine } from "../cli/engine";
import { ExerciseValidator } from "../exercise/validator";
import {
  WSMessage,
  CommandMessage,
  TabMessage,
  OutputMessage,
  PromptMessage,
  ExerciseStatusMessage
} from "../types";

/**
 * WebSocket message handler
 */
export class WebSocketHandler {
  private wss: WebSocket.Server;
  private sessionManager: SessionManager;
  private cliEngine: CLIEngine;
  private validator: ExerciseValidator;
  
  constructor(
    wss: WebSocket.Server,
    sessionManager: SessionManager,
    cliEngine: CLIEngine
  ) {
    this.wss = wss;
    this.sessionManager = sessionManager;
    this.cliEngine = cliEngine;
    this.validator = new ExerciseValidator();
    
    this.setupWebSocketServer();
  }
  
  private setupWebSocketServer(): void {
    this.wss.on("connection", (ws: WebSocket) => {
      const sessionId = this.generateSessionId();
      const session = this.sessionManager.createSession(sessionId);
      
      console.log(`New session: ${sessionId}`);
      
      // Send initial prompt
      this.sendPrompt(ws, session.getPrompt());
      
      // Handle messages
      ws.on("message", (data: WebSocket.Data) => {
        this.handleMessage(ws, session.id, data.toString());
      });
      
      // Handle disconnect
      ws.on("close", () => {
        console.log(`Session closed: ${sessionId}`);
        this.sessionManager.deleteSession(sessionId);
      });
    });
  }
  
  private handleMessage(ws: WebSocket, sessionId: string, data: string): void {
    try {
      const message: WSMessage = JSON.parse(data);
      const session = this.sessionManager.getSession(sessionId);
      
      if (!session) {
        this.sendError(ws, "Session not found");
        return;
      }
      
      switch (message.type) {
        case "command":
          this.handleCommand(ws, session, message as CommandMessage);
          break;
        
        case "tab":
          this.handleTab(ws, session, message as TabMessage);
          break;
        
        case "load_exercise":
          this.handleLoadExercise(ws, session, message);
          break;
        
        default:
          this.sendError(ws, `Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error("Error handling message:", error);
      this.sendError(ws, "Internal server error");
    }
  }
  
  private handleCommand(
    ws: WebSocket,
    session: any,
    message: CommandMessage
  ): void {
    const line = message.data.line;
    
    // Execute command
    const result = this.cliEngine.executeCommand(session, line);
    
    // Send output
    if (result.output && result.output.length > 0) {
      this.sendOutput(ws, result.output);
    }
    
    // Check for session end
    if (result.sessionEnd) {
      ws.close();
      return;
    }
    
    // Validate exercise if one is active
    if (session.activeExerciseId) {
      const exercise = session.getActiveExercise();
      if (exercise) {
        const validation = this.validator.validate(session.deviceState, exercise);
        this.sendExerciseStatus(ws, {
          exerciseId: session.activeExerciseId,
          passed: validation.passed,
          unmetRequirements: validation.unmetRequirements,
          hints: exercise.hints
        });
      }
    }
    
    // Send new prompt
    this.sendPrompt(ws, session.getPrompt());
  }
  
  private handleTab(
    ws: WebSocket,
    session: any,
    message: TabMessage
  ): void {
    const { line, cursorPos } = message.data;
    
    // Get completion
    const completion = this.cliEngine.getCompletion(session, line, cursorPos);
    
    // Send completion result
    this.send(ws, {
      type: "completion",
      data: completion
    });
  }
  
  private handleLoadExercise(
    ws: WebSocket,
    session: any,
    message: WSMessage
  ): void {
    const exerciseId = message.data?.exerciseId;
    
    if (!exerciseId) {
      this.sendError(ws, "Exercise ID required");
      return;
    }
    
    // Load the exercise
    const success = session.loadExercise(exerciseId);
    
    if (!success) {
      this.sendError(ws, `Exercise not found: ${exerciseId}`);
      return;
    }
    
    // Send updated prompt with reset device
    this.sendPrompt(ws, session.getPrompt());
    
    // Send initial validation
    const exercise = session.getActiveExercise();
    if (exercise) {
      const validation = this.validator.validate(session.deviceState, exercise);
      this.sendExerciseStatus(ws, {
        exerciseId: session.activeExerciseId,
        passed: validation.passed,
        unmetRequirements: validation.unmetRequirements,
        hints: exercise.hints
      });
    }
  }
  
  private sendOutput(ws: WebSocket, lines: string[]): void {
    const message: OutputMessage = {
      type: "output",
      data: { lines }
    };
    this.send(ws, message);
  }
  
  private sendPrompt(ws: WebSocket, text: string): void {
    const message: PromptMessage = {
      type: "prompt",
      data: { text }
    };
    this.send(ws, message);
  }
  
  private sendExerciseStatus(
    ws: WebSocket,
    data: ExerciseStatusMessage["data"]
  ): void {
    const message: ExerciseStatusMessage = {
      type: "exercise_status",
      data
    };
    this.send(ws, message);
  }
  
  private sendError(ws: WebSocket, error: string): void {
    this.send(ws, {
      type: "error",
      data: { message: error }
    });
  }
  
  private send(ws: WebSocket, message: any): void {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }
  
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }
}

