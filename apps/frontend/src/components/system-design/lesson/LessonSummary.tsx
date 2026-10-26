import { DownloadableSummaryCard } from "@/components/shared/diagram";
import { findDiagram } from "@/components/system-design/diagram-registry";
import LessonDiagramSlot from "@/components/system-design/lesson/LessonDiagramSlot";
import LessonSection from "@/components/system-design/lesson/LessonSection";
import type { LessonMeta, SdLesson } from "@/lib/system-design/lesson.types";

const CARD_KEY_POINTS = 3;

function SummaryPoints({ points }: { points: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-6 text-foreground/85">
      {points.map((point) => (
        <li key={point}>{point}</li>
      ))}
    </ul>
  );
}

/** Section 15: key takeaways, plus the downloadable "এক নজরে" card when the summary diagram exists. */
export default function LessonSummary({
  summary,
  meta,
}: {
  summary: SdLesson["summary"];
  meta?: LessonMeta;
}) {
  const entry = summary.diagram && findDiagram(summary.diagram.id);
  return (
    <LessonSection section="summary">
      <SummaryPoints points={summary.points} />
      {summary.diagram && entry && meta ? (
        <div className="mt-4">
          <DownloadableSummaryCard
            day={meta.day}
            dayLabel={`Day ${meta.day}`}
            title={meta.title}
            definition={meta.definition}
            diagram={entry.render()}
            keyPoints={summary.points.slice(0, CARD_KEY_POINTS)}
            fileName={`day-${meta.day}-summary.png`}
          />
        </div>
      ) : (
        summary.diagram && (
          <LessonDiagramSlot diagram={summary.diagram} meta={meta} />
        )
      )}
    </LessonSection>
  );
}
