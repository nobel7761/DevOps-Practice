/// <reference types="jest" />
import { SuperAdminSeeder } from './super-admin-seeder';

function setup(
  env: Record<string, string | undefined>,
  existing: unknown = null,
) {
  const users = {
    findByEmail: jest.fn().mockResolvedValue(existing),
    create: jest.fn().mockResolvedValue({}),
    updateAccess: jest.fn().mockResolvedValue({}),
    updatePassword: jest.fn().mockResolvedValue(undefined),
  };
  const config = { get: (k: string) => env[k] };
  return { seeder: new SuperAdminSeeder(users as any, config as any), users };
}

const env = {
  SUPERADMIN_EMAIL: 'Root@x.com',
  SUPERADMIN_PASSWORD: 'secret-pass',
};

describe('SuperAdminSeeder', () => {
  it('creates an approved superadmin from env credentials (password hashed)', async () => {
    const { seeder, users } = setup(env);
    await seeder.onApplicationBootstrap();
    const arg = users.create.mock.calls[0][0];
    expect(arg).toMatchObject({
      email: 'root@x.com',
      role: 'superadmin',
      status: 'approved',
    });
    expect(arg.passwordHash).not.toBe('secret-pass');
  });

  it('does not duplicate when the superadmin already exists', async () => {
    const { seeder, users } = setup(env, { _id: 'u1', role: 'superadmin' });
    await seeder.onApplicationBootstrap();
    expect(users.create).not.toHaveBeenCalled();
  });

  it('skips (no crash) when env vars are missing', async () => {
    const { seeder, users } = setup({});
    await expect(seeder.onApplicationBootstrap()).resolves.toBeUndefined();
    expect(users.create).not.toHaveBeenCalled();
  });
});
