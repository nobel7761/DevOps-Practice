import { DiagramEdge } from "@/components/shared/diagram";

// Internal structure: one logical transfer becomes many physical writes
// (4 rows × 3 index trees × 3 replicas ≈ 36, WAL not counted).

const W = 760;
const H = 330;
const ROWS = ["transaction", "debit ledger", "credit ledger", "outbox"];
const TREES = ["PK", "idx 1", "idx 2"];
const ROW_Y = (i: number) => 30 + i * 64;

function TxBox() {
  return (
    <g>
      <rect
        x={10}
        y={115}
        width={120}
        height={60}
        rx={10}
        fill="var(--sd-client-soft)"
        stroke="var(--sd-client)"
        strokeWidth={1.5}
      />
      <text
        x={70}
        y={140}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        ১টা লেনদেন
      </text>
      <text
        x={70}
        y={158}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        &quot;টাকা পাঠাও&quot;
      </text>
    </g>
  );
}

function RowWithTrees({ name, i }: { name: string; i: number }) {
  const y = ROW_Y(i);
  return (
    <g>
      <DiagramEdge segment={{ x1: 132, y1: 145, x2: 188, y2: y + 22 }} />
      <rect
        x={190}
        y={y}
        width={120}
        height={44}
        rx={8}
        fill="var(--sd-database-soft)"
        stroke="var(--sd-database)"
        strokeWidth={1.5}
      />
      <text
        x={250}
        y={y + 26}
        textAnchor="middle"
        fontSize={12}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {name}
      </text>
      {TREES.map((tree, j) => (
        <g key={tree}>
          <rect
            x={330 + j * 62}
            y={y + 8}
            width={54}
            height={28}
            rx={6}
            fill="var(--sd-canvas)"
            stroke="var(--sd-database)"
          />
          <text
            x={357 + j * 62}
            y={y + 22}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={11}
            fill="var(--sd-label)"
          >
            {tree}
          </text>
        </g>
      ))}
    </g>
  );
}

function Replicas() {
  return (
    <g>
      {[0, 1, 2].map((k) => (
        <g key={k}>
          <rect
            x={600}
            y={40 + k * 76}
            width={150}
            height={56}
            rx={10}
            fill="var(--sd-database-soft)"
            stroke="var(--sd-database)"
            strokeWidth={1.5}
          />
          <text
            x={675}
            y={64 + k * 76}
            textAnchor="middle"
            fontSize={12}
            fontWeight={700}
            fill="var(--sd-label)"
          >
            {k === 0 ? "Primary" : `Replica ${k}`}
          </text>
          <text
            x={675}
            y={82 + k * 76}
            textAnchor="middle"
            fontSize={11}
            fill="var(--sd-edge)"
          >
            একই ১২টা লেখা
          </text>
          <DiagramEdge
            segment={{ x1: 518, y1: 140, x2: 598, y2: 68 + k * 76 }}
          />
        </g>
      ))}
    </g>
  );
}

/** Deep dive: write amplification inside a payments database. */
export function Day019WriteAmp() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <TxBox />
      {ROWS.map((name, i) => (
        <RowWithTrees key={name} name={name} i={i} />
      ))}
      <Replicas />
      <text
        x={380}
        y={300}
        textAnchor="middle"
        fontSize={14}
        fontWeight={700}
        fill="var(--sd-fail)"
      >
        ৪ row × ৩ tree × ৩ কপি ≈ ৩৬টা physical write (WAL বাদে)
      </text>
      <text
        x={380}
        y={320}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        ১,০০০ TPS মানে cluster-জুড়ে ~৩৬,০০০ write/s
      </text>
    </svg>
  );
}
