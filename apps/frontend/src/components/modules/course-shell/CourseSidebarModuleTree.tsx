"use client";

import { CheckCircle2, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
} from "@/components/shared/shadcn";
import CourseSidebarTopic from "@/components/modules/course-shell/CourseSidebarTopic";
import type { CourseModule } from "@/lib/data/course-modules";

/** A module as a dropdown of its topics; green tick once every topic is done. */
export default function CourseSidebarModuleTree({
  module,
  index,
  defaultOpen,
}: {
  module: CourseModule;
  index: number;
  defaultOpen: boolean;
}) {
  const total = module.contents.length;
  const completed = module.contents.filter((item) => item.completed).length;
  const done = total > 0 && completed === total;

  return (
    <Collapsible asChild defaultOpen={defaultOpen} className="group/module">
      <SidebarMenuItem>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton size="sm" tooltip={module.title}>
            <ChevronRight className="transition-transform group-data-[state=open]/module:rotate-90" />
            <span className="w-4 shrink-0 text-xs tabular-nums text-muted-foreground">
              {index + 1}
            </span>
            <span className="truncate">{module.title}</span>
            <span className="ml-auto shrink-0 text-xs tabular-nums text-muted-foreground">
              {done ? (
                <CheckCircle2
                  className="size-3.5 text-emerald-500"
                  aria-label="Module completed"
                />
              ) : (
                `${completed}/${total}`
              )}
            </span>
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub className="mr-0 pr-0">
            {module.contents.map((item, i) => (
              <CourseSidebarTopic
                key={`${item.type}-${i}`}
                item={item}
                moduleId={module.id}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </SidebarMenuItem>
    </Collapsible>
  );
}
