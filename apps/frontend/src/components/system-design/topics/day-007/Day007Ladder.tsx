// The latency ladder on a log scale (approximate orders of magnitude), with a
// "if 1 ns were 1 second" column to make the gaps feel real.

interface Rung {
  label: string;
  seconds: number;
  value: string;
  human: string;
  color: string;
}

const RUNGS: Rung[] = [
  {
    label: "L1 cache থেকে পড়া",
    seconds: 1e-9,
    value: "~১ns",
    human: "১ সেকেন্ড",
    color: "cache",
  },
  {
    label: "RAM থেকে পড়া",
    seconds: 1e-7,
    value: "~১০০ns",
    human: "~২ মিনিট",
    color: "cache",
  },
  {
    label: "SSD random read",
    seconds: 1e-4,
    value: "~১০০µs",
    human: "~১ দিন",
    color: "database",
  },
  {
    label: "একই datacenter-এ RTT",
    seconds: 5e-4,
    value: "~৫০০µs",
    human: "~৬ দিন",
    color: "server",
  },
  {
    label: "HDD seek",
    seconds: 1e-2,
    value: "~১০ms",
    human: "~৪ মাস",
    color: "database",
  },
  {
    label: "ঢাকা ↔ Singapore RTT",
    seconds: 5e-2,
    value: "~৫০ms",
    human: "~১.৬ বছর",
    color: "client",
  },
  {
    label: "ঢাকা ↔ US East RTT",
    seconds: 2.5e-1,
    value: "~২৫০ms",
    human: "~৮ বছর",
    color: "client",
  },
];

const W = 760;
const LEFT = 190;
const PLOT_W = 380;
const TOP = 44;
const ROW_H = 38;
const H = TOP + RUNGS.length * ROW_H + 44;
const MIN_EXP = -10; // 0.1 ns
const MAX_EXP = 0; // 1 s

const x = (seconds: number) =>
  LEFT + ((Math.log10(seconds) - MIN_EXP) / (MAX_EXP - MIN_EXP)) * PLOT_W;

const TICKS = [
  { s: 1e-9, label: "1ns" },
  { s: 1e-6, label: "1µs" },
  { s: 1e-3, label: "1ms" },
  { s: 1, label: "1s" },
];

function Headers() {
  return (
    <g fontSize={12} fontWeight={700} fill="var(--sd-label)">
      <text x={LEFT} y={20}>
        আনুমানিক সময় (log scale, প্রতি দাগে ১,০০০ গুণ)
      </text>
      <text x={W} y={20} textAnchor="end">
        ১ns = ১ সেকেন্ড হলে
      </text>
    </g>
  );
}

function Axis() {
  const y = TOP + RUNGS.length * ROW_H + 4;
  return (
    <g fontSize={11} fill="var(--sd-edge)">
      {TICKS.map((tick) => (
        <g key={tick.label}>
          <line
            x1={x(tick.s)}
            x2={x(tick.s)}
            y1={TOP - 6}
            y2={y}
            stroke="var(--sd-edge)"
            strokeOpacity={0.25}
            strokeDasharray="3 3"
          />
          <text x={x(tick.s)} y={y + 16} textAnchor="middle">
            {tick.label}
          </text>
        </g>
      ))}
    </g>
  );
}

function RungRow({ rung, index }: { rung: Rung; index: number }) {
  const y = TOP + index * ROW_H;
  const cy = y + ROW_H / 2;
  return (
    <g>
      <text
        x={LEFT - 10}
        y={cy}
        textAnchor="end"
        dominantBaseline="central"
        fontSize={12}
        fill="var(--sd-label)"
      >
        {rung.label}
      </text>
      <rect
        x={LEFT}
        y={y + 8}
        width={x(rung.seconds) - LEFT}
        height={ROW_H - 16}
        rx={4}
        fill={`var(--sd-${rung.color}-soft)`}
        stroke={`var(--sd-${rung.color})`}
        strokeWidth={1.5}
      />
      <text
        x={x(rung.seconds) + 6}
        y={cy}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {rung.value}
      </text>
      <text
        x={W}
        y={cy}
        textAnchor="end"
        dominantBaseline="central"
        fontSize={12}
        fill="var(--sd-edge)"
      >
        {rung.human}
      </text>
    </g>
  );
}

/** Internal structure: the order-of-magnitude latency ladder (deep dive). */
export function Day007Ladder() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <Headers />
      <Axis />
      {RUNGS.map((rung, i) => (
        <RungRow key={rung.label} rung={rung} index={i} />
      ))}
    </svg>
  );
}
