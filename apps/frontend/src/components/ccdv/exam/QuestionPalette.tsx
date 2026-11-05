import { Button } from "@/components/shared/shadcn";
import { cn } from "@/lib/utils";
import type { CcdvExamQuestion } from "@/lib/data/ccdv/types";

export default function QuestionPalette({
  questions,
  answers,
  flagged,
  current,
  onGo,
}: {
  questions: CcdvExamQuestion[];
  answers: Record<string, number[]>;
  flagged: string[];
  current: number;
  onGo: (index: number) => void;
}) {
  return (
    <div className="grid grid-cols-8 gap-1.5 sm:grid-cols-10 lg:grid-cols-6">
      {questions.map((question, index) => {
        const answered = (answers[question.id]?.length ?? 0) > 0;
        return (
          <Button
            key={question.id}
            size="sm"
            variant={index === current ? "default" : "outline"}
            onClick={() => onGo(index)}
            className={cn(
              "h-8 px-0 text-xs",
              answered &&
                index !== current &&
                "border-primary/60 bg-primary/10",
              flagged.includes(question.id) && "ring-2 ring-amber-500",
            )}
          >
            {index + 1}
          </Button>
        );
      })}
    </div>
  );
}
