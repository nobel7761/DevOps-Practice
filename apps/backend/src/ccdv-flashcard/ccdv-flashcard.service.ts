import {
  BadGatewayException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import type OpenAI from 'openai';
import { OPENAI_CLIENT } from '../openai/openai-client.provider';
import type { FlashcardValidation } from './ccdv-flashcard.types';
import { buildGraderUserMessage, GRADER_SYSTEM_PROMPT } from './grader-prompt';
import type { ValidateAnswerDto } from './dto/validate-answer.dto';

@Injectable()
export class CcdvFlashcardService {
  private readonly logger = new Logger(CcdvFlashcardService.name);

  constructor(@Inject(OPENAI_CLIENT) private readonly openai: OpenAI) {}

  async validate(dto: ValidateAnswerDto): Promise<FlashcardValidation> {
    let raw: string | null | undefined;
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: GRADER_SYSTEM_PROMPT },
          { role: 'user', content: buildGraderUserMessage(dto) },
        ],
      });
      raw = completion.choices[0]?.message?.content;
    } catch (error) {
      this.logger.warn(`flashcard grading call failed: ${String(error)}`);
      throw new BadGatewayException('Grader unavailable');
    }
    return parseValidation(raw);
  }
}

export function parseValidation(
  raw: string | null | undefined,
): FlashcardValidation {
  try {
    const parsed = JSON.parse(raw ?? '') as Partial<FlashcardValidation>;
    if (
      (parsed.verdict === 'correct' || parsed.verdict === 'incorrect') &&
      typeof parsed.feedback === 'string'
    ) {
      return { verdict: parsed.verdict, feedback: parsed.feedback.trim() };
    }
  } catch {
    /* fall through */
  }
  throw new BadGatewayException('Grader returned an unreadable answer');
}
