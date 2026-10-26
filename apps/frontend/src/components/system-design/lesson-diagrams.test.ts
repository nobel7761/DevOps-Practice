import { describe, expect, it } from "vitest";
import { DIAGRAMS } from "@/components/system-design/diagram-registry";
import { LESSONS } from "@/lib/data/system-design/lessons";
import type { LessonDiagram, SdLesson } from "@/lib/system-design/lesson.types";

function diagramsOf(lesson: SdLesson): LessonDiagram[] {
  const prose = [
    lesson.problem,
    lesson.analogy,
    lesson.coreConcept,
    lesson.tradeOffs,
    lesson.industry,
    lesson.connections,
  ];
  return [
    ...prose.flatMap((section) => section.diagrams ?? []),
    ...lesson.deepDive.flatMap((item) => item.diagrams ?? []),
    ...(lesson.summary.diagram ? [lesson.summary.diagram] : []),
  ];
}

describe("lesson diagrams", () => {
  it.each(Object.keys(LESSONS))(
    "%s: every diagram it uses is built and registered",
    (topicId) => {
      const missing = diagramsOf(LESSONS[topicId].lesson)
        .map((d) => d.id)
        .filter((id) => !DIAGRAMS[id]);
      expect(missing).toEqual([]);
    },
  );

  it.each(Object.keys(LESSONS))(
    "%s: has a downloadable main diagram and a summary diagram (Plan doc 6.1, 6.4)",
    (topicId) => {
      const diagrams = diagramsOf(LESSONS[topicId].lesson);
      expect(diagrams.some((d) => d.downloadable)).toBe(true);
      expect(LESSONS[topicId].lesson.summary.diagram?.id).toBe(
        `day-${topicId.slice(-3)}-summary`,
      );
    },
  );
});
