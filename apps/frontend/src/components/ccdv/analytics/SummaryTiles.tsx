import { MetricTile } from "@/components/shared/simulator";
import type { AttemptRecord } from "@/lib/ccdv/storage";

export default function SummaryTiles({
  attempts,
}: {
  attempts: AttemptRecord[];
}) {
  const scores = attempts.map((attempt) => attempt.result.scaled);
  const best = Math.max(...scores);
  const average = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const passed = attempts.filter((attempt) => attempt.result.passed).length;
  return (
    <div className="grid gap-2 sm:grid-cols-4">
      <MetricTile label="Attempts" value={String(attempts.length)} />
      <MetricTile
        label="Best score"
        value={String(best)}
        tone={best >= 720 ? "good" : "warning"}
      />
      <MetricTile label="Average score" value={String(average)} />
      <MetricTile label="Passed" value={`${passed} / ${attempts.length}`} />
    </div>
  );
}
