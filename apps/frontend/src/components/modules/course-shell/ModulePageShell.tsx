import type { ReactNode } from "react";
import CourseShell from "@/components/modules/course-shell/CourseShell";
import { getCourseEntry } from "@/lib/data/courses/registry";

/** Wraps a module's own page (video, story, lab, …) in its course's sidebar shell, with the module highlighted. */
export default function ModulePageShell({
  courseId,
  moduleId,
  children,
}: {
  courseId: string;
  moduleId: string;
  children: ReactNode;
}) {
  const entry = getCourseEntry(courseId);
  if (!entry) return children;

  return (
    <CourseShell
      courseId={entry.id}
      course={entry.course}
      currentModuleId={moduleId}
    >
      {children}
    </CourseShell>
  );
}
