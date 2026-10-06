import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type QuizAttemptDocument = QuizAttempt & Document;

@Schema({ timestamps: true, collection: 'quiz_attempts' })
export class QuizAttempt {
  @Prop({ required: true, index: true })
  labId: string;

  @Prop({ required: true })
  attemptNo: number;

  @Prop({ required: true })
  score: number;

  @Prop({ required: true })
  passed: boolean;

  @Prop({ type: [String], default: [] })
  wrongQuestionIds: string[];

  @Prop({ default: 0 })
  timeSpentSec: number;
}

export const QuizAttemptSchema = SchemaFactory.createForClass(QuizAttempt);
