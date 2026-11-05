/// <reference types="jest" />
// Content guard for the Hermes course quiz banks: every lesson has a bank of
// at least 20 questions, and no question can be guessed from option length
// (a real bug: correct answers were the long ones).
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { findLengthTellViolations } from '../quiz/no-length-tell';

const DATA_DIR = join(__dirname, 'data');
const LESSON_DIR = join(
  __dirname,
  '../../../frontend/src/lib/data/hermes/docs',
);

const lessonIds = readdirSync(LESSON_DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => f.replace(/\.json$/, ''));

const load = (id: string) =>
  JSON.parse(readFileSync(join(DATA_DIR, `${id}.json`), 'utf-8'));

describe('every Hermes lesson has a quiz bank', () => {
  it('finds the lesson files', () => {
    expect(lessonIds.length).toBeGreaterThan(80);
  });

  it.each(lessonIds)('%s has a bank file', (id) => {
    expect(existsSync(join(DATA_DIR, `${id}.json`))).toBe(true);
  });
});

describe('quiz bank contents', () => {
  it.each(lessonIds)('%s is a good bank', (id) => {
    if (!existsSync(join(DATA_DIR, `${id}.json`))) {
      throw new Error(`missing bank: ${id}`);
    }
    const bank = load(id);
    const qs: any[] = bank.questions;

    expect(bank.contentId).toBe(id);
    expect(qs.length).toBeGreaterThanOrEqual(20);
    expect(new Set(qs.map((q) => q.id)).size).toBe(qs.length);

    for (const q of qs) {
      expect(['easy', 'medium', 'hard']).toContain(q.difficulty);
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.correctIndex).toBeGreaterThanOrEqual(0);
      expect(q.correctIndex).toBeLessThan(4);
      expect(q.explanation.trim()).not.toBe('');
      const wrong = [0, 1, 2, 3].filter((i) => i !== q.correctIndex);
      expect(Object.keys(q.whyWrong).sort()).toEqual(wrong.map(String));
    }

    // The unique longest option must never be the correct one.
    const adapted = qs.map((q) => ({ ...q, answerIndex: q.correctIndex }));
    expect(findLengthTellViolations(adapted)).toEqual([]);

    // ...and the correct option must not be the longest in most questions.
    const longest = qs.filter((q) => {
      const lengths = q.options.map((o: string) => o.length);
      return lengths[q.correctIndex] === Math.max(...lengths);
    });
    expect(longest.length / qs.length).toBeLessThanOrEqual(0.4);

    // The correct answer is spread across all positions.
    const counts = [0, 0, 0, 0];
    qs.forEach((q) => counts[q.correctIndex]++);
    counts.forEach((c) => expect(c / qs.length).toBeLessThanOrEqual(0.4));
  });
});
