export type LanguageCode = "en" | "de" | "es" | "fr";

export type Direction = "en-de" | "de-en";

export type CEFRLevel = "A1" | "A2" | "B1" | "B2" | "C1";

export type TopicId =
  | "all"
  | "everyday"
  | "work"
  | "university"
  | "travel"
  | "food"
  | "shopping"
  | "housing"
  | "relationships"
  | "technology"
  | "health"
  | "social"
  | "opinions"
  | "common_expressions"
  | "grammar";

export type Rating = "again" | "hard" | "good" | "easy";

export type SentenceStatus = "new" | "learning" | "review" | "mastered" | "relearning";

export type SentenceRegister = "informal" | "neutral" | "formal";

export interface FSRSCardData {
  due: number; // unix timestamp in ms
  stability: number;
  difficulty: number;
  elapsed_days: number;
  scheduled_days: number;
  reps: number;
  lapses: number;
  state: number; // 0: New, 1: Learning, 2: Review, 3: Relearning
  last_review?: number; // unix timestamp in ms
}

export interface WordMeaning {
  word: string;
  meaning: string;
  note?: string;
}

export interface SentenceStructureChunk {
  text: string;
  role: string;
  explanation: string;
}

export interface KeyGrammarPoint {
  title: string;
  pattern: string;
  explanation: string;
  example: string;
}

export interface DifficultWord {
  word: string;
  meaning: string;
  partOfSpeech: string;
  grammar: string;
  relatedWords?: string[];
}

export interface DetailedWordBreakdown {
  word: string;
  lemma?: string;
  meaning: string;
  partOfSpeech: string;
  grammaticalRole: string;
  morphology?: string;
  explanation?: string;
}

export interface ReusablePattern {
  pattern: string;
  explanation: string;
}

export type GrammarDepthLevel = 1 | 2 | 3 | 4 | 5;

export interface GrammarAnalysis {
  depthLevel: GrammarDepthLevel;
  depthLabel: "Micro" | "Short" | "Standard" | "Deep" | "Advanced";
  principle: string;
  structure: SentenceStructureChunk[];
  keyGrammar: KeyGrammarPoint[];
  difficultWords: DifficultWord[];
  wordBreakdown: DetailedWordBreakdown[];
  wordOrder: {
    explanation: string;
  };
  literalMeaning?: string;
  naturalVsLiteralNote?: string;
  reusablePatterns: ReusablePattern[];
  learningNote?: string;
}

export interface SentenceExplanation {
  literal?: string;
  grammarNote: string;
  wordOrderRule?: string;
  wordByWord?: WordMeaning[];
  breakdown: string[];
  alternatives: string[];
  register?: SentenceRegister;
  cefrJustification?: string;
  grammarAnalysis?: GrammarAnalysis;
}

export interface SentenceItem {
  id: string;
  sourceText: string;
  targetText: string;
  sourceLang: LanguageCode;
  targetLang: LanguageCode;
  level: CEFRLevel;
  topic: TopicId;
  topicLabel: string;
  subtopic?: string;
  grammarTags: string[];
  vocabularyTags: string[];
  difficulty: number; // 1 - 5
  register: SentenceRegister;
  explanation: SentenceExplanation;
  grammarAnalysis?: GrammarAnalysis;
  audioPhonetic?: string;
}

export interface UserSentenceProgress {
  sentenceId: string;
  attempts: number;
  correctCount: number;
  lastReviewedAt: number; // unix timestamp in ms
  nextReviewAt: number; // unix timestamp in ms
  easeFactor: number; // retained for backwards compatibility
  intervalDays: number;
  consecutiveCorrect: number;
  status: SentenceStatus;
  lastRating?: Rating;

  // Native FSRS fields
  stability?: number;
  difficulty?: number;
  due?: number; // unix timestamp in ms
  scheduled_days?: number;
  reps?: number;
  lapses?: number;
  state?: number; // 0: New, 1: Learning, 2: Review, 3: Relearning
  last_review?: number; // unix timestamp in ms
  fsrs?: FSRSCardData;
}

export interface ReviewLog {
  sentenceId: string;
  timestamp: number;
  rating: Rating;
  direction: Direction;
  timeSpentMs: number;
  typedAnswer?: string;
  isCorrect?: boolean;
}

export interface UserProgress {
  version?: number; // 3 for FSRS
  totalPracticed: number;
  ratingCounts: Record<Rating, number>;
  streakDays: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  todayCount: number;
  todayDate: string; // YYYY-MM-DD
  sentenceProgress: Record<string, UserSentenceProgress>;
  history: ReviewLog[];
}

export type TTSVoicePreference = "default" | "male" | "female";

export interface AppSettings {
  direction: Direction;
  level: CEFRLevel;
  topic: TopicId;
  typingMode: boolean;
  themeMode: "dark" | "editorial";
  audioSpeed: number;
  autoSpeak: boolean;
  ttsVoicePreference?: TTSVoicePreference;
  selectedVoiceName?: string;
  dailyGoal: number; // 10, 20, 30, 50
}

export interface LanguageInfo {
  code: LanguageCode;
  name: string;
  nativeName: string;
  flag: string;
  voiceLangCode: string;
}

export interface TypingEvaluationResult {
  isCorrect: boolean;
  verdict: "exact" | "alternative" | "minor_typo" | "grammar_error" | "incorrect";
  shortFeedback: string;
  diffAnalysis?: string;
  breakdown?: string;
}
