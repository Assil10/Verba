import React, { useState, useRef, useEffect } from "react";
import { ArrowLeftRight, Settings, ChevronDown, Check, Moon, Sun } from "lucide-react";
import { AppSettings } from "../types";
import { CEFR_LEVELS } from "../data/languages";

interface HeaderProps {
  currentTab: "practice" | "review" | "progress";
  onTabChange: (tab: "practice" | "review" | "progress") => void;
  settings: AppSettings;
  onSettingsChange: (newSettings: Partial<AppSettings>) => void;
  onFlipDirection: () => void;
  currentIndex: number;
  totalInQueue: number;
  weakCount: number;
  onOpenSettings: () => void;
  onToggleNightMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  settings,
  onSettingsChange,
  onFlipDirection,
  weakCount,
  onOpenSettings,
  onToggleNightMode,
}) => {
  const [showLevelPopover, setShowLevelPopover] = useState(false);
  const [showLangPopover, setShowLangPopover] = useState(false);
  const levelRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (levelRef.current && !levelRef.current.contains(event.target as Node)) {
        setShowLevelPopover(false);
      }
      if (langRef.current && !langRef.current.contains(event.target as Node)) {
        setShowLangPopover(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setShowLevelPopover(false);
        setShowLangPopover(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const isEnToDe = settings.direction === "en-de";
  const isDarkMode = settings.themeMode === "dark";

  return (
    <header className="w-full bg-white dark:bg-[#0A0A0A] border-b border-neutral-200 dark:border-neutral-800 sticky top-0 z-30 transition-colors">
      <div className="w-full px-3.5 sm:px-6 lg:px-8">
        {/* Main Header Bar */}
        <div className="h-15 sm:h-18 md:h-20 flex items-center justify-between gap-2 sm:gap-4 md:gap-6">
          {/* Brand Logo & Desktop Navigation */}
          <div className="flex items-center gap-3 sm:gap-5 lg:gap-8 min-w-0">
            <button
              id="brand-logo-btn"
              onClick={() => onTabChange("practice")}
              className="group flex items-baseline gap-1 text-left focus:outline-none cursor-pointer py-1 select-none shrink-0"
              aria-label="Verba home"
            >
              <span className="font-arial-black font-black text-xl sm:text-2xl md:text-3xl tracking-[-0.03em] text-black dark:text-white uppercase transition-opacity group-hover:opacity-80">
                Verba
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-black dark:bg-white mb-0.5 shrink-0" />
            </button>

            {/* Desktop & Tablet Navigation Links */}
            <nav
              className="hidden md:flex items-center gap-1 bg-neutral-100 dark:bg-[#141414] p-1 rounded-xl border border-neutral-200/80 dark:border-neutral-800 shrink-0"
              aria-label="Desktop Navigation"
            >
              <button
                id="nav-practice-btn"
                onClick={() => onTabChange("practice")}
                className={`px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-bold tracking-tight rounded-lg transition-all cursor-pointer ${
                  currentTab === "practice"
                    ? "bg-black dark:bg-white text-white dark:text-black shadow-xs"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50"
                }`}
              >
                Practice
              </button>

              <button
                id="nav-review-btn"
                onClick={() => onTabChange("review")}
                className={`px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-bold tracking-tight rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  currentTab === "review"
                    ? "bg-black dark:bg-white text-white dark:text-black shadow-xs"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50"
                }`}
              >
                <span>Review</span>
                {weakCount > 0 && (
                  <span
                    className={`px-1.5 py-0.2 text-[10px] font-mono-code font-bold rounded-full leading-none ${
                      currentTab === "review"
                        ? "bg-white dark:bg-black text-black dark:text-white"
                        : "bg-black dark:bg-white text-white dark:text-black"
                    }`}
                  >
                    {weakCount}
                  </span>
                )}
              </button>

              <button
                id="nav-progress-btn"
                onClick={() => onTabChange("progress")}
                className={`px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-bold tracking-tight rounded-lg transition-all cursor-pointer ${
                  currentTab === "progress"
                    ? "bg-black dark:bg-white text-white dark:text-black shadow-xs"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-200/50 dark:hover:bg-neutral-800/50"
                }`}
              >
                Progress
              </button>
            </nav>
          </div>

          {/* Right Controls: Language, Level, Night Mode & Settings */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Language Switcher Cluster */}
            <div className="relative" ref={langRef}>
              <div className="flex items-center bg-neutral-100 dark:bg-[#141414] border border-neutral-200/80 dark:border-neutral-800 rounded-xl p-0.5 shadow-2xs">
                <button
                  id="lang-selector-btn"
                  onClick={() => setShowLangPopover(!showLangPopover)}
                  className="flex items-center gap-1 px-2 sm:px-2.5 py-1 sm:py-1.5 text-[11px] sm:text-xs md:text-sm font-bold font-mono-code text-black dark:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800/80 rounded-lg transition-colors cursor-pointer"
                  title="Change language direction"
                  aria-expanded={showLangPopover}
                >
                  <span>{isEnToDe ? "EN → DE" : "DE → EN"}</span>
                  <ChevronDown className="w-3 h-3 text-neutral-400 dark:text-neutral-500 stroke-[2.5]" />
                </button>

                <div className="w-px h-3.5 bg-neutral-200 dark:bg-neutral-800 mx-0.5" />

                <button
                  id="flip-direction-btn"
                  onClick={onFlipDirection}
                  className="p-1 sm:p-1.5 text-black dark:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800/80 rounded-lg transition-colors cursor-pointer"
                  title="Flip Direction (F)"
                  aria-label="Flip Language Direction"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>

              {/* Language Popover */}
              {showLangPopover && (
                <div className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-24px)] bg-white dark:bg-[#141414] border-2 border-black dark:border-white rounded-xl shadow-2xl p-2 z-50 animate-in fade-in duration-100">
                  <div className="text-[10px] font-mono-code font-bold text-neutral-400 dark:text-neutral-500 px-3 py-1.5 uppercase tracking-widest">
                    Select Direction
                  </div>
                  <button
                    onClick={() => {
                      onSettingsChange({ direction: "en-de" });
                      setShowLangPopover(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 text-xs font-bold font-mono-code rounded-lg flex items-center justify-between transition-colors cursor-pointer min-h-[44px] ${
                      settings.direction === "en-de"
                        ? "bg-black dark:bg-white text-white dark:text-black"
                        : "text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-[#1E1E1E]"
                    }`}
                  >
                    <span>ENGLISH → GERMAN</span>
                    {settings.direction === "en-de" && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                  <button
                    onClick={() => {
                      onSettingsChange({ direction: "de-en" });
                      setShowLangPopover(false);
                    }}
                    className={`w-full text-left px-3 py-2.5 text-xs font-bold font-mono-code rounded-lg flex items-center justify-between transition-colors cursor-pointer min-h-[44px] ${
                      settings.direction === "de-en"
                        ? "bg-black dark:bg-white text-white dark:text-black"
                        : "text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-[#1E1E1E]"
                    }`}
                  >
                    <span>GERMAN → ENGLISH</span>
                    {settings.direction === "de-en" && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </button>
                </div>
              )}
            </div>

            {/* CEFR Level Selector */}
            <div className="relative" ref={levelRef}>
              <button
                id="cefr-level-btn"
                onClick={() => setShowLevelPopover(!showLevelPopover)}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 min-h-[32px] sm:min-h-[36px] bg-neutral-100 dark:bg-[#141414] border border-neutral-200/80 dark:border-neutral-800 text-[11px] sm:text-xs md:text-sm font-bold font-mono-code text-black dark:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800/80 rounded-xl transition-colors cursor-pointer shadow-2xs"
                title="CEFR Level"
                aria-expanded={showLevelPopover}
              >
                <span>{settings.level}</span>
                <ChevronDown className="w-3 h-3 text-neutral-400 dark:text-neutral-500 stroke-[2.5]" />
              </button>

              {showLevelPopover && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-[#141414] border-2 border-black dark:border-white rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in duration-100">
                  <div className="text-[10px] font-mono-code font-bold text-neutral-400 dark:text-neutral-500 px-2.5 py-1 uppercase tracking-widest">
                    Level
                  </div>
                  {CEFR_LEVELS.map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => {
                        onSettingsChange({ level: lvl });
                        setShowLevelPopover(false);
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-mono-code font-bold rounded-lg flex items-center justify-between transition-colors cursor-pointer min-h-[40px] ${
                        settings.level === lvl
                          ? "bg-black dark:bg-white text-white dark:text-black"
                          : "text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-[#1E1E1E]"
                      }`}
                    >
                      <span>{lvl}</span>
                      {settings.level === lvl && <Check className="w-3 h-3 stroke-[3]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Subtle Divider */}
            <div className="w-px h-4 bg-neutral-200 dark:bg-neutral-800 mx-0.5 hidden sm:block" />

            {/* Action Buttons: Night Mode & Settings */}
            <div className="flex items-center gap-0.5 sm:gap-1.5">
              <button
                id="night-mode-toggle-btn"
                onClick={() => {
                  if (onToggleNightMode) {
                    onToggleNightMode();
                  } else {
                    onSettingsChange({ themeMode: isDarkMode ? "editorial" : "dark" });
                  }
                }}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-[#141414] border border-transparent hover:border-neutral-200/80 dark:hover:border-neutral-800 transition-colors cursor-pointer"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Night Mode"}
                aria-label="Toggle Night Mode"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4 stroke-[2.2] text-white" />
                ) : (
                  <Moon className="w-4 h-4 stroke-[2.2] text-black" />
                )}
              </button>

              <button
                id="open-settings-modal-btn"
                onClick={onOpenSettings}
                className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-xl text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-[#141414] border border-transparent hover:border-neutral-200/80 dark:hover:border-neutral-800 transition-colors cursor-pointer"
                title="Settings"
                aria-label="Settings and Preferences"
              >
                <Settings className="w-4 h-4 stroke-[2.2]" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Segment Bar (Shown on phone screens, clean and thumb-friendly) */}
        <div className="md:hidden pb-2.5 pt-1">
          <nav
            className="grid grid-cols-3 gap-1 bg-neutral-100 dark:bg-[#161616] p-1 rounded-xl border border-neutral-200 dark:border-neutral-800"
            aria-label="Mobile Navigation"
          >
            <button
              onClick={() => onTabChange("practice")}
              className={`py-2 text-xs font-bold tracking-tight rounded-lg transition-all flex items-center justify-center cursor-pointer min-h-[44px] ${
                currentTab === "practice"
                  ? "bg-black dark:bg-white text-white dark:text-black shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
              }`}
            >
              Practice
            </button>

            <button
              onClick={() => onTabChange("review")}
              className={`py-2 text-xs font-bold tracking-tight rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px] ${
                currentTab === "review"
                  ? "bg-black dark:bg-white text-white dark:text-black shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
              }`}
            >
              <span>Review</span>
              {weakCount > 0 && (
                <span
                  className={`px-1.5 py-0.2 text-[9px] font-mono-code font-bold rounded-full leading-none ${
                    currentTab === "review"
                      ? "bg-white dark:bg-black text-black dark:text-white"
                      : "bg-black dark:bg-white text-white dark:text-black"
                  }`}
                >
                  {weakCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onTabChange("progress")}
              className={`py-2 text-xs font-bold tracking-tight rounded-lg transition-all flex items-center justify-center cursor-pointer min-h-[44px] ${
                currentTab === "progress"
                  ? "bg-black dark:bg-white text-white dark:text-black shadow-xs"
                  : "text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white"
              }`}
            >
              Progress
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
