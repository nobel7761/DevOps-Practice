import { resolveContentHref } from "@/lib/data/content-href";
import type { CourseMilestone } from "@/lib/data/course-modules";
import { hasInterview } from "@/lib/data/interview-modules";

/** Link to the first unfinished item that has a page of its own, or null when there is none. */
export function findContinueHref(milestones: CourseMilestone[]): string | null {
  for (const milestone of milestones) {
    for (const courseModule of milestone.modules) {
      for (const content of courseModule.contents) {
        if (content.completed) continue;
        const href = resolveContentHref(content, courseModule.id, hasInterview);
        if (href) return href;
      }
    }
  }
  return null;
}
