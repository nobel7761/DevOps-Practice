// Internal structure: what an L4 vs an L7 load balancer can see inside one
// HTTPS request. Addresses are documentation ranges (RFC 5737).

const ROWS = [
  {
    name: "IP header",
    value: "src 198.51.100.7 → dst 203.0.113.10",
    kind: "load-balancer",
  },
  {
    name: "TCP header",
    value: "src port 51234 → dst port 443",
    kind: "load-balancer",
  },
  {
    name: "TLS",
    value: "🔒 encrypted bytes (key ছাড়া অর্থহীন)",
    kind: "external",
  },
  {
    name: "HTTP line",
    value: "GET /api/orders · Host: shop.example.com",
    kind: "gateway",
  },
  {
    name: "HTTP headers",
    value: "Cookie: session=… · Authorization · User-Agent",
    kind: "gateway",
  },
] as const;

const X = 150;
const ROW_W = 380;
const ROW_H = 40;
const GAP = 10;
const TOP = 44;
const rowY = (i: number) => TOP + i * (ROW_H + GAP);

function Bracket({
  x,
  from,
  to,
  side,
  title,
  sub,
  color,
}: {
  x: number;
  from: number;
  to: number;
  side: "left" | "right";
  title: string;
  sub: string;
  color: string;
}) {
  const tick = side === "left" ? 8 : -8;
  const mid = (from + to) / 2;
  const textX = side === "left" ? x - 10 : x + 10;
  const anchor = side === "left" ? "end" : "start";
  return (
    <g>
      <path
        d={`M ${x + tick} ${from} H ${x} V ${to} H ${x + tick}`}
        fill="none"
        stroke={color}
        strokeWidth={2.5}
      />
      <text
        x={textX}
        y={mid - 6}
        textAnchor={anchor}
        fontSize={13}
        fontWeight={700}
        fill={color}
      >
        {title}
      </text>
      <text
        x={textX}
        y={mid + 12}
        textAnchor={anchor}
        fontSize={11}
        fill="var(--sd-edge)"
      >
        {sub}
      </text>
    </g>
  );
}

/** L4 sees addresses and ports; L7 (after TLS termination) sees the whole HTTP request. */
export function Day009Layers() {
  const last = rowY(ROWS.length - 1) + ROW_H;
  return (
    <svg viewBox="0 0 700 320" width="100%">
      <text
        x={X + ROW_W / 2}
        y={22}
        textAnchor="middle"
        fontSize={14}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        একটা HTTPS request-এর ভেতরে
      </text>
      {ROWS.map((row, i) => (
        <g key={row.name}>
          <rect
            x={X}
            y={rowY(i)}
            width={ROW_W}
            height={ROW_H}
            rx={8}
            fill={`var(--sd-${row.kind}-soft)`}
            stroke={`var(--sd-${row.kind})`}
            strokeWidth={1.5}
          />
          <text
            x={X + 12}
            y={rowY(i) + ROW_H / 2}
            dominantBaseline="central"
            fontSize={12}
            fontWeight={700}
            fill="var(--sd-label)"
          >
            {row.name}
          </text>
          <text
            x={X + 112}
            y={rowY(i) + ROW_H / 2}
            dominantBaseline="central"
            fontSize={11.5}
            fill="var(--sd-label)"
          >
            {row.value}
          </text>
        </g>
      ))}
      <Bracket
        x={X - 8}
        from={rowY(0)}
        to={rowY(1) + ROW_H}
        side="left"
        title="L4 LB দেখে"
        sub="IP + port"
        color="var(--sd-load-balancer)"
      />
      <text
        x={X - 18}
        y={rowY(3) + 10}
        textAnchor="end"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        বাকিটা L4-এর
      </text>
      <text
        x={X - 18}
        y={rowY(3) + 26}
        textAnchor="end"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        কাছে শুধু bytes
      </text>
      <Bracket
        x={X + ROW_W + 8}
        from={rowY(0)}
        to={last}
        side="right"
        title="L7 LB দেখে"
        sub="TLS খোলার পরে, সব"
        color="var(--primary)"
      />
      <text
        x={X + ROW_W / 2}
        y={last + 24}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        L4: connection ধরে সিদ্ধান্ত, দ্রুত ও সস্তা · L7: প্রতিটা request ধরে
        সিদ্ধান্ত, বেশি ক্ষমতা, বেশি CPU
      </text>
    </svg>
  );
}
