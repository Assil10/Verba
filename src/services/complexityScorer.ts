import { SentenceItem, GrammarDepthLevel } from "../types";
import { SUBORDINATING_CONJUNCTIONS, COLLOCATIONS } from "./lexicon";

export interface ComplexityResult {
  depthLevel: GrammarDepthLevel;
  depthLabel: "Micro" | "Short" | "Standard" | "Deep" | "Advanced";
  score: number;
  factors: string[];
}

export function determineSentenceComplexity(sentence: SentenceItem): ComplexityResult {
  const text = sentence.sourceText.trim();
  const rawWords = text.split(/\s+/).filter(Boolean);
  const wordCount = rawWords.length;
  const level = sentence.level || "A1";

  // 1. CEFR BASE SCORE
  let score = 1.0;
  if (level === "A2") score = 2.0;
  else if (level === "B1") score = 3.0;
  else if (level === "B2") score = 4.0;
  else if (level === "C1") score = 5.0;

  const factors: string[] = [`CEFR ${level} base`];

  // 2. CHECK SPECIFIC GRAMMATICAL COMPLEXITY FACTORS
  const lowerText = text.toLowerCase();

  // Subordinating conjunctions (Verb at end)
  const hasSubordinateConj = Object.keys(SUBORDINATING_CONJUNCTIONS).some((conj) =>
    new RegExp(`\\b${conj}\\b`, "i").test(text)
  );
  if (hasSubordinateConj) {
    score += 1.2;
    factors.push("subordinate conjunction");
  }

  // Relative clause (comma followed by der/die/das/dessen/deren/denen/welche)
  if (/,\s*(?:der|die|das|dem|den|dessen|deren|denen|welcher|welche|welches)\b/i.test(text)) {
    score += 1.0;
    factors.push("relative clause");
  }

  // Infinitive clause with 'zu' or 'um ... zu'
  if (/\bzu\s+[a-zäöüß]+(?:en|eln|ern)\b/i.test(text) || /\bum\s+zu\b/i.test(text)) {
    score += 1.0;
    factors.push("infinitive clause with 'zu'");
  }

  // Passive voice (wird/werden/wurde/wurden/worden + Partizip)
  if (/\b(wird|werden|wurde|wurden)\b/i.test(text) && /\b[a-zäöüß]+(?:t|en)\s+(?:werden|worden)\b/i.test(text)) {
    score += 1.2;
    factors.push("passive voice");
  }

  // Konjunktiv II
  if (/\b(hätte|hätten|wäre|wären|könnte|könnten|würde|würden|müsste|müssten|sollte|sollten)\b/i.test(text)) {
    score += 1.0;
    factors.push("subjunctive II (Konjunktiv)");
  }

  // Perfect tense (Satzklammer)
  if (/\b(hat|habe|haben|hatte|ist|sind|war|bin|bist)\b/i.test(text) && /\bge[a-zäöüß]+(?:t|en)\b/i.test(text)) {
    score += 0.7;
    factors.push("compound tense (Perfekt)");
  }

  // Dative governing verbs
  if (/\b(hilft|helfe|helfen|geholfen|dankt|danke|gehört|gefällt|schmeckt|passt)\b/i.test(text)) {
    score += 0.7;
    factors.push("dative governing verb");
  }

  // Genitive prepositions
  if (/\b(wegen|trotz|während|aufgrund|infolge|anstelle)\b/i.test(text)) {
    score += 1.0;
    factors.push("genitive preposition");
  }

  // Adjective declension in accusative or dative (e.g. einen kleinen Hund, mit frischem Brot)
  if (/\b(?:einen|einem|einer|meinen|meinem|ihrem|seinem|frischen|kleinen|großen|alten|neuen)\s+[A-ZÄÖÜ][a-zäöüß]+/i.test(text)) {
    score += 0.6;
    factors.push("adjective inflection");
  }

  // Collocations / Funktionsverbgefüge
  if (COLLOCATIONS.some((c) => c.pattern.test(text))) {
    score += 1.1;
    factors.push("noun-verb collocation");
  }

  // Multi-clause sentence (comma separating clauses)
  if (text.includes(",") && (hasSubordinateConj || text.includes(" und ") || text.includes(" aber ") || text.includes(" denn "))) {
    score += 0.5;
    factors.push("multi-clause structure");
  }

  // 3. SENTENCE LENGTH MODIFIERS
  if (wordCount <= 4) {
    score -= 1.2;
    factors.push("short sentence (<= 4 words)");
  } else if (wordCount <= 6 && !hasSubordinateConj && !text.includes(",")) {
    score -= 0.6;
    factors.push("compact simple sentence");
  } else if (wordCount >= 14) {
    score += 0.8;
    factors.push("extended sentence (>= 14 words)");
  } else if (wordCount >= 20) {
    score += 1.5;
    factors.push("complex sentence (>= 20 words)");
  }

  // 4. MAP TO DEPTH LEVEL (1 to 5)
  let depthLevel: GrammarDepthLevel = 3;
  let depthLabel: "Micro" | "Short" | "Standard" | "Deep" | "Advanced" = "Standard";

  if (score <= 1.5) {
    depthLevel = 1;
    depthLabel = "Micro";
  } else if (score <= 2.7) {
    depthLevel = 2;
    depthLabel = "Short";
  } else if (score <= 3.8) {
    depthLevel = 3;
    depthLabel = "Standard";
  } else if (score <= 4.8) {
    depthLevel = 4;
    depthLabel = "Deep";
  } else {
    depthLevel = 5;
    depthLabel = "Advanced";
  }

  return {
    depthLevel,
    depthLabel,
    score,
    factors,
  };
}
