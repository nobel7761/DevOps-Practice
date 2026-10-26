// Richardson Maturity Model as a staircase; most real APIs stop at level 2.

interface Level {
  level: number;
  title: string;
  example: string;
}

const LEVELS: Level[] = [
  { level: 0, title: "এক URL, সব POST", example: "POST /api {getOrder}" },
  { level: 1, title: "Resource আলাদা URL-এ", example: "POST /orders/42" },
  {
    level: 2,
    title: "HTTP method + status code",
    example: "GET /orders/42 → 200",
  },
  {
    level: 3,
    title: "HATEOAS: response-এ link",
    example: "links.cancel → /orders/42",
  },
];

const STEP_W = 160;
const STEP_H = 46;
const BASE = 250;

export function Day004Maturity() {
  return (
    <svg viewBox="0 0 700 300" width="100%">
      {LEVELS.map((item) => {
        const x = 20 + item.level * STEP_W;
        const y = BASE - (item.level + 1) * STEP_H;
        const isCommon = item.level === 2;
        return (
          <g key={item.level}>
            <rect
              x={x}
              y={y}
              width={STEP_W - 6}
              height={(item.level + 1) * STEP_H}
              rx={6}
              fill={isCommon ? "var(--sd-server-soft)" : "var(--sd-canvas)"}
              stroke={isCommon ? "var(--sd-server)" : "var(--sd-edge)"}
              strokeWidth={isCommon ? 2.5 : 1.5}
            />
            <text
              x={x + 10}
              y={y + 20}
              fontSize={13}
              fontWeight={700}
              fill="var(--sd-label)"
            >
              Level {item.level}
            </text>
            <text x={x + 8} y={y + 38} fontSize={10} fill="var(--sd-label)">
              {item.title}
            </text>
            <text
              x={x + (STEP_W - 6) / 2}
              y={BASE + 22}
              textAnchor="middle"
              fontSize={10}
              fontFamily="monospace"
              fill="var(--sd-edge)"
            >
              {item.example}
            </text>
          </g>
        );
      })}
      <text
        x={20 + 2 * STEP_W + (STEP_W - 6) / 2}
        y={BASE - 3 * STEP_H - 12}
        textAnchor="middle"
        fontSize={12}
        fontWeight={700}
        fill="var(--sd-server)"
      >
        ⬇ বেশিরভাগ API এখানে থামে
      </text>
      <text x={20} y={290} fontSize={11} fill="var(--sd-edge)">
        প্রতিটা ধাপ আগের ধাপের উপর দাঁড়ায়; Level 3 খুব কম public API-তে
        পুরোপুরি দেখা যায়।
      </text>
    </svg>
  );
}
