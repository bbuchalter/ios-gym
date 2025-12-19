import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
import { ExerciseData } from "../types";

/**
 * Load and parse the exercises.yaml file
 */
export function loadExercises(filePath: string): ExerciseData {
  const content = fs.readFileSync(filePath, "utf8");
  const exercises = yaml.load(content) as ExerciseData;
  return exercises;
}

/**
 * Get the default exercises path
 */
export function getDefaultExercisesPath(): string {
  return path.join(process.cwd(), "exercises.yaml");
}

