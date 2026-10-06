import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import {
  QuizAttempt,
  QuizAttemptDocument,
} from './schemas/quiz-attempt.schema';
import { QuizBank, QuizDifficulty, QuizQuestion } from './quiz.types';

const DATA_DIR = join(__dirname, 'data');

@Injectable()
export class QuizService {
  constructor(
    @InjectModel(QuizAttempt.name)
    private readonly quizAttemptModel: Model<QuizAttemptDocument>,
  ) {}

  private shuffle<T>(items: T[]): T[] {
    const arr = [...items];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  private loadBank(labId: string): QuizBank {
    const filePath = join(DATA_DIR, `${labId}.json`);
    if (!existsSync(filePath)) {
      throw new NotFoundException(
        `এই lab-এর জন্য কোনো quiz এখনো নেই: ${labId}`,
      );
    }
    return JSON.parse(readFileSync(filePath, 'utf-8'));
  }

  getQuizForLab(labId: string) {
    const bank = this.loadBank(labId);

    const byDifficulty: Record<QuizDifficulty, QuizQuestion[]> = {
      easy: [],
      medium: [],
      hard: [],
    };
    for (const q of bank.questions) {
      byDifficulty[q.difficulty]?.push(q);
    }

    const picked: QuizQuestion[] = [];
    const leftovers: QuizQuestion[] = [];
    (Object.keys(bank.sample) as QuizDifficulty[]).forEach((difficulty) => {
      const pool = this.shuffle(byDifficulty[difficulty] ?? []);
      picked.push(...pool.slice(0, bank.sample[difficulty]));
      leftovers.push(...pool.slice(bank.sample[difficulty]));
    });

    const target = Object.values(bank.sample).reduce((a, b) => a + b, 0);
    if (picked.length < target) {
      picked.push(...this.shuffle(leftovers).slice(0, target - picked.length));
    }

    return {
      labId,
      passPercent: bank.passPercent,
      questions: this.shuffle(picked).map((q) => ({
        id: q.id,
        difficulty: q.difficulty,
        question: q.question,
        options: q.options,
      })),
    };
  }

  async submitQuiz(labId: string, dto: SubmitQuizDto) {
    const bank = this.loadBank(labId);
    const questionById = new Map(bank.questions.map((q) => [q.id, q]));

    const uniqueIds = new Set(dto.answers.map((a) => a.questionId));
    if (uniqueIds.size !== dto.answers.length) {
      throw new BadRequestException('Duplicate question answers submitted');
    }

    let correctCount = 0;
    const wrongQuestionIds: string[] = [];

    const results = dto.answers.map((answer) => {
      const question = questionById.get(answer.questionId);
      if (!question) {
        throw new BadRequestException(`Unknown question: ${answer.questionId}`);
      }
      const correct = question.answerIndex === answer.answerIndex;
      if (correct) {
        correctCount += 1;
      } else {
        wrongQuestionIds.push(question.id);
      }
      return {
        questionId: question.id,
        yourAnswerIndex: answer.answerIndex,
        correctIndex: question.answerIndex,
        correct,
        explanation: question.explanation,
      };
    });

    const score = Math.round((correctCount / dto.answers.length) * 100);
    const passed = score >= bank.passPercent;

    const attemptNo =
      (await this.quizAttemptModel.countDocuments({ labId }).exec()) + 1;
    await this.quizAttemptModel.create({
      labId,
      attemptNo,
      score,
      passed,
      wrongQuestionIds,
      timeSpentSec: dto.timeSpentSec ?? 0,
    });

    return {
      labId,
      score,
      passPercent: bank.passPercent,
      passed,
      correctCount,
      totalCount: dto.answers.length,
      results,
    };
  }
}
