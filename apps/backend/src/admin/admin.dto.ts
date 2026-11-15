import { IsArray, IsBoolean, IsOptional, IsString } from 'class-validator';

export class AccessDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  courseIds?: string[];

  @IsOptional()
  @IsBoolean()
  askAiEnabled?: boolean;
}
