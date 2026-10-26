import { DiagramEdge } from "@/components/shared/diagram";

const W = 760;
const H = 330;

function Person({
  x,
  y,
  emoji,
  r = 22,
  tone = "user",
}: {
  x: number;
  y: number;
  emoji: string;
  r?: number;
  tone?: string;
}) {
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={r}
        fill={`var(--sd-${tone}-soft)`}
        stroke={`var(--sd-${tone})`}
        strokeWidth={1.5}
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={r - 2}
      >
        {emoji}
      </text>
    </g>
  );
}

function Caption({
  x,
  y,
  title,
  sub,
}: {
  x: number;
  y: number;
  title: string;
  sub?: string;
}) {
  return (
    <g>
      <text
        x={x}
        y={y}
        textAnchor="middle"
        fontSize={12}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {title}
      </text>
      {sub && (
        <text
          x={x}
          y={y + 15}
          textAnchor="middle"
          fontSize={11}
          fill="var(--sd-edge)"
        >
          {sub}
        </text>
      )}
    </g>
  );
}

/** Left panel: one cook, one pot, four people at home. */
function HomeKitchen() {
  const family = [70, 120, 170, 220];
  return (
    <g>
      <rect
        x={10}
        y={10}
        width={240}
        height={310}
        rx={12}
        fill="none"
        stroke="var(--sd-edge)"
        strokeDasharray="4 4"
      />
      <text
        x={130}
        y={36}
        textAnchor="middle"
        fontSize={14}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        বাসায়: ৪ জন
      </text>
      <Person x={70} y={110} emoji="🧑‍🍳" r={26} tone="server" />
      <Caption x={70} y={152} title="একজন রাঁধুনি" />
      <text
        x={175}
        y={112}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={34}
      >
        🍲
      </text>
      <Caption x={175} y={152} title="একটা হাঁড়ি" />
      {family.map((x) => (
        <Person key={x} x={x} y={225} emoji="🙂" r={18} />
      ))}
      <Caption
        x={145}
        y={268}
        title="সবাই অপেক্ষা করতে পারে"
        sub="দেরি হলে ক্ষতি নেই"
      />
    </g>
  );
}

/** Right panel: the wedding kitchen, each role mapped to a building block. */
function WeddingKitchen() {
  const tables = [95, 165, 235];
  const chefs = [95, 165, 235];
  return (
    <g>
      <rect
        x={270}
        y={10}
        width={480}
        height={310}
        rx={12}
        fill="none"
        stroke="var(--sd-edge)"
        strokeDasharray="4 4"
      />
      <text
        x={510}
        y={36}
        textAnchor="middle"
        fontSize={14}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        বিয়ে বাড়ি: ৫০০ জন
      </text>
      {tables.map((y) => (
        <g key={y}>
          <Person x={310} y={y} emoji="👥" r={20} />
          <DiagramEdge segment={{ x1: 332, y1: y, x2: 408, y2: 165 }} />
        </g>
      ))}
      <Caption x={310} y={272} title="অতিথিরা" sub="= Client" />
      <Person x={432} y={165} emoji="🧍" r={24} tone="load-balancer" />
      <Caption x={432} y={204} title="পরিবেশনের সর্দার" sub="= Load Balancer" />
      {chefs.map((y) => (
        <g key={y}>
          <DiagramEdge
            segment={{ x1: 457, y1: 165, x2: 548, y2: y }}
            tone="active"
          />
          <Person x={572} y={y} emoji="👨‍🍳" r={22} tone="server" />
          <DiagramEdge segment={{ x1: 595, y1: y, x2: 650, y2: 165 }} />
        </g>
      ))}
      <Caption x={572} y={272} title="বাবুর্চিরা" sub="= Server" />
      <rect
        x={652}
        y={125}
        width={88}
        height={80}
        rx={8}
        fill="var(--sd-database-soft)"
        stroke="var(--sd-database)"
        strokeWidth={1.5}
      />
      <text x={696} y={152} textAnchor="middle" fontSize={22}>
        🌾
      </text>
      <Caption x={696} y={180} title="ভাঁড়ার ঘর" sub="= Database" />
      <rect
        x={360}
        y={242}
        width={144}
        height={62}
        rx={8}
        fill="var(--sd-cache-soft)"
        stroke="var(--sd-cache)"
        strokeWidth={1.5}
      />
      <text x={432} y={262} textAnchor="middle" fontSize={16}>
        🥛🥛🥛
      </text>
      <Caption x={432} y={281} title="আগে সাজানো বোরহানি" sub="= Cache" />
      <text x={696} y={236} textAnchor="middle" fontSize={20}>
        🛢️
      </text>
      <Caption x={696} y={258} title="বাড়তি সিলিন্ডার" sub="= Redundancy" />
    </g>
  );
}

/** Analogy illustration: the same recipe for 4 people at home vs 500 at a wedding. */
export function Day001Analogy() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%">
      <HomeKitchen />
      <WeddingKitchen />
    </svg>
  );
}
