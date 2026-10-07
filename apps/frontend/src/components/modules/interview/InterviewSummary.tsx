import { Button } from "@/components/shared/shadcn";
import InterviewFeedbackCard from "@/components/modules/interview/InterviewFeedbackCard";
import type {
  GradeResult,
  InterviewQuestion,
} from "@/components/modules/interview/interview.types";

function verdictLabel(score: number) {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 50) return "Needs practice";
  return "Keep studying";
}

export default function InterviewSummary({
  questions,
  results,
  onRetake,
}: {
  questions: InterviewQuestion[];
  results: Record<string, GradeResult>;
  onRetake: () => void;
}) {
  const answered = questions.filter((q) => results[q.id]);
  const overall =
    answered.length > 0
      ? Math.round(
          answered.reduce((sum, q) => sum + results[q.id].score, 0) /
            answered.length,
        )
      : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-8 text-center">
        <h2 className="text-2xl font-bold">Interview Completed!</h2>
        <div className="mt-2 text-4xl font-bold text-primary">
          {overall}
          <span className="text-lg text-muted-foreground"> / 100</span>
        </div>
        <p className="text-sm text-muted-foreground">
          {verdictLabel(overall)} · {answered.length}/{questions.length}{" "}
          answered
        </p>
        <Button variant="outline" size="sm" onClick={onRetake} className="mt-2">
          ↻ Retake Interview
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <h3 className="text-sm font-semibold">Key Takeaways</h3>
        {questions.map((q) => {
          const result = results[q.id];
          if (!result) return null;
          return (
            <div key={q.id} className="flex flex-col gap-2">
              <p className="text-sm font-medium">{q.title}</p>
              <InterviewFeedbackCard result={result} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
