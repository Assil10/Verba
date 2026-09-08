import {
  SentenceItem,
  GrammarAnalysis,
  SentenceStructureChunk,
  KeyGrammarPoint,
  DifficultWord,
  ReusablePattern,
} from "../types";
import {
  PREPOSITION_DICT,
  CONTRACTIONS_DICT,
  SUBORDINATING_CONJUNCTIONS,
  COORDINATING_CONJUNCTIONS,
  QUESTION_WORDS,
  COMMON_VERBS,
  COLLOCATIONS,
} from "./lexicon";
import { determineSentenceComplexity } from "./complexityScorer";
import { cleanToken, isCapitalized, resolveWordBreakdown } from "./wordLookup";

// ==========================================
// CORE LINGUISTIC ANALYZER ENGINE
// ==========================================

export function analyzeGermanSentence(sentence: SentenceItem): GrammarAnalysis {
  const text = sentence.sourceText.trim();
  const english = sentence.targetText.trim();
  const rawWords = text.split(/\s+/).filter(Boolean);
  const cleanedWords = rawWords.map(cleanToken).filter(Boolean);

  // 1. DETERMINE ADAPTIVE DEPTH
  const complexity = determineSentenceComplexity(sentence);
  const depthLevel = complexity.depthLevel;
  const depthLabel = complexity.depthLabel;

  const firstToken = cleanedWords[0] || "";
  const firstLower = firstToken.toLowerCase();
  const secondToken = cleanedWords[1] || "";
  const secondLower = secondToken.toLowerCase();
  const isQuestion = text.endsWith("?");
  const isWQuestion = isQuestion && Boolean(QUESTION_WORDS[firstLower]);
  const isVerbFirstQuestion = isQuestion && !isWQuestion && Boolean(COMMON_VERBS[firstLower]);

  // 2. WORD-BY-WORD BREAKDOWN (ALWAYS POPULATED FOR ALL 2,100 SENTENCES)
  const wordBreakdown = cleanedWords.map((word, idx) =>
    resolveWordBreakdown(word, idx, cleanedWords, text, english, depthLevel)
  );

  // 3. SENTENCE STRUCTURE / CLAUSE CHUNKS (Populated for Standard, Deep, Advanced)
  const structureChunks: SentenceStructureChunk[] = [];
  if (depthLevel >= 3) {
    const parts = text.split(/([,;]|(?<=\s)(?:und|oder|aber|denn|sondern)\s+)/i).filter((p) => p && p.trim().length > 0);

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (part === "," || part === ";" || /^(und|oder|aber|denn|sondern)$/i.test(part)) {
        continue;
      }

      const pFirst = cleanToken(part.split(/\s+/)[0]).toLowerCase();
      const isSub = Object.prototype.hasOwnProperty.call(SUBORDINATING_CONJUNCTIONS, pFirst);
      const hasRel = /^(der|die|das|dessen|deren|denen|dem|den|welcher|welche|welches)\b/i.test(part);
      const hasInf = /\bzu\s+[a-zäöüß]+(?:en|eln|ern)\b/i.test(part) || /\bum\s+zu\b/i.test(part);
      const hasPassive = /\b(wird|werden|wurde|wurden|worden)\b/i.test(part);

      let role = "Hauptsatz (Main clause)";
      let explanation = "Standard clause with finite verb in Position 2.";

      if (isSub) {
        const cInfo = SUBORDINATING_CONJUNCTIONS[pFirst];
        role = `Nebensatz (${cInfo.clauseType})`;
        explanation = `Introduced by '${pFirst}' (${cInfo.meaning}); conjugated verb at the end.`;
      } else if (hasInf) {
        role = "Infinitivgruppe mit 'zu'";
        explanation = "Infinitive clause depending on the main clause; 'zu + Infinitiv' sits at the end.";
      } else if (hasRel && i > 0) {
        role = "Relativsatz (Relative clause)";
        explanation = "Subordinate relative clause describing the antecedent; finite verb at clause end.";
      } else if (structureChunks.length > 0 && structureChunks[0].role.includes("Nebensatz")) {
        role = "Hauptsatz mit Inversion";
        explanation = "Because the subordinate clause occupies Position 1, the main clause finite verb immediately takes Position 2 after the comma.";
      } else if (hasPassive) {
        role = "Passivkonstruktion";
        explanation = "Action-oriented clause with auxiliary 'werden' and Partizip II.";
      }

      structureChunks.push({
        text: part,
        role,
        explanation,
      });
    }

    if (structureChunks.length === 0) {
      structureChunks.push({
        text: text,
        role: isQuestion ? "Fragesatz" : "Hauptsatz (Aussagesatz)",
        explanation: isQuestion ? "Interrogative clause." : "Declarative clause with V2 verb placement.",
      });
    }
  }

  // 4. KEY GRAMMAR POINTS (Adaptive: 0 for Micro, 1 for Short, 1-2 for Standard/Deep/Advanced)
  const keyGrammar: KeyGrammarPoint[] = [];

  // Noun-Verb Collocations
  for (const c of COLLOCATIONS) {
    if (c.pattern.test(text)) {
      const match = text.match(c.pattern);
      keyGrammar.push({
        title: `Nomen-Verb-Verbindung: "${c.nounPhrase} ${c.verb}"`,
        pattern: `${c.nounPhrase} + ${c.verb}`,
        explanation: c.explanation,
        example: match ? match[0] : `${c.nounPhrase} ${c.verb}`,
      });
      break;
    }
  }

  // Subordinating conjunctions
  for (const [conj, info] of Object.entries(SUBORDINATING_CONJUNCTIONS)) {
    if (new RegExp(`\\b${conj}\\b`, "i").test(text)) {
      keyGrammar.push({
        title: `Subordination mit "${conj}" (${info.clauseType})`,
        pattern: `${conj} + ... + Verb-Ende`,
        explanation: `'${conj}' (${info.meaning}) introduces a subordinate clause, placing the finite conjugated verb at the very end.`,
        example: text.slice(0, 45) + "...",
      });
      break;
    }
  }

  // Prepositions & Contractions
  for (const [token, cInfo] of Object.entries(CONTRACTIONS_DICT)) {
    if (new RegExp(`\\b${token}\\b`, "i").test(text)) {
      keyGrammar.push({
        title: `Präpositionsverschmelzung: "${token}" (${cInfo.prep} + ${cInfo.article})`,
        pattern: `${token} + Nomen (${cInfo.case})`,
        explanation: cInfo.explanation,
        example: `${token} ...`,
      });
      break;
    }
  }

  // Dative governing verbs
  for (const [word, vMeta] of Object.entries(COMMON_VERBS)) {
    if (vMeta.isDativeVerb && new RegExp(`\\b${word}\\b`, "i").test(text)) {
      keyGrammar.push({
        title: `Dativobjekt bei "${vMeta.infinitive}"`,
        pattern: `${vMeta.infinitive} + Dativ`,
        explanation: `'${vMeta.infinitive}' governs a dative object. The entity receiving the action must be in the dative case.`,
        example: word,
      });
      break;
    }
  }

  // Accusative masculine adjective inflection (e.g. einen kleinen Hund)
  if (/\beinen\s+[a-zäöüß]+en\s+[A-ZÄÖÜ][a-zäöüß]+/i.test(text)) {
    const match = text.match(/\beinen\s+[a-zäöüß]+en\s+[A-ZÄÖÜ][a-zäöüß]+/i);
    keyGrammar.push({
      title: "Akkusativ maskulin: 'einen' + Adjektiv (-en) + Nomen",
      pattern: "einen + [Adjektiv-en] + [maskulines Nomen]",
      explanation: "Direct objects that are grammatically masculine require the accusative indefinite article 'einen' and the adjective ending '-en'.",
      example: match ? match[0] : "einen ...",
    });
  }

  // Compound tense (Perfekt)
  if (/\b(ist|sind|war|bin|bist)\b/i.test(text) && /\bge[a-zäöüß]+(?:t|en)\b/i.test(text)) {
    const aux = text.match(/\b(ist|sind|war|bin|bist)\b/i)?.[0] || "ist";
    const part = text.match(/\bge[a-zäöüß]+(?:t|en)\b/i)?.[0] || "";
    keyGrammar.push({
      title: "Perfekt mit 'sein' (Zustands-/Ortsveränderung)",
      pattern: `${aux} ... ${part}`,
      explanation: `Formed with auxiliary '${aux}' in Position 2 and participle '${part}' at the end of the clause.`,
      example: `${aux} ... ${part}`,
    });
  } else if (/\b(hat|habe|haben|hatte)\b/i.test(text) && /\bge[a-zäöüß]+(?:t|en)\b/i.test(text)) {
    const aux = text.match(/\b(hat|habe|haben|hatte)\b/i)?.[0] || "hat";
    const part = text.match(/\bge[a-zäöüß]+(?:t|en)\b/i)?.[0] || "";
    keyGrammar.push({
      title: "Perfekt mit 'haben' (Satzklammer)",
      pattern: `${aux} ... ${part}`,
      explanation: `Standard compound past tense: auxiliary '${aux}' in Position 2 and participle '${part}' at the end.`,
      example: `${aux} ... ${part}`,
    });
  }

  // Prune Key Grammar based on depth
  let finalKeyGrammar: KeyGrammarPoint[] = [];
  if (depthLevel === 1) {
    finalKeyGrammar = []; // Micro: no key grammar cards to keep drawer compact
  } else if (depthLevel === 2) {
    finalKeyGrammar = keyGrammar.slice(0, 1); // Short: max 1 high-yield card
  } else {
    finalKeyGrammar = keyGrammar.slice(0, 2); // Standard/Deep/Advanced: max 2 cards
  }

  // 5. DIFFICULT / IMPORTANT WORDS (Suppressed for Micro, 1-2 for Short, up to 3 for Standard+)
  const difficultWords: DifficultWord[] = [];
  if (depthLevel >= 2) {
    const addedWords = new Set<string>();
    for (const raw of cleanedWords) {
      const lower = raw.toLowerCase();

      // Preposition
      if (PREPOSITION_DICT[lower] && !addedWords.has(lower)) {
        difficultWords.push({
          word: raw,
          meaning: PREPOSITION_DICT[lower].meaning,
          partOfSpeech: "Präposition",
          grammar: `Governs ${PREPOSITION_DICT[lower].case}. ${PREPOSITION_DICT[lower].note.slice(0, 60)}...`,
          relatedWords: [PREPOSITION_DICT[lower].case],
        });
        addedWords.add(lower);
      }
      // Dative verb or notable verb
      else if (COMMON_VERBS[lower] && COMMON_VERBS[lower].isDativeVerb && !addedWords.has(lower)) {
        const v = COMMON_VERBS[lower];
        difficultWords.push({
          word: raw,
          meaning: v.meaning,
          partOfSpeech: "Verb",
          grammar: `Infinitiv: ${v.infinitive} (${v.government || "Dativ"})`,
        });
        addedWords.add(lower);
      }

      if (depthLevel === 2 && difficultWords.length >= 1) break;
      if (difficultWords.length >= 3) break;
    }
  }

  // 6. SENTENCE-SPECIFIC GRAMMAR PRINCIPLE (Adaptive Length)
  let principle = "";

  if (isWQuestion) {
    const qInfo = QUESTION_WORDS[firstLower];
    principle = `'${firstToken}' asks about ${qInfo?.meaning || "the specified question topic"}. The finite verb '${secondToken}' immediately follows in Position 2.`;
  } else if (isVerbFirstQuestion) {
    principle = `Yes/No question (Ja/Nein-Frage): Begins with the finite verb '${firstToken}' in Position 1, followed directly by the subject '${secondToken}'.`;
  } else if (finalKeyGrammar.length > 0) {
    const kg = finalKeyGrammar[0];
    principle = `${kg.title}: In this sentence, '${kg.example}' illustrates how ${kg.explanation.toLowerCase()}`;
  } else if (depthLevel === 1) {
    principle = `Simple declarative statement with finite verb '${secondToken}' in standard Position 2.`;
  } else {
    principle = `Main clause coordination: Positions the finite verb '${secondToken}' in Position 2, maintaining crisp syntactic coherence.`;
  }

  // 7. SENTENCE-SPECIFIC WORD ORDER (Adaptive)
  let wordOrderExplanation = "";

  if (isWQuestion) {
    wordOrderExplanation = `'${firstToken}' occupies Position 1 as the question word. The conjugated finite verb '${secondToken}' follows in Position 2 (W-Frage).`;
  } else if (isVerbFirstQuestion) {
    wordOrderExplanation = `Verb-First Order (V1): The conjugated verb '${firstToken}' stands in Position 1, with the subject '${secondToken}' in Position 2.`;
  } else if (depthLevel === 1) {
    wordOrderExplanation = `'${firstToken}' is in Position 1, followed by the finite verb '${secondToken}' in Position 2.`;
  } else if (structureChunks.some((c) => c.role.includes("Nebensatz"))) {
    wordOrderExplanation = `The sentence combines a main clause (finite verb '${secondToken}' in Position 2) with a subordinate clause where the conjugated verb moves to the clause end.`;
  } else if (/\b(hat|habe|haben|hatte|ist|sind|kann|muss|will|soll|darf|wird)\b/i.test(text) && cleanedWords.length > 3) {
    const aux = text.match(/\b(hat|habe|haben|hatte|ist|sind|kann|muss|will|soll|darf|wird)\b/i)?.[0] || "";
    const lastWord = cleanedWords[cleanedWords.length - 1];
    wordOrderExplanation = `Sentence Bracket (Satzklammer): Auxiliary/modal '${aux}' occupies Position 2, while '${lastWord}' closes the sentence at the very end.`;
  } else {
    wordOrderExplanation = `'${firstToken}' occupies Position 1 (Vorfeld). The conjugated finite verb '${secondToken}' strictly takes Position 2 (V2 rule).`;
  }

  // 8. NATURAL VS LITERAL TRANSLATION (Only shown if genuinely distinct and educational)
  let literalMeaning: string | undefined = undefined;
  let naturalVsLiteralNote: string | undefined = undefined;

  if (depthLevel >= 3) {
    if (/\bseit\b/i.test(text)) {
      literalMeaning = cleanedWords
        .map((w) => {
          const item = wordBreakdown.find((b) => b.word.toLowerCase() === w.toLowerCase());
          return item ? item.meaning.split("/")[0].trim() : w;
        })
        .join(" ");
      naturalVsLiteralNote =
        "German uses the present tense with 'seit' (e.g. 'Ich wohne seit...') for actions continuing from past to present, where English requires the present perfect ('I have been living for...').";
    } else if (COLLOCATIONS.some((c) => c.pattern.test(text))) {
      const col = COLLOCATIONS.find((c) => c.pattern.test(text));
      literalMeaning = col?.literal;
      naturalVsLiteralNote = `Idiomatic expression: German uses '${col?.nounPhrase} ${col?.verb}' (literally '${col?.literal}'), where English uses '${col?.meaning}'.`;
    } else if (/\b(in\s+strömen)\b/i.test(text)) {
      literalMeaning = "to rain in streams/torrents";
      naturalVsLiteralNote = "German says 'in Strömen regnen' (literally 'to rain in streams'), whereas English idiomatically says 'to pour rain'.";
    }
  }

  // 9. REUSABLE PATTERNS (Only if a genuine construction exists)
  const reusablePatterns: ReusablePattern[] = [];
  if (depthLevel >= 3 && finalKeyGrammar.length > 0) {
    for (const kg of finalKeyGrammar) {
      if (kg.pattern && !kg.pattern.includes("Position 1")) {
        reusablePatterns.push({
          pattern: kg.pattern,
          explanation: kg.title,
        });
      }
    }
  }

  // 10. LEARNING NOTE (Only if a genuine learner pitfall exists)
  let learningNote: string | undefined = undefined;
  if (depthLevel >= 2) {
    if (/\b(hilft|helfe|helfen|geholfen|dankt|danke)\b/i.test(text)) {
      learningNote = "COMMON MISTAKE: 'helfen' and 'danken' govern Dativ, not Akkusativ ('Ich helfe meinem Bruder', never *'meinen Bruder').";
    } else if (/\bseit\b/i.test(text)) {
      learningNote = "COMMON MISTAKE: Never say *'Ich habe hier für drei Jahre gewohnt' when you still live there. Use 'Ich wohne seit...' (present tense + Dativ).";
    } else if (depthLevel >= 4 && COLLOCATIONS.some((c) => c.pattern.test(text))) {
      learningNote = "ADVANCED TIP: Professional German relies heavily on noun-verb combinations (Funktionsverbgefüge) rather than simple colloquial verbs.";
    }
  }

  return {
    depthLevel,
    depthLabel,
    principle,
    structure: structureChunks,
    keyGrammar: finalKeyGrammar,
    difficultWords,
    wordBreakdown,
    wordOrder: {
      explanation: wordOrderExplanation,
    },
    literalMeaning,
    naturalVsLiteralNote,
    reusablePatterns,
    learningNote,
  };
}

// Cached analyzer helper: avoids re-analyzing the same sentence multiple times
const analysisCache = new Map<string, GrammarAnalysis>();

export function getSentenceGrammarAnalysis(sentence: SentenceItem): GrammarAnalysis {
  if (sentence.grammarAnalysis) {
    return sentence.grammarAnalysis;
  }
  if (sentence.explanation && sentence.explanation.grammarAnalysis) {
    return sentence.explanation.grammarAnalysis;
  }

  if (analysisCache.has(sentence.id)) {
    return analysisCache.get(sentence.id)!;
  }

  const analysis = analyzeGermanSentence(sentence);
  analysisCache.set(sentence.id, analysis);
  return analysis;
}
