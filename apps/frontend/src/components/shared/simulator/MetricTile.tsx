export type MetricTone = "neutral" | "good" | "warning" | "critical";

const TONE_ICON: Record<MetricTone, string> = {
  neutral: "",
  good: "✓",
  warning: "!",
  critical: "✕",
};

const TONE_COLOR: Record<MetricTone, string | undefined> = {
  neutral: undefined,
  good: "var(--sd-ok)",
  warning: "var(--sd-warn)",
  critical: "var(--sd-fail)",
};

/** One live number. Status tone is shown with an icon too, never colour alone. */
export function MetricTile({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: MetricTone;
}) {
  return (
    <div
      className="flex flex-col gap-0.5 rounded-lg border border-border px-3 py-2"
      style={{
        borderLeft: TONE_COLOR[tone]
          ? `3px solid ${TONE_COLOR[tone]}`
          : undefined,
      }}
    >
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1 text-base font-semibold tabular-nums">
        {TONE_ICON[tone] && (
          <span
            aria-hidden="true"
            className="text-xs"
            style={{ color: TONE_COLOR[tone] }}
          >
            {TONE_ICON[tone]}
          </span>
        )}
        {value}
      </span>
    </div>
  );
}
