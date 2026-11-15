import { DiagramEdge } from "@/components/shared/diagram";

// Inside Kong: request phases, and plugins ordered by PRIORITY within a phase
// (values read from the Kong 3.9.1 plugin handlers).

interface Phase {
  title: string;
  sub: string;
  items: string[];
  kind: "gateway" | "server";
}

const PHASES: Phase[] = [
  {
    title: "access",
    sub: "upstream-এর আগে",
    kind: "gateway",
    items: [
      "cors · 2000",
      "jwt · 1450",
      "key-auth · 1250",
      "acl · 950",
      "rate-limiting · 910",
      "request-transformer · 801",
    ],
  },
  {
    title: "Upstream",
    sub: "service-এ proxy",
    kind: "server",
    items: ["load balancing", "timeout", "retries"],
  },
  {
    title: "header/body_filter",
    sub: "response ফেরার পথে",
    kind: "gateway",
    items: ["response-transformer · 800", "header যোগ/বাদ", "body বদল"],
  },
  {
    title: "log",
    sub: "উত্তর যাওয়ার পরে",
    kind: "gateway",
    items: ["prometheus · 13", "http-log · 12"],
  },
];

const COL_W = 170;
const GAP = 34;
const TOP = 20;
const ROW_H = 30;
const COL_H = 270;

const colX = (index: number) => 10 + index * (COL_W + GAP);

function PhaseColumn({ phase, index }: { phase: Phase; index: number }) {
  const x = colX(index);
  const color = `var(--sd-${phase.kind})`;
  return (
    <g>
      <rect
        x={x}
        y={TOP}
        width={COL_W}
        height={COL_H}
        rx={12}
        fill={`var(--sd-${phase.kind}-soft)`}
        stroke={color}
        strokeWidth={1.5}
      />
      <text
        x={x + COL_W / 2}
        y={TOP + 24}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {phase.title}
      </text>
      <text
        x={x + COL_W / 2}
        y={TOP + 42}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        {phase.sub}
      </text>
      {phase.items.map((item, row) => (
        <g key={item}>
          <rect
            x={x + 10}
            y={TOP + 56 + row * (ROW_H + 4)}
            width={COL_W - 20}
            height={ROW_H}
            rx={6}
            fill="var(--sd-canvas)"
            stroke={color}
          />
          <text
            x={x + COL_W / 2}
            y={TOP + 56 + row * (ROW_H + 4) + ROW_H / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fill="var(--sd-label)"
          >
            {item}
          </text>
        </g>
      ))}
    </g>
  );
}

/** Internal structure: Kong's request phases and the PRIORITY order of plugins. */
export function Day016Phases() {
  const width = colX(PHASES.length) - GAP + 10;
  return (
    <svg viewBox={`0 0 ${width} 340`} width="100%">
      {PHASES.slice(0, -1).map((phase, index) => (
        <DiagramEdge
          key={phase.title}
          segment={{
            x1: colX(index) + COL_W,
            y1: TOP + COL_H / 2,
            x2: colX(index + 1),
            y2: TOP + COL_H / 2,
          }}
          tone="active"
        />
      ))}
      {PHASES.map((phase, index) => (
        <PhaseColumn key={phase.title} phase={phase} index={index} />
      ))}
      <text
        x={width / 2}
        y={TOP + COL_H + 34}
        textAnchor="middle"
        fontSize={12}
        fill="var(--sd-edge)"
      >
        একই phase-এ: PRIORITY বড় → আগে চলে (সংখ্যা Kong 3.9.1 থেকে)
      </text>
    </svg>
  );
}
