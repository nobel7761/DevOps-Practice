/// <reference types="jest" />
import { SystemDesignRecallService } from './system-design-recall.service';

const exec = <T>(value: T) => ({ exec: jest.fn().mockResolvedValue(value) });

function setup() {
  const pointModel = {
    find: jest.fn().mockReturnValue(exec([])),
    bulkWrite: jest.fn().mockResolvedValue({}),
    findOneAndUpdate: jest.fn().mockReturnValue(exec({})),
  };
  const reviewModel = {
    create: jest.fn().mockResolvedValue({}),
    distinct: jest.fn().mockReturnValue(exec(['2026-10-23', '2026-10-24'])),
  };
  const service = new SystemDesignRecallService(
    pointModel as any,
    reviewModel as any,
  );
  return { service, pointModel, reviewModel };
}

const point = (term: string) => ({
  topicId: 'sd-day-012',
  term,
  intervalIndex: 0,
  lastRating: null,
  nextDue: '2026-10-24',
});

describe('SystemDesignRecallService', () => {
  it('starting recall only inserts points that do not exist yet, so a re-read lesson keeps its schedule', async () => {
    const { service, pointModel } = setup();
    await service.startPoints('u1', [point('Producer'), point('Broker')]);
    const ops = pointModel.bulkWrite.mock.calls[0][0];
    expect(ops).toHaveLength(2);
    for (const op of ops) {
      expect(op.updateOne.upsert).toBe(true);
      expect(op.updateOne.update).toHaveProperty('$setOnInsert');
      expect(op.updateOne.update).not.toHaveProperty('$set');
    }
  });

  it('a review overwrites that point and logs the review day for the streak', async () => {
    const { service, pointModel, reviewModel } = setup();
    const reviewed = {
      ...point('Broker'),
      intervalIndex: 1,
      lastRating: 'good' as const,
      nextDue: '2026-10-27',
    };
    await service.recordReview('u1', reviewed, '2026-10-24');
    expect(pointModel.findOneAndUpdate).toHaveBeenCalledWith(
      { userId: 'u1', topicId: 'sd-day-012', term: 'Broker' },
      { ...reviewed, userId: 'u1' },
      { upsert: true },
    );
    expect(reviewModel.create).toHaveBeenCalledWith(
      expect.objectContaining({
        date: '2026-10-24',
        topicId: 'sd-day-012',
        term: 'Broker',
        rating: 'good',
      }),
    );
  });

  it('returns every point plus the distinct days reviews happened on', async () => {
    const { service } = setup();
    await expect(service.getAll('u1')).resolves.toEqual({
      points: [],
      reviewDates: ['2026-10-23', '2026-10-24'],
    });
  });
});
