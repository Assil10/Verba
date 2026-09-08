import { SentenceItem } from "../types";
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
