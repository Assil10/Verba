import { SentenceItem, TypingEvaluationResult } from "../types";

// Standard Levenshtein distance calculation
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

export function cleanTextForComparison(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'„“”]/g, "")
    .replace(/\s+/g, " ");
}

export function evaluateTypingDeterministically(
  userAttempt: string,
  targetExpected: string,
  sentence: SentenceItem,
  isEnToDe: boolean
): TypingEvaluationResult {
  const trimmedUser = userAttempt.trim();
  const trimmedTarget = targetExpected.trim();

  // 1. Exact match (case-sensitive)
  if (trimmedUser === trimmedTarget) {
    return {
      isCorrect: true,
      verdict: "exact",
      shortFeedback: "Perfect! Exact match with accurate punctuation and casing.",
    };
  }

  const cleanUser = cleanTextForComparison(trimmedUser);
  const cleanTarget = cleanTextForComparison(trimmedTarget);

  // 2. Exact match (ignoring punctuation & case)
  if (cleanUser === cleanTarget) {
    // Check if there was a German noun capitalization mistake
    if (isEnToDe) {
      const userWords = trimmedUser.split(/\s+/);
      const targetWords = trimmedTarget.split(/\s+/);
      let capitalizationMistake = false;

      for (let i = 0; i < Math.min(userWords.length, targetWords.length); i++) {
        const u = userWords[i].replace(/[.,!?]/g, "");
        const t = targetWords[i].replace(/[.,!?]/g, "");
        if (t && t[0] === t[0].toUpperCase() && u && u[0] === u[0].toLowerCase() && i > 0) {
          capitalizationMistake = true;
          break;
        }
      }

      if (capitalizationMistake) {
        return {
          isCorrect: true,
          verdict: "minor_typo",
          shortFeedback: "Good! Remember that all nouns in German are capitalized.",
        };
      }
    }

    return {
      isCorrect: true,
      verdict: "exact",
      shortFeedback: "Correct! Matches the expected translation.",
    };
  }

  // 3. Check known alternatives from sentence schema
  if (sentence.explanation?.alternatives) {
    for (const alt of sentence.explanation.alternatives) {
      if (cleanTextForComparison(alt) === cleanUser) {
        return {
          isCorrect: true,
          verdict: "alternative",
          shortFeedback: "Excellent! That is a completely valid, natural alternative phrasing.",
        };
      }
    }
  }

  // 4. Minor typo check using Levenshtein distance
  const distance = levenshteinDistance(cleanUser, cleanTarget);
  const lengthThreshold = Math.max(cleanTarget.length * 0.15, 2);

  if (distance <= lengthThreshold && cleanUser.length > 5) {
    return {
      isCorrect: true,
      verdict: "minor_typo",
      shortFeedback: `Very close! Minor typo detected. Expected: "${targetExpected}"`,
      diffAnalysis: `Typo distance: ${distance} character differences.`,
    };
  }

  // 5. Grammar / word order check (same set of words, but different order)
  const userTokens = cleanUser.split(" ").sort().join(" ");
  const targetTokens = cleanTarget.split(" ").sort().join(" ");

  if (userTokens === targetTokens && cleanUser !== cleanTarget) {
    return {
      isCorrect: false,
      verdict: "grammar_error",
      shortFeedback: "Word order issue: All necessary words were included, but German verb position rules were violated.",
    };
  }

  // 6. Substantially incorrect
  return {
    isCorrect: false,
    verdict: "incorrect",
    shortFeedback: `Expected: "${targetExpected}". Study the sentence structure below.`,
  };
}

// Full evaluation attempting server-side Gemini first, falling back gracefully to deterministic logic
export async function evaluateUserTyping(
  userAttempt: string,
  targetExpected: string,
  sourceSentence: string,
  sourceLangName: string,
  targetLangName: string,
  sentence: SentenceItem,
  isEnToDe: boolean
): Promise<TypingEvaluationResult> {
  // Run deterministic evaluation first
  const localResult = evaluateTypingDeterministically(
    userAttempt,
    targetExpected,
    sentence,
    isEnToDe
  );

  // If exact or known alternative, no need to waste an API call
  if (localResult.verdict === "exact" || localResult.verdict === "alternative") {
    return localResult;
  }

  // Otherwise, attempt intelligent AI evaluation with 4-second timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch("/api/evaluate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userAttempt,
        targetExpected,
        sourceSentence,
        sourceLang: sourceLangName,
        targetLang: targetLangName,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.verdict) {
        return {
          isCorrect: Boolean(data.isCorrect),
          verdict: data.verdict,
          shortFeedback: data.shortFeedback || localResult.shortFeedback,
          diffAnalysis: data.breakdown,
        };
      }
    }
  } catch {
    // Graceful fallback to deterministic evaluation
  }

  return localResult;
}
