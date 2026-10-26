// System Design A-Z quiz rules (Plan doc Section 7): 20 of a topic's 60
// questions per attempt, unseen ones first, difficulties mixed evenly,
// question and option order shuffled, pass at 95%. Pure functions; the rng
// is passed in so selection is testable and replayable.

export type SdDifficulty = 'easy' | 'medium' | 'hard';

export interface SdQuestion {
  id: string;
  difficulty: SdDifficulty;
  question: string;
  diagram?: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  /** Bank option index (as a string key, from JSON) → why that option is wrong. */
  whyWrong: Record<string, string>;
}

/** One served question: `order[displayedIndex]` is the option's index in the bank. */
export interface AttemptQuestion {
  id: string;
  order: number[];
}

export const QUESTIONS_PER_ATTEMPT = 20;
export const PASS_PERCENT = 95;
const OPTIONS_PER_QUESTION = 4;
const DIFFICULTIES: SdDifficulty[] = ['easy', 'medium', 'hard'];

/** Seeded PRNG (mulberry32), returns [0, 1). */
export function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Takes `count` questions from `pool`, always drawing from the difficulty
 * with the most questions left (ties broken randomly), so each attempt is as
 * evenly mixed as the remaining pool allows.
 */
function pickBalanced(
  pool: SdQuestion[],
  count: number,
  rng: () => number,
): SdQuestion[] {
  const byDifficulty = new Map(
    DIFFICULTIES.map((d) => [
      d,
      shuffle(
        pool.filter((q) => q.difficulty === d),
        rng,
      ),
    ]),
  );
  const picked: SdQuestion[] = [];
  while (picked.length < count) {
    const most = Math.max(
      ...[...byDifficulty.values()].map((list) => list.length),
    );
    if (most === 0) break;
    const candidates = DIFFICULTIES.filter(
      (d) => byDifficulty.get(d)!.length === most,
    );
    const difficulty = candidates[Math.floor(rng() * candidates.length)];
    picked.push(byDifficulty.get(difficulty)!.pop()!);
  }
  return picked;
}

/**
 * Chooses the next attempt's questions. Unseen questions come first; once
 * fewer than 20 are left, the remainder is topped up from a fresh cycle and
 * the seen list restarts from this attempt.
 */
export function selectQuestions(
  bank: SdQuestion[],
  seenIds: readonly string[],
  rng: () => number,
): { questionIds: string[]; seenIds: string[]; newCycle: boolean } {
  const seen = new Set(seenIds);
  const unseen = bank.filter((q) => !seen.has(q.id));

  if (unseen.length >= QUESTIONS_PER_ATTEMPT) {
    const picked = pickBalanced(unseen, QUESTIONS_PER_ATTEMPT, rng);
    const questionIds = shuffle(picked, rng).map((q) => q.id);
    return {
      questionIds,
      seenIds: [...seenIds, ...questionIds],
      newCycle: false,
    };
  }

  const pickedUnseen = new Set(unseen.map((q) => q.id));
  const topUp = pickBalanced(
    bank.filter((q) => !pickedUnseen.has(q.id)),
    QUESTIONS_PER_ATTEMPT - unseen.length,
    rng,
  );
  const questionIds = shuffle([...unseen, ...topUp], rng).map((q) => q.id);
  return { questionIds, seenIds: [...questionIds], newCycle: true };
}

/** Gives each question its own random option order for this attempt. */
export function shuffleForAttempt(
  questionIds: string[],
  rng: () => number,
): AttemptQuestion[] {
  const positions = Array.from({ length: OPTIONS_PER_QUESTION }, (_, i) => i);
  return questionIds.map((id) => ({ id, order: shuffle(positions, rng) }));
}

/** What the learner sees: options in this attempt's order, no answer or explanations. */
export function serveQuestion(question: SdQuestion, order: number[]) {
  return {
    id: question.id,
    difficulty: question.difficulty,
    question: question.question,
    ...(question.diagram ? { diagram: question.diagram } : {}),
    options: order.map((i) => question.options[i]),
  };
}

export function isPass(score: number, total: number): boolean {
  return total > 0 && (score / total) * 100 >= PASS_PERCENT;
}

/** Grades answers given as displayed option indexes; results are in displayed order too. */
export function gradeAttempt(
  bank: SdQuestion[],
  attempt: AttemptQuestion[],
  answers: Record<string, number | undefined>,
) {
  const byId = new Map(bank.map((q) => [q.id, q]));
  const results = attempt.map(({ id, order }) => {
    const question = byId.get(id);
    if (!question) throw new Error(`Unknown question ${id}`);
    const chosen = answers[id];
    const chosenIndex =
      typeof chosen === 'number' && chosen >= 0 && chosen < order.length
        ? chosen
        : null;
    const correctIndex = order.indexOf(question.correctIndex);
    const correct = chosenIndex === correctIndex;
    return {
      id,
      question: question.question,
      options: order.map((i) => question.options[i]),
      chosenIndex,
      correctIndex,
      correct,
      explanation: question.explanation,
      whyChosenIsWrong:
        chosenIndex !== null && !correct
          ? (question.whyWrong[String(order[chosenIndex])] ?? null)
          : null,
    };
  });
  const score = results.filter((r) => r.correct).length;
  const total = results.length;
  return {
    score,
    total,
    percent: total === 0 ? 0 : Math.round((score / total) * 100),
    passed: isPass(score, total),
    results,
  };
}
