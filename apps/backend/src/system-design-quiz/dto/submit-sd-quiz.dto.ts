import { IsObject } from 'class-validator';

export class SubmitSdQuizDto {
  /** Question id → chosen option, as the index the learner saw (after shuffling). */
  @IsObject()
  answers: Record<string, number>;
}
