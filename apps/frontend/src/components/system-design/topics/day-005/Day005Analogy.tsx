import { DiagramEdge } from "@/components/shared/diagram";

const W = 760;
const H = 300;

function Person({
  x,
  y,
  emoji = "🧍",
}: {
  x: number;
  y: number;
  emoji?: string;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={20}
    >
      {emoji}
    </text>
  );
}

function Counter({
  x,
  y,
  label,
  sub,
}: {
  x: number;
  y: number;
  label: string;
  sub?: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={92}
        height={52}
        rx={8}
        fill="var(--sd-server-soft)"
        stroke="var(--sd-server)"
        strokeWidth={1.5}
      />
      <text
        x={x + 16}
        y={y + 26}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={18}
      >
        🧑‍🍳
      </text>
      <text
        x={x + 58}
        y={y + 20}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {label}
      </text>
      {sub && (
        <text
          x={x + 58}
          y={y + 37}
          textAnchor="middle"
          fontSize={10}
          fill="var(--sd-edge)"
        >
          {sub}
        </text>
      )}
    </g>
  );
}

function Caption({
  x,
  y,
  text,
  color = "var(--sd-label)",
}: {
  x: number;
  y: number;
  text: string;
  color?: string;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fontSize={13}
      fontWeight={700}
      fill={color}
    >
      {text}
    </text>
  );
}

/** Left: one ফুচকা counter with a long line. */
function SingleStall() {
  const line = [40, 70, 100, 130, 160, 190, 220];
  return (
    <g>
      <Caption
        x={150}
        y={24}
        text="আগে: একটাই counter"
        color="var(--sd-fail)"
      />
      <Counter x={104} y={50} label="ফুচকা" sub="= একটা server" />
      {line.map((y, i) => (
        <Person key={y} x={60} y={y + 10 + i * 2} />
      ))}
      <text
        x={60}
        y={268}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-fail)"
      >
        লম্বা লাইন, ৪০ মিনিট
      </text>
      <text
        x={180}
        y={150}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        হাত দুটো, গতি সীমিত
      </text>
    </g>
  );
}

/** Right: a guide splits the crowd over three counters that share one pot. */
function ScaledStall() {
  const counters = [40, 120, 200];
  return (
    <g>
      <Caption x={560} y={24} text="পরে: তিনটা counter" color="var(--sd-ok)" />
      <Person x={380} y={110} />
      <Person x={380} y={145} />
      <Person x={380} y={180} />
      <circle
        cx={440}
        cy={145}
        r={22}
        fill="var(--sd-load-balancer-soft)"
        stroke="var(--sd-load-balancer)"
        strokeWidth={1.5}
      />
      <text
        x={440}
        y={145}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={20}
      >
        🙋
      </text>
      <text
        x={440}
        y={185}
        textAnchor="middle"
        fontSize={10}
        fill="var(--sd-edge)"
      >
        লাইন ভাগ করে
      </text>
      <text
        x={440}
        y={199}
        textAnchor="middle"
        fontSize={10}
        fill="var(--sd-edge)"
      >
        = Load Balancer
      </text>
      {counters.map((y, i) => (
        <g key={y}>
          <DiagramEdge segment={{ x1: 462, y1: 145, x2: 498, y2: y + 26 }} />
          <Counter x={500} y={y} label={`Counter ${["১", "২", "৩"][i]}`} />
          <DiagramEdge
            segment={{ x1: 592, y1: y + 26, x2: 640, y2: 140 }}
            dashed
            tone={i === 1 ? "failed" : "normal"}
          />
        </g>
      ))}
      <rect
        x={642}
        y={112}
        width={100}
        height={60}
        rx={10}
        fill="var(--sd-database-soft)"
        stroke="var(--sd-database)"
        strokeWidth={2}
      />
      <text x={692} y={136} textAnchor="middle" fontSize={20}>
        🫙
      </text>
      <text
        x={692}
        y={160}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        একটাই টক-জলের হাঁড়ি
      </text>
      <text
        x={692}
        y={192}
        textAnchor="middle"
        fontSize={10}
        fill="var(--sd-edge)"
      >
        = shared Database
      </text>
      <text
        x={692}
        y={206}
        textAnchor="middle"
        fontSize={10}
        fill="var(--sd-fail)"
      >
        পরের bottleneck!
      </text>
    </g>
  );
}

/** Analogy illustration: a বইমেলা ফুচকা stall grows from one counter to three. */
export function Day005Analogy() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%">
      <SingleStall />
      <line
        x1={300}
        y1={20}
        x2={300}
        y2={280}
        stroke="var(--sd-edge)"
        strokeDasharray="4 4"
      />
      <ScaledStall />
    </svg>
  );
}
