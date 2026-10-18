import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { OpenAiModule } from '../openai/openai.module';
import { AskController } from './ask.controller';
import { AskService } from './ask.service';
import {
  AskConversation,
  AskConversationSchema,
} from './schemas/ask-conversation.schema';

@Module({
  imports: [
    OpenAiModule,
    MongooseModule.forFeature([
      { name: AskConversation.name, schema: AskConversationSchema },
    ]),
  ],
  controllers: [AskController],
  providers: [AskService],
})
export class AskModule {}
