import { DiagramEdge } from "@/components/shared/diagram";

const W = 740;
const H = 290;

type Tone = "user" | "gateway" | "server" | "external";

function Figure({
  x,
  y,
  emoji,
  label,
  sub,
  tone = "user",
}: {
  x: number;
  y: number;
  emoji: string;
  label: string;
  sub?: string;
  tone?: Tone;
}) {
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={24}
        fill={`var(--sd-${tone}-soft)`}
        stroke={`var(--sd-${tone})`}
        strokeWidth={1.5}
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={22}
      >
        {emoji}
      </text>
      <text
        x={x}
        y={y + 40}
        textAnchor="middle"
        fontSize={12}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {label}
      </text>
      {sub && (
        <text
          x={x}
          y={y + 55}
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

function PanelTitle({ x, text }: { x: number; text: string }) {
  return (
    <text
      x={x}
      y={22}
      textAnchor="middle"
      fontSize={13}
      fontWeight={700}
      fill="var(--sd-label)"
    >
      {text}
    </text>
  );
}

const STAFF_Y = [70, 145, 220];

/** Left half: staff hand errands to the peon, who goes out on their behalf. */
function PeonSide() {
  return (
    <g>
      <PanelTitle x={180} text="পিয়ন = Forward Proxy" />
      {STAFF_Y.map((y, i) => (
        <g key={y}>
          <Figure
            x={40}
            y={y}
            emoji="🧑‍💼"
            label={`কর্মী ${["১", "২", "৩"][i]}`}
          />
          <DiagramEdge segment={{ x1: 66, y1: y, x2: 150, y2: 145 }} />
        </g>
      ))}
      <Figure
        x={180}
        y={145}
        emoji="🧑"
        label="রহিম ভাই"
        sub="✉️ সিল করা খাম"
        tone="gateway"
      />
      <DiagramEdge
        segment={{ x1: 206, y1: 140, x2: 290, y2: 90 }}
        label="ফর্দ"
        tone="active"
      />
      <DiagramEdge
        segment={{ x1: 206, y1: 152, x2: 290, y2: 200 }}
        label="শুধু ঠিকানা"
        tone="active"
      />
      <Figure x={318} y={85} emoji="🏪" label="দোকান" tone="external" />
      <Figure x={318} y={205} emoji="🏦" label="ব্যাংক" tone="external" />
    </g>
  );
}

const DEPTS = ["হিসাব", "HR", "IT"];

/** Right half: visitors only ever meet the reception desk. */
function ReceptionSide() {
  return (
    <g>
      <PanelTitle x={570} text="Reception = Reverse Proxy" />
      {STAFF_Y.map((y, i) => (
        <g key={y}>
          <Figure
            x={420}
            y={y}
            emoji="🧍"
            label={`Visitor ${["১", "২", "৩"][i]}`}
          />
          <DiagramEdge segment={{ x1: 446, y1: y, x2: 530, y2: 145 }} />
        </g>
      ))}
      <Figure
        x={560}
        y={145}
        emoji="💁"
        label="শিউলি আপা"
        sub="ভেতরে কে কোথায়, সে জানে"
        tone="gateway"
      />
      {DEPTS.map((dept, i) => (
        <g key={dept}>
          <DiagramEdge
            segment={{ x1: 586, y1: 145, x2: 648, y2: 70 + i * 75 }}
            tone="active"
          />
          <rect
            x={650}
            y={52 + i * 75}
            width={80}
            height={36}
            rx={6}
            fill="var(--sd-server-soft)"
            stroke="var(--sd-server)"
          />
          <text
            x={690}
            y={70 + i * 75}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fontWeight={700}
            fill="var(--sd-label)"
          >
            {dept}
          </text>
        </g>
      ))}
    </g>
  );
}

/** Analogy illustration: the office peon and the reception desk. */
export function Day015Analogy() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%">
      <PeonSide />
      <line
        x1={370}
        y1={10}
        x2={370}
        y2={H - 10}
        stroke="var(--sd-edge)"
        strokeDasharray="4 6"
      />
      <ReceptionSide />
    </svg>
  );
}
