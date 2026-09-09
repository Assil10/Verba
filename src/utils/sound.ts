import { TTSVoicePreference } from "../types";

export interface AvailableVoice {
  name: string;
  lang: string;
  isDefault: boolean;
  detectedGender?: "male" | "female";
}

// Internal speech state tracking
let isSpeechActive = false;
let activeUtterance: SpeechSynthesisUtterance | null = null;
const speechStateListeners = new Set<(isSpeaking: boolean) => void>();

function notifySpeechState(speaking: boolean) {
  isSpeechActive = speaking;
  speechStateListeners.forEach((cb) => {
    try {
      cb(speaking);
    } catch (e) {
      console.warn("Speech listener error:", e);
    }
  });
}

export function subscribeSpeechState(callback: (isSpeaking: boolean) => void): () => void {
  speechStateListeners.add(callback);
  callback(isSpeechActive);
  return () => {
    speechStateListeners.delete(callback);
  };
}

export function isSpeakingNow(): boolean {
  return isSpeechActive;
}

// Cached voice list initialized lazily and refreshed on voiceschanged
let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesListenerInitialized = false;

function refreshVoices(): SpeechSynthesisVoice[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return [];
  }
  try {
    const list = window.speechSynthesis.getVoices();
    if (list && list.length > 0) {
      cachedVoices = list;
    }
    return cachedVoices;
  } catch {
    return [];
  }
}

function initVoicesListener() {
  if (voicesListenerInitialized || typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }
  voicesListenerInitialized = true;
  refreshVoices();

  if ("speechSynthesis" in window) {
    window.speechSynthesis.addEventListener?.("voiceschanged", () => {
      refreshVoices();
    });
    window.speechSynthesis.onvoiceschanged = () => {
      refreshVoices();
    };
  }
}

// Name & metadata heuristics for voice gender detection across major OS & browsers
const MALE_NAME_PATTERNS = [
  /\b(male|männlich|man|mann)\b/i,
  /\b(markus|hans|stefan|thomas|daniel|martin|jürgen|juergen|lukas|klaus|florian|oliver|jan|alex|viktor|michael|yannick|sven|georg|thorsten|christoph|bernd|matthias|dirk|conrad|ralf|jonas|killian|karsten|david|mark|george|brian|arthur|james|ryan|richard)\b/i,
  /german\s+male/i,
  /de-.*-male/i,
  /\(male\)/i,
  /standard-b|wavenet-b|neural2-b|journey-d|standard-d|wavenet-d|neural2-d|standard-e|wavenet-e/i,
];

const FEMALE_NAME_PATTERNS = [
  /\b(female|weiblich|woman|frau)\b/i,
  /\b(anna|sophie|sabine|klara|petra|marlene|hedda|vicki|katja|katrin|eva|gisela|helena|monika|claudia|heike|susanne|birgit|julia|laura|sarah|lea|steffi|amalie|lou|maja|tanja|elke|ingrid|gudrun|zira|samantha|victoria|karen|susan|catherine|linda|jenny|aria|sonia)\b/i,
  /german\s+female/i,
  /de-.*-female/i,
  /\(female\)/i,
  /google\s+deutsch/i,
  /google\s+us\s+english/i,
  /standard-a|wavenet-a|neural2-a|journey-f|standard-c|wavenet-c|neural2-c|standard-f|wavenet-f/i,
];

export function detectVoiceGender(voice: SpeechSynthesisVoice): "male" | "female" | undefined {
  const name = voice.name.toLowerCase();
  for (const pat of MALE_NAME_PATTERNS) {
    if (pat.test(name)) return "male";
  }
  for (const pat of FEMALE_NAME_PATTERNS) {
    if (pat.test(name)) return "female";
  }
  return undefined;
}

export function getAvailableVoices(langPrefix?: string): AvailableVoice[] {
  initVoicesListener();
  const voices = refreshVoices();

  const list: AvailableVoice[] = voices.map((v) => ({
    name: v.name,
    lang: v.lang,
    isDefault: v.default,
    detectedGender: detectVoiceGender(v),
  }));

  if (!langPrefix) return list;

  const prefix = langPrefix.toLowerCase().slice(0, 2);
  return list.filter((v) => v.lang.toLowerCase().startsWith(prefix));
}

/**
 * Robust voice selection strategy:
 * 1. Filter target language voices (de-DE prioritized over de-AT, de-CH, de)
 * 2. If preference is 'male' or 'female', match detected gender
 * 3. If multiple voices exist and none have gender labels, select different voices for male vs female
 * 4. Acoustic pitch modulation in speakText() ensures distinct voice timbre on ALL browsers
 */
export function selectVoice(
  langCode: string = "de-DE",
  preference: TTSVoicePreference = "default",
  preferredVoiceName?: string
): SpeechSynthesisVoice | undefined {
  initVoicesListener();
  const voices = refreshVoices();
  if (voices.length === 0) return undefined;

  // 1. If preference is "default" and exact voice name was selected, honor it
  if (preference === "default" && preferredVoiceName) {
    const matched = voices.find((v) => v.name === preferredVoiceName);
    if (matched) return matched;
  }

  // If a preferred voice name is provided AND its gender matches preference, use it
  if (preferredVoiceName) {
    const matched = voices.find((v) => v.name === preferredVoiceName);
    if (matched) {
      const gender = detectVoiceGender(matched);
      if (gender === preference || !gender) {
        return matched;
      }
    }
  }

  const isGerman = langCode.toLowerCase().startsWith("de");

  if (isGerman) {
    // Separate German voices into de-DE and other variants
    const deDEVoices = voices.filter((v) => v.lang.toLowerCase().replace("_", "-") === "de-de");
    const otherDeVoices = voices.filter(
      (v) =>
        v.lang.toLowerCase().startsWith("de") &&
        v.lang.toLowerCase().replace("_", "-") !== "de-de"
    );
    const allGermanVoices = [...deDEVoices, ...otherDeVoices];

    if (allGermanVoices.length > 0) {
      if (preference === "male") {
        const maleVoice =
          deDEVoices.find((v) => detectVoiceGender(v) === "male") ||
          otherDeVoices.find((v) => detectVoiceGender(v) === "male");
        if (maleVoice) return maleVoice;

        // If no explicit male voice found, but multiple German voices exist:
        // pick a voice that is NOT detected as female, or pick the second voice
        if (allGermanVoices.length > 1) {
          const nonFemale = allGermanVoices.find((v) => detectVoiceGender(v) !== "female");
          if (nonFemale) return nonFemale;
          return allGermanVoices[1];
        }

        return deDEVoices.find((v) => v.default) || deDEVoices[0] || allGermanVoices[0];
      }

      if (preference === "female") {
        const femaleVoice =
          deDEVoices.find((v) => detectVoiceGender(v) === "female") ||
          otherDeVoices.find((v) => detectVoiceGender(v) === "female");
        if (femaleVoice) return femaleVoice;

        return deDEVoices.find((v) => v.default) || deDEVoices[0] || allGermanVoices[0];
      }

      // 'default' preference: use system preferred German voice or first de-DE
      const defaultGerman = allGermanVoices.find((v) => v.default);
      if (defaultGerman) return defaultGerman;
      return deDEVoices[0] || allGermanVoices[0];
    }

    // No German voices found on system: fall back to default voice
    return voices.find((v) => v.default) || voices[0];
  }

  // English or other non-German languages: find matching language voice with gender preference
  const cleanLang = langCode.toLowerCase().replace("_", "-");
  const langVoices = voices.filter(
    (v) =>
      v.lang.toLowerCase().replace("_", "-") === cleanLang ||
      v.lang.toLowerCase().startsWith(cleanLang.slice(0, 2))
  );

  if (langVoices.length > 0) {
    if (preference === "male") {
      const maleVoice = langVoices.find((v) => detectVoiceGender(v) === "male");
      if (maleVoice) return maleVoice;
      if (langVoices.length > 1) return langVoices[1];
    } else if (preference === "female") {
      const femaleVoice = langVoices.find((v) => detectVoiceGender(v) === "female");
      if (femaleVoice) return femaleVoice;
      return langVoices[0];
    }
    return langVoices.find((v) => v.default) || langVoices[0];
  }

  return voices.find((v) => v.default) || voices[0];
}

/**
 * CRITICAL AUDIO REQUIREMENT:
 * Completely terminate any active speech immediately.
 * Never merely pause: use window.speechSynthesis.cancel().
 */
export function stopSpeaking(): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }
  try {
    window.speechSynthesis.cancel();
    activeUtterance = null;
    notifySpeechState(false);
  } catch (err) {
    console.warn("Speech synthesis cancel notice:", err);
  }
}

/**
 * Centralized speak function:
 * Guarantees:
 * - Calling stopSpeaking() immediately before scheduling new utterance
 * - No overlapping speech
 * - Voice selection according to language direction & user gender preference
 * - Universal acoustic modulation (pitch & rate) guaranteeing audible difference
 *   on every browser, even with single-voice systems
 * - Lifecycle state notification for UI
 */
export function speakText(
  text: string,
  langCode: string = "de-DE",
  speed: number = 0.95,
  voicePreference: TTSVoicePreference = "default",
  preferredVoiceName?: string
): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  try {
    // 1. Immediately cancel any previous speech
    stopSpeaking();

    if (!text || text.trim() === "") {
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text.trim());

    // Acoustic pitch and rate modulation:
    // SpeechSynthesisUtterance.pitch is universally supported across all browsers (0.1 to 2.0).
    // This ensures distinct, unmistakable vocal timbre for Male vs Female vs Default.
    let pitch = 1.0;
    let rate = Math.max(0.6, Math.min(1.4, speed));

    if (voicePreference === "male") {
      pitch = 0.80; // Resonant, deeper masculine formant pitch
      rate = Math.max(0.6, Math.min(1.4, speed * 0.96));
    } else if (voicePreference === "female") {
      pitch = 1.22; // Brighter, higher feminine formant pitch
      rate = Math.max(0.6, Math.min(1.4, speed * 1.02));
    } else {
      pitch = 1.0; // Balanced natural default baseline pitch
      rate = Math.max(0.6, Math.min(1.4, speed));
    }

    utterance.pitch = pitch;
    utterance.rate = rate;
    utterance.lang = langCode;

    const selectedVoice = selectVoice(langCode, voicePreference, preferredVoiceName);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang || langCode;
    }

    utterance.onstart = () => {
      activeUtterance = utterance;
      notifySpeechState(true);
    };

    utterance.onend = () => {
      if (activeUtterance === utterance) {
        activeUtterance = null;
        notifySpeechState(false);
      }
    };

    utterance.onerror = () => {
      if (activeUtterance === utterance) {
        activeUtterance = null;
        notifySpeechState(false);
      }
    };

    activeUtterance = utterance;
    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn("Speech synthesis speak notice:", err);
    activeUtterance = null;
    notifySpeechState(false);
  }
}

/**
 * Preview selected German voice with standard phrase tailored to current preference
 */
export function previewVoice(
  voicePreference: TTSVoicePreference = "default",
  speed: number = 0.95,
  preferredVoiceName?: string
): void {
  const samplePhrase =
    voicePreference === "male"
      ? "Hallo, ich bin die männliche Stimme."
      : voicePreference === "female"
      ? "Hallo, ich bin die weibliche Stimme."
      : "Hallo, wie geht es dir?";
  speakText(samplePhrase, "de-DE", speed, voicePreference, preferredVoiceName);
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
    const tickInterval = 0.028;
    const tickCount = Math.floor(durationMs / 1000 / tickInterval);

    for (let i = 0; i < tickCount; i++) {
      const tickTime = now + i * tickInterval;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = i % 2 === 0 ? "triangle" : "sine";
      const freq = 1200 + ((i * 73) % 800);
      osc.frequency.setValueAtTime(freq, tickTime);

      gain.gain.setValueAtTime(0.015, tickTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, tickTime + 0.018);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(tickTime);
      osc.stop(tickTime + 0.02);
    }

    const lockTime = now + durationMs / 1000;
    const lockOsc = ctx.createOscillator();
    const lockGain = ctx.createGain();
    lockOsc.type = "sine";
    lockOsc.frequency.setValueAtTime(1760, lockTime);
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
