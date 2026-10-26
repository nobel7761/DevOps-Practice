/// <reference types="jest" />
import * as fs from 'fs';
import { QuizService } from './quiz.service';

jest.mock('fs');

const mockedFs = fs as jest.Mocked<typeof fs>;

const BANK = {
  labId: 'lab-1',
  passPercent: 95,
  sample: { easy: 1, medium: 0, hard: 0 },
  questions: [
    {
      id: 'q1',
      difficulty: 'easy',
      question: 'Q1?',
      options: ['a', 'b'],
      answerIndex: 0,
      explanation: 'because a',
    },
  ],
};

function mockModel() {
  return {
    countDocuments: jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue(0) }),
    create: jest.fn().mockResolvedValue({}),
    findOneAndUpdate: jest
      .fn()
      .mockReturnValue({ exec: jest.fn().mockResolvedValue({}) }),
  };
}

describe('QuizService completion tracking', () => {
  beforeEach(() => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue(JSON.stringify(BANK) as any);
  });

  it('marks the content as completed in progress when the quiz is passed (score >= passPercent)', async () => {
    const quizAttemptModel = mockModel();
    const contentProgressModel = mockModel();
    const service = new QuizService(
      quizAttemptModel as any,
      contentProgressModel as any,
    );

    await service.submitQuiz('u1', 'lab-1', {
      answers: [{ questionId: 'q1', answerIndex: 0 }], // correct -> 100%
    });

    expect(contentProgressModel.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: 'u1', key: 'lab-1', type: 'quiz' },
      expect.objectContaining({ completed: true }),
      expect.objectContaining({ upsert: true }),
    );
  });

  it('does not mark the content as completed when the quiz is failed', async () => {
    const quizAttemptModel = mockModel();
    const contentProgressModel = mockModel();
    const service = new QuizService(
      quizAttemptModel as any,
      contentProgressModel as any,
    );

    await service.submitQuiz('u1', 'lab-1', {
      answers: [{ questionId: 'q1', answerIndex: 1 }], // wrong -> 0%
    });

    expect(contentProgressModel.findOneAndUpdate).not.toHaveBeenCalled();
  });
});
