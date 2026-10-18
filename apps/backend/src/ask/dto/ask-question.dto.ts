import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class AskLabDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  intro: string;
}

class AskInterviewQuestionDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  scenario: string;
}

class AskInterviewDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AskInterviewQuestionDto)
  questions: AskInterviewQuestionDto[];
}

class AskContextDto {
  @IsString()
  @IsNotEmpty()
  videoTitle: string;

  @IsOptional()
  @IsString()
  golpoMarkdown?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AskLabDto)
  labs?: AskLabDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => AskInterviewDto)
  interview?: AskInterviewDto;
}

export class AskQuestionDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @ValidateNested()
  @Type(() => AskContextDto)
  context: AskContextDto;
}
