import React, { useState, useEffect, useRef } from "react";
import { X, Download, Upload, AlertTriangle, Moon, Sun } from "lucide-react";
import { AppSettings } from "../types";
import { CEFR_LEVELS } from "../data/languages";
import { getAvailableVoices, AvailableVoice } from "../utils/sound";
import { storageService } from "../services/storageService";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onDataResetOrImported: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onDataResetOrImported,
}) => {
  const [voices, setVoices] = useState<AvailableVoice[]>([]);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const v = getAvailableVoices();
    setVoices(v);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = () => {
        setVoices(getAvailableVoices());
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleExport = () => {
    const jsonStr = storageService.exportData();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `verba-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = storageService.importData(content);
      if (res.success) {
        setImportStatus("Data imported successfully!");
        onDataResetOrImported();
        setTimeout(() => setImportStatus(null), 3000);
      } else {
        setImportStatus(`Import error: ${res.error}`);
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = "";
  };

  const handleReset = () => {
    storageService.resetProgress();
    setShowResetConfirm(false);
    onDataResetOrImported();
  };

  const handleLoadDemo = () => {
    storageService.loadDemoData();
    onDataResetOrImported();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-[#121212] border-2 border-black dark:border-white rounded-2xl sm:rounded-[2rem] max-w-lg w-full p-5 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto text-black dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-200 dark:border-neutral-800 mb-6">
          <div>
            <div className="text-[10px] font-mono-code font-bold uppercase text-neutral-400 dark:text-neutral-500 tracking-widest mb-1">
              PREFERENCES &amp; BACKUP
            </div>
            <div className="font-arial-black text-xl sm:text-2xl text-black dark:text-white tracking-tight uppercase">
              Settings
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-black dark:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Close settings"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        <div className="space-y-6 text-xs font-mono-code">
          {/* Appearance / Night Mode */}
          <div>
            <label className="block text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-bold mb-2">
              Appearance (Night Mode)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSettings({ themeMode: "editorial" })}
                className={`p-3 rounded-xl border-2 text-center font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  settings.themeMode !== "dark"
                    ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                    : "border-neutral-200 dark:border-neutral-800 text-black dark:text-white hover:border-black dark:hover:border-white"
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>LIGHT MODE</span>
              </button>
              <button
                onClick={() => onUpdateSettings({ themeMode: "dark" })}
                className={`p-3 rounded-xl border-2 text-center font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  settings.themeMode === "dark"
                    ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                    : "border-neutral-200 dark:border-neutral-800 text-black dark:text-white hover:border-black dark:hover:border-white"
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>NIGHT MODE</span>
              </button>
            </div>
          </div>

          {/* Practice Direction */}
          <div>
            <label className="block text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-bold mb-2">
              Default Direction
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSettings({ direction: "en-de" })}
                className={`p-3 rounded-xl border-2 text-center font-bold transition-all cursor-pointer ${
                  settings.direction === "en-de"
                    ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                    : "border-neutral-200 dark:border-neutral-800 text-black dark:text-white hover:border-black dark:hover:border-white"
                }`}
              >
                ENGLISH → GERMAN
              </button>
              <button
                onClick={() => onUpdateSettings({ direction: "de-en" })}
                className={`p-3 rounded-xl border-2 text-center font-bold transition-all cursor-pointer ${
                  settings.direction === "de-en"
                    ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                    : "border-neutral-200 dark:border-neutral-800 text-black dark:text-white hover:border-black dark:hover:border-white"
                }`}
              >
                GERMAN → ENGLISH
              </button>
            </div>
          </div>

          {/* Default CEFR Level */}
          <div>
            <label className="block text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-bold mb-2">
              CEFR Level
            </label>
            <div className="flex gap-2">
              {CEFR_LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => onUpdateSettings({ level: lvl })}
                  className={`flex-1 py-2.5 rounded-xl text-center border-2 transition-all cursor-pointer font-bold ${
                    settings.level === lvl
                      ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                      : "border-neutral-200 dark:border-neutral-800 text-black dark:text-white hover:border-black dark:hover:border-white"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Daily Goal */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-bold">
                Daily Goal
              </label>
              <span className="font-bold text-black dark:text-white">
                {settings.dailyGoal} sentences
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[10, 20, 30, 50].map((count) => (
                <button
                  key={count}
                  onClick={() => onUpdateSettings({ dailyGoal: count })}
                  className={`py-2 rounded-xl text-center border-2 transition-all cursor-pointer font-bold ${
                    settings.dailyGoal === count
                      ? "bg-black dark:bg-white text-white dark:text-black border-black dark:border-white"
                      : "border-neutral-200 dark:border-neutral-800 text-black dark:text-white hover:border-black dark:hover:border-white"
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>

          {/* Audio Speech Speed & Voice Preference */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-bold">
                Speech Speed ({settings.audioSpeed.toFixed(2)}x)
              </label>
            </div>
            <input
              type="range"
              min="0.7"
              max="1.3"
              step="0.05"
              value={settings.audioSpeed}
              onChange={(e) => onUpdateSettings({ audioSpeed: parseFloat(e.target.value) })}
              className="w-full accent-black dark:accent-white cursor-pointer"
            />
          </div>

          {voices.length > 0 && (
            <div>
              <label className="block text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-bold mb-2">
                Preferred Voice (TTS)
              </label>
              <select
                value={settings.selectedVoiceName || ""}
                onChange={(e) => onUpdateSettings({ selectedVoiceName: e.target.value || undefined })}
                className="w-full px-3 py-2.5 bg-white dark:bg-[#1A1A1A] border-2 border-black dark:border-neutral-300 rounded-xl text-black dark:text-white focus:outline-none font-bold text-xs"
              >
                <option value="">System Default</option>
                {voices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Typing Mode Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800">
            <div>
              <div className="font-bold text-black dark:text-white uppercase tracking-wider text-xs">Typing Mode</div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-sans">
                Type translation before reveal with smart analysis
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.typingMode}
              onChange={(e) => onUpdateSettings({ typingMode: e.target.checked })}
              className="accent-black dark:accent-white w-4 h-4 rounded cursor-pointer"
            />
          </div>

          {/* Auto Pronounce Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-neutral-200 dark:border-neutral-800">
            <div>
              <div className="font-bold text-black dark:text-white uppercase tracking-wider text-xs">Auto Pronunciation</div>
              <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-sans">
                Speak translation immediately upon reveal
              </div>
            </div>
            <input
              type="checkbox"
              checked={settings.autoSpeak}
              onChange={(e) => onUpdateSettings({ autoSpeak: e.target.checked })}
              className="accent-black dark:accent-white w-4 h-4 rounded cursor-pointer"
            />
          </div>

          {/* Data Backup & Export/Import */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <div className="text-neutral-500 dark:text-neutral-400 uppercase tracking-widest font-bold mb-3">
              Data Management &amp; Backup
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={handleExport}
                className="flex-1 py-3 px-4 rounded-full bg-white dark:bg-[#181818] hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black border-2 border-black dark:border-white text-black dark:text-white font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export (JSON)</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-3 px-4 rounded-full bg-white dark:bg-[#181818] hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black border-2 border-black dark:border-white text-black dark:text-white font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Import Backup</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {importStatus && (
              <div className="mt-2 text-xs text-black dark:text-white font-bold text-center">
                {importStatus}
              </div>
            )}
          </div>

          {/* Reset Progress Section */}
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
            {!showResetConfirm ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-black dark:text-white font-bold uppercase">Reset Progress</div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-sans">
                    Clear all streaks, ratings, and intervals
                  </div>
                </div>
                <button
                  onClick={() => setShowResetConfirm(true)}
                  className="px-4 py-2 rounded-full border border-black dark:border-white text-black dark:text-white hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black text-xs font-bold transition-colors cursor-pointer"
                >
                  Reset All
                </button>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-neutral-100 dark:bg-[#1A1A1A] border-2 border-black dark:border-white space-y-3">
                <div className="flex items-start gap-2 text-black dark:text-white">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="text-xs font-bold">
                    Are you sure? This will delete all your authentic practice history and reset your streak.
                  </span>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowResetConfirm(false)}
                    className="px-4 py-1.5 rounded-full border border-black dark:border-white text-black dark:text-white text-xs font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-4 py-1.5 rounded-full bg-black dark:bg-white text-white dark:text-black font-bold text-xs cursor-pointer"
                  >
                    Yes, Reset Everything
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Developer Testing Note */}
          <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-[11px] text-neutral-500 dark:text-neutral-400 font-sans">
            <span>Need sample data for UX testing?</span>
            <button
              onClick={handleLoadDemo}
              className="text-black dark:text-white font-bold hover:underline cursor-pointer"
            >
              Load Demo Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
