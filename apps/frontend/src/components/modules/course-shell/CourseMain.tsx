"use client";

import CourseLanding from "@/components/modules/course-shell/CourseLanding";
import CourseModuleView from "@/components/modules/course-shell/CourseModuleView";
import { useLiveCourseContext } from "@/components/modules/course-shell/LiveCourseContext";

/** Right-hand side of the course page: the picked module, or the course landing when none is picked. */
export default function CourseMain({
  moduleId,
  externalUrl,
}: {
  moduleId?: string;
  externalUrl?: string;
}) {
  const { course } = useLiveCourseContext();
  const index = course.milestones.findIndex((m) =>
    m.modules.some((mod) => mod.id === moduleId),
  );
  const milestone = course.milestones[index];
  const module = milestone?.modules.find((mod) => mod.id === moduleId);

  if (!milestone || !module) return <CourseLanding externalUrl={externalUrl} />;

  return (
    <CourseModuleView
      module={module}
      milestoneLabel={`Milestone ${index + 1} · ${milestone.title}`}
    />
  );
}
