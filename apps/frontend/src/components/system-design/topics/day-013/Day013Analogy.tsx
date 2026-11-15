import { DiagramEdge } from "@/components/shared/diagram";

// Analogy: one huge double-decker bus (scale up) vs a counter sending
// passengers to several ordinary buses with a spare (scale out); one ticket ledger.

const W = 720;
const H = 320;

function Caption({
  x,
  y,
  title,
  sub,
  subColor = "var(--sd-edge)",
}: {
  x: number;
  y: number;
  title: string;
  sub: string;
  subColor?: string;
}) {
  return (
    <g>
      <text
        x={x}
        y={y}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {title}
      </text>
      <text x={x} y={y + 17} textAnchor="middle" fontSize={11} fill={subColor}>
        {sub}
      </text>
    </g>
  );
}

function BusWindows({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {[0, 1].map((row) =>
        Array.from({ length: 6 }, (_, i) => (
          <rect
            key={`${row}-${i}`}
            x={x + 14 + i * 32}
            y={y + 14 + row * 46}
            width={24}
            height={26}
            rx={3}
            fill="var(--sd-canvas)"
            stroke="var(--sd-server)"
          />
        )),
      )}
    </g>
  );
}

function BigBus() {
  const x = 50;
  const y = 70;
  return (
    <g>
      <line
        x1={20}
        x2={290}
        y1={50}
        y2={50}
        stroke="var(--sd-fail)"
        strokeWidth={2}
        strokeDasharray="6 4"
      />
      <text
        x={155}
        y={40}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-fail)"
      >
        ব্রিজের উচ্চতা = ছাদ
      </text>
      <rect
        x={x}
        y={y}
        width={220}
        height={110}
        rx={14}
        fill="var(--sd-server-soft)"
        stroke="var(--sd-server)"
        strokeWidth={2}
      />
      <BusWindows x={x} y={y} />
      <circle cx={x + 45} cy={y + 112} r={13} fill="var(--sd-label)" />
      <circle cx={x + 175} cy={y + 112} r={13} fill="var(--sd-label)" />
      <Caption
        x={x + 110}
        y={y + 150}
        title="বড় দোতলা বাস = Scale up"
        sub="সহজ, কিন্তু বিকল হলে ৮০ জনই আটকা"
        subColor="var(--sd-fail)"
      />
    </g>
  );
}

function SmallBus({
  x,
  y,
  label,
  spare = false,
}: {
  x: number;
  y: number;
  label: string;
  spare?: boolean;
}) {
  return (
    <g opacity={spare ? 0.75 : 1}>
      <rect
        x={x}
        y={y}
        width={110}
        height={40}
        rx={8}
        fill="var(--sd-server-soft)"
        stroke="var(--sd-server)"
        strokeWidth={1.5}
        strokeDasharray={spare ? "6 4" : undefined}
      />
      <text
        x={x + 55}
        y={y + 20}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fill="var(--sd-label)"
      >
        🚌 {label}
      </text>
    </g>
  );
}

const BUS_YS = [20, 75, 130, 185];
const BUS_X = 500;

function Fleet() {
  return (
    <g>
      <circle
        cx={390}
        cy={125}
        r={28}
        fill="var(--sd-load-balancer-soft)"
        stroke="var(--sd-load-balancer)"
        strokeWidth={1.5}
      />
      <text
        x={390}
        y={125}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={24}
      >
        🧑‍💼
      </text>
      <Caption x={390} y={172} title="Counter = LB" sub="ফাঁকা বাসে পাঠায়" />
      {BUS_YS.map((y, i) => (
        <g key={y}>
          <DiagramEdge
            segment={{ x1: 420, y1: 125, x2: BUS_X - 2, y2: y + 20 }}
          />
          <SmallBus x={BUS_X} y={y} label={`বাস ${["১", "২", "৩", "৪"][i]}`} />
        </g>
      ))}
      <SmallBus x={BUS_X + 100} y={250} label="বাড়তি" spare />
      <text
        x={BUS_X + 155}
        y={306}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        depot-এ N+1
      </text>
      <text
        x={BUS_X + 55}
        y={244}
        textAnchor="middle"
        fontSize={12}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        = Scale out
      </text>
    </g>
  );
}

function Ledger() {
  return (
    <g>
      <rect
        x={200}
        y={262}
        width={230}
        height={40}
        rx={8}
        fill="var(--sd-database-soft)"
        stroke="var(--sd-database)"
        strokeWidth={1.5}
      />
      <text
        x={315}
        y={282}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
        fill="var(--sd-label)"
      >
        📒 একটাই টিকিটের খাতা = Database
      </text>
    </g>
  );
}

/** Analogy illustration: bigger bus vs more buses, sharing one ticket ledger. */
export function Day013Analogy() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <BigBus />
      <Fleet />
      <Ledger />
    </svg>
  );
}
