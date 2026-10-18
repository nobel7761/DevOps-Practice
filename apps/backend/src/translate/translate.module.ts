import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OpenAiModule } from '../openai/openai.module';
import {
  TranslationCache,
  TranslationCacheSchema,
} from './schemas/translation-cache.schema';
import { TranslateController } from './translate.controller';
import { TranslateService } from './translate.service';

@Module({
  imports: [
    OpenAiModule,
    MongooseModule.forFeature([
      { name: TranslationCache.name, schema: TranslationCacheSchema },
    ]),
  ],
  controllers: [TranslateController],
  providers: [TranslateService],
})
export class TranslateModule {}
