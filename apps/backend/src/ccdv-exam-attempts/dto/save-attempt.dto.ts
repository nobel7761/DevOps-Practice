import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsObject,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class SaveAttemptDto {
  @IsString() @MaxLength(80) id: string;
  @IsInt() @Min(1) @Max(10) examNumber: number;
  @IsInt() @Min(0) startedAt: number;
  @IsInt() @Min(0) submittedAt: number;
  @IsInt() @Min(0) @Max(20000) durationSec: number;
  @IsBoolean() timedOut: boolean;
  @IsObject() answers: Record<string, number[]>;
  @IsArray() @ArrayMaxSize(60) @IsString({ each: true }) flagged: string[];
  @IsObject() timeSpent: Record<string, number>;
  @IsObject() result: Record<string, unknown>;
}
