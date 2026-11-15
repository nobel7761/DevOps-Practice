// Shared waterfall pieces for Day 7: one HTTPS request from Dhaka to a
// Singapore server (RTT ~50 ms), split into the phases curl -w reports.

export type PhaseTone =
  "dns" | "handshake" | "travel" | "queue" | "server" | "transfer";

export interface Phase {
  label: string;
  start: number;
  end: number;
  tone: PhaseTone;
}

const TONE_COLOR: Record<PhaseTone, string> = {
  dns: "gateway",
  handshake: "load-balancer",
  travel: "client",
  queue: "queue",
  server: "server",
  transfer: "cdn",
};

export const toneStroke = (tone: PhaseTone) => `var(--sd-${TONE_COLOR[tone]})`;
export const toneFill = (tone: PhaseTone) =>
  `var(--sd-${TONE_COLOR[tone]}-soft)`;

/** Cold request, fine-grained (deep-dive step-through). */
export const COLD_PHASES: Phase[] = [
  { label: "DNS lookup", start: 0, end: 30, tone: "dns" },
  { label: "TCP handshake (১ RTT)", start: 30, end: 80, tone: "handshake" },
  { label: "TLS handshake (১ RTT)", start: 80, end: 130, tone: "handshake" },
  { label: "Request যাত্রা (½ RTT)", start: 130, end: 155, tone: "travel" },
  { label: "Server-এ লাইনে অপেক্ষা", start: 155, end: 165, tone: "queue" },
  { label: "Server-এর কাজ (app + DB)", start: 165, end: 195, tone: "server" },
  { label: "প্রথম byte ফেরা (½ RTT)", start: 195, end: 220, tone: "travel" },
  { label: "বাকি data (৫০০ KB)", start: 220, end: 260, tone: "transfer" },
];

export const TOTAL_MS = 260;

/** Maps ms on the time axis to x, for a plot that starts at `left` and is `width` wide. */
export const timeScale = (left: number, width: number) => (ms: number) =>
  left + (ms / TOTAL_MS) * width;

export function TimeAxis({
  x,
  y,
  top,
}: {
  x: (ms: number) => number;
  y: number;
  top: number;
}) {
  const ticks = [0, 50, 100, 150, 200, 250];
  return (
    <g fontSize={11} fill="var(--sd-edge)">
      <line x1={x(0)} x2={x(TOTAL_MS)} y1={y} y2={y} stroke="var(--sd-edge)" />
      {ticks.map((ms) => (
        <g key={ms}>
          <line
            x1={x(ms)}
            x2={x(ms)}
            y1={top}
            y2={y}
            stroke="var(--sd-edge)"
            strokeOpacity={0.15}
          />
          <text x={x(ms)} y={y + 16} textAnchor="middle">
            {ms}ms
          </text>
        </g>
      ))}
    </g>
  );
}

export function PhaseBar({
  phase,
  x,
  y,
  height,
  emphasis = false,
}: {
  phase: Phase;
  x: (ms: number) => number;
  y: number;
  height: number;
  emphasis?: boolean;
}) {
  const width = x(phase.end) - x(phase.start);
  return (
    <g>
      <rect
        x={x(phase.start)}
        y={y}
        width={width}
        height={height}
        rx={4}
        fill={toneFill(phase.tone)}
        stroke={toneStroke(phase.tone)}
        strokeWidth={emphasis ? 2.5 : 1.5}
      />
      <text
        x={x(phase.end) + 6}
        y={y + height / 2}
        dominantBaseline="central"
        fontSize={11}
        fill="var(--sd-label)"
      >
        {phase.end - phase.start}ms
      </text>
    </g>
  );
}

export function RowLabel({
  x,
  y,
  text,
  dimmed = false,
}: {
  x: number;
  y: number;
  text: string;
  dimmed?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="end"
      dominantBaseline="central"
      fontSize={12}
      fill="var(--sd-label)"
      opacity={dimmed ? 0.35 : 1}
    >
      {text}
    </text>
  );
}
