import { DiagramEdge } from "@/components/shared/diagram";

const W = 740;
const H = 300;

const DESK_X = 250;
const DESK_Y = 40;
const DESK_W = 220;

const DESK_DUTIES = [
  "🎫 টিকিট যাচাই",
  "🔢 দিনের সীমা",
  "🧭 কোন বিভাগে",
  "📒 খাতায় লেখা",
];

const DEPARTMENTS = ["🩺 Medicine", "🧸 শিশু", "🧪 Pathology", "☢️ X-ray"];

function Patients() {
  return (
    <g>
      {[90, 150, 210].map((y) => (
        <g key={y}>
          <circle
            cx={60}
            cy={y}
            r={24}
            fill="var(--sd-user-soft)"
            stroke="var(--sd-user)"
            strokeWidth={1.5}
          />
          <text
            x={60}
            y={y}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={22}
          >
            🧑
          </text>
          <DiagramEdge segment={{ x1: 86, y1: y, x2: DESK_X - 4, y2: 150 }} />
        </g>
      ))}
      <text
        x={60}
        y={262}
        textAnchor="middle"
        fontSize={12}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        রোগীরা
      </text>
      <text
        x={60}
        y={279}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        = Client
      </text>
    </g>
  );
}

function ReceptionDesk() {
  return (
    <g>
      <rect
        x={DESK_X}
        y={DESK_Y}
        width={DESK_W}
        height={210}
        rx={12}
        fill="var(--sd-gateway-soft)"
        stroke="var(--sd-gateway)"
        strokeWidth={2}
      />
      <text
        x={DESK_X + DESK_W / 2}
        y={DESK_Y + 24}
        textAnchor="middle"
        fontSize={14}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        🏥 Reception কাউন্টার
      </text>
      {DESK_DUTIES.map((duty, i) => (
        <g key={duty}>
          <rect
            x={DESK_X + 18}
            y={DESK_Y + 42 + i * 40}
            width={DESK_W - 36}
            height={30}
            rx={6}
            fill="var(--sd-canvas)"
            stroke="var(--sd-gateway)"
          />
          <text
            x={DESK_X + DESK_W / 2}
            y={DESK_Y + 57 + i * 40}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fill="var(--sd-label)"
          >
            {duty}
          </text>
        </g>
      ))}
      <text
        x={DESK_X + DESK_W / 2}
        y={DESK_Y + 232}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        = API Gateway (চিকিৎসা করে না)
      </text>
    </g>
  );
}

function Departments() {
  return (
    <g>
      {DEPARTMENTS.map((name, i) => {
        const y = 30 + i * 62;
        return (
          <g key={name}>
            <DiagramEdge
              segment={{
                x1: DESK_X + DESK_W + 2,
                y1: 150,
                x2: 556,
                y2: y + 22,
              }}
              tone="active"
            />
            <rect
              x={560}
              y={y}
              width={150}
              height={44}
              rx={10}
              fill="var(--sd-server-soft)"
              stroke="var(--sd-server)"
              strokeWidth={1.5}
            />
            <text
              x={635}
              y={y + 22}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13}
              fontWeight={600}
              fill="var(--sd-label)"
            >
              {name}
            </text>
          </g>
        );
      })}
      <text
        x={635}
        y={285}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        = ভেতরের service-গুলো
      </text>
    </g>
  );
}

/** Analogy illustration: the hospital reception checks, limits and directs; doctors treat. */
export function Day016Analogy() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%">
      <Patients />
      <ReceptionDesk />
      <Departments />
    </svg>
  );
}
