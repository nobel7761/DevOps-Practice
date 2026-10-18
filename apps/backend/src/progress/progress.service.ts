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
  async getCompletedKeys(): Promise<string[]> {
    const keys = await this.contentProgressModel
      .distinct('key', { completed: true })
      .exec();
    return keys;
  }

  async markComplete(key: string, type: ContentProgressType): Promise<void> {
    await this.contentProgressModel
      .findOneAndUpdate(
        { key, type },
        { key, type, completed: true },
        { upsert: true },
      )
      .exec();
  }
}
