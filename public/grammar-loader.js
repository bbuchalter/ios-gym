// Browser-compatible grammar loader (loads from JSON)
export async function loadGrammar() {
    const response = await fetch("/commands.json");
    return await response.json();
}
export async function loadExercises() {
    const response = await fetch("/exercises.json");
    return await response.json();
}
