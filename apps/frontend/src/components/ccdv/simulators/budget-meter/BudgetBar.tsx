import { cn } from "@/lib/utils";
import type { BudgetItem } from "./index";

const COLORS = [
  "bg-sky-500",
  "bg-violet-500",
  "bg-amber-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-cyan-500",
];

export default function BudgetBar({
  items,
  values,
  capacity,
}: {
  items: BudgetItem[];
  values: Record<string, number>;
  capacity: number;
}) {
  return (
    <div className="flex h-8 w-full overflow-hidden rounded-lg border border-border bg-muted">
      {items.map((item, index) => {
        const width = Math.min(100, ((values[item.id] ?? 0) / capacity) * 100);
        return (
          <div
            key={item.id}
            title={`${item.label}: ${values[item.id] ?? 0}`}
            className={cn(
              "h-full transition-all",
              COLORS[index % COLORS.length],
            )}
            style={{ width: `${width}%` }}
          />
        );
      })}
    </div>
  );
}
