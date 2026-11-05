import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FlowStep } from "./index";

export default function StepRow({
  step,
  from,
  to,
  columns,
  active,
}: {
  step: FlowStep;
  from: number;
  to: number;
  columns: number;
  active: boolean;
}) {
  const start = Math.min(from, to) + 1;
  const end = Math.max(from, to) + 2;
  const Icon = from === to ? RotateCcw : from < to ? ArrowRight : ArrowLeft;
  return (
    <div
      className="grid items-center gap-2"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      <div
        style={{ gridColumn: `${start} / ${end}` }}
        className={cn(
          "flex items-center justify-center gap-2 rounded-lg border px-2 py-1.5 text-xs",
          active
            ? "border-primary bg-primary/10 font-medium"
            : "border-border text-muted-foreground",
        )}
      >
        <Icon className="size-4 shrink-0" />
        <span className="min-w-0 break-words">{step.label}</span>
      </div>
    </div>
  );
}
