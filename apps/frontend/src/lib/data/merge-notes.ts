import type { CourseSummary } from "./course-modules";

/** Overlays which content items have a saved note onto the static course data. */
export function mergeNotesIntoCourse(
  course: CourseSummary,
  notedContentIds: Set<string>,
): CourseSummary {
  return {
    ...course,
    milestones: course.milestones.map((milestone) => ({
      ...milestone,
      modules: milestone.modules.map((courseModule) => ({
        ...courseModule,
        contents: courseModule.contents.map((item) => {
          if (!item.contentId || !notedContentIds.has(item.contentId)) {
            return item;
          }
          return { ...item, hasNote: true };
        }),
      })),
    })),
  };
}
