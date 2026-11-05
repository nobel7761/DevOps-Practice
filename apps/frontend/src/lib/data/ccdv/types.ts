// Content shapes for the CCDV-F (Claude Certified Developer – Foundations) prep course.
// Chapter metadata (title, day, topics) lives in schedule.ts; chapter JSON files
// (lib/data/ccdv/chapters/<id>.json) hold only the content below.

import type { LessonBlock } from "@/lib/data/hermes/lesson.types";

export type DomainId = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;

export interface CcdvMcqBase {
  question: string;
  options: string[];
  /** Indexes of the correct option(s). One entry = single-answer, more = "select N". */
  answerIndexes: number[];
  explanation: string;
  /** Blueprint skill name, e.g. "Claude API Mechanics". */
  skill: string;
}

/** Chapter practice question. domain 0 = general / certification logistics (chapter ch00 only). */
export interface CcdvMcq extends CcdvMcqBase {
  domain: DomainId | 0;
}

export interface CcdvFlashcard {
  front: string;
  back: string;
}

export interface CcdvLabStep {
  title: string;
  /** Markdown; code goes in fenced blocks. */
  body: string;
}

export interface CcdvChapterContent {
  lesson: {
    oneLiner: string;
    blocks: LessonBlock[];
    recap: string[];
  };
  lab: {
    goal: string;
    requirements: string[];
    steps: CcdvLabStep[];
    checkpoints: string[];
  };
  /** Markdown study notes (cheat-sheet style). */
  notes: string;
  flashcards: CcdvFlashcard[];
  mcqs: CcdvMcq[];
}

export interface CcdvExamQuestion extends CcdvMcqBase {
  id: string;
  domain: DomainId;
  /** Chapter to revise if this question is answered wrong, e.g. "ch03". */
  chapterId: string;
}

export interface CcdvExam {
  id: string;
  number: number;
  questions: CcdvExamQuestion[];
}

export type ChapterPart = "lesson" | "lab" | "cards" | "mcq";
