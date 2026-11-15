import { toneFill, toneStroke, type PhaseTone } from "./Day007Timeline";

// Summary card diagram: the three ideas side by side, plus a mini waterfall.

const W = 660;
const H = 250;
const CARD_W = 200;
const GAP = 30;

interface Idea {
  title: string;
  lines: string[];
  color: string;
}

const IDEAS: Idea[] = [
  {
    title: "Latency",
    lines: ["একটা request কত সময়", "ms · p50 / p95 / p99"],
    color: "client",
  },
  {
    title: "Throughput",
    lines: ["প্রতি সেকেন্ডে কতগুলো", "req/s · MB/s"],
    color: "server",
  },
  {
    title: "Little's Law",
    lines: ["L = λ × W", "concurrency = rate × time"],
    color: "queue",
  },
];

const MINI: { label: string; ms: number; tone: PhaseTone }[] = [
  { label: "DNS", ms: 30, tone: "dns" },
  { label: "TCP", ms: 50, tone: "handshake" },
  { label: "TLS", ms: 50, tone: "handshake" },
  { label: "network + server", ms: 90, tone: "travel" },
  { label: "transfer", ms: 40, tone: "transfer" },
];

function IdeaCard({ idea, index }: { idea: Idea; index: number }) {
  const x = index * (CARD_W + GAP);
  return (
    <g>
      <rect
        x={x}
        y={0}
        width={CARD_W}
        height={110}
        rx={12}
        fill={`var(--sd-${idea.color}-soft)`}
        stroke={`var(--sd-${idea.color})`}
        strokeWidth={1.5}
      />
      <text
        x={x + CARD_W / 2}
        y={32}
        textAnchor="middle"
        fontSize={16}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {idea.title}
      </text>
      {idea.lines.map((line, i) => (
        <text
          key={line}
          x={x + CARD_W / 2}
          y={62 + i * 22}
          textAnchor="middle"
          fontSize={12}
          fill="var(--sd-label)"
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function MiniWaterfall() {
  const total = MINI.reduce((sum, p) => sum + p.ms, 0);
  const scale = W / total;
  // Each phase starts where the previous ones ended (running sum).
  const starts = MINI.map((_, i) =>
    MINI.slice(0, i).reduce((sum, p) => sum + p.ms, 0),
  );
  return (
    <g>
      <text x={0} y={150} fontSize={12} fontWeight={700} fill="var(--sd-label)">
        User-এর latency = সব ধাপের যোগফল (server শুধু একটা টুকরো)
      </text>
      {MINI.map((phase, i) => {
        const x = starts[i] * scale;
        const width = phase.ms * scale;
        return (
          <g key={phase.label}>
            <rect
              x={x}
              y={164}
              width={width - 2}
              height={30}
              rx={4}
              fill={toneFill(phase.tone)}
              stroke={toneStroke(phase.tone)}
              strokeWidth={1.5}
            />
            <text
              x={x + width / 2}
              y={179}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={11}
              fill="var(--sd-label)"
            >
              {phase.label}
            </text>
          </g>
        );
      })}
      <text x={0} y={226} fontSize={12} fill="var(--sd-edge)">
        স্বাধীন call: parallel-এ সর্বোচ্চ, sequential-এ যোগফল · fan-out-এ 1 −
        0.99ⁿ
      </text>
    </g>
  );
}

/** Compact cheat-sheet diagram for the summary card. */
export function Day007Summary() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      {IDEAS.map((idea, i) => (
        <IdeaCard key={idea.title} idea={idea} index={i} />
      ))}
      <MiniWaterfall />
    </svg>
  );
}
