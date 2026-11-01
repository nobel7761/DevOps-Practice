import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ContentProgressDocument = HydratedDocument<ContentProgress>;

/**
 * 'challenge' = a completed simulator mission, keyed `<simulatorId>:<challengeId>`.
 * 'linkedin' = a System Design topic's post marked "Post করেছি", keyed by topic id.
 */
export type ContentProgressType =
  'quiz' | 'video' | 'lab' | 'challenge' | 'linkedin' | 'interview';

/**
 * One row per (userId, key, type): `key` is a lab's labId for a quiz or a manual
 * "mark complete" on that lab, or a video's contentId for either its own
 * quiz (reusing contentId as the quiz's labId, same as the frontend already
 * does) or a manual "mark as watched" record. A single key can have MULTIPLE
 * rows (e.g. a lab's quiz row AND its manual-complete row) — that's why the
 * unique index is on (userId, key, type) together, not key alone.
 */
@Schema({ timestamps: true, collection: 'content_progress' })
export class ContentProgress {
  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  key: string;

  @Prop({
    required: true,
    enum: ['quiz', 'video', 'lab', 'challenge', 'linkedin', 'interview'],
  })
  type: ContentProgressType;

  @Prop({ required: true, default: false })
  completed: boolean;

  @Prop()
  score?: number;
}

export const ContentProgressSchema =
  SchemaFactory.createForClass(ContentProgress);
ContentProgressSchema.index({ userId: 1, key: 1, type: 1 }, { unique: true });
