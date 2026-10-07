import CourseHero from "@/components/modules/CourseHero";
import MilestoneTabsSection from "@/components/modules/MilestoneTabsSection";
import type { CourseMilestone, CourseSummary } from "@/lib/data/course-modules";

function findContinueHref(milestones: CourseMilestone[]): string | null {
  for (const milestone of milestones) {
    for (const courseModule of milestone.modules) {
      for (const content of courseModule.contents) {
        if (content.completed) continue;
        if (content.type === "lab" && content.labId) {
          return `/module/lab/${content.labId}`;
        }
        if (
          (content.type === "live_class" || content.type === "pre_class") &&
          content.videoUrl &&
          content.contentId
        ) {
          return `/module/video/${content.contentId}`;
        }
      }
    }
  }
  return null;
}

export default function ModulesScreen({
  course,
  externalUrl,
  defaultMilestoneId,
  defaultModuleId,
}: {
  course: CourseSummary;
  externalUrl?: string;
  defaultMilestoneId?: string;
  defaultModuleId?: string;
}) {
  const { courseTitle, milestones } = course;
  const totalModules = milestones.reduce((sum, m) => sum + m.modules.length, 0);
  const allContents = milestones.flatMap((m) =>
    m.modules.flatMap((mod) => mod.contents),
  );
  const completedCount = allContents.filter((item) => item.completed).length;

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-8 sm:px-8 sm:py-12">
      <CourseHero
        courseTitle={courseTitle}
        milestoneCount={milestones.length}
        moduleCount={totalModules}
        completedCount={completedCount}
        totalCount={allContents.length}
        continueHref={findContinueHref(milestones)}
        externalUrl={externalUrl}
      />
      <MilestoneTabsSection
        milestones={milestones}
        defaultMilestoneId={defaultMilestoneId}
        defaultModuleId={defaultModuleId}
      />
    </main>
  );
}
