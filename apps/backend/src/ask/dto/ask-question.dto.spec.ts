/// <reference types="jest" />
import 'reflect-metadata';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AskQuestionDto } from './ask-question.dto';

describe('AskQuestionDto', () => {
  it('passes validation when context.interview is the real /interview/:moduleId response shape (moduleId + per-question id included)', async () => {
    const dto = plainToInstance(AskQuestionDto, {
      question: 'uptime এর load average দিয়ে কীভাবে বুঝব সিস্টেম চাপে আছে?',
      context: {
        videoTitle: 'Linux Performance Analysis',
        interview: {
          moduleId: '74b6214c-6880-4092-a870-0dd99de179b0',
          title: 'Linux Fundamentals Interview',
          questions: [
            {
              id: 'q1',
              title: 'Load average',
              scenario: 'A server is slow, explain load average.',
            },
          ],
        },
      },
    });

    const errors = await validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    expect(errors).toHaveLength(0);
  });
});
