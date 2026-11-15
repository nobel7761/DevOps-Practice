import {
  DiagramNode,
  NODE_HEIGHT,
  NODE_WIDTH,
  type DiagramKind,
} from "@/components/shared/diagram";

// Small SVG building blocks shared by the Day 8 diagrams.

export type BoxTone = "ok" | "fail" | "warn" | "neutral" | "primary";

const TONE_STROKE: Record<BoxTone, string> = {
  ok: "var(--sd-ok)",
  fail: "var(--sd-fail)",
  warn: "var(--sd-warn)",
  neutral: "var(--sd-edge)",
  primary: "var(--primary)",
};

/** Rounded box with a bold title and up to two smaller lines under it. */
export function InfoBox({
  x,
  y,
  width,
  height,
  title,
  lines = [],
  tone = "neutral",
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  lines?: string[];
  tone?: BoxTone;
}) {
  const stroke = TONE_STROKE[tone];
  const top = y + height / 2 - (lines.length * 16) / 2;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={10}
        fill="var(--sd-canvas)"
        stroke={stroke}
        strokeWidth={2}
      />
      <text
        x={x + width / 2}
        y={top}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={700}
        fill={tone === "neutral" ? "var(--sd-label)" : stroke}
      >
        {title}
      </text>
      {lines.map((line, i) => (
        <text
          key={line}
          x={x + width / 2}
          y={top + 18 + i * 16}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={11.5}
          fill="var(--sd-label)"
        >
          {line}
        </text>
      ))}
    </g>
  );
}

/** A component node plus its box, so edges can be computed from it. */
export function nodeBox(x: number, y: number) {
  return { x, y, width: NODE_WIDTH, height: NODE_HEIGHT };
}

export function Node({
  kind,
  label,
  x,
  y,
  dimmed,
}: {
  kind: DiagramKind;
  label: string;
  x: number;
  y: number;
  dimmed?: boolean;
}) {
  return (
    <DiagramNode
      kind={kind}
      label={label}
      x={x}
      y={y}
      status={dimmed ? "dimmed" : "normal"}
    />
  );
}

/** Red dashed vertical line marking a network partition. */
export function PartitionLine({
  x,
  y1,
  y2,
  label,
}: {
  x: number;
  y1: number;
  y2: number;
  label: string;
}) {
  return (
    <g>
      <line
        x1={x}
        y1={y1}
        x2={x}
        y2={y2}
        stroke="var(--sd-fail)"
        strokeWidth={3}
        strokeDasharray="8 6"
      />
      <text
        x={x}
        y={y1 - 8}
        textAnchor="middle"
        fontSize={12.5}
        fontWeight={700}
        fill="var(--sd-fail)"
      >
        {label}
      </text>
    </g>
  );
}

/** Small muted caption text inside an SVG. */
export function Note({
  x,
  y,
  children,
  anchor = "middle",
  bold,
  color = "var(--sd-edge)",
}: {
  x: number;
  y: number;
  children: string;
  anchor?: "start" | "middle" | "end";
  bold?: boolean;
  color?: string;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={12}
      fontWeight={bold ? 700 : 400}
      fill={color}
    >
      {children}
    </text>
  );
}
