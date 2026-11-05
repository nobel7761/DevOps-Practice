import InlineCode from "../../lesson/InlineCode";
import type { StepResult, StepState } from "./logic";

const BADGE: Record<StepState, string> = {
  ok: "✅ সফল",
  skipped: "⏭️ skip",
  failed: "❌ ব্যর্থ",
  "rolled-back": "↩️ rollback",
  "not-run": "⏹️ চলেনি",
};

export default function StepList({ steps }: { steps: StepResult[] }) {
  return (
    <ol className="flex flex-col gap-2">
      {steps.map((s) => (
        <li
          key={s.id}
          className={`rounded-lg border border-border p-3 text-sm ${s.state === "not-run" ? "opacity-60" : ""}`}
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-medium">
              {s.id}. {s.title}
            </span>
            <span className="text-xs">{BADGE[s.state]}</span>
          </div>
          <p className="text-xs text-muted-foreground">{s.what}</p>
          <p className="mt-1 text-xs">
            <InlineCode text={s.note} />
          </p>
        </li>
      ))}
    </ol>
  );
}
