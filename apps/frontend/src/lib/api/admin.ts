import client from "@/lib/api/client";
import type { AuthUser } from "@/lib/api/auth";

export interface AccessInput {
  courseIds?: string[];
  askAiEnabled?: boolean;
}

export const adminApi = {
  listUsers: () =>
    client.get<{ users: AuthUser[] }>("/admin/users").then((r) => r.data.users),
  approve: (id: string, input: AccessInput) =>
    client.post(`/admin/users/${id}/approve`, input),
  reject: (id: string) => client.post(`/admin/users/${id}/reject`),
  updateAccess: (id: string, input: AccessInput) =>
    client.patch(`/admin/users/${id}/access`, input),
};
