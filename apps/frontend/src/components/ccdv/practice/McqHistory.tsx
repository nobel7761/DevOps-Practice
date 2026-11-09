import type { McqAttemptRecord } from "@/lib/ccdv/study-types";

/** Earlier finished attempts, newest first. */
export default function McqHistory({
  history,
}: {
  history: McqAttemptRecord[];
}) {
  if (history.length === 0) return null;
  return (
    <div>
      <p className="mb-1 text-sm font-semibold">🕘 আগের attempt গুলো</p>
      <ul className="flex flex-col gap-1 text-sm">
        {[...history]
          .reverse()
          .slice(0, 8)
          .map((attempt) => (
            <li
              key={attempt.at}
              className="flex justify-between gap-3 rounded-md border border-border px-3 py-1.5"
            >
              <span className="text-muted-foreground">
                {new Date(attempt.at).toLocaleString()}
              </span>
              <span className="font-mono font-semibold">
                {attempt.correct}/{attempt.total}
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
}
