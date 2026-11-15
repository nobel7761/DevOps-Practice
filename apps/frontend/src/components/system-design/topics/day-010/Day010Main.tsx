import {
  DiagramEdge,
  DiagramNode,
  NODE_HEIGHT,
  NODE_WIDTH,
} from "@/components/shared/diagram";

// Main diagram: app servers → connection pool → database engine (query processor, WAL, buffer cache, data files).

const APP_Y = [30, 150, 270];
const POOL = { x: 190, y: 30, w: 120, h: 304 };
const SLOTS = [
  "conn 1 · busy",
  "conn 2 · busy",
  "conn 3 · busy",
  "conn 4 · idle",
  "conn 5 · idle",
];

interface EngineBox {
  x: number;
  y: number;
  title: string;
  lines: string[];
  memory?: boolean;
}

const QP: EngineBox = {
  x: 360,
  y: 66,
  title: "Query Processor",
  lines: ["Parser → Planner", "→ Executor"],
};
const BUFFER: EngineBox = {
  x: 360,
  y: 216,
  title: "Buffer Cache (RAM)",
  lines: ["page memory-তে বদলায়", "(dirty page)"],
  memory: true,
};
const WAL: EngineBox = {
  x: 600,
  y: 66,
  title: "WAL (disk)",
  lines: ["append-only log", "COMMIT-এ fsync"],
};
const DATA: EngineBox = {
  x: 600,
  y: 216,
  title: "Data Files (disk)",
  lines: ["table ও index page", "পরে, checkpoint-এ"],
};
const BOX_W = 185;
const BOX_H = 76;

function AppServers() {
  return (
    <g>
      {APP_Y.map((y, i) => (
        <g key={y}>
          <DiagramNode
            kind="server"
            label={`App Server ${i + 1}`}
            x={10}
            y={y}
          />
          <DiagramEdge
            segment={{
              x1: 10 + NODE_WIDTH,
              y1: y + NODE_HEIGHT / 2,
              x2: POOL.x - 2,
              y2: y + NODE_HEIGHT / 2,
            }}
          />
        </g>
      ))}
    </g>
  );
}

function Pool() {
  return (
    <g>
      <rect
        x={POOL.x}
        y={POOL.y}
        width={POOL.w}
        height={POOL.h}
        rx={10}
        fill="var(--sd-server-soft)"
        stroke="var(--sd-server)"
        strokeWidth={2}
      />
      <text
        x={POOL.x + POOL.w / 2}
        y={POOL.y + 22}
        textAnchor="middle"
        fontSize={12.5}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        Connection Pool
      </text>
      {SLOTS.map((slot, i) => {
        const busy = slot.endsWith("busy");
        return (
          <g key={slot}>
            <rect
              x={POOL.x + 10}
              y={POOL.y + 40 + i * 50}
              width={POOL.w - 20}
              height={34}
              rx={5}
              fill={busy ? "var(--sd-canvas)" : "var(--sd-server-soft)"}
              stroke={busy ? "var(--primary)" : "var(--sd-edge)"}
              strokeWidth={busy ? 2 : 1}
              strokeDasharray={busy ? undefined : "4 3"}
            />
            <text
              x={POOL.x + POOL.w / 2}
              y={POOL.y + 57 + i * 50}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={11.5}
              fill="var(--sd-label)"
            >
              {slot}
            </text>
          </g>
        );
      })}
    </g>
  );
}

function Box({ box }: { box: EngineBox }) {
  const kind = box.memory ? "cache" : "database";
  return (
    <g>
      <rect
        x={box.x}
        y={box.y}
        width={BOX_W}
        height={BOX_H}
        rx={8}
        fill={`var(--sd-${kind}-soft)`}
        stroke={`var(--sd-${kind})`}
        strokeWidth={2}
      />
      <text
        x={box.x + 12}
        y={box.y + 24}
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {box.title}
      </text>
      {box.lines.map((line, i) => (
        <text
          key={line}
          x={box.x + 12}
          y={box.y + 46 + i * 17}
          fontSize={11.5}
          fill="var(--sd-edge)"
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function EngineFrame() {
  return (
    <g>
      <rect
        x={340}
        y={10}
        width={466}
        height={380}
        rx={14}
        fill="var(--sd-canvas)"
        stroke="var(--sd-database)"
        strokeWidth={2}
        strokeDasharray="8 5"
      />
      <text
        x={356}
        y={40}
        fontSize={14}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        Database Engine (DBMS)
      </text>
      <text x={356} y={340} fontSize={11.5} fill="var(--sd-label)">
        ① বদলের record WAL-এ; COMMIT-এ fsync, তারপর client-কে OK
      </text>
      <text x={356} y={358} fontSize={11.5} fill="var(--sd-label)">
        ② page memory-তে বদলায় ③ পরে checkpoint-এ data file-এ
      </text>
      <text x={356} y={376} fontSize={11} fill="var(--sd-edge)">
        Crash হলে: শেষ checkpoint থেকে WAL replay (redo)
      </text>
    </g>
  );
}

function EngineEdges() {
  return (
    <g>
      <DiagramEdge
        segment={{ x1: POOL.x + POOL.w + 2, y1: 104, x2: QP.x - 2, y2: 104 }}
        label="SQL"
        tone="active"
      />
      <DiagramEdge
        segment={{ x1: QP.x + BOX_W + 2, y1: 104, x2: WAL.x - 2, y2: 104 }}
        label="①"
        tone="active"
      />
      <DiagramEdge
        segment={{
          x1: QP.x + 92,
          y1: QP.y + BOX_H + 2,
          x2: QP.x + 92,
          y2: BUFFER.y - 2,
        }}
        label="②"
        tone="active"
      />
      <DiagramEdge
        segment={{ x1: BUFFER.x + BOX_W + 2, y1: 254, x2: DATA.x - 2, y2: 254 }}
        label="③"
      />
      <DiagramEdge
        segment={{
          x1: WAL.x + 92,
          y1: WAL.y + BOX_H + 2,
          x2: WAL.x + 92,
          y2: DATA.y - 2,
        }}
        label="replay"
        dashed
        tone="failed"
      />
    </g>
  );
}

/** Main diagram: app servers borrow pooled connections; the engine logs first, writes data files later. */
export function Day010Main() {
  return (
    <svg viewBox="0 0 816 400" width="100%">
      <AppServers />
      <Pool />
      <EngineFrame />
      <EngineEdges />
      <Box box={QP} />
      <Box box={BUFFER} />
      <Box box={WAL} />
      <Box box={DATA} />
    </svg>
  );
}
