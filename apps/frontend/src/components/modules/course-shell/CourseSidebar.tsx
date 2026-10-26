"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarSeparator,
} from "@/components/shared/shadcn";
import CourseSidebarHeader from "@/components/modules/course-shell/CourseSidebarHeader";
import CourseSidebarMilestone from "@/components/modules/course-shell/CourseSidebarMilestone";
import type { CourseLayoutOptions } from "@/components/modules/course-shell/course-layout";
import type { CourseSummary } from "@/lib/data/course-modules";

/** Course navigation: every milestone as a dropdown with its modules underneath. */
export default function CourseSidebar({
  course,
  courseHref,
  layout,
  currentMilestoneId,
  currentModuleId,
}: {
  course: CourseSummary;
  courseHref: string;
  layout: CourseLayoutOptions;
  currentMilestoneId?: string;
  currentModuleId?: string;
}) {
  const openId =
    course.milestones.find((m) =>
      m.modules.some((mod) => mod.id === currentModuleId),
    )?.id ??
    currentMilestoneId ??
    course.milestones[0]?.id;

  return (
    <Sidebar className="print:hidden">
      <CourseSidebarHeader
        course={course}
        courseHref={courseHref}
        showHomeLink={layout.sidebarHomeLink}
      />
      <SidebarSeparator />
      <SidebarContent className="gap-0 pb-6">
        {course.milestones.map((milestone, index) => (
          <CourseSidebarMilestone
            key={milestone.id}
            milestone={milestone}
            index={index}
            courseHref={courseHref}
            topicTree={layout.topicTree}
            currentModuleId={currentModuleId}
            defaultOpen={milestone.id === openId}
          />
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
