import type { State } from "./logic";

const LABEL = {
  active: "🟢 active",
  paused: "⏸ paused",
  done: "✅ done",
  cleared: "🗑 cleared",
} as const;

export default function GoalStatus({ state }: { state: State }) {
  const pct = Math.min(100, Math.round((state.turns / state.maxTurns) * 100));
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-background/60 p-3 text-sm">
      <p className="font-medium">
        Status: {LABEL[state.status]} · Turns {state.turns}/{state.maxTurns}
      </p>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
