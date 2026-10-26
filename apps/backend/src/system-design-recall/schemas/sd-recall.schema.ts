import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RecallRating = 'good' | 'partial' | 'forgot';

export type SdRecallPointDocument = SdRecallPoint & Document;

/** Spaced-repetition state of one Recall Map core point. The schedule itself is computed on the frontend. */
@Schema({ timestamps: true, collection: 'sd_recall_points' })
export class SdRecallPoint {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  topicId: string;

  @Prop({ required: true })
  term: string;

  @Prop({ required: true, default: 0 })
  intervalIndex: number;

  @Prop({ type: String, default: null })
  lastRating: RecallRating | null;

  /** YYYY-MM-DD in the learner's local calendar. */
  @Prop({ required: true })
  nextDue: string;
}

export const SdRecallPointSchema = SchemaFactory.createForClass(SdRecallPoint);
SdRecallPointSchema.index({ userId: 1, topicId: 1, term: 1 }, { unique: true });

export type SdRecallReviewDocument = SdRecallReview & Document;

/** Log of every self-rating, kept for the recall streak. */
@Schema({ timestamps: true, collection: 'sd_recall_reviews' })
export class SdRecallReview {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  date: string;

  @Prop({ required: true })
  topicId: string;

  @Prop({ required: true })
  term: string;

  @Prop({ required: true })
  rating: RecallRating;
}

export const SdRecallReviewSchema =
  SchemaFactory.createForClass(SdRecallReview);
