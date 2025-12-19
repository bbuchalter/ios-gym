// Exercise management for side panel

import { Exercise } from "../src/types";

export class ExerciseManager {
  private exercises: Exercise[] = [];
  private currentExerciseId: string | null = null;
  private completedExercises: Set<string> = new Set();
  private onExerciseLoadCallback?: (exerciseId: string) => void;
  
  constructor() {
    this.loadProgress();
  }
  
  public async loadExercises(): Promise<void> {
    try {
      const response = await fetch("/api/exercises");
      this.exercises = await response.json();
      this.render();
    } catch (error) {
      console.error("Failed to load exercises:", error);
      this.showError("Failed to load exercises");
    }
  }
  
  public onExerciseLoad(callback: (exerciseId: string) => void): void {
    this.onExerciseLoadCallback = callback;
  }
  
  public setCurrentExercise(exerciseId: string): void {
    this.currentExerciseId = exerciseId;
    this.render();
    this.showExerciseDetails(exerciseId);
  }
  
  public updateStatus(data: {
    passed: boolean;
    unmetRequirements: any[];
    hints: string[];
  }): void {
    const statusEl = document.getElementById("exercise-status");
    const hintsList = document.getElementById("hints-list");
    
    if (statusEl) {
      if (data.passed) {
        statusEl.innerHTML = '<p class="passed">🎉 Exercise Complete! Great job!</p>';
        statusEl.className = "passed celebration";
        
        // Mark as completed
        if (this.currentExerciseId && !this.completedExercises.has(this.currentExerciseId)) {
          this.completedExercises.add(this.currentExerciseId);
          this.saveProgress();
          this.updateProgressUI();
          this.render(); // Re-render to show checkmark
        }
      } else {
        const unmet = data.unmetRequirements || [];
        statusEl.innerHTML = `<p class="incomplete">In Progress (${unmet.length} requirements remaining)</p>`;
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
  
  public getExercises(): Exercise[] {
    return [...this.exercises];
  }
  
  public getCurrentExerciseId(): string | null {
    return this.currentExerciseId;
  }
  
  private render(): void {
    const listEl = document.getElementById("exercise-list");
    if (!listEl) return;
    
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
      if (this.completedExercises.has(exercise.id)) {
        item.classList.add("completed");
      }
      
      // Extract level from title (e.g., "🌟 Level 1.1:")
      const levelMatch = exercise.title.match(/Level\s+(\d+)/i);
      const level = levelMatch ? parseInt(levelMatch[1]) : 1;
      
      let difficultyClass = "difficulty-easy";
      if (level >= 5) difficultyClass = "difficulty-hard";
      else if (level >= 3) difficultyClass = "difficulty-medium";
      
      item.innerHTML = `
        <div>
          <span class="level-tag ${difficultyClass}">Level ${level}</span>
          <span class="exercise-title">${this.escapeHtml(exercise.title)}</span>
        </div>
        <div class="exercise-id">${this.escapeHtml(exercise.id)}</div>
      `;
      
      item.addEventListener("click", () => {
        this.handleExerciseClick(exercise.id);
      });
      
      listEl.appendChild(item);
    }
    
    this.updateProgressUI();
  }
  
  private handleExerciseClick(exerciseId: string): void {
    const exercise = this.exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;
    
    this.currentExerciseId = exerciseId;
    this.render();
    this.showExerciseDetails(exerciseId);
    
    // Notify callback
    if (this.onExerciseLoadCallback) {
      this.onExerciseLoadCallback(exerciseId);
    }
  }
  
  private showExerciseDetails(exerciseId: string): void {
    const exercise = this.exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;
    
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
  
  private showError(message: string): void {
    const listEl = document.getElementById("exercise-list");
    if (listEl) {
      listEl.innerHTML = `<p class="error">${this.escapeHtml(message)}</p>`;
    }
  }
  
  private escapeHtml(text: string): string {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }
  
  private loadProgress(): void {
    try {
      const saved = localStorage.getItem("exerciseProgress");
      if (saved) {
        const data = JSON.parse(saved);
        this.completedExercises = new Set(data.completed || []);
      }
    } catch (e) {
      console.error("Failed to load progress:", e);
    }
  }
  
  private saveProgress(): void {
    try {
      localStorage.setItem("exerciseProgress", JSON.stringify({
        completed: Array.from(this.completedExercises),
        lastUpdated: new Date().toISOString()
      }));
    } catch (e) {
      console.error("Failed to save progress:", e);
    }
  }
  
  private updateProgressUI(): void {
    const total = this.exercises.length;
    const completed = this.completedExercises.size;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    // Update progress bar
    const progressBar = document.getElementById("progress-bar");
    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
      progressBar.textContent = `${percentage}%`;
    }
    
    // Update completed count
    const completedCount = document.getElementById("completed-count");
    if (completedCount) {
      completedCount.textContent = `${completed} of ${total} completed`;
    }
    
    // Update level
    const currentLevel = document.getElementById("current-level");
    if (currentLevel) {
      let level = 1;
      if (completed >= 9) level = 6;
      else if (completed >= 7) level = 5;
      else if (completed >= 5) level = 4;
      else if (completed >= 4) level = 3;
      else if (completed >= 2) level = 2;
      currentLevel.textContent = `Level ${level}`;
    }
    
    // Update achievements
    this.updateAchievements(completed);
  }
  
  private updateAchievements(completed: number): void {
    const achievements = document.getElementById("achievements");
    if (!achievements) return;
    
    const badges = [
      { count: 1, emoji: "🏆", text: "First Steps", title: "Complete your first exercise" },
      { count: 3, emoji: "⭐", text: "Getting Started", title: "Complete 3 exercises" },
      { count: 9, emoji: "🎓", text: "Master", title: "Complete all exercises" }
    ];
    
    achievements.innerHTML = badges.map(badge => {
      const unlocked = completed >= badge.count;
      const className = unlocked ? "badge" : "badge locked";
      return `<span class="${className}" title="${badge.title}">${badge.emoji} ${badge.text}</span>`;
    }).join("");
  }
}

