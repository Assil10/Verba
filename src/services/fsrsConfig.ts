import {
  fsrs,
  generatorParameters,
  Rating as FSRSRating,
  Grade,
  State as FSRSState,
  createEmptyCard,
  fixDate,
  Card,
  FSRSParameters,
} from "ts-fsrs";
import { Rating, SentenceStatus, UserSentenceProgress } from "../types";

/**
 * Storage version identifier for FSRS data migrations.
 */
export const SRS_DATA_VERSION = 3;

/**
 * Centralized FSRS algorithm configuration.
 * - Desired retention: 90% (0.90) - standard cognitive optimum for language acquisition.
 * - Maximum interval: 36,500 days (~100 years).
 * - Short term learning steps: 1 minute, 10 minutes.
 * - Relearning steps on lapse: 10 minutes.
 * - Fuzzing disabled by default for predictable, testable scheduling.
 */
export const FSRS_DEFAULT_CONFIG: Partial<FSRSParameters> = {
  request_retention: 0.9,
  maximum_interval: 36500,
  enable_fuzz: false,
  enable_short_term: true,
  learning_steps: ["1m", "10m"],
  relearning_steps: ["10m"],
};

// Singleton instance of the FSRS scheduler
let fsrsInstance = fsrs(generatorParameters(FSRS_DEFAULT_CONFIG));

/**
 * Get or reinitialize the configured FSRS scheduler instance.
 */
export function getFSRS() {
  if (!fsrsInstance) {
    fsrsInstance = fsrs(generatorParameters(FSRS_DEFAULT_CONFIG));
  }
  return fsrsInstance;
}

/**
 * Map user rating string to official FSRS Grade (1..4).
 */
export function mapUserRatingToFSRS(rating: Rating): Grade {
  switch (rating) {
    case "again":
      return FSRSRating.Again as Grade; // 1
    case "hard":
      return FSRSRating.Hard as Grade; // 2
    case "good":
      return FSRSRating.Good as Grade; // 3
    case "easy":
      return FSRSRating.Easy as Grade; // 4
    default:
      return FSRSRating.Good as Grade;
  }
}

/**
 * Map FSRS state integer to user-facing SentenceStatus.
 */
export function mapFSRSStateToStatus(state: number, scheduledDays: number, reps: number): SentenceStatus {
  switch (state) {
    case FSRSState.New:
      return "new";
    case FSRSState.Learning:
      return "learning";
    case FSRSState.Review:
      // A card is classified as "mastered" when scheduled for 21+ days with 3+ successful reps
      return scheduledDays >= 21 || reps >= 4 ? "mastered" : "review";
    case FSRSState.Relearning:
      return "relearning";
    default:
      return "learning";
  }
}

/**
 * Format a future timestamp or Date into human-readable compact interval string.
 * Examples: "<1m", "5m", "10m", "1d", "3d", "14d", "2mo", "1.2y"
 */
export function formatFSRSInterval(target: Date | number, from: Date | number = Date.now()): string {
  const targetMs = typeof target === "number" ? target : target.getTime();
  const fromMs = typeof from === "number" ? from : from.getTime();
  const diffMs = Math.max(0, targetMs - fromMs);

  if (diffMs < 60 * 1000) {
    return "<1m";
  }
  if (diffMs < 60 * 60 * 1000) {
    const mins = Math.max(1, Math.round(diffMs / (60 * 1000)));
    return `${mins}m`;
  }
  if (diffMs < 24 * 60 * 60 * 1000) {
    const hours = Math.max(1, Math.round(diffMs / (60 * 60 * 1000)));
    return `${hours}h`;
  }
  if (diffMs < 30 * 24 * 60 * 60 * 1000) {
    const days = Math.max(1, Math.round(diffMs / (24 * 60 * 60 * 1000)));
    return `${days}d`;
  }
  if (diffMs < 365 * 24 * 60 * 60 * 1000) {
    const months = Math.max(1, Math.round(diffMs / (30.44 * 24 * 60 * 60 * 1000)));
    return `${months}mo`;
  }
  const years = (diffMs / (365.25 * 24 * 60 * 60 * 1000)).toFixed(1);
  return `${years}y`;
}

/**
 * Convert a stored UserSentenceProgress into a validated ts-fsrs Card object.
 */
export function progressToFSRSCard(progress: UserSentenceProgress | undefined, now: number = Date.now()): Card {
  if (!progress) {
    return createEmptyCard(new Date(now));
  }

  // If native FSRS fields exist
  if (progress.fsrs) {
    return {
      due: fixDate(new Date(progress.fsrs.due)),
      stability: progress.fsrs.stability,
      difficulty: progress.fsrs.difficulty,
      elapsed_days: progress.fsrs.elapsed_days || 0,
      scheduled_days: progress.fsrs.scheduled_days || 0,
      reps: progress.fsrs.reps || 0,
      lapses: progress.fsrs.lapses || 0,
      learning_steps: 0,
      state: progress.fsrs.state as FSRSState,
      last_review: progress.fsrs.last_review ? fixDate(new Date(progress.fsrs.last_review)) : undefined,
    };
  }

  if (typeof progress.stability === "number" && typeof progress.difficulty === "number" && progress.due) {
    return {
      due: fixDate(new Date(progress.due)),
      stability: progress.stability,
      difficulty: progress.difficulty,
      elapsed_days: 0,
      scheduled_days: progress.scheduled_days || progress.intervalDays || 0,
      reps: progress.reps || progress.attempts || 0,
      lapses: progress.lapses || 0,
      learning_steps: 0,
      state: (progress.state ?? (progress.status === "new" ? FSRSState.New : FSRSState.Learning)) as FSRSState,
      last_review: progress.last_review ? fixDate(new Date(progress.last_review)) : undefined,
    };
  }

  // Migration fallback from legacy SM-2 record
  const isReviewed = (progress.attempts || 0) > 0;
  if (!isReviewed) {
    return createEmptyCard(new Date(now));
  }

  const intervalDays = Math.max(0, progress.intervalDays || 0);
  const attempts = Math.max(1, progress.attempts || 1);
  const correct = Math.max(0, progress.correctCount || 0);
  const lapses = Math.max(0, attempts - correct);
  const ease = progress.easeFactor || 2.5;

  // Approximate difficulty (1..10) inversely proportional to ease factor (1.3..3.0)
  const clampedEase = Math.max(1.3, Math.min(3.0, ease));
  const normalizedDifficulty = 10 - ((clampedEase - 1.3) / 1.7) * 9;
  const difficulty = Math.max(1, Math.min(10, Math.round(normalizedDifficulty * 10) / 10));

  // Stability proportional to interval
  const stability = Math.max(0.5, intervalDays > 0 ? intervalDays : 1.0);

  let state = FSRSState.Learning;
  if (progress.status === "mastered" || progress.status === "review" || intervalDays >= 1) {
    state = FSRSState.Review;
  } else if (lapses > 0) {
    state = FSRSState.Relearning;
  }

  return {
    due: fixDate(new Date(progress.nextReviewAt || now)),
    stability,
    difficulty,
    elapsed_days: 0,
    scheduled_days: intervalDays,
    reps: attempts,
    lapses,
    learning_steps: 0,
    state,
    last_review: progress.lastReviewedAt ? fixDate(new Date(progress.lastReviewedAt)) : undefined,
  };
}

export interface FSRSIntervalsPreview {
  again: string;
  hard: string;
  good: string;
  easy: string;
}

/**
 * Preview the scheduled next intervals for all 4 ratings using FSRS repeat().
 */
export function getFSRSIntervalsPreview(
  progress: UserSentenceProgress | undefined,
  nowMs: number = Date.now()
): FSRSIntervalsPreview {
  const f = getFSRS();
  const card = progressToFSRSCard(progress, nowMs);
  const nowDate = new Date(nowMs);

  try {
    const repeats = f.repeat(card, nowDate);
    return {
      again: formatFSRSInterval(repeats[FSRSRating.Again].card.due, nowDate),
      hard: formatFSRSInterval(repeats[FSRSRating.Hard].card.due, nowDate),
      good: formatFSRSInterval(repeats[FSRSRating.Good].card.due, nowDate),
      easy: formatFSRSInterval(repeats[FSRSRating.Easy].card.due, nowDate),
    };
  } catch {
    // Safe fallback if card has invalid date
    return {
      again: "<1m",
      hard: "5m",
      good: "10m",
      easy: "8d",
    };
  }
}
