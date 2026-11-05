import type { Tree, Verdict } from "./logic";

const ICON = {
  removed: "🗑️ Removed",
  archived: "📦 Archived → removed",
  kept: "🛡️ Kept",
};

export default function TreeRow({
  tree,
  verdict,
}: {
  tree: Tree;
  verdict: Verdict;
}) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-background/60 px-3 py-2 text-sm">
      <div className="flex flex-col">
        <code>{tree.name}</code>
        <span className="text-xs text-muted-foreground">{tree.state}</span>
      </div>
      <div className="text-right text-xs">
        <b>{ICON[verdict.kind]}</b>
        <div className="text-muted-foreground">{verdict.why}</div>
      </div>
    </li>
  );
}
