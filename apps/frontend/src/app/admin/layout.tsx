import type { ReactNode } from "react";
import SuperAdminOnly from "@/components/admin/SuperAdminOnly";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <SuperAdminOnly>{children}</SuperAdminOnly>;
}
