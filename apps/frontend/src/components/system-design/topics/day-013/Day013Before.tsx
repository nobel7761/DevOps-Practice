import { DiagramEdge, DiagramNode } from "@/components/shared/diagram";

// Before: one huge VM runs the app and the database; only one of 32 cores is busy.

const W = 680;
const H = 260;
const BOX = { x: 170, y: 10, width: 500, height: 210 };
const CORES = 32;
const PER_ROW = 16;
const CELL = 26;
const GRID_X = BOX.x + 26;
const GRID_Y = BOX.y + 52;

function CoreCell({ index }: { index: number }) {
  const busy = index === 0;
  const x = GRID_X + (index % PER_ROW) * CELL;
  const y = GRID_Y + Math.floor(index / PER_ROW) * CELL;
  return (
    <rect
      x={x}
      y={y}
      width={CELL - 4}
      height={CELL - 4}
      rx={4}
      fill={busy ? "var(--sd-fail)" : "var(--sd-canvas)"}
      fillOpacity={busy ? 0.35 : 1}
      stroke={busy ? "var(--sd-fail)" : "var(--sd-edge)"}
      strokeOpacity={busy ? 1 : 0.5}
      strokeWidth={busy ? 2 : 1}
    />
  );
}

function CoreGrid() {
  return (
    <g>
      {Array.from({ length: CORES }, (_, i) => (
        <CoreCell key={i} index={i} />
      ))}
      <text
        x={GRID_X + (CELL - 4) / 2}
        y={GRID_Y - 8}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill="var(--sd-fail)"
      >
        100%
      </text>
      <text x={GRID_X + 34} y={GRID_Y - 8} fontSize={11} fill="var(--sd-edge)">
        ← একটা core ব্যস্ত, বাকি ৩১টা প্রায় অলস
      </text>
    </g>
  );
}

function InnerBlock({
  x,
  label,
  kind,
}: {
  x: number;
  label: string;
  kind: "server" | "database";
}) {
  const y = GRID_Y + 2 * CELL + 14;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={200}
        height={40}
        rx={8}
        fill={`var(--sd-${kind}-soft)`}
        stroke={`var(--sd-${kind})`}
        strokeWidth={1.5}
      />
      <text
        x={x + 100}
        y={y + 20}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
        fill="var(--sd-label)"
      >
        {label}
      </text>
    </g>
  );
}

function BigVm() {
  return (
    <g>
      <rect
        {...BOX}
        rx={14}
        fill="var(--sd-server-soft)"
        stroke="var(--sd-fail)"
        strokeWidth={2.5}
        strokeDasharray="8 4"
      />
      <text
        x={BOX.x + 26}
        y={BOX.y + 26}
        fontSize={14}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        1 VM · 32 vCPU · 128GB RAM
      </text>
      <CoreGrid />
      <InnerBlock x={BOX.x + 26} label="Node.js · ১টা process" kind="server" />
      <InnerBlock x={BOX.x + 246} label="PostgreSQL" kind="database" />
      <text
        x={BOX.x + BOX.width / 2}
        y={BOX.y + BOX.height - 16}
        textAnchor="middle"
        fontSize={12}
        fontWeight={600}
        fill="var(--sd-fail)"
      >
        resize = stop → size বদল → start · ~৬ মিনিট পুরো site বন্ধ
      </text>
    </g>
  );
}

/** Before: everything on one big VM; bigger box, same single busy core. */
export function Day013Before() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <DiagramNode kind="client" label="Students" x={0} y={83} />
      <DiagramEdge
        segment={{ x1: 132, y1: 115, x2: BOX.x - 2, y2: 115 }}
        label="২০k"
      />
      <BigVm />
    </svg>
  );
}
