import { AppSettings, Rating, ReviewLog, UserProgress, UserSentenceProgress, FSRSCardData } from "../types";
import { calculateNextReview } from "./srsEngine";
import { SRS_DATA_VERSION, progressToFSRSCard, mapFSRSStateToStatus } from "./fsrsConfig";

const SETTINGS_STORAGE_KEY = "lingo_app_settings_v2";
const PROGRESS_STORAGE_KEY_V3 = "lingo_user_progress_v3";
const PROGRESS_STORAGE_KEY_V2 = "lingo_user_progress_v2";

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

// Clean initial state with SRS_DATA_VERSION = 3
export const INITIAL_PROGRESS: UserProgress = {
  version: SRS_DATA_VERSION,
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

/**
 * Deterministically and idempotently migrates legacy user progress to FSRS.
 * Safe against corrupted input, null values, or missing fields.
 */
export function migrateProgressToFSRS(raw: any): UserProgress {
  if (!raw || typeof raw !== "object") {
    return { ...INITIAL_PROGRESS, ratingCounts: { ...INITIAL_PROGRESS.ratingCounts } };
  }

  const rawSentenceProgress = raw.sentenceProgress || {};
  const migratedSentenceProgress: Record<string, UserSentenceProgress> = {};

  for (const [id, item] of Object.entries(rawSentenceProgress)) {
    if (!item || typeof item !== "object") continue;
    const progressItem = item as any;

    // Check if already fully migrated to FSRS
    if (
      progressItem.fsrs &&
      typeof progressItem.fsrs.due === "number" &&
      typeof progressItem.fsrs.stability === "number" &&
      typeof progressItem.fsrs.difficulty === "number"
    ) {
      migratedSentenceProgress[id] = {
        ...progressItem,
        sentenceId: id,
        stability: progressItem.fsrs.stability,
        difficulty: progressItem.fsrs.difficulty,
        due: progressItem.fsrs.due,
        scheduled_days: progressItem.fsrs.scheduled_days ?? progressItem.intervalDays ?? 0,
        reps: progressItem.fsrs.reps ?? progressItem.attempts ?? 0,
        lapses: progressItem.fsrs.lapses ?? 0,
        state: progressItem.fsrs.state ?? 0,
        last_review: progressItem.fsrs.last_review ?? progressItem.lastReviewedAt,
      };
      continue;
    }

    // Convert legacy SM-2 or partial state to FSRS
    const card = progressToFSRSCard(progressItem);
    const dueMs = card.due.getTime();
    const lastReviewMs = card.last_review ? card.last_review.getTime() : (progressItem.lastReviewedAt || Date.now());
    const scheduledDays = card.scheduled_days || progressItem.intervalDays || 0;
    const reps = card.reps || progressItem.attempts || 1;
    const lapses = card.lapses || Math.max(0, (progressItem.attempts || 0) - (progressItem.correctCount || 0));
    const state = card.state;
    const stability = Math.round(card.stability * 1000) / 1000;
    const difficulty = Math.round(card.difficulty * 1000) / 1000;

    const fsrsData: FSRSCardData = {
      due: dueMs,
      stability,
      difficulty,
      elapsed_days: card.elapsed_days || 0,
      scheduled_days: scheduledDays,
      reps,
      lapses,
      state,
      last_review: lastReviewMs,
    };

    migratedSentenceProgress[id] = {
      sentenceId: id,
      attempts: reps,
      correctCount: progressItem.correctCount || (progressItem.status === "mastered" ? reps : Math.max(0, reps - lapses)),
      lastReviewedAt: lastReviewMs,
      nextReviewAt: dueMs,
      easeFactor: progressItem.easeFactor || 2.5,
      intervalDays: scheduledDays,
      consecutiveCorrect: progressItem.consecutiveCorrect || (lapses === 0 ? reps : 1),
      status: mapFSRSStateToStatus(state, scheduledDays, reps),
      lastRating: progressItem.lastRating || "good",
      stability,
      difficulty,
      due: dueMs,
      scheduled_days: scheduledDays,
      reps,
      lapses,
      state,
      last_review: lastReviewMs,
      fsrs: fsrsData,
    };
  }

  return {
    version: SRS_DATA_VERSION,
    totalPracticed: typeof raw.totalPracticed === "number" ? raw.totalPracticed : 0,
    ratingCounts: {
      again: raw.ratingCounts?.again || 0,
      hard: raw.ratingCounts?.hard || 0,
      good: raw.ratingCounts?.good || 0,
      easy: raw.ratingCounts?.easy || 0,
    },
    streakDays: typeof raw.streakDays === "number" ? raw.streakDays : 0,
    longestStreak: typeof raw.longestStreak === "number" ? raw.longestStreak : 0,
    lastActiveDate: raw.lastActiveDate || "",
    todayCount: typeof raw.todayCount === "number" ? raw.todayCount : 0,
    todayDate: raw.todayDate || "",
    sentenceProgress: migratedSentenceProgress,
    history: Array.isArray(raw.history) ? raw.history : [],
  };
}

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
      // 1. Try to load v3 (FSRS) progress
      const rawV3 = localStorage.getItem(PROGRESS_STORAGE_KEY_V3);
      if (rawV3) {
        const parsed = JSON.parse(rawV3);
        // Check if migration or validation is required
        if (parsed.version !== SRS_DATA_VERSION || !parsed.sentenceProgress) {
          const migrated = migrateProgressToFSRS(parsed);
          this.saveProgress(migrated);
          return migrated;
        }
        return parsed;
      }

      // 2. Check for legacy v2 progress to migrate safely
      const rawV2 = localStorage.getItem(PROGRESS_STORAGE_KEY_V2);
      if (rawV2) {
        const parsedV2 = JSON.parse(rawV2);
        const migrated = migrateProgressToFSRS(parsedV2);
        // Save to v3 storage immediately
        this.saveProgress(migrated);
        return migrated;
      }

      // 3. New user - initialize clean FSRS progress
      this.saveProgress(INITIAL_PROGRESS);
      return INITIAL_PROGRESS;
    } catch (e) {
      console.error("StorageService: error reading progress, using fallback", e);
      return INITIAL_PROGRESS;
    }
  }

  saveProgress(progress: UserProgress): void {
    if (typeof window === "undefined") return;
    try {
      const payload: UserProgress = {
        ...progress,
        version: SRS_DATA_VERSION,
      };
      localStorage.setItem(PROGRESS_STORAGE_KEY_V3, JSON.stringify(payload));
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
      todayCount += 1;
    } else {
      todayCount = 1;
      if (!current.lastActiveDate) {
        streak = 1;
      } else {
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        if (current.lastActiveDate === yesterdayStr) {
          streak += 1;
        } else {
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

    // Calculate next review state using FSRS
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
      version: SRS_DATA_VERSION,
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
      version: SRS_DATA_VERSION,
      exportDate: new Date().toISOString(),
      settings: this.getSettings(),
      progress: this.getProgress(),
    };
    return JSON.stringify(data, null, 2);
  }

  importData(jsonString: string): { success: boolean; error?: string } {
    try {
      const parsed = JSON.parse(jsonString);

      if (!parsed || typeof parsed !== "object") {
        return { success: false, error: "Invalid backup file: not a JSON object" };
      }

      if (parsed.settings) {
        this.saveSettings({ ...DEFAULT_SETTINGS, ...parsed.settings });
      }

      if (parsed.progress) {
        const migrated = migrateProgressToFSRS(parsed.progress);
        this.saveProgress(migrated);
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

    // Seed realistic FSRS demo data
    const p1 = calculateNextReview(undefined, "sent-b1-001", "good", now - 86400000 * 3);
    const p1Next = calculateNextReview(p1, "sent-b1-001", "good", now - 86400000);

    const p2 = calculateNextReview(undefined, "sent-b1-002", "good", now - 86400000);
    const p2Next = calculateNextReview(p2, "sent-b1-002", "again", now - 600000); // Lapsed, due

    const p3 = calculateNextReview(undefined, "sent-b1-003", "hard", now - 86400000 * 2);

    const demoProgress: UserProgress = {
      version: SRS_DATA_VERSION,
      totalPracticed: 24,
      ratingCounts: { again: 3, hard: 5, good: 12, easy: 4 },
      streakDays: 4,
      longestStreak: 7,
      lastActiveDate: today,
      todayCount: 6,
      todayDate: today,
      sentenceProgress: {
        "sent-b1-001": p1Next,
        "sent-b1-002": p2Next,
        "sent-b1-003": p3,
      },
      history: [],
    };
    this.saveProgress(demoProgress);
  }
}

export const storageService = new LocalStorageService();
