// The seven qualities that run through the course, arranged around the topic,
// each with the day where it gets its own lesson.

const CX = 360;
const CY = 200;
const RX = 270;
const RY = 150;
const BOX_W = 170;
const BOX_H = 50;

const QUALITIES = [
  { name: "Scalability", note: "Day 5 · 13", color: "server" },
  { name: "Availability", note: "Day 6", color: "load-balancer" },
  { name: "Latency ও Throughput", note: "Day 7", color: "cdn" },
  { name: "Consistency", note: "Day 8 · 47", color: "database" },
  { name: "Reliability", note: "Phase 6", color: "queue" },
  { name: "Maintainability", note: "Day 61 · 89", color: "gateway" },
  { name: "Cost", note: "Day 19", color: "cache" },
];

function QualityBox({ index }: { index: number }) {
  const { name, note, color } = QUALITIES[index];
  const angle = -Math.PI / 2 + (index * 2 * Math.PI) / QUALITIES.length;
  const x = CX + RX * Math.cos(angle);
  const y = CY + RY * Math.sin(angle);
  return (
    <g>
      <line
        x1={CX}
        y1={CY}
        x2={x}
        y2={y}
        stroke="var(--sd-edge)"
        strokeDasharray="3 4"
      />
      <rect
        x={x - BOX_W / 2}
        y={y - BOX_H / 2}
        width={BOX_W}
        height={BOX_H}
        rx={10}
        fill={`var(--sd-${color}-soft)`}
        stroke={`var(--sd-${color})`}
        strokeWidth={1.5}
      />
      <text
        x={x}
        y={y - 7}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {name}
      </text>
      <text
        x={x}
        y={y + 11}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        {note}
      </text>
    </g>
  );
}

/** Internal structure of the discipline: the quality attributes every design is judged by. */
export function Day001Qualities() {
  return (
    <svg viewBox="0 0 720 400" width="100%">
      {QUALITIES.map((q, i) => (
        <QualityBox key={q.name} index={i} />
      ))}
      <circle
        cx={CX}
        cy={CY}
        r={62}
        fill="var(--sd-canvas)"
        stroke="var(--primary)"
        strokeWidth={2.5}
      />
      <text
        x={CX}
        y={CY - 9}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={15}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        System
      </text>
      <text
        x={CX}
        y={CY + 11}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={15}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        Design
      </text>
    </svg>
  );
}
