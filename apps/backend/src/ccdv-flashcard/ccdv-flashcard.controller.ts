import { Body, Controller, Post } from '@nestjs/common';
import { CcdvFlashcardService } from './ccdv-flashcard.service';
import { ValidateAnswerDto } from './dto/validate-answer.dto';

@Controller('ccdv-flashcard')
export class CcdvFlashcardController {
  constructor(private readonly flashcards: CcdvFlashcardService) {}

  @Post('validate')
  validate(@Body() dto: ValidateAnswerDto) {
    return this.flashcards.validate(dto);
  }
}
