import type { DiagramKind } from "@/components/shared/diagram";
import {
  DiagramEdge,
  kindColor,
  kindSoftColor,
} from "@/components/shared/diagram";

// Read-through, write-through, write-behind and write-around side by side.

const W = 780;
const ROW_H = 92;
const BOX_W = 120;
const BOX_H = 36;
const X = { app: 220, cache: 430, db: 640 } as const;

interface Pattern {
  name: string;
  note: string;
  appToCache?: { label: string; dashed?: boolean };
  cacheToDb?: { label: string; dashed?: boolean };
  appToDb?: string;
}

const PATTERNS: Pattern[] = [
  {
    name: "Read-through",
    note: "Miss হলে cache নিজেই আনে",
    appToCache: { label: "১. read" },
    cacheToDb: { label: "২. miss → load" },
  },
  {
    name: "Write-through",
    note: "দুটোতেই লিখে তবে OK",
    appToCache: { label: "১. write" },
    cacheToDb: { label: "২. সাথে সাথে write" },
  },
  {
    name: "Write-behind",
    note: "আগে OK, DB-তে পরে",
    appToCache: { label: "১. write → OK" },
    cacheToDb: { label: "২. পরে, batch-এ", dashed: true },
  },
  {
    name: "Write-around",
    note: "শুধু DB-তে লেখে",
    appToCache: { label: "DEL (ঐচ্ছিক)", dashed: true },
    appToDb: "write সরাসরি DB-তে",
  },
];

function Box({
  x,
  y,
  kind,
  label,
}: {
  x: number;
  y: number;
  kind: DiagramKind;
  label: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={BOX_W}
        height={BOX_H}
        rx={6}
        fill={kindSoftColor(kind)}
        stroke={kindColor(kind)}
        strokeWidth={1.5}
      />
      <text
        x={x + BOX_W / 2}
        y={y + BOX_H / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
        fill="var(--sd-label)"
      >
        {label}
      </text>
    </g>
  );
}

function PatternRow({ pattern, index }: { pattern: Pattern; index: number }) {
  const y = 12 + index * ROW_H;
  const mid = y + BOX_H / 2;
  return (
    <g>
      <text
        x={10}
        y={mid - 6}
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {pattern.name}
      </text>
      <text x={10} y={mid + 12} fontSize={10} fill="var(--sd-edge)">
        {pattern.note}
      </text>
      <Box x={X.app} y={y} kind="server" label="App" />
      <Box x={X.cache} y={y} kind="cache" label="Cache" />
      <Box x={X.db} y={y} kind="database" label="DB" />
      {pattern.appToCache && (
        <DiagramEdge
          segment={{ x1: X.app + BOX_W, y1: mid, x2: X.cache, y2: mid }}
          label={pattern.appToCache.label}
          dashed={pattern.appToCache.dashed}
        />
      )}
      {pattern.cacheToDb && (
        <DiagramEdge
          segment={{ x1: X.cache + BOX_W, y1: mid, x2: X.db, y2: mid }}
          label={pattern.cacheToDb.label}
          dashed={pattern.cacheToDb.dashed}
          tone={pattern.cacheToDb.dashed ? "normal" : "active"}
        />
      )}
      {pattern.appToDb && (
        <g>
          <path
            d={`M ${X.app + BOX_W / 2} ${y + BOX_H} Q ${(X.app + X.db + BOX_W) / 2} ${y + BOX_H + 44} ${X.db + BOX_W / 2} ${y + BOX_H + 4}`}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={2.5}
          />
          <polygon
            points={`${X.db + BOX_W / 2},${y + BOX_H} ${X.db + BOX_W / 2 - 9},${y + BOX_H + 10} ${X.db + BOX_W / 2 + 3},${y + BOX_H + 13}`}
            fill="var(--primary)"
          />
          <text
            x={(X.app + X.db + BOX_W) / 2}
            y={y + BOX_H + 34}
            textAnchor="middle"
            fontSize={11}
            fill="var(--sd-label)"
          >
            {pattern.appToDb}
          </text>
        </g>
      )}
    </g>
  );
}

/** Four cache patterns as rows: who writes where, and in what order. */
export function Day017WritePatterns() {
  const h = 12 + PATTERNS.length * ROW_H + 10;
  return (
    <svg viewBox={`0 0 ${W} ${h}`} width="100%">
      {PATTERNS.map((pattern, i) => (
        <PatternRow key={pattern.name} pattern={pattern} index={i} />
      ))}
    </svg>
  );
}
