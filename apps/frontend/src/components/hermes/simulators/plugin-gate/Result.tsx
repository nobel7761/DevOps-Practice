import type { Check } from "./logic";

export default function Result({
  checks,
  loaded,
}: {
  checks: Check[];
  loaded: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-background/60 p-3 text-sm">
      <ul className="flex flex-col gap-1">
        {checks.map((c) => (
          <li
            key={c.label}
            className={c.ok ? "" : "text-muted-foreground line-through"}
          >
            {c.ok ? "✅" : "❌"} {c.label}
          </li>
        ))}
      </ul>
      <p className="font-semibold">
        {loaded ? "🟢 Plugin load হবে" : "🔴 Plugin load হবে না / skip হবে"}
      </p>
    </div>
  );
}
