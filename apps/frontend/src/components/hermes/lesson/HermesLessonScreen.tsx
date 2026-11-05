import { ExternalLink } from "lucide-react";
import ModuleBreadcrumb from "@/components/modules/ModuleBreadcrumb";
import MarkCompleteButton from "@/components/shared/MarkCompleteButton";
import type { CourseMilestone, CourseModule } from "@/lib/data/course-modules";
import type { HermesLesson } from "@/lib/data/hermes/lesson.types";
import HermesLessonComingSoon from "./HermesLessonComingSoon";
import HermesLessonTabs from "./HermesLessonTabs";
import InlineCode from "./InlineCode";

export default function HermesLessonScreen({
  courseId,
  milestone,
  module,
  contentId,
  title,
  lesson,
}: {
  courseId: string;
  milestone: CourseMilestone;
  module: CourseModule;
  contentId: string;
  title: string;
  lesson: HermesLesson | null;
}) {
  return (
    <div className="mx-auto w-[95%] max-w-none py-8 sm:py-12">
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
      <div className="mb-2 flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold">{title}</h1>
        <MarkCompleteButton contentKey={contentId} type="video" />
      </div>
      {lesson && (
        <div className="mb-4 flex flex-col gap-1 text-sm text-muted-foreground">
          <p>
            <InlineCode text={lesson.oneLiner} />
          </p>
          <a
            href={lesson.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 hover:underline"
          >
            <ExternalLink className="size-3" />
            Official documentation
          </a>
        </div>
      )}
      {lesson ? (
        <HermesLessonTabs lesson={lesson} />
      ) : (
        <HermesLessonComingSoon />
      )}
    </div>
  );
}
