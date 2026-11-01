"use client";

import { createContext, useContext } from "react";
import type { CourseLayoutOptions } from "@/components/modules/course-shell/course-layout";
import type { CourseSummary } from "@/lib/data/course-modules";

export interface LiveCourseValue {
  courseId: string;
  course: CourseSummary;
  layout: CourseLayoutOptions;
  refetchProgress: () => void;
}

const LiveCourseContext = createContext<LiveCourseValue | null>(null);

export const LiveCourseProvider = LiveCourseContext.Provider;

/** The course (with live progress) of the CourseShell this component sits in. */
export function useLiveCourseContext(): LiveCourseValue {
  const value = useContext(LiveCourseContext);
  if (!value)
    throw new Error("useLiveCourseContext must be used inside CourseShell");
  return value;
}

/** Same as useLiveCourseContext, but returns null instead of throwing when there's no CourseShell above (e.g. a page rendered outside a course). */
export function useOptionalLiveCourseContext(): LiveCourseValue | null {
  return useContext(LiveCourseContext);
}
