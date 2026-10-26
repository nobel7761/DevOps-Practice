import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes } from 'mongoose';

export type SdQuizProgressDocument = SdQuizProgress & Document;

/** Per-topic quiz progress: which of the 60 questions this cycle has served, and whether the topic is passed. */
@Schema({ timestamps: true, collection: 'sd_quiz_progress' })
export class SdQuizProgress {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  topicId: string;

  @Prop({ type: [String], default: [] })
  seenIds: string[];

  @Prop({ default: false })
  passed: boolean;
}

export const SdQuizProgressSchema =
  SchemaFactory.createForClass(SdQuizProgress);
SdQuizProgressSchema.index({ userId: 1, topicId: 1 }, { unique: true });

export type SdQuizAttemptDocument = SdQuizAttempt & Document;

/** One attempt: the 20 served questions with their option order, then the answers and score once submitted. */
@Schema({ timestamps: true, collection: 'sd_quiz_attempts' })
export class SdQuizAttempt {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  topicId: string;

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

export const SdQuizAttemptSchema = SchemaFactory.createForClass(SdQuizAttempt);
