import Markdown from "@/components/shared/Markdown";
import LessonDiagramSlot from "@/components/system-design/lesson/LessonDiagramSlot";
import type {
  LessonMeta,
  LessonProseSection,
} from "@/lib/system-design/lesson.types";

export default function LessonProse({
  content,
  meta,
}: {
  content: LessonProseSection;
  meta?: LessonMeta;
}) {
  return (
    <div>
      <Markdown>{content.markdown}</Markdown>
      {content.diagrams?.map((diagram) => (
        <LessonDiagramSlot key={diagram.id} diagram={diagram} meta={meta} />
      ))}
    </div>
  );
}
