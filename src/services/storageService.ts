import { AppSettings, Rating, ReviewLog, UserProgress, UserSentenceProgress } from "../types";
import { calculateNextReview } from "./srsEngine";

const SETTINGS_STORAGE_KEY = "lingo_app_settings_v2";
const PROGRESS_STORAGE_KEY = "lingo_user_progress_v2";

export const DEFAULT_SETTINGS: AppSettings = {
  direction: "en-de",
  level: "B1",
  topic: "all",
  typingMode: false,
  themeMode: "dark",
  audioSpeed: 0.95,
  autoSpeak: true,
  dailyGoal: 20,
};

// Clean initial slate: 0 sentences practiced, 0 streak, 0 reviews
export const INITIAL_PROGRESS: UserProgress = {
  totalPracticed: 0,
  ratingCounts: {
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
  },
  streakDays: 0,
  longestStreak: 0,
  lastActiveDate: "",
  todayCount: 0,
  todayDate: "",
  sentenceProgress: {},
  history: [],
};

export interface IStorageService {
  getSettings(): AppSettings;
  saveSettings(settings: AppSettings): void;
  getProgress(): UserProgress;
  saveProgress(progress: UserProgress): void;
  recordReview(
    sentenceId: string,
    rating: Rating,
    direction: string,
    timeSpentMs: number,
    typedAnswer?: string,
    isCorrect?: boolean
  ): UserProgress;
  exportData(): string;
  importData(jsonString: string): { success: boolean; error?: string };
  resetProgress(): void;
  loadDemoData(): void;
}

class LocalStorageService implements IStorageService {
  getSettings(): AppSettings {
    if (typeof window === "undefined") return DEFAULT_SETTINGS;
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!raw) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  saveSettings(settings: AppSettings): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      document.documentElement.setAttribute("data-theme", settings.themeMode);
    } catch (e) {
      console.error("StorageService: failed to save settings", e);
    }
  }

  getProgress(): UserProgress {
    if (typeof window === "undefined") return INITIAL_PROGRESS;
    try {
      const raw = localStorage.getItem(PROGRESS_STORAGE_KEY);
      if (!raw) {
        this.saveProgress(INITIAL_PROGRESS);
        return INITIAL_PROGRESS;
      }
      const parsed = JSON.parse(raw);
      // Ensure all fields exist
      return {
        ...INITIAL_PROGRESS,
        ...parsed,
        ratingCounts: { ...INITIAL_PROGRESS.ratingCounts, ...(parsed.ratingCounts || {}) },
        sentenceProgress: parsed.sentenceProgress || {},
        history: Array.isArray(parsed.history) ? parsed.history : [],
      };
    } catch {
      return INITIAL_PROGRESS;
    }
  }

  saveProgress(progress: UserProgress): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error("StorageService: failed to save progress", e);
    }
  }

  recordReview(
    sentenceId: string,
    rating: Rating,
    direction: string,
    timeSpentMs: number,
    typedAnswer?: string,
    isCorrect?: boolean
  ): UserProgress {
    const current = this.getProgress();
    const now = Date.now();
    const today = new Date(now).toISOString().split("T")[0];

    // Real streak calculation
    let streak = current.streakDays;
    let longestStreak = current.longestStreak || current.streakDays;
    let todayCount = current.todayCount;

    if (current.todayDate === today) {
      // Practicing more on the same day
      todayCount += 1;
    } else {
      // New calendar day
      todayCount = 1;
      if (!current.lastActiveDate) {
        // First practice ever
        streak = 1;
      } else {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        if (current.lastActiveDate === yesterdayStr) {
          // Practiced yesterday! Streak increases
          streak += 1;
        } else {
          // Missed one or more days -> streak resets to 1
          streak = 1;
        }
      }
    }

    if (streak > longestStreak) {
      longestStreak = streak;
    }

    // Update rating counts
    const newRatingCounts = {
      ...current.ratingCounts,
      [rating]: (current.ratingCounts[rating] || 0) + 1,
    };

    // Update Spaced Repetition (SRS) state for this sentence
    const existingSentenceProgress = current.sentenceProgress[sentenceId];
    const updatedSentenceProgress = calculateNextReview(
      existingSentenceProgress,
      sentenceId,
      rating,
      now
    );

    const newSentenceProgressMap = {
      ...current.sentenceProgress,
      [sentenceId]: updatedSentenceProgress,
    };

    const newLog: ReviewLog = {
      sentenceId,
      timestamp: now,
      rating,
      direction: direction as any,
      timeSpentMs,
      typedAnswer,
      isCorrect,
    };

    const updated: UserProgress = {
      totalPracticed: current.totalPracticed + 1,
      ratingCounts: newRatingCounts,
      streakDays: streak,
      longestStreak,
      lastActiveDate: today,
      todayCount,
      todayDate: today,
      sentenceProgress: newSentenceProgressMap,
      history: [newLog, ...current.history.slice(0, 499)], // keep last 500 reviews
    };

    this.saveProgress(updated);
    return updated;
  }

  exportData(): string {
    const data = {
      version: 2,
      exportDate: new Date().toISOString(),
      settings: this.getSettings(),
      progress: this.getProgress(),
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonString: string): { success: boolean; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);

      // Validate schema
      if (!parsed || typeof parsed !== "object") {
        return { success: false, error: "Invalid backup file: not a JSON object" };
      }

      if (parsed.settings) {
        this.saveSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
      }

      if (parsed.progress) {
        const p = parsed.progress;
        if (typeof p.totalPracticed !== "number" || typeof p.streakDays !== "number") {
          return { success: false, error: "Corrupted progress schema" };
        }
        this.saveProgress({
          ...INITIAL_PROGRESS,
          ...p,
          ratingCounts: { ...INITIAL_PROGRESS.ratingCounts, ...(p.ratingCounts || {}) },
          sentenceProgress: p.sentenceProgress || {},
          history: Array.isArray(p.history) ? p.history : [],
        });
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e?.message || "Failed to parse backup JSON" };
    }
  }

  resetProgress(): void {
    this.saveProgress(INITIAL_PROGRESS);
  }

  loadDemoData(): void {
    const now = Date.now();
    const today = new Date(now).toISOString().split("T")[0];
    const demoProgress: UserProgress = {
      totalPracticed: 24,
      ratingCounts: { again: 3, hard: 5, good: 12, easy: 4 },
      streakDays: 4,
      longestStreak: 7,
      lastActiveDate: today,
      todayCount: 6,
      todayDate: today,
      sentenceProgress: {
        "sent-b1-001": {
          sentenceId: "sent-b1-001",
          attempts: 3,
          correctCount: 3,
          lastReviewedAt: now - 86400000,
          nextReviewAt: now + 3 * 86400000,
          easeFactor: 2.6,
          intervalDays: 3,
          consecutiveCorrect: 2,
          status: "review",
          lastRating: "good",
        },
        "sent-b1-002": {
          sentenceId: "sent-b1-002",
          attempts: 2,
          correctCount: 0,
          lastReviewedAt: now - 120000,
          nextReviewAt: now - 60000, // Due / weak
          easeFactor: 1.9,
          intervalDays: 0,
          consecutiveCorrect: 0,
          status: "learning",
          lastRating: "again",
        },
        "sent-b1-003": {
          sentenceId: "sent-b1-003",
          attempts: 2,
          correctCount: 1,
          lastReviewedAt: now - 86400000 * 2,
          nextReviewAt: now - 86400000, // Overdue
          easeFactor: 2.35,
          intervalDays: 1,
          consecutiveCorrect: 1,
          status: "learning",
          lastRating: "hard",
        },
      },
      history: [],
    };
    this.saveProgress(demoProgress);
  }
}

export const storageService = new LocalStorageService();
