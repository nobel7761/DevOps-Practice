import { DiagramEdge } from "@/components/shared/diagram";

const MENU = [
  "কাচ্চি বিরিয়ানি  ৳৩৫০",
  "মোরগ পোলাও  ৳২৮০",
  "বোরহানি  ৳৮০",
  "ফিরনি  ৳৬০",
];

function Figure({
  x,
  y,
  emoji,
  label,
  sub,
  soft,
  stroke,
}: {
  x: number;
  y: number;
  emoji: string;
  label: string;
  sub: string;
  soft: string;
  stroke: string;
}) {
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={30}
        fill={soft}
        stroke={stroke}
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

function MenuCard() {
  return (
    <g>
      <rect
        x={150}
        y={20}
        width={170}
        height={150}
        rx={10}
        fill="var(--sd-gateway-soft)"
        stroke="var(--sd-gateway)"
        strokeWidth={2}
      />
      <text
        x={235}
        y={42}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        📜 Menu
      </text>
      {MENU.map((item, i) => (
        <text
          key={item}
          x={164}
          y={68 + i * 24}
          fontSize={12}
          fill="var(--sd-label)"
        >
          {item}
        </text>
      ))}
      <text
        x={235}
        y={192}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        = API contract (কী চাওয়া যায়)
      </text>
    </g>
  );
}

function Kitchen() {
  return (
    <g>
      <rect
        x={560}
        y={40}
        width={150}
        height={130}
        rx={10}
        fill="var(--sd-server-soft)"
        stroke="var(--sd-server)"
        strokeWidth={2}
        strokeDasharray="6 4"
      />
      <text
        x={635}
        y={90}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={28}
      >
        👨‍🍳🍲
      </text>
      <text
        x={635}
        y={128}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        রান্নাঘর
      </text>
      <text
        x={635}
        y={146}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        = Server + Database
      </text>
      <text
        x={635}
        y={192}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        customer ভেতরে ঢোকে না
      </text>
    </g>
  );
}

/** Analogy illustration: customer orders from the menu via the waiter; the kitchen stays hidden. */
export function Day004Analogy() {
  return (
    <svg viewBox="0 0 720 250" width="100%">
      <Figure
        x={60}
        y={95}
        emoji="🧑"
        label="Customer"
        sub="= Client"
        soft="var(--sd-user-soft)"
        stroke="var(--sd-user)"
      />
      <DiagramEdge segment={{ x1: 92, y1: 95, x2: 148, y2: 95 }} label="দেখে" />
      <MenuCard />
      <Figure
        x={440}
        y={95}
        emoji="🤵"
        label="Waiter"
        sub="= API"
        soft="var(--sd-gateway-soft)"
        stroke="var(--sd-gateway)"
      />
      <DiagramEdge
        segment={{ x1: 322, y1: 80, x2: 408, y2: 80 }}
        label="order"
        tone="active"
      />
      <DiagramEdge
        segment={{ x1: 408, y1: 112, x2: 322, y2: 112 }}
        label="খাবার / “শেষ”"
        dashed
      />
      <DiagramEdge
        segment={{ x1: 472, y1: 95, x2: 558, y2: 95 }}
        label="ভেতরে"
      />
      <Kitchen />
      <text
        x={360}
        y={238}
        textAnchor="middle"
        fontSize={12}
        fill="var(--sd-label)"
      >
        Menu-তে যা নেই তা চাওয়া যায় না; রান্নার নিয়ম বদলালেও menu একই থাকে।
      </text>
    </svg>
  );
}
