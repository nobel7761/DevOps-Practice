"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { canUseAskAi } from "@/lib/auth/access";

/** Renders children only for users the super admin enabled Ask AI for. */
export default function AskAiGate({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  if (!user || !canUseAskAi(user)) {
    return (
      <p className="p-6 text-sm text-muted-foreground">
        Ask AI is not enabled for your account. Please contact the admin.
      </p>
    );
  }
  return <>{children}</>;
}
