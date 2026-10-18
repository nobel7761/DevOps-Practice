import { IsNotEmpty, IsString } from 'class-validator';

export class TranslateLabDto {
  @IsString()
  @IsNotEmpty()
  markdown: string;
}
