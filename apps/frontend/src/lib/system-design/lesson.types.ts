// Shape of one System Design A-Z topic lesson — the 18-section template from
// docs/SYSTEM_DESIGN_PLATFORM_PLAN.md Section 5. Prose fields are markdown.
// Recall Map, quiz and LinkedIn post live in their own files (see
// docs/SYSTEM_DESIGN_CONTENT_STRUCTURE.md), so they're not part of this shape.

/** A diagram slot. `id` refers to the shared diagram library (built in M2). */
export interface LessonDiagram {
  id: string;
  /** One-line Bangla caption shown under the diagram. */
  caption: string;
  /** Screen-reader description. */
  alt: string;
  /** Shows the "LinkedIn-এর জন্য ডাউনলোড" button (the lesson's main diagram). */
  downloadable?: boolean;
}

/** What a diagram needs to know about its lesson, e.g. for the LinkedIn image header. */
export interface LessonMeta {
  topicId: string;
  day: number;
  title: string;
  definition: string;
}

export interface LessonTopicLink {
  day: number;
  title: string;
  href: string;
}

export interface LessonProseSection {
  markdown: string;
  diagrams?: LessonDiagram[];
}

export interface LessonDeepDiveItem {
  title: string;
  markdown: string;
  diagrams?: LessonDiagram[];
}

export interface LessonComparisonTable {
  headers: string[];
  rows: string[][];
}

export interface LessonMistake {
  mistake: string;
  fix: string;
}

export interface LessonLabStep {
  title: string;
  /** Markdown, usually with a fenced command block. */
  markdown: string;
}

export interface LessonOpenQuestion {
  question: string;
  idealAnswer: string;
}

export interface LessonInterviewQuestion {
  question: string;
  /** Markdown outline of a good answer. */
  answerOutline: string;
}

export interface SdLesson {
  topicId: string;
  day: number;
  title: string;
  /** One-line definition, used on the summary card and LinkedIn images. */
  definition: string;
  objectives: string[];
  prerequisites: LessonTopicLink[];
  problem: LessonProseSection;
  analogy: LessonProseSection;
  coreConcept: LessonProseSection;
  deepDive: LessonDeepDiveItem[];
  /** Simulator id (Section 9), when the topic has one. */
  simulator?: string;
  tradeOffs: LessonProseSection & { table: LessonComparisonTable };
  industry: LessonProseSection;
  mistakes: LessonMistake[];
  lab: LessonLabStep[];
  connections: LessonProseSection;
  explainYourself: LessonOpenQuestion[];
  interviewQuestions: LessonInterviewQuestion[];
  summary: { points: string[]; diagram?: LessonDiagram };
}
