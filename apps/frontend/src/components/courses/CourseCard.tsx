import Link from "next/link";
import { Badge } from "@/components/shared/shadcn";
import { formatTotalDuration } from "@/lib/data/courses/duration";
import type { CourseRegistryEntry } from "@/lib/data/courses/registry";

const PLATFORM_LABELS: Record<CourseRegistryEntry["platform"], string> = {
  poridhi: "Poridhi",
  udemy: "Udemy",
};

export default function CourseCard({ entry }: { entry: CourseRegistryEntry }) {
  const { course, platform, id } = entry;
  const moduleCount = course.milestones.reduce(
    (sum, milestone) => sum + milestone.modules.length,
    0,
  );
  const lectureCount = course.milestones.reduce(
    (sum, milestone) =>
      sum + milestone.modules.reduce((s, mod) => s + mod.contents.length, 0),
    0,
  );
  const totalDuration = formatTotalDuration(course);

  return (
    <Link
      href={`/course/${id}`}
      className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2">
        <Badge variant="secondary" className="w-fit">
          {PLATFORM_LABELS[platform]}
        </Badge>
        {totalDuration && (
          <span className="shrink-0 text-xs text-muted-foreground">
            {totalDuration}
          </span>
        )}
      </div>
      <h3 className="line-clamp-2 text-sm font-semibold">
        {course.courseTitle}
      </h3>
      <p className="mt-auto text-xs text-muted-foreground">
        {course.milestones.length} milestones · {moduleCount} modules ·{" "}
        {lectureCount} items
      </p>
    </Link>
  );
}
