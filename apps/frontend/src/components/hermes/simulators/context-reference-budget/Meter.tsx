import { VERDICT_TEXT, type Verdict } from "./logic";

export default function Meter({
  used,
  context,
  ratio,
  verdict,
}: {
  used: number;
  context: number;
  ratio: number;
  verdict: Verdict;
}) {
  const pct = Math.min(100, Math.round(ratio * 100));
  return (
    <div className="flex flex-col gap-2 text-sm">
      <div className="relative h-3 w-full overflow-hidden rounded-full border border-border bg-background/60">
        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
        <div className="absolute inset-y-0 left-1/4 w-px bg-foreground/50" />
        <div className="absolute inset-y-0 left-1/2 w-px bg-foreground/50" />
      </div>
      <p className="text-xs tabular-nums">
        ~{used.toLocaleString()} / {context.toLocaleString()} ({pct}%) — soft
        ২৫%, hard ৫০%
      </p>
      <p>{VERDICT_TEXT[verdict]}</p>
    </div>
  );
}
