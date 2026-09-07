import React, { useEffect, useState } from "react";
import { playScrambleSound } from "../utils/sound";

interface ScrambleTextProps {
  text: string;
  triggerKey?: string | number | boolean;
  duration?: number; // Total scramble duration in ms
  className?: string;
  onComplete?: () => void;
  playSound?: boolean;
}

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!#%&*?@$+/~";

export const ScrambleText: React.FC<ScrambleTextProps> = ({
  text,
  triggerKey,
  duration = 460,
  className = "",
  onComplete,
  playSound = true,
}) => {
  const [displayText, setDisplayText] = useState(text);
  const [isScrambling, setIsScrambling] = useState(true);

  useEffect(() => {
    // Respect reduced motion accessibility
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplayText(text);
      setIsScrambling(false);
      if (onComplete) onComplete();
      return;
    }

    setIsScrambling(true);

    // Play synthesized mechanical ticker soundtrack during scramble
    if (playSound) {
      playScrambleSound(duration);
    }

    const intervalMs = 28; // Rapid glyph changes
    const totalSteps = Math.max(10, Math.floor(duration / intervalMs));
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;

      // Scramble ALL letters continuously across the entire sentence without revealing bit-by-bit
      const scrambled = text
        .split("")
        .map((char) => {
          if (char === " " || char === "\n" || char === "\t") return char;
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        })
        .join("");

      setDisplayText(scrambled);

      // When the duration finishes: SUDDENLY reveal all the sentence at once!
      if (currentStep >= totalSteps) {
        clearInterval(interval);
        setDisplayText(text);
        setIsScrambling(false);
        if (onComplete) onComplete();
      }
    }, intervalMs);

    return () => {
      clearInterval(interval);
    };
  }, [text, triggerKey, duration, onComplete, playSound]);

  return (
    <span
      className={`inline-block transition-[filter] ${
        isScrambling ? "blur-[2.5px] select-none" : "blur-none"
      } ${className}`}
      style={{
        willChange: "filter",
        transitionDuration: isScrambling ? "0ms" : "120ms",
      }}
    >
      {displayText}
    </span>
  );
};
