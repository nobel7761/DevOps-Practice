import type { CourseStats } from "@/lib/data/courses/course-stats";
import type { CourseRegistryEntry } from "@/lib/data/courses/registry";
import CourseCard from "./CourseCard";

export interface CourseRow {
  entry: CourseRegistryEntry;
  stats: CourseStats;
  /** Position in the user's full list, so a course keeps its cover while filtering. */
  index: number;
}

export default function CourseGrid({ rows }: { rows: CourseRow[] }) {
  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {rows.map(({ entry, stats, index }) => (
        <li key={entry.id}>
          <CourseCard entry={entry} stats={stats} index={index} />
        </li>
      ))}
    </ul>
  );
}
