import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HermesQuizController } from './hermes-quiz.controller';
import { HermesQuizService } from './hermes-quiz.service';
import {
  HermesQuizAttempt,
  HermesQuizAttemptSchema,
  HermesQuizProgress,
  HermesQuizProgressSchema,
} from './schemas/hermes-quiz.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: HermesQuizProgress.name, schema: HermesQuizProgressSchema },
      { name: HermesQuizAttempt.name, schema: HermesQuizAttemptSchema },
    ]),
  ],
  controllers: [HermesQuizController],
  providers: [HermesQuizService],
})
export class HermesQuizModule {}
