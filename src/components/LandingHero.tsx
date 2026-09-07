import React, { useState } from "react";
import { ArrowRight, Volume2, Sparkles, Check } from "lucide-react";
import { AppSettings, CEFRLevel, Direction } from "../types";

interface LandingHeroProps {
  onStartPracticing: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
}

export const LandingHero: React.FC<LandingHeroProps> = ({
  onStartPracticing,
  settings,
  onUpdateSettings,
}) => {
  const [interactiveRevealed, setInteractiveRevealed] = useState(false);

  return (
    <div className="w-full min-h-[calc(100vh-140px)] flex flex-col items-center justify-center py-12 px-4">
      {/* Hero Section */}
      <div className="max-w-2xl w-full text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-surface)] border border-[var(--border-color)] text-[11px] font-mono-code text-[var(--text-med)] uppercase tracking-wider mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Language training, without the noise</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-[var(--text-high)] mb-4">
          Think in another language.
        </h1>

        <p className="text-base sm:text-lg text-[var(--text-med)] leading-relaxed max-w-lg mx-auto mb-8 font-editorial italic">
          See a sentence. Build the translation in your head. Reveal the answer. Do it again.
        </p>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            id="hero-start-practicing-btn"
            onClick={onStartPracticing}
            className="w-full sm:w-auto px-8 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-sm rounded-xl transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20"
          >
            <span>START PRACTICING</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Subtle Interactive Card Preview */}
      <div className="w-full max-w-xl">
        <div className="text-center text-[10px] font-mono-code text-[var(--text-low)] uppercase tracking-widest mb-2">
          LIVE INTERACTION PREVIEW
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden transition-all">
          <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
            <span className="text-[11px] font-mono-code text-emerald-400 font-semibold uppercase">
              GERMAN · B1 · EVERYDAY LIFE
            </span>
            <span className="text-[10px] font-mono-code text-[var(--text-low)]">
              PREVIEW
            </span>
          </div>

          <div className="py-6">
            <p className="text-xl sm:text-2xl font-medium text-[var(--text-high)] tracking-tight">
              Ich lebe seit drei Jahren in Berlin.
            </p>
          </div>

          {!interactiveRevealed ? (
            <div className="pt-4 border-t border-[var(--border-color)] flex flex-col items-center">
              <button
                id="preview-reveal-btn"
                onClick={() => setInteractiveRevealed(true)}
                className="px-6 py-2.5 bg-[var(--bg-surface-elevated)] hover:bg-[var(--border-color)] border border-[var(--border-highlight)] rounded-xl text-xs font-medium text-[var(--text-high)] transition-colors cursor-pointer"
              >
                REVEAL TRANSLATION
              </button>
              <div className="mt-2 text-[10px] font-mono-code text-[var(--text-low)]">
                Click to preview answer state
              </div>
            </div>
          ) : (
            <div className="pt-4 border-t border-[var(--border-color)] animate-in fade-in duration-200">
              <div className="text-[10px] font-mono-code text-[var(--text-med)] uppercase mb-1">
                ENGLISH
              </div>
              <p className="text-lg font-editorial italic text-emerald-400 mb-4">
                I have been living in Berlin for three years.
              </p>

              <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[var(--border-color)]">
                <button
                  onClick={onStartPracticing}
                  className="p-2 rounded-lg bg-[var(--bg-surface-elevated)] text-red-400 text-[11px] font-medium text-center border border-[var(--border-color)]"
                >
                  AGAIN
                </button>
                <button
                  onClick={onStartPracticing}
                  className="p-2 rounded-lg bg-[var(--bg-surface-elevated)] text-amber-400 text-[11px] font-medium text-center border border-[var(--border-color)]"
                >
                  HARD
                </button>
                <button
                  onClick={onStartPracticing}
                  className="p-2 rounded-lg bg-[var(--bg-surface-elevated)] text-emerald-400 text-[11px] font-medium text-center border border-[var(--border-color)]"
                >
                  GOOD
                </button>
                <button
                  onClick={onStartPracticing}
                  className="p-2 rounded-lg bg-[var(--bg-surface-elevated)] text-blue-400 text-[11px] font-medium text-center border border-[var(--border-color)]"
                >
                  EASY
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
