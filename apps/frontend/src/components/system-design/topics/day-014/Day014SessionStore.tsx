import { DiagramEdge } from "@/components/shared/diagram";

// Inside a Redis session store: one key per session, each with its own TTL,
// copied asynchronously to a replica.

const W = 780;
const H = 300;

const KEYS = [
  {
    key: "sess:9f2c41…",
    value: "{user_id: 42, csrf: …}",
    ttl: "TTL 1742s",
    fill: 0.97,
  },
  {
    key: "sess:a71b0e…",
    value: "{user_id: 108, lang: bn}",
    ttl: "TTL 95s",
    fill: 0.06,
  },
  {
    key: "sess:03de5a…",
    value: "মেয়াদ শেষ → Redis নিজে মুছেছে",
    ttl: "TTL 0",
    fill: 0,
    expired: true,
  },
];

const BAR_X = 410;
const BAR_W = 90;

function KeyRow({ y, item }: { y: number; item: (typeof KEYS)[number] }) {
  const muted = item.expired;
  return (
    <g opacity={muted ? 0.55 : 1}>
      <rect
        x={30}
        y={y}
        width={490}
        height={40}
        rx={6}
        fill="var(--sd-canvas)"
        stroke="var(--sd-cache)"
        strokeDasharray={muted ? "5 4" : undefined}
      />
      <text
        x={44}
        y={y + 20}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={700}
        fontFamily="monospace"
        fill="var(--sd-label)"
      >
        {item.key}
      </text>
      <text
        x={160}
        y={y + 20}
        dominantBaseline="central"
        fontSize={11}
        fill="var(--sd-label)"
      >
        {item.value}
      </text>
      <rect
        x={BAR_X}
        y={y + 13}
        width={BAR_W}
        height={8}
        rx={4}
        fill="var(--sd-cache-soft)"
      />
      <rect
        x={BAR_X}
        y={y + 13}
        width={BAR_W * item.fill}
        height={8}
        rx={4}
        fill={item.fill < 0.1 ? "var(--sd-warn)" : "var(--sd-cache)"}
      />
      <text
        x={BAR_X + BAR_W / 2}
        y={y + 32}
        textAnchor="middle"
        fontSize={10}
        fill="var(--sd-edge)"
      >
        {item.ttl}
      </text>
    </g>
  );
}

/** Internal structure: session keys with TTLs, plus async replication. */
export function Day014SessionStore() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%">
      <rect
        x={14}
        y={14}
        width={520}
        height={230}
        rx={12}
        fill="var(--sd-cache-soft)"
        stroke="var(--sd-cache)"
        strokeWidth={2}
      />
      <text x={30} y={40} fontSize={13} fontWeight={700} fill="var(--sd-label)">
        Redis primary · maxmemory-policy: noeviction
      </text>
      <text x={30} y={60} fontSize={11} fill="var(--sd-edge)">
        প্রতিটা session = একটা key · প্রতিটা key-র নিজের TTL (sliding: প্রতি
        request-এ আবার ১৮০০s)
      </text>
      {KEYS.map((item, i) => (
        <KeyRow key={item.key} y={76 + i * 52} item={item} />
      ))}
      <rect
        x={600}
        y={84}
        width={160}
        height={90}
        rx={12}
        fill="var(--sd-cache-soft)"
        stroke="var(--sd-cache)"
        strokeWidth={1.5}
        strokeDasharray="6 4"
      />
      <text
        x={680}
        y={116}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        Replica
      </text>
      <text
        x={680}
        y={138}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        কয়েক ms পিছিয়ে
      </text>
      <text
        x={680}
        y={156}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        primary মরলে promote
      </text>
      <DiagramEdge
        segment={{ x1: 536, y1: 129, x2: 598, y2: 129 }}
        label="async"
        dashed
      />
      <text
        x={W / 2}
        y={276}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        Failover-এ replica-তে না পৌঁছানো শেষ কয়েকটা write হারাতে পারে: কিছু
        user-কে আবার login করতে হতে পারে, data নষ্ট হয় না।
      </text>
    </svg>
  );
}
