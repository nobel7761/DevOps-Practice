import type { AuthUser } from "@/lib/api/auth";

type AccessUser = Pick<AuthUser, "role" | "courseIds" | "askAiEnabled">;

export const isSuperAdmin = (user: Pick<AuthUser, "role">) =>
  user.role === "superadmin";

export const canAccessCourse = (user: AccessUser, courseId: string) =>
  isSuperAdmin(user) || user.courseIds.includes(courseId);

export const canUseAskAi = (user: AccessUser) =>
  isSuperAdmin(user) || user.askAiEnabled;
