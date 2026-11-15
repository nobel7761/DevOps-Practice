import { DiagramEdge } from "@/components/shared/diagram";

// Internal structure: request → cache key → the edge's table of stored entries.

const W = 800;
const H = 360;

type RowTone = "ok" | "warn" | "fail";

interface Row {
  key: string;
  state: string;
  tone: RowTone;
}

const ROWS: Row[] = [
  { key: "/static/app.3f9a.js", state: "তাজা · ১ বছর · immutable", tone: "ok" },
  { key: "/static/logo.svg", state: "তাজা · আর ১২s · ETag", tone: "ok" },
  { key: "/banner.jpg?utm=fb", state: "কপি ১", tone: "warn" },
  { key: "/banner.jpg?utm=wa", state: "কপি ২ · একই ছবি!", tone: "fail" },
  { key: "/style.css [br]", state: "Vary-র variant ১", tone: "ok" },
  { key: "/style.css [gzip]", state: "Vary-র variant ২", tone: "ok" },
  { key: "/api/me", state: "রাখা হয়নি (no-store)", tone: "fail" },
];

const TONE_COLOR: Record<RowTone, string> = {
  ok: "var(--sd-ok)",
  warn: "var(--sd-warn)",
  fail: "var(--sd-fail)",
};

function Box({
  x,
  y,
  width,
  height,
  title,
  lines,
  tone,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
  title: string;
  lines: string[];
  tone: "client" | "cdn";
}) {
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={10}
        fill={`var(--sd-${tone}-soft)`}
        stroke={`var(--sd-${tone})`}
        strokeWidth={1.5}
      />
      <text
        x={x + 12}
        y={y + 22}
        fontSize={12}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {title}
      </text>
      {lines.map((line, i) => (
        <text
          key={line}
          x={x + 12}
          y={y + 46 + i * 20}
          fontSize={11}
          fontFamily="monospace"
          fill="var(--sd-label)"
        >
          {line}
        </text>
      ))}
    </g>
  );
}

const TABLE_X = 420;
const TABLE_Y = 20;
const ROW_H = 40;
const KEY_W = 180;
const STATE_W = 190;

function CacheTable() {
  return (
    <g>
      <rect
        x={TABLE_X}
        y={TABLE_Y}
        width={KEY_W + STATE_W}
        height={ROW_H * (ROWS.length + 1)}
        rx={10}
        fill="var(--sd-canvas)"
        stroke="var(--sd-cdn)"
        strokeWidth={1.5}
      />
      <text
        x={TABLE_X + 12}
        y={TABLE_Y + 25}
        fontSize={12}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        Cache key (host বাদে)
      </text>
      <text
        x={TABLE_X + KEY_W + 12}
        y={TABLE_Y + 25}
        fontSize={12}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        রাখা কপি
      </text>
      {ROWS.map((row, i) => {
        const y = TABLE_Y + ROW_H * (i + 1);
        return (
          <g key={row.key}>
            <line
              x1={TABLE_X}
              x2={TABLE_X + KEY_W + STATE_W}
              y1={y}
              y2={y}
              stroke="var(--sd-edge)"
              strokeOpacity={0.4}
            />
            <text
              x={TABLE_X + 12}
              y={y + 24}
              fontSize={11}
              fontFamily="monospace"
              fill="var(--sd-label)"
              textDecoration={
                row.key === "/api/me" ? "line-through" : undefined
              }
            >
              {row.key}
            </text>
            <circle
              cx={TABLE_X + KEY_W + 10}
              cy={y + 20}
              r={5}
              fill={TONE_COLOR[row.tone]}
            />
            <text
              x={TABLE_X + KEY_W + 22}
              y={y + 24}
              fontSize={11}
              fill="var(--sd-label)"
            >
              {row.state}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Internal structure of an edge cache: how a key is built, and what is stored per key. */
export function Day011CacheKey() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%">
      <Box
        x={0}
        y={60}
        width={190}
        height={110}
        title="আসা request"
        lines={[
          "GET /banner.jpg?utm=fb",
          "Host: static.sajghor.com",
          "Accept-Encoding: br",
        ]}
        tone="client"
      />
      <DiagramEdge segment={{ x1: 192, y1: 115, x2: 222, y2: 115 }} />
      <Box
        x={224}
        y={40}
        width={170}
        height={150}
        title="Cache key তৈরি"
        lines={[
          "scheme + host",
          "+ path",
          "+ query string",
          "+ Vary-র header",
          "  (Accept-Encoding)",
        ]}
        tone="cdn"
      />
      <DiagramEdge
        segment={{ x1: 396, y1: 115, x2: 418, y2: 115 }}
        tone="active"
      />
      <CacheTable />
      <text x={0} y={230} fontSize={11} fill="var(--sd-label)">
        <tspan x={0} dy={0}>
          🟢 ঠিকঠাক কপি
        </tspan>
        <tspan x={0} dy={20}>
          🟡 / 🔴 query-র কারণে একই ছবির দুই কপি:
        </tspan>
        <tspan x={0} dy={18}>
          দুবার MISS, দুবার জায়গা
        </tspan>
        <tspan x={0} dy={20}>
          🔴 no-store: কখনো রাখা হয় না
        </tspan>
      </text>
    </svg>
  );
}
