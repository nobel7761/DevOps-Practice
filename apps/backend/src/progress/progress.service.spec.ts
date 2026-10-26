/// <reference types="jest" />
import { ProgressService } from './progress.service';

const exec = <T>(value: T) => ({ exec: jest.fn().mockResolvedValue(value) });

function setup() {
  const model = {
    findOneAndUpdate: jest.fn().mockReturnValue(exec({})),
    distinct: jest.fn().mockReturnValue(exec([])),
  };
  return { service: new ProgressService(model as any), model };
}

describe('ProgressService.setCompleted', () => {
  it('can un-mark something, e.g. unticking "Post করেছি"', async () => {
    const { service, model } = setup();
    await service.setCompleted('u1', 'sd-day-013', 'linkedin', false);
    expect(model.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: 'u1', key: 'sd-day-013', type: 'linkedin' },
      { userId: 'u1', key: 'sd-day-013', type: 'linkedin', completed: false },
      { upsert: true },
    );
  });

  it('marks complete the same way markComplete does', async () => {
    const { service, model } = setup();
    await service.setCompleted('u1', 'sd-day-013', 'linkedin', true);
    expect(model.findOneAndUpdate.mock.calls[0][1]).toMatchObject({
      completed: true,
    });
  });
});

describe('ProgressService.getCompletedKeysOfType', () => {
  it('returns only completed keys of that type', async () => {
    const { service, model } = setup();
    model.distinct.mockReturnValue(exec(['sd-day-013']));
    await expect(
      service.getCompletedKeysOfType('u1', 'linkedin'),
    ).resolves.toEqual(['sd-day-013']);
    expect(model.distinct).toHaveBeenCalledWith('key', {
      userId: 'u1',
      completed: true,
      type: 'linkedin',
    });
  });
});
