import SyncedModuleSection from "@/components/modules/content-details/SyncedModuleSection";
import type { SyncedCourseData } from "@/components/modules/content-details/content-details.types";

export default function SyncedContentTree({
  course,
}: {
  course: SyncedCourseData;
}) {
  return (
    <div className="flex flex-col gap-6">
      {course.milestones.map((milestone) => (
        <div key={milestone.id}>
          <h3 className="mb-2 font-semibold">{milestone.title}</h3>
          <div className="flex flex-col gap-3 border-l border-border pl-3">
            {milestone.modules.map((module) => (
              <SyncedModuleSection key={module.id} module={module} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
