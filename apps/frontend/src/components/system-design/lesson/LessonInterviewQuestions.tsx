import Markdown from "@/components/shared/Markdown";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shared/shadcn";
import LessonSection from "@/components/system-design/lesson/LessonSection";
import type { LessonInterviewQuestion } from "@/lib/system-design/lesson.types";

export default function LessonInterviewQuestions({
  questions,
}: {
  questions: LessonInterviewQuestion[];
}) {
  return (
    <LessonSection section="interview">
      <Accordion
        type="multiple"
        className="rounded-xl border border-border px-4"
      >
        {questions.map((item) => (
          <AccordionItem key={item.question} value={item.question}>
            <AccordionTrigger>{item.question}</AccordionTrigger>
            <AccordionContent>
              <Markdown>{item.answerOutline}</Markdown>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </LessonSection>
  );
}
