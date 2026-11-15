import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CcdvExamAttemptDocument = CcdvExamAttempt & Document;

/** One submitted mock exam: what was answered, flagged, how long each question took, and the score. */
@Schema({ timestamps: true, collection: 'ccdv_exam_attempts' })
export class CcdvExamAttempt {
  @Prop({ required: true, index: true }) userId: string;
  /** Client-generated id, so saving the same attempt twice is harmless. */
  @Prop({ required: true }) attemptId: string;
  @Prop({ required: true }) examNumber: number;
  @Prop({ required: true }) startedAt: number;
  @Prop({ required: true, index: true }) submittedAt: number;
  @Prop({ required: true }) durationSec: number;
  @Prop({ required: true }) timedOut: boolean;
  @Prop({ type: Object, default: {} }) answers: Record<string, number[]>;
  @Prop({ type: [String], default: [] }) flagged: string[];
  @Prop({ type: Object, default: {} }) timeSpent: Record<string, number>;
  @Prop({ type: Object, required: true }) result: Record<string, unknown>;
}

export const CcdvExamAttemptSchema =
  SchemaFactory.createForClass(CcdvExamAttempt);
CcdvExamAttemptSchema.index({ userId: 1, attemptId: 1 }, { unique: true });
