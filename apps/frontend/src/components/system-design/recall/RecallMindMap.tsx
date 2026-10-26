"use client";

import type { KeyboardEvent } from "react";
import type { RecallColor } from "@/lib/system-design/recall/schedule";
import { RECALL_COLOR_VAR } from "./recall-colors";

const WIDTH = 680;
const HEIGHT = 440;
const RADIUS_X = 245;
const RADIUS_Y = 165;
const CHAR_WIDTH = 7.4;
const NODE_HEIGHT = 34;

export interface MindMapPoint {
  term: string;
  color: RecallColor;
}

function MindMapNode({
  point,
  x,
  y,
  selected,
  onSelect,
}: {
  point: MindMapPoint;
  x: number;
  y: number;
  selected: boolean;
  onSelect: () => void;
}) {
  const width = Math.max(90, point.term.length * CHAR_WIDTH + 28);
  const color = RECALL_COLOR_VAR[point.color];
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onSelect();
    }
  };
  return (
    <g
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={point.term}
      onClick={onSelect}
      onKeyDown={onKeyDown}
      className="cursor-pointer outline-none [&:focus-visible>rect]:stroke-[var(--ring)]"
    >
      <rect
        x={x - width / 2}
        y={y - NODE_HEIGHT / 2}
        width={width}
        height={NODE_HEIGHT}
        rx={NODE_HEIGHT / 2}
        fill="var(--sd-canvas)"
        stroke={selected ? "var(--primary)" : color}
        strokeWidth={selected ? 3 : 2}
      />
      <circle cx={x - width / 2 + 14} cy={y} r={5} fill={color} />
      <text
        x={x + 6}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12.5}
        fontWeight={600}
        fill="var(--sd-label)"
      >
        {point.term}
      </text>
    </g>
  );
}

/** Topic in the centre, core points around it, each coloured by its last self-rating (Plan doc Section 5.1). */
export function RecallMindMap({
  title,
  points,
  selected,
  onSelect,
}: {
  title: string;
  points: MindMapPoint[];
  selected: string | null;
  onSelect: (term: string) => void;
}) {
  const cx = WIDTH / 2;
  const cy = HEIGHT / 2;
  const positions = points.map((_, i) => {
    const angle = (i / points.length) * Math.PI * 2 - Math.PI / 2;
    return {
      x: cx + Math.cos(angle) * RADIUS_X,
      y: cy + Math.sin(angle) * RADIUS_Y,
    };
  });

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      width="100%"
      style={{ minWidth: 520 }}
      aria-label={`${title}: Recall Map`}
    >
      {positions.map((p, i) => (
        <line
          key={i}
          x1={cx}
          y1={cy}
          x2={p.x}
          y2={p.y}
          stroke="var(--sd-edge)"
          strokeOpacity={0.4}
        />
      ))}
      <ellipse cx={cx} cy={cy} rx={90} ry={34} fill="var(--primary)" />
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={15}
        fontWeight={700}
        fill="var(--primary-foreground)"
      >
        {title}
      </text>
      {points.map((point, i) => (
        <MindMapNode
          key={point.term}
          point={point}
          x={positions[i].x}
          y={positions[i].y}
          selected={selected === point.term}
          onSelect={() => onSelect(point.term)}
        />
      ))}
    </svg>
  );
}
