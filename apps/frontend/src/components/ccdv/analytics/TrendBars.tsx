import { cn } from "@/lib/utils";
import type { AttemptRecord } from "@/lib/ccdv/storage";
import { PASS_SCALED, SCALED_MAX } from "@/lib/data/ccdv/blueprint";

/** Score per attempt, oldest → newest, with the 720 pass line. */
export default function TrendBars({ attempts }: { attempts: AttemptRecord[] }) {
  return (
    <div className="relative flex h-40 items-end gap-2 border-b border-border">
      <div
        className="absolute inset-x-0 border-t border-dashed border-amber-500"
        style={{ bottom: `${(PASS_SCALED / SCALED_MAX) * 100}%` }}
      />
      {attempts.map((attempt) => (
        <div
          key={attempt.id}
          className="flex h-full flex-1 flex-col items-center justify-end gap-1"
        >
          <span className="text-[10px]">{attempt.result.scaled}</span>
          <div
            className={cn(
              "w-full rounded-t",
              attempt.result.passed ? "bg-green-600" : "bg-red-500",
            )}
            style={{ height: `${(attempt.result.scaled / SCALED_MAX) * 100}%` }}
          />
          <span className="text-[10px] text-muted-foreground">
            M{attempt.examNumber}
          </span>
        </div>
      ))}
    </div>
  );
}
