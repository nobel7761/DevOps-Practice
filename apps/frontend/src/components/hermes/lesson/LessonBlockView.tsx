import Markdown from "@/components/shared/Markdown";
import type { LessonBlock } from "@/lib/data/hermes/lesson.types";
import LessonCallout from "./LessonCallout";
import LessonDiagram from "./LessonDiagram";
import LessonSimulator from "./LessonSimulator";

export default function LessonBlockView({ block }: { block: LessonBlock }) {
  switch (block.type) {
    case "markdown":
      return <Markdown>{block.markdown}</Markdown>;
    case "callout":
      return <LessonCallout {...block} />;
    case "diagram":
      return <LessonDiagram diagram={block.diagram} />;
    case "simulator":
      return <LessonSimulator id={block.id} props={block.props} />;
  }
}
