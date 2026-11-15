import { DiagramEdge } from "@/components/shared/diagram";

// Analogy illustration: a tailor shop before Eid. Measurements kept in one
// tailor's head (stateful) vs in the shop's register (shared store) vs on a
// sealed card the customer carries (signed token).

const W = 760;
const H = 330;

const TAILORS = [
  { y: 30, name: "কারিগর ১", note: "মাথায় রাখা মাপ ✕", away: true },
  { y: 125, name: "কারিগর ২", note: "খাতা দেখে কাজ" },
  { y: 220, name: "কারিগর ৩", note: "খাতা দেখে কাজ" },
];

function Tailor({
  y,
  name,
  note,
  away,
}: {
  y: number;
  name: string;
  note: string;
  away?: boolean;
}) {
  const stroke = away ? "var(--sd-fail)" : "var(--sd-server)";
  return (
    <g opacity={away ? 0.75 : 1}>
      <rect
        x={260}
        y={y}
        width={200}
        height={64}
        rx={12}
        fill={away ? "var(--sd-canvas)" : "var(--sd-server-soft)"}
        stroke={stroke}
        strokeWidth={away ? 2.5 : 1.5}
        strokeDasharray={away ? "6 4" : undefined}
      />
      <text
        x={292}
        y={y + 32}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={24}
      >
        🧵
      </text>
      <text
        x={318}
        y={y + 24}
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {name}
        {away ? " (ছুটিতে)" : ""}
      </text>
      <text
        x={318}
        y={y + 44}
        fontSize={11}
        fill={away ? "var(--sd-fail)" : "var(--sd-edge)"}
      >
        {note}
      </text>
    </g>
  );
}

function Customer() {
  return (
    <g>
      <circle
        cx={70}
        cy={140}
        r={32}
        fill="var(--sd-user-soft)"
        stroke="var(--sd-user)"
        strokeWidth={1.5}
      />
      <text
        x={70}
        y={140}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={28}
      >
        🧑
      </text>
      <text
        x={70}
        y={192}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        Customer
      </text>
      <rect
        x={10}
        y={222}
        width={150}
        height={70}
        rx={8}
        fill="var(--sd-gateway-soft)"
        stroke="var(--sd-gateway)"
        strokeWidth={1.5}
      />
      <text
        x={85}
        y={244}
        textAnchor="middle"
        fontSize={12}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        🪪 সিল দেওয়া মাপের কার্ড
      </text>
      <text
        x={85}
        y={264}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        বুক ৩৮, হাতা ২৪ · সিল ✓
      </text>
      <text
        x={85}
        y={282}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        = signed token (JWT)
      </text>
    </g>
  );
}

function Register() {
  const rows = ["রহিম · বুক ৩৮", "সালমা · কোমর ২৮", "করিম · হাতা ২৪"];
  return (
    <g>
      <rect
        x={560}
        y={70}
        width={180}
        height={150}
        rx={10}
        fill="var(--sd-cache-soft)"
        stroke="var(--sd-cache)"
        strokeWidth={2}
      />
      <text
        x={650}
        y={94}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        📒 দোকানের মাপের খাতা
      </text>
      {rows.map((row, i) => (
        <g key={row}>
          <rect
            x={576}
            y={108 + i * 32}
            width={148}
            height={24}
            rx={4}
            fill="var(--sd-canvas)"
            stroke="var(--sd-cache)"
          />
          <text
            x={650}
            y={120 + i * 32}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fill="var(--sd-label)"
          >
            {row}
          </text>
        </g>
      ))}
      <text
        x={650}
        y={244}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        = shared session store (Redis)
      </text>
    </g>
  );
}

/** Analogy illustration: any tailor can serve you once the measurements live outside their heads. */
export function Day014Analogy() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%">
      <Customer />
      <Register />
      {TAILORS.map((t) => (
        <Tailor key={t.y} {...t} />
      ))}
      <DiagramEdge
        segment={{ x1: 104, y1: 128, x2: 258, y2: 62 }}
        label="শুধু ১-এর কাছে?"
        tone="failed"
        dashed
      />
      <DiagramEdge
        segment={{ x1: 104, y1: 146, x2: 258, y2: 157 }}
        label="যেকোনো কারিগর"
        tone="active"
      />
      <DiagramEdge segment={{ x1: 104, y1: 160, x2: 258, y2: 248 }} />
      <DiagramEdge
        segment={{ x1: 462, y1: 157, x2: 558, y2: 145 }}
        label="মাপ দেখে"
      />
      <DiagramEdge segment={{ x1: 462, y1: 248, x2: 558, y2: 190 }} />
      <text
        x={360}
        y={316}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        কারিগর = app server · মাথায় রাখা মাপ = in-memory session
      </text>
    </svg>
  );
}
