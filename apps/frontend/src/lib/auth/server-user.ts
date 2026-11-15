import { cookies } from "next/headers";
import type { AuthUser } from "@/lib/api/auth";
import { getApiBaseUrl } from "@/lib/api/client";

/** The logged-in user as the backend sees them (server components only), or null. */
export async function getServerUser(): Promise<AuthUser | null> {
  const cookie = (await cookies()).toString();
  if (!cookie) return null;
  try {
    const res = await fetch(`${getApiBaseUrl()}/auth/me`, {
      headers: { cookie },
      cache: "no-store",
    });
    if (!res.ok) return null;
    return ((await res.json()) as { user: AuthUser }).user;
  } catch {
    return null;
  }
}
