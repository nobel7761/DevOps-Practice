// Speed-up vs number of servers: ideal linear, Amdahl's law (5% serial work),
// and a Universal-Scalability-Law-style curve where coordination cost makes
// adding servers eventually hurt. Values are computed, not hand-drawn.

const W = 680;
const H = 340;
const PAD = { left: 56, right: 150, top: 20, bottom: 52 };
const MAX_N = 32;
const MAX_Y = 16;

const plotW = W - PAD.left - PAD.right;
const plotH = H - PAD.top - PAD.bottom;

const sx = (n: number) => PAD.left + ((n - 1) / (MAX_N - 1)) * plotW;
const sy = (y: number) => PAD.top + plotH - (y / MAX_Y) * plotH;

const SERIAL = 0.05; // Amdahl: 5% of the work can't run in parallel
const CONTENTION = 0.05; // USL alpha
const COHERENCY = 0.005; // USL beta

const amdahl = (n: number) => 1 / (SERIAL + (1 - SERIAL) / n);
const usl = (n: number) =>
  n / (1 + CONTENTION * (n - 1) + COHERENCY * n * (n - 1));

const NS = Array.from({ length: MAX_N }, (_, i) => i + 1);

function points(fn: (n: number) => number, ns = NS) {
  return ns.map((n) => `${sx(n)},${sy(Math.min(fn(n), MAX_Y))}`).join(" ");
}

interface Series {
  key: string;
  label: string;
  sub: string;
  color: string;
  fn: (n: number) => number;
  ns?: number[];
  dashed?: boolean;
}

const SERIES: Series[] = [
  {
    key: "ideal",
    label: "আদর্শ (linear)",
    sub: "N server = N গুণ",
    color: "var(--sd-edge)",
    fn: (n) => n,
    ns: NS.filter((n) => n <= MAX_Y),
    dashed: true,
  },
  {
    key: "amdahl",
    label: "Amdahl (৫% serial)",
    sub: "সর্বোচ্চ ২০ গুণ",
    color: "var(--primary)",
    fn: amdahl,
  },
  {
    key: "usl",
    label: "Coordination খরচ সহ",
    sub: "একসময় উল্টো দিকে",
    color: "var(--sd-fail)",
    fn: usl,
  },
];

function Axes() {
  const yTicks = [0, 4, 8, 12, 16];
  const xTicks = [1, 8, 16, 24, 32];
  return (
    <g fontSize={11} fill="var(--sd-edge)">
      {yTicks.map((y) => (
        <g key={`y${y}`}>
          <line
            x1={PAD.left}
            x2={PAD.left + plotW}
            y1={sy(y)}
            y2={sy(y)}
            stroke="var(--sd-edge)"
            strokeOpacity={0.2}
          />
          <text
            x={PAD.left - 8}
            y={sy(y)}
            textAnchor="end"
            dominantBaseline="central"
          >
            {y}×
          </text>
        </g>
      ))}
      {xTicks.map((n) => (
        <text
          key={`x${n}`}
          x={sx(n)}
          y={PAD.top + plotH + 18}
          textAnchor="middle"
        >
          {n}
        </text>
      ))}
      <text
        x={PAD.left + plotW / 2}
        y={H - 8}
        textAnchor="middle"
        fontSize={12}
        fill="var(--sd-label)"
      >
        Server-এর সংখ্যা (N)
      </text>
      <text
        x={14}
        y={PAD.top + plotH / 2}
        textAnchor="middle"
        fontSize={12}
        fill="var(--sd-label)"
        transform={`rotate(-90 14 ${PAD.top + plotH / 2})`}
      >
        Throughput (১ server-এর তুলনায়)
      </text>
    </g>
  );
}

function SeriesLine({ series }: { series: Series }) {
  const ns = series.ns ?? NS;
  const lastN = ns[ns.length - 1];
  const endY = sy(Math.min(series.fn(lastN), MAX_Y));
  return (
    <g>
      <polyline
        points={points(series.fn, ns)}
        fill="none"
        stroke={series.color}
        strokeWidth={2}
        strokeDasharray={series.dashed ? "6 4" : undefined}
        strokeLinejoin="round"
      />
      <circle cx={sx(lastN)} cy={endY} r={4} fill={series.color} />
      <text
        x={sx(lastN) + 10}
        y={endY - 6}
        fontSize={12}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {series.label}
      </text>
      <text x={sx(lastN) + 10} y={endY + 9} fontSize={10} fill="var(--sd-edge)">
        {series.sub}
      </text>
    </g>
  );
}

/** Line chart: how much faster N servers really are (deep dive). */
export function Day005ScalingCurve() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <Axes />
      {SERIES.map((series) => (
        <SeriesLine key={series.key} series={series} />
      ))}
    </svg>
  );
}
