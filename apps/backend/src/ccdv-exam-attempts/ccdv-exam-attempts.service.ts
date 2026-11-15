import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { SaveAttemptDto } from './dto/save-attempt.dto';
import {
  CcdvExamAttempt,
  CcdvExamAttemptDocument,
} from './schemas/ccdv-exam-attempt.schema';

const MAX_ATTEMPTS_PER_USER = 200;

export interface AttemptView {
  id: string;
  examNumber: number;
  startedAt: number;
  submittedAt: number;
  durationSec: number;
  timedOut: boolean;
  answers: Record<string, number[]>;
  flagged: string[];
  timeSpent: Record<string, number>;
  result: Record<string, unknown>;
}

/** Answers/time maps come straight from the browser: keep them small and the right shape. */
function assertSmallMaps(dto: SaveAttemptDto): void {
  const answerKeys = Object.keys(dto.answers);
  const timeKeys = Object.keys(dto.timeSpent);
  const answersOk = answerKeys.every(
    (key) =>
      key.length <= 20 &&
      Array.isArray(dto.answers[key]) &&
      dto.answers[key].length <= 6 &&
      dto.answers[key].every((n) => Number.isInteger(n) && n >= 0 && n <= 9),
  );
  const timesOk = timeKeys.every(
    (key) =>
      key.length <= 20 &&
      Number.isFinite(dto.timeSpent[key]) &&
      dto.timeSpent[key] >= 0,
  );
  if (
    answerKeys.length > 60 ||
    timeKeys.length > 60 ||
    !answersOk ||
    !timesOk
  ) {
    throw new BadRequestException('Invalid attempt payload');
  }
}

@Injectable()
export class CcdvExamAttemptsService {
  constructor(
    @InjectModel(CcdvExamAttempt.name)
    private readonly model: Model<CcdvExamAttemptDocument>,
  ) {}

  /** Idempotent: an attempt id that already exists is left untouched. */
  async save(userId: string, dto: SaveAttemptDto): Promise<void> {
    assertSmallMaps(dto);
    const { id, ...rest } = dto;
    const count = await this.model.countDocuments({ userId }).exec();
    if (count >= MAX_ATTEMPTS_PER_USER) {
      throw new BadRequestException('Too many saved attempts');
    }
    await this.model
      .updateOne(
        { userId, attemptId: id },
        { $setOnInsert: { userId, attemptId: id, ...rest } },
        { upsert: true },
      )
      .exec();
  }

  async list(userId: string): Promise<AttemptView[]> {
    const docs = await this.model
      .find({ userId })
      .sort({ submittedAt: 1 })
      .lean()
      .exec();
    return docs.map((doc) => ({
      id: doc.attemptId,
      examNumber: doc.examNumber,
      startedAt: doc.startedAt,
      submittedAt: doc.submittedAt,
      durationSec: doc.durationSec,
      timedOut: doc.timedOut,
      answers: doc.answers,
      flagged: doc.flagged,
      timeSpent: doc.timeSpent,
      result: doc.result,
    }));
  }
}
