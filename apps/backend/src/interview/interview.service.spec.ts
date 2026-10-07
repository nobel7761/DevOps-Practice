/// <reference types="jest" />
import { NotFoundException } from '@nestjs/common';
import { InterviewService } from './interview.service';

const MODULE_ID = '74b6214c-6880-4092-a870-0dd99de179b0';

function mockOpenAiReturning(jsonBody: Record<string, unknown>) {
  return {
    chat: {
      completions: {
        create: jest.fn().mockResolvedValue({
          choices: [{ message: { content: JSON.stringify(jsonBody) } }],
        }),
      },
    },
  };
}

describe('InterviewService', () => {
  describe('getInterview', () => {
    it('returns the question list for a known module', () => {
      const service = new InterviewService(mockOpenAiReturning({}) as any);

      const spec = service.getInterview(MODULE_ID);

      expect(spec.title).toBe('Linux User & Access Management');
      expect(spec.questions).toHaveLength(4);
      expect(spec.questions[0]).toMatchObject({
        id: 'q1',
        title: 'Fix Directory Access',
      });
    });

    it('throws NotFoundException for a module with no interview', () => {
      const service = new InterviewService(mockOpenAiReturning({}) as any);

      expect(() => service.getInterview('unknown-module')).toThrow(
        NotFoundException,
      );
    });
  });

  describe('gradeAnswer', () => {
    it('sends the scenario and the candidate command to the model, and returns its structured verdict', async () => {
      const openai = mockOpenAiReturning({
        score: 90,
        verdict: 'Mostly correct.',
        strengths: ['Uses the right base command'],
        improvements: ['Could mention -R explicitly'],
        technicalAccuracy: 90,
        completeness: 85,
      });
      const service = new InterviewService(openai as any);

      const result = await service.gradeAnswer(MODULE_ID, {
        questionId: 'q1',
        command:
          'chgrp -R developers /var/www/app && chmod -R 2775 /var/www/app',
      });

      expect(openai.chat.completions.create).toHaveBeenCalledTimes(1);
      const call = openai.chat.completions.create.mock.calls[0][0];
      const promptText = JSON.stringify(call);
      expect(promptText).toContain('Developers need read/write access');
      expect(promptText).toContain('chgrp -R developers');

      expect(result).toEqual({
        score: 90,
        verdict: 'Mostly correct.',
        strengths: ['Uses the right base command'],
        improvements: ['Could mention -R explicitly'],
        technicalAccuracy: 90,
        completeness: 85,
      });
    });

    it('throws NotFoundException for an unknown question id', async () => {
      const service = new InterviewService(mockOpenAiReturning({}) as any);

      await expect(
        service.gradeAnswer(MODULE_ID, { questionId: 'nope', command: 'ls' }),
      ).rejects.toThrow(NotFoundException);
    });

    it('fails loudly when the model does not return valid JSON', async () => {
      const openai = {
        chat: {
          completions: {
            create: jest.fn().mockResolvedValue({
              choices: [{ message: { content: 'not json' } }],
            }),
          },
        },
      };
      const service = new InterviewService(openai as any);

      await expect(
        service.gradeAnswer(MODULE_ID, { questionId: 'q1', command: 'ls' }),
      ).rejects.toThrow();
    });
  });
});
