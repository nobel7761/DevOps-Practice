/// <reference types="jest" />
import * as fs from 'fs';
import { SystemDesignQuizService } from './system-design-quiz.service';

jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

const DIFFICULTIES = ['easy', 'medium', 'hard'];
const BANK = {
  topicId: 'sd-day-012',
  questions: Array.from({ length: 60 }, (_, i) => ({
    id: `q${i + 1}`,
    difficulty: DIFFICULTIES[Math.floor(i / 20)],
    question: `Q${i + 1}`,
    options: ['right', 'wrong a', 'wrong b', 'wrong c'],
    correctIndex: 0,
    explanation: 'why right',
    whyWrong: { '1': 'a wrong', '2': 'b wrong', '3': 'c wrong' },
  })),
};

const exec = <T>(value: T) => ({ exec: jest.fn().mockResolvedValue(value) });

function setup(progress: { seenIds: string[]; passed: boolean } | null = null) {
  const progressModel = {
    findOne: jest.fn().mockReturnValue(exec(progress)),
    findOneAndUpdate: jest.fn().mockReturnValue(exec({})),
  };
  const saved: any[] = [];
  const attemptModel = {
    create: jest.fn().mockImplementation(async (doc) => {
      const withId = { ...doc, _id: 'attempt-1' };
      saved.push(withId);
      return withId;
    }),
    findById: jest.fn().mockImplementation(() => exec(saved[0] ?? null)),
    findByIdAndUpdate: jest.fn().mockReturnValue(exec({})),
    find: jest.fn().mockReturnValue({ sort: () => exec(saved) }),
  };
  const service = new SystemDesignQuizService(
    progressModel as any,
    attemptModel as any,
  );
  return { service, progressModel, attemptModel, saved };
}

beforeEach(() => {
  mockedFs.existsSync.mockReturnValue(true);
  mockedFs.readFileSync.mockReturnValue(JSON.stringify(BANK) as any);
});

describe('SystemDesignQuizService.startAttempt', () => {
  it('serves 20 questions without answers and remembers their option order', async () => {
    const { service, saved } = setup();
    const attempt = await service.startAttempt('u1', 'sd-day-012');

    expect(attempt.attemptId).toBe('attempt-1');
    expect(attempt.questions).toHaveLength(20);
    for (const q of attempt.questions) {
      expect(q).not.toHaveProperty('correctIndex');
      expect(q).not.toHaveProperty('whyWrong');
    }
    expect(saved[0].questions).toHaveLength(20);
    expect(saved[0].questions[0].order).toHaveLength(4);
  });

  it('marks the served questions as seen, on top of the ones seen before', async () => {
    const { service, progressModel } = setup({
      seenIds: ['q1', 'q2'],
      passed: false,
    });
    const attempt = await service.startAttempt('u1', 'sd-day-012');

    const update = progressModel.findOneAndUpdate.mock.calls[0][1];
    expect(update.seenIds).toEqual(
      expect.arrayContaining([
        'q1',
        'q2',
        ...attempt.questions.map((q) => q.id),
      ]),
    );
    expect(attempt.questions.map((q) => q.id)).not.toContain('q1');
  });
});

describe('SystemDesignQuizService.submitAttempt', () => {
  async function answeredAttempt(wrongCount: number) {
    const ctx = setup();
    await ctx.service.startAttempt('u1', 'sd-day-012');
    const answers = Object.fromEntries(
      ctx.saved[0].questions.map(
        (q: { id: string; order: number[] }, i: number) => [
          q.id,
          q.order.indexOf(i < wrongCount ? 1 : 0),
        ],
      ),
    );
    const result = await ctx.service.submitAttempt('u1', 'attempt-1', answers);
    return { ...ctx, result };
  }

  it('grades the attempt and saves the score', async () => {
    const { result, attemptModel } = await answeredAttempt(2);
    expect(result).toMatchObject({ score: 18, total: 20, passed: false });
    expect(attemptModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'attempt-1',
      expect.objectContaining({ score: 18, passed: false }),
    );
  });

  it('marks the topic "Quiz Passed" at 19 / 20', async () => {
    const { result, progressModel } = await answeredAttempt(1);
    expect(result.passed).toBe(true);
    const passUpdate = progressModel.findOneAndUpdate.mock.calls.find(
      ([, update]) => update.passed === true,
    );
    expect(passUpdate).toBeDefined();
  });

  it('does not let an attempt be submitted twice', async () => {
    const ctx = setup();
    await ctx.service.startAttempt('u1', 'sd-day-012');
    ctx.saved[0].submittedAt = new Date();
    await expect(
      ctx.service.submitAttempt('u1', 'attempt-1', {}),
    ).rejects.toThrow();
  });
});

describe('SystemDesignQuizService.getStatus', () => {
  it('says whether the topic has a quiz bank yet', async () => {
    const { service } = setup();
    await expect(service.getStatus('u1', 'sd-day-012')).resolves.toMatchObject({
      available: true,
    });
    mockedFs.existsSync.mockReturnValue(false);
    await expect(service.getStatus('u1', 'sd-day-012')).resolves.toMatchObject({
      available: false,
    });
  });
});
