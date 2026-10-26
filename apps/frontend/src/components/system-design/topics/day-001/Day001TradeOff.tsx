// Trade-off scale: gaining on one side costs something on the other.

const EXAMPLES = [
  { tool: "Cache", gain: "দ্রুত page", give: "data একটু পুরনো হতে পারে" },
  {
    tool: "Replica",
    gain: "বেশি availability, বেশি read",
    give: "কপিতে নতুন data দেরিতে পৌঁছায়",
  },
  {
    tool: "Queue",
    gain: "user দ্রুত উত্তর পায়",
    give: 'কাজ "হয়ে গেছে" না, "হবে"',
  },
];

function Pan({
  x,
  y,
  color,
  lines,
}: {
  x: number;
  y: number;
  color: string;
  lines: string[];
}) {
  return (
    <g>
      <line x1={x} y1={y} x2={x - 60} y2={y + 46} stroke="var(--sd-edge)" />
      <line x1={x} y1={y} x2={x + 60} y2={y + 46} stroke="var(--sd-edge)" />
      <path
        d={`M ${x - 80} ${y + 46} L ${x + 80} ${y + 46} Q ${x} ${y + 92} ${x - 80} ${y + 46} Z`}
        fill={`var(--sd-${color}-soft)`}
        stroke={`var(--sd-${color})`}
        strokeWidth={1.5}
      />
      {lines.map((line, i) => (
        <text
          key={line}
          x={x}
          y={y + 90 + i * 16}
          textAnchor="middle"
          fontSize={13}
          fontWeight={700}
          fill="var(--sd-label)"
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function ExampleRow({ index }: { index: number }) {
  const { tool, gain, give } = EXAMPLES[index];
  const y = 222 + index * 34;
  return (
    <g>
      <rect
        x={20}
        y={y}
        width={680}
        height={28}
        rx={6}
        fill="var(--sd-canvas)"
        stroke="var(--sd-edge)"
        strokeOpacity={0.4}
      />
      <text
        x={34}
        y={y + 14}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {tool}
      </text>
      <text
        x={110}
        y={y + 14}
        dominantBaseline="central"
        fontSize={12}
        fill="var(--sd-ok)"
      >
        ✓ পাই: {gain}
      </text>
      <text
        x={400}
        y={y + 14}
        dominantBaseline="central"
        fontSize={12}
        fill="var(--sd-fail)"
      >
        ✕ দিই: {give}
      </text>
    </g>
  );
}

/** Deep dive: there is no perfect design, only a balance chosen by the requirement. */
export function Day001TradeOff() {
  return (
    <svg viewBox="0 0 720 330" width="100%">
      <g transform="rotate(-6 360 60)">
        <line
          x1={170}
          y1={60}
          x2={550}
          y2={60}
          stroke="var(--sd-label)"
          strokeWidth={4}
          strokeLinecap="round"
        />
        <Pan x={180} y={60} color="cdn" lines={["দ্রুততা", "Availability"]} />
        <Pan
          x={540}
          y={60}
          color="database"
          lines={["Consistency", "সরলতা · কম খরচ"]}
        />
      </g>
      <polygon
        points="360,60 335,190 385,190"
        fill="var(--sd-edge)"
        fillOpacity={0.5}
      />
      <text
        x={360}
        y={208}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        কোন দিকে ঝুঁকবেন, ঠিক করে requirement
      </text>
      {EXAMPLES.map((e, i) => (
        <ExampleRow key={e.tool} index={i} />
      ))}
    </svg>
  );
}
