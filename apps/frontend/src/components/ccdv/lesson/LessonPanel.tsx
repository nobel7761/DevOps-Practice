import InlineCode from "@/components/hermes/lesson/InlineCode";
import LessonBlockView from "@/components/hermes/lesson/LessonBlockView";
import LessonRecap from "@/components/hermes/lesson/LessonRecap";
import type { CcdvChapterContent } from "@/lib/data/ccdv/types";
import { SimContextProvider } from "../simulators/SimContext";

export default function LessonPanel({
  chapterId,
  lesson,
}: {
  chapterId: string;
  lesson: CcdvChapterContent["lesson"];
}) {
  return (
    <div>
      <p className="mb-4 text-sm text-muted-foreground">
        <InlineCode text={lesson.oneLiner} />
      </p>
      {lesson.blocks.map((block, index) =>
        block.type === "simulator" ? (
          <SimContextProvider
            key={index}
            value={{ chapterId, simKey: `s${index}` }}
          >
            <LessonBlockView block={block} />
          </SimContextProvider>
        ) : (
          <LessonBlockView key={index} block={block} />
        ),
      )}
      <LessonRecap points={lesson.recap} />
    </div>
  );
}
