import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import {
  BadGatewayException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type OpenAI from 'openai';
import { GradeAnswerDto } from './dto/grade-answer.dto';
import { GradeResult, InterviewSpec } from './interview.types';
import { OPENAI_CLIENT } from './openai-client.provider';

// Mirrors QuizService's dist/src fallback — see that file for why.
const DIST_DATA_DIR = join(__dirname, 'data');
const SRC_DATA_DIR = join(__dirname, '..', '..', 'src', 'interview', 'data');

function resolveDataDir(): string {
  return existsSync(DIST_DATA_DIR) && readdirSync(DIST_DATA_DIR).length > 0
    ? DIST_DATA_DIR
    : SRC_DATA_DIR;
}

@Injectable()
export class InterviewService {
  constructor(@Inject(OPENAI_CLIENT) private readonly openai: OpenAI) {}

  private loadSpec(moduleId: string): InterviewSpec {
    const filePath = join(resolveDataDir(), `${moduleId}.json`);
    if (!existsSync(filePath)) {
      throw new NotFoundException(
        `এই module-এর জন্য কোনো AI interview এখনো নেই: ${moduleId}`,
      );
    }
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  }

  getInterview(moduleId: string): InterviewSpec {
    return this.loadSpec(moduleId);
  }

  async gradeAnswer(
    moduleId: string,
    dto: GradeAnswerDto,
  ): Promise<GradeResult> {
    const spec = this.loadSpec(moduleId);
    const question = spec.questions.find((q) => q.id === dto.questionId);
    if (!question) {
      throw new NotFoundException(
        `প্রশ্ন খুঁজে পাওয়া যায়নি: ${dto.questionId}`,
      );
    }

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content:
            'You are a strict but fair Linux/DevOps technical interviewer. ' +
            "Grade the candidate's shell command against the given scenario. " +
            'Respond with ONLY a JSON object with exactly these keys: ' +
            'score (0-100 integer, overall), verdict (one short sentence), ' +
            'strengths (array of short strings), improvements (array of short strings, ' +
            'use ["None needed, the command is functionally correct"] if there are none), ' +
            'technicalAccuracy (0-100 integer), completeness (0-100 integer).',
        },
        {
          role: 'user',
          content: `Scenario: ${question.scenario}\n\nCandidate's answer:\n${dto.command}`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? '';
    let parsed: Partial<GradeResult>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new BadGatewayException(
        'AI grading থেকে বৈধ উত্তর পাওয়া যায়নি, আবার চেষ্টা করো।',
      );
    }

    return {
      score: Number(parsed.score) || 0,
      verdict: parsed.verdict ?? '',
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      improvements: Array.isArray(parsed.improvements)
        ? parsed.improvements
        : [],
      technicalAccuracy: Number(parsed.technicalAccuracy) || 0,
      completeness: Number(parsed.completeness) || 0,
    };
  }
}
