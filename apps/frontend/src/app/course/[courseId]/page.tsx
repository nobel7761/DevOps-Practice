import { notFound } from "next/navigation";
import CourseWithLiveProgress from "@/components/modules/CourseWithLiveProgress";
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

  return (
    <CourseWithLiveProgress
      course={entry.course}
      externalUrl={entry.externalUrl}
      defaultMilestoneId={milestone}
      defaultModuleId={module}
    />
  );
}
