import { StepThrough } from "@/components/shared/diagram";
import {
  COLD_PHASES,
  PhaseBar,
  RowLabel,
  TimeAxis,
  timeScale,
} from "./Day007Timeline";

// Step-through: the cold request's phases appear one by one while a clock
// shows the time accumulated so far.

const W = 720;
const PLOT_LEFT = 210;
const PLOT_WIDTH = 440;
const ROW_TOP = 50;
const ROW_H = 30;
const BAR_H = 18;
const AXIS_Y = ROW_TOP + ROW_H * COLD_PHASES.length + 4;
const H = AXIS_Y + 30;

const x = timeScale(PLOT_LEFT, PLOT_WIDTH);
const rowY = (index: number) => ROW_TOP + index * ROW_H + (ROW_H - BAR_H) / 2;

function Clock({ ms, ttfb }: { ms: number; ttfb: boolean }) {
  return (
    <g>
      <rect
        x={W - 210}
        y={4}
        width={210}
        height={32}
        rx={8}
        fill="var(--sd-canvas)"
        stroke="var(--primary)"
        strokeWidth={1.5}
      />
      <text
        x={W - 105}
        y={20}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={14}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        ⏱ জমা সময়: {ms}ms{ttfb ? " (TTFB)" : ""}
      </text>
    </g>
  );
}

function Frame({ visible }: { visible: number }) {
  const current = COLD_PHASES[visible - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <Clock ms={current.end} ttfb={current.end === 220} />
      <TimeAxis x={x} y={AXIS_Y} top={ROW_TOP} />
      {COLD_PHASES.map((phase, i) => (
        <g key={phase.label}>
          <RowLabel
            x={PLOT_LEFT - 10}
            y={rowY(i) + BAR_H / 2}
            text={phase.label}
            dimmed={i >= visible}
          />
          {i < visible && (
            <PhaseBar
              phase={phase}
              x={x}
              y={rowY(i)}
              height={BAR_H}
              emphasis={i === visible - 1}
            />
          )}
        </g>
      ))}
    </svg>
  );
}

const STEPS = [
  "DNS: browser প্রথমে নাম থেকে IP খোঁজে। Cache-এ না থাকায় resolver-কে জিজ্ঞেস করতে হলো, ৩০ms। পরের request-এ এটা প্রায় শূন্য।",
  "TCP handshake: SYN গেল, SYN-ACK ফিরল। ঠিক এক round trip, ৫০ms। Server এখনো আমাদের request দেখেইনি।",
  "TLS 1.3 handshake: certificate আর encryption key ঠিক করতে আরও এক round trip। ১৩০ms চলে গেল, অথচ এক byte-ও আসল data আসেনি।",
  "Request-টা ঢাকা থেকে Singapore পৌঁছাল: আধা round trip, ২৫ms। এই অংশ শুধু দূরত্বের দাম, কোনো code দিয়ে কমানো যায় না।",
  "Server ব্যস্ত, তাই request ১০ms লাইনে দাঁড়াল (queuing)। Load বাড়লে এই অংশটাই সবচেয়ে দ্রুত বাড়ে।",
  "এবার server-এর আসল কাজ: app logic আর database query, ৩০ms। Server-এর log-এ শুধু এই অংশ (আর বড়জোর লাইনটা) দেখা যায়।",
  "প্রথম byte ঢাকায় ফিরল: আরও ২৫ms। এখন ২২০ms, এটাই TTFB (time to first byte)।",
  "বাকি ৫০০ KB আসতে ৪০ms (100 Mbps-এ ৪ Mbit)। মোট ২৬০ms, যার মাত্র ~৪০ms server-এ। Warm request হলে (DNS cache, খোলা connection) প্রথম তিন ধাপ বাদ, মোট ~১৩০ms।",
];

/** Step-through of one request's journey with time accumulating (deep dive). */
export function Day007Journey() {
  return (
    <StepThrough
      steps={STEPS}
      frames={COLD_PHASES.map((phase, i) => (
        <div key={phase.label} className="overflow-x-auto">
          <div className="min-w-[600px]">
            <Frame visible={i + 1} />
          </div>
        </div>
      ))}
    />
  );
}
