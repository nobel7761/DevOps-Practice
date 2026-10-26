import { Type } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export class RecallPointDto {
  @IsString()
  @Matches(/^sd-day-\d{3}$/)
  topicId: string;

  @IsString()
  @IsNotEmpty()
  term: string;

  @IsInt()
  @Min(0)
  @Max(4)
  intervalIndex: number;

  @IsOptional()
  @IsIn(['good', 'partial', 'forgot'])
  lastRating: 'good' | 'partial' | 'forgot' | null;

  @Matches(DATE)
  nextDue: string;
}

export class StartRecallDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RecallPointDto)
  points: RecallPointDto[];
}

export class RecordReviewDto {
  @ValidateNested()
  @Type(() => RecallPointDto)
  point: RecallPointDto;

  @Matches(DATE)
  date: string;
}
