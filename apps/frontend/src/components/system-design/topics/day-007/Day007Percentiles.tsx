// "Why averages lie": a long-tailed latency histogram for 1,000 requests
// (illustrative numbers), with p50, the mean, p95 and p99 marked.

interface Bin {
  label: string;
  count: number;
}

const BINS: Bin[] = [
  { label: "০-২৫", count: 300 },
  { label: "২৫-৫০", count: 520 },
  { label: "৫০-১০০", count: 100 },
  { label: "১০০-২৫০", count: 50 },
  { label: "২৫০-৫০০", count: 20 },
  { label: "৫০০-১০০০", count: 8 },
  { label: "১০০০+", count: 2 },
];

interface Marker {
  label: string;
  /** Position in bin units: 1.4 = 40% into the second bin. */
  at: number;
  color: string;
  row: number;
}

// Cumulative counts 300, 820, 920, 970, 990, 998, 1000 put the 500th request
// ~38% into 25-50 ms, the 950th ~60% into 100-250 ms, and the 990th at 500 ms.
const MARKERS: Marker[] = [
  { label: "p50 ≈ ৩৫ms", at: 1.38, color: "var(--sd-ok)", row: 0 },
  { label: "গড় ≈ ৫৬ms", at: 2.12, color: "var(--primary)", row: 1 },
  { label: "p95 ≈ ১৯০ms", at: 3.6, color: "var(--sd-warn)", row: 0 },
  { label: "p99 ≈ ৫০০ms", at: 5, color: "var(--sd-fail)", row: 1 },
];

const W = 680;
const H = 330;
const PAD = { left: 56, right: 16, top: 64, bottom: 56 };
const MAX_COUNT = 550;
const plotW = W - PAD.left - PAD.right;
const plotH = H - PAD.top - PAD.bottom;
const binW = plotW / BINS.length;

const bx = (at: number) => PAD.left + at * binW;
const by = (count: number) => PAD.top + plotH - (count / MAX_COUNT) * plotH;

function Bars() {
  return (
    <g>
      {BINS.map((bin, i) => (
        <g key={bin.label}>
          <rect
            x={bx(i) + 6}
            y={by(bin.count)}
            width={binW - 12}
            height={PAD.top + plotH - by(bin.count)}
            rx={3}
            fill="var(--sd-server-soft)"
            stroke="var(--sd-server)"
            strokeWidth={1.5}
          />
          <text
            x={bx(i) + binW / 2}
            y={by(bin.count) - 6}
            textAnchor="middle"
            fontSize={11}
            fill="var(--sd-label)"
          >
            {bin.count}
          </text>
          <text
            x={bx(i) + binW / 2}
            y={PAD.top + plotH + 16}
            textAnchor="middle"
            fontSize={11}
            fill="var(--sd-edge)"
          >
            {bin.label}
          </text>
        </g>
      ))}
    </g>
  );
}

function Markers() {
  return (
    <g fontSize={12} fontWeight={700}>
      {MARKERS.map((marker) => {
        const labelY = 18 + marker.row * 20;
        return (
          <g key={marker.label}>
            <line
              x1={bx(marker.at)}
              x2={bx(marker.at)}
              y1={labelY + 6}
              y2={PAD.top + plotH}
              stroke={marker.color}
              strokeWidth={2}
              strokeDasharray="5 3"
            />
            <text
              x={bx(marker.at)}
              y={labelY}
              textAnchor="middle"
              fill={marker.color}
            >
              {marker.label}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function AxisTitles() {
  return (
    <g fontSize={12} fill="var(--sd-label)">
      <text x={PAD.left + plotW / 2} y={H - 10} textAnchor="middle">
        Latency (ms)
      </text>
      <text
        x={14}
        y={PAD.top + plotH / 2}
        textAnchor="middle"
        transform={`rotate(-90 14 ${PAD.top + plotH / 2})`}
      >
        Request সংখ্যা
      </text>
    </g>
  );
}

/** Histogram: percentiles vs the mean on a long-tailed distribution (core concept). */
export function Day007Percentiles() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <line
        x1={PAD.left}
        x2={PAD.left + plotW}
        y1={PAD.top + plotH}
        y2={PAD.top + plotH}
        stroke="var(--sd-edge)"
      />
      <Bars />
      <Markers />
      <AxisTitles />
    </svg>
  );
}
