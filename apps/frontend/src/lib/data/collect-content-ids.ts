import type { CourseSummary } from "./course-modules";

/** Unique content ids across the whole course that can have a note attached (mirrors ModuleContentItemRow's canHaveNotes check). */
export function collectNotableContentIds(course: CourseSummary): string[] {
  const ids = new Set<string>();
  for (const milestone of course.milestones) {
    for (const courseModule of milestone.modules) {
      for (const item of courseModule.contents) {
        if (item.contentId) ids.add(item.contentId);
      }
    }
  }
  return [...ids];
}
