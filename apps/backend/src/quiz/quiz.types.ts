export type QuizDifficulty = 'easy' | 'medium' | 'hard';

export interface QuizQuestion {
  id: string;
  difficulty: QuizDifficulty;
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface ServedQuestion {
  id: string;
  difficulty: QuizDifficulty;
  question: string;
  options: string[];
}

export interface QuizBank {
  labId: string;
  passPercent: number;
  sample: Record<QuizDifficulty, number>;
  questions: QuizQuestion[];
}
