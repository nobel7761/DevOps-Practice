import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/shared/shadcn";

export default function QuizResultSummary({
  result,
  onRetry,
}: {
  result: {
    score: number;
    passPercent: number;
    passed: boolean;
    correctCount: number;
    totalCount: number;
  };
  onRetry: () => void;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-lg border p-4 ${
        result.passed
          ? "border-green-500/40 bg-green-500/10"
          : "border-destructive/40 bg-destructive/10"
      }`}
    >
      <div className="flex items-center gap-3">
        {result.passed ? (
          <CheckCircle2 className="size-6 shrink-0 text-green-600" />
        ) : (
          <XCircle className="size-6 shrink-0 text-destructive" />
        )}
        <div>
          <p className="font-semibold">
            {result.passed
              ? "Pass করেছো! 🎉"
              : "এবার হয়নি, আরেকবার চেষ্টা করো"}
          </p>
          <p className="text-sm text-muted-foreground">
            {result.correctCount}/{result.totalCount} সঠিক — {result.score}%
            (pass mark {result.passPercent}%)
          </p>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onRetry}>
        আবার চেষ্টা করো
      </Button>
    </div>
  );
}
