import { IsNotEmpty, IsString } from 'class-validator';

export class GradeAnswerDto {
  @IsString()
  @IsNotEmpty()
  questionId: string;

  @IsString()
  @IsNotEmpty()
  command: string;
}
