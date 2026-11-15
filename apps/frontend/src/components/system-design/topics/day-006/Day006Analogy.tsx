import { DiagramEdge } from "@/components/shared/diagram";

// Analogy illustration: a hospital's power line fails, the auto switch moves
// to the generator, critical wards keep running and comfort loads stay off.

const W = 760;
const H = 285;

function Source({
  y,
  emoji,
  label,
  sub,
  failed,
}: {
  y: number;
  emoji: string;
  label: string;
  sub: string;
  failed?: boolean;
}) {
  const stroke = failed ? "var(--sd-fail)" : "var(--sd-server)";
  return (
    <g>
      <circle
        cx={70}
        cy={y}
        r={30}
        fill={failed ? "var(--sd-canvas)" : "var(--sd-server-soft)"}
        stroke={stroke}
        strokeWidth={failed ? 2.5 : 1.5}
        strokeDasharray={failed ? "6 4" : undefined}
      />
      <text
        x={70}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={26}
      >
        {emoji}
      </text>
      <text
        x={70}
        y={y + 48}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {label}
      </text>
      <text
        x={70}
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

function AutoSwitch() {
  return (
    <g>
      <rect
        x={240}
        y={105}
        width={140}
        height={64}
        rx={10}
        fill="var(--sd-load-balancer-soft)"
        stroke="var(--sd-load-balancer)"
        strokeWidth={2}
      />
      <text
        x={310}
        y={130}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        🔀 Auto switch
      </text>
      <text
        x={310}
        y={150}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        (ATS)
      </text>
      <text
        x={310}
        y={192}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        = Health check + Failover
      </text>
    </g>
  );
}

const WARDS = [
  { text: "ICU · ventilator ✓", on: true },
  { text: "Operation theatre ✓", on: true },
  { text: "Emergency ✓", on: true },
  { text: "AC ✕ (পরে চালু হবে)", on: false },
];

function Hospital() {
  return (
    <g>
      <rect
        x={450}
        y={20}
        width={290}
        height={235}
        rx={12}
        fill="var(--sd-client-soft)"
        stroke="var(--sd-client)"
        strokeWidth={2}
      />
      <text
        x={595}
        y={46}
        textAnchor="middle"
        fontSize={14}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        🏥 হাসপাতাল
      </text>
      {WARDS.map((ward, i) => (
        <g key={ward.text}>
          <rect
            x={475}
            y={62 + i * 40}
            width={240}
            height={30}
            rx={6}
            fill="var(--sd-canvas)"
            stroke={ward.on ? "var(--sd-ok)" : "var(--sd-fail)"}
            strokeDasharray={ward.on ? undefined : "5 3"}
          />
          <text
            x={595}
            y={77 + i * 40}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fill="var(--sd-label)"
          >
            {ward.text}
          </text>
        </g>
      ))}
      <text
        x={595}
        y={240}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        AC বন্ধ রাখা = Graceful degradation
      </text>
    </g>
  );
}

/** Analogy illustration: power cut → auto switch → generator keeps the critical wards running. */
export function Day006Analogy() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%">
      <Source y={60} emoji="⚡" label="বিদ্যুৎ লাইন" sub="= Primary" failed />
      <Source y={195} emoji="⛽" label="Generator" sub="= Standby" />
      <DiagramEdge
        segment={{ x1: 102, y1: 66, x2: 238, y2: 122 }}
        label="লোডশেডিং ✕"
        tone="failed"
        dashed
      />
      <DiagramEdge
        segment={{ x1: 102, y1: 189, x2: 238, y2: 152 }}
        label="কয়েক সেকেন্ডে চালু"
        tone="active"
      />
      <AutoSwitch />
      <Hospital />
      <DiagramEdge
        segment={{ x1: 382, y1: 137, x2: 448, y2: 137 }}
        tone="active"
      />
    </svg>
  );
}
