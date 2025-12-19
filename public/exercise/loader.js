import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";
/**
 * Load and parse the exercises.yaml file
 */
export function loadExercises(filePath) {
    const content = fs.readFileSync(filePath, "utf8");
    const exercises = yaml.load(content);
    return exercises;
}
/**
 * Get the default exercises path
 */
export function getDefaultExercisesPath() {
    return path.join(process.cwd(), "exercises.yaml");
}
