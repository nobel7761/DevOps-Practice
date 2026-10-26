// DNS hierarchy: root → TLDs → domains → names, each level delegating only to the one below.

interface TreeNode {
  id: string;
  label: string;
  x: number;
  level: number;
  parent?: string;
  highlight?: boolean;
}

const NODES: TreeNode[] = [
  { id: "root", label: ". (root)", x: 340, level: 0, highlight: true },
  {
    id: "com",
    label: "com",
    x: 150,
    level: 1,
    parent: "root",
    highlight: true,
  },
  { id: "org", label: "org", x: 340, level: 1, parent: "root" },
  { id: "bd", label: "bd", x: 530, level: 1, parent: "root" },
  {
    id: "boighor",
    label: "boighor.com",
    x: 80,
    level: 2,
    parent: "com",
    highlight: true,
  },
  { id: "example", label: "example.com", x: 230, level: 2, parent: "com" },
  { id: "wikipedia", label: "wikipedia.org", x: 340, level: 2, parent: "org" },
  { id: "combd", label: "com.bd", x: 530, level: 2, parent: "bd" },
  {
    id: "www",
    label: "www",
    x: 20,
    level: 3,
    parent: "boighor",
    highlight: true,
  },
  { id: "api", label: "api", x: 140, level: 3, parent: "boighor" },
];

const LEVELS = [
  { label: "Root server", color: "var(--sd-external)" },
  { label: "TLD server", color: "var(--sd-client)" },
  { label: "Authoritative (domain-এর নিজের)", color: "var(--sd-server)" },
  { label: "Record (A / AAAA / CNAME)", color: "var(--sd-database)" },
];

const LEVEL_Y = 70;
const BOX_W = 104;
const BOX_H = 34;
const TOP = 20;

const yOf = (level: number) => TOP + level * LEVEL_Y;

/** The DNS tree; the highlighted path is the one www.boighor.com is resolved along. */
export function Day003DnsTree() {
  const byId = new Map(NODES.map((n) => [n.id, n]));
  return (
    <svg viewBox="-40 0 920 300" width="100%">
      {NODES.filter((n) => n.parent).map((n) => {
        const p = byId.get(n.parent!)!;
        const on = n.highlight && p.highlight;
        return (
          <line
            key={`${p.id}-${n.id}`}
            x1={p.x}
            y1={yOf(p.level) + BOX_H}
            x2={n.x}
            y2={yOf(n.level)}
            stroke={on ? "var(--primary)" : "var(--sd-edge)"}
            strokeWidth={on ? 2.5 : 1.5}
          />
        );
      })}
      {NODES.map((n) => {
        const color = LEVELS[n.level].color;
        return (
          <g key={n.id}>
            <rect
              x={n.x - BOX_W / 2}
              y={yOf(n.level)}
              width={BOX_W}
              height={BOX_H}
              rx={8}
              fill="var(--sd-canvas)"
              stroke={color}
              strokeWidth={n.highlight ? 2.5 : 1.5}
            />
            <text
              x={n.x}
              y={yOf(n.level) + BOX_H / 2}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={13}
              fontWeight={600}
              fill="var(--sd-label)"
            >
              {n.label}
            </text>
          </g>
        );
      })}
      {LEVELS.map((level, i) => (
        <text
          key={level.label}
          x={640}
          y={yOf(i) + BOX_H / 2}
          dominantBaseline="central"
          fontSize={12}
          fontWeight={700}
          fill={level.color}
        >
          ← {level.label}
        </text>
      ))}
    </svg>
  );
}
