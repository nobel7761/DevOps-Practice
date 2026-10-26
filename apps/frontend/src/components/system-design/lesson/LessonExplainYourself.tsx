import ExplainPromptCard from "@/components/system-design/lesson/ExplainPromptCard";
import LessonSection from "@/components/system-design/lesson/LessonSection";
import type { LessonOpenQuestion } from "@/lib/system-design/lesson.types";

export default function LessonExplainYourself({
  questions,
}: {
  questions: LessonOpenQuestion[];
}) {
  return (
    <LessonSection section="explainYourself">
      <ul className="flex flex-col gap-3">
        {questions.map((prompt) => (
          <ExplainPromptCard key={prompt.question} prompt={prompt} />
        ))}
      </ul>
    </LessonSection>
  );
}
