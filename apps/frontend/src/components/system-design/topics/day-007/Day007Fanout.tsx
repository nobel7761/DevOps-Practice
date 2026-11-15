// Fan-out amplification: P(at least one slow backend) = 1 − (1 − p)^n.

const W = 640;
const H = 320;
const PAD = { left: 60, right: 40, top: 24, bottom: 52 };
const MAX_N = 100;
const plotW = W - PAD.left - PAD.right;
const plotH = H - PAD.top - PAD.bottom;

const sx = (n: number) => PAD.left + ((n - 1) / (MAX_N - 1)) * plotW;
const sy = (pct: number) => PAD.top + plotH - (pct / 100) * plotH;

const atLeastOneSlow = (p: number, n: number) => (1 - (1 - p) ** n) * 100;

const NS = Array.from({ length: MAX_N }, (_, i) => i + 1);
const line = (p: number) =>
  NS.map((n) => `${sx(n)},${sy(atLeastOneSlow(p, n))}`).join(" ");

const POINTS = [10, 50, 100];

function Axes() {
  return (
    <g fontSize={11} fill="var(--sd-edge)">
      {[0, 25, 50, 75, 100].map((pct) => (
        <g key={pct}>
          <line
            x1={PAD.left}
            x2={PAD.left + plotW}
            y1={sy(pct)}
            y2={sy(pct)}
            stroke="var(--sd-edge)"
            strokeOpacity={0.2}
          />
          <text
            x={PAD.left - 8}
            y={sy(pct)}
            textAnchor="end"
            dominantBaseline="central"
          >
            {pct}%
          </text>
        </g>
      ))}
      {[1, 25, 50, 75, 100].map((n) => (
        <text key={n} x={sx(n)} y={PAD.top + plotH + 18} textAnchor="middle">
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
        Fan-out: কয়টা backend-এ request যায় (n)
      </text>
      <text
        x={14}
        y={PAD.top + plotH / 2}
        textAnchor="middle"
        fontSize={12}
        fill="var(--sd-label)"
        transform={`rotate(-90 14 ${PAD.top + plotH / 2})`}
      >
        অন্তত একটা ধীর
      </text>
    </g>
  );
}

function PointLabels() {
  return (
    <g fontSize={11} fontWeight={700} fill="var(--sd-fail)">
      {POINTS.map((n) => {
        const pct = atLeastOneSlow(0.01, n);
        return (
          <g key={n}>
            <circle cx={sx(n)} cy={sy(pct)} r={4} fill="var(--sd-fail)" />
            <text
              x={sx(n) - 6}
              y={sy(pct) - 10}
              textAnchor={n === 100 ? "end" : "middle"}
            >
              n={n}: {pct.toFixed(1)}%
            </text>
          </g>
        );
      })}
    </g>
  );
}

function Legend() {
  return (
    <g fontSize={12} fill="var(--sd-label)">
      <line
        x1={PAD.left + 16}
        x2={PAD.left + 40}
        y1={PAD.top + 12}
        y2={PAD.top + 12}
        stroke="var(--sd-fail)"
        strokeWidth={2.5}
      />
      <text x={PAD.left + 46} y={PAD.top + 12} dominantBaseline="central">
        প্রতিটা backend ১% ধীর (p99)
      </text>
      <line
        x1={PAD.left + 16}
        x2={PAD.left + 40}
        y1={PAD.top + 32}
        y2={PAD.top + 32}
        stroke="var(--sd-ok)"
        strokeWidth={2.5}
      />
      <text x={PAD.left + 46} y={PAD.top + 32} dominantBaseline="central">
        প্রতিটা backend ০.১% ধীর (p99.9)
      </text>
    </g>
  );
}

/** Line chart of 1 − (1 − p)^n for p = 1% and 0.1% (deep dive, tail latency). */
export function Day007Fanout() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <Axes />
      <polyline
        points={line(0.01)}
        fill="none"
        stroke="var(--sd-fail)"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <polyline
        points={line(0.001)}
        fill="none"
        stroke="var(--sd-ok)"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <PointLabels />
      <Legend />
    </svg>
  );
}
