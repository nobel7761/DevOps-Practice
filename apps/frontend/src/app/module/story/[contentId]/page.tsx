import ModulePageShell from "@/components/modules/course-shell/ModulePageShell";
import { notFound } from "next/navigation";
import StoryDetailScreen from "@/components/modules/story/StoryDetailScreen";
import { findContentLocation } from "@/lib/data/course-modules";
import { getVideoGolpo } from "@/lib/data/video-golpo";

export default async function StoryPage({
  params,
}: {
  params: Promise<{ contentId: string }>;
}) {
  const { contentId } = await params;
  const location = findContentLocation(contentId);

  if (!location) {
    notFound();
  }

  const golpo = getVideoGolpo(contentId);

  return (
    <ModulePageShell courseId={location.courseId} moduleId={location.module.id}>
      <StoryDetailScreen
        courseId={location.courseId}
        milestone={location.milestone}
        module={location.module}
        contentId={contentId}
        title={location.content.title ?? golpo?.title ?? "Lesson"}
        markdown={golpo?.markdown ?? null}
      />
    </ModulePageShell>
  );
}
