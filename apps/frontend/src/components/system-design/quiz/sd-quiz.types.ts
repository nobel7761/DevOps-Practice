// Shapes returned by the backend's /sd-quiz endpoints (apps/backend/src/system-design-quiz).

export type SdQuizDifficulty = "easy" | "medium" | "hard";

export interface SdServedQuestion {
  id: string;
  difficulty: SdQuizDifficulty;
  question: string;
  diagram?: string;
  options: string[];
}

export interface SdAttempt {
  attemptId: string;
  topicId: string;
  passPercent: number;
  newCycle: boolean;
  questions: SdServedQuestion[];
}

export interface SdQuestionResult {
  id: string;
  question: string;
  options: string[];
  chosenIndex: number | null;
  correctIndex: number;
  correct: boolean;
  explanation: string;
  whyChosenIsWrong: string | null;
}

export interface SdAttemptResult {
  attemptId: string;
  topicId: string;
  score: number;
  total: number;
  percent: number;
  passed: boolean;
  results: SdQuestionResult[];
}

export interface SdQuizStatus {
  topicId: string;
  /** False until the topic's 60-question bank exists. */
  available: boolean;
  passed: boolean;
  seenCount: number;
  attempts: {
    score: number;
    total: number;
    passed: boolean;
    submittedAt: string;
  }[];
}

export const DIFFICULTY_LABELS: Record<SdQuizDifficulty, string> = {
  easy: "সহজ",
  medium: "মাঝারি",
  hard: "কঠিন",
};
