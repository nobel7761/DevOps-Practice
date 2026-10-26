"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/shared/shadcn";
import type { OutlineDay, OutlinePhase } from "./sd-outline";

function DayItem({ day, active }: { day: OutlineDay; active: boolean }) {
  const label = (
    <>
      <span className="w-7 shrink-0 text-xs tabular-nums text-muted-foreground">
        {day.day}
      </span>
      <span className="truncate">{day.title}</span>
      {day.tags.includes("new") && (
        <span className="ml-auto shrink-0 text-xs" title="নতুন topic">
          🆕
        </span>
      )}
    </>
  );
  return (
    <SidebarMenuItem>
      {day.href ? (
        <SidebarMenuButton
          asChild
          isActive={active}
          size="sm"
          tooltip={`Day ${day.day} · ${day.title}`}
        >
          <Link href={day.href}>{label}</Link>
        </SidebarMenuButton>
      ) : (
        <SidebarMenuButton
          size="sm"
          disabled
          className="opacity-50"
          title={`Day ${day.day} · ${day.title} (শীঘ্রই আসছে)`}
        >
          {label}
        </SidebarMenuButton>
      )}
    </SidebarMenuItem>
  );
}

/** One phase as a collapsible group; open by default when it holds the current lesson. */
export function SdSidebarPhase({
  phase,
  currentTopicId,
  defaultOpen,
}: {
  phase: OutlinePhase;
  currentTopicId?: string;
  defaultOpen: boolean;
}) {
  const ready = phase.days.filter((d) => d.written).length;
  return (
    <Collapsible defaultOpen={defaultOpen} className="group/phase">
      <SidebarGroup className="py-0.5">
        <SidebarGroupLabel
          asChild
          className="h-auto min-h-8 py-1.5 text-left text-xs leading-snug text-sidebar-foreground hover:bg-sidebar-accent"
        >
          <CollapsibleTrigger className="flex w-full items-start gap-1">
            <ChevronRight className="mt-0.5 size-3.5 shrink-0 transition-transform group-data-[state=open]/phase:rotate-90" />
            <span className="flex-1">{phase.title}</span>
            <span className="shrink-0 font-normal tabular-nums text-muted-foreground">
              {ready}/{phase.days.length}
            </span>
          </CollapsibleTrigger>
        </SidebarGroupLabel>
        <CollapsibleContent>
          <SidebarGroupContent>
            <SidebarMenu>
              {phase.days.map((day) => (
                <DayItem
                  key={day.topicId}
                  day={day}
                  active={day.topicId === currentTopicId}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </CollapsibleContent>
      </SidebarGroup>
    </Collapsible>
  );
}
