"use client";

import { createContext, useContext } from "react";
import type { CourseLayoutOptions } from "@/components/modules/course-shell/course-layout";
import type { CourseSummary } from "@/lib/data/course-modules";

export interface LiveCourseValue {
  courseId: string;
  course: CourseSummary;
  layout: CourseLayoutOptions;
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
