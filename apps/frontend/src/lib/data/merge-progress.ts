import type { CourseSummary } from "./course-modules";

/** Overlays live DB completion onto the static course data — never un-marks something already completed. */
export function mergeProgressIntoCourse(
  course: CourseSummary,
  completedKeys: Set<string>,
): CourseSummary {
  return {
    ...course,
    milestones: course.milestones.map((milestone) => ({
      ...milestone,
      modules: milestone.modules.map((courseModule) => ({
        ...courseModule,
        contents: courseModule.contents.map((item) => {
          if (item.completed) return item;
          const key =
            item.type === "lab"
              ? item.labId
              : item.type === "ai_interview"
                ? courseModule.id
                : item.contentId;
          if (!key || !completedKeys.has(key)) return item;
          return { ...item, completed: true };
        }),
      })),
    })),
  };
}
