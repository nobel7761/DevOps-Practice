import { DiagramEdge } from "@/components/shared/diagram";

const W = 720;
const H = 260;

function Figure({
  x,
  y,
  emoji,
  label,
  sub,
}: {
  x: number;
  y: number;
  emoji: string;
  label: string;
  sub: string;
}) {
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={30}
        fill="var(--sd-user-soft)"
        stroke="var(--sd-user)"
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

function OrderBoard() {
  const slips = ["#41 বিরিয়ানি", "#42 চা ×২", "#43 সিঙ্গারা"];
  return (
    <g>
      <rect
        x={250}
        y={45}
        width={190}
        height={150}
        rx={10}
        fill="var(--sd-queue-soft)"
        stroke="var(--sd-queue)"
        strokeWidth={2}
      />
      <text
        x={345}
        y={68}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        Order board
      </text>
      {slips.map((slip, i) => (
        <g key={slip}>
          <rect
            x={268}
            y={82 + i * 34}
            width={154}
            height={26}
            rx={4}
            fill="var(--sd-canvas)"
            stroke="var(--sd-queue)"
          />
          <text
            x={345}
            y={95 + i * 34}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fill="var(--sd-label)"
          >
            🧾 {slip}
          </text>
        </g>
      ))}
      <text
        x={345}
        y={218}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        = Queue
      </text>
    </g>
  );
}

/** Analogy illustration: cashier pins slips on the board, chefs take them when free. */
export function Day012Analogy() {
  const chefs = [55, 130, 205];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%">
      <Figure x={50} y={110} emoji="🧑" label="Customer" sub="" />
      <Figure x={165} y={110} emoji="💁" label="Cashier" sub="= Producer" />
      <DiagramEdge
        segment={{ x1: 82, y1: 110, x2: 132, y2: 110 }}
        label="order"
      />
      <DiagramEdge
        segment={{ x1: 197, y1: 110, x2: 248, y2: 110 }}
        label="slip"
        tone="active"
      />
      <OrderBoard />
      {chefs.map((y, i) => (
        <g key={y}>
          <DiagramEdge segment={{ x1: 442, y1: 120, x2: 560, y2: y }} />
          <circle
            cx={590}
            cy={y}
            r={26}
            fill="var(--sd-server-soft)"
            stroke="var(--sd-server)"
            strokeWidth={1.5}
          />
          <text
            x={590}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={22}
          >
            👨‍🍳
          </text>
          <text
            x={625}
            y={y}
            dominantBaseline="central"
            fontSize={12}
            fontWeight={700}
            fill="var(--sd-label)"
          >
            Chef {["১", "২", "৩"][i]}
          </text>
        </g>
      ))}
      <text
        x={600}
        y={248}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        = Consumer-রা
      </text>
    </svg>
  );
}
