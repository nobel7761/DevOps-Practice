// Same total capacity, one machine dies: 2 big machines vs 8 small ones,
// against a peak load of 60% of total capacity.

const W = 640;
const H = 270;
const BAR_X = 120;
const BAR_W = 480;
const BAR_H = 44;
const LOAD = 0.6;
const LOAD_X = BAR_X + LOAD * BAR_W;

function Segment({
  x,
  y,
  width,
  dead,
}: {
  x: number;
  y: number;
  width: number;
  dead: boolean;
}) {
  return (
    <g>
      <rect
        x={x + 2}
        y={y}
        width={width - 4}
        height={BAR_H}
        rx={6}
        fill={dead ? "var(--sd-canvas)" : "var(--sd-server-soft)"}
        stroke={dead ? "var(--sd-fail)" : "var(--sd-server)"}
        strokeWidth={dead ? 2 : 1.5}
        strokeDasharray={dead ? "6 4" : undefined}
      />
      {dead && (
        <text
          x={x + width / 2}
          y={y + BAR_H / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={16}
          fontWeight={700}
          fill="var(--sd-fail)"
        >
          ✕
        </text>
      )}
    </g>
  );
}

function FleetBar({
  y,
  count,
  label,
  verdict,
  ok,
}: {
  y: number;
  count: number;
  label: string;
  verdict: string;
  ok: boolean;
}) {
  const width = BAR_W / count;
  return (
    <g>
      <text
        x={BAR_X - 12}
        y={y + BAR_H / 2}
        textAnchor="end"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {label}
      </text>
      {Array.from({ length: count }, (_, i) => (
        <Segment
          key={i}
          x={BAR_X + i * width}
          y={y}
          width={width}
          dead={i === 0}
        />
      ))}
      <text
        x={BAR_X}
        y={y + BAR_H + 20}
        fontSize={12}
        fontWeight={600}
        fill={ok ? "var(--sd-ok)" : "var(--sd-fail)"}
      >
        {verdict}
      </text>
    </g>
  );
}

function LoadLine() {
  return (
    <g>
      <line
        x1={LOAD_X}
        x2={LOAD_X}
        y1={22}
        y2={H - 20}
        stroke="var(--sd-warn)"
        strokeWidth={2}
        strokeDasharray="6 4"
      />
      <text
        x={LOAD_X}
        y={14}
        textAnchor="middle"
        fontSize={11}
        fontWeight={600}
        fill="var(--sd-label)"
      >
        peak load = মোট ক্ষমতার ৬০%
      </text>
    </g>
  );
}

/** Blast radius: share of capacity lost when one machine dies. */
export function Day013BlastRadius() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <FleetBar
        y={40}
        count={2}
        label="২টা বড়"
        verdict="একটা মরল → বাকি ৫০% < ৬০% load ✕ ভার ধরে না"
        ok={false}
      />
      <FleetBar
        y={150}
        count={8}
        label="৮টা ছোট"
        verdict="একটা মরল → বাকি ৮৭.৫% > ৬০% load ✓ ঠিক আছে"
        ok
      />
      <LoadLine />
    </svg>
  );
}
