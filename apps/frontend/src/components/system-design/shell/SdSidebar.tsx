"use client";

import { Brain, Gamepad2, GraduationCap, House } from "lucide-react";
import Link from "next/link";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/shared/shadcn";
import { SD_OUTLINE, SD_TOTAL_DAYS, SD_WRITTEN_COUNT } from "./sd-outline";
import { SdSidebarPhase } from "./SdSidebarPhase";

const QUICK_LINKS = [
  { href: "/", label: "Home (সব course)", icon: House },
  { href: "/system-design/playground", label: "Playground", icon: Gamepad2 },
  { href: "/system-design/recall", label: "আজকের Recall", icon: Brain },
];

function SidebarTop() {
  return (
    <SidebarHeader>
      <Link
        href="/course/system-design-a-z"
        className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-sidebar-accent"
      >
        <GraduationCap className="size-5 text-primary" />
        <span className="flex flex-col leading-tight">
          <span className="text-sm font-bold">System Design A-Z</span>
          <span className="text-xs text-muted-foreground">
            {SD_WRITTEN_COUNT}/{SD_TOTAL_DAYS} lesson ready
          </span>
        </span>
      </Link>
      <SidebarMenu>
        {QUICK_LINKS.map(({ href, label, icon: Icon }) => (
          <SidebarMenuItem key={href}>
            <SidebarMenuButton asChild size="sm">
              <Link href={href}>
                <Icon />
                {label}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarHeader>
  );
}

/** Course navigation: every phase as a dropdown with its days underneath. */
export function SdSidebar({ currentTopicId }: { currentTopicId?: string }) {
  const currentPhase =
    SD_OUTLINE.find((p) => p.days.some((d) => d.topicId === currentTopicId))
      ?.id ?? SD_OUTLINE[0].id;
  return (
    <Sidebar>
      <SidebarTop />
      <SidebarSeparator />
      <SidebarContent className="gap-0 pb-6">
        {SD_OUTLINE.map((phase) => (
          <SdSidebarPhase
            key={phase.id}
            phase={phase}
            currentTopicId={currentTopicId}
            defaultOpen={phase.id === currentPhase}
          />
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
