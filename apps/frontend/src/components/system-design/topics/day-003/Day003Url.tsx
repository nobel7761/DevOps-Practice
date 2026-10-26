// URL anatomy: the six parts of one URL, each with a one-line meaning.

const PARTS = [
  {
    text: "https",
    gap: "://",
    name: "Scheme",
    note: "কোন protocol",
    color: "var(--sd-gateway)",
  },
  {
    text: "www.boighor.com",
    gap: ":",
    name: "Host",
    note: "কোন machine (DNS)",
    color: "var(--sd-client)",
  },
  {
    text: "443",
    gap: "",
    name: "Port",
    note: "কোন program",
    color: "var(--sd-load-balancer)",
  },
  {
    text: "/books/search",
    gap: "?",
    name: "Path",
    note: "কোন resource",
    color: "var(--sd-server)",
  },
  {
    text: "q=jibanananda&page=2",
    gap: "#",
    name: "Query",
    note: "বাড়তি শর্ত",
    color: "var(--sd-database)",
  },
  {
    text: "reviews",
    gap: "",
    name: "Fragment",
    note: "server-এ যায় না",
    color: "var(--sd-cache)",
  },
];

const CHAR = 9.6;
const LEFT = 16;
const TOP = 40;
const ROW = 36;

// Each part's x position is the running width of the parts (and separators) before it.
const segments = PARTS.reduce<
  ((typeof PARTS)[number] & { x: number; width: number })[]
>((acc, part) => {
  const prev = acc[acc.length - 1];
  const x = prev ? prev.x + prev.width + prev.gap.length * CHAR : LEFT;
  return [...acc, { ...part, x, width: part.text.length * CHAR }];
}, []);
const lastSegment = segments[segments.length - 1];
const total = lastSegment.x + lastSegment.width + LEFT;

/** The URL drawn as coloured segments, with a colour-matched legend underneath. */
export function Day003Url() {
  return (
    <svg
      viewBox={`0 0 ${total} ${TOP + 40 + Math.ceil(PARTS.length / 2) * ROW}`}
      width="100%"
      style={{ fontFamily: "ui-monospace, monospace" }}
    >
      {segments.map((seg) => (
        <g key={seg.name}>
          <rect
            x={seg.x - 2}
            y={TOP - 22}
            width={seg.width + 4}
            height={32}
            rx={6}
            fill={seg.color}
            opacity={0.16}
          />
          <rect
            x={seg.x - 2}
            y={TOP + 12}
            width={seg.width + 4}
            height={4}
            rx={2}
            fill={seg.color}
          />
          <text
            x={seg.x}
            y={TOP}
            fontSize={16}
            fontWeight={700}
            fill="var(--sd-label)"
          >
            {seg.text}
          </text>
          {seg.gap && (
            <text
              x={seg.x + seg.width}
              y={TOP}
              fontSize={16}
              fill="var(--sd-edge)"
            >
              {seg.gap}
            </text>
          )}
        </g>
      ))}
      {segments.map((seg, i) => {
        // Colour-matched legend: two columns, three rows, under the URL.
        const lx = LEFT + (i % 2) * (total / 2);
        const ly = TOP + 52 + Math.floor(i / 2) * ROW;
        return (
          <g key={`${seg.name}-legend`}>
            <rect
              x={lx}
              y={ly - 8}
              width={16}
              height={16}
              rx={4}
              fill={seg.color}
            />
            <text
              x={lx + 24}
              y={ly}
              dominantBaseline="central"
              fontSize={14}
              fontWeight={700}
              fill={seg.color}
            >
              {seg.name}
              <tspan fontWeight={400} fill="var(--sd-label)">
                {" "}
                · {seg.note}
              </tspan>
            </text>
          </g>
        );
      })}
    </svg>
  );
}
