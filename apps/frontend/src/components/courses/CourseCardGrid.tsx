import CourseCard from "@/components/courses/CourseCard";
import type { CourseRegistryEntry } from "@/lib/data/courses/registry";

export default function CourseCardGrid({
  entries,
}: {
  entries: CourseRegistryEntry[];
}) {
  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {entries.map((entry) => (
        <li key={entry.id}>
          <CourseCard entry={entry} />
        </li>
      ))}
    </ul>
  );
}
