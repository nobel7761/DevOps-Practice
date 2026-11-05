import type { Carry } from "./logic";

export default function Result({
  target,
  why,
  carry,
  cacheNote,
}: {
  target: string;
  why: string;
  carry: Carry[];
  cacheNote: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-background/60 p-3 text-sm">
      <p>
        ▶️ Resume হবে: <b>{target}</b>
      </p>
      <p className="text-xs text-muted-foreground">{why}</p>
      <ul className="flex flex-col gap-1 text-xs">
        {carry.map((c) => (
          <li key={c.item}>
            <b>{c.item}:</b> {c.value}
          </li>
        ))}
      </ul>
      {cacheNote && <p className="text-xs">💸 {cacheNote}</p>}
    </div>
  );
}
