"use client";

import { useMemo, useState } from "react";
import Loader from "@/components/shared/Loader";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessCourse } from "@/lib/auth/access";
import { getCourseStats } from "@/lib/data/courses/course-stats";
import { courseRegistry } from "@/lib/data/courses/registry";
import ContinueLearning, { pickContinueRow } from "./ContinueLearning";
import CourseFilters, { type PlatformFilter } from "./CourseFilters";
import CourseGrid, { type CourseRow } from "./CourseGrid";
import EmptyState from "./EmptyState";
import ServerUnavailable from "./ServerUnavailable";
import HomeHero from "./HomeHero";
import HomeStats from "./HomeStats";
import { useCompletedKeys } from "./useCompletedKeys";

/** The user's assigned courses with live progress. */
function useCourseRows(): CourseRow[] | null {
  const { user } = useAuth();
  const completed = useCompletedKeys();
  return useMemo(() => {
    if (!user || !completed) return null;
    return courseRegistry
      .filter((e) => canAccessCourse(user, e.id))
      .map((entry, index) => ({
        entry,
        index,
        stats: getCourseStats(entry.course, completed),
      }));
  }, [user, completed]);
}

function CourseBrowser({ rows }: { rows: CourseRow[] }) {
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const visible = rows.filter(
    (r) =>
      (platform === "all" || r.entry.platform === platform) &&
      r.entry.course.courseTitle
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  return (
    <section className="space-y-5">
      <CourseFilters
        query={query}
        onQuery={setQuery}
        platform={platform}
        onPlatform={setPlatform}
      />
      {visible.length ? (
        <CourseGrid rows={visible} />
      ) : (
        <EmptyState
          title="No courses match"
          hint="Try a different search or switch the filter back to All."
        />
      )}
    </section>
  );
}

function HomeBody({ rows }: { rows: CourseRow[] }) {
  const continueRow = pickContinueRow(rows);
  if (!rows.length) {
    return (
      <EmptyState
        title="No courses assigned yet"
        hint="The admin hasn't assigned any course to your account. Check back soon."
      />
    );
  }
  return (
    <>
      {continueRow && <ContinueLearning row={continueRow} />}
      <CourseBrowser rows={rows} />
    </>
  );
}

function HomeContent({ rows }: { rows: CourseRow[] | null }) {
  const { user, loading } = useAuth();
  if (rows) return <HomeBody rows={rows} />;
  // Auth finished but there is no user: a 401 would already have redirected to /login, so the API is down.
  if (!loading && !user) {
    return <ServerUnavailable onRetry={() => window.location.reload()} />;
  }
  return <Loader className="mx-auto mt-16" />;
}

export default function CourseHome() {
  const rows = useCourseRows();
  return (
    <main className="mx-auto max-w-7xl space-y-8 px-4 pt-20 pb-16 sm:px-8">
      <HomeHero courseCount={rows?.length ?? 0}>
        {rows && <HomeStats rows={rows} />}
      </HomeHero>
      <HomeContent rows={rows} />
    </main>
  );
}
