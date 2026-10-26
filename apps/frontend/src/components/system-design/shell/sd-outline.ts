// The course outline as the sidebar needs it: phases → days, with whether each
// day's lesson is written yet and where it links to.

import type { CourseModuleTag } from "@/lib/data/course-modules";
import { systemDesignAToZCourse } from "@/lib/data/courses/system-design-a-z";
import { WRITTEN_TOPIC_IDS } from "@/lib/data/system-design/written-topics";

export interface OutlineDay {
  topicId: string;
  day: number;
  title: string;
  tags: CourseModuleTag[];
  written: boolean;
  href: string | null;
}

export interface OutlinePhase {
  id: string;
  title: string;
  days: OutlineDay[];
}

export const SD_OUTLINE: OutlinePhase[] = systemDesignAToZCourse.milestones.map(
  (phase) => ({
    id: phase.id,
    title: phase.title,
    days: phase.modules.map((module) => {
      const written = WRITTEN_TOPIC_IDS.has(module.id);
      return {
        topicId: module.id,
        day: Number(module.id.slice(-3)),
        title: module.title.replace(/^Day \d+ · /, ""),
        tags: module.tags ?? [],
        written,
        href: written ? `/system-design/lesson/${module.id}` : null,
      };
    }),
  }),
);

export const SD_WRITTEN_COUNT = SD_OUTLINE.reduce(
  (sum, p) => sum + p.days.filter((d) => d.written).length,
  0,
);
export const SD_TOTAL_DAYS = SD_OUTLINE.reduce(
  (sum, p) => sum + p.days.length,
  0,
);
