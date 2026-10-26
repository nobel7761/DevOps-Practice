import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  ContentProgress,
  ContentProgressDocument,
  ContentProgressType,
} from './schemas/content-progress.schema';

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(ContentProgress.name)
    private readonly contentProgressModel: Model<ContentProgressDocument>,
  ) {}

  /** Every key (labId or video contentId) with at least one completed record, for the homepage overlay. */
  async getCompletedKeys(userId: string): Promise<string[]> {
    const keys = await this.contentProgressModel
      .distinct('key', { userId, completed: true })
      .exec();
    return keys;
  }

  async getCompletedKeysOfType(
    userId: string,
    type: ContentProgressType,
  ): Promise<string[]> {
    return this.contentProgressModel
      .distinct('key', { userId, completed: true, type })
      .exec();
  }

  async markComplete(
    userId: string,
    key: string,
    type: ContentProgressType,
  ): Promise<void> {
    await this.setCompleted(userId, key, type, true);
  }

  /** Like markComplete, but can also un-mark (e.g. unticking "Post করেছি"). */
  async setCompleted(
    userId: string,
    key: string,
    type: ContentProgressType,
    completed: boolean,
  ): Promise<void> {
    await this.contentProgressModel
      .findOneAndUpdate(
        { userId, key, type },
        { userId, key, type, completed },
        { upsert: true },
      )
      .exec();
  }
}
