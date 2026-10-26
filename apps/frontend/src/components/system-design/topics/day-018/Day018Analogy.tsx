import { DiagramEdge } from "@/components/shared/diagram";

// Analogy: the building's motor fills each flat's own small roof tank at a
// fixed rate. A full tank gives a lot at once (burst); an empty one gives only
// what the motor refills (the rate). One flat emptying its tank can't touch
// the others' water (per-user limit).

const W = 720;
const H = 300;
const TANK_W = 110;
const TANK_H = 130;
const TANK_Y = 80;

interface Tank {
  x: number;
  flat: string;
  level: number;
  note: string;
}

const TANKS: Tank[] = [
  { x: 230, flat: "ফ্ল্যাট ১", level: 0.9, note: "ভরা: একসাথে অনেক (burst)" },
  { x: 400, flat: "ফ্ল্যাট ২", level: 0.45, note: "অর্ধেক: স্বাভাবিক" },
  { x: 570, flat: "ফ্ল্যাট ৩", level: 0, note: "খালি: কল শুকনো = 429" },
];

function Motor() {
  return (
    <g>
      <circle
        cx={70}
        cy={150}
        r={34}
        fill="var(--sd-server-soft)"
        stroke="var(--sd-server)"
        strokeWidth={1.5}
      />
      <text
        x={70}
        y={150}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={28}
      >
        ⚙️
      </text>
      <text
        x={70}
        y={204}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        মোটর
      </text>
      <text
        x={70}
        y={221}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        নির্দিষ্ট গতিতে ভরে
      </text>
      <text
        x={70}
        y={237}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        = refill rate
      </text>
    </g>
  );
}

function RoofTank({ tank }: { tank: Tank }) {
  const empty = tank.level === 0;
  const waterH = TANK_H * tank.level;
  return (
    <g>
      <text
        x={tank.x + TANK_W / 2}
        y={TANK_Y - 12}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {tank.flat}
      </text>
      <rect
        x={tank.x}
        y={TANK_Y}
        width={TANK_W}
        height={TANK_H}
        rx={8}
        fill="var(--sd-canvas)"
        stroke={empty ? "var(--sd-fail)" : "var(--sd-edge)"}
        strokeWidth={2}
        strokeDasharray={empty ? "6 4" : undefined}
      />
      {waterH > 0 && (
        <rect
          x={tank.x + 3}
          y={TANK_Y + TANK_H - waterH}
          width={TANK_W - 6}
          height={waterH - 3}
          rx={5}
          fill="var(--sd-client-soft)"
          stroke="var(--sd-client)"
        />
      )}
      <text
        x={tank.x + TANK_W / 2}
        y={TANK_Y + TANK_H + 22}
        textAnchor="middle"
        fontSize={16}
      >
        🚰
      </text>
      <text
        x={tank.x + TANK_W / 2}
        y={TANK_Y + TANK_H + 46}
        textAnchor="middle"
        fontSize={11}
        fill={empty ? "var(--sd-fail)" : "var(--sd-edge)"}
      >
        {tank.note}
      </text>
    </g>
  );
}

/** Analogy illustration: per-flat roof tanks filled by one motor at a fixed rate. */
export function Day018Analogy() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%">
      <Motor />
      {TANKS.map((tank, i) => (
        <DiagramEdge
          key={tank.flat}
          segment={{
            x1: 104,
            y1: 140 - i * 8,
            x2: tank.x + TANK_W / 2,
            y2: TANK_Y - 30,
          }}
          label={i === 0 ? "pipe" : undefined}
          tone="active"
        />
      ))}
      {TANKS.map((tank) => (
        <RoofTank key={tank.flat} tank={tank} />
      ))}
      <text
        x={W / 2 + 60}
        y={H - 6}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        ট্যাংকের মাপ = bucket capacity · প্রতি ফ্ল্যাটের আলাদা ট্যাংক = per-user
        limit
      </text>
    </svg>
  );
}
