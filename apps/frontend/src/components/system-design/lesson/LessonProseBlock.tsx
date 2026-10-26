import LessonProse from "@/components/system-design/lesson/LessonProse";
import LessonSection from "@/components/system-design/lesson/LessonSection";
import type { LessonSectionKey } from "@/components/system-design/lesson/lesson-sections";
import type {
  LessonMeta,
  LessonProseSection,
} from "@/lib/system-design/lesson.types";

/** A lesson section that's just markdown + diagrams (problem, analogy, core concept, industry, connections). */
export default function LessonProseBlock({
  section,
  content,
  meta,
}: {
  section: LessonSectionKey;
  content: LessonProseSection;
  meta?: LessonMeta;
}) {
  return (
    <LessonSection section={section}>
      <LessonProse content={content} meta={meta} />
    </LessonSection>
  );
}
