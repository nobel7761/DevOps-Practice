"use client";

import type { ReactNode } from "react";
import Loader from "@/components/shared/Loader";
import { useAuth } from "@/contexts/AuthContext";
import { canAccessCourse } from "@/lib/auth/access";

/** Blocks a course page for users it wasn't assigned to. */
export default function CourseAccessGate({
  courseId,
  children,
}: {
  courseId: string;
  children: ReactNode;
}) {
  const { user, loading } = useAuth();
  if (loading) return <Loader className="mx-auto mt-24" />;
  if (!user || !canAccessCourse(user, courseId)) {
    return (
      <p className="mt-24 text-center text-muted-foreground">
        You don&apos;t have access to this course.
      </p>
    );
  }
  return <>{children}</>;
}
