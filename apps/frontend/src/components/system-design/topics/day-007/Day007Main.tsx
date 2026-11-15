import {
  PhaseBar,
  RowLabel,
  TimeAxis,
  timeScale,
  toneFill,
  toneStroke,
  type Phase,
} from "./Day007Timeline";

// Main diagram: one cold HTTPS request as a waterfall, with the curl -w
// variable that marks the end of each phase.

const W = 720;
const H = 340;
const PLOT_LEFT = 200;
const PLOT_WIDTH = 440;
const ROW_TOP = 46;
const ROW_H = 40;
const BAR_H = 22;
const AXIS_Y = ROW_TOP + ROW_H * 5 + 6;

const x = timeScale(PLOT_LEFT, PLOT_WIDTH);

const ROWS: Phase[] = [
  { label: "DNS lookup", start: 0, end: 30, tone: "dns" },
  { label: "TCP handshake", start: 30, end: 80, tone: "handshake" },
  { label: "TLS handshake", start: 80, end: 130, tone: "handshake" },
  {
    label: "Request + server + প্রথম byte",
    start: 130,
    end: 220,
    tone: "travel",
  },
  { label: "বাকি data transfer", start: 220, end: 260, tone: "transfer" },
];

const SERVER_PART: Phase = {
  label: "server",
  start: 155,
  end: 195,
  tone: "server",
};

const MARKERS = [
  { ms: 30, name: "time_namelookup" },
  { ms: 80, name: "time_connect" },
  { ms: 130, name: "time_appconnect" },
  { ms: 220, name: "time_starttransfer" },
  { ms: 260, name: "time_total" },
];

const rowY = (index: number) => ROW_TOP + index * ROW_H + (ROW_H - BAR_H) / 2;

function ServerSlice() {
  const y = rowY(3);
  return (
    <g>
      <rect
        x={x(SERVER_PART.start)}
        y={y}
        width={x(SERVER_PART.end) - x(SERVER_PART.start)}
        height={BAR_H}
        fill={toneFill(SERVER_PART.tone)}
        stroke={toneStroke(SERVER_PART.tone)}
        strokeWidth={2}
      />
      <text
        x={(x(SERVER_PART.start) + x(SERVER_PART.end)) / 2}
        y={y + BAR_H / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        server ৪০ms
      </text>
    </g>
  );
}

function CurlMarkers() {
  return (
    <g fontSize={10} fontFamily="monospace" fill="var(--sd-edge)">
      {MARKERS.map((marker, i) => (
        <g key={marker.name}>
          <line
            x1={x(marker.ms)}
            x2={x(marker.ms)}
            y1={ROW_TOP}
            y2={AXIS_Y + 26 + (i % 2) * 16}
            stroke="var(--primary)"
            strokeDasharray="3 3"
            strokeOpacity={0.6}
          />
          <text
            x={x(marker.ms)}
            y={AXIS_Y + 36 + (i % 2) * 16}
            textAnchor="middle"
            fill="var(--primary)"
          >
            {marker.name}
          </text>
        </g>
      ))}
    </g>
  );
}

function Header() {
  return (
    <g fontSize={12} fill="var(--sd-label)">
      <text x={0} y={18} fontWeight={700}>
        Cold HTTPS request · ঢাকা → Singapore · RTT ~৫০ms
      </text>
      <text x={W} y={18} textAnchor="end" fill="var(--sd-edge)">
        মোট ~২৬০ms, server-এর কাজ ~৪০ms
      </text>
    </g>
  );
}

/** Waterfall of one cold request (core concept, downloadable). */
export function Day007Main() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <Header />
      <TimeAxis x={x} y={AXIS_Y} top={ROW_TOP} />
      {ROWS.map((phase, i) => (
        <g key={phase.label}>
          <RowLabel
            x={PLOT_LEFT - 10}
            y={rowY(i) + BAR_H / 2}
            text={phase.label}
          />
          <PhaseBar phase={phase} x={x} y={rowY(i)} height={BAR_H} />
        </g>
      ))}
      <ServerSlice />
      <CurlMarkers />
    </svg>
  );
}
