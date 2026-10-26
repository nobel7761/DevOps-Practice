"use client";

import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import type { AuthUser } from "@/lib/api/auth";
import { safeNextPath } from "@/lib/auth/auth-paths";

/** After login/register/reset: remember the user and go to `?next=` (or home). */
export function useFinishLogin() {
  const { setUser } = useAuth();
  const searchParams = useSearchParams();
  return (user: AuthUser) => {
    setUser(user);
    // Full navigation so proxy.ts sees the freshly set cookie.
    window.location.href = safeNextPath(searchParams.get("next"));
  };
}
