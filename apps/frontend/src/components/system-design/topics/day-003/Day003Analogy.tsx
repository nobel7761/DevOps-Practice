import { DiagramEdge } from "@/components/shared/diagram";

// Analogy illustration: the rickshaw-puller asks police → market office → block manager, then you enter shop 214.

const W = 760;
const H = 440;

type Tone = "user" | "server" | "external" | "database";

function Figure({
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
  tone: Tone;
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

const ASKED = [
  {
    y: 50,
    emoji: "👮",
    label: "ট্রাফিক পুলিশ",
    sub: "= Root",
    reply: "“সমিতিতে যান”",
  },
  {
    y: 125,
    emoji: "🏢",
    label: "মার্কেট সমিতি",
    sub: "= TLD",
    reply: "“B ব্লকের ম্যানেজার জানেন”",
  },
  {
    y: 200,
    emoji: "🧑‍💼",
    label: "ব্লক ম্যানেজার",
    sub: "= Authoritative",
    reply: "“দোকান নং ২১৪” ✓",
  },
];

const ASK_X = 470;

/** A person with the label to the right, for the column of people the resolver asks. */
function SideFigure({ y, emoji, label, sub, reply }: (typeof ASKED)[number]) {
  return (
    <g>
      <circle
        cx={ASK_X}
        cy={y}
        r={26}
        fill="var(--sd-external-soft)"
        stroke="var(--sd-external)"
        strokeWidth={1.5}
      />
      <text
        x={ASK_X}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={22}
      >
        {emoji}
      </text>
      <text
        x={ASK_X + 40}
        y={y - 12}
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {label}{" "}
        <tspan fontSize={11} fontWeight={400} fill="var(--sd-edge)">
          {sub}
        </tspan>
      </text>
      <text x={ASK_X + 40} y={y + 10} fontSize={12} fill="var(--sd-label)">
        {reply}
      </text>
    </g>
  );
}

function AskRow() {
  const y = 125;
  return (
    <g>
      <text x={20} y={24} fontSize={13} fontWeight={700} fill="var(--sd-label)">
        ১. ঠিকানা খোঁজা (DNS)
      </text>
      <Figure
        x={60}
        y={y}
        emoji="🧑"
        label="আপনি"
        sub="= Browser"
        tone="user"
      />
      <DiagramEdge
        segment={{ x1: 92, y1: y, x2: 178, y2: y }}
        label="বইঘর?"
        tone="active"
      />
      <Figure
        x={210}
        y={y}
        emoji="🛺"
        label="রিকশাওয়ালা মামা"
        sub="= Resolver (cache)"
        tone="server"
      />
      {ASKED.map((a, i) => (
        <g key={a.label}>
          <DiagramEdge
            segment={{ x1: 242, y1: y - 10 + i * 10, x2: ASK_X - 28, y2: a.y }}
            label={["১", "২", "৩"][i]}
          />
          <SideFigure {...a} />
        </g>
      ))}
    </g>
  );
}

function ShopRow() {
  const y = 350;
  return (
    <g>
      <text
        x={20}
        y={272}
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        ২. দোকানে গিয়ে চাওয়া (TCP + TLS + HTTP)
      </text>
      <Figure
        x={60}
        y={y}
        emoji="🧑"
        label="আপনি"
        sub="= Browser"
        tone="user"
      />
      <DiagramEdge
        segment={{ x1: 92, y1: y - 10, x2: 268, y2: y - 10 }}
        label="রূপসী বাংলা, একটা"
        tone="active"
      />
      <DiagramEdge
        segment={{ x1: 268, y1: y + 12, x2: 92, y2: y + 12 }}
        label="আছে, এই নিন (200)"
        dashed
      />
      <rect
        x={270}
        y={y - 60}
        width={460}
        height={120}
        rx={12}
        fill="var(--sd-server-soft)"
        stroke="var(--sd-server)"
        strokeWidth={2}
      />
      <text
        x={290}
        y={y - 38}
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        বইঘর · দোকান নং ২১৪ (= Server)
      </text>
      <text
        x={330}
        y={y + 8}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={30}
      >
        📜
      </text>
      <text
        x={330}
        y={y + 42}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        trade license = TLS certificate
      </text>
      <text
        x={500}
        y={y + 8}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={30}
      >
        🧑‍🏫📚
      </text>
      <text
        x={500}
        y={y + 42}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        দোকানদার = HTTP response
      </text>
      <text
        x={655}
        y={y + 8}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={30}
      >
        💳
      </text>
      <text
        x={655}
        y={y + 42}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        মেম্বারশিপ কার্ড = Cookie
      </text>
    </g>
  );
}

/** Analogy illustration: finding shop 214 in New Market, then asking for the book. */
export function Day003Analogy() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%">
      <AskRow />
      <ShopRow />
    </svg>
  );
}
