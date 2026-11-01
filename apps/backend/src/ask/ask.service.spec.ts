/// <reference types="jest" />
import { AskService } from './ask.service';
import type { AskQuestionDto } from './dto/ask-question.dto';

function createAsyncIterable<T>(items: T[]): AsyncIterable<T> {
  return {
    [Symbol.asyncIterator]() {
      let i = 0;
      return {
        next: async () => {
          if (i < items.length) {
            return { value: items[i++], done: false };
          }
          return { value: undefined, done: true };
        },
      };
    },
  };
}

describe('AskService.streamAsk', () => {
  it('yields each delta chunk as it arrives from OpenAI and saves the full concatenated answer to the conversation', async () => {
    const chunks = [
      { choices: [{ delta: { content: 'Load ' } }] },
      { choices: [{ delta: { content: 'average ' } }] },
      { choices: [{ delta: { content: 'মানে চাপ।' } }] },
    ];
    const openai = {
      chat: {
        completions: {
          create: jest.fn().mockResolvedValue(createAsyncIterable(chunks)),
        },
      },
    };
    const findOneAndUpdateExec = jest.fn().mockResolvedValue(undefined);
    const conversationModel = {
      findOne: jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) }),
      findOneAndUpdate: jest
        .fn()
        .mockReturnValue({ exec: findOneAndUpdateExec }),
    };

    const service = new AskService(openai as any, conversationModel as any);

    const dto: AskQuestionDto = {
      question: 'লোড এভারেজ মানে কী?',
      context: { videoTitle: 'Linux Performance Analysis' } as any,
    };

    const received: string[] = [];
    for await (const delta of service.streamAsk('user-1', 'content-1', dto)) {
      received.push(delta);
    }

    expect(received).toEqual(['Load ', 'average ', 'মানে চাপ।']);
    expect(openai.chat.completions.create).toHaveBeenCalledWith(
      expect.objectContaining({ stream: true }),
    );
    expect(conversationModel.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: 'user-1', contentId: 'content-1' },
      expect.objectContaining({
        messages: [
          { role: 'user', content: 'লোড এভারেজ মানে কী?' },
          { role: 'assistant', content: 'Load average মানে চাপ।' },
        ],
      }),
      { upsert: true },
    );
  });
});
