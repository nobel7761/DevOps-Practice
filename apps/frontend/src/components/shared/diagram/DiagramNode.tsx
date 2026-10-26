import {
  DIAGRAM_KINDS,
  kindColor,
  kindSoftColor,
  type DiagramKind,
  type DiagramNodeStatus,
} from "./diagram-kinds";

export const NODE_WIDTH = 132;
export const NODE_HEIGHT = 64;

const LABEL_OFFSET = 42;
const MAX_FONT = 13;
const MIN_FONT = 10;
/** Rough average glyph width as a share of font size, for shrinking long labels to fit. */
const GLYPH_RATIO = 0.6;

/** One component box (icon + English name) inside a diagram's <svg>. x/y is the top-left corner. */
export function DiagramNode({
  kind,
  label,
  x,
  y,
  width = NODE_WIDTH,
  height = NODE_HEIGHT,
  status = "normal",
}: {
  kind: DiagramKind;
  label?: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  status?: DiagramNodeStatus;
}) {
  const { icon: Icon, label: kindLabel } = DIAGRAM_KINDS[kind];
  const stroke = status === "failed" ? "var(--sd-fail)" : kindColor(kind);
  const text = label ?? kindLabel;
  const room = width - LABEL_OFFSET - 8;
  const fontSize = Math.max(
    MIN_FONT,
    Math.min(MAX_FONT, room / (text.length * GLYPH_RATIO)),
  );

  return (
    <g opacity={status === "dimmed" ? 0.35 : 1}>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={12}
        fill={kindSoftColor(kind)}
        stroke={stroke}
        strokeWidth={status === "highlight" || status === "failed" ? 3 : 1.5}
        strokeDasharray={status === "failed" ? "6 4" : undefined}
      />
      <Icon
        x={x + 12}
        y={y + height / 2 - 11}
        width={22}
        height={22}
        color={stroke}
      />
      <text
        x={x + LABEL_OFFSET}
        y={y + height / 2}
        dominantBaseline="central"
        fontSize={fontSize}
        fontWeight={600}
        fill="var(--sd-label)"
      >
        {text}
      </text>
      {status === "failed" && (
        <text
          x={x + width - 16}
          y={y + 16}
          textAnchor="middle"
          fontSize={14}
          fill="var(--sd-fail)"
        >
          ✕
        </text>
      )}
    </g>
  );
}
