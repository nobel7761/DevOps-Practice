import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { SidebarMenuButton, SidebarMenuItem } from "@/components/shared/shadcn";
import type { CourseModule } from "@/lib/data/course-modules";

/** One module in the sidebar; opens the module's contents in the main area. */
export default function CourseSidebarModule({
  module,
  href,
  index,
  active,
}: {
  module: CourseModule;
  href: string;
  index: number;
  active: boolean;
}) {
  const total = module.contents.length;
  const completed = module.contents.filter((item) => item.completed).length;
  const done = total > 0 && completed === total;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild
        isActive={active}
        size="sm"
        tooltip={module.title}
      >
        <Link href={href}>
          <span className="w-5 shrink-0 text-xs tabular-nums text-muted-foreground">
            {index + 1}
          </span>
          <span className="truncate">{module.title}</span>
          <span className="ml-auto shrink-0 text-xs tabular-nums text-muted-foreground">
            {done ? (
              <CheckCircle2 className="size-3.5 text-emerald-500" />
            ) : (
              `${completed}/${total}`
            )}
          </span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
