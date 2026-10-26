import ModulePageShell from "@/components/modules/course-shell/ModulePageShell";
import { notFound } from "next/navigation";
import LabDetailScreen from "@/components/modules/lab/LabDetailScreen";
import { getLabContent } from "@/lib/data/lab-content";
import { findLabLocation } from "@/lib/data/course-modules";

export default async function LabPage({
  params,
}: {
  params: Promise<{ labId: string }>;
}) {
  const { labId } = await params;
  const lab = getLabContent(labId);
  const location = findLabLocation(labId);

  if (!lab || !location) {
    notFound();
  }

  return (
    <ModulePageShell courseId={location.courseId} moduleId={location.module.id}>
      <LabDetailScreen
        lab={lab}
        courseId={location.courseId}
        milestone={location.milestone}
        module={location.module}
      />
    </ModulePageShell>
  );
}
