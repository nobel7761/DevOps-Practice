import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { SyncedContentItem } from '../poridhi-sync.types';

export interface SyncedModule {
  id: string;
  title: string;
  contents: SyncedContentItem[];
}

export interface SyncedMilestone {
  id: string;
  title: string;
  modules: SyncedModule[];
}

export type SyncedCourseDocument = SyncedCourse & Document;

// One snapshot per courseId (registry id, e.g. "devops-season-4"), replaced
// wholesale on every "Fetch Latest Contents" run.
@Schema({ timestamps: true, collection: 'synced_courses' })
export class SyncedCourse {
  @Prop({ required: true, unique: true, index: true })
  courseId: string;

  @Prop({ type: Array, default: [] })
  milestones: SyncedMilestone[];

  @Prop({ required: true })
  fetchedAt: Date;
}

export const SyncedCourseSchema = SchemaFactory.createForClass(SyncedCourse);
