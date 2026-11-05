import type { Outcome } from "./logic";

export default function Result({ outcome }: { outcome: Outcome }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-background/60 p-3 text-sm">
      <p>
        ব্যবহৃত backend: <b>{outcome.backend}</b>
      </p>
      <p className="text-xs text-muted-foreground">কারণ: {outcome.source}</p>
      {outcome.notes.map((n) => (
        <p key={n} className="text-xs">
          ⚠️ {n}
        </p>
      ))}
    </div>
  );
}
