/// <reference types="jest" />
import { TranslateService } from './translate.service';

function mockOpenAiReturning(content: string) {
  return {
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content } }],
        }),
      },
    },
  };
}

function mockCacheModel(existing: Record<string, string> = {}) {
  const store = { ...existing };
  return {
    findOne: jest.fn((query: { key: string }) => ({
      exec: jest
        .fn()
        .mockResolvedValue(
          store[query.key] !== undefined ? { payload: store[query.key] } : null,
        ),
    })),
    findOneAndUpdate: jest
      .fn()
      .mockImplementation(
        (query: { key: string }, update: { payload: string }) => {
          store[query.key] = update.payload;
          return { exec: jest.fn().mockResolvedValue(undefined) };
        },
      ),
    __store: store,
  };
}

describe('TranslateService', () => {
  describe('translateLabMarkdown', () => {
    it('translates via the model and caches the result on a cache miss', async () => {
      const openai = mockOpenAiReturning('# শিরোনাম\n\nএটা বাংলা।');
      const cacheModel = mockCacheModel();
      const service = new TranslateService(openai as any, cacheModel as any);

      const result = await service.translateLabMarkdown(
        'lab-1',
        '# Title\n\nThis is English.',
      );

      expect(result).toBe('# শিরোনাম\n\nএটা বাংলা।');
      expect(openai.chat.completions.create).toHaveBeenCalledTimes(1);
      expect(cacheModel.findOneAndUpdate).toHaveBeenCalledTimes(1);
      expect(cacheModel.__store['lab:lab-1']).toBe('# শিরোনাম\n\nএটা বাংলা।');
    });

    it('returns the cached translation without calling the model again', async () => {
      const openai = mockOpenAiReturning('should not be used');
      const cacheModel = mockCacheModel({ 'lab:lab-1': '# ক্যাশড অনুবাদ' });
      const service = new TranslateService(openai as any, cacheModel as any);

      const result = await service.translateLabMarkdown('lab-1', '# Title');

      expect(result).toBe('# ক্যাশড অনুবাদ');
      expect(openai.chat.completions.create).not.toHaveBeenCalled();
    });
  });

  describe('translateInterviewQuestions', () => {
    const questions = [
      {
        id: 'q1',
        title: 'Fix Directory Access',
        scenario: 'Developers need access.',
      },
    ];

    it('translates questions via the model and caches the JSON result', async () => {
      const openai = mockOpenAiReturning(
        JSON.stringify({
          questions: [
            {
              id: 'q1',
              title: 'ডিরেক্টরি অ্যাক্সেস ঠিক করো',
              scenario: 'ডেভেলপারদের দরকার।',
            },
          ],
        }),
      );
      const cacheModel = mockCacheModel();
      const service = new TranslateService(openai as any, cacheModel as any);

      const result = await service.translateInterviewQuestions(
        'module-1',
        questions,
      );

      expect(result).toEqual([
        {
          id: 'q1',
          title: 'ডিরেক্টরি অ্যাক্সেস ঠিক করো',
          scenario: 'ডেভেলপারদের দরকার।',
        },
      ]);
      expect(openai.chat.completions.create).toHaveBeenCalledTimes(1);
      expect(cacheModel.__store['interview:module-1']).toBeDefined();
    });

    it('returns the cached questions without calling the model again', async () => {
      const cachedPayload = JSON.stringify([
        { id: 'q1', title: 'ক্যাশড শিরোনাম', scenario: 'ক্যাশড দৃশ্য।' },
      ]);
      const openai = mockOpenAiReturning('should not be used');
      const cacheModel = mockCacheModel({
        'interview:module-1': cachedPayload,
      });
      const service = new TranslateService(openai as any, cacheModel as any);

      const result = await service.translateInterviewQuestions(
        'module-1',
        questions,
      );

      expect(result).toEqual([
        { id: 'q1', title: 'ক্যাশড শিরোনাম', scenario: 'ক্যাশড দৃশ্য।' },
      ]);
      expect(openai.chat.completions.create).not.toHaveBeenCalled();
    });
  });
});
