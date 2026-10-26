"use client";

import type { ReactNode } from "react";
import CourseTopBar from "@/components/modules/course-shell/CourseTopBar";
import { SidebarInset, SidebarProvider } from "@/components/shared/shadcn";
import { SdSidebar } from "./SdSidebar";

/** System Design pages: course sidebar on the left, the page using all the remaining width. */
export function SdShell({
  currentTopicId,
  children,
}: {
  currentTopicId?: string;
  children: ReactNode;
}) {
  return (
    <SidebarProvider>
      <SdSidebar currentTopicId={currentTopicId} />
      <SidebarInset className="min-w-0">
        <CourseTopBar
          courseTitle="System Design A-Z"
          courseHref="/course/system-design-a-z"
        />
        <div className="min-w-0 flex-1">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
