"use client";

import { ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/shared/shadcn";
import CourseSidebarModule from "@/components/modules/course-shell/CourseSidebarModule";
import CourseSidebarModuleTree from "@/components/modules/course-shell/CourseSidebarModuleTree";
import type { CourseMilestone } from "@/lib/data/course-modules";

/** One milestone as a dropdown of its modules (or of module → topic dropdowns when `topicTree`); open by default when it holds the current module. */
export default function CourseSidebarMilestone({
  milestone,
  index,
  courseHref,
  topicTree,
  currentModuleId,
  defaultOpen,
}: {
  milestone: CourseMilestone;
  index: number;
  courseHref: string;
  topicTree: boolean;
  currentModuleId?: string;
  defaultOpen: boolean;
}) {
  const contents = milestone.modules.flatMap((m) => m.contents);
  const completed = contents.filter((item) => item.completed).length;

  return (
    <Collapsible defaultOpen={defaultOpen} className="group/milestone">
      <SidebarGroup className="py-0.5">
        <SidebarGroupLabel
          asChild
          className="h-auto min-h-8 py-1.5 text-left text-xs leading-snug text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <CollapsibleTrigger className="flex w-full items-start gap-1">
            <ChevronRight className="mt-0.5 size-3.5 shrink-0 transition-transform group-data-[state=open]/milestone:rotate-90" />
            <span className="flex-1">
              Milestone {index + 1} · {milestone.title}
            </span>
            <span className="shrink-0 font-normal tabular-nums text-muted-foreground">
              {completed}/{contents.length}
            </span>
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {milestone.modules.map((module, i) =>
                topicTree ? (
                  <CourseSidebarModuleTree
                    key={module.id}
                    module={module}
                    index={i}
                    defaultOpen={module.id === currentModuleId}
                  />
                ) : (
                  <CourseSidebarModule
                    key={module.id}
                    module={module}
                    index={i}
                    href={`${courseHref}?milestone=${milestone.id}&module=${module.id}`}
                    active={module.id === currentModuleId}
                  />
                ),
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
