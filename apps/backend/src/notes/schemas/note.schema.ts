import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type NoteDocument = Note & Document;

@Schema({ timestamps: true, collection: 'notes' })
export class Note {
  @Prop({ required: true, index: true, unique: true })
  contentId: string;

  @Prop({ required: true })
  content: string;
}

export const NoteSchema = SchemaFactory.createForClass(Note);
