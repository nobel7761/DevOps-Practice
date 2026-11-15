import type { UserRole, UserStatus } from './schemas/user.schema';

export interface AccessSubject {
  role: UserRole;
  status: UserStatus;
  isActive: boolean;
  courseIds: string[];
  askAiEnabled: boolean;
}

const isSuperAdmin = (u: AccessSubject) => u.role === 'superadmin';

export const canLogin = (u: AccessSubject) =>
  u.isActive && (isSuperAdmin(u) || u.status === 'approved');

export const canAccessCourse = (u: AccessSubject, courseId: string) =>
  isSuperAdmin(u) || (canLogin(u) && u.courseIds.includes(courseId));

export const canUseAskAi = (u: AccessSubject) =>
  isSuperAdmin(u) || (canLogin(u) && u.askAiEnabled);
