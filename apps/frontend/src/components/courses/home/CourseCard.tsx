import Link from "next/link";
import { ArrowRight, Clock, Layers, PlayCircle } from "lucide-react";
import { Badge, Progress } from "@/components/shared/shadcn";
import type { CourseStats } from "@/lib/data/courses/course-stats";
import type { CourseRegistryEntry } from "@/lib/data/courses/registry";
import CourseCover from "./CourseCover";

const PLATFORM_LABELS: Record<CourseRegistryEntry["platform"], string> = {
  poridhi: "Poridhi",
  udemy: "Udemy",
  own: "Original",
};

function ctaLabel(stats: CourseStats) {
  if (stats.percent >= 100) return "Review course";
  return stats.done > 0 ? "Continue" : "Start learning";
}

function CardMeta({ stats }: { stats: CourseStats }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
      <li className="flex items-center gap-1">
        <Layers className="size-3.5" /> {stats.modules} modules
      </li>
      <li className="flex items-center gap-1">
        <PlayCircle className="size-3.5" /> {stats.items} lessons
      </li>
      {stats.duration && (
        <li className="flex items-center gap-1">
          <Clock className="size-3.5" /> {stats.duration}
        </li>
      )}
    </ul>
  );
}

function CardProgress({ stats }: { stats: CourseStats }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">
          {stats.done}/{stats.items} completed
        </span>
        <span className="font-semibold">{stats.percent}%</span>
      </div>
      <Progress value={stats.percent} className="h-1.5" />
    </div>
  );
}

export default function CourseCard({
  entry,
  stats,
  index,
}: {
  entry: CourseRegistryEntry;
  stats: CourseStats;
  index: number;
}) {
  return (
    <Link
      href={`/course/${entry.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-lg"
    >
      <CourseCover index={index} />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{PLATFORM_LABELS[entry.platform]}</Badge>
          {entry.course.notEnrolled && (
            <Badge
              variant="outline"
              className="text-amber-600 dark:text-amber-400"
            >
              Outline only
            </Badge>
          )}
        </div>
        <h3 className="line-clamp-2 text-base leading-snug font-semibold">
          {entry.course.courseTitle}
        </h3>
        <CardMeta stats={stats} />
        <div className="mt-auto space-y-4 pt-2">
          <CardProgress stats={stats} />
          <span className="flex items-center gap-1 text-sm font-medium text-primary">
            {ctaLabel(stats)}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
