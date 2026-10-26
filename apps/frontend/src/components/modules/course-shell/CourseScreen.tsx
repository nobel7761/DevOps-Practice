import CourseMain from "@/components/modules/course-shell/CourseMain";
import CourseShell from "@/components/modules/course-shell/CourseShell";
import type { CourseSummary } from "@/lib/data/course-modules";

/** The course page: sidebar shell with the picked module (or the landing) beside it. */
export default function CourseScreen({
  courseId,
  course,
  externalUrl,
  milestoneId,
  moduleId,
}: {
  courseId: string;
  course: CourseSummary;
  externalUrl?: string;
  milestoneId?: string;
  moduleId?: string;
}) {
  return (
    <CourseShell
      courseId={courseId}
      course={course}
      currentMilestoneId={milestoneId}
      currentModuleId={moduleId}
    >
      <CourseMain moduleId={moduleId} externalUrl={externalUrl} />
    </CourseShell>
  );
}
