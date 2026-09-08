import { Rating, SentenceItem, SentenceStatus, UserSentenceProgress, FSRSCardData } from "../types";
import {
  getFSRS,
  mapUserRatingToFSRS,
  mapFSRSStateToStatus,
  progressToFSRSCard,
  getFSRSIntervalsPreview,
  formatFSRSInterval,
} from "./fsrsConfig";
import { State as FSRSState } from "ts-fsrs";

export { getFSRSIntervalsPreview, formatFSRSInterval };

/**
 * Calculates the next review schedule for a sentence using FSRS.
 *
 * @param existing The previous UserSentenceProgress, if any
 * @param sentenceId ID of the sentence being reviewed
 * @param rating User rating ("again", "hard", "good", "easy")
 * @param nowTimestamp Current review timestamp (defaults to Date.now())
 */
export function calculateNextReview(
  existing: UserSentenceProgress | undefined,
  sentenceId: string,
  rating: Rating,
  nowTimestamp: number = Date.now()
): UserSentenceProgress {
  const f = getFSRS();
  const fsrsRating = mapUserRatingToFSRS(rating);
  const card = progressToFSRSCard(existing, nowTimestamp);
  const nowDate = new Date(nowTimestamp);

  // Execute FSRS next transition
  const record = f.next(card, nowDate, fsrsRating);
  const updatedCard = record.card;

  const dueMs = updatedCard.due.getTime();
  const lastReviewMs = updatedCard.last_review ? updatedCard.last_review.getTime() : nowTimestamp;
  const scheduledDays = updatedCard.scheduled_days;
  const stability = Math.round(updatedCard.stability * 1000) / 1000;
  const difficulty = Math.round(updatedCard.difficulty * 1000) / 1000;
  const reps = updatedCard.reps;
  const lapses = updatedCard.lapses;
  const state = updatedCard.state;

  const status: SentenceStatus = mapFSRSStateToStatus(state, scheduledDays, reps);
  const correctCount = (existing?.correctCount || 0) + (rating === "good" || rating === "easy" ? 1 : 0);
  const consecutiveCorrect = rating === "again" ? 0 : (existing?.consecutiveCorrect || 0) + 1;

  // Approximate legacy easeFactor for backwards compatibility
  const easeFactor = Math.round(Math.max(1.3, Math.min(3.0, 10.0 - difficulty * 0.8)) * 100) / 100;

  const fsrsData: FSRSCardData = {
    due: dueMs,
    stability,
    difficulty,
    elapsed_days: updatedCard.elapsed_days,
    scheduled_days: scheduledDays,
    reps,
    lapses,
    state,
    last_review: lastReviewMs,
  };

  return {
    sentenceId,
    attempts: reps,
    correctCount,
    lastReviewedAt: lastReviewMs,
    nextReviewAt: dueMs,
    easeFactor,
    intervalDays: scheduledDays,
    consecutiveCorrect,
    status,
    lastRating: rating,

    // Native FSRS fields
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

export interface DueCategorization {
  overdue: SentenceItem[];
  weak: SentenceItem[];
  dueToday: SentenceItem[];
  allDue: SentenceItem[];
}

/**
 * Categorizes all sentences based on their FSRS due dates and recall status.
 *
 * @param allSentences Entire sentence repository
 * @param progressMap Map of sentence ID to UserSentenceProgress
 * @param now Current timestamp in ms
 */
export function categorizeDueSentences(
  allSentences: SentenceItem[],
  progressMap: Record<string, UserSentenceProgress>,
  now: number = Date.now()
): DueCategorization {
  const sentenceLookup = new Map<string, SentenceItem>();
  allSentences.forEach((s) => sentenceLookup.set(s.id, s));

  const startOfToday = new Date(now).setHours(0, 0, 0, 0);

  const overdue: SentenceItem[] = [];
  const dueToday: SentenceItem[] = [];
  const weak: SentenceItem[] = [];
  const seenIds = new Set<string>();

  // Process all cards that have progress
  for (const [id, progress] of Object.entries(progressMap)) {
    const sentence = sentenceLookup.get(id);
    if (!sentence) continue;

    // Use FSRS due date or legacy nextReviewAt
    const dueTime = progress.fsrs?.due ?? progress.due ?? progress.nextReviewAt ?? 0;

    // Only cards whose due time has arrived (due <= now) are ready for active review
    if (dueTime <= now && dueTime > 0) {
      const isWeak =
        progress.status === "learning" ||
        progress.status === "relearning" ||
        progress.state === FSRSState.Relearning ||
        progress.state === FSRSState.Learning ||
        progress.lastRating === "again" ||
        (progress.difficulty !== undefined && progress.difficulty >= 7.5) ||
        (progress.lapses !== undefined && progress.lapses > 0 && progress.consecutiveCorrect === 0);

      if (isWeak && !seenIds.has(id)) {
        weak.push(sentence);
        seenIds.add(id);
      }

      if (dueTime < startOfToday && !seenIds.has(id)) {
        overdue.push(sentence);
        seenIds.add(id);
      } else if (!seenIds.has(id)) {
        dueToday.push(sentence);
        seenIds.add(id);
      }
    }
  }

  // Sort overdue by longest overdue first
  overdue.sort((a, b) => {
    const dueA = progressMap[a.id]?.fsrs?.due ?? progressMap[a.id]?.nextReviewAt ?? 0;
    const dueB = progressMap[b.id]?.fsrs?.due ?? progressMap[b.id]?.nextReviewAt ?? 0;
    return dueA - dueB;
  });

  // Priority queue: Overdue -> Weak/Lapsed -> Due Today
  const allDue = [...overdue, ...weak, ...dueToday];

  return {
    overdue,
    weak,
    dueToday,
    allDue,
  };
}
