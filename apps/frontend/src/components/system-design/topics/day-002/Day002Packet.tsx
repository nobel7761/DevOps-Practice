// Internal structure: what's inside one packet (IP header → TCP header → payload).

const TOP = 50;
const HEIGHT = 150;

interface PacketPart {
  x: number;
  width: number;
  title: string;
  answers: string;
  fields: string[];
  color: string;
  soft: string;
}

const PARTS: PacketPart[] = [
  {
    x: 20,
    width: 230,
    title: "IP header",
    answers: "কোন machine?",
    fields: ["src IP: 203.0.113.25", "dst IP: 198.51.100.7", "TTL: 64"],
    color: "var(--sd-gateway)",
    soft: "var(--sd-gateway-soft)",
  },
  {
    x: 250,
    width: 210,
    title: "TCP header",
    answers: "কোন program?",
    fields: ["src port: 52814", "dst port: 443", "seq: 1001"],
    color: "var(--sd-server)",
    soft: "var(--sd-server-soft)",
  },
  {
    x: 460,
    width: 200,
    title: "Payload (data)",
    answers: "আসল কথা",
    fields: ["GET /books", "Host: boighor.com", "…"],
    color: "var(--sd-client)",
    soft: "var(--sd-client-soft)",
  },
];

function PartBox({ part }: { part: PacketPart }) {
  const cx = part.x + part.width / 2;
  return (
    <g>
      <rect
        x={part.x}
        y={TOP}
        width={part.width}
        height={HEIGHT}
        fill={part.soft}
        stroke={part.color}
        strokeWidth={2}
      />
      <text
        x={cx}
        y={TOP + 26}
        textAnchor="middle"
        fontSize={14}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {part.title}
      </text>
      {part.fields.map((field, i) => (
        <text
          key={field}
          x={part.x + 16}
          y={TOP + 62 + i * 26}
          fontSize={12}
          fontFamily="monospace"
          fill="var(--sd-label)"
        >
          {field}
        </text>
      ))}
      <text
        x={cx}
        y={TOP + HEIGHT + 26}
        textAnchor="middle"
        fontSize={13}
        fontWeight={600}
        fill={part.color}
      >
        {part.answers}
      </text>
    </g>
  );
}

export function Day002Packet() {
  return (
    <svg viewBox="0 0 680 250" width="100%">
      <text x={20} y={30} fontSize={14} fontWeight={700} fill="var(--sd-label)">
        একটা packet (সাধারণত ≤ ~1500 byte)
      </text>
      {PARTS.map((part) => (
        <PartBox key={part.title} part={part} />
      ))}
    </svg>
  );
}
