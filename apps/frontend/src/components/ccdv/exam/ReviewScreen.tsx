import { Button, Card, CardContent } from "@/components/shared/shadcn";
import type { CcdvExam } from "@/lib/data/ccdv/types";
import ExamTimer from "./ExamTimer";
import QuestionPalette from "./QuestionPalette";

export default function ReviewScreen({
  exam,
  answers,
  flagged,
  remaining,
  onGo,
  onBack,
  onSubmit,
}: {
  exam: CcdvExam;
  answers: Record<string, number[]>;
  flagged: string[];
  remaining: number;
  onGo: (index: number) => void;
  onBack: () => void;
  onSubmit: () => void;
}) {
  const unanswered = exam.questions.filter(
    (q) => (answers[q.id]?.length ?? 0) === 0,
  ).length;
  return (
    <Card>
      <CardContent className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Review your answers</h2>
          <ExamTimer remaining={remaining} />
        </div>
        <p className="text-sm">
          Unanswered: <strong>{unanswered}</strong> · Flagged:{" "}
          <strong>{flagged.length}</strong>. Click a number to go back to that
          question.
        </p>
        <QuestionPalette
          questions={exam.questions}
          answers={answers}
          flagged={flagged}
          current={-1}
          onGo={(index) => {
            onGo(index);
            onBack();
          }}
        />
        <div className="flex gap-2">
          <Button variant="outline" onClick={onBack}>
            Back to exam
          </Button>
          <Button onClick={onSubmit}>Submit exam</Button>
        </div>
      </CardContent>
    </Card>
  );
}
