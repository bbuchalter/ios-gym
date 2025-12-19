import express, { Request, Response } from "express";
import * as http from "http";
import * as WebSocket from "ws";
import * as path from "path";
import { loadGrammar, getDefaultGrammarPath } from "../grammar/loader";
import { loadExercises, getDefaultExercisesPath } from "../exercise/loader";
import { SessionManager } from "./session";
import { CLIEngine } from "../cli/engine";
import { WebSocketHandler } from "./websocket";

/**
 * Main server entry point
 */

const PORT = process.env.PORT || 3000;

// Load grammar and exercises
const grammarPath = getDefaultGrammarPath();
const exercisesPath = getDefaultExercisesPath();

console.log("Loading grammar from:", grammarPath);
console.log("Loading exercises from:", exercisesPath);

const grammar = loadGrammar(grammarPath);
const exercises = loadExercises(exercisesPath);

console.log(`Loaded ${Object.keys(grammar.commands).length} command modes`);
console.log(`Loaded ${exercises.exercises.length} exercises`);

// Create Express app
const app = express();
const server = http.createServer(app);

// Create WebSocket server
const wss = new WebSocket.Server({ server });

// Initialize components
const sessionManager = new SessionManager(grammar, exercises);
const cliEngine = new CLIEngine(grammar);
const wsHandler = new WebSocketHandler(wss, sessionManager, cliEngine);

// Serve static files
app.use(express.static(path.join(__dirname, "../../client")));
app.use("/dist/client", express.static(path.join(__dirname, "../client")));

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    sessions: sessionManager.getActiveSessionIds().length
  });
});

// API endpoint to list exercises
app.get("/api/exercises", (req: Request, res: Response) => {
  res.json(exercises.exercises.map(ex => ({
    id: ex.id,
    title: ex.title,
    instructions: ex.instructions
  })));
});

// Start server
server.listen(PORT, () => {
  console.log(`IOS CLI Trainer server running on http://localhost:${PORT}`);
  console.log(`WebSocket endpoint: ws://localhost:${PORT}`);
});

