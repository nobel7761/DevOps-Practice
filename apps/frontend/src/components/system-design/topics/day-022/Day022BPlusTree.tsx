import { DiagramEdge, StepThrough } from "@/components/shared/diagram";

// A small 3-level B+tree: root → internal (branch) nodes → linked leaves that point to table rows.
// Used twice: the static internal-structure diagram and the level-by-level lookup StepThrough.

interface TreeNode {
  id: string;
  keys: number[];
  cx: number;
  y: number;
  children?: string[];
  leaf?: boolean;
}

const CELL = 34;
const PAD = 6;
const NODE_H = 32;
const ROW_BAND_Y = 300;

const NODES: TreeNode[] = [
  { id: "root", keys: [50], cx: 360, y: 30, children: ["a", "b"] },
  { id: "a", keys: [20, 35], cx: 180, y: 120, children: ["l1", "l2", "l3"] },
  { id: "b", keys: [65, 80], cx: 540, y: 120, children: ["l4", "l5", "l6"] },
  { id: "l1", keys: [5, 12], cx: 60, y: 220, leaf: true },
  { id: "l2", keys: [20, 27], cx: 180, y: 220, leaf: true },
  { id: "l3", keys: [35, 42], cx: 300, y: 220, leaf: true },
  { id: "l4", keys: [50, 58], cx: 420, y: 220, leaf: true },
  { id: "l5", keys: [65, 71], cx: 540, y: 220, leaf: true },
  { id: "l6", keys: [80, 93], cx: 660, y: 220, leaf: true },
];

const BY_ID = new Map(NODES.map((n) => [n.id, n]));
const LEAVES = NODES.filter((n) => n.leaf);

const widthOf = (n: TreeNode) => PAD * 2 + n.keys.length * CELL;
const leftOf = (n: TreeNode) => n.cx - widthOf(n) / 2;
const keyCenter = (n: TreeNode, i: number) =>
  leftOf(n) + PAD + i * CELL + CELL / 2;
/** Pointer i sits on the boundary between key cells i-1 and i (k keys → k+1 pointers). */
const pointerX = (n: TreeNode, i: number) => leftOf(n) + PAD + i * CELL;

export interface TreeHighlight {
  nodes?: string[];
  edges?: string[];
  key?: { node: string; key: number };
  /** Leaf-link indexes: i means the link from leaf i to leaf i+1. */
  links?: number[];
  rows?: number[];
}

function NodeBox({
  node,
  on,
  hitKey,
}: {
  node: TreeNode;
  on: boolean;
  hitKey?: number;
}) {
  const left = leftOf(node);
  const color = node.leaf ? "var(--sd-database)" : "var(--sd-client)";
  return (
    <g>
      <rect
        x={left}
        y={node.y}
        width={widthOf(node)}
        height={NODE_H}
        rx={6}
        fill={on ? "var(--sd-database-soft)" : "var(--sd-canvas)"}
        stroke={on ? "var(--primary)" : color}
        strokeWidth={on ? 2.5 : 1.5}
      />
      {node.keys.map((key, i) => (
        <g key={key}>
          {i > 0 && (
            <line
              x1={left + PAD + i * CELL}
              y1={node.y + 4}
              x2={left + PAD + i * CELL}
              y2={node.y + NODE_H - 4}
              stroke={color}
              strokeWidth={1}
            />
          )}
          <text
            x={keyCenter(node, i)}
            y={node.y + NODE_H / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={13}
            fontWeight={hitKey === key ? 800 : 600}
            fill={hitKey === key ? "var(--primary)" : "var(--sd-label)"}
          >
            {key}
          </text>
        </g>
      ))}
    </g>
  );
}

function ChildEdges({ on }: { on: Set<string> }) {
  return (
    <g>
      {NODES.flatMap((parent) =>
        (parent.children ?? []).map((childId, i) => {
          const child = BY_ID.get(childId)!;
          const id = `${parent.id}-${childId}`;
          return (
            <DiagramEdge
              key={id}
              segment={{
                x1: pointerX(parent, i),
                y1: parent.y + NODE_H,
                x2: child.cx,
                y2: child.y - 2,
              }}
              tone={on.has(id) ? "active" : "normal"}
            />
          );
        }),
      )}
    </g>
  );
}

function LeafLinks({ on }: { on: Set<number> }) {
  return (
    <g>
      {LEAVES.slice(0, -1).map((leaf, i) => {
        const next = LEAVES[i + 1];
        const y = leaf.y + NODE_H / 2;
        return (
          <DiagramEdge
            key={leaf.id}
            segment={{
              x1: leftOf(leaf) + widthOf(leaf) + 2,
              y1: y,
              x2: leftOf(next) - 2,
              y2: y,
            }}
            tone={on.has(i) ? "active" : "normal"}
            dashed={!on.has(i)}
          />
        );
      })}
    </g>
  );
}

function RowBand({ rows }: { rows: Set<number> }) {
  return (
    <g>
      <rect
        x={20}
        y={ROW_BAND_Y}
        width={680}
        height={40}
        rx={8}
        fill="var(--sd-canvas)"
        stroke="var(--sd-database)"
        strokeDasharray="6 4"
      />
      {LEAVES.flatMap((leaf) =>
        leaf.keys.map((key, i) => {
          const x = keyCenter(leaf, i);
          const on = rows.has(key);
          return (
            <g key={key}>
              <line
                x1={x}
                y1={leaf.y + NODE_H}
                x2={x}
                y2={ROW_BAND_Y}
                stroke={on ? "var(--primary)" : "var(--sd-edge)"}
                strokeWidth={on ? 2.5 : 1}
                strokeDasharray={on ? undefined : "3 3"}
              />
              {on && (
                <g>
                  <rect
                    x={x - 26}
                    y={ROW_BAND_Y + 8}
                    width={52}
                    height={24}
                    rx={4}
                    fill="var(--sd-database-soft)"
                    stroke="var(--primary)"
                    strokeWidth={2}
                  />
                  <text
                    x={x}
                    y={ROW_BAND_Y + 20}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={11}
                    fontWeight={700}
                    fill="var(--sd-label)"
                  >
                    row {key}
                  </text>
                </g>
              )}
            </g>
          );
        }),
      )}
      <text
        x={360}
        y={ROW_BAND_Y + 58}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        Table rows (PostgreSQL: heap-এর TID · InnoDB: leaf-এই পুরো row)
      </text>
    </g>
  );
}

function LevelLabels() {
  const labels = [
    { text: "Root", x: 400, y: 50 },
    { text: "Internal (branch)", x: 592, y: 140 },
    { text: "Leaf", x: 347, y: 212 },
  ];
  return (
    <g>
      {labels.map((l) => (
        <text
          key={l.text}
          x={l.x}
          y={l.y}
          fontSize={11}
          fontWeight={700}
          fill="var(--sd-edge)"
        >
          {l.text}
        </text>
      ))}
    </g>
  );
}

export function BPlusTree({ highlight = {} }: { highlight?: TreeHighlight }) {
  const nodes = new Set(highlight.nodes);
  return (
    <svg viewBox="0 0 720 370" width="100%">
      <LevelLabels />
      <ChildEdges on={new Set(highlight.edges)} />
      <LeafLinks on={new Set(highlight.links)} />
      <RowBand rows={new Set(highlight.rows)} />
      {NODES.map((node) => (
        <NodeBox
          key={node.id}
          node={node}
          on={nodes.has(node.id)}
          hitKey={
            highlight.key?.node === node.id ? highlight.key.key : undefined
          }
        />
      ))}
    </svg>
  );
}

/** Internal structure: root, branch nodes, linked leaves, and leaf entries pointing to rows. */
export function Day022Structure() {
  return <BPlusTree />;
}

const LOOKUP_STEPS: { text: string; highlight: TreeHighlight }[] = [
  {
    text: "Query: WHERE id = 42। খোঁজা শুরু হয় root page থেকে। Root প্রায় সবসময় memory-তে (buffer cache) থাকে, তাই এটা প্রায় বিনামূল্যে।",
    highlight: { nodes: ["root"] },
  },
  {
    text: "Root-এ একটাই key: 50। 42 < 50, তাই বাম pointer ধরে নিচে নামি। ডান দিকের অর্ধেক tree আর একবারও দেখতে হবে না।",
    highlight: { nodes: ["root", "a"], edges: ["root-a"] },
  },
  {
    text: "Internal node-এ key 20 আর 35। 42 ≥ 35, তাই সবচেয়ে ডানের (তৃতীয়) pointer। প্রতিটা level-এ খোঁজার জায়গা কয়েকশো ভাগের এক ভাগ হয়ে যায়।",
    highlight: { nodes: ["root", "a", "l3"], edges: ["root-a", "a-l3"] },
  },
  {
    text: "Leaf page-এ পৌঁছলাম। Page-এর ভেতরের key-গুলো sorted, তাই binary search করে 42 পেলাম। মোট পড়া হলো মাত্র ৩টা page।",
    highlight: {
      nodes: ["root", "a", "l3"],
      edges: ["root-a", "a-l3"],
      key: { node: "l3", key: 42 },
    },
  },
  {
    text: "Leaf entry-তে আছে row-এর ঠিকানা: PostgreSQL-এ TID (page, slot), InnoDB-র secondary index-এ primary key। সেটা ধরে table থেকে পুরো row আনি।",
    highlight: { nodes: ["l3"], key: { node: "l3", key: 42 }, rows: [42] },
  },
  {
    text: "Range query হলে (id BETWEEN 42 AND 71)? আবার root-এ ফিরতে হয় না। Leaf-গুলো link দিয়ে জোড়া, তাই পাশের leaf-এ হেঁটে 50, 58, 65, 71 পড়ে ফেলি; range 71-এ শেষ, তাই সেখানেই থামি।",
    highlight: {
      nodes: ["l3", "l4", "l5"],
      links: [2, 3],
      rows: [42, 50, 58, 65, 71],
    },
  },
];

/** Step-by-step B+tree lookup for one key, level by level (Plan doc Section 6.1, deep dive). */
export function Day022Lookup() {
  return (
    <StepThrough
      steps={LOOKUP_STEPS.map((s) => s.text)}
      frames={LOOKUP_STEPS.map((s, i) => (
        <div key={i} className="overflow-x-auto">
          <div className="min-w-[560px]">
            <BPlusTree highlight={s.highlight} />
          </div>
        </div>
      ))}
    />
  );
}
