import {
  DIAGRAM_KINDS,
  kindColor,
  kindSoftColor,
  type DiagramKind,
} from "./diagram-kinds";

/** Inline (HTML) badge for a component kind — for legends, step lists and simulator controls. */
export function ComponentChip({
  kind,
  label,
}: {
  kind: DiagramKind;
  label?: string;
}) {
  const { icon: Icon, label: kindLabel } = DIAGRAM_KINDS[kind];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium"
      style={{
        borderColor: kindColor(kind),
        background: kindSoftColor(kind),
        color: "var(--sd-label)",
      }}
    >
      <Icon className="size-3.5" style={{ color: kindColor(kind) }} />
      {label ?? kindLabel}
    </span>
  );
}
