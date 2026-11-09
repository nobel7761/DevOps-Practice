import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type {
  SaveCardsDto,
  SaveMcqDto,
  SaveSimDto,
} from './dto/save-study.dto';
import { CcdvStudy, CcdvStudyDocument } from './schemas/ccdv-study.schema';

const HISTORY_LIMIT = 20;

export interface StudyStateView {
  mcq: {
    current: CcdvStudy['mcqCurrent'];
    history: CcdvStudy['mcqHistory'];
  };
  cards: {
    results: CcdvStudy['cardResults'];
    known: number[];
  };
  sims: CcdvStudy['sims'];
}

@Injectable()
export class CcdvStudyService {
  constructor(
    @InjectModel(CcdvStudy.name)
    private readonly model: Model<CcdvStudyDocument>,
  ) {}

  async get(userId: string, chapterId: string): Promise<StudyStateView> {
    const doc = await this.model.findOne({ userId, chapterId }).lean().exec();
    return {
      mcq: {
        current: doc?.mcqCurrent ?? null,
        history: doc?.mcqHistory ?? [],
      },
      cards: { results: doc?.cardResults ?? [], known: doc?.cardKnown ?? [] },
      sims: doc?.sims ?? [],
    };
  }

  async saveMcq(userId: string, chapterId: string, dto: SaveMcqDto) {
    const now = new Date();
    const update: Record<string, unknown> = {
      $set: {
        mcqCurrent: {
          answers: dto.answers,
          finished: dto.finished,
          total: dto.total,
          updatedAt: now,
        },
      },
    };
    if (dto.finished) {
      update.$push = {
        mcqHistory: {
          $each: [
            {
              at: now,
              correct: dto.answers.filter((a) => a.correct).length,
              total: dto.total,
              answers: dto.answers,
            },
          ],
          $slice: -HISTORY_LIMIT,
        },
      };
    }
    await this.model
      .updateOne({ userId, chapterId }, update, { upsert: true })
      .exec();
    return this.get(userId, chapterId);
  }

  /** Starts a fresh attempt; finished attempts stay in the history. */
  async resetMcq(userId: string, chapterId: string) {
    await this.model
      .updateOne({ userId, chapterId }, { $set: { mcqCurrent: null } })
      .exec();
    return this.get(userId, chapterId);
  }

  async saveCards(userId: string, chapterId: string, dto: SaveCardsDto) {
    await this.model
      .updateOne(
        { userId, chapterId },
        { $set: { cardResults: dto.results, cardKnown: dto.known } },
        { upsert: true },
      )
      .exec();
    return this.get(userId, chapterId);
  }

  async resetCards(userId: string, chapterId: string) {
    await this.model
      .updateOne(
        { userId, chapterId },
        { $set: { cardResults: [], cardKnown: [] } },
      )
      .exec();
    return this.get(userId, chapterId);
  }

  async saveSim(
    userId: string,
    chapterId: string,
    key: string,
    dto: SaveSimDto,
  ) {
    const doc = await this.model.findOne({ userId, chapterId }).lean().exec();
    const others = (doc?.sims ?? []).filter((entry) => entry.key !== key);
    const sims = [
      ...others,
      {
        key,
        choices: dto.choices,
        submitted: dto.submitted,
        updatedAt: new Date(),
      },
    ];
    await this.model
      .updateOne({ userId, chapterId }, { $set: { sims } }, { upsert: true })
      .exec();
    return this.get(userId, chapterId);
  }

  async resetSim(userId: string, chapterId: string, key: string) {
    await this.model
      .updateOne({ userId, chapterId }, { $pull: { sims: { key } } })
      .exec();
    return this.get(userId, chapterId);
  }
}
