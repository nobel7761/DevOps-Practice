import { DiagramEdge } from "@/components/shared/diagram";

// Analogy illustration: bank counter (client/server) on top, courier hubs (Internet) below.

const W = 720;
const H = 420;

function Figure({
  x,
  y,
  emoji,
  label,
  sub,
  tone,
}: {
  x: number;
  y: number;
  emoji: string;
  label: string;
  sub: string;
  tone: "user" | "server" | "database";
}) {
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={30}
        fill={`var(--sd-${tone}-soft)`}
        stroke={`var(--sd-${tone})`}
        strokeWidth={1.5}
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={26}
      >
        {emoji}
      </text>
      <text
        x={x}
        y={y + 48}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {label}
      </text>
      <text
        x={x}
        y={y + 65}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        {sub}
      </text>
    </g>
  );
}

function BankRow() {
  return (
    <g>
      <text x={20} y={28} fontSize={13} fontWeight={700} fill="var(--sd-label)">
        ১. ব্যাংকের counter
      </text>
      <Figure
        x={90}
        y={95}
        emoji="🧑"
        label="Customer"
        sub="= Client"
        tone="user"
      />
      <DiagramEdge
        segment={{ x1: 122, y1: 85, x2: 318, y2: 85 }}
        label="slip: ৫,০০০ টাকা দিন"
        tone="active"
      />
      <DiagramEdge
        segment={{ x1: 318, y1: 108, x2: 122, y2: 108 }}
        label="টাকা / balance নেই"
        dashed
      />
      <Figure
        x={350}
        y={95}
        emoji="💁"
        label="Teller"
        sub="= Server"
        tone="server"
      />
      <DiagramEdge
        segment={{ x1: 382, y1: 95, x2: 548, y2: 95 }}
        label="নিজের খাতা দেখে"
      />
      <Figure
        x={580}
        y={95}
        emoji="📒"
        label="খাতা"
        sub="= Database"
        tone="database"
      />
    </g>
  );
}

const HUBS = [
  { x: 110, name: "ঢাকা hub" },
  { x: 360, name: "বগুড়া hub" },
  { x: 610, name: "রাজশাহী" },
];

function CourierRow() {
  const y = 300;
  return (
    <g>
      <text
        x={20}
        y={210}
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        ২. কুরিয়ার: বাক্স ভাগ হয়ে প্যাকেট, hub থেকে hub
      </text>
      {HUBS.slice(0, -1).map((hub, i) => (
        <DiagramEdge
          key={hub.name}
          segment={{ x1: hub.x + 52, y1: y, x2: HUBS[i + 1].x - 52, y2: y }}
          label="ট্রাক"
        />
      ))}
      {HUBS.map((hub) => (
        <g key={hub.name}>
          <rect
            x={hub.x - 50}
            y={y - 28}
            width={100}
            height={56}
            rx={10}
            fill="var(--sd-gateway-soft)"
            stroke="var(--sd-gateway)"
            strokeWidth={1.5}
          />
          <text
            x={hub.x}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={13}
            fontWeight={700}
            fill="var(--sd-label)"
          >
            {hub.name}
          </text>
        </g>
      ))}
      {["১/৩", "২/৩", "৩/৩"].map((n, i) => (
        <text
          key={n}
          x={180 + i * 60}
          y={y + 62}
          fontSize={13}
          fill="var(--sd-label)"
        >
          📦 {n}
        </text>
      ))}
      <text
        x={360}
        y={y + 98}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        প্যাকেট = packet · ঠিকানা = IP address · hub = router
      </text>
    </g>
  );
}

export function Day002Analogy() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%">
      <BankRow />
      <CourierRow />
    </svg>
  );
}
