import {
  DOMAIN_IDS,
  PASS_SCALED,
  SCALED_MAX,
  SCALED_MIN,
} from "@/lib/data/ccdv/blueprint";
import type { CcdvMcqBase, DomainId } from "@/lib/data/ccdv/types";

export interface DomainTally {
  correct: number;
  total: number;
}

export interface ScoreResult {
  correct: number;
  total: number;
  percent: number;
  scaled: number;
  passed: boolean;
  byDomain: Record<DomainId, DomainTally>;
}

/** All-or-nothing: the selected set must equal the answer set exactly. */
export function isAnswerCorrect(
  question: Pick<CcdvMcqBase, "answerIndexes">,
  selected: number[] | undefined,
): boolean {
  if (!selected || selected.length !== question.answerIndexes.length) {
    return false;
  }
  const wanted = new Set(question.answerIndexes);
  return selected.every((index) => wanted.has(index));
}

/**
 * Linear estimate of the scaled score (official 100-1000 scale, cut 720). The real
 * exam's exact scaling is not published, so treat this as an approximation.
 */
export function toScaledScore(fraction: number): number {
  return Math.round(SCALED_MIN + (SCALED_MAX - SCALED_MIN) * fraction);
}

function emptyTallies(): Record<DomainId, DomainTally> {
  return Object.fromEntries(
    DOMAIN_IDS.map((id) => [id, { correct: 0, total: 0 }]),
  ) as Record<DomainId, DomainTally>;
}

export function scoreAnswers(
  questions: (CcdvMcqBase & { id: string; domain: DomainId })[],
  answers: Record<string, number[]>,
): ScoreResult {
  const byDomain = emptyTallies();
  let correct = 0;
  for (const question of questions) {
    const tally = byDomain[question.domain];
    tally.total += 1;
    if (isAnswerCorrect(question, answers[question.id])) {
      tally.correct += 1;
      correct += 1;
    }
  }
  const total = questions.length;
  const fraction = total === 0 ? 0 : correct / total;
  const scaled = toScaledScore(fraction);
  return {
    correct,
    total,
    percent: Math.round(fraction * 1000) / 10,
    scaled,
    passed: scaled >= PASS_SCALED,
    byDomain,
  };
}

export function domainPercent(tally: DomainTally): number | null {
  return tally.total === 0
    ? null
    : Math.round((tally.correct / tally.total) * 100);
}
