import { DiagramEdge } from "@/components/shared/diagram";

const W = 760;
const H = 300;

function Person({
  x,
  y,
  emoji,
  label,
}: {
  x: number;
  y: number;
  emoji: string;
  label: string;
}) {
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={30}
        fill="var(--sd-user-soft)"
        stroke="var(--sd-user)"
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
    </g>
  );
}

const SHELF_ITEMS = [
  { label: "🍚 চাল ৮০৳", stale: false },
  { label: "🫘 ডাল ১৪০৳", stale: false },
  { label: "🛢️ তেল ১৯০৳ (পুরনো দাম!)", stale: true },
  { label: "🧂 লবণ ৪০৳", stale: false },
];

function CounterShelf() {
  return (
    <g>
      <rect
        x={250}
        y={40}
        width={210}
        height={190}
        rx={10}
        fill="var(--sd-cache-soft)"
        stroke="var(--sd-cache)"
        strokeWidth={2}
      />
      <text
        x={355}
        y={62}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        Counter-এর তাক (৪টা জায়গা)
      </text>
      {SHELF_ITEMS.map((item, i) => (
        <g key={item.label}>
          <rect
            x={265}
            y={76 + i * 36}
            width={180}
            height={28}
            rx={4}
            fill="var(--sd-canvas)"
            stroke={item.stale ? "var(--sd-warn)" : "var(--sd-cache)"}
            strokeWidth={item.stale ? 2 : 1}
          />
          <text
            x={355}
            y={90 + i * 36}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fill="var(--sd-label)"
          >
            {item.label}
          </text>
        </g>
      ))}
      <text
        x={355}
        y={252}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        = Cache: ছোট, কাছে, দ্রুত
      </text>
    </g>
  );
}

function Godown() {
  const rows = [0, 1, 2, 3];
  const cols = [0, 1, 2, 3, 4];
  return (
    <g>
      <rect
        x={560}
        y={40}
        width={180}
        height={190}
        rx={10}
        fill="var(--sd-database-soft)"
        stroke="var(--sd-database)"
        strokeWidth={2}
      />
      <text
        x={650}
        y={62}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        পেছনের গুদাম
      </text>
      {rows.map((r) =>
        cols.map((c) => (
          <text
            key={`${r}-${c}`}
            x={588 + c * 31}
            y={96 + r * 34}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={18}
          >
            📦
          </text>
        )),
      )}
      <text
        x={650}
        y={252}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        = Database: সব আছে, কিন্তু দূরে, ধীর
      </text>
    </g>
  );
}

/** Analogy illustration: the shopkeeper's counter shelf (cache) and the back godown (database). */
export function Day017Analogy() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%">
      <Person x={45} y={130} emoji="🧑" label="Customer" />
      <Person x={160} y={130} emoji="🧔" label="দোকানদার = App" />
      <DiagramEdge
        segment={{ x1: 77, y1: 130, x2: 127, y2: 130 }}
        label="চাল দিন"
      />
      <DiagramEdge
        segment={{ x1: 192, y1: 120, x2: 248, y2: 100 }}
        label="hit"
        tone="active"
      />
      <CounterShelf />
      <Godown />
      <DiagramEdge
        segment={{ x1: 462, y1: 135, x2: 558, y2: 135 }}
        label="miss: ৫ মিনিট"
        dashed
      />
      <text
        x={W / 2}
        y={288}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        তাক ভরা থাকলে কম বিক্রির জিনিস গুদামে ফেরত (eviction); দাম বদলালে তাকের
        ট্যাগও বদলাতে হয় (invalidation)
      </text>
    </svg>
  );
}
