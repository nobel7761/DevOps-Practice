import { notFound } from "next/navigation";
import InterviewScreen from "@/components/modules/interview/InterviewScreen";
import { findModuleLocation } from "@/lib/data/course-modules";
import { hasInterview } from "@/lib/data/interview-modules";

export default async function ModuleInterviewPage({
  params,
}: {
  params: Promise<{ moduleId: string }>;
}) {
  const { moduleId } = await params;
  const location = findModuleLocation(moduleId);

  if (!location || !hasInterview(moduleId)) {
    notFound();
  }

  return (
    <InterviewScreen
      moduleId={moduleId}
      milestone={location.milestone}
      module={location.module}
    />
  );
}
