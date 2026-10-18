import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

class TranslatableQuestionDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  scenario: string;
}

export class TranslateInterviewDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TranslatableQuestionDto)
  questions: TranslatableQuestionDto[];
}
