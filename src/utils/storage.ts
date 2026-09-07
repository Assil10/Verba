import { AppSettings, Rating, UserProgress } from "../types";
import { storageService, DEFAULT_SETTINGS, INITIAL_PROGRESS } from "../services/storageService";

export { DEFAULT_SETTINGS, INITIAL_PROGRESS };

export function loadSettings(): AppSettings {
  return storageService.getSettings();
}

export function saveSettings(settings: AppSettings): void {
  storageService.saveSettings(settings);
}

export function loadProgress(): UserProgress {
  return storageService.getProgress();
}

export function saveProgress(progress: UserProgress): void {
  storageService.saveProgress(progress);
}

export function recordReview(
  sentenceId: string,
  rating: Rating,
  direction: string,
  timeSpentMs: number,
  typedAnswer?: string,
  isCorrect?: boolean
): UserProgress {
  return storageService.recordReview(sentenceId, rating, direction, timeSpentMs, typedAnswer, isCorrect);
}
