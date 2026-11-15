import { DiagramEdge, type DiagramKind } from "@/components/shared/diagram";

// Main diagram: the six-step estimation pipeline, with formulas and the
// "টাকাঘর" example value under each step; a dashed sanity-check loop back.

const W = 780;
const H = 380;
const BOX_W = 220;
const BOX_H = 116;
const ROW1 = 30;
const ROW2 = 236;

interface Step {
  n: string;
  title: string;
  lines: [string, string];
  example: string;
  kind: DiagramKind;
  x: number;
  y: number;
}

const STEPS: Step[] = [
  {
    n: "১",
    title: "Assumptions",
    lines: ["DAU, প্রতি user কয়টা কাজ", "read:write, আকার, peak"],
    example: "১ কোটি × ২, peak ×১০",
    kind: "user",
    x: 20,
    y: ROW1,
  },
  {
    n: "২",
    title: "Traffic (QPS)",
    lines: ["দিনের request ÷ 10⁵", "× peak factor"],
    example: "২০০ → ২,০০০ TPS",
    kind: "load-balancer",
    x: 280,
    y: ROW1,
  },
  {
    n: "৩",
    title: "Storage",
    lines: ["write × আকার × দিন", "× (1 + index) × replica"],
    example: "~৩৩TB / বছর",
    kind: "database",
    x: 540,
    y: ROW1,
  },
  {
    n: "৪",
    title: "Bandwidth",
    lines: ["peak QPS × response", "byte × 8 = bit/s"],
    example: "~০.২ Gbps",
    kind: "cdn",
    x: 540,
    y: ROW2,
  },
  {
    n: "৫",
    title: "Cache memory",
    lines: ["hot ~২০% × আকার", "× overhead × replica"],
    example: "~১GB",
    kind: "cache",
    x: 280,
    y: ROW2,
  },
  {
    n: "৬",
    title: "Servers",
    lines: ["peak ÷ (capacity × util)", "+ N+1"],
    example: "১০টা app server",
    kind: "server",
    x: 20,
    y: ROW2,
  },
];

function StepBox({ step }: { step: Step }) {
  const { x, y, kind } = step;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={BOX_W}
        height={BOX_H}
        rx={12}
        fill={`var(--sd-${kind}-soft)`}
        stroke={`var(--sd-${kind})`}
        strokeWidth={1.8}
      />
      <circle cx={x + 22} cy={y + 22} r={13} fill={`var(--sd-${kind})`} />
      <text
        x={x + 22}
        y={y + 22}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-canvas)"
      >
        {step.n}
      </text>
      <text
        x={x + 44}
        y={y + 27}
        fontSize={15}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {step.title}
      </text>
      {step.lines.map((line, i) => (
        <text
          key={line}
          x={x + 14}
          y={y + 56 + i * 18}
          fontSize={12}
          fill="var(--sd-label)"
        >
          {line}
        </text>
      ))}
      <text
        x={x + 14}
        y={y + 102}
        fontSize={12}
        fontWeight={700}
        fill="var(--primary)"
      >
        যেমন: {step.example}
      </text>
    </g>
  );
}

/** The estimation pipeline (main, downloadable). */
export function Day019Pipeline() {
  const mid1 = ROW1 + BOX_H / 2;
  const mid2 = ROW2 + BOX_H / 2;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      {STEPS.map((step) => (
        <StepBox key={step.n} step={step} />
      ))}
      <DiagramEdge segment={{ x1: 242, y1: mid1, x2: 278, y2: mid1 }} />
      <DiagramEdge segment={{ x1: 502, y1: mid1, x2: 538, y2: mid1 }} />
      <DiagramEdge
        segment={{ x1: 650, y1: ROW1 + BOX_H + 2, x2: 650, y2: ROW2 - 2 }}
      />
      <DiagramEdge segment={{ x1: 538, y1: mid2, x2: 502, y2: mid2 }} />
      <DiagramEdge
        segment={{ x1: 278, y1: mid2, x2: 242, y2: mid2 }}
        tone="active"
      />
      <DiagramEdge
        segment={{ x1: 130, y1: ROW2 - 2, x2: 130, y2: ROW1 + BOX_H + 2 }}
        dashed
        tone="failed"
      />
      <text
        x={142}
        y={(ROW1 + BOX_H + ROW2) / 2 + 4}
        fontSize={12}
        fontWeight={700}
        fill="var(--sd-fail)"
      >
        ↺ sanity check: উল্টো দিক থেকে মেলান
      </text>
      <text
        x={W / 2}
        y={H - 8}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        উদাহরণের সংখ্যা: কাল্পনিক &quot;টাকাঘর&quot; wallet
      </text>
    </svg>
  );
}

const MINI: { label: string; kind: DiagramKind }[] = [
  { label: "Assumptions", kind: "user" },
  { label: "QPS", kind: "load-balancer" },
  { label: "Storage", kind: "database" },
  { label: "Bandwidth", kind: "cdn" },
  { label: "Cache", kind: "cache" },
  { label: "Servers", kind: "server" },
];

const FACTS = ["86,400 ≈ 10⁵", "1 byte = 8 bit", "2¹⁰ ≈ 10³"];

/** Compact cheat sheet for the summary card. */
export function Day019Summary() {
  return (
    <svg viewBox="0 0 640 190" width="100%" role="img">
      {MINI.map((m, i) => {
        const x = 10 + i * 105;
        return (
          <g key={m.label}>
            <rect
              x={x}
              y={20}
              width={90}
              height={46}
              rx={10}
              fill={`var(--sd-${m.kind}-soft)`}
              stroke={`var(--sd-${m.kind})`}
              strokeWidth={1.5}
            />
            <text
              x={x + 45}
              y={43}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={12}
              fontWeight={700}
              fill="var(--sd-label)"
            >
              {m.label}
            </text>
            {i < MINI.length - 1 && (
              <DiagramEdge
                segment={{ x1: x + 91, y1: 43, x2: x + 104, y2: 43 }}
              />
            )}
          </g>
        );
      })}
      {FACTS.map((fact, i) => (
        <g key={fact}>
          <rect
            x={30 + i * 200}
            y={100}
            width={180}
            height={52}
            rx={10}
            fill="var(--sd-canvas)"
            stroke="var(--primary)"
            strokeWidth={1.5}
          />
          <text
            x={120 + i * 200}
            y={126}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={16}
            fontWeight={700}
            fill="var(--sd-label)"
          >
            {fact}
          </text>
        </g>
      ))}
      <text
        x={320}
        y={180}
        textAnchor="middle"
        fontSize={12}
        fill="var(--sd-edge)"
      >
        Peak-এর জন্য design · × index × replica · capacity মাপুন, তারপর N+1
      </text>
    </svg>
  );
}
