import { DiagramEdge } from "@/components/shared/diagram";

// LRU cache internals: a hash map for O(1) lookup, and a doubly linked list
// ordered by last use (head = most recent, tail = next to evict).

const W = 780;
const H = 340;
const NODE_W = 108;
const NODE_H = 44;
const LIST_Y = 230;
const LIST_X0 = 240;
const GAP = 134;

const LIST = ["product:7", "user:42", "product:1", "product:3"];
const MAP = ["product:1", "product:3", "product:7", "user:42"];

const nodeX = (key: string) => LIST_X0 + LIST.indexOf(key) * GAP;

function ListNode({ name, index }: { name: string; index: number }) {
  const x = LIST_X0 + index * GAP;
  const isTail = index === LIST.length - 1;
  return (
    <g>
      <rect
        x={x}
        y={LIST_Y}
        width={NODE_W}
        height={NODE_H}
        rx={8}
        fill="var(--sd-cache-soft)"
        stroke={isTail ? "var(--sd-fail)" : "var(--sd-cache)"}
        strokeWidth={isTail ? 2.5 : 1.5}
      />
      <text
        x={x + NODE_W / 2}
        y={LIST_Y + NODE_H / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
        fill="var(--sd-label)"
      >
        {name}
      </text>
      {index < LIST.length - 1 && (
        <text
          x={x + NODE_W + (GAP - NODE_W) / 2}
          y={LIST_Y + NODE_H / 2}
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={16}
          fill="var(--sd-edge)"
        >
          ⇄
        </text>
      )}
    </g>
  );
}

function HashMap() {
  return (
    <g>
      <rect
        x={20}
        y={20}
        width={160}
        height={200}
        rx={10}
        fill="var(--sd-canvas)"
        stroke="var(--sd-edge)"
        strokeWidth={1.5}
      />
      <text
        x={100}
        y={42}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        Hash map
      </text>
      {MAP.map((key, i) => (
        <g key={key}>
          <rect
            x={34}
            y={56 + i * 40}
            width={132}
            height={30}
            rx={4}
            fill="var(--sd-user-soft)"
            stroke="var(--sd-user)"
          />
          <text
            x={100}
            y={71 + i * 40}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fill="var(--sd-label)"
          >
            {key} → •
          </text>
        </g>
      ))}
    </g>
  );
}

/** Internal structure: hash map + doubly linked list = O(1) get, put and evict. */
export function Day017Lru() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%">
      <HashMap />
      {MAP.map((key, i) => (
        <DiagramEdge
          key={key}
          segment={{
            x1: 166,
            y1: 71 + i * 40,
            x2: nodeX(key) + NODE_W / 2,
            y2: LIST_Y - 2,
          }}
          dashed
        />
      ))}
      {LIST.map((name, i) => (
        <ListNode key={name} name={name} index={i} />
      ))}
      <text
        x={LIST_X0 + NODE_W / 2}
        y={LIST_Y + NODE_H + 22}
        textAnchor="middle"
        fontSize={12}
        fontWeight={700}
        fill="var(--primary)"
      >
        HEAD: সবশেষে ব্যবহৃত
      </text>
      <text
        x={LIST_X0 + 3 * GAP + NODE_W / 2}
        y={LIST_Y + NODE_H + 22}
        textAnchor="middle"
        fontSize={12}
        fontWeight={700}
        fill="var(--sd-fail)"
      >
        TAIL: পরের eviction
      </text>
      <text
        x={W / 2 + 60}
        y={LIST_Y + NODE_H + 52}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        GET হলে node-টা HEAD-এ সরে; নতুন key HEAD-এ ঢোকে; জায়গা না থাকলে TAIL
        মোছে। তিনটাই O(1)।
      </text>
      <text
        x={500}
        y={60}
        textAnchor="middle"
        fontSize={12}
        fill="var(--sd-label)"
      >
        Map বলে key কোথায়; list বলে কে কতটা পুরনো।
      </text>
      <text
        x={500}
        y={82}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        (Redis নিখুঁত list রাখে না: কয়েকটা key নমুনা নিয়ে সবচেয়ে পুরনোটা
        মোছে)
      </text>
    </svg>
  );
}
