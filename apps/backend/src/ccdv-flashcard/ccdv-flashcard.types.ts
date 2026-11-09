export type FlashcardVerdict = 'correct' | 'incorrect';

export interface FlashcardValidation {
  verdict: FlashcardVerdict;
  /** One or two short Bangla sentences: what is right, or what is missing. */
  feedback: string;
}
