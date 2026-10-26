/// <reference types="jest" />
import {
  QUESTIONS_PER_ATTEMPT,
  createRng,
  gradeAttempt,
  isPass,
  selectQuestions,
  serveQuestion,
  shuffleForAttempt,
  type SdQuestion,
} from './quiz-engine';

const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

/** 60 questions, 20 per difficulty; the correct option is always index 0 in the bank. */
const BANK: SdQuestion[] = Array.from({ length: 60 }, (_, i) => ({
  id: `q${String(i + 1).padStart(2, '0')}`,
  difficulty: DIFFICULTIES[Math.floor(i / 20)],
  question: `প্রশ্ন ${i + 1}`,
  options: ['সঠিক', 'ভুল ক', 'ভুল খ', 'ভুল গ'],
  correctIndex: 0,
  explanation: 'সঠিকটা কেন সঠিক।',
  whyWrong: { '1': 'ক কেন ভুল।', '2': 'খ কেন ভুল।', '3': 'গ কেন ভুল।' },
}));

const byId = new Map(BANK.map((q) => [q.id, q]));
const countBy = (ids: string[], difficulty: string) =>
  ids.filter((id) => byId.get(id)!.difficulty === difficulty).length;

describe('selectQuestions', () => {
  it('picks exactly 20 questions per attempt, none twice', () => {
    const { questionIds } = selectQuestions(BANK, [], createRng(1));
    expect(questionIds).toHaveLength(QUESTIONS_PER_ATTEMPT);
    expect(new Set(questionIds).size).toBe(QUESTIONS_PER_ATTEMPT);
    expect(questionIds.every((id) => byId.has(id))).toBe(true);
  });

  it('repeats no question across the first 3 attempts, so all 60 are seen once', () => {
    const rng = createRng(2);
    let seen: string[] = [];
    const all: string[] = [];
    for (let attempt = 0; attempt < 3; attempt++) {
      const result = selectQuestions(BANK, seen, rng);
      expect(result.newCycle).toBe(false);
      all.push(...result.questionIds);
      seen = result.seenIds;
    }
    expect(new Set(all).size).toBe(60);
  });

  it('mixes easy / medium / hard as evenly as possible in every attempt', () => {
    const rng = createRng(3);
    let seen: string[] = [];
    for (let attempt = 0; attempt < 3; attempt++) {
      const { questionIds, seenIds } = selectQuestions(BANK, seen, rng);
      for (const difficulty of DIFFICULTIES) {
        expect(countBy(questionIds, difficulty)).toBeGreaterThanOrEqual(6);
        expect(countBy(questionIds, difficulty)).toBeLessThanOrEqual(8);
      }
      seen = seenIds;
    }
  });

  it('starts a new cycle once all 60 have been seen', () => {
    const allIds = BANK.map((q) => q.id);
    const result = selectQuestions(BANK, allIds, createRng(4));
    expect(result.newCycle).toBe(true);
    expect(new Set(result.questionIds).size).toBe(20);
    expect(result.seenIds.sort()).toEqual([...result.questionIds].sort());
  });

  it('tops up from a new cycle when fewer than 20 unseen are left', () => {
    const seen = BANK.slice(0, 50).map((q) => q.id);
    const result = selectQuestions(BANK, seen, createRng(5));
    const unseen = BANK.slice(50).map((q) => q.id);
    expect(unseen.every((id) => result.questionIds.includes(id))).toBe(true);
    expect(new Set(result.questionIds).size).toBe(20);
    expect(result.newCycle).toBe(true);
  });

  it('shuffles question order, so it is not the bank order', () => {
    const { questionIds } = selectQuestions(BANK, [], createRng(6));
    expect(questionIds).not.toEqual([...questionIds].sort());
  });

  it('is repeatable for the same seed', () => {
    expect(selectQuestions(BANK, [], createRng(7))).toEqual(
      selectQuestions(BANK, [], createRng(7)),
    );
  });
});

describe('option shuffle', () => {
  const ids = BANK.slice(0, 20).map((q) => q.id);
  const attempt = shuffleForAttempt(ids, createRng(8));

  it('gives every question a permutation of its 4 options', () => {
    for (const { order } of attempt) {
      expect([...order].sort()).toEqual([0, 1, 2, 3]);
    }
  });

  it('actually moves the correct answer around across questions', () => {
    const correctPositions = new Set(
      attempt.map(({ order }) => order.indexOf(0)),
    );
    expect(correctPositions.size).toBeGreaterThan(1);
  });

  it('serves options in the shuffled order without revealing the answer', () => {
    const served = serveQuestion(byId.get(attempt[0].id)!, attempt[0].order);
    expect(served.options).toEqual(
      attempt[0].order.map((i) => BANK[0].options[i]),
    );
    expect(served).not.toHaveProperty('correctIndex');
    expect(served).not.toHaveProperty('explanation');
    expect(served).not.toHaveProperty('whyWrong');
  });

  it('still recognises the correct answer after shuffling', () => {
    const first = attempt[0];
    const displayedCorrect = first.order.indexOf(0);
    const result = gradeAttempt(BANK, [first], {
      [first.id]: displayedCorrect,
    });
    expect(result.score).toBe(1);
    expect(result.results[0]).toMatchObject({
      correct: true,
      correctIndex: displayedCorrect,
    });
  });
});

describe('gradeAttempt', () => {
  const ids = BANK.slice(0, 20).map((q) => q.id);
  const attempt = shuffleForAttempt(ids, createRng(9));
  const correctAnswer = (i: number) => attempt[i].order.indexOf(0);
  const wrongAnswer = (i: number) => attempt[i].order.indexOf(2); // bank option 2 ("ভুল খ")

  const answersWithWrong = (wrongCount: number) =>
    Object.fromEntries(
      attempt.map((q, i) => [
        q.id,
        i < wrongCount ? wrongAnswer(i) : correctAnswer(i),
      ]),
    );

  it('19 / 20 passes', () => {
    expect(gradeAttempt(BANK, attempt, answersWithWrong(1))).toMatchObject({
      score: 19,
      total: 20,
      percent: 95,
      passed: true,
    });
  });

  it('18 / 20 fails', () => {
    expect(gradeAttempt(BANK, attempt, answersWithWrong(2))).toMatchObject({
      score: 18,
      passed: false,
    });
  });

  it('explains a wrong answer: what was chosen, the right one, why right, and why the chosen one is wrong', () => {
    const { results } = gradeAttempt(BANK, attempt, answersWithWrong(1));
    expect(results[0]).toMatchObject({
      correct: false,
      chosenIndex: wrongAnswer(0),
      correctIndex: correctAnswer(0),
      explanation: 'সঠিকটা কেন সঠিক।',
      whyChosenIsWrong: 'খ কেন ভুল।',
    });
    expect(results[0].options[results[0].chosenIndex!]).toBe('ভুল খ');
  });

  it('counts an unanswered question as wrong', () => {
    const answers = answersWithWrong(0);
    delete answers[attempt[0].id];
    const { score, results } = gradeAttempt(BANK, attempt, answers);
    expect(score).toBe(19);
    expect(results[0]).toMatchObject({
      correct: false,
      chosenIndex: null,
      whyChosenIsWrong: null,
    });
  });
});

describe('isPass', () => {
  it('needs 95% or more', () => {
    expect(isPass(19, 20)).toBe(true);
    expect(isPass(20, 20)).toBe(true);
    expect(isPass(18, 20)).toBe(false);
  });
});
