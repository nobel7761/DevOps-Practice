import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isAuthPath } from "@/lib/auth/auth-paths";

// Name of the httpOnly cookie the backend sets (apps/backend/src/auth/jwt-auth.guard.ts).
// Cookies aren't port-scoped, so the backend's cookie on :3001 is visible here on :3000.
const AUTH_COOKIE = "access_token";

/**
 * Optimistic check only: no cookie → login page. The backend still verifies the
 * JWT on every API call; an expired cookie is caught by the API client's 401 handler.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(AUTH_COOKIE);

  // Auth pages are always reachable: the cookie may be stale (only the backend
  // can tell), and bouncing a stale session to "/" would loop with the 401 → /login redirect.
  if (!hasSession && !isAuthPath(pathname)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname + search);
    return NextResponse.redirect(loginUrl);
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico|mp4|webm|woff2?|txt|xml)$).*)",
  ],
};
