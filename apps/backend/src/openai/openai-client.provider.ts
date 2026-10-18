import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

export const OPENAI_CLIENT = 'OPENAI_CLIENT';

export const openAiClientProvider = {
  provide: OPENAI_CLIENT,
  useFactory: (configService: ConfigService) =>
    new OpenAI({ apiKey: configService.get<string>('OPENAI_API_KEY') }),
  inject: [ConfigService],
};
