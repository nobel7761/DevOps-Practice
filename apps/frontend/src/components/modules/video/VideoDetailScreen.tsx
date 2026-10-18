import ModuleBreadcrumb from "@/components/modules/ModuleBreadcrumb";
import VideoWithCompanion from "@/components/modules/video/VideoWithCompanion";
import type { CourseMilestone, CourseModule } from "@/lib/data/course-modules";
import { getVideoAskContext } from "@/lib/data/video-ask-context";
import { getVideoGolpo } from "@/lib/data/video-golpo";

export default function VideoDetailScreen({
  milestone,
  module,
  contentId,
  title,
  videoUrl,
}: {
  milestone: CourseMilestone;
  module: CourseModule;
  contentId: string;
  title: string;
  videoUrl: string;
}) {
  const golpo = getVideoGolpo(contentId);
  const askContext = getVideoAskContext(contentId);

  return (
    <main className="mx-auto w-[95%] max-w-[1920px] py-8 sm:py-12">
      <ModuleBreadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: milestone.title, href: `/?milestone=${milestone.id}` },
          {
            label: module.title,
            href: `/?milestone=${milestone.id}&module=${module.id}`,
          },
          { label: title },
        ]}
      />
      <VideoWithCompanion
        contentId={contentId}
        title={title}
        videoUrl={videoUrl}
        golpoMarkdown={golpo?.markdown ?? null}
        labs={askContext.labs}
        moduleId={askContext.moduleId}
        hasInterview={askContext.hasInterview}
      />
    </main>
  );
}
