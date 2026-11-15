import { DiagramEdge } from "@/components/shared/diagram";

// Analogy: the wedding cook's estimate — guests × per head → total → pots (+1 spare).

const W = 760;
const H = 270;

function Station({
  x,
  emoji,
  title,
  value,
  maps,
}: {
  x: number;
  emoji: string;
  title: string;
  value: string;
  maps: string;
}) {
  return (
    <g>
      <rect
        x={x}
        y={30}
        width={150}
        height={130}
        rx={12}
        fill="var(--sd-user-soft)"
        stroke="var(--sd-user)"
        strokeWidth={1.5}
      />
      <text x={x + 75} y={66} textAnchor="middle" fontSize={28}>
        {emoji}
      </text>
      <text
        x={x + 75}
        y={102}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {title}
      </text>
      <text
        x={x + 75}
        y={124}
        textAnchor="middle"
        fontSize={13}
        fill="var(--sd-label)"
      >
        {value}
      </text>
      <text
        x={x + 75}
        y={148}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        {maps}
      </text>
    </g>
  );
}

function Pots() {
  const xs = [585, 615, 645, 675, 705];
  return (
    <g>
      <rect
        x={570}
        y={30}
        width={180}
        height={130}
        rx={12}
        fill="var(--sd-server-soft)"
        stroke="var(--sd-server)"
        strokeWidth={1.5}
      />
      {xs.map((x) => (
        <text key={x} x={x} y={70} textAnchor="middle" fontSize={22}>
          🍲
        </text>
      ))}
      <circle
        cx={660}
        cy={96}
        r={14}
        fill="none"
        stroke="var(--sd-server)"
        strokeDasharray="4 3"
        strokeWidth={1.5}
      />
      <text
        x={660}
        y={101}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-label)"
      >
        +১
      </text>
      <text
        x={660}
        y={128}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        ৫টা ডেগ + ১ বাড়তি
      </text>
      <text
        x={660}
        y={148}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        = Server, N+1
      </text>
    </g>
  );
}

/** Wedding cook's napkin math, mapped to capacity estimation. */
export function Day019Analogy() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <Station x={10} emoji="👥" title="অতিথি" value="৫০০ জন" maps="= DAU" />
      <Station
        x={200}
        emoji="🍚"
        title="মাথাপিছু"
        value="~২৫০ গ্রাম চাল"
        maps="= প্রতি user-এর load"
      />
      <Station
        x={390}
        emoji="⚖️"
        title="মোট বাজার"
        value="~১২৫ কেজি"
        maps="= মোট load"
      />
      <Pots />
      <DiagramEdge segment={{ x1: 162, y1: 95, x2: 198, y2: 95 }} />
      <DiagramEdge segment={{ x1: 352, y1: 95, x2: 388, y2: 95 }} />
      <DiagramEdge
        segment={{ x1: 542, y1: 95, x2: 568, y2: 95 }}
        tone="active"
      />
      <rect
        x={200}
        y={195}
        width={360}
        height={50}
        rx={10}
        fill="var(--sd-queue-soft)"
        stroke="var(--sd-queue)"
        strokeWidth={1.5}
      />
      <text
        x={380}
        y={216}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        🪑 একবারে ২০০ জন বসে = Peak
      </text>
      <text
        x={380}
        y={235}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        মোট অতিথি না, সবচেয়ে ভিড়ের ব্যাচের জন্য রান্না গরম রাখতে হয়
      </text>
    </svg>
  );
}
