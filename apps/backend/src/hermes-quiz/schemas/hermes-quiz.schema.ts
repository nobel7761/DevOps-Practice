import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

export type HermesQuizProgressDocument = HermesQuizProgress & Document;

/** Per-lesson quiz progress: which questions this cycle has served, and whether the lesson quiz is passed. */
@Schema({ timestamps: true, collection: 'hermes_quiz_progress' })
export class HermesQuizProgress {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  contentId: string;

  @Prop({ type: [String], default: [] })
  seenIds: string[];

  @Prop({ default: false })
  passed: boolean;
}

export const HermesQuizProgressSchema =
  SchemaFactory.createForClass(HermesQuizProgress);
HermesQuizProgressSchema.index({ userId: 1, contentId: 1 }, { unique: true });

export type HermesQuizAttemptDocument = HermesQuizAttempt & Document;

/** One attempt: the served questions with their option order, then the answers and score once submitted. */
@Schema({ timestamps: true, collection: 'hermes_quiz_attempts' })
export class HermesQuizAttempt {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  contentId: string;

  @Prop({ type: [{ id: String, order: [Number] }], required: true, _id: false })
  questions: { id: string; order: number[] }[];

  @Prop({ type: SchemaTypes.Mixed })
  answers?: Record<string, number>;

  @Prop()
  score?: number;

  @Prop()
  total?: number;

  @Prop()
  passed?: boolean;

  @Prop()
  submittedAt?: Date;
}

export const HermesQuizAttemptSchema =
  SchemaFactory.createForClass(HermesQuizAttempt);
