import { LanguageInfo, TopicId } from "../types";

export const SUPPORTED_LANGUAGES: Record<string, LanguageInfo> = {
  en: {
    code: "en",
    name: "English",
    nativeName: "English",
    flag: "🇬🇧",
    voiceLangCode: "en-US",
  },
  de: {
    code: "de",
    name: "German",
    nativeName: "Deutsch",
    flag: "🇩🇪",
    voiceLangCode: "de-DE",
  },
};

export const CEFR_LEVELS = ["A1", "A2", "B1", "B2", "C1"] as const;

export const TOPIC_LIST: { id: TopicId; label: string }[] = [
  { id: "all", label: "All Topics" },
  { id: "everyday", label: "Everyday Life" },
  { id: "work", label: "Work & Career" },
  { id: "university", label: "University & Study" },
  { id: "travel", label: "Travel & Transit" },
  { id: "food", label: "Food & Dining" },
  { id: "shopping", label: "Shopping" },
  { id: "housing", label: "Housing & Living" },
  { id: "relationships", label: "Relationships" },
  { id: "technology", label: "Technology" },
  { id: "health", label: "Health & Wellness" },
  { id: "social", label: "Social Life" },
  { id: "opinions", label: "Opinions & Debate" },
  { id: "common_expressions", label: "Common Expressions" },
  { id: "grammar", label: "Key Grammar Focus" },
];
