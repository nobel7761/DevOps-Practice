"use client";

import { CheckCircle2, Circle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/shared/shadcn";
import { resolveContentHref } from "@/lib/data/content-href";
import type { CourseContentItem } from "@/lib/data/course-modules";
import { hasInterview } from "@/lib/data/interview-modules";

function TopicStatusIcon({ completed }: { completed: boolean }) {
  return completed ? (
    <CheckCircle2 className="text-emerald-500!" aria-label="Completed" />
  ) : (
    <Circle className="text-muted-foreground/50!" />
  );
}

/** One topic of a module: green tick once done, linked when it has its own page. */
export default function CourseSidebarTopic({
  item,
  moduleId,
}: {
  item: CourseContentItem;
  moduleId: string;
}) {
  const pathname = usePathname();
  const href = resolveContentHref(item, moduleId, hasInterview);
  const title = item.title ?? "Untitled";
  const label = (
    <>
      <TopicStatusIcon completed={item.completed} />
      <span className="truncate">{title}</span>
    </>
  );

  return (
    <SidebarMenuSubItem>
      {href ? (
        <SidebarMenuSubButton
          asChild
          size="sm"
          isActive={pathname === href}
          title={title}
        >
          <Link href={href}>{label}</Link>
        </SidebarMenuSubButton>
      ) : (
        <SidebarMenuSubButton
          size="sm"
          aria-disabled
          title={title}
          className="cursor-default opacity-70"
        >
          {label}
        </SidebarMenuSubButton>
      )}
    </SidebarMenuSubItem>
  );
}
