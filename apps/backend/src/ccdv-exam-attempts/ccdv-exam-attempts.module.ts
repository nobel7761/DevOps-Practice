import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CcdvExamAttemptsController } from './ccdv-exam-attempts.controller';
import { CcdvExamAttemptsService } from './ccdv-exam-attempts.service';
import {
  CcdvExamAttempt,
  CcdvExamAttemptSchema,
} from './schemas/ccdv-exam-attempt.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CcdvExamAttempt.name, schema: CcdvExamAttemptSchema },
    ]),
  ],
  controllers: [CcdvExamAttemptsController],
  providers: [CcdvExamAttemptsService],
})
export class CcdvExamAttemptsModule {}
