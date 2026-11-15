import { Badge, Button } from "@/components/shared/shadcn";
import type { AttemptRecord } from "@/lib/ccdv/storage";
import { formatClock } from "./ExamTimer";

/** Earlier submissions of this exam: score, time, and a button to reopen the full answer review. Saved in the database. */
export default function PastAttempts({
  attempts,
  onView,
}: {
  attempts: AttemptRecord[];
  onView: (attempt: AttemptRecord) => void;
}) {
  if (attempts.length === 0) return null;
  return (
    <div>
      <p className="mb-2 text-sm font-semibold">
        🕘 আগের attempt গুলো (তোমার উত্তরসহ সংরক্ষিত)
      </p>
      <ul className="flex flex-col gap-2">
        {[...attempts].reverse().map((attempt) => (
          <li
            key={attempt.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm"
          >
            <span className="text-muted-foreground">
              {new Date(attempt.submittedAt).toLocaleString()} ·{" "}
              {formatClock(attempt.durationSec)}
            </span>
            <span className="flex items-center gap-2">
              <span className="font-mono font-semibold">
                {attempt.result.scaled} ({attempt.result.correct}/
                {attempt.result.total})
              </span>
              <Badge
                variant={attempt.result.passed ? "default" : "destructive"}
              >
                {attempt.result.passed ? "PASS" : "FAIL"}
              </Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onView(attempt)}
              >
                কোনটা ঠিক/ভুল দেখো
              </Button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
