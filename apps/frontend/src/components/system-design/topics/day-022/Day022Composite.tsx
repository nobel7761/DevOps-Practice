// Leftmost-prefix rule: a composite index on (city, age) is sorted by city first, then age.
// Filtering by city hits one contiguous block; filtering by age alone is scattered everywhere.

const ENTRIES: [string, number][] = [
  ["Barishal", 25],
  ["Barishal", 30],
  ["Dhaka", 22],
  ["Dhaka", 30],
  ["Dhaka", 41],
  ["Khulna", 30],
  ["Khulna", 52],
  ["Sylhet", 19],
  ["Sylhet", 30],
];

const TOP = 70;
const ROW_H = 26;
const COL_W = 230;

interface Panel {
  x: number;
  title: string;
  verdict: string;
  ok: boolean;
  match: (entry: [string, number]) => boolean;
}

const PANELS: Panel[] = [
  {
    x: 20,
    title: "WHERE city = 'Dhaka'",
    verdict: "✓ একটানা এক জায়গায়",
    ok: true,
    match: ([city]) => city === "Dhaka",
  },
  {
    x: 380,
    title: "WHERE age = 30",
    verdict: "✗ পুরো index-জুড়ে ছড়ানো",
    ok: false,
    match: ([, age]) => age === 30,
  },
];

function EntryRow({
  x,
  index,
  entry,
  on,
  ok,
}: {
  x: number;
  index: number;
  entry: [string, number];
  on: boolean;
  ok: boolean;
}) {
  const y = TOP + index * ROW_H;
  const color = ok ? "var(--sd-ok)" : "var(--sd-fail)";
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={COL_W}
        height={ROW_H - 4}
        rx={4}
        fill={on ? "var(--sd-database-soft)" : "var(--sd-canvas)"}
        stroke={on ? color : "var(--sd-database)"}
        strokeWidth={on ? 2.5 : 1}
      />
      <text
        x={x + 12}
        y={y + (ROW_H - 4) / 2}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={on ? 700 : 400}
        fill="var(--sd-label)"
      >
        ({entry[0]}, {entry[1]}) → row
      </text>
    </g>
  );
}

function IndexPanel({ panel }: { panel: Panel }) {
  const color = panel.ok ? "var(--sd-ok)" : "var(--sd-fail)";
  return (
    <g>
      <text
        x={panel.x}
        y={24}
        fontSize={13}
        fontWeight={700}
        fontFamily="ui-monospace, Menlo, monospace"
        fill="var(--sd-label)"
      >
        {panel.title}
      </text>
      <text x={panel.x} y={46} fontSize={12} fontWeight={700} fill={color}>
        {panel.verdict}
      </text>
      {ENTRIES.map((entry, i) => (
        <EntryRow
          key={entry.join("-")}
          x={panel.x}
          index={i}
          entry={entry}
          on={panel.match(entry)}
          ok={panel.ok}
        />
      ))}
    </g>
  );
}

/** Two copies of the same (city, age) index: one query uses the leftmost column, the other skips it. */
export function Day022Composite() {
  return (
    <svg viewBox="0 0 640 340" width="100%">
      {PANELS.map((panel) => (
        <IndexPanel key={panel.title} panel={panel} />
      ))}
      <text x={20} y={318} fontSize={12} fill="var(--sd-edge)">
        Index (city, age): আগে city দিয়ে sorted, একই city-র ভেতরে age দিয়ে।
        Phone book-এর (পদবি, নাম)-এর মতো।
      </text>
    </svg>
  );
}
