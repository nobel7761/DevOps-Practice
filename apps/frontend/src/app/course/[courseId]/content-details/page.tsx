import { notFound } from "next/navigation";
import ContentDetailsScreen from "@/components/modules/content-details/ContentDetailsScreen";
import { SYSTEM_DESIGN_A_Z_COURSE_ID } from "@/lib/data/courses/system-design-a-z";
import { getCourseEntry } from "@/lib/data/courses/registry";

export default async function ContentDetailsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const entry = getCourseEntry(courseId);

  // System Design A-Z is our own course; there's nothing to sync from poridhi.io.
  if (!entry || entry.id === SYSTEM_DESIGN_A_Z_COURSE_ID) {
    notFound();
  }

  return (
    <ContentDetailsScreen
      courseId={courseId}
      courseTitle={entry.course.courseTitle}
    />
  );
}
