import { GraduationCap, House } from "lucide-react";
import Link from "next/link";
import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/shared/shadcn";
import type { CourseSummary } from "@/lib/data/course-modules";

/** Course title with overall progress, plus the way back to the course list. */
export default function CourseSidebarHeader({
  course,
  courseHref,
  showHomeLink,
}: {
  course: CourseSummary;
  courseHref: string;
  showHomeLink: boolean;
}) {
  const contents = course.milestones.flatMap((m) =>
    m.modules.flatMap((mod) => mod.contents),
  );
  const completed = contents.filter((item) => item.completed).length;

  return (
    <SidebarHeader>
      <Link
        href={courseHref}
        className="flex items-start gap-2 rounded-md px-2 py-1.5 hover:bg-sidebar-accent"
      >
        <GraduationCap className="mt-0.5 size-5 shrink-0 text-primary" />
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="text-sm font-bold">{course.courseTitle}</span>
          <span className="text-xs text-muted-foreground">
            {completed}/{contents.length} completed
          </span>
        </span>
      </Link>
      {showHomeLink && (
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild size="sm">
              <Link href="/">
                <House />
                Home (সব course)
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      )}
    </SidebarHeader>
  );
}
