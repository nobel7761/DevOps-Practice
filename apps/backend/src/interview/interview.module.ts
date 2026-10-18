import { Module } from '@nestjs/common';
import { OpenAiModule } from '../openai/openai.module';
import { InterviewController } from './interview.controller';
import { InterviewService } from './interview.service';

@Module({
  imports: [OpenAiModule],
  controllers: [InterviewController],
  providers: [InterviewService],
})
export class InterviewModule {}
