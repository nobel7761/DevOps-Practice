"use client";

import { useEffect, useState } from "react";
import ModulesScreen from "@/components/modules/ModulesScreen";
import client from "@/lib/api/client";
import { collectNotableContentIds } from "@/lib/data/collect-content-ids";
import type { CourseSummary } from "@/lib/data/course-modules";
import { mergeNotesIntoCourse } from "@/lib/data/merge-notes";
import { mergeProgressIntoCourse } from "@/lib/data/merge-progress";

export default function CourseWithLiveProgress({
  course,
  externalUrl,
  defaultMilestoneId,
  defaultModuleId,
}: {
  course: CourseSummary;
  externalUrl?: string;
  defaultMilestoneId?: string;
  defaultModuleId?: string;
}) {
  const [liveCourse, setLiveCourse] = useState(course);

  useEffect(() => {
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
  }, [course]);

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

  return (
    <ModulesScreen
      course={liveCourse}
      externalUrl={externalUrl}
      defaultMilestoneId={defaultMilestoneId}
      defaultModuleId={defaultModuleId}
    />
  );
}
