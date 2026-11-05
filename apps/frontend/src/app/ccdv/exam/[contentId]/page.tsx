import { notFound } from "next/navigation";
import CcdvExamPage from "@/components/ccdv/exam/CcdvExamPage";
import ModulePageShell from "@/components/modules/course-shell/ModulePageShell";
import { findContentLocation } from "@/lib/data/course-modules";
import { getCcdvExam } from "@/lib/data/ccdv/loader";
import { parseExamContentId } from "@/lib/data/ccdv/schedule";

export default async function CcdvExamRoute({
  params,
}: {
  params: Promise<{ contentId: string }>;
}) {
  const { contentId } = await params;
  const number = parseExamContentId(contentId);
  const location = findContentLocation(contentId);
  if (number === null || !location) notFound();

  return (
    <ModulePageShell courseId={location.courseId} moduleId={location.module.id}>
      <CcdvExamPage
        courseId={location.courseId}
        milestone={location.milestone}
        module={location.module}
        number={number}
        contentId={contentId}
        exam={getCcdvExam(number)}
      />
    </ModulePageShell>
  );
}
