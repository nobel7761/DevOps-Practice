import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";
import StatTile from "@/components/modules/StatTile";

export default function CourseHero({
  courseTitle,
  milestoneCount,
  moduleCount,
  completedCount,
  totalCount,
  continueHref,
}: {
  courseTitle: string;
  milestoneCount: number;
  moduleCount: number;
  completedCount: number;
  totalCount: number;
  continueHref: string | null;
}) {
  const overallPercent = totalCount
    ? Math.round((completedCount / totalCount) * 100)
    : 0;

  return (
    <section className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-linear-to-br from-primary/20 via-primary/5 to-transparent p-8 sm:p-12">
      <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-12 size-64 rounded-full bg-primary/10 blur-3xl" />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
            <GraduationCap className="size-3.5" /> Career Track
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {courseTitle}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {milestoneCount} milestones · {moduleCount} modules
          </p>
          {continueHref && (
            <Link
              href={continueHref}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-transform hover:scale-[1.03]"
            >
              Continue Learning <ArrowRight className="size-4" />
            </Link>
          )}
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <StatTile value={`${overallPercent}%`} label="Overall" ring />
          <StatTile value={String(moduleCount)} label="Modules" />
          <StatTile value={String(completedCount)} label="Completed" />
        </div>
      </div>
    </section>
  );
}
