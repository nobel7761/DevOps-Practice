/// <reference types="jest" />
import { withRetry } from './with-retry';

describe('withRetry', () => {
  it('returns the result on the first successful attempt without retrying', async () => {
    const fn = jest.fn().mockResolvedValue('ok');

    const result = await withRetry(fn, { attempts: 3, delayMs: 1 });

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries after a transient failure and returns the result once it succeeds', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('Connection error.'))
      .mockResolvedValueOnce('ok');

    const result = await withRetry(fn, { attempts: 3, delayMs: 1 });

    expect(result).toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('throws the last error after exhausting all attempts', async () => {
    const fn = jest
      .fn()
      .mockRejectedValueOnce(new Error('first'))
      .mockRejectedValueOnce(new Error('second'))
      .mockRejectedValueOnce(new Error('third'));

    await expect(withRetry(fn, { attempts: 3, delayMs: 1 })).rejects.toThrow(
      'third',
    );
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
