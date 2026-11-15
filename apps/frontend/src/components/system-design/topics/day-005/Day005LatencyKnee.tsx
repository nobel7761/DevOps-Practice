// Load-test shape: latency stays flat while there's spare capacity, then
// shoots up near saturation (the "knee"). Simple single-queue model:
// latency = service time / (1 - utilisation), capacity 100 req/s, 10 ms each.

const W = 640;
const H = 320;
const PAD = { left: 60, right: 30, top: 24, bottom: 52 };
const CAPACITY = 100;
const SERVICE_MS = 10;
const MAX_MS = 200;

const plotW = W - PAD.left - PAD.right;
const plotH = H - PAD.top - PAD.bottom;

const sx = (rps: number) => PAD.left + (rps / CAPACITY) * plotW;
const sy = (ms: number) =>
  PAD.top + plotH - (Math.min(ms, MAX_MS) / MAX_MS) * plotH;

const latency = (rps: number) => SERVICE_MS / (1 - rps / CAPACITY);

const LOADS = Array.from({ length: 96 }, (_, i) => i);
const LINE = LOADS.map((r) => `${sx(r)},${sy(latency(r))}`).join(" ");

function Axes() {
  const yTicks = [0, 50, 100, 150, 200];
  const xTicks = [0, 25, 50, 75, 100];
  return (
    <g fontSize={11} fill="var(--sd-edge)">
      {yTicks.map((ms) => (
        <g key={`y${ms}`}>
          <line
            x1={PAD.left}
            x2={PAD.left + plotW}
            y1={sy(ms)}
            y2={sy(ms)}
            stroke="var(--sd-edge)"
            strokeOpacity={0.2}
          />
          <text
            x={PAD.left - 8}
            y={sy(ms)}
            textAnchor="end"
            dominantBaseline="central"
          >
            {ms}ms
          </text>
        </g>
      ))}
      {xTicks.map((r) => (
        <text
          key={`x${r}`}
          x={sx(r)}
          y={PAD.top + plotH + 18}
          textAnchor="middle"
        >
          {r}%
        </text>
      ))}
      <text
        x={PAD.left + plotW / 2}
        y={H - 8}
        textAnchor="middle"
        fontSize={12}
        fill="var(--sd-label)"
      >
        Load (capacity-র কত %)
      </text>
      <text
        x={14}
        y={PAD.top + plotH / 2}
        textAnchor="middle"
        fontSize={12}
        fill="var(--sd-label)"
        transform={`rotate(-90 14 ${PAD.top + plotH / 2})`}
      >
        গড় latency
      </text>
    </g>
  );
}

function Zones() {
  return (
    <g fontSize={11}>
      <rect
        x={sx(80)}
        y={PAD.top}
        width={sx(100) - sx(80)}
        height={plotH}
        fill="var(--sd-fail)"
        opacity={0.08}
      />
      <text x={sx(40)} y={sy(40)} textAnchor="middle" fill="var(--sd-label)">
        আরামের জায়গা: load বাড়ে, latency প্রায় একই
      </text>
      <text
        x={sx(90)}
        y={PAD.top + 14}
        textAnchor="middle"
        fill="var(--sd-fail)"
        fontWeight={700}
      >
        knee
      </text>
      <text x={sx(64)} y={sy(120)} textAnchor="middle" fill="var(--sd-label)">
        ~৮০%-এর পরে লাইন জমে,
      </text>
      <text
        x={sx(64)}
        y={sy(120) + 15}
        textAnchor="middle"
        fill="var(--sd-label)"
      >
        latency খাড়া উপরে
      </text>
    </g>
  );
}

/** Line chart: latency vs load from a load test (deep dive, measuring scalability). */
export function Day005LatencyKnee() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <Axes />
      <Zones />
      <polyline
        points={LINE}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={2}
        strokeLinejoin="round"
      />
    </svg>
  );
}
