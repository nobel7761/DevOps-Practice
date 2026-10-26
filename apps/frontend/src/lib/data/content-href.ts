import type { CourseContentItem } from "./course-modules";

/** Decides which in-app route (if any) a content item's row should link to. */
export function resolveContentHref(
  item: CourseContentItem,
  moduleId: string,
  hasInterview: (moduleId: string) => boolean,
): string | null {
  if (item.type === "lab") {
    return item.labId ? `/module/lab/${item.labId}` : null;
  }

  if (item.type === "live_class" || item.type === "pre_class") {
    if (!item.contentId) return null;
    return item.videoUrl
      ? `/module/video/${item.contentId}`
      : `/module/story/${item.contentId}`;
  }

  if (item.type === "sd_lesson") {
    return item.contentId ? `/system-design/lesson/${item.contentId}` : null;
  }

  if (item.type === "ai_interview") {
    return hasInterview(moduleId) ? `/module/interview/${moduleId}` : null;
  }

  return null;
}
