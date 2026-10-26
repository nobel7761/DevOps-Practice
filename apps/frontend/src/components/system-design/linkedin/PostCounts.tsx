import {
  HOOK_LIMIT,
  POST_LIMIT,
  formatCount,
  postStats,
} from "@/lib/system-design/linkedin/post";

function Count({
  label,
  value,
  limit,
  over,
}: {
  label: string;
  value: number;
  limit: number;
  over: boolean;
}) {
  return (
    <span
      className="tabular-nums"
      style={{ color: over ? "var(--sd-fail)" : undefined }}
    >
      {over ? "✕ " : ""}
      {label}
      {formatCount(value)} / {formatCount(limit)}
    </span>
  );
}

/** `1,840 / 3,000` and `Hook: 112 / 150`, counted on the exact text that gets copied. */
export function PostCounts({ copyText }: { copyText: string }) {
  const stats = postStats(copyText);
  return (
    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
      <Count
        label=""
        value={stats.length}
        limit={POST_LIMIT}
        over={stats.overLimit}
      />
      <Count
        label="Hook: "
        value={stats.hookLength}
        limit={HOOK_LIMIT}
        over={stats.hookOverLimit}
      />
    </div>
  );
}
