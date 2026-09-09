import React, { useMemo } from "react";
import { ArrowRight, Flame, Target, BookOpen } from "lucide-react";
import { AppSettings, SentenceItem, UserProgress, UserSentenceProgress } from "../types";
import { categorizeDueSentences } from "../services/srsEngine";

interface ProgressDashboardProps {
  progress: UserProgress;
  settings: AppSettings;
  allSentences: SentenceItem[];
  onStartPracticing: () => void;
  onGoToReview: () => void;
}

export const ProgressDashboard: React.FC<ProgressDashboardProps> = ({
  progress,
  settings,
  allSentences,
  onStartPracticing,
  onGoToReview,
}) => {
  // Check if brand new user with 0 practice history
  if (progress.totalPracticed === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[calc(100vh-180px)] py-12 px-4">
        <div className="max-w-md w-full text-center bg-white dark:bg-[#121212] border-2 border-black dark:border-white rounded-[2.5rem] p-10 sm:p-12 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12)] animate-in fade-in duration-200">
          <div className="w-14 h-14 mx-auto rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mb-6">
            <BookOpen className="w-7 h-7 stroke-[2.5]" />
          </div>

          <div className="text-[10px] font-mono-code font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5">
            CLEAN SLATE
          </div>
          <h2 className="font-arial-black font-black text-2xl sm:text-3xl text-black dark:text-white tracking-tight uppercase mb-3">
            Zero Baseline
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-8 font-medium">
            Complete your first session to build genuine retention metrics, calendar streaks, and CEFR grammar accuracy.
          </p>

          <button
            id="start-first-practice-btn"
            onClick={onStartPracticing}
            className="w-full py-4 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-100 rounded-full font-arial-black font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <span>START PRACTICING</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    );
  }

  // Real statistics computation
  const uniqueCount = Object.keys(progress.sentenceProgress).length;
  const goodEasyCount = (progress.ratingCounts.good || 0) + (progress.ratingCounts.easy || 0);
  const accuracyRate = Math.round((goodEasyCount / progress.totalPracticed) * 100);

  const allProgressItems = Object.values(progress.sentenceProgress) as UserSentenceProgress[];

  const dueInfo = useMemo(() => {
    return categorizeDueSentences(allSentences, progress.sentenceProgress || {});
  }, [allSentences, progress.sentenceProgress]);
  const dueCount = dueInfo.allDue.length;

  const masteredCount = allProgressItems.filter(
    (p) => p.status === "mastered"
  ).length;

  const weakCount = allProgressItems.filter(
    (p) =>
      p.status === "learning" ||
      p.status === "relearning" ||
      p.lastRating === "again" ||
      (p.difficulty !== undefined && p.difficulty >= 7.5) ||
      (p.easeFactor < 2.0 && p.attempts >= 1)
  ).length;

  // Daily goal calculation
  const goalTarget = settings.dailyGoal || 20;
  const todayPracticed = progress.todayCount || 0;
  const goalPercent = Math.min(100, Math.round((todayPracticed / goalTarget) * 100));
  const remainingToday = Math.max(0, goalTarget - todayPracticed);

  // Real CEFR Level Breakdown from practiced items
  const sentenceMap = new Map<string, SentenceItem>();
  allSentences.forEach((s) => sentenceMap.set(s.id, s));

  const cefrCounts: Record<string, number> = { A1: 0, A2: 0, B1: 0, B2: 0, C1: 0 };
  Object.keys(progress.sentenceProgress).forEach((id) => {
    const s = sentenceMap.get(id);
    if (s && s.level) {
      cefrCounts[s.level] = (cefrCounts[s.level] || 0) + 1;
    }
  });

  // Group real recent history by calendar day
  const historyByDate = new Map<string, number>();
  progress.history.forEach((h) => {
    const dateStr = new Date(h.timestamp).toISOString().split("T")[0];
    historyByDate.set(dateStr, (historyByDate.get(dateStr) || 0) + 1);
  });

  const recentHistoryDays = Array.from(historyByDate.entries())
    .slice(0, 5)
    .map(([date, count]) => {
      const today = new Date().toISOString().split("T")[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      let label = date;
      if (date === today) label = "Today";
      else if (date === yesterday) label = "Yesterday";
      return { label, count };
    });

  return (
    <div className="w-full max-w-3xl mx-auto py-6 sm:py-10 md:py-12 px-3 sm:px-6">
      {/* Header */}
      <div className="mb-6 sm:mb-10 border-b border-neutral-200 dark:border-neutral-800 pb-4 sm:pb-6 flex flex-wrap items-baseline justify-between gap-2.5 sm:gap-3">
        <div>
          <div className="text-[10px] font-mono-code font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-1.5">
            PERFORMANCE METRICS
          </div>
          <h1 className="font-arial-black text-2xl sm:text-4xl text-black dark:text-white tracking-tight uppercase">
            Your Progress
          </h1>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 text-xs font-mono-code font-bold">
          <span className="px-2.5 sm:px-3 py-1 rounded-full border border-black dark:border-white text-black dark:text-white text-[11px] sm:text-xs">
            {settings.direction === "en-de" ? "EN → DE" : "DE → EN"}
          </span>
          <span className="px-2.5 sm:px-3 py-1 rounded-full bg-black dark:bg-white text-white dark:text-black text-[11px] sm:text-xs">
            {settings.level}
          </span>
        </div>
      </div>

      {/* Daily Goal Card */}
      <div className="p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] bg-white dark:bg-[#121212] border-2 border-black dark:border-white mb-6 sm:mb-8 shadow-xs">
        <div className="flex items-center justify-between text-xs font-mono-code font-bold mb-2 text-black dark:text-white uppercase">
          <span className="flex items-center gap-2">
            <Target className="w-4 h-4 stroke-[2.5]" />
            <span>Daily Goal</span>
          </span>
          <span className="text-neutral-500 dark:text-neutral-400">
            {todayPracticed} / {goalTarget} sentences
          </span>
        </div>

        {/* Minimal High-Contrast Progress Bar */}
        <div className="w-full h-3 bg-neutral-100 dark:bg-[#202020] border border-black dark:border-neutral-600 rounded-full overflow-hidden my-3">
          <div
            className="h-full bg-black dark:bg-white transition-all duration-300 rounded-full"
            style={{ width: `${goalPercent}%` }}
          />
        </div>

        <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono-code font-bold flex justify-between">
          <span>{remainingToday === 0 ? "Goal completed for today" : `${remainingToday} sentences remaining today`}</span>
          <span>{goalPercent}%</span>
        </div>
      </div>

      {/* Primary Key Metrics (Responsive 1-col on mobile, 3-col on desktop) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] bg-white dark:bg-[#121212] border-2 border-black dark:border-white">
          <div className="font-arial-black text-3xl sm:text-4xl text-black dark:text-white tracking-tight">
            {progress.totalPracticed}
          </div>
          <div className="mt-1 text-xs font-mono-code font-bold uppercase text-neutral-500 dark:text-neutral-400">
            PRACTICED
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] bg-white dark:bg-[#121212] border-2 border-black dark:border-white">
          <div className="font-arial-black text-3xl sm:text-4xl text-black dark:text-white tracking-tight">
            {accuracyRate}%
          </div>
          <div className="mt-1 text-xs font-mono-code font-bold uppercase text-neutral-500 dark:text-neutral-400">
            ACCURACY
          </div>
        </div>

        <div className="p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] bg-white dark:bg-[#121212] border-2 border-black dark:border-white">
          <div className="font-arial-black text-3xl sm:text-4xl text-black dark:text-white tracking-tight flex items-center gap-1.5">
            <span>{progress.streakDays}</span>
            <Flame className="w-5 h-5 text-black dark:text-white stroke-[2.5]" />
          </div>
          <div className="mt-1 text-xs font-mono-code font-bold uppercase text-neutral-500 dark:text-neutral-400">
            DAY STREAK ({progress.longestStreak} BEST)
          </div>
        </div>
      </div>

      {/* Secondary Details: Unique, Mastered, Weak */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8 text-xs font-mono-code font-bold">
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 text-center">
          <div className="text-lg sm:text-xl font-black text-black dark:text-white">{uniqueCount}</div>
          <div className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase mt-0.5">Unique Sentences</div>
        </div>
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 text-center">
          <div className="text-lg sm:text-xl font-black text-black dark:text-white">{masteredCount}</div>
          <div className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase mt-0.5">Mastered</div>
        </div>
        <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800 text-center">
          <div className="text-lg sm:text-xl font-black text-black dark:text-white">{weakCount}</div>
          <div className="text-[10px] text-neutral-500 dark:text-neutral-400 uppercase mt-0.5">Needs Review</div>
        </div>
      </div>

      {/* Review Callout if due items exist or items being reinforced */}
      {dueCount > 0 ? (
        <div className="mb-6 sm:mb-8 p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-[#181818] border-2 border-black dark:border-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-mono-code font-bold text-black dark:text-white uppercase tracking-wider">
              {dueCount} SENTENCE{dueCount === 1 ? "" : "S"} DUE IN REVIEW QUEUE
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400 font-medium mt-0.5">
              Ready for immediate memory reinforcement.
            </div>
          </div>
          <button
            onClick={onGoToReview}
            className="w-full sm:w-auto px-5 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-arial-black uppercase tracking-wider transition-colors cursor-pointer text-center min-h-[44px]"
          >
            Start Review →
          </button>
        </div>
      ) : weakCount > 0 ? (
        <div className="mb-6 sm:mb-8 p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-300 dark:border-neutral-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="text-xs font-mono-code font-bold text-black dark:text-white uppercase tracking-wider">
              {weakCount} SENTENCE{weakCount === 1 ? "" : "S"} BEING REINFORCED
            </div>
            <div className="text-xs text-neutral-600 dark:text-neutral-400 font-medium mt-0.5">
              Scheduled according to FSRS intervals. Practice early anytime.
            </div>
          </div>
          <button
            onClick={onGoToReview}
            className="w-full sm:w-auto px-5 py-3 rounded-full bg-neutral-200 dark:bg-neutral-800 text-black dark:text-white hover:bg-neutral-300 dark:hover:bg-neutral-700 text-xs font-arial-black uppercase tracking-wider transition-colors cursor-pointer text-center min-h-[44px]"
          >
            Review Early →
          </button>
        </div>
      ) : null}

      {/* Real CEFR Level Progress */}
      <div className="mb-8">
        <div className="text-xs font-mono-code font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-3">
          CEFR LEVEL EXPOSURE
        </div>
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5 font-mono-code text-xs">
          {(["A1", "A2", "B1", "B2", "C1"] as const).map((lvl) => {
            const count = cefrCounts[lvl] || 0;
            return (
              <div
                key={lvl}
                className="p-2 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white dark:bg-[#161616] border border-neutral-300 dark:border-neutral-800 text-center"
              >
                <div className="text-[10px] sm:text-[11px] text-neutral-400 dark:text-neutral-500 font-bold">{lvl}</div>
                <div className="text-base sm:text-lg font-black text-black dark:text-white mt-0.5 sm:mt-1">{count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Real Activity History */}
      {recentHistoryDays.length > 0 && (
        <div>
          <div className="text-xs font-mono-code font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-3">
            RECENT PRACTICE LOG
          </div>
          <div className="bg-white dark:bg-[#161616] border border-neutral-300 dark:border-neutral-800 rounded-2xl divide-y divide-neutral-200 dark:divide-neutral-800 overflow-hidden">
            {recentHistoryDays.map((day) => (
              <div key={day.label} className="p-4 flex items-center justify-between text-xs">
                <span className="text-black dark:text-white font-bold">{day.label}</span>
                <span className="font-mono-code font-semibold text-neutral-500 dark:text-neutral-400">
                  {day.count} {day.count === 1 ? "sentence" : "sentences"} practiced
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
