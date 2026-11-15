// Monthly cost per 1,000 req/s vs machine size (the lesson's worked example):
// small boxes lose to fixed per-machine overhead, big boxes to efficiency.

const W = 640;
const H = 320;
const PAD = { left: 64, right: 30, top: 24, bottom: 56 };
const Y_MIN = 150;
const Y_MAX = 270;

const plotW = W - PAD.left - PAD.right;
const plotH = H - PAD.top - PAD.bottom;

const POINTS = [
  { vcpu: 2, cost: 213 },
  { vcpu: 8, cost: 176 },
  { vcpu: 16, cost: 180 },
  { vcpu: 64, cost: 224 },
  { vcpu: 96, cost: 259 },
];

const LOG_MIN = Math.log2(2);
const LOG_MAX = Math.log2(128);
const sx = (vcpu: number) =>
  PAD.left + ((Math.log2(vcpu) - LOG_MIN) / (LOG_MAX - LOG_MIN)) * plotW;
const sy = (cost: number) =>
  PAD.top + plotH - ((cost - Y_MIN) / (Y_MAX - Y_MIN)) * plotH;

function Axes() {
  const yTicks = [150, 180, 210, 240, 270];
  return (
    <g fontSize={11} fill="var(--sd-edge)">
      {yTicks.map((y) => (
        <g key={y}>
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
            ${y}
          </text>
        </g>
      ))}
      {POINTS.map((p) => (
        <text
          key={p.vcpu}
          x={sx(p.vcpu)}
          y={PAD.top + plotH + 18}
          textAnchor="middle"
        >
          {p.vcpu}
        </text>
      ))}
      <text
        x={PAD.left + plotW / 2}
        y={H - 10}
        textAnchor="middle"
        fontSize={12}
        fill="var(--sd-label)"
      >
        Machine-এর আকার (vCPU, log scale)
      </text>
      <text
        x={16}
        y={PAD.top + plotH / 2}
        textAnchor="middle"
        fontSize={12}
        fill="var(--sd-label)"
        transform={`rotate(-90 16 ${PAD.top + plotH / 2})`}
      >
        প্রতি 1,000 req/s, মাসে
      </text>
    </g>
  );
}

function Curve() {
  const line = POINTS.map((p) => `${sx(p.vcpu)},${sy(p.cost)}`).join(" ");
  return (
    <g>
      <polyline
        points={line}
        fill="none"
        stroke="var(--primary)"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {POINTS.map((p) => (
        <g key={p.vcpu}>
          <circle
            cx={sx(p.vcpu)}
            cy={sy(p.cost)}
            r={p.vcpu === 8 ? 6 : 4}
            fill={p.vcpu === 8 ? "var(--sd-ok)" : "var(--primary)"}
          />
          <text
            x={sx(p.vcpu)}
            y={sy(p.cost) - 12}
            textAnchor="middle"
            fontSize={11}
            fontWeight={600}
            fill="var(--sd-label)"
          >
            ${p.cost}
          </text>
        </g>
      ))}
    </g>
  );
}

function Notes() {
  return (
    <g fontSize={11}>
      <text
        x={sx(8)}
        y={sy(176) + 22}
        textAnchor="middle"
        fill="var(--sd-ok)"
        fontWeight={700}
      >
        মিষ্টি জায়গা
      </text>
      <text x={sx(2) + 6} y={sy(213) + 22} fill="var(--sd-edge)">
        স্থির খরচ খায়
      </text>
      <text
        x={sx(96) - 6}
        y={sy(259) + 24}
        textAnchor="end"
        fill="var(--sd-edge)"
      >
        efficiency হারায়
      </text>
    </g>
  );
}

/** U-shaped cost per unit of throughput (deep dive: cost curves). */
export function Day013CostCurve() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <Axes />
      <Curve />
      <Notes />
    </svg>
  );
}
