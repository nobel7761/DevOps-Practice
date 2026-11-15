import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Progress } from "@/components/shared/shadcn";
import type { CourseRow } from "./CourseGrid";
import { courseCover } from "./course-theme";

/** The course the user is furthest into (and hasn't finished). */
export function pickContinueRow(rows: CourseRow[]): CourseRow | null {
  const started = rows
    .filter((r) => r.stats.done > 0 && r.stats.percent < 100)
    .sort((a, b) => b.stats.percent - a.stats.percent);
  return started[0] ?? null;
}

export default function ContinueLearning({ row }: { row: CourseRow }) {
  const { gradient } = courseCover(row.index);
  return (
    <Link
      href={`/course/${row.entry.id}`}
      className="group flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow-md sm:flex-row sm:items-center"
    >
      <span
        className={`flex size-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br ${gradient} text-white`}
      >
        <PlayCircle className="size-7" />
      </span>
      <div className="min-w-0 flex-1 space-y-2">
        <p className="text-xs font-semibold tracking-wide text-primary uppercase">
          Continue learning
        </p>
        <h2 className="truncate text-lg font-semibold">
          {row.entry.course.courseTitle}
        </h2>
        <div className="flex items-center gap-3">
          <Progress value={row.stats.percent} className="h-2 max-w-sm" />
          <span className="text-xs text-muted-foreground">
            {row.stats.percent}% · {row.stats.done}/{row.stats.items} lessons
          </span>
        </div>
      </div>
      <span className="flex items-center gap-1 text-sm font-medium text-primary">
        Resume{" "}
        <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
