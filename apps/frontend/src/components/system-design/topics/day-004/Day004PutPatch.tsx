// Internal structure: what the stored resource looks like after PUT vs PATCH with the same body.

interface Field {
  key: string;
  value: string;
  state?: "changed" | "gone";
}

interface Card {
  x: number;
  title: string;
  request: string;
  fields: Field[];
  note: string;
  color: string;
}

const W = 210;
const TOP = 64;
const ROW = 26;

const CARDS: Card[] = [
  {
    x: 10,
    title: "এখন server-এ",
    request: "GET /products/2",
    fields: [
      { key: "id", value: "2" },
      { key: "name", value: '"Nakshi Kantha"' },
      { key: "price", value: "2200" },
      { key: "stock", value: "10" },
    ],
    note: "শুরুর অবস্থা",
    color: "var(--sd-edge)",
  },
  {
    x: 245,
    title: "PUT-এর পরে",
    request: 'PUT {"price": 2000}',
    fields: [
      { key: "id", value: "2" },
      { key: "name", value: "—", state: "gone" },
      { key: "price", value: "2000", state: "changed" },
      { key: "stock", value: "—", state: "gone" },
    ],
    note: "পুরোটা বদলে গেল: যা পাঠাননি তা মুছে গেল",
    color: "var(--sd-fail)",
  },
  {
    x: 480,
    title: "PATCH-এর পরে",
    request: 'PATCH {"price": 2000}',
    fields: [
      { key: "id", value: "2" },
      { key: "name", value: '"Nakshi Kantha"' },
      { key: "price", value: "2000", state: "changed" },
      { key: "stock", value: "10" },
    ],
    note: "শুধু পাঠানো field বদলাল",
    color: "var(--sd-ok)",
  },
];

function fieldColor(field: Field) {
  if (field.state === "gone") return "var(--sd-fail)";
  if (field.state === "changed") return "var(--primary)";
  return "var(--sd-label)";
}

function ResourceCard({ card }: { card: Card }) {
  return (
    <g>
      <text
        x={card.x + W / 2}
        y={22}
        textAnchor="middle"
        fontSize={14}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {card.title}
      </text>
      <text
        x={card.x + W / 2}
        y={44}
        textAnchor="middle"
        fontSize={11}
        fontFamily="monospace"
        fill="var(--sd-edge)"
      >
        {card.request}
      </text>
      <rect
        x={card.x}
        y={TOP - 10}
        width={W}
        height={ROW * 4 + 28}
        rx={8}
        fill="var(--sd-canvas)"
        stroke={card.color}
        strokeWidth={2}
      />
      {card.fields.map((field, i) => (
        <text
          key={field.key}
          x={card.x + 16}
          y={TOP + 14 + i * ROW}
          fontSize={12}
          fontFamily="monospace"
          fill={fieldColor(field)}
          textDecoration={field.state === "gone" ? "line-through" : undefined}
        >
          {field.key}: {field.value}
        </text>
      ))}
      <text
        x={card.x + W / 2}
        y={TOP + ROW * 4 + 44}
        textAnchor="middle"
        fontSize={11}
        fontWeight={600}
        fill={card.color}
      >
        {card.note}
      </text>
    </g>
  );
}

export function Day004PutPatch() {
  return (
    <svg viewBox="0 0 700 220" width="100%">
      {CARDS.map((card) => (
        <ResourceCard key={card.title} card={card} />
      ))}
    </svg>
  );
}
