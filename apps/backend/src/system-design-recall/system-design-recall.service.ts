import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  SdRecallPoint,
  SdRecallPointDocument,
  SdRecallReview,
  SdRecallReviewDocument,
  type RecallRating,
} from './schemas/sd-recall.schema';

export interface RecallPointInput {
  topicId: string;
  term: string;
  intervalIndex: number;
  lastRating: RecallRating | null;
  nextDue: string;
}

@Injectable()
export class SystemDesignRecallService {
  constructor(
    @InjectModel(SdRecallPoint.name)
    private readonly pointModel: Model<SdRecallPointDocument>,
    @InjectModel(SdRecallReview.name)
    private readonly reviewModel: Model<SdRecallReviewDocument>,
  ) {}

  async getAll(userId: string) {
    const points = await this.pointModel
      .find(
        { userId },
        {
          _id: 0,
          topicId: 1,
          term: 1,
          intervalIndex: 1,
          lastRating: 1,
          nextDue: 1,
        },
      )
      .exec();
    const reviewDates = await this.reviewModel
      .distinct('date', { userId })
      .exec();
    return { points, reviewDates };
  }

  /** Called when a lesson is finished. Existing points keep their schedule; only new ones are added. */
  async startPoints(userId: string, points: RecallPointInput[]) {
    if (points.length === 0) return;
    await this.pointModel.bulkWrite(
      points.map((point) => ({
        updateOne: {
          filter: { userId, topicId: point.topicId, term: point.term },
          update: { $setOnInsert: { ...point, userId } },
          upsert: true,
        },
      })),
    );
  }

  async recordReview(userId: string, point: RecallPointInput, date: string) {
    await this.pointModel
      .findOneAndUpdate(
        { userId, topicId: point.topicId, term: point.term },
        { ...point, userId },
        { upsert: true },
      )
      .exec();
    if (point.lastRating) {
      await this.reviewModel.create({
        userId,
        date,
        topicId: point.topicId,
        term: point.term,
        rating: point.lastRating,
      });
    }
  }
}
