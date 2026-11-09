import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class McqAnswer {
  @Prop({ required: true }) index: number;
  @Prop({ type: [Number], default: [] }) selected: number[];
  @Prop({ required: true }) correct: boolean;
}

@Schema({ _id: false })
export class McqAttempt {
  @Prop({ required: true }) at: Date;
  @Prop({ required: true }) correct: number;
  @Prop({ required: true }) total: number;
  @Prop({ type: [Object], default: [] }) answers: McqAnswer[];
}

@Schema({ _id: false })
export class CardResultEntry {
  @Prop({ required: true }) index: number;
  @Prop({ default: '' }) answer: string;
  @Prop({ required: true }) verdict: 'correct' | 'incorrect';
  @Prop({ default: '' }) feedback: string;
}

export interface SimEntry {
  key: string;
  choices: { item: number; bucket: string }[];
  submitted: boolean;
  updatedAt: Date;
}

export type CcdvStudyDocument = CcdvStudy & Document;

/** One document per user + chapter: practice-MCQ attempts and flashcard-quiz results. */
@Schema({ timestamps: true, collection: 'ccdv_study' })
export class CcdvStudy {
  @Prop({ required: true, index: true }) userId: string;
  @Prop({ required: true }) chapterId: string;

  /** The attempt being answered now (or the last finished one, until the learner resets). */
  @Prop({ type: Object, default: null })
  mcqCurrent: {
    answers: McqAnswer[];
    finished: boolean;
    total: number;
    updatedAt: Date;
  } | null;

  /** Finished attempts, newest last, capped. */
  @Prop({ type: [Object], default: [] }) mcqHistory: McqAttempt[];

  @Prop({ type: [Object], default: [] }) cardResults: CardResultEntry[];

  /** Answers of the lesson's sort-game simulators, one entry per simulator (key "s<block index>"). */
  @Prop({ type: [Object], default: [] }) sims: SimEntry[];
  @Prop({ type: [Number], default: [] }) cardKnown: number[];
}

export const CcdvStudySchema = SchemaFactory.createForClass(CcdvStudy);
CcdvStudySchema.index({ userId: 1, chapterId: 1 }, { unique: true });
