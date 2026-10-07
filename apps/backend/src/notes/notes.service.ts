import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Note, NoteDocument } from './schemas/note.schema';

export interface NoteDto {
  contentId: string;
  content: string;
}

@Injectable()
export class NotesService {
  constructor(
    @InjectModel(Note.name) private readonly noteModel: Model<NoteDocument>,
  ) {}

  async getNote(contentId: string): Promise<NoteDto | null> {
    const doc = await this.noteModel.findOne({ contentId }).exec();
    return doc ? { contentId: doc.contentId, content: doc.content } : null;
  }

  async saveNote(contentId: string, content: string): Promise<NoteDto> {
    const doc = await this.noteModel
      .findOneAndUpdate(
        { contentId },
        { contentId, content },
        { upsert: true, new: true },
      )
      .exec();
    return { contentId: doc!.contentId, content: doc!.content };
  }
}
