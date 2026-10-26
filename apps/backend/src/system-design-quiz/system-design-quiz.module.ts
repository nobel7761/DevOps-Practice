import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SdQuizAttempt,
  SdQuizAttemptSchema,
  SdQuizProgress,
  SdQuizProgressSchema,
} from './schemas/sd-quiz.schema';
import { SystemDesignQuizController } from './system-design-quiz.controller';
import { SystemDesignQuizService } from './system-design-quiz.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SdQuizProgress.name, schema: SdQuizProgressSchema },
      { name: SdQuizAttempt.name, schema: SdQuizAttemptSchema },
    ]),
  ],
  controllers: [SystemDesignQuizController],
  providers: [SystemDesignQuizService],
})
export class SystemDesignQuizModule {}
