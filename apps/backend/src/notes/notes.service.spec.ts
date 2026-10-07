/// <reference types="jest" />
import { NotesService } from './notes.service';

function mockNoteModel({
  findOneResult = null,
  findOneAndUpdateResult = null,
}: {
  findOneResult?: unknown;
  findOneAndUpdateResult?: unknown;
}) {
  return {
    findOne: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(findOneResult),
    }),
    findOneAndUpdate: jest.fn().mockReturnValue({
      exec: jest.fn().mockResolvedValue(findOneAndUpdateResult),
    }),
  };
}

describe('NotesService', () => {
  describe('getNote', () => {
    it('returns null when no note exists for the content id', async () => {
      const model = mockNoteModel({ findOneResult: null });
      const service = new NotesService(model as any);

      const result = await service.getNote('lecture-1');

      expect(model.findOne).toHaveBeenCalledWith({ contentId: 'lecture-1' });
      expect(result).toBeNull();
    });

    it('returns the saved note when one exists for the content id', async () => {
      const model = mockNoteModel({
        findOneResult: { contentId: 'lecture-1', content: 'আমার নোট' },
      });
      const service = new NotesService(model as any);

      const result = await service.getNote('lecture-1');

      expect(result).toEqual({ contentId: 'lecture-1', content: 'আমার নোট' });
    });
  });

  describe('saveNote', () => {
    it('upserts the note keyed by content id', async () => {
      const model = mockNoteModel({
        findOneAndUpdateResult: { contentId: 'lecture-1', content: 'নতুন নোট' },
      });
      const service = new NotesService(model as any);

      await service.saveNote('lecture-1', 'নতুন নোট');

      expect(model.findOneAndUpdate).toHaveBeenCalledWith(
        { contentId: 'lecture-1' },
        { contentId: 'lecture-1', content: 'নতুন নোট' },
        { upsert: true, new: true },
      );
    });

    it('returns the saved note', async () => {
      const model = mockNoteModel({
        findOneAndUpdateResult: { contentId: 'lecture-1', content: 'নতুন নোট' },
      });
      const service = new NotesService(model as any);

      const result = await service.saveNote('lecture-1', 'নতুন নোট');

      expect(result).toEqual({ contentId: 'lecture-1', content: 'নতুন নোট' });
    });
  });
});
