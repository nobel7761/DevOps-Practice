/// <reference types="jest" />
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AdminService } from './admin.service';

function setup(
  found: Record<string, unknown> | null = { _id: 'u1', role: 'user' },
) {
  const users = {
    findById: jest.fn().mockResolvedValue(found),
    listByStatus: jest.fn().mockResolvedValue([]),
    updateAccess: jest.fn().mockResolvedValue({ _id: 'u1' }),
  };
  return { service: new AdminService(users as any), users };
}

describe('AdminService.approve', () => {
  it('approves, assigns courses and sets the Ask AI flag', async () => {
    const { service, users } = setup();
    await service.approve('u1', { courseIds: ['aws-s4'], askAiEnabled: true });
    expect(users.updateAccess).toHaveBeenCalledWith('u1', {
      status: 'approved',
      courseIds: ['aws-s4'],
      askAiEnabled: true,
    });
  });

  it('defaults Ask AI to off when not provided', async () => {
    const { service, users } = setup();
    await service.approve('u1', { courseIds: [] });
    expect(users.updateAccess).toHaveBeenCalledWith(
      'u1',
      expect.objectContaining({ askAiEnabled: false }),
    );
  });

  it('404s for an unknown user', async () => {
    const { service } = setup(null);
    await expect(
      service.approve('x', { courseIds: [] }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('refuses to change a super admin account', async () => {
    const { service } = setup({ _id: 'u1', role: 'superadmin' });
    await expect(
      service.approve('u1', { courseIds: [] }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});

describe('AdminService.reject / updateAccess', () => {
  it('reject sets status rejected', async () => {
    const { service, users } = setup();
    await service.reject('u1');
    expect(users.updateAccess).toHaveBeenCalledWith('u1', {
      status: 'rejected',
    });
  });

  it('updateAccess edits courses / Ask AI of an existing user', async () => {
    const { service, users } = setup();
    await service.updateAccess('u1', { askAiEnabled: false, courseIds: ['a'] });
    expect(users.updateAccess).toHaveBeenCalledWith('u1', {
      askAiEnabled: false,
      courseIds: ['a'],
    });
  });
});
