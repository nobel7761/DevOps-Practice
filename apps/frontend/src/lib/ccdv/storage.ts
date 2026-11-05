// Browser-only persistence for exam attempts, in-progress exam drafts, and
// flashcard / MCQ practice state. Everything is wrapped in try/catch so a
// blocked or full localStorage never breaks the page.

import type { ScoreResult } from "./scoring";

export interface AttemptRecord {
  id: string;
  examNumber: number;
  startedAt: number;
  submittedAt: number;
  durationSec: number;
  timedOut: boolean;
  answers: Record<string, number[]>;
  flagged: string[];
  /** Time spent per question id, seconds. */
  timeSpent: Record<string, number>;
  result: ScoreResult;
}

export interface ExamDraft {
  answers: Record<string, number[]>;
  flagged: string[];
  timeSpent: Record<string, number>;
  remainingSec: number;
  startedAt: number;
  currentIndex: number;
}

const ATTEMPTS_KEY = "ccdv:attempts";
const draftKey = (examNumber: number) => `ccdv:draft:${examNumber}`;
const cardsKey = (chapterId: string) => `ccdv:cards:${chapterId}`;
const mcqKey = (chapterId: string) => `ccdv:mcq:${chapterId}`;

function read<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

function remove(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export function loadAttempts(): AttemptRecord[] {
  return read<AttemptRecord[]>(ATTEMPTS_KEY, []);
}

export function saveAttempt(attempt: AttemptRecord): void {
  write(ATTEMPTS_KEY, [...loadAttempts(), attempt]);
}

export function loadDraft(examNumber: number): ExamDraft | null {
  return read<ExamDraft | null>(draftKey(examNumber), null);
}

export function saveDraft(examNumber: number, draft: ExamDraft): void {
  write(draftKey(examNumber), draft);
}

export function clearDraft(examNumber: number): void {
  remove(draftKey(examNumber));
}

export function loadKnownCards(chapterId: string): number[] {
  return read<number[]>(cardsKey(chapterId), []);
}

export function saveKnownCards(chapterId: string, known: number[]): void {
  write(cardsKey(chapterId), known);
}

export interface McqBest {
  correct: number;
  total: number;
}

export function loadMcqBest(chapterId: string): McqBest | null {
  return read<McqBest | null>(mcqKey(chapterId), null);
}

export function saveMcqBest(chapterId: string, best: McqBest): void {
  const previous = loadMcqBest(chapterId);
  if (!previous || best.correct >= previous.correct)
    write(mcqKey(chapterId), best);
}
