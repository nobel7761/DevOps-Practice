import type { CardResult } from "./storage";

export interface McqAnswerRecord {
  /** Question position inside the chapter's 15 practice questions. */
  index: number;
  selected: number[];
  correct: boolean;
}

export interface McqAttemptRecord {
  at: string;
  correct: number;
  total: number;
  answers: McqAnswerRecord[];
}

export interface McqCurrent {
  answers: McqAnswerRecord[];
  finished: boolean;
  total: number;
  updatedAt: string;
}

export interface SimAnswers {
  /** Item position → chosen bucket id. */
  choices: Record<number, string>;
  submitted: boolean;
}

/** Everything saved about one chapter's practice MCQs, flashcard quiz and sort-game simulators. */
export interface StudyState {
  mcq: { current: McqCurrent | null; history: McqAttemptRecord[] };
  cards: { results: Record<number, CardResult>; known: number[] };
  /** Sort-game simulators, keyed "s<block index>". */
  sims: Record<string, SimAnswers>;
}

export const EMPTY_STUDY: StudyState = {
  mcq: { current: null, history: [] },
  cards: { results: {}, known: [] },
  sims: {},
};

export function isStudyEmpty(state: StudyState): boolean {
  return (
    !state.mcq.current &&
    state.mcq.history.length === 0 &&
    Object.keys(state.cards.results).length === 0 &&
    state.cards.known.length === 0 &&
    Object.keys(state.sims).length === 0
  );
}
