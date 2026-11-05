import { notFound } from "next/navigation";
import CcdvAnalyticsPage from "@/components/ccdv/analytics/CcdvAnalyticsPage";
import ModulePageShell from "@/components/modules/course-shell/ModulePageShell";
import { findContentLocation } from "@/lib/data/course-modules";
import { ANALYTICS_CONTENT_ID } from "@/lib/data/ccdv/schedule";

export default function CcdvAnalyticsRoute() {
  const location = findContentLocation(ANALYTICS_CONTENT_ID);
  if (!location) notFound();
  return (
    <ModulePageShell courseId={location.courseId} moduleId={location.module.id}>
      <CcdvAnalyticsPage
        courseId={location.courseId}
        milestone={location.milestone}
        module={location.module}
      />
    </ModulePageShell>
  );
}
