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

  async getNote(userId: string, contentId: string): Promise<NoteDto | null> {
    const doc = await this.noteModel.findOne({ userId, contentId }).exec();
    return doc ? { contentId: doc.contentId, content: doc.content } : null;
  }

  async saveNote(
    userId: string,
    contentId: string,
    content: string,
  ): Promise<NoteDto> {
    const doc = await this.noteModel
      .findOneAndUpdate(
        { userId, contentId },
        { userId, contentId, content },
        { upsert: true, new: true },
      )
      .exec();
    return { contentId: doc!.contentId, content: doc!.content };
  }

  /** Of the given content ids, which ones have a saved note with real (non-whitespace) content. */
  async getContentIdsWithNotes(
    userId: string,
    contentIds: string[],
  ): Promise<string[]> {
    const docs = await this.noteModel
      .find({ userId, contentId: { $in: contentIds } }, 'contentId content')
      .exec();
    return docs
      .filter((doc) => doc.content.trim().length > 0)
      .map((doc) => doc.contentId);
  }
}
