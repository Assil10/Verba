import React, { useState, useEffect, useRef } from "react";
import {
  Volume2,
  Sparkles,
  Send,
  Check,
  AlertCircle,
  ArrowLeftRight,
  Keyboard,
  RotateCcw,
  ArrowRight,
} from "lucide-react";
import { AppSettings, Rating, SentenceItem, TypingEvaluationResult } from "../types";
import { speakText, playSubtleClick } from "../utils/sound";
import { evaluateUserTyping } from "../services/typingEvaluator";
import { ScrambleText } from "./ScrambleText";

interface PracticeCardProps {
  sentence: SentenceItem;
  settings: AppSettings;
  onRate: (rating: Rating, timeSpentMs: number, typedAnswer?: string, isCorrect?: boolean) => void;
  onFlipDirection: () => void;
  onToggleTyping?: () => void;
  onNextCard?: () => void;
  isReviewMode?: boolean;
}

export const PracticeCard: React.FC<PracticeCardProps> = ({
  sentence,
  settings,
  onRate,
  onFlipDirection,
  onToggleTyping,
  onNextCard,
  isReviewMode = false,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);
  const [typedInput, setTypedInput] = useState("");
  const [showUnderstand, setShowUnderstand] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState<TypingEvaluationResult | null>(null);

  const startTimeRef = useRef<number>(Date.now());
  const inputRef = useRef<HTMLInputElement>(null);

  const isEnToDe = settings.direction === "en-de";
  const promptText = isEnToDe ? sentence.targetText : sentence.sourceText;
  const promptLangName = isEnToDe ? "ENGLISH" : "GERMAN";
  const promptVoiceCode = isEnToDe ? "en-US" : "de-DE";

  const answerText = isEnToDe ? sentence.sourceText : sentence.targetText;
  const answerLangName = isEnToDe ? "GERMAN" : "ENGLISH";
  const answerVoiceCode = isEnToDe ? "de-DE" : "en-US";

  useEffect(() => {
    setIsRevealed(false);
    setTypedInput("");
    setShowUnderstand(false);
    setAiExplanation(null);
    setEvalResult(null);
    setIsEvaluating(false);
    startTimeRef.current = Date.now();

    if (settings.typingMode) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [sentence.id, settings.direction, settings.typingMode]);

  const handleReveal = async () => {
    if (isRevealed) return;
    playSubtleClick("reveal");
    setIsRevealed(true);

    if (settings.autoSpeak) {
      speakText(answerText, answerVoiceCode, settings.audioSpeed, settings.selectedVoiceName);
    }

    if (settings.typingMode && typedInput.trim()) {
      setIsEvaluating(true);
      const res = await evaluateUserTyping(
        typedInput,
        answerText,
        promptText,
        promptLangName,
        answerLangName,
        sentence,
        isEnToDe
      );
      setEvalResult(res);
      setIsEvaluating(false);
    }
  };

  const handleToggleFlip = () => {
    playSubtleClick("flip");
    setIsRevealed((prev) => !prev);
  };

  const handleRate = (rating: Rating) => {
    playSubtleClick("rate");
    const elapsed = Date.now() - startTimeRef.current;
    onRate(rating, elapsed, typedInput, evalResult?.isCorrect);
  };

  const handleFetchAiExplanation = async () => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sentence: promptText,
          translation: answerText,
          sourceLang: promptLangName,
          targetLang: answerLangName,
          level: sentence.level,
        }),
      });
      const data = await res.json();
      if (data.success && data.explanation) {
        setAiExplanation(data.explanation);
      } else {
        setAiExplanation("AI explanation currently unavailable. Refer to the native linguistic breakdown above.");
      }
    } catch {
      setAiExplanation("AI service could not be reached. Refer to the native linguistic breakdown above.");
    } finally {
      setAiLoading(false);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === "INPUT" && e.key !== "Enter") {
        return;
      }

      if (!isRevealed) {
        if (e.code === "Space" || e.key === "Enter") {
          e.preventDefault();
          handleReveal();
        } else if (e.key === "n" || e.key === "N") {
          e.preventDefault();
          onNextCard?.();
        } else if (e.key === "f" || e.key === "F") {
          e.preventDefault();
          onFlipDirection();
        } else if (e.key === "p" || e.key === "P") {
          e.preventDefault();
          speakText(promptText, promptVoiceCode, settings.audioSpeed, settings.selectedVoiceName);
        } else if (e.key === "t" || e.key === "T") {
          e.preventDefault();
          onToggleTyping?.();
        }
      } else {
        if (e.key === "1") {
          e.preventDefault();
          handleRate("again");
        } else if (e.key === "2") {
          e.preventDefault();
          handleRate("hard");
        } else if (e.key === "3") {
          e.preventDefault();
          handleRate("good");
        } else if (e.key === "4") {
          e.preventDefault();
          handleRate("easy");
        } else if (e.key === "n" || e.key === "N") {
          e.preventDefault();
          onNextCard?.();
        } else if (e.code === "Space") {
          e.preventDefault();
          handleToggleFlip();
        } else if (e.key === "u" || e.key === "U") {
          e.preventDefault();
          setShowUnderstand((prev) => !prev);
        } else if (e.key === "p" || e.key === "P") {
          e.preventDefault();
          speakText(answerText, answerVoiceCode, settings.audioSpeed, settings.selectedVoiceName);
        } else if (e.key === "f" || e.key === "F") {
          e.preventDefault();
          onFlipDirection();
        } else if (e.key === "t" || e.key === "T") {
          e.preventDefault();
          onToggleTyping?.();
        } else if (e.key === "Escape") {
          e.preventDefault();
          setShowUnderstand(false);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isRevealed,
    answerText,
    promptText,
    settings.direction,
    settings.audioSpeed,
    settings.selectedVoiceName,
    onToggleTyping,
    onNextCard,
  ]);

  return (
    <div className="w-full flex flex-col items-center justify-center min-h-[calc(100vh-160px)] py-4 sm:py-8 md:py-10 px-2.5 sm:px-6">
      <div className="w-full max-w-2xl flex flex-col items-center">
        {/* Fixed min-height stark black & white card container to eliminate height jump when flipped */}
        <section
          id="practice-session-card"
          aria-label="Practice sentence flashcard"
          className="w-full min-h-[420px] sm:min-h-[480px] md:min-h-[510px] flex flex-col justify-between bg-white dark:bg-[#121212] border-2 border-black dark:border-neutral-200 rounded-2xl sm:rounded-[2.5rem] p-4 sm:p-8 md:p-10 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.08)] dark:shadow-[0_15px_40px_-15px_rgba(0,0,0,0.7)] transition-all duration-200"
        >
          {/* Top Metadata Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3.5 sm:pb-5 border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <span className="text-[10px] sm:text-[11px] font-mono-code font-bold tracking-widest text-black dark:text-white border border-black dark:border-neutral-300 px-2 sm:px-3 py-0.5 rounded-full bg-white dark:bg-[#181818] uppercase">
                {isRevealed ? answerLangName : promptLangName}
              </span>
              <span className="text-neutral-300 dark:text-neutral-700">·</span>
              <span className="text-xs font-mono-code text-black dark:text-white font-black">
                {sentence.level}
              </span>
              <span className="text-neutral-300 dark:text-neutral-700">·</span>
              <span className="text-xs font-mono-code text-neutral-600 dark:text-neutral-400 uppercase tracking-wider font-bold truncate max-w-[100px] sm:max-w-none">
                {sentence.topicLabel}
              </span>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">
              {isReviewMode && (
                <span className="px-2 sm:px-2.5 py-0.5 text-[10px] font-mono-code font-bold bg-black dark:bg-white text-white dark:text-black rounded-full uppercase tracking-wider">
                  Review
                </span>
              )}

              {/* Back Card: Subtle, borderless FLIP BACK button moved to top-right metadata header */}
              {isRevealed && (
                <button
                  id="flip-back-header-btn"
                  onClick={handleToggleFlip}
                  className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 sm:py-1.5 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg text-xs font-mono-code font-bold uppercase tracking-wider transition-colors cursor-pointer min-h-[36px]"
                  title="Flip Back to Front (Space)"
                  aria-label="Flip back to front"
                >
                  <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span className="text-[10px] sm:text-[11px] font-bold">FLIP BACK</span>
                </button>
              )}

              {/* Audio Pronunciation Button */}
              <button
                id="pronounce-btn"
                aria-label={isRevealed ? "Pronounce answer sentence" : "Pronounce prompt sentence"}
                onClick={() =>
                  speakText(
                    isRevealed ? answerText : promptText,
                    isRevealed ? answerVoiceCode : promptVoiceCode,
                    settings.audioSpeed,
                    settings.selectedVoiceName
                  )
                }
                className="p-2 min-h-[36px] min-w-[36px] flex items-center justify-center text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors cursor-pointer"
                title="Pronounce Sentence (P)"
              >
                <Volume2 className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>
          </div>

          {/* Central Body Content Area: Flex-1 centered content */}
          <div className="flex-1 flex flex-col justify-center py-5 sm:py-8">
            {!isRevealed ? (
              /* FRONT OF CARD: Animated First Sentence with Scramble & Blur & Soundtrack */
              <div>
                <h1 className="font-arial-black text-2xl sm:text-4xl md:text-5xl text-black dark:text-white tracking-tight leading-[1.14] text-balance select-text break-words">
                  <ScrambleText
                    text={promptText}
                    triggerKey={`${sentence.id}-${promptText}`}
                    duration={460}
                    playSound={true}
                  />
                </h1>

                {/* Optional Interactive Typing Input */}
                {settings.typingMode && (
                  <div className="mt-5 sm:mt-8">
                    <label
                      htmlFor="typing-input"
                      className="block text-[11px] font-mono-code font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400 mb-2"
                    >
                      Type the {answerLangName} translation:
                    </label>
                    <div className="relative">
                      <input
                        ref={inputRef}
                        id="typing-input"
                        type="text"
                        value={typedInput}
                        onChange={(e) => setTypedInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleReveal();
                          }
                        }}
                        placeholder={`Type in ${answerLangName.toLowerCase()}...`}
                        className="w-full px-3.5 sm:px-5 py-3 sm:py-4 bg-neutral-50 dark:bg-[#181818] border-2 border-black dark:border-neutral-300 rounded-xl sm:rounded-2xl font-mono-code text-sm sm:text-base text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:bg-white dark:focus:bg-[#1E1E1E] transition-all shadow-inner"
                        autoComplete="off"
                        autoCorrect="off"
                        spellCheck="false"
                      />
                      <button
                        onClick={handleReveal}
                        className="absolute right-1.5 sm:right-2.5 top-1/2 -translate-y-1/2 p-2 sm:p-2.5 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 rounded-lg sm:rounded-xl transition-colors cursor-pointer min-h-[38px] sm:min-h-[40px] min-w-[38px] sm:min-w-[40px] flex items-center justify-center"
                        title="Submit answer"
                        aria-label="Submit translation"
                      >
                        <Send className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* BACK OF CARD: Both First Sentence (Kept Visible) AND Translated Sentence */
              <div className="animate-in fade-in duration-150 space-y-3.5 sm:space-y-6">
                {/* 1. First (Original Prompt) Sentence - Kept Visible after reveal */}
                <div className="pb-3 sm:pb-4 border-b border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] sm:text-[11px] font-mono-code font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">
                      {promptLangName} PROMPT
                    </span>
                    <button
                      onClick={() =>
                        speakText(
                          promptText,
                          promptVoiceCode,
                          settings.audioSpeed,
                          settings.selectedVoiceName
                        )
                      }
                      className="p-1 text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                      title="Pronounce prompt sentence"
                      aria-label="Hear prompt sentence"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="font-arial-black text-base sm:text-xl md:text-2xl text-neutral-600 dark:text-neutral-300 leading-snug tracking-tight select-text break-words">
                    {promptText}
                  </p>
                </div>

                {/* 2. Revealed Translated Sentence */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] sm:text-[11px] font-mono-code font-bold tracking-widest text-neutral-400 dark:text-neutral-500 uppercase">
                      {answerLangName} TRANSLATION
                    </span>
                    <button
                      onClick={() =>
                        speakText(
                          answerText,
                          answerVoiceCode,
                          settings.audioSpeed,
                          settings.selectedVoiceName
                        )
                      }
                      className="p-1 text-neutral-400 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                      title="Pronounce translated sentence"
                      aria-label="Hear translated sentence"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h2 className="font-arial-black text-xl sm:text-3xl md:text-4xl text-black dark:text-white leading-snug tracking-tight my-1 select-text break-words">
                    {answerText}
                  </h2>
                </div>

                {/* Typing Mode Assessment Feedback (if applicable) */}
                {settings.typingMode && typedInput && (
                  <div
                    className={`mt-4 p-3.5 rounded-xl text-xs flex items-start gap-3 border-2 ${
                      evalResult?.isCorrect
                        ? "border-black dark:border-neutral-300 bg-neutral-50 dark:bg-[#181818] text-black dark:text-white"
                        : "border-black dark:border-neutral-300 bg-neutral-100 dark:bg-[#1E1E1E] text-black dark:text-white"
                    }`}
                  >
                    {evalResult?.isCorrect ? (
                      <Check className="w-4 h-4 text-black dark:text-white shrink-0 mt-0.5 stroke-[2.5]" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-black dark:text-white shrink-0 mt-0.5 stroke-[2.5]" />
                    )}
                    <div className="space-y-1">
                      <div className="font-mono-code text-xs font-bold">
                        Your answer: <span className="underline">{typedInput}</span>
                        {evalResult?.verdict && (
                          <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-black dark:bg-white text-white dark:text-black">
                            {evalResult.verdict.replace("_", " ")}
                          </span>
                        )}
                      </div>
                      <div className="text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed text-xs">
                        {isEvaluating ? "Evaluating answer..." : evalResult?.shortFeedback}
                      </div>
                      {evalResult?.diffAnalysis && (
                        <div className="text-[10px] text-neutral-600 dark:text-neutral-400 font-mono-code">
                          {evalResult.diffAnalysis}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Card Actions: Pinned neatly at bottom of card */}
          {!isRevealed ? (
            /* FRONT: Centered, single, wide premium FLIP CARD primary button with [SPACE] badge and flat crisp border */
            <div className="pt-4 sm:pt-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-center">
              <button
                id="flip-card-btn"
                onClick={handleReveal}
                className="w-full max-w-sm mx-auto py-3.5 sm:py-4 px-8 bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 active:bg-neutral-950 dark:active:bg-neutral-300 rounded-full font-arial-black text-xs sm:text-sm tracking-wider flex items-center justify-center gap-3 border border-black dark:border-white transition-all cursor-pointer min-h-[50px]"
              >
                <RotateCcw className="w-4 h-4 stroke-[2.5]" />
                <span className="uppercase font-black tracking-widest text-white dark:text-black">FLIP CARD</span>
                <kbd className="inline-flex items-center justify-center px-2 py-0.5 text-[10px] font-mono-code font-bold bg-white dark:bg-black text-black dark:text-white rounded tracking-widest border border-neutral-300 dark:border-neutral-700">
                  SPACE
                </kbd>
              </button>
            </div>
          ) : (
            /* BACK: 4 SRS Rating Buttons as Main Focal Point + Pinned Low-Profile Secondary Bar */
            <div className="pt-4 sm:pt-5 border-t border-neutral-100 dark:border-neutral-800 flex flex-col gap-3.5">
              {/* SRS Rating Focal Point */}
              <div>
                <div className="text-[10px] sm:text-[11px] font-mono-code font-bold text-neutral-500 dark:text-neutral-400 text-center mb-2.5 uppercase tracking-widest">
                  How accurately did you recall this sentence?
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                  <button
                    id="rate-again-btn"
                    onClick={() => handleRate("again")}
                    className="flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-white dark:bg-[#181818] hover:bg-black dark:hover:bg-white text-black dark:text-white hover:text-white dark:hover:text-black border-2 border-black dark:border-neutral-300 transition-colors duration-150 group cursor-pointer min-h-[54px]"
                  >
                    <span className="text-xs sm:text-sm font-arial-black tracking-wider uppercase">AGAIN</span>
                    <span className="text-[10px] font-mono-code font-bold text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-300 dark:group-hover:text-neutral-700 mt-0.5">
                      1 · &lt;1m
                    </span>
                  </button>

                  <button
                    id="rate-hard-btn"
                    onClick={() => handleRate("hard")}
                    className="flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-white dark:bg-[#181818] hover:bg-black dark:hover:bg-white text-black dark:text-white hover:text-white dark:hover:text-black border-2 border-black dark:border-neutral-300 transition-colors duration-150 group cursor-pointer min-h-[54px]"
                  >
                    <span className="text-xs sm:text-sm font-arial-black tracking-wider uppercase">HARD</span>
                    <span className="text-[10px] font-mono-code font-bold text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-300 dark:group-hover:text-neutral-700 mt-0.5">
                      2 · 10m
                    </span>
                  </button>

                  <button
                    id="rate-good-btn"
                    onClick={() => handleRate("good")}
                    className="flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-white dark:bg-[#181818] hover:bg-black dark:hover:bg-white text-black dark:text-white hover:text-white dark:hover:text-black border-2 border-black dark:border-neutral-300 transition-colors duration-150 group cursor-pointer min-h-[54px]"
                  >
                    <span className="text-xs sm:text-sm font-arial-black tracking-wider uppercase">GOOD</span>
                    <span className="text-[10px] font-mono-code font-bold text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-300 dark:group-hover:text-neutral-700 mt-0.5">
                      3 · 1d
                    </span>
                  </button>

                  <button
                    id="rate-easy-btn"
                    onClick={() => handleRate("easy")}
                    className="flex flex-col items-center justify-center py-3 px-2 rounded-xl bg-white dark:bg-[#181818] hover:bg-black dark:hover:bg-white text-black dark:text-white hover:text-white dark:hover:text-black border-2 border-black dark:border-neutral-300 transition-colors duration-150 group cursor-pointer min-h-[54px]"
                  >
                    <span className="text-xs sm:text-sm font-arial-black tracking-wider uppercase">EASY</span>
                    <span className="text-[10px] font-mono-code font-bold text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-300 dark:group-hover:text-neutral-700 mt-0.5">
                      4 · 4d
                    </span>
                  </button>
                </div>
              </div>

              {/* Pinned Low-Profile Secondary Action Bar: + UNDERSTAND THIS SENTENCE [U] */}
              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  id="toggle-understand-btn"
                  onClick={() => setShowUnderstand(!showUnderstand)}
                  className="w-full flex items-center justify-between py-1.5 px-2 rounded-lg text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-xs font-mono-code font-bold cursor-pointer min-h-[38px]"
                >
                  <span className="flex items-center gap-2 tracking-wider text-[11px] uppercase">
                    <Sparkles className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>{showUnderstand ? "− HIDE LINGUISTIC BREAKDOWN" : "+ UNDERSTAND THIS SENTENCE"}</span>
                  </span>
                  <kbd className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[10px] font-mono-code font-bold uppercase rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                    U
                  </kbd>
                </button>

                {showUnderstand && (
                  <div className="mt-3 p-4 sm:p-5 rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-black/10 dark:border-neutral-800 text-xs text-black dark:text-white space-y-4 animate-in fade-in duration-150">
                    {/* Grammar Rule */}
                    <div>
                      <div className="text-[10px] font-mono-code font-bold text-neutral-400 uppercase tracking-widest mb-1">
                        GRAMMAR PRINCIPLE
                      </div>
                      <p className="text-black dark:text-white font-semibold leading-relaxed text-sm">
                        {sentence.explanation.grammarNote}
                      </p>
                    </div>

                    {/* Word Order Rule */}
                    {sentence.explanation.wordOrderRule && (
                      <div>
                        <div className="text-[10px] font-mono-code font-bold text-neutral-400 uppercase tracking-widest mb-1">
                          SYNTAX & WORD ORDER
                        </div>
                        <p className="text-neutral-800 dark:text-neutral-300 leading-relaxed font-mono-code text-xs">
                          {sentence.explanation.wordOrderRule}
                        </p>
                      </div>
                    )}

                    {/* Word-by-Word Breakdown */}
                    {sentence.explanation.wordByWord && sentence.explanation.wordByWord.length > 0 && (
                      <div>
                        <div className="text-[10px] font-mono-code font-bold text-neutral-400 uppercase tracking-widest mb-2">
                          WORD BY WORD
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {sentence.explanation.wordByWord.map((item, idx) => (
                            <div
                              key={idx}
                              className="p-2 rounded-xl bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700 font-mono-code text-xs flex items-center justify-between"
                            >
                              <span className="text-black dark:text-white font-black">{item.word}</span>
                              <span className="text-neutral-600 dark:text-neutral-400 font-medium">{item.meaning}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Literal Translation */}
                    {sentence.explanation.literal && (
                      <div>
                        <div className="text-[10px] font-mono-code font-bold text-neutral-400 uppercase tracking-widest mb-1">
                          LITERAL GLOSS
                        </div>
                        <p className="text-neutral-700 dark:text-neutral-300 italic font-mono-code text-xs">
                          "{sentence.explanation.literal}"
                        </p>
                      </div>
                    )}

                    {/* CEFR Level Justification */}
                    {sentence.explanation.cefrJustification && (
                      <div>
                        <div className="text-[10px] font-mono-code font-bold text-neutral-400 uppercase tracking-widest mb-1">
                          LEVEL {sentence.level} REASONING
                        </div>
                        <p className="text-neutral-700 dark:text-neutral-300 font-mono-code text-xs">
                          {sentence.explanation.cefrJustification}
                        </p>
                      </div>
                    )}

                    {/* AI Deep Grammar Explanation Button */}
                    <div className="pt-2 border-t border-neutral-200 dark:border-neutral-700">
                      {!aiExplanation && !aiLoading && (
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                          <span className="text-xs text-neutral-600 dark:text-neutral-400 font-medium">
                            Need deeper grammatical nuance or preposition analysis?
                          </span>
                          <button
                            id="ask-ai-deep-explanation-btn"
                            onClick={handleFetchAiExplanation}
                            className="px-4 py-2 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-bold tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[40px]"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>EXPLAIN WITH AI</span>
                          </button>
                        </div>
                      )}

                      {aiLoading && (
                        <div className="flex items-center gap-2 py-2 text-black dark:text-white font-mono-code text-xs font-bold">
                          <div className="w-4 h-4 rounded-full border-2 border-black dark:border-white border-t-transparent animate-spin" />
                          <span>Generating CEFR-{sentence.level} linguistic analysis...</span>
                        </div>
                      )}

                      {aiExplanation && (
                        <div className="mt-2 p-4 rounded-xl bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700 text-xs text-black dark:text-white whitespace-pre-line leading-relaxed">
                          <div className="flex items-center gap-1.5 text-black dark:text-white font-mono-code text-[11px] uppercase font-bold mb-2">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>AI LINGUISTIC ANALYSIS</span>
                          </div>
                          {aiExplanation}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </section>

        {/* Footer Shortcut Strip: Standardized shortcut badges (F, P, T, N) with uniform touch targets and responsive flex */}
        <div className="mt-5 sm:mt-8 flex flex-wrap items-center justify-center sm:justify-between gap-1.5 sm:gap-2.5 w-full px-1 sm:px-4 text-xs font-mono-code font-bold text-black dark:text-white">
          <button
            onClick={onFlipDirection}
            className="group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-black dark:text-white min-h-[44px]"
            title="Flip Direction (F)"
          >
            <ArrowLeftRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
            <span className="tracking-wider uppercase text-[10px] sm:text-xs">DIRECTION</span>
            <kbd className="inline-flex items-center justify-center min-w-[18px] sm:min-w-[20px] h-4.5 sm:h-5 px-1 sm:px-1.5 text-[9px] sm:text-[10px] font-mono-code font-bold uppercase rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 group-hover:border-black dark:group-hover:border-white group-hover:bg-white dark:group-hover:bg-[#181818] transition-colors">
              F
            </kbd>
          </button>

          <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
            <button
              onClick={() =>
                speakText(
                  isRevealed ? answerText : promptText,
                  isRevealed ? answerVoiceCode : promptVoiceCode,
                  settings.audioSpeed,
                  settings.selectedVoiceName
                )
              }
              className="group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-black dark:text-white min-h-[44px]"
              title="Pronounce Sentence (P)"
            >
              <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
              <span className="tracking-wider uppercase text-[10px] sm:text-xs">AUDIO</span>
              <kbd className="inline-flex items-center justify-center min-w-[18px] sm:min-w-[20px] h-4.5 sm:h-5 px-1 sm:px-1.5 text-[9px] sm:text-[10px] font-mono-code font-bold uppercase rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 group-hover:border-black dark:group-hover:border-white group-hover:bg-white dark:group-hover:bg-[#181818] transition-colors">
                P
              </kbd>
            </button>

            <button
              onClick={() => onToggleTyping?.()}
              className={`group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-lg transition-colors cursor-pointer min-h-[44px] ${
                settings.typingMode
                  ? "bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200"
                  : "text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
              title="Toggle Typing Mode (T)"
            >
              <Keyboard
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5] ${
                  settings.typingMode
                    ? "text-white dark:text-black"
                    : "text-black dark:text-white"
                }`}
              />
              <span className="tracking-wider uppercase text-[10px] sm:text-xs">TYPING</span>
              <kbd
                className={`inline-flex items-center justify-center min-w-[18px] sm:min-w-[20px] h-4.5 sm:h-5 px-1 sm:px-1.5 text-[9px] sm:text-[10px] font-mono-code font-bold uppercase rounded border transition-colors ${
                  settings.typingMode
                    ? "bg-white dark:bg-black text-black dark:text-white border-white dark:border-black"
                    : "border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 group-hover:border-black dark:group-hover:border-white group-hover:bg-white dark:group-hover:bg-[#181818]"
                }`}
              >
                T
              </kbd>
            </button>

            {onNextCard && (
              <button
                onClick={onNextCard}
                className="group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer text-black dark:text-white min-h-[44px]"
                title="Next Card (N)"
              >
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                <span className="tracking-wider uppercase text-[10px] sm:text-xs">NEXT</span>
                <kbd className="inline-flex items-center justify-center min-w-[18px] sm:min-w-[20px] h-4.5 sm:h-5 px-1 sm:px-1.5 text-[9px] sm:text-[10px] font-mono-code font-bold uppercase rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 group-hover:border-black dark:group-hover:border-white group-hover:bg-white dark:group-hover:bg-[#181818] transition-colors">
                  N
                </kbd>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
