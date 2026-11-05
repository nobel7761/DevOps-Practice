import ModuleBreadcrumb from "@/components/modules/ModuleBreadcrumb";
import type { CourseMilestone, CourseModule } from "@/lib/data/course-modules";
import AnalyticsScreen from "./AnalyticsScreen";

export default function CcdvAnalyticsPage({
  courseId,
  milestone,
  module,
}: {
  courseId: string;
  milestone: CourseMilestone;
  module: CourseModule;
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
          { label: "Analytics" },
        ]}
      />
      <h1 className="mb-4 text-xl font-bold">Mock Exam Results ও Analytics</h1>
      <AnalyticsScreen />
    </div>
  );
}
