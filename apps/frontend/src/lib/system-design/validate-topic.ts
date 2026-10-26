// Content validation for System Design A-Z topics — the automatable parts of
// docs/SYSTEM_DESIGN_PLATFORM_PLAN.md Section 14. Each validator returns a
// list of human-readable errors; an empty list means the content is valid.

// Explicit .ts extension: the validation CLI runs this file directly under Node.
import { renderBold } from "./linkedin/post.ts";

export type SdQuizDifficulty = "easy" | "medium" | "hard";

export interface SdQuizQuestion {
  id: string;
  difficulty: SdQuizDifficulty;
  question: string;
  /** Id of a shared diagram to show with the question. */
  diagram?: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  /** Wrong option index → one sentence on why it's wrong. */
  whyWrong: Record<number, string>;
}

export interface SdQuizBank {
  topicId: string;
  questions: SdQuizQuestion[];
}

export interface RecallPoint {
  term: string;
  prompt: string;
  answer: string;
  lessonLink: string;
}

export interface RecallMap {
  topicId: string;
  points: RecallPoint[];
}

export type LinkedInPostType =
  "story" | "mistakes" | "poll" | "company" | "recap";

export interface LinkedInPost {
  type: LinkedInPostType;
  text: string;
  personalPrompt: string;
  firstComment: string;
  hashtags: string[];
  visual?: string;
  poll?: {
    question: string;
    options: [string, string, string, string];
    answerComment: string;
  };
  sources?: string[];
}

const QUESTIONS_PER_BANK = 60;
const QUESTIONS_PER_DIFFICULTY = 20;
const OPTIONS_PER_QUESTION = 4;
const RECALL_MIN_POINTS = 6;
const RECALL_MAX_POINTS = 10;
const POST_MAX_CHARS = 3000;
const HOOK_MAX_CHARS = 150;
const HASHTAG_MIN = 3;
const HASHTAG_MAX = 5;
const REQUIRED_HASHTAGS = ["#100DaysOfSystemDesign", "#SystemDesign"];
const POLL_QUESTION_MAX_CHARS = 140;
const POLL_OPTION_MAX_CHARS = 30;
const PERSONAL_PLACEHOLDER = "[✍️ আপনার অভিজ্ঞতা:";
const LAST_NUMBERED_DAY = 100;
const MAX_SAME_TYPE_IN_A_ROW = 2;

// Options that stop making sense once options are shuffled (Section 7.1).
const BANNED_OPTION_PATTERNS = [
  /উপরের সব/,
  /কোনোটিই নয়/,
  /কোনোটাই না/,
  /all of the above/i,
  /none of the above/i,
  /none of these/i,
];

const isBlank = (value: string | undefined) => !value || value.trim() === "";

function validateQuestion(question: SdQuizQuestion): string[] {
  const errors: string[] = [];
  const { id, options, correctIndex } = question;

  if (isBlank(question.question)) errors.push(`${id}: প্রশ্ন খালি`);

  if (options.length !== OPTIONS_PER_QUESTION) {
    errors.push(
      `${id}: ঠিক ${OPTIONS_PER_QUESTION}টা option থাকতে হবে, আছে ${options.length}টা`,
    );
  }
  if (
    !Number.isInteger(correctIndex) ||
    correctIndex < 0 ||
    correctIndex >= options.length
  ) {
    errors.push(`${id}: correctIndex ${correctIndex} সঠিক option index না`);
  }
  if (
    options.some((option) => BANNED_OPTION_PATTERNS.some((p) => p.test(option)))
  ) {
    errors.push(
      `${id}: "উপরের সবগুলো" / "কোনোটিই নয়" ধরনের option ব্যবহার করা যাবে না`,
    );
  }
  // Same rule as the lab quizzes (backend quiz/no-length-tell.ts): if the correct
  // option is the unique longest, the answer can be guessed without reading.
  const lengths = options.map((option) => option.length);
  const longest = Math.max(...lengths);
  if (
    lengths[correctIndex] === longest &&
    lengths.filter((l) => l === longest).length === 1
  ) {
    errors.push(
      `${id}: সঠিক option-টাই একা সবচেয়ে লম্বা, পড়া ছাড়াই আন্দাজ করা যায়`,
    );
  }
  if (isBlank(question.explanation)) errors.push(`${id}: explanation খালি`);

  options.forEach((_, index) => {
    if (index !== correctIndex && isBlank(question.whyWrong[index])) {
      errors.push(`${id}: option ${index}-এর whyWrong নেই`);
    }
  });

  return errors;
}

export function validateQuizBank(bank: SdQuizBank): string[] {
  const errors: string[] = [];
  const { questions } = bank;

  if (questions.length !== QUESTIONS_PER_BANK) {
    errors.push(
      `${bank.topicId}: ঠিক ${QUESTIONS_PER_BANK}টা প্রশ্ন থাকতে হবে, আছে ${questions.length}টা`,
    );
  }

  (["easy", "medium", "hard"] as const).forEach((difficulty) => {
    const count = questions.filter((q) => q.difficulty === difficulty).length;
    if (count !== QUESTIONS_PER_DIFFICULTY) {
      errors.push(
        `${bank.topicId}: ${difficulty} প্রশ্ন ঠিক ${QUESTIONS_PER_DIFFICULTY}টা থাকতে হবে, আছে ${count}টা`,
      );
    }
  });

  const seenIds = new Set<string>();
  questions.forEach((question) => {
    if (seenIds.has(question.id)) errors.push(`${question.id}: duplicate id`);
    seenIds.add(question.id);
    errors.push(...validateQuestion(question));
  });

  return errors;
}

export function validateRecallMap(recall: RecallMap): string[] {
  const errors: string[] = [];
  const count = recall.points.length;

  if (count < RECALL_MIN_POINTS || count > RECALL_MAX_POINTS) {
    errors.push(
      `${recall.topicId}: Recall Map-এ ${RECALL_MIN_POINTS}-${RECALL_MAX_POINTS}টা point থাকতে হবে, আছে ${count}টা`,
    );
  }

  recall.points.forEach((point) => {
    (["term", "prompt", "answer", "lessonLink"] as const).forEach((field) => {
      if (isBlank(point[field])) {
        errors.push(
          `${recall.topicId} · ${point.term || "(নামহীন)"}: ${field} খালি`,
        );
      }
    });
  });

  return errors;
}

function validatePoll(poll: NonNullable<LinkedInPost["poll"]>): string[] {
  const errors: string[] = [];
  if ([...poll.question].length > POLL_QUESTION_MAX_CHARS) {
    errors.push(`Poll প্রশ্ন ${POLL_QUESTION_MAX_CHARS} character-এর বেশি`);
  }
  if (poll.options.length !== OPTIONS_PER_QUESTION) {
    errors.push(`Poll-এ ঠিক ${OPTIONS_PER_QUESTION}টা option থাকতে হবে`);
  }
  poll.options.forEach((option, index) => {
    if ([...option].length > POLL_OPTION_MAX_CHARS) {
      errors.push(
        `Poll option ${index + 1} ${POLL_OPTION_MAX_CHARS} character-এর বেশি`,
      );
    }
  });
  if (isBlank(poll.answerComment))
    errors.push("Poll-এর পরের দিনের উত্তর comment খালি");
  return errors;
}

export function validateLinkedInPost(post: LinkedInPost): string[] {
  const errors: string[] = [];
  // Measured on what will actually be pasted: bold converted, hashtags appended, UTF-16 units.
  const pasted = `${renderBold(post.text)}\n\n${post.hashtags.join(" ")}`;
  const length = pasted.length;

  if (length >= POST_MAX_CHARS) {
    errors.push(`Post ${length} character, ${POST_MAX_CHARS}-এর কম হতে হবে`);
  }

  const hookLength = pasted.split("\n").slice(0, 2).join("\n").length;
  if (hookLength > HOOK_MAX_CHARS) {
    errors.push(
      `Hook (প্রথম দুই লাইন) ${hookLength} character, ${HOOK_MAX_CHARS}-এর মধ্যে হতে হবে`,
    );
  }

  const { hashtags } = post;
  if (hashtags.length < HASHTAG_MIN || hashtags.length > HASHTAG_MAX) {
    errors.push(
      `Hashtag ${HASHTAG_MIN}-${HASHTAG_MAX}টা থাকতে হবে, আছে ${hashtags.length}টা`,
    );
  }
  if (REQUIRED_HASHTAGS.some((tag, index) => hashtags[index] !== tag)) {
    errors.push(`প্রথম দুটো hashtag হতে হবে ${REQUIRED_HASHTAGS.join(" ")}`);
  }

  // A recap post is a summary of the week, so it has no personal-experience line.
  if (post.type !== "recap" && !post.text.includes(PERSONAL_PLACEHOLDER)) {
    errors.push("অভিজ্ঞতার placeholder ([✍️ আপনার অভিজ্ঞতা: ...]) নেই");
  }
  if (isBlank(post.firstComment)) errors.push("প্রথম comment খালি");

  if (post.type === "poll") {
    if (post.poll) errors.push(...validatePoll(post.poll));
    else errors.push("Poll post-এ poll field নেই");
  } else if (post.type !== "recap" && isBlank(post.visual)) {
    errors.push("Post-এর visual নেই");
  }

  if (post.type === "company" && !post.sources?.length) {
    errors.push("Company post-এ তথ্যের sources থাকতে হবে");
  }

  return errors;
}

/** The second line of a post must be "Day N/100 · Topic" (or "Bonus Day N · Topic" past Day 100); the first is the hook. */
export function validatePostDayLine(
  text: string,
  day: number,
  topicTitle: string,
): string[] {
  const expected =
    day > LAST_NUMBERED_DAY
      ? `Bonus Day ${day} · ${topicTitle}`
      : `Day ${day}/${LAST_NUMBERED_DAY} · ${topicTitle}`;
  const secondLine = text.split("\n")[1]?.trim();
  return secondLine === expected
    ? []
    : [`দ্বিতীয় লাইন হতে হবে "${expected}", আছে "${secondLine ?? ""}"`];
}

/**
 * Main post types in Day order must not repeat more than twice in a row.
 * Recap posts are extras on top of a day's main post, so they're skipped.
 */
export function validatePostRotation(types: LinkedInPostType[]): string[] {
  const errors: string[] = [];
  let runType: LinkedInPostType | null = null;
  let runStartDay = 0;
  let runLength = 0;
  let day = 0;

  for (const type of types) {
    if (type === "recap") continue;
    day++;
    if (type === runType) {
      runLength++;
    } else {
      runType = type;
      runStartDay = day;
      runLength = 1;
    }
    if (runLength === MAX_SAME_TYPE_IN_A_ROW + 1) {
      errors.push(
        `Day ${runStartDay} থেকে পরপর ${runLength} দিন "${type}" post, ${MAX_SAME_TYPE_IN_A_ROW} দিনের বেশি একই ধরন চলবে না`,
      );
    }
  }

  return errors;
}
