import { GraduationCap } from "lucide-react";

export default function CourseListHero({
  courseCount,
}: {
  courseCount: number;
}) {
  return (
    <section className="relative mb-8 overflow-hidden rounded-3xl border border-border bg-linear-to-br from-primary/20 via-primary/5 to-transparent p-8 sm:p-12">
      <div className="pointer-events-none absolute -top-24 -right-24 size-72 rounded-full bg-primary/20 blur-3xl" />
      <div className="relative max-w-xl">
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
          <GraduationCap className="size-3.5" /> My Courses
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Your learning library
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {courseCount} courses tracked in one place.
        </p>
      </div>
    </section>
  );
}
