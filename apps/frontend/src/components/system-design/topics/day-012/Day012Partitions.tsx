const CELL = 46;
const LEFT = 120;
const OFFSETS = 8;

function PartitionRow({
  y,
  name,
  read,
}: {
  y: number;
  name: string;
  read: { group: string; offset: number; color: string }[];
}) {
  return (
    <g>
      <text
        x={LEFT - 12}
        y={y + CELL / 2}
        textAnchor="end"
        dominantBaseline="central"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {name}
      </text>
      {Array.from({ length: OFFSETS }, (_, offset) => (
        <g key={offset}>
          <rect
            x={LEFT + offset * CELL}
            y={y}
            width={CELL - 4}
            height={CELL - 4}
            rx={6}
            fill="var(--sd-queue-soft)"
            stroke="var(--sd-queue)"
          />
          <text
            x={LEFT + offset * CELL + (CELL - 4) / 2}
            y={y + (CELL - 4) / 2}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={12}
            fill="var(--sd-label)"
          >
            {offset}
          </text>
        </g>
      ))}
      <text
        x={LEFT + OFFSETS * CELL + 4}
        y={y + CELL / 2}
        dominantBaseline="central"
        fontSize={12}
        fill="var(--sd-edge)"
      >
        → নতুন message
      </text>
      {read.map((r, i) => {
        const x = LEFT + r.offset * CELL + (CELL - 4) / 2;
        const below = y + CELL + 4 + i * 18;
        return (
          <g key={r.group}>
            <polygon
              points={`${x},${y + CELL - 2} ${x - 6},${below + 2} ${x + 6},${below + 2}`}
              fill={r.color}
            />
            <text
              x={x + 10}
              y={below + 8}
              fontSize={11}
              fontWeight={600}
              fill={r.color}
            >
              {r.group}: offset {r.offset}
            </text>
          </g>
        );
      })}
    </g>
  );
}

/** Kafka internals: offset-numbered messages per partition; each consumer group keeps its own position. */
export function Day012Partitions() {
  return (
    <svg viewBox="0 0 640 300" width="100%">
      <text x={20} y={22} fontSize={14} fontWeight={700} fill="var(--sd-label)">
        Topic: orders
      </text>
      <PartitionRow
        y={40}
        name="Partition 0"
        read={[
          { group: "Email group", offset: 5, color: "var(--sd-server)" },
          { group: "Analytics group", offset: 2, color: "var(--sd-client)" },
        ]}
      />
      <PartitionRow
        y={170}
        name="Partition 1"
        read={[{ group: "Email group", offset: 3, color: "var(--sd-server)" }]}
      />
    </svg>
  );
}
