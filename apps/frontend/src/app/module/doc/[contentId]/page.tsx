import ModulePageShell from "@/components/modules/course-shell/ModulePageShell";
import { notFound } from "next/navigation";
import HermesLessonScreen from "@/components/hermes/lesson/HermesLessonScreen";
import { findContentLocation } from "@/lib/data/course-modules";
import { getHermesLesson } from "@/lib/data/hermes/lessons";

export default async function HermesDocPage({
  params,
}: {
  params: Promise<{ contentId: string }>;
}) {
  const { contentId } = await params;
  const location = findContentLocation(contentId);
  if (!location) notFound();

  return (
    <ModulePageShell courseId={location.courseId} moduleId={location.module.id}>
      <HermesLessonScreen
        courseId={location.courseId}
        milestone={location.milestone}
        module={location.module}
        contentId={contentId}
        title={location.content.title ?? "Lesson"}
        lesson={getHermesLesson(contentId)}
      />
    </ModulePageShell>
  );
}
