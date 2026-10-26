import { BookOpenText, ListChecks } from "lucide-react";
import ModuleBreadcrumb from "@/components/modules/ModuleBreadcrumb";
import LabComingSoonPanel from "@/components/modules/lab/LabComingSoonPanel";
import VideoCompanionPanel from "@/components/modules/video/VideoCompanionPanel";
import MarkCompleteButton from "@/components/shared/MarkCompleteButton";
import type { CourseMilestone, CourseModule } from "@/lib/data/course-modules";
import { getVideoAskContext } from "@/lib/data/video-ask-context";

export default function StoryDetailScreen({
  courseId,
  milestone,
  module,
  contentId,
  title,
  markdown,
}: {
  courseId: string;
  milestone: CourseMilestone;
  module: CourseModule;
  contentId: string;
  title: string;
  markdown: string | null;
}) {
  const askContext = getVideoAskContext(contentId);

  return (
    <div className="mx-auto w-[95%] max-w-4xl py-8 sm:py-12">
      <ModuleBreadcrumb
        items={[
          { label: "Home", href: "/" },
          {
            label: milestone.title,
            href: `/course/${courseId}?milestone=${milestone.id}`,
          },
          {
            label: module.title,
            href: `/course/${courseId}?milestone=${milestone.id}&module=${module.id}`,
          },
          { label: title },
        ]}
      />

      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">{title}</h1>
        <MarkCompleteButton contentKey={contentId} type="video" />
      </div>

      {markdown ? (
        <VideoCompanionPanel
          contentId={contentId}
          videoTitle={title}
          markdown={markdown}
          labs={askContext.labs}
          moduleId={askContext.moduleId}
          hasInterview={askContext.hasInterview}
        />
      ) : (
        <div className="flex flex-col gap-4">
          <LabComingSoonPanel
            icon={BookOpenText}
            title="বাংলা Golpo Lesson"
            description="এই topic-টা beginner থেকে advanced level পর্যন্ত গল্প আকারে বাংলায় ব্যাখ্যা করা হবে এখানে।"
          />
          <LabComingSoonPanel
            icon={ListChecks}
            title="Quiz"
            description="এই topic নিয়ে MCQ quiz — pass mark 95%।"
          />
        </div>
      )}
    </div>
  );
}
