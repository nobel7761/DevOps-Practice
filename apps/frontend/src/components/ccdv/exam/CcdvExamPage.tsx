import ModuleBreadcrumb from "@/components/modules/ModuleBreadcrumb";
import type { CourseMilestone, CourseModule } from "@/lib/data/course-modules";
import type { CcdvExam } from "@/lib/data/ccdv/types";
import ComingSoon from "../lesson/ComingSoon";
import ExamScreen from "./ExamScreen";

export default function CcdvExamPage({
  courseId,
  milestone,
  module,
  number,
  contentId,
  exam,
}: {
  courseId: string;
  milestone: CourseMilestone;
  module: CourseModule;
  number: number;
  contentId: string;
  exam: CcdvExam | null;
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
          { label: `Mock Exam ${number}` },
        ]}
      />
      {exam ? (
        <ExamScreen key={exam.id} exam={exam} contentId={contentId} />
      ) : (
        <ComingSoon what={`Mock Exam ${number}-এর প্রশ্ন`} />
      )}
    </div>
  );
}
