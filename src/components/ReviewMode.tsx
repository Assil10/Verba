import React, { useState, useMemo } from "react";
import { CheckCircle2, ArrowRight, RotateCcw, AlertTriangle, Calendar } from "lucide-react";
import { AppSettings, Rating, SentenceItem, UserProgress } from "../types";
import { categorizeDueSentences } from "../services/srsEngine";
import { PracticeCard } from "./PracticeCard";

interface ReviewModeProps {
  allSentences: SentenceItem[];
  progress: UserProgress;
  settings: AppSettings;
  onRateSentence: (
    sentenceId: string,
    rating: Rating,
    timeSpentMs: number,
    typedAnswer?: string,
    isCorrect?: boolean
  ) => void;
  onFlipDirection: () => void;
  onBackToPractice: () => void;
}

export const ReviewMode: React.FC<ReviewModeProps> = ({
  allSentences,
  progress,
  settings,
  onRateSentence,
  onFlipDirection,
  onBackToPractice,
}) => {
  const [sessionState, setSessionState] = useState<"intro" | "active" | "complete">("intro");
  const [sessionQueue, setSessionQueue] = useState<SentenceItem[]>([]);
  const [sessionIndex, setSessionIndex] = useState(0);
  const [sessionStats, setSessionStats] = useState({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
    total: 0,
  });

  const { overdue, weak, dueToday, allDue } = useMemo(() => {
    return categorizeDueSentences(allSentences, progress.sentenceProgress);
  }, [allSentences, progress.sentenceProgress]);

  // Empty state: Nothing to review
  if (allDue.length === 0 && sessionState === "intro") {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[calc(100vh-180px)] py-12 px-4">
        <div className="max-w-md w-full text-center bg-white dark:bg-[#121212] border-2 border-black dark:border-white rounded-[2.5rem] p-10 sm:p-12 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12)] animate-in fade-in duration-200">
          <div className="w-14 h-14 mx-auto rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mb-6">
            <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
          </div>

          <h2 className="font-arial-black font-black text-2xl sm:text-3xl text-black dark:text-white tracking-tight uppercase mb-3">
            NOTHING TO REVIEW
          </h2>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed mb-8 font-medium">
            You're completely caught up. All scheduled reviews have been reinforced with memory retention intervals.
          </p>

          <button
            id="practice-new-sentences-btn"
            onClick={onBackToPractice}
            className="w-full py-4 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-100 rounded-full font-arial-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
          >
            <span>PRACTICE NEW SENTENCES</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    );
  }

  const handleStartReview = () => {
    setSessionQueue(allDue);
    setSessionIndex(0);
    setSessionStats({ again: 0, hard: 0, good: 0, easy: 0, total: 0 });
    setSessionState("active");
  };

  // Intro dashboard before starting review session
  if (sessionState === "intro") {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[calc(100vh-180px)] py-6 sm:py-12 px-3 sm:px-4">
        <div className="max-w-lg w-full bg-white dark:bg-[#121212] border-2 border-black dark:border-white rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 md:p-12 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12)] animate-in fade-in duration-200">
          <div className="text-[11px] font-mono-code font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mb-2">
            SPACED REPETITION QUEUE
          </div>

          <h1 className="font-arial-black text-2xl sm:text-4xl text-black dark:text-white tracking-tight uppercase mb-6">
            Review Session
          </h1>

          <div className="p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-[#1A1A1A] border-2 border-black dark:border-neutral-700 mb-6 flex items-baseline justify-between">
            <span className="font-arial-black text-3xl sm:text-4xl text-black dark:text-white">
              {allDue.length}
            </span>
            <span className="text-xs font-mono-code font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-wider">
              Sentences due for review
            </span>
          </div>

          {/* Breakdown Rows */}
          <div className="space-y-2.5 mb-8 text-xs font-mono-code font-bold">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-[#181818] border border-black/20 dark:border-neutral-700 text-black dark:text-white">
              <span className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                <span>Overdue</span>
              </span>
              <span className="font-black text-sm">{overdue.length}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-[#181818] border border-black/20 dark:border-neutral-700 text-black dark:text-white">
              <span className="flex items-center gap-2.5">
                <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                <span>Needs Reinforcement (Weak)</span>
              </span>
              <span className="font-black text-sm">{weak.length}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-white dark:bg-[#181818] border border-black/20 dark:border-neutral-700 text-black dark:text-white">
              <span className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 stroke-[2.5]" />
                <span>Scheduled for Today</span>
              </span>
              <span className="font-black text-sm">{dueToday.length}</span>
            </div>
          </div>

          <button
            id="start-review-session-btn"
            onClick={handleStartReview}
            className="w-full py-4 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-100 font-arial-black text-xs uppercase tracking-widest rounded-full transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg min-h-[48px]"
          >
            <span>START REVIEW</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>
      </div>
    );
  }

  // Post-Session Summary Screen
  if (sessionState === "complete") {
    return (
      <div className="w-full flex flex-col items-center justify-center min-h-[calc(100vh-180px)] py-6 sm:py-12 px-3 sm:px-4">
        <div className="max-w-md w-full bg-white dark:bg-[#121212] border-2 border-black dark:border-white rounded-2xl sm:rounded-[2.5rem] p-5 sm:p-8 md:p-12 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.12)] text-center animate-in fade-in duration-200">
          <div className="w-14 h-14 mx-auto rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center mb-6">
            <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
          </div>

          <h2 className="font-arial-black text-2xl sm:text-3xl text-black dark:text-white tracking-tight uppercase mb-2">
            REVIEW COMPLETE
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono-code mb-8 font-semibold">
            Spaced repetition intervals updated.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 mb-6 font-mono-code text-xs">
            <div className="p-2.5 sm:p-3 rounded-xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800">
              <div className="font-black text-black dark:text-white text-base">{sessionStats.again}</div>
              <div className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 mt-0.5">AGAIN</div>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800">
              <div className="font-black text-black dark:text-white text-base">{sessionStats.hard}</div>
              <div className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 mt-0.5">HARD</div>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800">
              <div className="font-black text-black dark:text-white text-base">{sessionStats.good}</div>
              <div className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 mt-0.5">GOOD</div>
            </div>
            <div className="p-2.5 sm:p-3 rounded-xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800">
              <div className="font-black text-black dark:text-white text-base">{sessionStats.easy}</div>
              <div className="text-[10px] font-bold text-neutral-400 dark:text-neutral-500 mt-0.5">EASY</div>
            </div>
          </div>

          <button
            onClick={onBackToPractice}
            className="w-full py-4 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-900 dark:hover:bg-neutral-100 rounded-full font-arial-black text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg min-h-[48px]"
          >
            Back to Practice
          </button>
        </div>
      </div>
    );
  }

  // Active Review Loop
  const currentSentence = sessionQueue[sessionIndex];

  const handleRate = (
    rating: Rating,
    timeSpentMs: number,
    typedAnswer?: string,
    isCorrect?: boolean
  ) => {
    onRateSentence(currentSentence.id, rating, timeSpentMs, typedAnswer, isCorrect);

    setSessionStats((prev) => ({
      ...prev,
      [rating]: prev[rating] + 1,
      total: prev.total + 1,
    }));

    if (sessionIndex + 1 < sessionQueue.length) {
      setSessionIndex((prev) => prev + 1);
    } else {
      setSessionState("complete");
    }
  };

  const handleNextCard = () => {
    if (sessionIndex + 1 < sessionQueue.length) {
      setSessionIndex((prev) => prev + 1);
    } else {
      setSessionState("complete");
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Review Progress Sub-Header */}
      <div className="w-full max-w-2xl px-4 sm:px-6 pt-4 sm:pt-6 flex items-center justify-between text-xs font-mono-code font-bold text-black dark:text-white">
        <div className="flex items-center gap-2">
          <span className="tracking-widest uppercase bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 rounded text-[10px]">
            REVIEW QUEUE
          </span>
          <span className="text-neutral-400 dark:text-neutral-500">·</span>
          <span>
            {sessionIndex + 1} / {sessionQueue.length}
          </span>
        </div>

        <button
          onClick={() => setSessionState("complete")}
          className="text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white uppercase tracking-wider underline underline-offset-4 transition-colors cursor-pointer min-h-[40px] flex items-center"
        >
          End Session
        </button>
      </div>

      <PracticeCard
        sentence={currentSentence}
        settings={settings}
        onRate={handleRate}
        onFlipDirection={onFlipDirection}
        onNextCard={handleNextCard}
        isReviewMode={true}
      />
    </div>
  );
};
