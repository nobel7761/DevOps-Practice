import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getServerUser } from "@/lib/auth/server-user";
import { isSuperAdmin } from "@/lib/auth/access";

/** Server-side gate: anyone who isn't a super admin is sent to the home page before anything renders. */
export default async function SuperAdminOnly({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getServerUser();
  if (!user || !isSuperAdmin(user)) redirect("/");
  return <>{children}</>;
}
