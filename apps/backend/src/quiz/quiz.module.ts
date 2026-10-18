import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QuizController } from './quiz.controller';
import { QuizService } from './quiz.service';
import { QuizAttempt, QuizAttemptSchema } from './schemas/quiz-attempt.schema';
import {
  ContentProgress,
  ContentProgressSchema,
} from '../progress/schemas/content-progress.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: QuizAttempt.name, schema: QuizAttemptSchema },
      { name: ContentProgress.name, schema: ContentProgressSchema },
    ]),
  ],
  controllers: [QuizController],
  providers: [QuizService],
})
export class QuizModule {}
