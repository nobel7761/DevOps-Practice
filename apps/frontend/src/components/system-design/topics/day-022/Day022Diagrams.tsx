import {
  ArchitectureDiagram,
  DiagramEdge,
  type ArchitectureEdge,
  type ArchitectureNode,
} from "@/components/shared/diagram";

// Day 22 core diagrams: the full table scan (before), index → table (main), and the summary card.

const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";

function QueryBox({ x, y, lines }: { x: number; y: number; lines: string[] }) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={190}
        height={28 + lines.length * 20}
        rx={8}
        fill="var(--sd-client-soft)"
        stroke="var(--sd-client)"
        strokeWidth={1.5}
      />
      {lines.map((line, i) => (
        <text
          key={line}
          x={x + 12}
          y={y + 24 + i * 20}
          fontSize={12}
          fontFamily={MONO}
          fill="var(--sd-label)"
        >
          {line}
        </text>
      ))}
    </g>
  );
}

const SCAN_ROWS: { roll: string; match?: boolean; gap?: boolean }[] = [
  { roll: "731205" },
  { roll: "104877" },
  { roll: "559310" },
  { roll: "482913", match: true },
  { roll: "220461" },
  { roll: "⋮", gap: true },
  { roll: "918002" },
];

const SCAN_LEFT = 300;
const SCAN_TOP = 46;
const SCAN_ROW_H = 30;

function ScanRow({
  index,
  roll,
  match,
  gap,
}: {
  index: number;
  roll: string;
  match?: boolean;
  gap?: boolean;
}) {
  const y = SCAN_TOP + index * SCAN_ROW_H;
  const mid = y + (SCAN_ROW_H - 4) / 2;
  return (
    <g>
      <rect
        x={SCAN_LEFT}
        y={y}
        width={200}
        height={SCAN_ROW_H - 4}
        rx={4}
        fill="var(--sd-database-soft)"
        stroke="var(--sd-database)"
      />
      <text
        x={SCAN_LEFT + 12}
        y={mid}
        dominantBaseline="central"
        fontSize={12}
        fontFamily={MONO}
        fill="var(--sd-label)"
      >
        {gap ? "⋮" : `roll ${roll} · GPA …`}
      </text>
      {!gap && (
        <text
          x={SCAN_LEFT + 184}
          y={mid}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={14}
          fontWeight={700}
          fill={match ? "var(--sd-ok)" : "var(--sd-fail)"}
        >
          {match ? "✓" : "✗"}
        </text>
      )}
    </g>
  );
}

function ScanBracket() {
  const x = SCAN_LEFT + 214;
  const notes = [
    { text: "প্রতিটা row", dy: 70, strong: true },
    { text: "পড়ে মেলানো", dy: 88, strong: true },
    { text: "মিলে গেলেও", dy: 112 },
    { text: "থামে না", dy: 128 },
  ];
  return (
    <g>
      <line
        x1={x}
        y1={SCAN_TOP}
        x2={x}
        y2={SCAN_TOP + SCAN_ROWS.length * SCAN_ROW_H - 4}
        stroke="var(--sd-fail)"
        strokeWidth={2}
      />
      {notes.map((note) => (
        <text
          key={note.text}
          x={x + 8}
          y={SCAN_TOP + note.dy}
          fontSize={note.strong ? 12 : 11}
          fontWeight={note.strong ? 700 : 400}
          fill={note.strong ? "var(--sd-fail)" : "var(--sd-edge)"}
        >
          {note.text}
        </text>
      ))}
    </g>
  );
}

/** Before: without an index the database reads every row and checks it. */
export function Day022Before() {
  return (
    <svg viewBox="0 0 640 290" width="100%">
      <QueryBox
        x={10}
        y={100}
        lines={["SELECT * FROM results", "WHERE roll = 482913;"]}
      />
      <DiagramEdge
        segment={{ x1: 202, y1: 122, x2: SCAN_LEFT - 8, y2: SCAN_TOP + 14 }}
        label="Seq Scan"
        tone="failed"
      />
      <text
        x={SCAN_LEFT}
        y={SCAN_TOP - 14}
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        results table (20 লাখ row)
      </text>
      {SCAN_ROWS.map((row, i) => (
        <ScanRow key={row.roll} index={i} {...row} />
      ))}
      <ScanBracket />
      <text x={10} y={270} fontSize={12} fill="var(--sd-edge)">
        ১টা row খুঁজতে ২০,০০,০০০ row পড়া = O(n)
      </text>
    </svg>
  );
}

const INDEX_ENTRIES = [
  { roll: "104877", tid: "(812, 4)", row: 3 },
  { roll: "220461", tid: "(3, 7)", row: 1 },
  { roll: "482913", tid: "(5120, 2)", row: 4, hit: true },
  { roll: "559310", tid: "(77, 1)", row: 2 },
  { roll: "731205", tid: "(1, 1)", row: 0 },
  { roll: "918002", tid: "(9999, 3)", row: 5 },
];

const TABLE_ROWS = [
  "page 1 · 731205 · 4.50",
  "page 3 · 220461 · 5.00",
  "page 77 · 559310 · 3.83",
  "page 812 · 104877 · 4.17",
  "page 5120 · 482913 · 5.00",
  "page 9999 · 918002 · 3.50",
];

const MAIN_TOP = 60;
const MAIN_ROW_H = 36;
const IDX_X = 20;
const IDX_W = 220;
const TBL_X = 440;
const TBL_W = 260;
const rowMid = (i: number) => MAIN_TOP + i * MAIN_ROW_H + (MAIN_ROW_H - 6) / 2;

function Cell({
  x,
  y,
  width,
  text,
  hit,
}: {
  x: number;
  y: number;
  width: number;
  text: string;
  hit?: boolean;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={MAIN_ROW_H - 6}
        rx={5}
        fill={hit ? "var(--sd-database-soft)" : "var(--sd-canvas)"}
        stroke="var(--sd-database)"
        strokeWidth={hit ? 2.5 : 1.2}
      />
      <text
        x={x + 12}
        y={y + (MAIN_ROW_H - 6) / 2}
        dominantBaseline="central"
        fontSize={12}
        fontFamily={MONO}
        fontWeight={hit ? 700 : 400}
        fill="var(--sd-label)"
      >
        {text}
      </text>
    </g>
  );
}

function ColumnTitle({
  x,
  title,
  sub,
}: {
  x: number;
  title: string;
  sub: string;
}) {
  return (
    <g>
      <text x={x} y={24} fontSize={14} fontWeight={700} fill="var(--sd-label)">
        {title}
      </text>
      <text x={x} y={42} fontSize={11} fill="var(--sd-edge)">
        {sub}
      </text>
    </g>
  );
}

function PointerEdges() {
  return (
    <g>
      {INDEX_ENTRIES.map((entry, i) => (
        <DiagramEdge
          key={entry.roll}
          segment={{
            x1: IDX_X + IDX_W + 4,
            y1: rowMid(i),
            x2: TBL_X - 6,
            y2: rowMid(entry.row),
          }}
          tone={entry.hit ? "active" : "normal"}
          dashed={!entry.hit}
        />
      ))}
    </g>
  );
}

/** Main: a separate, sorted structure (roll → row address) that points into the unsorted table. */
export function Day022Main() {
  return (
    <svg viewBox="0 0 720 330" width="100%">
      <ColumnTitle
        x={IDX_X}
        title="Index: idx_results_roll"
        sub="roll অনুযায়ী sorted · শুধু key + row-এর ঠিকানা"
      />
      <ColumnTitle
        x={TBL_X}
        title="Table: results"
        sub="যে ক্রমে এসেছে সেভাবে · পুরো row"
      />
      <PointerEdges />
      {INDEX_ENTRIES.map((entry, i) => (
        <Cell
          key={entry.roll}
          x={IDX_X}
          y={MAIN_TOP + i * MAIN_ROW_H}
          width={IDX_W}
          text={`${entry.roll} → ${entry.tid}`}
          hit={entry.hit}
        />
      ))}
      {TABLE_ROWS.map((row, i) => (
        <Cell
          key={row}
          x={TBL_X}
          y={MAIN_TOP + i * MAIN_ROW_H}
          width={TBL_W}
          text={row}
          hit={i === 4}
        />
      ))}
      <text x={IDX_X} y={300} fontSize={12} fill="var(--sd-label)">
        WHERE roll = 482913 → sorted index-এ খুঁজে (O(log n)) ঠিকানা (5120, 2) →
        সরাসরি ওই page-এর row
      </text>
      <text x={IDX_X} y={320} fontSize={11} fill="var(--sd-edge)">
        (page, slot) = PostgreSQL-এর row-ঠিকানা (TID)। বাস্তবে index-টা একটা
        B+tree, Deep dive-এ দেখব।
      </text>
    </svg>
  );
}

const SUMMARY_NODES: ArchitectureNode[] = [
  { id: "query", kind: "client", label: "WHERE key = ?", x: 0, y: 70 },
  {
    id: "index",
    kind: "database",
    label: "Index (B+tree)",
    x: 250,
    y: 0,
    status: "highlight",
  },
  { id: "table", kind: "database", label: "Table rows", x: 500, y: 70 },
];

const SUMMARY_EDGES: ArchitectureEdge[] = [
  { from: "query", to: "index", label: "O(log n)", tone: "active" },
  { from: "index", to: "table", label: "row-এর ঠিকানা", tone: "active" },
  {
    from: "query",
    to: "table",
    label: "index নেই: Seq Scan O(n)",
    tone: "failed",
    dashed: true,
  },
];

/** Compact version for the summary card. */
export function Day022Summary() {
  return <ArchitectureDiagram nodes={SUMMARY_NODES} edges={SUMMARY_EDGES} />;
}
