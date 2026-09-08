import { CEFRLevel, SentenceItem, TopicId, UserProgress } from "../types";

export interface SelectionFilter {
  level: CEFRLevel;
  topic: TopicId;
}

export function selectNextSentence(
  allSentences: SentenceItem[],
  progress: UserProgress,
  filter: SelectionFilter,
  currentSentenceId?: string
): SentenceItem | null {
  // 1. STRICT CEFR Level Filtering - MUST NEVER show sentences from wrong CEFR level
  let candidatePool = allSentences.filter((s) => s.level === filter.level);

  // 2. Topic Filtering (if topic !== "all")
  if (filter.topic !== "all") {
    const topicFiltered = candidatePool.filter((s) => s.topic === filter.topic);
    if (topicFiltered.length > 0) {
      candidatePool = topicFiltered;
    }
  }

  if (candidatePool.length === 0) {
    // Fallback strictly within CEFR level
    candidatePool = allSentences.filter((s) => s.level === filter.level);
    if (candidatePool.length === 0) return null;
  }

  // If only 1 sentence exists, return it
  if (candidatePool.length === 1) {
    return candidatePool[0];
  }

  // Filter out the currently displayed sentence so we don't repeat immediately
  const validCandidates = candidatePool.filter((s) => s.id !== currentSentenceId);
  const pool = validCandidates.length > 0 ? validCandidates : candidatePool;

  const now = Date.now();

  // Categorize candidates based on SRS state
  const dueOrWeak: SentenceItem[] = [];
  const unpracticedNew: SentenceItem[] = [];
  const masteredOrFuture: SentenceItem[] = [];

  for (const sentence of pool) {
    const p = progress.sentenceProgress[sentence.id];
    if (!p) {
      unpracticedNew.push(sentence);
    } else {
      const dueTime = p.fsrs?.due ?? p.due ?? p.nextReviewAt ?? 0;
      if (
        p.status === "learning" ||
        p.status === "relearning" ||
        dueTime <= now ||
        p.lastRating === "again" ||
        (p.lapses !== undefined && p.lapses > 0 && p.consecutiveCorrect === 0)
      ) {
        dueOrWeak.push(sentence);
      } else {
        masteredOrFuture.push(sentence);
      }
    }
  }

  // Selection weighting:
  // 70% Due/Weak if available
  // 20% New unpracticed sentences
  // 10% Reinforcement of previously learned sentences
  const rand = Math.random();

  if (rand < 0.7 && dueOrWeak.length > 0) {
    // Pick the most overdue or weakest
    dueOrWeak.sort((a, b) => {
      const pa = progress.sentenceProgress[a.id]?.fsrs?.due ?? progress.sentenceProgress[a.id]?.nextReviewAt ?? 0;
      const pb = progress.sentenceProgress[b.id]?.fsrs?.due ?? progress.sentenceProgress[b.id]?.nextReviewAt ?? 0;
      return pa - pb;
    });
    return dueOrWeak[0];
  } else if (rand < 0.9 && unpracticedNew.length > 0) {
    // Pick an unpracticed sentence
    return unpracticedNew[Math.floor(Math.random() * unpracticedNew.length)];
  } else if (masteredOrFuture.length > 0) {
    // Reinforcement
    return masteredOrFuture[Math.floor(Math.random() * masteredOrFuture.length)];
  }

  // Fallbacks if one bucket is empty
  if (dueOrWeak.length > 0) return dueOrWeak[0];
  if (unpracticedNew.length > 0) return unpracticedNew[0];
  return pool[Math.floor(Math.random() * pool.length)];
}
