import { ArrowRight, GraduationCap } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/shared/shadcn";
import { SD_OUTLINE, SD_TOTAL_DAYS, SD_WRITTEN_COUNT } from "./sd-outline";
import { SdStudyGuide } from "./SdStudyGuide";

function OverviewHero() {
  const firstReady = SD_OUTLINE.flatMap((p) => p.days).find((d) => d.written);
  return (
    <div>
      <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold tracking-wide text-primary uppercase">
        <GraduationCap className="size-3.5" /> Own course
      </div>
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        System Design A-Z
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        শূন্য থেকে industry-level system design, পুরোপুরি বাংলায়। ১৫টা phase,{" "}
        {SD_TOTAL_DAYS}টা topic; প্রতিদিন একটা।
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-4">
        {firstReady?.href && (
          <Button asChild>
            <Link href={firstReady.href}>
              পড়া শুরু করুন: Day {firstReady.day} <ArrowRight />
            </Link>
          </Button>
        )}
        <span className="text-sm text-muted-foreground">
          {SD_WRITTEN_COUNT}/{SD_TOTAL_DAYS} lesson ready
        </span>
      </div>
    </div>
  );
}

/** Course landing before a topic is picked: intro and study guide, centred in the free space; days live in the sidebar. */
export function SdCourseOverview() {
  return (
    <div className="flex min-h-[calc(100svh-3rem)] items-center justify-center px-4 py-8 sm:px-8">
      <section className="w-full max-w-4xl rounded-3xl border border-border bg-linear-to-br from-primary/20 via-primary/5 to-transparent p-6 sm:p-10">
        <OverviewHero />
        <SdStudyGuide />
      </section>
    </div>
  );
}
