import { Rating, SentenceItem, SentenceStatus, UserSentenceProgress } from "../types";

export const DEFAULT_EASE_FACTOR = 2.5;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function calculateNextReview(
  existing: UserSentenceProgress | undefined,
  sentenceId: string,
  rating: Rating,
  nowTimestamp: number = Date.now()
): UserSentenceProgress {
  const current: UserSentenceProgress = existing || {
    sentenceId,
    attempts: 0,
    correctCount: 0,
    lastReviewedAt: 0,
    nextReviewAt: 0,
    easeFactor: DEFAULT_EASE_FACTOR,
    intervalDays: 0,
    consecutiveCorrect: 0,
    status: "new",
  };

  const attempts = current.attempts + 1;
  let easeFactor = current.easeFactor;
  let intervalDays = current.intervalDays;
  let consecutiveCorrect = current.consecutiveCorrect;
  let status: SentenceStatus = current.status;
  let correctCount = current.correctCount;

  switch (rating) {
    case "again": {
      // Complete reset of interval, needs rapid re-test
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      intervalDays = 0;
      consecutiveCorrect = 0;
      status = "learning";
      break;
    }
    case "hard": {
      // Small progress or repeat tomorrow
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      intervalDays = Math.max(1, Math.round(intervalDays * 1.1));
      consecutiveCorrect = Math.max(0, consecutiveCorrect);
      status = "learning";
      break;
    }
    case "good": {
      correctCount += 1;
      consecutiveCorrect += 1;
      if (consecutiveCorrect === 1) {
        intervalDays = 1;
      } else if (consecutiveCorrect === 2) {
        intervalDays = 3;
      } else {
        intervalDays = Math.round(intervalDays * easeFactor);
      }
      status = intervalDays >= 7 && consecutiveCorrect >= 3 ? "mastered" : "review";
      break;
    }
    case "easy": {
      correctCount += 1;
      consecutiveCorrect += 1;
      easeFactor = Math.min(3.0, easeFactor + 0.15);
      if (consecutiveCorrect === 1) {
        intervalDays = 3;
      } else if (consecutiveCorrect === 2) {
        intervalDays = 6;
      } else {
        intervalDays = Math.round(intervalDays * easeFactor * 1.3);
      }
      status = intervalDays >= 6 ? "mastered" : "review";
      break;
    }
  }

  // Calculate nextReviewAt in ms
  // If interval is 0, schedule in 10 minutes (or same session)
  const nextReviewOffsetMs = intervalDays === 0 ? 10 * 60 * 1000 : intervalDays * MS_PER_DAY;
  const nextReviewAt = nowTimestamp + nextReviewOffsetMs;

  return {
    sentenceId,
    attempts,
    correctCount,
    lastReviewedAt: nowTimestamp,
    nextReviewAt,
    easeFactor: Math.round(easeFactor * 100) / 100,
    intervalDays,
    consecutiveCorrect,
    status,
    lastRating: rating,
  };
}

export interface DueCategorization {
  overdue: SentenceItem[];
  weak: SentenceItem[];
  dueToday: SentenceItem[];
  allDue: SentenceItem[];
}

export function categorizeDueSentences(
  allSentences: SentenceItem[],
  progressMap: Record<string, UserSentenceProgress>,
  now: number = Date.now()
): DueCategorization {
  const sentenceLookup = new Map<string, SentenceItem>();
  allSentences.forEach((s) => sentenceLookup.set(s.id, s));

  const startOfToday = new Date(now).setHours(0, 0, 0, 0);
  const endOfToday = new Date(now).setHours(23, 59, 59, 999);

  const overdue: SentenceItem[] = [];
  const dueToday: SentenceItem[] = [];
  const weak: SentenceItem[] = [];
  const seenIds = new Set<string>();

  for (const [id, progress] of Object.entries(progressMap)) {
    const sentence = sentenceLookup.get(id);
    if (!sentence) continue;

    const isWeak =
      progress.status === "learning" ||
      progress.lastRating === "again" ||
      (progress.easeFactor < 2.1 && progress.attempts >= 1);

    if (isWeak && !seenIds.has(id)) {
      weak.push(sentence);
      seenIds.add(id);
    }

    if (progress.nextReviewAt < startOfToday && !seenIds.has(id)) {
      overdue.push(sentence);
      seenIds.add(id);
    } else if (
      progress.nextReviewAt >= startOfToday &&
      progress.nextReviewAt <= endOfToday &&
      !seenIds.has(id)
    ) {
      dueToday.push(sentence);
      seenIds.add(id);
    }
  }

  // Priority order for all due: Overdue -> Weak -> Due Today
  const allDue = [...overdue, ...weak, ...dueToday];

  return {
    overdue,
    weak,
    dueToday,
    allDue,
  };
}
