"use client";

import CourseHero from "@/components/modules/CourseHero";
import CareerOutlookCard from "@/components/modules/course-shell/CareerOutlookCard";
import { findContinueHref } from "@/components/modules/course-shell/find-continue-href";
import { useLiveCourseContext } from "@/components/modules/course-shell/LiveCourseContext";

/** Course page before a module is picked: the course hero, centred in the free space. */
export default function CourseLanding({
  externalUrl,
}: {
  externalUrl?: string;
}) {
  const { course, layout } = useLiveCourseContext();
  const { milestones } = course;
  const moduleCount = milestones.reduce((sum, m) => sum + m.modules.length, 0);
  const contents = milestones.flatMap((m) =>
    m.modules.flatMap((mod) => mod.contents),
  );
  const completedCount = contents.filter((item) => item.completed).length;

  return (
    <div className="flex min-h-[calc(100svh-3rem)] items-center justify-center px-4 py-8 sm:px-8">
      <div className="w-full max-w-5xl">
        <CourseHero
          courseTitle={course.courseTitle}
          milestoneCount={milestones.length}
          moduleCount={moduleCount}
          completedCount={completedCount}
          totalCount={contents.length}
          continueHref={findContinueHref(milestones)}
          externalUrl={externalUrl}
          contentDetailsHref={
            course.courseId
              ? `/course/${course.courseId}/content-details`
              : undefined
          }
          notEnrolled={course.notEnrolled}
          aside={
            layout.careerOutlook && (
              <CareerOutlookCard outlook={layout.careerOutlook} />
            )
          }
        />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          {layout.topicTree
            ? "বাম পাশের sidebar থেকে milestone → module খুলে topic বেছে নিন।"
            : "বাম পাশের sidebar থেকে একটা milestone খুলে module বেছে নিন।"}
        </p>
      </div>
    </div>
  );
}
