import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AppSettings, Direction, Rating, SentenceItem, UserProgress } from "./types";
import { SENTENCE_DATABASE } from "./data/sentences";
import { storageService } from "./services/storageService";
import { selectNextSentence } from "./services/selectionEngine";
import { categorizeDueSentences } from "./services/srsEngine";
import { playSubtleClick, stopSpeaking } from "./utils/sound";
import { Header } from "./components/Header";
import { PracticeCard } from "./components/PracticeCard";
import { ReviewMode } from "./components/ReviewMode";
import { ProgressDashboard } from "./components/ProgressDashboard";
import { SettingsModal } from "./components/SettingsModal";
import { Footer } from "./components/Footer";
import { ErrorBoundary } from "./components/ErrorBoundary";

export default function App() {
  const [settings, setSettings] = useState<AppSettings>(() => storageService.getSettings());
  const [progress, setProgress] = useState<UserProgress>(() => storageService.getProgress());
  const [currentTab, setCurrentTab] = useState<"practice" | "review" | "progress">("practice");
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [currentSentence, setCurrentSentence] = useState<SentenceItem>(() => {
    const s = storageService.getSettings();
    const p = storageService.getProgress();
    const initial = selectNextSentence(SENTENCE_DATABASE, p, { level: s.level, topic: s.topic });
    return initial || SENTENCE_DATABASE[0];
  });

  // Apply visual theme to <html> element
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.themeMode);
    if (settings.themeMode === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [settings.themeMode]);

  // Compute due reviews for navigation badge
  const dueInfo = useMemo(() => {
    return categorizeDueSentences(SENTENCE_DATABASE, progress.sentenceProgress);
  }, [progress.sentenceProgress]);

  // Total count of sentences at current CEFR level & topic
  const poolCount = useMemo(() => {
    const atLevel = SENTENCE_DATABASE.filter((s) => s.level === settings.level);
    if (settings.topic !== "all") {
      const atTopic = atLevel.filter((s) => s.topic === settings.topic);
      return atTopic.length > 0 ? atTopic.length : atLevel.length;
    }
    return atLevel.length;
  }, [settings.level, settings.topic]);

  // Function to transition to the next sentence using SRS weights
  const advanceToNextSentence = useCallback(
    (updatedProgress?: UserProgress) => {
      stopSpeaking();
      const p = updatedProgress || progress;
      const next = selectNextSentence(
        SENTENCE_DATABASE,
        p,
        { level: settings.level, topic: settings.topic },
        currentSentence?.id
      );
      if (next) {
        setCurrentSentence(next);
      }
    },
    [progress, settings.level, settings.topic, currentSentence?.id]
  );

  // When user changes CEFR level or topic in Settings/Header, update current sentence
  const handleUpdateSettings = (newPartial: Partial<AppSettings>) => {
    if (newPartial.level || newPartial.topic || newPartial.direction) {
      stopSpeaking();
    }
    const updated = { ...settings, ...newPartial };
    setSettings(updated);
    storageService.saveSettings(updated);

    if (newPartial.level || newPartial.topic) {
      const next = selectNextSentence(
        SENTENCE_DATABASE,
        progress,
        { level: updated.level, topic: updated.topic }
      );
      if (next) {
        setCurrentSentence(next);
      }
    }
  };

  const handleToggleNightMode = () => {
    playSubtleClick("click");
    const nextTheme = settings.themeMode === "dark" ? "editorial" : "dark";
    handleUpdateSettings({ themeMode: nextTheme });
  };

  const handleFlipDirection = () => {
    stopSpeaking();
    playSubtleClick("flip");
    const newDir: Direction = settings.direction === "en-de" ? "de-en" : "en-de";
    handleUpdateSettings({ direction: newDir });
  };

  const handleRateSentence = (
    rating: Rating,
    timeSpentMs: number,
    typedAnswer?: string,
    isCorrect?: boolean
  ) => {
    stopSpeaking();
    const updated = storageService.recordReview(
      currentSentence.id,
      rating,
      settings.direction,
      timeSpentMs,
      typedAnswer,
      isCorrect
    );
    setProgress(updated);
    advanceToNextSentence(updated);
  };

  const handleNextCard = () => {
    stopSpeaking();
    playSubtleClick("click");
    advanceToNextSentence(progress);
  };

  const handleReviewRateSentence = (
    sentenceId: string,
    rating: Rating,
    timeSpentMs: number,
    typedAnswer?: string,
    isCorrect?: boolean
  ) => {
    stopSpeaking();
    const updated = storageService.recordReview(
      sentenceId,
      rating,
      settings.direction,
      timeSpentMs,
      typedAnswer,
      isCorrect
    );
    setProgress(updated);
  };

  const handleTabChange = (tab: "practice" | "review" | "progress") => {
    stopSpeaking();
    setCurrentTab(tab);
  };

  const handleDataResetOrImported = () => {
    const freshSettings = storageService.getSettings();
    const freshProgress = storageService.getProgress();
    setSettings(freshSettings);
    setProgress(freshProgress);
    const next = selectNextSentence(SENTENCE_DATABASE, freshProgress, {
      level: freshSettings.level,
      topic: freshSettings.topic,
    });
    if (next) setCurrentSentence(next);
  };

  // Keyboard shortcuts (T for typing mode, N for night mode) when not typing in an input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" || document.activeElement?.tagName === "TEXTAREA") return;
      if (e.key === "t" || e.key === "T") {
        e.preventDefault();
        handleUpdateSettings({ typingMode: !settings.typingMode });
      } else if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        handleToggleNightMode();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [settings.typingMode, settings.themeMode]);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0A0A0A] text-black dark:text-white transition-colors selection:bg-black selection:text-white dark:selection:bg-white dark:selection:text-black">
      {/* Persistent Minimal Header */}
      <Header
        currentTab={currentTab}
        onTabChange={handleTabChange}
        settings={settings}
        onSettingsChange={handleUpdateSettings}
        onFlipDirection={handleFlipDirection}
        currentIndex={0}
        totalInQueue={poolCount}
        weakCount={dueInfo.allDue.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onToggleNightMode={handleToggleNightMode}
      />

      {/* Main Single-View Core Loop */}
      <main className="flex-1 flex flex-col items-center justify-center">
        <ErrorBoundary fallbackTitle="Session Error" onReset={() => handleTabChange("practice")}>
          {currentTab === "practice" && currentSentence && (
            <PracticeCard
              key={`${currentSentence.id}-${settings.direction}`}
              sentence={currentSentence}
              cardProgress={progress.sentenceProgress[currentSentence.id]}
              settings={settings}
              onRate={handleRateSentence}
              onFlipDirection={handleFlipDirection}
              onToggleTyping={() => handleUpdateSettings({ typingMode: !settings.typingMode })}
              onNextCard={handleNextCard}
              isReviewMode={false}
            />
          )}

          {currentTab === "review" && (
            <ReviewMode
              allSentences={SENTENCE_DATABASE}
              progress={progress}
              settings={settings}
              onRateSentence={handleReviewRateSentence}
              onFlipDirection={handleFlipDirection}
              onBackToPractice={() => handleTabChange("practice")}
            />
          )}

          {currentTab === "progress" && (
            <ProgressDashboard
              progress={progress}
              settings={settings}
              allSentences={SENTENCE_DATABASE}
              onStartPracticing={() => handleTabChange("practice")}
              onGoToReview={() => handleTabChange("review")}
            />
          )}
        </ErrorBoundary>
      </main>

      {/* Quiet, Minimalist Editorial Footer */}
      <Footer
        onTabChange={(tab) => setCurrentTab(tab)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Settings & Configuration Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onDataResetOrImported={handleDataResetOrImported}
      />
    </div>
  );
}
