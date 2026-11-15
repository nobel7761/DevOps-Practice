// Algorithm comparison: the same three servers, the same moment, and which
// server each algorithm picks for the next request.

const SERVERS = [
  { name: "Server A", active: "চলমান: ৮", latency: "গড়: ৩০ms" },
  { name: "Server B", active: "চলমান: ৩", latency: "গড়: ১২০ms" },
  { name: "Server C", active: "চলমান: ৫", latency: "গড়: ৬০ms" },
];

const ALGORITHMS = [
  { name: "Round Robin", reason: "আগেরটা B পেয়েছিল, এবার C-র পালা", pick: 2 },
  {
    name: "Least Connections",
    reason: "সবচেয়ে কম চলমান request: B (৩)",
    pick: 1,
  },
  {
    name: "Least Response Time",
    reason: "(চলমান+১)×গড়: A ২৭০, B ৪৮০, C ৩৬০",
    pick: 0,
  },
  { name: "IP Hash", reason: "hash(client IP) % 3 = 0, তাই সবসময় A", pick: 0 },
  {
    name: "Power of Two Choices",
    reason: "এলোমেলো দুটো A, C; কম ব্যস্ত C",
    pick: 2,
  },
];

const COL_X = 260;
const COL_W = 110;
const COL_GAP = 12;
const colX = (i: number) => COL_X + i * (COL_W + COL_GAP);
const ROW_TOP = 96;
const ROW_H = 52;

function ServerHeader({ index }: { index: number }) {
  const server = SERVERS[index];
  const x = colX(index);
  return (
    <g>
      <rect
        x={x}
        y={6}
        width={COL_W}
        height={72}
        rx={10}
        fill="var(--sd-server-soft)"
        stroke="var(--sd-server)"
        strokeWidth={1.5}
      />
      <text
        x={x + COL_W / 2}
        y={26}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {server.name}
      </text>
      <text
        x={x + COL_W / 2}
        y={46}
        textAnchor="middle"
        fontSize={11.5}
        fill="var(--sd-label)"
      >
        {server.active}
      </text>
      <text
        x={x + COL_W / 2}
        y={64}
        textAnchor="middle"
        fontSize={11.5}
        fill="var(--sd-edge)"
      >
        {server.latency}
      </text>
    </g>
  );
}

function AlgorithmRow({ index }: { index: number }) {
  const algo = ALGORITHMS[index];
  const y = ROW_TOP + index * ROW_H;
  return (
    <g>
      <text
        x={8}
        y={y + 16}
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {algo.name}
      </text>
      <text x={8} y={y + 34} fontSize={10.5} fill="var(--sd-edge)">
        {algo.reason}
      </text>
      {SERVERS.map((_, col) => {
        const chosen = col === algo.pick;
        return (
          <g key={col}>
            <rect
              x={colX(col)}
              y={y + 6}
              width={COL_W}
              height={34}
              rx={8}
              fill={
                chosen ? "var(--sd-load-balancer-soft)" : "var(--sd-canvas)"
              }
              stroke={chosen ? "var(--primary)" : "var(--sd-edge)"}
              strokeWidth={chosen ? 2.5 : 1}
              strokeDasharray={chosen ? undefined : "4 4"}
            />
            {chosen && (
              <text
                x={colX(col) + COL_W / 2}
                y={y + 23}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={13}
                fontWeight={700}
                fill="var(--sd-label)"
              >
                ✓ এখানে
              </text>
            )}
          </g>
        );
      })}
    </g>
  );
}

/** Same state, five algorithms, five (sometimes different) choices. */
export function Day009Algorithms() {
  const bottom = ROW_TOP + ALGORITHMS.length * ROW_H;
  return (
    <svg viewBox={`0 0 640 ${bottom + 30}`} width="100%">
      {SERVERS.map((_, i) => (
        <ServerHeader key={i} index={i} />
      ))}
      {ALGORITHMS.map((_, i) => (
        <AlgorithmRow key={i} index={i} />
      ))}
      <text
        x={320}
        y={bottom + 18}
        textAnchor="middle"
        fontSize={11.5}
        fill="var(--sd-edge)"
      >
        একই মুহূর্ত, একই server, তবু algorithm ভেদে আলাদা সিদ্ধান্ত। কোনোটাই
        সবসময় সেরা না।
      </text>
    </svg>
  );
}
