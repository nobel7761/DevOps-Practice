import { Module } from '@nestjs/common';
import { openAiClientProvider } from './openai-client.provider';

@Module({
  providers: [openAiClientProvider],
  exports: [openAiClientProvider],
})
export class OpenAiModule {}
