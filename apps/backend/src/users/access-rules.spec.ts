/// <reference types="jest" />
import { canAccessCourse, canLogin, canUseAskAi } from './access-rules';

const user = (over: Record<string, unknown> = {}) => ({
  role: 'user' as const,
  status: 'approved' as const,
  isActive: true,
  courseIds: ['aws-s4'],
  askAiEnabled: false,
  ...over,
});

describe('canLogin', () => {
  it('only approved + active accounts can log in', () => {
    expect(canLogin(user())).toBe(true);
    expect(canLogin(user({ status: 'pending' }))).toBe(false);
    expect(canLogin(user({ status: 'rejected' }))).toBe(false);
    expect(canLogin(user({ isActive: false }))).toBe(false);
  });
});

describe('canAccessCourse', () => {
  it('approved user sees only assigned courses', () => {
    expect(canAccessCourse(user(), 'aws-s4')).toBe(true);
    expect(canAccessCourse(user(), 'hermes')).toBe(false);
  });
  it('pending user sees nothing even with courseIds', () => {
    expect(canAccessCourse(user({ status: 'pending' }), 'aws-s4')).toBe(false);
  });
  it('super admin sees every course', () => {
    expect(
      canAccessCourse(user({ role: 'superadmin', courseIds: [] }), 'x'),
    ).toBe(true);
  });
});

describe('canUseAskAi', () => {
  it('requires approval and the askAiEnabled flag', () => {
    expect(canUseAskAi(user())).toBe(false);
    expect(canUseAskAi(user({ askAiEnabled: true }))).toBe(true);
    expect(canUseAskAi(user({ askAiEnabled: true, status: 'pending' }))).toBe(
      false,
    );
  });
  it('super admin always has Ask AI', () => {
    expect(canUseAskAi(user({ role: 'superadmin' }))).toBe(true);
  });
});
