import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class ValidateAnswerDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(600)
  question: string;

  /** The flashcard's own answer, used as the grading reference. */
  @IsString()
  @IsNotEmpty()
  @MaxLength(1200)
  referenceAnswer: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1200)
  userAnswer: string;
}
