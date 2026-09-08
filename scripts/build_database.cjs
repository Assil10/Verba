const path = require('path');
const fs = require('fs');
const { writeSentenceModule } = require('./generator_utils.cjs');
const { getA1Sentences } = require('./data_a1.cjs');
const { getA2Sentences } = require('./data_a2.cjs');
const { getB1Sentences } = require('./data_b1.cjs');
const { getB2Sentences } = require('./data_b2.cjs');
const { getC1Sentences } = require('./data_c1.cjs');

console.log("Generating full production CEFR dataset (2,100 total sentences)...");

const a1 = getA1Sentences();
const a2 = getA2Sentences();
const b1 = getB1Sentences();
const b2 = getB2Sentences();
const c1 = getC1Sentences();

console.log(`Counts: A1=${a1.length}, A2=${a2.length}, B1=${b1.length}, B2=${b2.length}, C1=${c1.length}`);
console.log(`Total: ${a1.length + a2.length + b1.length + b2.length + c1.length}`);

const dataDir = path.join(__dirname, '..', 'src', 'data');

writeSentenceModule(path.join(dataDir, 'sentencesA1.ts'), 'sentencesA1', a1);
writeSentenceModule(path.join(dataDir, 'sentencesA2.ts'), 'sentencesA2', a2);
writeSentenceModule(path.join(dataDir, 'sentencesB1.ts'), 'sentencesB1', b1);
writeSentenceModule(path.join(dataDir, 'sentencesB2.ts'), 'sentencesB2', b2);
writeSentenceModule(path.join(dataDir, 'sentencesC1.ts'), 'sentencesC1', c1);

const masterContent = `import { SentenceItem } from "../types";
import { sentencesA1 } from "./sentencesA1";
import { sentencesA2 } from "./sentencesA2";
import { sentencesB1 } from "./sentencesB1";
import { sentencesB2 } from "./sentencesB2";
import { sentencesC1 } from "./sentencesC1";

export const SENTENCE_DATABASE: SentenceItem[] = [
  ...sentencesA1,
  ...sentencesA2,
  ...sentencesB1,
  ...sentencesB2,
  ...sentencesC1,
];

export const SENTENCE_COUNT_BY_LEVEL = {
  A1: sentencesA1.length,
  A2: sentencesA2.length,
  B1: sentencesB1.length,
  B2: sentencesB2.length,
  C1: sentencesC1.length,
  total: sentencesA1.length + sentencesA2.length + sentencesB1.length + sentencesB2.length + sentencesC1.length
};
`;

fs.writeFileSync(path.join(dataDir, 'sentences.ts'), masterContent, 'utf8');
console.log("Successfully updated src/data/sentences.ts with 2,100 production sentences!");
