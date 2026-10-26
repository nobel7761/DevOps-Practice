import { IsString, MinLength } from 'class-validator';

export class SaveTokenDto {
  @IsString()
  @MinLength(10)
  token: string;
}
