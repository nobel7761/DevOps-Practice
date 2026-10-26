import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/shared/shadcn";
import type { SdAttemptResult } from "./sd-quiz.types";
import { SdQuizMistake } from "./SdQuizMistake";

function ResultBanner({ result }: { result: SdAttemptResult }) {
  const Icon = result.passed ? CheckCircle2 : XCircle;
  const color = result.passed ? "var(--sd-ok)" : "var(--sd-fail)";
  return (
    <div
      className="flex items-center gap-3 rounded-xl border-2 p-4"
      style={{ borderColor: color }}
    >
      <Icon className="size-7 shrink-0" style={{ color }} />
      <div>
        <p className="text-lg font-semibold tabular-nums">
          {result.score}/{result.total} · {result.percent}%
        </p>
        <p className="text-sm text-muted-foreground">
          {result.passed
            ? "Quiz Passed ✅ চমৎকার!"
            : "Pass করতে 95% (20-এ 19) লাগবে। নিচের ভুলগুলো দেখে আবার চেষ্টা করুন।"}
        </p>
      </div>
    </div>
  );
}

export function SdQuizResult({
  result,
  onRetry,
}: {
  result: SdAttemptResult;
  onRetry: () => void;
}) {
  const mistakes = result.results.filter((r) => !r.correct);
  return (
    <div className="flex flex-col gap-4">
      <ResultBanner result={result} />
      {mistakes.length > 0 && (
        <>
          <h3 className="text-sm font-semibold">
            ভুল উত্তরগুলোর ব্যাখ্যা ({mistakes.length}টা)
          </h3>
          <ul className="flex flex-col gap-3">
            {mistakes.map((mistake) => (
              <SdQuizMistake key={mistake.id} result={mistake} />
            ))}
          </ul>
        </>
      )}
      <Button
        className="w-fit"
        variant={result.passed ? "outline" : "default"}
        onClick={onRetry}
      >
        আবার চেষ্টা করুন (নতুন 20টা প্রশ্ন)
      </Button>
    </div>
  );
}
