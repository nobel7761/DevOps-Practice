import { Check, X } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/shared/shadcn";
import type { McqAnswerRecord } from "@/lib/ccdv/study-types";
import type { CcdvMcq } from "@/lib/data/ccdv/types";
import QuestionBody from "../question/QuestionBody";

/** Every question of the attempt with your answer, ✅/❌, and the explanation (click to open). */
export default function McqReview({
  mcqs,
  answers,
}: {
  mcqs: CcdvMcq[];
  answers: McqAnswerRecord[];
}) {
  return (
    <Accordion type="multiple" className="rounded-xl border border-border px-3">
      {mcqs.map((question, i) => {
        const answer = answers.find((a) => a.index === i);
        return (
          <AccordionItem key={i} value={`q${i}`}>
            <AccordionTrigger className="gap-2 text-left text-sm">
              <span className="flex min-w-0 items-start gap-2">
                {answer?.correct ? (
                  <Check className="mt-0.5 size-4 shrink-0 text-green-600" />
                ) : (
                  <X className="mt-0.5 size-4 shrink-0 text-red-600" />
                )}
                <span className="min-w-0">
                  Q{i + 1}. {question.question.slice(0, 110)}
                  {question.question.length > 110 ? "…" : ""}
                </span>
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <QuestionBody
                question={question}
                selected={answer?.selected ?? []}
                revealed
                onToggle={() => {}}
              />
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
