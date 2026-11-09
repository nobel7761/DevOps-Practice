import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsString,
  MaxLength,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class McqAnswerDto {
  @IsInt() @Min(0) @Max(99) index: number;

  @IsArray()
  @ArrayMaxSize(6)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(9, { each: true })
  selected: number[];

  @IsBoolean() correct: boolean;
}

export class SaveMcqDto {
  @IsArray()
  @ArrayMaxSize(60)
  @ValidateNested({ each: true })
  @Type(() => McqAnswerDto)
  answers: McqAnswerDto[];

  @IsInt() @Min(1) @Max(60) total: number;

  @IsBoolean() finished: boolean;
}

export class CardResultDto {
  @IsInt() @Min(0) @Max(99) index: number;
  @IsString() @MaxLength(1200) answer: string;
  @IsIn(['correct', 'incorrect']) verdict: 'correct' | 'incorrect';
  @IsString() @MaxLength(600) feedback: string;
}

export class SaveCardsDto {
  @IsArray()
  @ArrayMaxSize(60)
  @ValidateNested({ each: true })
  @Type(() => CardResultDto)
  results: CardResultDto[];

  @IsArray()
  @ArrayMaxSize(60)
  @IsInt({ each: true })
  @Min(0, { each: true })
  @Max(99, { each: true })
  known: number[];
}

export class SimChoiceDto {
  @IsInt() @Min(0) @Max(99) item: number;
  @IsString() @MaxLength(40) bucket: string;
}

export class SaveSimDto {
  @IsArray()
  @ArrayMaxSize(30)
  @ValidateNested({ each: true })
  @Type(() => SimChoiceDto)
  choices: SimChoiceDto[];

  @IsBoolean() submitted: boolean;
}
