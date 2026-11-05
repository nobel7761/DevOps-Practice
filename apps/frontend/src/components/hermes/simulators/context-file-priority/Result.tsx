import type { Outcome } from "./logic";

export default function Result({ outcome }: { outcome: Outcome }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-3 text-sm">
      <p className="font-medium">
        {outcome.winner
          ? (outcome.blocked ? "🚫 " : "🏆 ") + outcome.winner
          : "— কোনো project file নেই"}
      </p>
      {outcome.ignored.length > 0 && (
        <p className="text-xs text-muted-foreground">
          উপেক্ষিত: {outcome.ignored.join(", ")}
        </p>
      )}
      <ul className="list-disc pl-5 text-xs">
        {outcome.lines.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
    </div>
  );
}
