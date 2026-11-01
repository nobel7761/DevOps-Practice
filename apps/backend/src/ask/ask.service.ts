import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type OpenAI from 'openai';
import { withRetry } from '../common/with-retry';
import { OPENAI_CLIENT } from '../openai/openai-client.provider';
import { buildSystemPrompt } from './build-system-prompt';
import { AskQuestionDto } from './dto/ask-question.dto';
import {
  AskConversation,
  AskConversationDocument,
  AskMessage,
} from './schemas/ask-conversation.schema';

@Injectable()
export class AskService {
  constructor(
    @Inject(OPENAI_CLIENT) private readonly openai: OpenAI,
    @InjectModel(AskConversation.name)
    private readonly conversationModel: Model<AskConversationDocument>,
  ) {}

  /** Previously-saved messages for this video, so a tab switch or page reload never loses the conversation. */
  async getHistory(userId: string, contentId: string): Promise<AskMessage[]> {
    const conversation = await this.conversationModel
      .findOne({ userId, contentId })
      .exec();
    return conversation?.messages ?? [];
  }

  async ask(
    userId: string,
    contentId: string,
    dto: AskQuestionDto,
  ): Promise<{ answer: string }> {
    const history = await this.getHistory(userId, contentId);

    const systemPrompt = buildSystemPrompt(dto.context);

    const completion = await withRetry(() =>
      this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user', content: dto.question },
        ],
      }),
    );

    const answer = completion.choices[0]?.message?.content ?? '';

    await this.conversationModel
      .findOneAndUpdate(
        { userId, contentId },
        {
          userId,
          contentId,
          messages: [
            ...history,
            { role: 'user', content: dto.question },
            { role: 'assistant', content: answer },
          ],
        },
        { upsert: true },
      )
      .exec();

    return { answer };
  }

  /** Same as ask(), but yields each text delta as it streams in from OpenAI (for a ChatGPT-style typing effect), then persists the full concatenated answer once the stream ends. */
  async *streamAsk(
    userId: string,
    contentId: string,
    dto: AskQuestionDto,
  ): AsyncGenerator<string> {
    const history = await this.getHistory(userId, contentId);

    const systemPrompt = buildSystemPrompt(dto.context);

    const stream = await withRetry(() =>
      this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        stream: true,
        messages: [
          { role: 'system', content: systemPrompt },
          ...history.map((m) => ({ role: m.role, content: m.content })),
          { role: 'user', content: dto.question },
        ],
      }),
    );

    let answer = '';
    for await (const part of stream) {
      const delta = part.choices[0]?.delta?.content ?? '';
      if (delta) {
        answer += delta;
        yield delta;
      }
    }

    await this.conversationModel
      .findOneAndUpdate(
        { userId, contentId },
        {
          userId,
          contentId,
          messages: [
            ...history,
            { role: 'user', content: dto.question },
            { role: 'assistant', content: answer },
          ],
        },
        { upsert: true },
      )
      .exec();
  }
}
