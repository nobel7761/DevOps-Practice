import { notFound } from "next/navigation";
import ModulesScreen from "@/components/modules/ModulesScreen";
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
    <ModulesScreen
      course={entry.course}
      externalUrl={entry.externalUrl}
      defaultMilestoneId={milestone}
      defaultModuleId={module}
    />
  );
}
