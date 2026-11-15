import {
  DiagramEdge,
  DiagramNode,
  NODE_HEIGHT,
  NODE_WIDTH,
  type DiagramKind,
} from "@/components/shared/diagram";

// Internal structure: what each hop receives. Addresses are documentation
// ranges (RFC 5737) plus a private 10.x address for the inner proxy.

const COL = 210;
const centerX = (i: number) => 100 + i * COL;

const HOPS: { kind: DiagramKind; label: string }[] = [
  { kind: "client", label: "Client 203.0.113.7" },
  { kind: "gateway", label: "Edge proxy" },
  { kind: "gateway", label: "NGINX" },
  { kind: "server", label: "App" },
];

type Line = { name: string; value: string; tone?: "fake" | "real" };

// What the next hop receives (cards under Edge proxy, NGINX and App).
const CARDS: Line[][] = [
  [
    { name: "TCP peer", value: "203.0.113.7" },
    { name: "XFF", value: "1.2.3.4  ← client-এর লেখা", tone: "fake" },
    { name: "Proto", value: "https" },
  ],
  [
    { name: "TCP peer", value: "172.68.10.20 (edge)" },
    { name: "XFF", value: "1.2.3.4, 203.0.113.7" },
    { name: "Proto", value: "https" },
    { name: "Via", value: "1.1 edge" },
  ],
  [
    { name: "TCP peer", value: "10.0.1.5 (NGINX)" },
    { name: "XFF", value: "1.2.3.4, 203.0.113.7," },
    { name: "", value: "172.68.10.20" },
    { name: "X-Real-IP", value: "203.0.113.7", tone: "real" },
    { name: "Via", value: "1.1 edge, 1.1 nginx" },
  ],
];

const CARD_W = 196;
const CARD_TOP = 110;
const LINE_H = 20;

const toneColor = (tone?: Line["tone"]) =>
  tone === "fake"
    ? "var(--sd-fail)"
    : tone === "real"
      ? "var(--sd-ok)"
      : "var(--sd-label)";

function HopCard({ lines, x }: { lines: Line[]; x: number }) {
  const height = lines.length * LINE_H + 34;
  return (
    <g>
      <rect
        x={x - CARD_W / 2}
        y={CARD_TOP}
        width={CARD_W}
        height={height}
        rx={8}
        fill="var(--sd-gateway-soft)"
        stroke="var(--sd-gateway)"
        strokeWidth={1.5}
      />
      <text
        x={x}
        y={CARD_TOP + 18}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill="var(--sd-edge)"
      >
        এখানে যা পৌঁছায়
      </text>
      {lines.map((line, i) => (
        <text
          key={`${line.name}-${i}`}
          x={x - CARD_W / 2 + 10}
          y={CARD_TOP + 40 + i * LINE_H}
          fontSize={11}
          fill={toneColor(line.tone)}
        >
          <tspan fontWeight={700}>{line.name ? `${line.name}: ` : "   "}</tspan>
          {line.value}
        </text>
      ))}
    </g>
  );
}

function HopRow() {
  return (
    <>
      {HOPS.map((hop, i) => (
        <g key={hop.label}>
          {i > 0 && (
            <DiagramEdge
              segment={{
                x1: centerX(i - 1) + NODE_WIDTH / 2,
                y1: 20 + NODE_HEIGHT / 2,
                x2: centerX(i) - NODE_WIDTH / 2,
                y2: 20 + NODE_HEIGHT / 2,
              }}
              label={`hop ${i}`}
            />
          )}
          <DiagramNode
            kind={hop.kind}
            label={hop.label}
            x={centerX(i) - NODE_WIDTH / 2}
            y={20}
          />
        </g>
      ))}
    </>
  );
}

function ReadingRule() {
  return (
    <g>
      <text
        x={420}
        y={300}
        textAnchor="middle"
        fontSize={12}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        XFF ডান থেকে পড়ুন: 172.68.10.20 (চেনা edge) বাদ → প্রথম অচেনা
        203.0.113.7 = আসল client
      </text>
      <text
        x={420}
        y={320}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        বামের 1.2.3.4 client নিজে লিখেছে, তাই বিশ্বাসযোগ্য না
      </text>
    </g>
  );
}

/** Headers added at each hop, and how to read X-Forwarded-For safely. */
export function Day015Headers() {
  return (
    <svg viewBox="0 0 840 336" width="100%">
      <HopRow />
      {CARDS.map((lines, i) => (
        <HopCard key={i} lines={lines} x={centerX(i + 1)} />
      ))}
      <ReadingRule />
    </svg>
  );
}
