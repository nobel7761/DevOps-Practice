import { DiagramEdge, DiagramNode } from "@/components/shared/diagram";

// NAT: private address:port on the inside ↔ one public IP with a different port on the outside.

const ROWS = [
  {
    device: "Phone",
    priv: "192.168.0.105:52814",
    pub: "203.0.113.25:40001",
    y: 40,
  },
  {
    device: "Laptop",
    priv: "192.168.0.110:61022",
    pub: "203.0.113.25:40002",
    y: 150,
  },
];

const TABLE_X = 250;
const TABLE_W = 300;

function NatTable() {
  return (
    <g>
      <rect
        x={TABLE_X}
        y={20}
        width={TABLE_W}
        height={210}
        rx={10}
        fill="var(--sd-gateway-soft)"
        stroke="var(--sd-gateway)"
        strokeWidth={2}
      />
      <text
        x={TABLE_X + TABLE_W / 2}
        y={44}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        Wi-Fi Router: NAT table
      </text>
      <text
        x={TABLE_X + 16}
        y={72}
        fontSize={11}
        fontWeight={700}
        fill="var(--sd-edge)"
      >
        ভেতরে (private)
      </text>
      <text
        x={TABLE_X + TABLE_W - 16}
        y={72}
        textAnchor="end"
        fontSize={11}
        fontWeight={700}
        fill="var(--sd-edge)"
      >
        বাইরে (public)
      </text>
      {ROWS.map((row, i) => (
        <g key={row.device}>
          <rect
            x={TABLE_X + 10}
            y={86 + i * 56}
            width={TABLE_W - 20}
            height={44}
            rx={6}
            fill="var(--sd-canvas)"
            stroke="var(--sd-gateway)"
          />
          <text
            x={TABLE_X + 20}
            y={104 + i * 56}
            fontSize={11}
            fontFamily="monospace"
            fill="var(--sd-label)"
          >
            {row.priv}
          </text>
          <text
            x={TABLE_X + TABLE_W - 20}
            y={122 + i * 56}
            textAnchor="end"
            fontSize={11}
            fontFamily="monospace"
            fill="var(--sd-label)"
          >
            ↔ {row.pub}
          </text>
        </g>
      ))}
    </g>
  );
}

export function Day002Nat() {
  return (
    <svg viewBox="0 0 800 250" width="100%">
      {ROWS.map((row) => (
        <g key={row.device}>
          <DiagramNode kind="client" label={row.device} x={20} y={row.y} />
          <DiagramEdge
            segment={{
              x1: 152,
              y1: row.y + 32,
              x2: TABLE_X - 2,
              y2: row.y + 32,
            }}
          />
        </g>
      ))}
      <NatTable />
      <DiagramEdge
        segment={{ x1: TABLE_X + TABLE_W + 2, y1: 125, x2: 640, y2: 125 }}
        label="203.0.113.25"
        tone="active"
      />
      <DiagramNode kind="external" label="Internet" x={645} y={93} />
      <text
        x={711}
        y={185}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        বাইরে থেকে দেখা যায়
      </text>
      <text
        x={711}
        y={200}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        শুধু একটাই IP
      </text>
    </svg>
  );
}
