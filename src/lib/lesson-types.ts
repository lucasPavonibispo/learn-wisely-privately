/** Shared, browser-safe types for a generated micro-learning module. */
export interface LessonModule {
  topic: string;
  level: string;
  intro: string;
  flashcards: { front: string; back: string }[];
  quiz: { question: string; options: string[]; answerIndex: number; explanation: string }[];
  cheatSheet: { heading: string; points: string[] }[];
}

export const LEVELS = ["Beginner", "Intermediate", "Advanced"] as const;
export type Level = (typeof LEVELS)[number];
