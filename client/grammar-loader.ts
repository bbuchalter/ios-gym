// Browser-compatible grammar loader (loads from JSON)

import { CommandGrammar, ExerciseData } from "../src/types";

export async function loadGrammar(): Promise<CommandGrammar> {
  const response = await fetch("/commands.json");
  return await response.json();
}

export async function loadExercises(): Promise<ExerciseData> {
  const response = await fetch("/exercises.json");
  return await response.json();
}

