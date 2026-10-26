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
} from './quiz-engine';
import {
  SdQuizAttempt,
  SdQuizAttemptDocument,
  SdQuizProgress,
  SdQuizProgressDocument,
} from './schemas/sd-quiz.schema';

// Same dist-then-src lookup as the lab quiz (see quiz.service.ts for why).
const DIST_DATA_DIR = join(__dirname, 'data');
const SRC_DATA_DIR = join(
  __dirname,
  '..',
  '..',
  'src',
  'system-design-quiz',
  'data',
);

function resolveDataFile(topicId: string): string {
  const distPath = join(DIST_DATA_DIR, `${topicId}.json`);
  return existsSync(distPath)
    ? distPath
    : join(SRC_DATA_DIR, `${topicId}.json`);
}

@Injectable()
export class SystemDesignQuizService {
  constructor(
    @InjectModel(SdQuizProgress.name)
    private readonly progressModel: Model<SdQuizProgressDocument>,
    @InjectModel(SdQuizAttempt.name)
    private readonly attemptModel: Model<SdQuizAttemptDocument>,
  ) {}

  private loadBank(topicId: string): SdQuestion[] {
    if (!/^sd-day-\d{3}$/.test(topicId))
      throw new NotFoundException(`অচেনা topic: ${topicId}`);
    const filePath = resolveDataFile(topicId);
    if (!existsSync(filePath)) {
      throw new NotFoundException(
        `এই topic-এর quiz এখনো তৈরি হয়নি: ${topicId}`,
      );
    }
    return JSON.parse(readFileSync(filePath, 'utf-8')).questions;
  }

  async getStatus(userId: string, topicId: string) {
    const progress = await this.progressModel
      .findOne({ userId, topicId })
      .exec();
    const attempts = await this.attemptModel
      .find({ userId, topicId, submittedAt: { $exists: true } })
      .sort({ createdAt: -1 })
      .exec();
    return {
      topicId,
      available: existsSync(resolveDataFile(topicId)),
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

  async startAttempt(userId: string, topicId: string) {
    const bank = this.loadBank(topicId);
    const progress = await this.progressModel
      .findOne({ userId, topicId })
      .exec();
    const rng = createRng(Math.floor(Math.random() * 2 ** 32));
    const selection = selectQuestions(bank, progress?.seenIds ?? [], rng);
    const questions = shuffleForAttempt(selection.questionIds, rng);

    const attempt = await this.attemptModel.create({
      userId,
      topicId,
      questions,
    });
    await this.progressModel
      .findOneAndUpdate(
        { userId, topicId },
        { userId, topicId, seenIds: selection.seenIds },
        { upsert: true },
      )
      .exec();

    const byId = new Map(bank.map((q) => [q.id, q]));
    return {
      attemptId: String(attempt._id),
      topicId,
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
      this.loadBank(attempt.topicId),
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
          { userId, topicId: attempt.topicId },
          { userId, passed: true },
          { upsert: true },
        )
        .exec();
    }
    return { attemptId, topicId: attempt.topicId, ...result };
  }
}
