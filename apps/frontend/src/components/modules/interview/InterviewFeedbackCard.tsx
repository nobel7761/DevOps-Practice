import type { GradeResult } from "@/components/modules/interview/interview.types";

function scoreTone(score: number) {
  if (score >= 80) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 50) return "text-amber-600 dark:text-amber-400";
  return "text-destructive";
}

export default function InterviewFeedbackCard({
  result,
}: {
  result: GradeResult;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">Overall Score</span>
        <span className={`text-lg font-bold ${scoreTone(result.score)}`}>
          {result.score}/100
        </span>
      </div>
      {result.verdict && (
        <p className="text-sm text-muted-foreground">{result.verdict}</p>
      )}
      {result.strengths.length > 0 && (
        <div>
          <h4 className="mb-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Strengths
          </h4>
          <ul className="flex flex-col gap-0.5 text-xs text-muted-foreground">
            {result.strengths.map((s, i) => (
              <li key={i}>• {s}</li>
            ))}
          </ul>
        </div>
      )}
      {result.improvements.length > 0 && (
        <div>
          <h4 className="mb-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
            Areas for Improvement
          </h4>
          <ul className="flex flex-col gap-0.5 text-xs text-muted-foreground">
            {result.improvements.map((s, i) => (
              <li key={i}>• {s}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="flex gap-6 border-t border-border pt-2 text-xs">
        <div>
          <p className="text-muted-foreground">Technical Accuracy</p>
          <p className="font-semibold">{result.technicalAccuracy}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Completeness</p>
          <p className="font-semibold">{result.completeness}</p>
        </div>
      </div>
    </div>
  );
}
