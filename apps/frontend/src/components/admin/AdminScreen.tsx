"use client";

import { useCallback, useEffect, useState } from "react";
import Loader from "@/components/shared/Loader";
import { useAuth } from "@/contexts/AuthContext";
import { adminApi } from "@/lib/api/admin";
import type { AuthUser } from "@/lib/api/auth";
import { isSuperAdmin } from "@/lib/auth/access";
import AdminUsersTable from "./AdminUsersTable";

function useAdminUsers() {
  const [users, setUsers] = useState<AuthUser[] | null>(null);
  const reload = useCallback(() => adminApi.listUsers().then(setUsers), []);
  useEffect(() => {
    void reload();
  }, [reload]);
  return { users, reload };
}

function AdminContent() {
  const { users, reload } = useAdminUsers();
  if (!users) return <Loader className="mx-auto mt-12" />;
  return <AdminUsersTable users={users} onChanged={reload} />;
}

export default function AdminScreen() {
  const { user, loading } = useAuth();
  if (loading) return <Loader className="mx-auto mt-24" />;
  if (!user || !isSuperAdmin(user)) {
    return (
      <p className="mt-24 text-center text-muted-foreground">
        Super admin only.
      </p>
    );
  }
  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold">User approvals & access</h1>
      <AdminContent />
    </main>
  );
}
