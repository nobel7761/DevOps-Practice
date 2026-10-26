import type { ReactNode } from "react";

function ComparisonPane({
  tone,
  title,
  note,
  children,
}: {
  tone: "before" | "after";
  title: string;
  note?: string;
  children: ReactNode;
}) {
  const color = tone === "before" ? "var(--sd-fail)" : "var(--sd-ok)";
  return (
    <div
      className="flex min-w-0 flex-col gap-2 rounded-xl border-2 p-3"
      style={{ borderColor: color }}
    >
      <span className="text-sm font-semibold" style={{ color }}>
        {tone === "before" ? "❌" : "✅"} {title}
      </span>
      <div className="overflow-x-auto">{children}</div>
      {note && <p className="text-sm text-muted-foreground">{note}</p>}
    </div>
  );
}

/**
 * Side-by-side comparison that stacks top-to-bottom on small screens (Plan doc Section 6.1).
 * `stacked` keeps it top-to-bottom everywhere, for diagrams too wide to read at half width.
 */
export function BeforeAfter({
  stacked = false,
  before,
  after,
  beforeTitle = "আগে",
  afterTitle = "পরে",
  beforeNote,
  afterNote,
}: {
  stacked?: boolean;
  before: ReactNode;
  after: ReactNode;
  beforeTitle?: string;
  afterTitle?: string;
  /** e.g. "User অপেক্ষা করে ~3s" */
  beforeNote?: string;
  afterNote?: string;
}) {
  return (
    <div className={stacked ? "grid gap-3" : "grid gap-3 md:grid-cols-2"}>
      <ComparisonPane tone="before" title={beforeTitle} note={beforeNote}>
        {before}
      </ComparisonPane>
      <ComparisonPane tone="after" title={afterTitle} note={afterNote}>
        {after}
      </ComparisonPane>
    </div>
  );
}
