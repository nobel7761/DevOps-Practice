import ModuleBreadcrumb from "@/components/modules/ModuleBreadcrumb";
import type { CourseMilestone, CourseModule } from "@/lib/data/course-modules";
import type { ChapterMeta } from "@/lib/data/ccdv/schedule";
import type { CcdvChapterContent, ChapterPart } from "@/lib/data/ccdv/types";
import ChapterHeader from "./ChapterHeader";
import ChapterTabs from "./ChapterTabs";
import ComingSoon from "./ComingSoon";

export default function CcdvLessonScreen({
  courseId,
  milestone,
  module,
  chapter,
  part,
  content,
}: {
  courseId: string;
  milestone: CourseMilestone;
  module: CourseModule;
  chapter: ChapterMeta;
  part: ChapterPart;
  content: CcdvChapterContent | null;
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
          { label: chapter.title },
        ]}
      />
      <h1 className="mb-3 text-xl font-bold">{chapter.title}</h1>
      <ChapterHeader chapter={chapter} />
      {content ? (
        <ChapterTabs
          chapterId={chapter.id}
          chapterTitle={chapter.title}
          content={content}
          initialPart={part}
        />
      ) : (
        <ComingSoon what={`"${chapter.title}" chapter`} />
      )}
    </div>
  );
}
