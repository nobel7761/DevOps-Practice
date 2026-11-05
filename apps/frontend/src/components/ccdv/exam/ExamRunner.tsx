import { Flag } from "lucide-react";
import { Button, Card, CardContent } from "@/components/shared/shadcn";
import type { CcdvExam } from "@/lib/data/ccdv/types";
import QuestionBody from "../question/QuestionBody";
import ExamTimer from "./ExamTimer";
import QuestionPalette from "./QuestionPalette";

export default function ExamRunner({
  exam,
  index,
  answers,
  flagged,
  remaining,
  onGo,
  onToggleOption,
  onToggleFlag,
  onReview,
}: {
  exam: CcdvExam;
  index: number;
  answers: Record<string, number[]>;
  flagged: string[];
  remaining: number;
  onGo: (index: number) => void;
  onToggleOption: (optionIndex: number) => void;
  onToggleFlag: () => void;
  onReview: () => void;
}) {
  const question = exam.questions[index];
  const isFlagged = flagged.includes(question.id);
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <Card>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">
              Question {index + 1} of {exam.questions.length}
            </p>
            <ExamTimer remaining={remaining} />
          </div>
          <QuestionBody
            question={question}
            selected={answers[question.id] ?? []}
            revealed={false}
            onToggle={onToggleOption}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={index === 0}
              onClick={() => onGo(index - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              disabled={index === exam.questions.length - 1}
              onClick={() => onGo(index + 1)}
            >
              Next
            </Button>
            <Button
              variant={isFlagged ? "default" : "outline"}
              onClick={onToggleFlag}
            >
              <Flag className="size-4" />
              {isFlagged ? "Flagged" : "Flag for review"}
            </Button>
            <Button variant="secondary" onClick={onReview}>
              Review &amp; Submit
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="h-fit">
        <CardContent>
          <p className="mb-2 text-sm font-semibold">Questions</p>
          <QuestionPalette
            questions={exam.questions}
            answers={answers}
            flagged={flagged}
            current={index}
            onGo={onGo}
          />
        </CardContent>
      </Card>
    </div>
  );
}
