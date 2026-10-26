import { QuizQuestion } from './quiz.types';

/**
 * Questions whose correct option is the unique longest among its options —
 * guessable without reading the question. Returns the offending question ids.
 */
export function findLengthTellViolations(questions: QuizQuestion[]): string[] {
  return questions
    .filter((q) => {
      const lengths = q.options.map((o) => o.length);
      const correctLength = lengths[q.answerIndex];
      const maxLength = Math.max(...lengths);
      const tiedForLongest = lengths.filter((l) => l === maxLength).length;
      return correctLength === maxLength && tiedForLongest === 1;
    })
    .map((q) => q.id);
}
