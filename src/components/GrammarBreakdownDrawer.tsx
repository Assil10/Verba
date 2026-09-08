import React from "react";
import {
  Sparkles,
  BookOpen,
  Layers,
  Languages,
  ListOrdered,
  Lightbulb,
  ArrowRight,
  HelpCircle,
  ExternalLink,
} from "lucide-react";
import { SentenceItem, GrammarAnalysis } from "../types";
import { getSentenceGrammarAnalysis } from "../services/grammarAnalyzer";

interface GrammarBreakdownDrawerProps {
  sentence: SentenceItem;
  aiExplanation: string | null;
  aiLoading: boolean;
  onFetchAiExplanation: () => void;
}

export const GrammarBreakdownDrawer: React.FC<GrammarBreakdownDrawerProps> = ({
  sentence,
  aiExplanation,
  aiLoading,
  onFetchAiExplanation,
}) => {
  const analysis: GrammarAnalysis = getSentenceGrammarAnalysis(sentence);

  return (
    <div
      id="grammar-breakdown-drawer"
      className="mt-3 p-4 sm:p-6 rounded-2xl bg-neutral-50 dark:bg-[#181818] border border-black/10 dark:border-neutral-800 text-xs text-black dark:text-white space-y-6 animate-in fade-in duration-150"
    >
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-black/10 dark:border-neutral-800">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono-code font-bold uppercase bg-black text-white dark:bg-white dark:text-black">
            CEFR {sentence.level}
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono-code font-medium bg-neutral-200/70 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
            Depth: {analysis.depthLabel || "Standard"}
          </span>
          <span className="text-[11px] font-mono-code text-neutral-500 dark:text-neutral-400 font-medium">
            {sentence.topicLabel} {sentence.subtopic ? `• ${sentence.subtopic}` : ""}
          </span>
        </div>
        <div className="text-[10px] font-mono-code text-neutral-500 dark:text-neutral-400">
          Sentence-Specific Linguistic Analysis
        </div>
      </div>

      {/* SECTION A: GRAMMAR PRINCIPLE */}
      <section id="drawer-grammar-principle" className="space-y-1.5">
        <div className="flex items-center gap-1.5 text-[10px] font-mono-code font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
          <BookOpen className="w-3.5 h-3.5" />
          <span>A. GRAMMAR PRINCIPLE</span>
        </div>
        <p className="text-black dark:text-white font-medium text-sm leading-relaxed">
          {analysis.principle}
        </p>
      </section>

      {/* SECTION B: SENTENCE STRUCTURE */}
      {analysis.structure && analysis.structure.length > 0 && (
        <section id="drawer-sentence-structure" className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-mono-code font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
            <Layers className="w-3.5 h-3.5" />
            <span>B. SENTENCE STRUCTURE & SYNTACTIC CHUNKS</span>
          </div>

          {/* Visual Chunk Sequence */}
          <div className="flex flex-wrap items-center gap-1.5 p-3 rounded-xl bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700">
            {analysis.structure.map((chunk, idx) => (
              <React.Fragment key={idx}>
                <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-mono-code font-bold text-black dark:text-white">
                  [{chunk.text}]
                </span>
                {idx < analysis.structure.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-neutral-400 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Detailed Chunk Roles */}
          <div className="grid grid-cols-1 gap-2">
            {analysis.structure.map((chunk, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2"
              >
                <div className="space-y-0.5">
                  <div className="text-xs font-mono-code font-bold text-black dark:text-white">
                    "{chunk.text}"
                  </div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400 font-normal leading-relaxed">
                    {chunk.explanation}
                  </div>
                </div>
                <span className="self-start sm:self-auto text-[10px] font-mono-code font-semibold px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-300 dark:border-neutral-700 whitespace-nowrap">
                  {chunk.role}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION C: KEY GRAMMAR POINTS */}
      {analysis.keyGrammar && analysis.keyGrammar.length > 0 && (
        <section id="drawer-key-grammar" className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-mono-code font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>C. KEY GRAMMAR IN THIS SENTENCE</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {analysis.keyGrammar.map((kg, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700 space-y-1.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-black dark:text-white">
                    {kg.title}
                  </span>
                  <span className="text-[10px] font-mono-code font-semibold px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300">
                    Pattern
                  </span>
                </div>
                <div className="text-[11px] font-mono-code text-neutral-800 dark:text-neutral-200 bg-neutral-100 dark:bg-[#151515] px-2 py-1 rounded border border-neutral-200 dark:border-neutral-800">
                  {kg.pattern}
                </div>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
                  {kg.explanation}
                </p>
                {kg.example && (
                  <div className="pt-1 text-[11px] font-mono-code text-neutral-500 dark:text-neutral-400">
                    <span className="font-semibold text-black dark:text-white">Example in text:</span> "{kg.example}"
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION D: HARD / IMPORTANT WORDS */}
      {analysis.difficultWords && analysis.difficultWords.length > 0 && (
        <section id="drawer-difficult-words" className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-mono-code font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
            <Languages className="w-3.5 h-3.5" />
            <span>D. IMPORTANT VOCABULARY & GRAMMATICAL PROPERTIES</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {analysis.difficultWords.map((item, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700 space-y-1"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-mono-code font-bold text-black dark:text-white">
                    {item.word}
                  </span>
                  <span className="text-[10px] font-mono-code px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-700">
                    {item.partOfSpeech}
                  </span>
                </div>
                <div className="text-xs text-neutral-800 dark:text-neutral-200 font-medium">
                  {item.meaning}
                </div>
                <div className="text-[11px] text-neutral-600 dark:text-neutral-400 leading-relaxed font-mono-code">
                  {item.grammar}
                </div>
                {item.relatedWords && item.relatedWords.length > 0 && (
                  <div className="pt-0.5 text-[10px] font-mono-code text-neutral-500">
                    Related: {item.relatedWords.join(", ")}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* SECTION E: WORD-BY-WORD BREAKDOWN */}
      {analysis.wordBreakdown && analysis.wordBreakdown.length > 0 && (
        <section id="drawer-word-by-word" className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[10px] font-mono-code font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
              <ListOrdered className="w-3.5 h-3.5" />
              <span>
                {analysis.depthLevel === 1
                  ? "E. WORD-BY-WORD MEANING & FUNCTION"
                  : "E. WORD-BY-WORD LINGUISTIC BREAKDOWN"}
              </span>
            </div>
            <span className="text-[10px] font-mono-code text-neutral-500">
              {analysis.wordBreakdown.length} tokens
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-[#202020]">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-[#1c1c1c] text-[10px] font-mono-code font-bold text-neutral-500 dark:text-neutral-400 uppercase">
                  <th className="py-2 px-3">Word</th>
                  <th className="py-2 px-3">Base (Lemma)</th>
                  <th className="py-2 px-3">English Meaning</th>
                  <th className="py-2 px-3">
                    {analysis.depthLevel === 1 ? "Role / Function" : "Role & Morphology"}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800 font-mono-code text-[11px]">
                {analysis.wordBreakdown.map((b, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/50 transition-colors"
                  >
                    <td className="py-2 px-3 font-bold text-black dark:text-white whitespace-nowrap">
                      {b.word}
                    </td>
                    <td className="py-2 px-3 text-neutral-600 dark:text-neutral-400 whitespace-nowrap">
                      {b.lemma || "—"}
                    </td>
                    <td className="py-2 px-3 text-neutral-800 dark:text-neutral-200 whitespace-nowrap">
                      {b.meaning}
                    </td>
                    <td className="py-2 px-3 text-neutral-600 dark:text-neutral-400">
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {b.grammaticalRole}
                      </span>
                      {b.morphology && <span> • {b.morphology}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* SECTION F: NATURAL VS LITERAL MEANING (Only if literal meaning differs and teaches a structure) */}
      {(analysis.literalMeaning || (sentence.explanation.literal && sentence.explanation.literal !== sentence.targetText)) && (
        <section id="drawer-natural-vs-literal" className="space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-mono-code font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>F. NATURAL VS LITERAL TRANSLATION</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className="p-3 rounded-xl bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700 space-y-1">
              <span className="text-[10px] font-mono-code font-bold text-neutral-500 uppercase">
                Natural English
              </span>
              <p className="text-xs text-black dark:text-white font-medium">
                "{sentence.targetText}"
              </p>
            </div>
            <div className="p-3 rounded-xl bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700 space-y-1">
              <span className="text-[10px] font-mono-code font-bold text-neutral-500 uppercase">
                Literal German Structure
              </span>
              <p className="text-xs text-neutral-700 dark:text-neutral-300 font-mono-code italic">
                "{analysis.literalMeaning || sentence.explanation.literal}"
              </p>
            </div>
          </div>
          {analysis.naturalVsLiteralNote && (
            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed italic bg-white dark:bg-[#202020] p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-700">
              💡 {analysis.naturalVsLiteralNote}
            </p>
          )}
        </section>
      )}

      {/* SECTION G: WORD ORDER EXPLANATION */}
      {analysis.wordOrder && analysis.wordOrder.explanation && (
        <section id="drawer-word-order" className="space-y-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-mono-code font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
            <ListOrdered className="w-3.5 h-3.5" />
            <span>G. SYNTAX & WORD ORDER MECHANICS</span>
          </div>
          <div className="p-3.5 rounded-xl bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700 text-xs text-neutral-800 dark:text-neutral-200 leading-relaxed font-mono-code">
            {analysis.wordOrder.explanation}
          </div>
        </section>
      )}

      {/* SECTION H: PATTERN TO REMEMBER & LEARNING NOTE */}
      {((analysis.reusablePatterns && analysis.reusablePatterns.length > 0) || analysis.learningNote) && (
        <section id="drawer-reusable-patterns" className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-[10px] font-mono-code font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-widest">
            <Lightbulb className="w-3.5 h-3.5" />
            <span>H. REUSABLE PATTERN & LEARNING NOTE</span>
          </div>
          {analysis.reusablePatterns && analysis.reusablePatterns.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {analysis.reusablePatterns.map((rp, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700 space-y-1"
                >
                  <div className="text-[10px] font-mono-code font-bold text-neutral-500 uppercase">
                    Memorize this Pattern
                  </div>
                  <div className="text-xs font-mono-code font-bold text-black dark:text-white bg-neutral-100 dark:bg-[#151515] px-2 py-1 rounded border border-neutral-200 dark:border-neutral-800">
                    {rp.pattern}
                  </div>
                  <div className="text-xs text-neutral-600 dark:text-neutral-400">
                    {rp.explanation}
                  </div>
                </div>
              ))}
            </div>
          )}
          {analysis.learningNote && (
            <div className="p-3.5 rounded-xl bg-black text-white dark:bg-white dark:text-black font-medium text-xs leading-relaxed flex items-start gap-2.5">
              <Lightbulb className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-bold font-mono-code block text-[10px] uppercase tracking-wider mb-0.5 text-neutral-300 dark:text-neutral-700">
                  Rule of Thumb (CEFR {sentence.level})
                </span>
                {analysis.learningNote}
              </div>
            </div>
          )}
        </section>
      )}

      {/* AI Deep Linguistic Analysis Layer */}
      <section id="drawer-ai-explanation-layer" className="pt-2 border-t border-black/10 dark:border-neutral-800 space-y-3">
        {!aiExplanation && !aiLoading && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700">
            <div className="space-y-0.5">
              <span className="text-xs text-black dark:text-white font-bold block">
                Want deeper grammatical nuance or colloquial edge cases?
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400 block">
                Generates CEFR-{sentence.level} linguistic commentary grounded in this sentence.
              </span>
            </div>
            <button
              id="ask-ai-deep-explanation-btn"
              onClick={onFetchAiExplanation}
              className="px-4 py-2 rounded-xl bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-bold font-mono-code tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer min-h-[38px] whitespace-nowrap flex-shrink-0"
              title="Explain with AI (E)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>EXPLAIN WITH AI</span>
              <kbd className="inline-flex items-center justify-center min-w-[18px] h-4.5 px-1.5 text-[10px] font-mono-code font-bold uppercase rounded border bg-neutral-900 dark:bg-neutral-100 text-white dark:text-black border-neutral-700 dark:border-neutral-300">
                E
              </kbd>
            </button>
          </div>
        )}

        {aiLoading && (
          <div className="flex items-center justify-center gap-2.5 py-4 text-black dark:text-white font-mono-code text-xs font-bold rounded-xl bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700">
            <div className="w-4 h-4 rounded-full border-2 border-black dark:border-white border-t-transparent animate-spin" />
            <span>Consulting German linguistics model for CEFR-{sentence.level} nuance...</span>
          </div>
        )}

        {aiExplanation && (
          <div className="p-4 rounded-xl bg-white dark:bg-[#202020] border border-neutral-200 dark:border-neutral-700 text-xs text-black dark:text-white space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-1.5 text-black dark:text-white font-mono-code text-[11px] uppercase font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI LINGUISTIC ANALYSIS</span>
              </div>
              <button
                onClick={onFetchAiExplanation}
                className="text-[10px] font-mono-code text-neutral-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                title="Regenerate analysis"
              >
                Regenerate
              </button>
            </div>
            <div className="whitespace-pre-line leading-relaxed text-xs">
              {aiExplanation}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
