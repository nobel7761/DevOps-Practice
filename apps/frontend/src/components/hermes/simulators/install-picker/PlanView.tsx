import InlineCode from "../../lesson/InlineCode";
import type { Plan } from "./logic";

export default function PlanView({ plan }: { plan: Plan }) {
  return (
    <div className="flex flex-col gap-2 text-sm">
      <ol className="list-decimal pl-5">
        {plan.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      {plan.commands.map((c) => (
        <pre
          key={c}
          className="overflow-x-auto rounded-lg border border-border bg-background/60 p-2 text-xs whitespace-pre-wrap break-all"
        >
          {c}
        </pre>
      ))}
      <ul className="list-disc pl-5 text-xs text-muted-foreground">
        {plan.notes.map((n) => (
          <li key={n}>
            <InlineCode text={n} />
          </li>
        ))}
      </ul>
      {plan.layout && <p className="text-xs">📁 {plan.layout}</p>}
    </div>
  );
}
