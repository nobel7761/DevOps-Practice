"use client";

import { useCallback, useEffect, useState } from "react";
import client from "@/lib/api/client";
import { collectNotableContentIds } from "@/lib/data/collect-content-ids";
import type { CourseSummary } from "@/lib/data/course-modules";
import { mergeNotesIntoCourse } from "@/lib/data/merge-notes";
import { mergeProgressIntoCourse } from "@/lib/data/merge-progress";

/** The course with the learner's completed items and notes merged in once they load, plus a way to re-pull progress on demand (e.g. right after marking something complete). */
export function useLiveCourse(course: CourseSummary): {
  liveCourse: CourseSummary;
  refetchProgress: () => void;
} {
  const [liveCourse, setLiveCourse] = useState(course);

  const fetchProgress = useCallback(() => {
    let cancelled = false;
    client
      .get<{ completedKeys: string[] }>("/progress")
      .then((res) => {
        if (cancelled) return;
        setLiveCourse((current) =>
          mergeProgressIntoCourse(current, new Set(res.data.completedKeys)),
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => fetchProgress(), [course, fetchProgress]);

  useEffect(() => {
    const contentIds = collectNotableContentIds(course);
    if (contentIds.length === 0) return;
    let cancelled = false;
    client
      .get<string[]>("/notes", { params: { contentIds: contentIds.join(",") } })
      .then((res) => {
        if (cancelled) return;
        setLiveCourse((current) =>
          mergeNotesIntoCourse(current, new Set(res.data)),
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [course]);

  const refetchProgress = useCallback(() => {
    fetchProgress();
  }, [fetchProgress]);

  return { liveCourse, refetchProgress };
}
