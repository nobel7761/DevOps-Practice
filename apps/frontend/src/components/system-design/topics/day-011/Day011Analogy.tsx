import { DiagramEdge } from "@/components/shared/diagram";

const W = 780;
const H = 320;

function Place({
  x,
  y,
  emoji,
  label,
  sub,
  tone,
}: {
  x: number;
  y: number;
  emoji: string;
  label: string;
  sub: string;
  tone: "server" | "cache" | "cdn";
}) {
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={30}
        fill={`var(--sd-${tone}-soft)`}
        stroke={`var(--sd-${tone})`}
        strokeWidth={1.5}
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={26}
      >
        {emoji}
      </text>
      <text
        x={x}
        y={y + 48}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {label}
      </text>
      <text
        x={x}
        y={y + 65}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        {sub}
      </text>
    </g>
  );
}

interface Depot {
  y: number;
  name: string;
  shelf: string;
  empty?: boolean;
}

const DEPOTS: Depot[] = [
  { y: 50, name: "সিলেট depot", shelf: "📦📦📦 মেয়াদ: ২০ দিন" },
  { y: 150, name: "কুমিল্লা depot", shelf: "📦📦 মেয়াদ: ৫ দিন" },
  { y: 250, name: "কক্সবাজার depot", shelf: "তাক খালি", empty: true },
];

function DepotRow({ depot }: { depot: Depot }) {
  const { y, name, shelf, empty } = depot;
  return (
    <g>
      <rect
        x={470}
        y={y - 26}
        width={170}
        height={52}
        rx={10}
        fill="var(--sd-cdn-soft)"
        stroke={empty ? "var(--sd-fail)" : "var(--sd-cdn)"}
        strokeWidth={1.5}
        strokeDasharray={empty ? "6 4" : undefined}
      />
      <text
        x={555}
        y={y - 8}
        textAnchor="middle"
        fontSize={12}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        🏪 {name}
      </text>
      <text
        x={555}
        y={y + 12}
        textAnchor="middle"
        fontSize={11}
        fill={empty ? "var(--sd-fail)" : "var(--sd-edge)"}
      >
        {shelf}
      </text>
      <DiagramEdge
        segment={{ x1: 642, y1: y, x2: 700, y2: y }}
        label={empty ? "MISS" : "HIT"}
        tone={empty ? "failed" : "active"}
      />
      <text
        x={726}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={22}
      >
        🧑
      </text>
    </g>
  );
}

/** Analogy: Dhaka warehouse (origin) → divisional hub (shield) → district depots (edge PoPs). */
export function Day011Analogy() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%">
      <Place
        x={70}
        y={130}
        emoji="🏭"
        label="ঢাকার গুদাম"
        sub="= Origin"
        tone="server"
      />
      <Place
        x={300}
        y={130}
        emoji="🏬"
        label="বিভাগীয় hub"
        sub="= Origin shield"
        tone="cache"
      />
      <DiagramEdge
        segment={{ x1: 270, y1: 130, x2: 102, y2: 130 }}
        label="hub-এ না থাকলে"
        dashed
      />
      {DEPOTS.map((depot) => (
        <DepotRow key={depot.name} depot={depot} />
      ))}
      <DiagramEdge segment={{ x1: 330, y1: 120, x2: 468, y2: 55 }} />
      <DiagramEdge segment={{ x1: 330, y1: 135, x2: 468, y2: 150 }} />
      <DiagramEdge
        segment={{ x1: 468, y1: 245, x2: 326, y2: 150 }}
        label="আনিয়ে দাও"
        dashed
        tone="failed"
      />
      <text
        x={555}
        y={305}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        = Edge (PoP), মেয়াদ = TTL
      </text>
    </svg>
  );
}
