// Response time vs utilization for a simple M/M/1 queue: R = S / (1 − ρ), S = 10ms.

const W = 640;
const H = 320;
const PAD = { left: 60, right: 24, top: 20, bottom: 52 };
const S = 10;
const Y_MAX = 220;

const plotW = W - PAD.left - PAD.right;
const plotH = H - PAD.top - PAD.bottom;
const sx = (rho: number) => PAD.left + rho * plotW;
const sy = (ms: number) => PAD.top + plotH - (ms / Y_MAX) * plotH;
const r = (rho: number) => S / (1 - rho);

const CURVE = Array.from({ length: 96 }, (_, i) => i / 100);
const MARKS = [0.5, 0.7, 0.8, 0.9, 0.95];

function Axes() {
  return (
    <g fontSize={11} fill="var(--sd-edge)">
      {[0, 50, 100, 150, 200].map((ms) => (
        <g key={ms}>
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
            {ms}
          </text>
        </g>
      ))}
      {[0, 0.2, 0.4, 0.6, 0.8, 1].map((rho) => (
        <text
          key={rho}
          x={sx(rho)}
          y={PAD.top + plotH + 18}
          textAnchor="middle"
        >
          {Math.round(rho * 100)}%
        </text>
      ))}
      <text
        x={PAD.left + plotW / 2}
        y={H - 8}
        textAnchor="middle"
        fontSize={12}
        fill="var(--sd-label)"
      >
        Utilization (ρ)
      </text>
      <text
        x={14}
        y={PAD.top + plotH / 2}
        textAnchor="middle"
        fontSize={12}
        fill="var(--sd-label)"
        transform={`rotate(-90 14 ${PAD.top + plotH / 2})`}
      >
        গড় response time (ms)
      </text>
    </g>
  );
}

function SafeBand() {
  return (
    <g>
      <rect
        x={sx(0.6)}
        y={PAD.top}
        width={sx(0.7) - sx(0.6)}
        height={plotH}
        fill="var(--sd-ok)"
        fillOpacity={0.15}
      />
      <text
        x={(sx(0.6) + sx(0.7)) / 2}
        y={PAD.top + 14}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill="var(--sd-ok)"
      >
        লক্ষ্য ৬০-৭০%
      </text>
    </g>
  );
}

function Curve() {
  const points = CURVE.map((rho) => `${sx(rho)},${sy(r(rho))}`).join(" ");
  return (
    <g>
      <polyline
        points={points}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {MARKS.map((rho) => (
        <g key={rho}>
          <circle
            cx={sx(rho)}
            cy={sy(r(rho))}
            r={4}
            fill={rho >= 0.9 ? "var(--sd-fail)" : "var(--primary)"}
          />
          <text
            x={sx(rho) - 8}
            y={sy(r(rho)) - 4}
            textAnchor="end"
            fontSize={11}
            fontWeight={600}
            fill="var(--sd-label)"
          >
            {Math.round(r(rho))}ms
          </text>
        </g>
      ))}
    </g>
  );
}

/** Deep dive: why servers are not run at 100%. */
export function Day019Utilization() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <Axes />
      <SafeBand />
      <Curve />
      <text
        x={PAD.left + 8}
        y={sy(r(0)) - 8}
        fontSize={11}
        fill="var(--sd-edge)"
      >
        S = 10ms (আসল কাজ)
      </text>
    </svg>
  );
}
