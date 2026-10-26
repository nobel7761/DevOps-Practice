"use client";

import type { ReactNode } from "react";
import { SidebarInset, SidebarProvider } from "@/components/shared/shadcn";
import CourseSidebar from "@/components/modules/course-shell/CourseSidebar";
import CourseTopBar from "@/components/modules/course-shell/CourseTopBar";
import { getCourseLayout } from "@/components/modules/course-shell/course-layout";
import { LiveCourseProvider } from "@/components/modules/course-shell/LiveCourseContext";
import { useLiveCourse } from "@/components/modules/course-shell/useLiveCourse";
import type { CourseSummary } from "@/lib/data/course-modules";

/** Every course page: milestone/module sidebar on the left, the page using all the remaining width. */
export default function CourseShell({
  courseId,
  course,
  currentMilestoneId,
  currentModuleId,
  children,
}: {
  courseId: string;
  course: CourseSummary;
  currentMilestoneId?: string;
  currentModuleId?: string;
  children: ReactNode;
}) {
  const liveCourse = useLiveCourse(course);
  const courseHref = `/course/${courseId}`;
  const layout = getCourseLayout(courseId);

  return (
    <LiveCourseProvider value={{ courseId, course: liveCourse, layout }}>
      <SidebarProvider>
        <CourseSidebar
          course={liveCourse}
          courseHref={courseHref}
          layout={layout}
          currentMilestoneId={currentMilestoneId}
          currentModuleId={currentModuleId}
        />
        <SidebarInset className="min-w-0">
          <CourseTopBar
            courseTitle={course.courseTitle}
            courseHref={courseHref}
          />
          <div className="min-w-0 flex-1">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </LiveCourseProvider>
  );
}
