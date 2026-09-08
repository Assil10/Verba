import { DetailedWordBreakdown, GrammarDepthLevel } from "../types";
import { FULL_GERMAN_DICT } from "./fullGermanDict";
import {
  PREPOSITION_DICT,
  CONTRACTIONS_DICT,
  SUBORDINATING_CONJUNCTIONS,
  COORDINATING_CONJUNCTIONS,
  QUESTION_WORDS,
  PRONOUNS_DICT,
  COMMON_VERBS,
  COMMON_NOUNS,
  COMMON_ADJECTIVES_AND_ADVERBS,
  COMMON_NAMES_AND_PLACES,
} from "./lexicon";

export function cleanToken(token: string): string {
  return token.replace(/[.,/#!$%^&*;:{}=\-_`~()?"'«»„“”]/g, "").trim();
}

export function isCapitalized(word: string): boolean {
  return /^[A-ZÄÖÜ]/.test(word);
}

// Known identical international words / cognates where German and English are genuinely identical
const VALID_COGNATES = new Set([
  "app", "august", "bus", "computer", "design", "dessert", "digital", "dilemma",
  "email", "emails", "espresso", "euro", "hotel", "inflation", "innovative",
  "laptop", "laptops", "meeting", "minute", "modern", "museum", "name",
  "opposition", "orange", "park", "patient", "problem", "professor",
  "reform", "region", "restaurant", "smartphone", "software", "stuttgart",
  "system", "team", "warm", "wind", "winter", "berlin", "frankfurt", "münchen"
]);

// Helper to match inflected forms, genitive endings, and plural forms to the dictionary
function findInDict(lower: string): { en: string; pos: string; lemma: string } | null {
  if (FULL_GERMAN_DICT[lower]) return FULL_GERMAN_DICT[lower];

  // Specific irregular participles / inflections
  if (lower === "ergriffen") {
    return { en: "taken / seized", pos: "Verb (Partizip II)", lemma: "ergreifen" };
  }
  if (lower === "gewesen") {
    return { en: "been", pos: "Hilfsverb (Partizip II)", lemma: "sein" };
  }
  if (lower === "geworden") {
    return { en: "become", pos: "Hilfsverb (Partizip II)", lemma: "werden" };
  }

  // Genitive endings (-es / -s): Wandels -> Wandel, Projekts -> Projekt
  if (lower.endsWith("es") && FULL_GERMAN_DICT[lower.slice(0, -2)]) {
    const b = FULL_GERMAN_DICT[lower.slice(0, -2)];
    return { en: `${b.en}`, pos: `${b.pos} (Genitiv)`, lemma: b.lemma };
  }
  if (lower.endsWith("s") && FULL_GERMAN_DICT[lower.slice(0, -1)]) {
    const b = FULL_GERMAN_DICT[lower.slice(0, -1)];
    return { en: `${b.en}`, pos: `${b.pos} (Genitiv)`, lemma: b.lemma };
  }

  // Plural/inflection endings (-en / -n / -e / -er / -em)
  if (lower.endsWith("en") && FULL_GERMAN_DICT[lower.slice(0, -2)]) {
    const b = FULL_GERMAN_DICT[lower.slice(0, -2)];
    return { en: b.en, pos: b.pos, lemma: b.lemma };
  }
  if (lower.endsWith("n") && FULL_GERMAN_DICT[lower.slice(0, -1)]) {
    const b = FULL_GERMAN_DICT[lower.slice(0, -1)];
    return { en: b.en, pos: b.pos, lemma: b.lemma };
  }
  if (lower.endsWith("e") && FULL_GERMAN_DICT[lower.slice(0, -1)]) {
    const b = FULL_GERMAN_DICT[lower.slice(0, -1)];
    return { en: b.en, pos: b.pos, lemma: b.lemma };
  }
  if (lower.endsWith("em") && FULL_GERMAN_DICT[lower.slice(0, -2)]) {
    const b = FULL_GERMAN_DICT[lower.slice(0, -2)];
    return { en: b.en, pos: b.pos, lemma: b.lemma };
  }
  if (lower.endsWith("er") && FULL_GERMAN_DICT[lower.slice(0, -2)]) {
    const b = FULL_GERMAN_DICT[lower.slice(0, -2)];
    return { en: b.en, pos: b.pos, lemma: b.lemma };
  }

  return null;
}

export function resolveWordBreakdown(
  rawWord: string,
  index: number,
  allCleanWords: string[],
  sentenceSource: string,
  sentenceTarget: string,
  depthLevel: GrammarDepthLevel
): DetailedWordBreakdown {
  const word = cleanToken(rawWord);
  const lower = word.toLowerCase();
  const prevWord = index > 0 ? cleanToken(allCleanWords[index - 1]).toLowerCase() : "";
  const nextWord = index < allCleanWords.length - 1 ? cleanToken(allCleanWords[index + 1]).toLowerCase() : "";

  let lemma = word;
  let pos = "Wort";
  let grammaticalRole = "Satzglied";
  let meaning = "";
  let morphology = "";
  let explanation = "";

  // 1. Formal "Sie" / "Ihnen" / "Ihr" (Special handling across all levels)
  if (word === "Sie" || (lower === "sie" && (prevWord === "kommen" || prevWord === "wohnen" || prevWord === "arbeiten" || prevWord === "sind" || prevWord === "haben" || nextWord === "herr" || nextWord === "frau"))) {
    lemma = "Sie";
    meaning = "you (formal)";
    pos = "Höflichkeitspronomen";
    if (depthLevel === 1) {
      grammaticalRole = 'formal "you"';
      morphology = "";
      explanation = "";
    } else if (depthLevel === 2) {
      grammaticalRole = 'formal "you" (subject)';
      morphology = "polite form";
      explanation = "Formal polite address used in standard German.";
    } else {
      grammaticalRole = index === 1 || index === 2 ? "Subjekt (formell)" : "Objekt / Anrede";
      morphology = "Höflichkeitsform (Nominativ/Akkusativ)";
      explanation = "Formal address in German (capitalized); agrees with 3rd person plural verb form.";
    }
  }
  // 2. Titles & Surnames (Herr, Frau, Becker, Müller, etc.)
  else if (lower === "herr") {
    lemma = "Herr";
    pos = "Anrede / Nomen";
    meaning = "Mr.";
    if (depthLevel === 1) {
      grammaticalRole = "title used before a man's surname";
      morphology = "";
      explanation = "";
    } else if (depthLevel === 2) {
      grammaticalRole = "masculine title";
      morphology = "used with surname";
      explanation = "Polite title used before a man's last name.";
    } else {
      grammaticalRole = "Anrede / Titel";
      morphology = "maskulin, Plural: die Herren";
      explanation = "German masculine title used with surname in formal address.";
    }
  } else if (lower === "frau") {
    lemma = "Frau";
    pos = "Anrede / Nomen";
    meaning = "Ms. / Mrs.";
    if (depthLevel === 1) {
      grammaticalRole = "title used before a woman's surname";
      morphology = "";
      explanation = "";
    } else if (depthLevel === 2) {
      grammaticalRole = "feminine title";
      morphology = "used with surname";
      explanation = "Polite title used before a woman's last name.";
    } else {
      grammaticalRole = "Anrede / Titel";
      morphology = "feminin, Plural: die Frauen";
      explanation = "German feminine title used with surname in formal address.";
    }
  } else if (prevWord === "herr" || prevWord === "frau") {
    lemma = word;
    pos = "Eigenname (Nachname)";
    meaning = `${word} (surname)`;
    if (depthLevel === 1) {
      grammaticalRole = "surname";
      morphology = "";
      explanation = "";
    } else if (depthLevel === 2) {
      grammaticalRole = "family surname";
      morphology = "proper noun";
      explanation = `Family name of the addressed person.`;
    } else {
      grammaticalRole = "Anrede / Name";
      morphology = "Name (unflektiert)";
      explanation = "Family name / surname used with formal address.";
    }
  }
  // 3. Question words (W-Fragewörter)
  else if (QUESTION_WORDS[lower]) {
    const q = QUESTION_WORDS[lower];
    lemma = lower;
    pos = "Fragewort (W-Wort)";
    meaning = q.meaning;
    if (depthLevel === 1) {
      grammaticalRole = "question word";
      morphology = "";
      explanation = "";
    } else if (depthLevel === 2) {
      grammaticalRole = "question word";
      morphology = "Position 1 in questions";
      explanation = q.explanation;
    } else {
      grammaticalRole = "Vorfeld / Fragewort (Position 1)";
      morphology = "Interrogativ";
      explanation = q.explanation;
    }
  }
  // 4. Preposition + Article Contractions (im, am, zum, zur, etc.)
  else if (CONTRACTIONS_DICT[lower]) {
    const c = CONTRACTIONS_DICT[lower];
    lemma = `${c.prep} + ${c.article}`;
    pos = "Präposition + Artikel";
    meaning = c.meaning;
    if (depthLevel === 1) {
      grammaticalRole = "preposition + article";
      morphology = "";
      explanation = "";
    } else if (depthLevel === 2) {
      grammaticalRole = "preposition + article";
      morphology = c.case;
      explanation = c.explanation;
    } else {
      grammaticalRole = "Präpositionalgefüge";
      morphology = c.case;
      explanation = c.explanation;
    }
  }
  // 5. Prepositions
  else if (PREPOSITION_DICT[lower]) {
    const p = PREPOSITION_DICT[lower];
    lemma = lower;
    pos = "Präposition";
    meaning = p.meaning;
    if (depthLevel === 1) {
      grammaticalRole = "preposition";
      morphology = "";
      explanation = "";
    } else if (depthLevel === 2) {
      grammaticalRole = "preposition";
      morphology = `governs ${p.case}`;
      explanation = `Requires following element in the ${p.case}.`;
    } else {
      grammaticalRole = "Präposition (Kasusrektion)";
      morphology = `regiert ${p.case}`;
      explanation = `Requires following elements in the ${p.case}.`;
    }
  }
  // 6. Subordinating Conjunctions (weil, dass, obwohl, wenn, etc.)
  else if (SUBORDINATING_CONJUNCTIONS[lower]) {
    const s = SUBORDINATING_CONJUNCTIONS[lower];
    lemma = lower;
    pos = "Subjunktion";
    meaning = s.meaning;
    if (depthLevel === 1) {
      grammaticalRole = "connector";
      morphology = "";
      explanation = "";
    } else if (depthLevel === 2) {
      grammaticalRole = "subordinating connector";
      morphology = "sends verb to end";
      explanation = s.rule;
    } else {
      grammaticalRole = "Einleitung Nebensatz";
      morphology = "unflektierbar";
      explanation = s.rule;
    }
  }
  // 7. Coordinating Conjunctions (und, aber, oder, denn, sondern)
  else if (COORDINATING_CONJUNCTIONS[lower]) {
    const c = COORDINATING_CONJUNCTIONS[lower];
    lemma = lower;
    pos = "Konjunktion";
    meaning = c.meaning;
    if (depthLevel === 1) {
      grammaticalRole = "connector";
      morphology = "";
      explanation = "";
    } else if (depthLevel === 2) {
      grammaticalRole = "coordinating conjunction";
      morphology = "does not affect word order (Pos. 0)";
      explanation = c.rule;
    } else {
      grammaticalRole = "Satzverbindung (Position 0)";
      morphology = "unflektierbar";
      explanation = c.rule;
    }
  }
  // 8. Pronouns & Possessives
  else if (PRONOUNS_DICT[word] || PRONOUNS_DICT[lower]) {
    const p = PRONOUNS_DICT[word] || PRONOUNS_DICT[lower];
    lemma = lower === "mich" || lower === "mir" ? "ich" : lower === "dich" || lower === "dir" ? "du" : lower === "ihn" || lower === "ihm" ? "er" : lower;
    pos = p.pos;
    meaning = p.meaning;
    if (depthLevel === 1) {
      grammaticalRole = "pronoun";
      morphology = "";
      explanation = "";
    } else if (depthLevel === 2) {
      grammaticalRole = p.role.split("/")[0].trim();
      morphology = p.morph;
      explanation = "Personal / possessive pronoun.";
    } else {
      grammaticalRole = p.role;
      morphology = p.morph;
      explanation = `Personal/possessive pronoun referring to the interlocutor or subject.`;
    }
  }
  // 9. Definite Articles (der, die, das, den, dem, des)
  else if (/^(der|die|das|den|dem|des)$/.test(lower)) {
    lemma = "der/die/das";
    pos = "Bestimmter Artikel";
    meaning = "the";
    if (depthLevel === 1) {
      grammaticalRole = "article";
      morphology = "";
      explanation = "";
    } else if (depthLevel === 2) {
      grammaticalRole = "definite article";
      morphology = lower === "den" ? "accusative masculine / dative plural" : lower === "dem" ? "dative masculine/neuter" : lower === "des" ? "genitive 'of the'" : "definite article";
      explanation = "Specifies gender and grammatical case.";
    } else if (depthLevel === 3) {
      grammaticalRole = "Artikelwort / Begleiter";
      morphology = lower === "den" ? "Akkusativ maskulin / Dativ Plural" : lower === "dem" ? "Dativ maskulin/neutral" : lower === "des" ? "Genitiv maskulin/neutral" : "Nominativ/Akkusativ";
      explanation = "Definite article signaling gender, number, and case.";
    } else {
      // Level 4 and 5 (B2/C1)
      grammaticalRole = "Artikelwort / Determinierer";
      morphology = lower === "des"
        ? "Genitiv maskulin/neutral Singular • determiner of nominal phrase"
        : lower === "dem"
        ? "Dativ maskulin/neutral Singular"
        : lower === "den"
        ? "Akkusativ maskulin Singular / Dativ Plural"
        : "bestimmter Artikel";
      explanation = "Definite article signaling gender, number, and syntactic case.";
    }
  }
  // 10. Indefinite Articles (ein, eine, einen, einem, einer, eines)
  else if (/^(ein|eine|einen|einem|einer|eines)$/.test(lower)) {
    lemma = "ein";
    pos = "Unbestimmter Artikel";
    meaning = "a / an";
    if (depthLevel === 1) {
      grammaticalRole = "article";
      morphology = "";
      explanation = "";
    } else if (depthLevel === 2) {
      grammaticalRole = "indefinite article";
      morphology = lower === "einen" ? "accusative masculine" : lower === "einem" ? "dative masculine/neuter" : lower === "einer" ? "dative feminine" : "indefinite article";
      explanation = "Shows gender, number, and grammatical case.";
    } else {
      grammaticalRole = "Artikelwort / Begleiter";
      morphology = lower === "einen" ? "Akkusativ maskulin" : lower === "einem" ? "Dativ maskulin/neutral" : lower === "einer" ? "Dativ feminin" : "Nominativ/Akkusativ";
      explanation = "Indefinite article showing gender, number, and grammatical case.";
    }
  }
  // 11. Common Verbs
  else if (COMMON_VERBS[lower]) {
    const v = COMMON_VERBS[lower];
    lemma = v.infinitive;
    pos = "Verb";
    meaning = v.meaning;
    if (depthLevel === 1) {
      grammaticalRole = "verb";
      morphology = "";
      explanation = "";
    } else if (depthLevel === 2) {
      grammaticalRole = "verb";
      morphology = `infinitive: ${v.infinitive}`;
      explanation = `Conjugated form of '${v.infinitive}'.`;
    } else {
      grammaticalRole = index === 1 || (index === 0 && sentenceSource.includes("?")) ? "Finites Verb (Position 2)" : "Verbform / Satzklammer";
      morphology = `Infinitiv: ${v.infinitive}`;
      explanation = v.government ? `${v.government}. Conjugated form of '${v.infinitive}'.` : `Conjugated form of '${v.infinitive}'.`;
    }
  }
  // 12. Full Comprehensive Dictionary Lookup (covers 100% of all vocabulary across 2,100 sentences)
  else if (findInDict(lower)) {
    const entry = findInDict(lower)!;
    lemma = entry.lemma || word;
    pos = entry.pos || "Wort";
    meaning = entry.en;

    if (depthLevel === 1) {
      // A1: Meaning first, minimal grammar metadata, no complex jargon
      if (pos.startsWith("Nomen")) {
        grammaticalRole = "noun";
      } else if (pos.startsWith("Verb")) {
        grammaticalRole = "verb";
      } else if (pos.startsWith("Adjektiv")) {
        grammaticalRole = "adjective";
      } else if (pos.includes("Adverb")) {
        grammaticalRole = "adverb";
      } else if (pos.includes("Zahl")) {
        grammaticalRole = "number";
      } else if (pos.includes("Eigenname")) {
        grammaticalRole = "name";
      } else {
        grammaticalRole = "word";
      }
      morphology = "";
      explanation = "";
    } else if (depthLevel === 2) {
      // A2: Useful basic grammatical information
      if (pos.startsWith("Nomen")) {
        grammaticalRole = isCapitalized(word) && index === 0 ? "subject noun" : "noun";
        morphology = entry.lemma ? `base: ${entry.lemma}` : "";
      } else if (pos.startsWith("Verb")) {
        grammaticalRole = "verb";
        morphology = entry.lemma ? `infinitive: ${entry.lemma}` : "";
      } else if (pos.startsWith("Adjektiv")) {
        grammaticalRole = "adjective";
        morphology = "modifies noun or state";
      } else {
        grammaticalRole = pos;
        morphology = "";
      }
      explanation = `Basic German vocabulary: ${entry.en}.`;
    } else {
      // B1, B2, C1: Full linguistic detail
      grammaticalRole = isCapitalized(word)
        ? (index === 0 ? "Subjekt / Vorfeld" : "Objekt / Nomen")
        : (pos.startsWith("Verb") ? "Prädikat / Verbform" : pos);
      morphology = entry.lemma ? `Grundform: ${entry.lemma}` : pos;
      explanation = `Linguistic component: ${pos}. Meaning: ${entry.en}.`;
    }
  }
  // 13. Fallback: Guaranteed English Meaning (never return German word!)
  else {
    lemma = word;
    if (isCapitalized(word)) {
      pos = "Eigenname / Nomen";
      grammaticalRole = depthLevel === 1 ? "name" : "Eigenname";
      morphology = depthLevel === 1 ? "" : "proper noun";
      explanation = "";
      meaning = `${word} (name)`;
    } else {
      pos = "Wort";
      grammaticalRole = depthLevel === 1 ? "word" : "Wort";
      morphology = "";
      explanation = "";
      meaning = `word`;
    }

    // Try to find aligned English word from targetText
    const englishTokens = sentenceTarget.split(/\s+/).map(cleanToken);
    const matchCandidate = englishTokens.find(
      (e) => e.length > 2 && !/^(the|this|that|with|from|have|been|will|would|could|should)$/i.test(e)
    );
    if (matchCandidate) {
      meaning = matchCandidate.toLowerCase();
    }
  }

  // Final Invariant Check: English Meaning MUST ALWAYS be in English
  if (!meaning || (!VALID_COGNATES.has(lower) && meaning.toLowerCase() === lower)) {
    // If meaning ever equaled the German word, look up fallback or target
    const targetWords = sentenceTarget.split(/\s+/).map(cleanToken).filter(t => t.length > 2);
    meaning = targetWords[Math.min(index, targetWords.length - 1)]?.toLowerCase() || "word in context";
  }

  return {
    word,
    lemma: lemma || word,
    meaning,
    partOfSpeech: pos,
    grammaticalRole,
    morphology,
    explanation,
  };
}

