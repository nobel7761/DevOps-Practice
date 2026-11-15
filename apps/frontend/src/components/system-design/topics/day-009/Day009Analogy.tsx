import { DiagramEdge } from "@/components/shared/diagram";

// Analogy illustration: a toll plaza on the bridge approach. A traffic
// sergeant (the load balancer) sends each vehicle to an open booth.

const W = 740;
const H = 310;

const BOOTHS = [
  { y: 20, title: "Booth ১ · সাধারণ lane", sub: "🚗 পালা করে গাড়ি" },
  {
    y: 90,
    title: "Booth ২ · ETC lane",
    sub: "⚡ দ্রুত, তাই বেশি গাড়ি = weight",
  },
  {
    y: 160,
    title: "Booth ৩ · বন্ধ",
    sub: "✕ লাল বাতি = unhealthy, বাদ",
    closed: true,
  },
  {
    y: 230,
    title: "Booth ৪ · বাস-ট্রাক lane",
    sub: "🚚 গাড়ি দেখে পাঠানো = L7 rule",
  },
];

function Booth({
  y,
  title,
  sub,
  closed,
}: {
  y: number;
  title: string;
  sub: string;
  closed?: boolean;
}) {
  const stroke = closed ? "var(--sd-fail)" : "var(--sd-server)";
  return (
    <g>
      <rect
        x={500}
        y={y}
        width={220}
        height={54}
        rx={10}
        fill={closed ? "var(--sd-canvas)" : "var(--sd-server-soft)"}
        stroke={stroke}
        strokeWidth={closed ? 2.5 : 1.5}
        strokeDasharray={closed ? "6 4" : undefined}
      />
      <text
        x={514}
        y={y + 20}
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {title}
      </text>
      <text x={514} y={y + 40} fontSize={11} fill="var(--sd-edge)">
        {sub}
      </text>
    </g>
  );
}

function Vehicles() {
  const items = ["🚗", "🚌", "🚗", "🚚"];
  return (
    <g>
      <rect
        x={10}
        y={70}
        width={70}
        height={170}
        rx={10}
        fill="var(--sd-client-soft)"
        stroke="var(--sd-client)"
        strokeWidth={1.5}
      />
      {items.map((emoji, i) => (
        <text
          key={i}
          x={45}
          y={95 + i * 40}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={24}
        >
          {emoji}
        </text>
      ))}
      <text
        x={45}
        y={262}
        textAnchor="middle"
        fontSize={12}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        গাড়ির সারি
      </text>
      <text
        x={45}
        y={278}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        = Request
      </text>
    </g>
  );
}

function Sergeant() {
  return (
    <g>
      <circle
        cx={270}
        cy={155}
        r={34}
        fill="var(--sd-load-balancer-soft)"
        stroke="var(--sd-load-balancer)"
        strokeWidth={2}
      />
      <text
        x={270}
        y={155}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={30}
      >
        👮
      </text>
      <text
        x={270}
        y={208}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        ট্রাফিক সার্জেন্ট
      </text>
      <text
        x={270}
        y={225}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        = Load Balancer
      </text>
    </g>
  );
}

/** Analogy illustration: toll plaza booths behind one traffic sergeant. */
export function Day009Analogy() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%">
      <DiagramEdge
        segment={{ x1: 82, y1: 155, x2: 234, y2: 155 }}
        label="একটাই রাস্তা"
      />
      <Vehicles />
      {BOOTHS.map((booth) => (
        <DiagramEdge
          key={booth.y}
          segment={{ x1: 305, y1: 155, x2: 498, y2: booth.y + 27 }}
          tone={booth.closed ? "failed" : "active"}
          dashed={booth.closed}
        />
      ))}
      <Sergeant />
      {BOOTHS.map((booth) => (
        <Booth key={booth.y} {...booth} />
      ))}
      <text
        x={W / 2}
        y={H - 6}
        textAnchor="middle"
        fontSize={12}
        fill="var(--sd-edge)"
      >
        সার্জেন্ট নিজে অসুস্থ হলে? পাশে আরেকজন তৈরি থাকতে হয় = Load Balancer
        redundancy
      </text>
    </svg>
  );
}
