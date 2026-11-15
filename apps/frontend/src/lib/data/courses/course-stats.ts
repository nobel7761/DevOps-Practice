import type { CourseSummary } from "@/lib/data/course-modules";
import { mergeProgressIntoCourse } from "@/lib/data/merge-progress";
import { formatTotalDuration } from "./duration";

export interface CourseStats {
  milestones: number;
  modules: number;
  items: number;
  done: number;
  percent: number;
  duration: string | null;
}

/** Counts + live completion for one course, for the home-page cards and totals. */
export function getCourseStats(
  course: CourseSummary,
  completedKeys: Set<string>,
): CourseStats {
  const merged = mergeProgressIntoCourse(course, completedKeys);
  let modules = 0;
  let items = 0;
  let done = 0;
  for (const milestone of merged.milestones) {
    modules += milestone.modules.length;
    for (const mod of milestone.modules) {
      items += mod.contents.length;
      done += mod.contents.filter((c) => c.completed).length;
    }
  }
  return {
    milestones: merged.milestones.length,
    modules,
    items,
    done,
    percent: items ? Math.round((done / items) * 100) : 0,
    duration: formatTotalDuration(course),
  };
}
