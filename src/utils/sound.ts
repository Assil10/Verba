export interface AvailableVoice {
  name: string;
  lang: string;
  isDefault: boolean;
}

export function getAvailableVoices(langPrefix?: string): AvailableVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return [];
  }
  const voices = window.speechSynthesis.getVoices();
  const list = voices.map((v) => ({
    name: v.name,
    lang: v.lang,
    isDefault: v.default,
  }));

  if (!langPrefix) return list;

  const prefix = langPrefix.toLowerCase().slice(0, 2);
  return list.filter((v) => v.lang.toLowerCase().startsWith(prefix));
}

export function speakText(
  text: string,
  langCode: string = "de-DE",
  speed: number = 0.95,
  preferredVoiceName?: string
): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  try {
    // Cancel any ongoing speech to avoid overlapping
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = Math.max(0.6, Math.min(1.4, speed));
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    let selectedVoice: SpeechSynthesisVoice | undefined;

    if (preferredVoiceName) {
      selectedVoice = voices.find((v) => v.name === preferredVoiceName);
    }

    if (!selectedVoice) {
      const cleanLang = langCode.toLowerCase().replace("_", "-");
      selectedVoice = voices.find(
        (v) =>
          v.lang.toLowerCase() === cleanLang ||
          v.lang.toLowerCase().startsWith(cleanLang.slice(0, 2))
      );
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.lang = langCode;

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("Speech synthesis notice:", err);
  }
}

// Minimal haptic-like click using Web Audio API
export function playSubtleClick(type: "reveal" | "rate" | "flip" | "click" = "reveal"): void {
  if (
    typeof window === "undefined" ||
    !("AudioContext" in window || "webkitAudioContext" in (window as any))
  ) {
    return;
  }

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    const now = ctx.currentTime;

    if (type === "reveal") {
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(560, now + 0.08);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    } else if (type === "rate") {
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(380, now + 0.06);
      gain.gain.setValueAtTime(0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    } else {
      osc.frequency.setValueAtTime(480, now);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    }

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.1);
  } catch {
    // Gracefully ignore audio context blocks
  }
}

// Synthesized tactile mechanical ticker soundtrack for text scramble animation
export function playScrambleSound(durationMs: number = 420): void {
  if (
    typeof window === "undefined" ||
    !("AudioContext" in window || "webkitAudioContext" in (window as any))
  ) {
    return;
  }

  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    // Rapid mechanical ticks every ~28ms across the entire duration
    const tickInterval = 0.028;
    const tickCount = Math.floor(durationMs / 1000 / tickInterval);

    for (let i = 0; i < tickCount; i++) {
      const tickTime = now + i * tickInterval;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = i % 2 === 0 ? "triangle" : "sine";
      // Stepped micro-frequencies that flutter during scramble
      const freq = 1200 + ((i * 73) % 800);
      osc.frequency.setValueAtTime(freq, tickTime);

      gain.gain.setValueAtTime(0.015, tickTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, tickTime + 0.018);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(tickTime);
      osc.stop(tickTime + 0.02);
    }

    // Final sudden reveal lock-in click sound at the exact end of duration
    const lockTime = now + durationMs / 1000;
    const lockOsc = ctx.createOscillator();
    const lockGain = ctx.createGain();
    lockOsc.type = "sine";
    lockOsc.frequency.setValueAtTime(1760, lockTime); // A6 note lock
    lockGain.gain.setValueAtTime(0.035, lockTime);
    lockGain.gain.exponentialRampToValueAtTime(0.0001, lockTime + 0.06);

    lockOsc.connect(lockGain);
    lockGain.connect(ctx.destination);
    lockOsc.start(lockTime);
    lockOsc.stop(lockTime + 0.065);
  } catch {
    // Gracefully ignore audio context blocks
  }
}
