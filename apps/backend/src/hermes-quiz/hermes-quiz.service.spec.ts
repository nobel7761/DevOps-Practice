/// <reference types="jest" />
import * as fs from 'fs';
import { HermesQuizService } from './hermes-quiz.service';

jest.mock('fs');
const mockedFs = fs as jest.Mocked<typeof fs>;

const CONTENT_ID = 'hermes-doc-getting-started-installation';
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const BANK = {
  contentId: CONTENT_ID,
  questions: Array.from({ length: 24 }, (_, i) => ({
    id: `q${i + 1}`,
    difficulty: DIFFICULTIES[i % 3],
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
  const service = new HermesQuizService(
    progressModel as any,
    attemptModel as any,
  );
  return { service, progressModel, attemptModel, saved };
}

beforeEach(() => {
  mockedFs.existsSync.mockReturnValue(true);
  mockedFs.readFileSync.mockReturnValue(JSON.stringify(BANK) as any);
});

describe('HermesQuizService.startAttempt', () => {
  it('serves 20 questions without answers and saves the attempt to the DB', async () => {
    const { service, saved, attemptModel } = setup();
    const attempt = await service.startAttempt('u1', CONTENT_ID);

    expect(attempt.questions).toHaveLength(20);
    for (const q of attempt.questions) {
      expect(q).not.toHaveProperty('correctIndex');
      expect(q).not.toHaveProperty('whyWrong');
    }
    expect(attemptModel.create).toHaveBeenCalledTimes(1);
    expect(saved[0]).toMatchObject({ userId: 'u1', contentId: CONTENT_ID });
    expect(saved[0].questions).toHaveLength(20);
  });

  it('rejects an id that is not a hermes lesson', async () => {
    const { service } = setup();
    await expect(service.startAttempt('u1', '../etc/passwd')).rejects.toThrow();
  });
});

describe('HermesQuizService.submitAttempt', () => {
  async function answeredAttempt(wrongCount: number) {
    const ctx = setup();
    await ctx.service.startAttempt('u1', CONTENT_ID);
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

  it('grades the attempt and saves score, answers and time to the DB', async () => {
    const { result, attemptModel } = await answeredAttempt(2);
    expect(result).toMatchObject({ score: 18, total: 20 });
    expect(attemptModel.findByIdAndUpdate).toHaveBeenCalledWith(
      'attempt-1',
      expect.objectContaining({
        score: 18,
        total: 20,
        submittedAt: expect.any(Date),
      }),
    );
  });

  it('records the lesson as passed in progress when the attempt passes', async () => {
    const { result, progressModel } = await answeredAttempt(0);
    expect(result.passed).toBe(true);
    expect(
      progressModel.findOneAndUpdate.mock.calls.some(
        ([, update]) => update.passed === true,
      ),
    ).toBe(true);
  });

  it("does not let one user submit another user's attempt", async () => {
    const ctx = setup();
    await ctx.service.startAttempt('u1', CONTENT_ID);
    await expect(
      ctx.service.submitAttempt('someone-else', 'attempt-1', {}),
    ).rejects.toThrow();
  });
});

describe('HermesQuizService.getStatus', () => {
  it('returns past attempts so the page can show saved results', async () => {
    const { service, saved } = setup();
    await service.startAttempt('u1', CONTENT_ID);
    saved[0].score = 15;
    saved[0].total = 20;
    saved[0].passed = false;
    saved[0].submittedAt = new Date();
    const status = await service.getStatus('u1', CONTENT_ID);
    expect(status.available).toBe(true);
    expect(status.attempts[0]).toMatchObject({ score: 15, total: 20 });
  });
});
