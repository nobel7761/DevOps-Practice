import { DiagramEdge } from "@/components/shared/diagram";

// Inside a big two-socket server: each socket has its own nearby (local)
// memory; reaching the other socket's memory crosses the interconnect.

const W = 680;
const H = 300;
const SOCKET_W = 270;
const SOCKET_H = 230;
const SOCKETS = [
  { x: 20, name: "Socket 0", node: 0 },
  { x: 390, name: "Socket 1", node: 1 },
];
const SOCKET_Y = 20;
const CORE_Y = SOCKET_Y + 40;
const RAM_Y = SOCKET_Y + 160;

function Core({ x }: { x: number }) {
  return (
    <g>
      <rect
        x={x}
        y={CORE_Y}
        width={50}
        height={40}
        rx={6}
        fill="var(--sd-server-soft)"
        stroke="var(--sd-server)"
        strokeWidth={1.5}
      />
      <text
        x={x + 25}
        y={CORE_Y + 20}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fill="var(--sd-label)"
      >
        Core
      </text>
    </g>
  );
}

function Socket({ x, name, node }: { x: number; name: string; node: number }) {
  return (
    <g>
      <rect
        x={x}
        y={SOCKET_Y}
        width={SOCKET_W}
        height={SOCKET_H}
        rx={14}
        fill="none"
        stroke="var(--sd-edge)"
        strokeWidth={1.5}
      />
      <text
        x={x + 14}
        y={SOCKET_Y + 22}
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {name}
      </text>
      {[0, 1, 2, 3].map((i) => (
        <Core key={i} x={x + 16 + i * 62} />
      ))}
      <rect
        x={x + 20}
        y={RAM_Y}
        width={SOCKET_W - 40}
        height={50}
        rx={8}
        fill="var(--sd-database-soft)"
        stroke="var(--sd-database)"
        strokeWidth={1.5}
      />
      <text
        x={x + SOCKET_W / 2}
        y={RAM_Y + 25}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
        fill="var(--sd-label)"
      >
        Local RAM (NUMA node {node})
      </text>
    </g>
  );
}

function Interconnect() {
  const y = SOCKET_Y + SOCKET_H / 2 + 10;
  return (
    <g>
      <line
        x1={SOCKETS[0].x + SOCKET_W}
        x2={SOCKETS[1].x}
        y1={y}
        y2={y}
        stroke="var(--sd-edge)"
        strokeWidth={6}
        strokeOpacity={0.5}
      />
      <text
        x={(SOCKETS[0].x + SOCKET_W + SOCKETS[1].x) / 2}
        y={y + 20}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        interconnect
      </text>
    </g>
  );
}

/** Internal structure of a big server: local vs remote memory access (NUMA). */
export function Day013Numa() {
  const coreBottom = CORE_Y + 40;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      {SOCKETS.map((s) => (
        <Socket key={s.name} {...s} />
      ))}
      <Interconnect />
      <DiagramEdge
        segment={{ x1: 61, y1: coreBottom + 2, x2: 61, y2: RAM_Y - 2 }}
        label="local · দ্রুত"
        tone="active"
      />
      <DiagramEdge
        segment={{ x1: 160, y1: coreBottom + 2, x2: 470, y2: RAM_Y - 2 }}
        label="remote · ধীর"
        tone="failed"
        dashed
      />
      <text
        x={W / 2}
        y={H - 12}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        Thread এক socket-এ, তার data অন্য socket-এর RAM-এ → machine বড়, তবু ধীর
      </text>
    </svg>
  );
}
