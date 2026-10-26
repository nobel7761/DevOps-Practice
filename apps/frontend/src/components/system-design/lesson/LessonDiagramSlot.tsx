import {
  DiagramFigure,
  DownloadableDiagram,
} from "@/components/shared/diagram";
import { findDiagram } from "@/components/system-design/diagram-registry";
import type {
  LessonDiagram,
  LessonMeta,
} from "@/lib/system-design/lesson.types";

function MissingDiagram({ diagram }: { diagram: LessonDiagram }) {
  return (
    <figure className="my-4">
      <div
        role="img"
        aria-label={diagram.alt}
        className="flex min-h-40 items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 p-4 text-center text-xs text-muted-foreground"
      >
        Diagram: {diagram.id}
      </div>
      <figcaption className="mt-2 text-center text-sm text-muted-foreground">
        {diagram.caption}
      </figcaption>
    </figure>
  );
}

/** Renders a lesson diagram from the registry; ids not built yet show a labelled placeholder. */
export default function LessonDiagramSlot({
  diagram,
  meta,
}: {
  diagram: LessonDiagram;
  meta?: LessonMeta;
}) {
  const entry = findDiagram(diagram.id);
  if (!entry) return <MissingDiagram diagram={diagram} />;

  if (entry.framed === false) {
    return (
      <figure className="my-4" aria-label={diagram.alt}>
        {entry.render()}
        <figcaption className="mt-2 text-sm text-muted-foreground">
          {diagram.caption}
        </figcaption>
      </figure>
    );
  }

  if (diagram.downloadable && meta) {
    return (
      <DownloadableDiagram
        diagramId={diagram.id}
        caption={diagram.caption}
        alt={diagram.alt}
        minWidth={entry.minWidth}
        dayLabel={`Day ${meta.day}`}
        title={meta.title}
        definition={meta.definition}
        fileName={`day-${meta.day}-${diagram.id}.png`}
      >
        {entry.render()}
      </DownloadableDiagram>
    );
  }

  return (
    <DiagramFigure
      diagramId={diagram.id}
      caption={diagram.caption}
      alt={diagram.alt}
      minWidth={entry.minWidth}
    >
      {entry.render()}
    </DiagramFigure>
  );
}
