import { notFound } from "next/navigation";
import CourseScreen from "@/components/modules/course-shell/CourseScreen";
import { SdCourseScreen } from "@/components/system-design/shell/SdCourseScreen";
import { SYSTEM_DESIGN_A_Z_COURSE_ID } from "@/lib/data/courses/system-design-a-z";
import { getCourseEntry } from "@/lib/data/courses/registry";

export default async function CoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ milestone?: string; module?: string }>;
}) {
  const { courseId } = await params;
  const { milestone, module } = await searchParams;
  const entry = getCourseEntry(courseId);

  if (!entry) {
    notFound();
  }

  // System Design A-Z has its own sidebar layout (phases → days).
  if (entry.id === SYSTEM_DESIGN_A_Z_COURSE_ID) {
    return <SdCourseScreen />;
  }

  return (
    <CourseScreen
      courseId={entry.id}
      course={entry.course}
      externalUrl={entry.externalUrl}
      milestoneId={milestone}
      moduleId={module}
    />
  );
}
