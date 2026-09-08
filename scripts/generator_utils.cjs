const fs = require('fs');

function createSentence(id, sourceText, targetText, level, topic, topicLabel, grammarTags, vocabTags, difficulty, register, grammarNote, wordByWord, alternatives, wordOrderRule) {
  return {
    id,
    sourceText,
    targetText,
    sourceLang: "de",
    targetLang: "en",
    level,
    topic,
    topicLabel,
    grammarTags,
    vocabularyTags: vocabTags,
    difficulty,
    register: register || "neutral",
    explanation: {
      grammarNote,
      wordOrderRule: wordOrderRule || "Standard German clause order: finite verb in position 2 in main clauses.",
      wordByWord: wordByWord || [],
      breakdown: [
        grammarNote,
        `CEFR Level: ${level}. Focus: ${grammarTags.join(', ')}.`
      ],
      alternatives: alternatives || []
    }
  };
}

function writeSentenceModule(filePath, exportName, sentences) {
  const content = `import { SentenceItem } from "../types";\n\nexport const ${exportName}: SentenceItem[] = ${JSON.stringify(sentences, null, 2)};\n`;
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Successfully wrote ${sentences.length} sentences to ${filePath}`);
}

module.exports = { createSentence, writeSentenceModule };
