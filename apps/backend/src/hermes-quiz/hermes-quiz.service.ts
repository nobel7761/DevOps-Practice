import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PASS_PERCENT,
  createRng,
  gradeAttempt,
  selectQuestions,
  serveQuestion,
  shuffleForAttempt,
  type SdQuestion,
} from '../system-design-quiz/quiz-engine';
import {
  HermesQuizAttempt,
  HermesQuizAttemptDocument,
  HermesQuizProgress,
  HermesQuizProgressDocument,
} from './schemas/hermes-quiz.schema';

// Same dist-then-src lookup as the other quizzes: Nest copies data/*.json
// next to the compiled code, but a src/ copy is the fallback when running from ts.
const DIST_DATA_DIR = join(__dirname, 'data');
const SRC_DATA_DIR = join(__dirname, '..', '..', 'src', 'hermes-quiz', 'data');

function resolveDataFile(contentId: string): string {
  const distPath = join(DIST_DATA_DIR, `${contentId}.json`);
  return existsSync(distPath)
    ? distPath
    : join(SRC_DATA_DIR, `${contentId}.json`);
}

@Injectable()
export class HermesQuizService {
  constructor(
    @InjectModel(HermesQuizProgress.name)
    private readonly progressModel: Model<HermesQuizProgressDocument>,
    @InjectModel(HermesQuizAttempt.name)
    private readonly attemptModel: Model<HermesQuizAttemptDocument>,
  ) {}

  private loadBank(contentId: string): SdQuestion[] {
    if (!/^hermes-doc-[a-z0-9-]+$/.test(contentId))
      throw new NotFoundException(`অচেনা lesson: ${contentId}`);
    const filePath = resolveDataFile(contentId);
    if (!existsSync(filePath)) {
      throw new NotFoundException(
        `এই lesson-এর quiz এখনো তৈরি হয়নি: ${contentId}`,
      );
    }
    return JSON.parse(readFileSync(filePath, 'utf-8')).questions;
  }

  async getStatus(userId: string, contentId: string) {
    const progress = await this.progressModel
      .findOne({ userId, contentId })
      .exec();
    const attempts = await this.attemptModel
      .find({ userId, contentId, submittedAt: { $exists: true } })
      .sort({ createdAt: -1 })
      .exec();
    const validId = /^hermes-doc-[a-z0-9-]+$/.test(contentId);
    return {
      contentId,
      available: validId && existsSync(resolveDataFile(contentId)),
      passed: progress?.passed ?? false,
      seenCount: progress?.seenIds.length ?? 0,
      attempts: attempts.map((a) => ({
        score: a.score,
        total: a.total,
        passed: a.passed,
        submittedAt: a.submittedAt,
      })),
    };
  }

  async startAttempt(userId: string, contentId: string) {
    const bank = this.loadBank(contentId);
    const progress = await this.progressModel
      .findOne({ userId, contentId })
      .exec();
    const rng = createRng(Math.floor(Math.random() * 2 ** 32));
    const selection = selectQuestions(bank, progress?.seenIds ?? [], rng);
    const questions = shuffleForAttempt(selection.questionIds, rng);

    const attempt = await this.attemptModel.create({
      userId,
      contentId,
      questions,
    });
    await this.progressModel
      .findOneAndUpdate(
        { userId, contentId },
        { userId, contentId, seenIds: selection.seenIds },
        { upsert: true },
      )
      .exec();

    const byId = new Map(bank.map((q) => [q.id, q]));
    return {
      attemptId: String(attempt._id),
      contentId,
      passPercent: PASS_PERCENT,
      newCycle: selection.newCycle,
      questions: questions.map(({ id, order }) =>
        serveQuestion(byId.get(id)!, order),
      ),
    };
  }

  async submitAttempt(
    userId: string,
    attemptId: string,
    answers: Record<string, number>,
  ) {
    const attempt = await this.attemptModel.findById(attemptId).exec();
    // Someone else's attempt is reported exactly like a missing one.
    if (!attempt || attempt.userId !== userId)
      throw new NotFoundException('এই attempt পাওয়া যায়নি।');
    if (attempt.submittedAt)
      throw new BadRequestException('এই attempt আগেই জমা দেওয়া হয়েছে।');

    const result = gradeAttempt(
      this.loadBank(attempt.contentId),
      attempt.questions,
      answers,
    );
    await this.attemptModel
      .findByIdAndUpdate(attemptId, {
        answers,
        score: result.score,
        total: result.total,
        passed: result.passed,
        submittedAt: new Date(),
      })
      .exec();
    if (result.passed) {
      await this.progressModel
        .findOneAndUpdate(
          { userId, contentId: attempt.contentId },
          { userId, passed: true },
          { upsert: true },
        )
        .exec();
    }
    return { attemptId, contentId: attempt.contentId, ...result };
  }
}
