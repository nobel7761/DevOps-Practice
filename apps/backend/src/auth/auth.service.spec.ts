/// <reference types="jest" />
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';

function setup(found: Record<string, unknown> | null = null) {
  const users = {
    findByEmail: jest.fn().mockResolvedValue(found),
    findByEmailWithPassword: jest.fn().mockResolvedValue(found),
    create: jest.fn().mockImplementation(async (d) => ({ _id: 'u1', ...d })),
  };
  const service = new AuthService(
    users as any,
    {} as any,
    {} as any,
    {} as any,
  );
  return { service, users };
}

const dto = {
  firstName: 'A',
  lastName: 'B',
  email: 'a@b.com',
  password: 'AAbb12!!',
};

describe('AuthService.register', () => {
  it('creates the account as pending, role user, no courses, Ask AI off', async () => {
    const { service, users } = setup();
    await service.register(dto);
    expect(users.create).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'pending',
        role: 'user',
        courseIds: [],
        askAiEnabled: false,
      }),
    );
  });
});

describe('AuthService.login', () => {
  const account = async (over: Record<string, unknown>) => ({
    _id: 'u1',
    firstName: 'A',
    lastName: 'B',
    email: 'a@b.com',
    role: 'user',
    isActive: true,
    courseIds: [],
    askAiEnabled: false,
    passwordHash: await bcrypt.hash(dto.password, 4),
    ...over,
  });

  it('blocks a correct-password login while still pending approval', async () => {
    const { service } = setup(await account({ status: 'pending' }));
    await expect(service.login(dto)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('blocks a rejected account', async () => {
    const { service } = setup(await account({ status: 'rejected' }));
    await expect(service.login(dto)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('wrong password stays a generic 401 (no status leak)', async () => {
    const { service } = setup(await account({ status: 'pending' }));
    await expect(
      service.login({ ...dto, password: 'wrong' }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('lets an approved user in and returns role, courseIds and askAiEnabled', async () => {
    const { service } = setup(
      await account({
        status: 'approved',
        courseIds: ['aws-s4'],
        askAiEnabled: true,
      }),
    );
    await expect(service.login(dto)).resolves.toMatchObject({
      role: 'user',
      courseIds: ['aws-s4'],
      askAiEnabled: true,
    });
  });
});
