// The four NoSQL families as a map: one representative and one realistic use each.

const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";
const CARD_W = 340;
const CARD_H = 136;

interface Family {
  title: string;
  example: string;
  shape: string[];
  use: string;
  color: string;
  x: number;
  y: number;
}

const FAMILIES: Family[] = [
  {
    title: "Key-Value",
    example: "যেমন Redis",
    shape: ['"session:42" → {user: 7, cart: [...]}'],
    use: "ব্যবহার: login session, cache, counter",
    color: "cache",
    x: 10,
    y: 10,
  },
  {
    title: "Document",
    example: "যেমন MongoDB",
    shape: [
      '{ name: "Phone X", price: 18500,',
      '  specs: { ram: "8GB", camera: ... } }',
    ],
    use: "ব্যবহার: আলাদা আলাদা field-এর product catalog",
    color: "database",
    x: 370,
    y: 10,
  },
  {
    title: "Wide-Column",
    example: "যেমন Cassandra",
    shape: [
      "chat_id=91 → (10:01, msg) (10:02, msg) …",
      "partition-এর ভেতরে সময় অনুযায়ী sorted",
    ],
    use: "ব্যবহার: বিশাল write: chat, sensor, log",
    color: "server",
    x: 10,
    y: 160,
  },
  {
    title: "Graph",
    example: "যেমন Neo4j",
    shape: [],
    use: "ব্যবহার: বন্ধুর বন্ধু, fraud ring খোঁজা",
    color: "cdn",
    x: 370,
    y: 160,
  },
];

function MiniGraph({ x, y }: { x: number; y: number }) {
  const nodes = [
    { cx: x + 30, cy: y + 18, t: "রহিম" },
    { cx: x + 120, cy: y + 18, t: "করিম" },
    { cx: x + 210, cy: y + 18, t: "সালমা" },
  ];
  return (
    <g>
      <line
        x1={nodes[0].cx}
        y1={nodes[0].cy}
        x2={nodes[1].cx}
        y2={nodes[1].cy}
        stroke="var(--sd-cdn)"
        strokeWidth={2}
      />
      <line
        x1={nodes[1].cx}
        y1={nodes[1].cy}
        x2={nodes[2].cx}
        y2={nodes[2].cy}
        stroke="var(--sd-cdn)"
        strokeWidth={2}
      />
      <text
        x={x + 75}
        y={y + 10}
        textAnchor="middle"
        fontSize={10}
        fill="var(--sd-edge)"
      >
        FRIEND
      </text>
      <text
        x={x + 165}
        y={y + 10}
        textAnchor="middle"
        fontSize={10}
        fill="var(--sd-edge)"
      >
        FRIEND
      </text>
      {nodes.map((n) => (
        <g key={n.t}>
          <circle
            cx={n.cx}
            cy={n.cy}
            r={15}
            fill="var(--sd-cdn-soft)"
            stroke="var(--sd-cdn)"
            strokeWidth={1.5}
          />
          <text
            x={n.cx}
            y={n.cy + 30}
            textAnchor="middle"
            fontSize={10.5}
            fill="var(--sd-label)"
          >
            {n.t}
          </text>
        </g>
      ))}
    </g>
  );
}

function FamilyCard({ family }: { family: Family }) {
  const { x, y, color } = family;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={CARD_W}
        height={CARD_H}
        rx={10}
        fill={`var(--sd-${color}-soft)`}
        stroke={`var(--sd-${color})`}
        strokeWidth={2}
      />
      <text
        x={x + 14}
        y={y + 26}
        fontSize={14}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {family.title}
      </text>
      <text
        x={x + CARD_W - 14}
        y={y + 26}
        textAnchor="end"
        fontSize={11.5}
        fill="var(--sd-edge)"
      >
        {family.example}
      </text>
      {family.shape.length > 0 ? (
        family.shape.map((line, i) => (
          <text
            key={line}
            x={x + 14}
            y={y + 56 + i * 18}
            fontSize={11}
            fontFamily={MONO}
            fill="var(--sd-label)"
          >
            {line}
          </text>
        ))
      ) : (
        <MiniGraph x={x + 40} y={y + 40} />
      )}
      <text
        x={x + 14}
        y={y + CARD_H - 16}
        fontSize={12}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {family.use}
      </text>
    </g>
  );
}

/** NoSQL families map (intro only; Day 20 goes deep). */
export function Day010NoSqlMap() {
  return (
    <svg viewBox="0 0 720 306" width="100%">
      {FAMILIES.map((family) => (
        <FamilyCard key={family.title} family={family} />
      ))}
    </svg>
  );
}
