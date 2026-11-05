import { notFound } from "next/navigation";
import CcdvLessonScreen from "@/components/ccdv/lesson/CcdvLessonScreen";
import ModulePageShell from "@/components/modules/course-shell/ModulePageShell";
import { findContentLocation } from "@/lib/data/course-modules";
import { getCcdvChapter } from "@/lib/data/ccdv/loader";
import { getChapter, parseLessonContentId } from "@/lib/data/ccdv/schedule";

export default async function CcdvLessonPage({
  params,
}: {
  params: Promise<{ contentId: string }>;
}) {
  const { contentId } = await params;
  const parsed = parseLessonContentId(contentId);
  const location = findContentLocation(contentId);
  const chapter = parsed ? getChapter(parsed.chapterId) : undefined;
  if (!parsed || !location || !chapter) notFound();

  return (
    <ModulePageShell courseId={location.courseId} moduleId={location.module.id}>
      <CcdvLessonScreen
        courseId={location.courseId}
        milestone={location.milestone}
        module={location.module}
        chapter={chapter}
        part={parsed.part}
        content={getCcdvChapter(chapter.id)}
      />
    </ModulePageShell>
  );
}
