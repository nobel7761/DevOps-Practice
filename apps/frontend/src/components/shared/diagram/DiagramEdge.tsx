import { arrowHead, type Segment } from "@/lib/system-design/diagram/geometry";

export type EdgeTone = "normal" | "active" | "failed";

const TONE_COLOR: Record<EdgeTone, string> = {
  normal: "var(--sd-edge)",
  active: "var(--primary)",
  failed: "var(--sd-fail)",
};

/** Arrow between two points, with an optional label at its midpoint. */
export function DiagramEdge({
  segment,
  label,
  dashed,
  tone = "normal",
}: {
  segment: Segment;
  label?: string;
  dashed?: boolean;
  tone?: EdgeTone;
}) {
  const color = TONE_COLOR[tone];
  const [tip, left, right] = arrowHead(segment, 10, 5);
  const baseX = (left.x + right.x) / 2;
  const baseY = (left.y + right.y) / 2;

  return (
    <g>
      <line
        x1={segment.x1}
        y1={segment.y1}
        x2={baseX}
        y2={baseY}
        stroke={color}
        strokeWidth={tone === "normal" ? 1.5 : 2.5}
        strokeDasharray={dashed ? "6 4" : undefined}
      />
      <polygon
        points={`${tip.x},${tip.y} ${left.x},${left.y} ${right.x},${right.y}`}
        fill={color}
      />
      {label && (
        <text
          x={(segment.x1 + segment.x2) / 2}
          y={(segment.y1 + segment.y2) / 2 - 8}
          textAnchor="middle"
          fontSize={12}
          fill="var(--sd-label)"
          paintOrder="stroke"
          stroke="var(--sd-canvas)"
          strokeWidth={4}
        >
          {label}
        </text>
      )}
    </g>
  );
}
