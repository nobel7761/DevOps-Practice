/** Pages reachable without logging in. Also used by src/proxy.ts. */
export const AUTH_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];

export const isAuthPath = (pathname: string) =>
  AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

/** Only same-site relative paths are allowed as a post-login redirect. */
export function safeNextPath(next: string | null | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/";
  return isAuthPath(next.split("?")[0]) ? "/" : next;
}
