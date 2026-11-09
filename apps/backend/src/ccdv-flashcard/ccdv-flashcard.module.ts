import { Module } from '@nestjs/common';
import { OpenAiModule } from '../openai/openai.module';
import { CcdvFlashcardController } from './ccdv-flashcard.controller';
import { CcdvFlashcardService } from './ccdv-flashcard.service';

@Module({
  imports: [OpenAiModule],
  controllers: [CcdvFlashcardController],
  providers: [CcdvFlashcardService],
})
export class CcdvFlashcardModule {}
