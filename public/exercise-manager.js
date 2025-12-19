// Exercise management for side panel
export class ExerciseManager {
    constructor() {
        this.exercises = [];
        this.currentExerciseId = null;
    }
    async loadExercises() {
        try {
            const response = await fetch("/api/exercises");
            this.exercises = await response.json();
            this.render();
        }
        catch (error) {
            console.error("Failed to load exercises:", error);
            this.showError("Failed to load exercises");
        }
    }
    onExerciseLoad(callback) {
        this.onExerciseLoadCallback = callback;
    }
    setCurrentExercise(exerciseId) {
        this.currentExerciseId = exerciseId;
        this.render();
        this.showExerciseDetails(exerciseId);
    }
    updateStatus(data) {
        const statusEl = document.getElementById("exercise-status");
        const hintsList = document.getElementById("hints-list");
        if (statusEl) {
            if (data.passed) {
                statusEl.innerHTML = '<p class="passed">✓ Exercise Complete!</p>';
                statusEl.className = "passed";
            }
            else {
                const unmet = data.unmetRequirements || [];
                statusEl.innerHTML = `<p class="incomplete">Incomplete (${unmet.length} requirements remaining)</p>`;
                statusEl.className = "incomplete";
            }
        }
        if (hintsList) {
            hintsList.innerHTML = "";
            for (const hint of data.hints || []) {
                const li = document.createElement("li");
                li.textContent = hint;
                hintsList.appendChild(li);
            }
        }
    }
    getExercises() {
        return [...this.exercises];
    }
    getCurrentExerciseId() {
        return this.currentExerciseId;
    }
    render() {
        const listEl = document.getElementById("exercise-list");
        if (!listEl)
            return;
        listEl.innerHTML = "";
        if (this.exercises.length === 0) {
            listEl.innerHTML = '<p class="placeholder">Loading exercises...</p>';
            return;
        }
        for (const exercise of this.exercises) {
            const item = document.createElement("div");
            item.className = "exercise-item";
            if (exercise.id === this.currentExerciseId) {
                item.classList.add("active");
            }
            item.innerHTML = `
        <div class="exercise-title">${this.escapeHtml(exercise.title)}</div>
        <div class="exercise-id">${this.escapeHtml(exercise.id)}</div>
      `;
            item.addEventListener("click", () => {
                this.handleExerciseClick(exercise.id);
            });
            listEl.appendChild(item);
        }
    }
    handleExerciseClick(exerciseId) {
        const exercise = this.exercises.find(ex => ex.id === exerciseId);
        if (!exercise)
            return;
        this.currentExerciseId = exerciseId;
        this.render();
        this.showExerciseDetails(exerciseId);
        // Notify callback
        if (this.onExerciseLoadCallback) {
            this.onExerciseLoadCallback(exerciseId);
        }
    }
    showExerciseDetails(exerciseId) {
        const exercise = this.exercises.find(ex => ex.id === exerciseId);
        if (!exercise)
            return;
        // Show current exercise panel
        const currentExerciseEl = document.getElementById("current-exercise");
        if (currentExerciseEl) {
            currentExerciseEl.style.display = "block";
        }
        // Update exercise info
        const infoEl = document.getElementById("exercise-info");
        if (infoEl) {
            infoEl.innerHTML = `<p><strong>${this.escapeHtml(exercise.title)}</strong></p>`;
        }
        // Update instructions
        const instructionsEl = document.getElementById("exercise-instructions");
        if (instructionsEl) {
            instructionsEl.textContent = exercise.instructions;
        }
        // Reset status
        const statusEl = document.getElementById("exercise-status");
        if (statusEl) {
            statusEl.innerHTML = '<p class="incomplete">Not started</p>';
            statusEl.className = "incomplete";
        }
        // Clear hints
        const hintsList = document.getElementById("hints-list");
        if (hintsList) {
            hintsList.innerHTML = "";
        }
    }
    showError(message) {
        const listEl = document.getElementById("exercise-list");
        if (listEl) {
            listEl.innerHTML = `<p class="error">${this.escapeHtml(message)}</p>`;
        }
    }
    escapeHtml(text) {
        const div = document.createElement("div");
        div.textContent = text;
        return div.innerHTML;
    }
}
