import { Module } from '@nestjs/common';
import { InterviewController } from './interview.controller';
import { InterviewService } from './interview.service';
import { openAiClientProvider } from './openai-client.provider';

@Module({
  controllers: [InterviewController],
  providers: [InterviewService, openAiClientProvider],
})
export class InterviewModule {}
