// Analogy illustration: Farmgate → Motijheel by CNG (low latency) or by
// double-decker bus (high throughput); the road's width is the bandwidth.

const W = 840;
const H = 300;
const ROAD = { x1: 100, x2: 640, top: 70, bottom: 220 };
const BRACKET_X = 740;
const LANE_MID = (ROAD.top + ROAD.bottom) / 2;

function Place({ x, label }: { x: number; label: string }) {
  return (
    <g>
      <text x={x} y={LANE_MID - 14} textAnchor="middle" fontSize={24}>
        📍
      </text>
      <text
        x={x}
        y={LANE_MID + 16}
        textAnchor="middle"
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {label}
      </text>
    </g>
  );
}

function Road() {
  return (
    <g>
      <rect
        x={ROAD.x1}
        y={ROAD.top}
        width={ROAD.x2 - ROAD.x1}
        height={ROAD.bottom - ROAD.top}
        rx={10}
        fill="var(--sd-edge)"
        fillOpacity={0.12}
        stroke="var(--sd-edge)"
      />
      <line
        x1={ROAD.x1 + 10}
        x2={ROAD.x2 - 10}
        y1={LANE_MID}
        y2={LANE_MID}
        stroke="var(--sd-edge)"
        strokeDasharray="14 10"
      />
    </g>
  );
}

function Vehicle({
  x,
  y,
  emoji,
  lines,
  tag,
  tagColor,
}: {
  x: number;
  y: number;
  emoji: string;
  lines: string[];
  tag: string;
  tagColor: string;
}) {
  return (
    <g>
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={34}
      >
        {emoji}
      </text>
      {lines.map((line, i) => (
        <text
          key={line}
          x={x + 36}
          y={y - 8 + i * 17}
          fontSize={12}
          fill="var(--sd-label)"
        >
          {line}
        </text>
      ))}
      <rect
        x={x + 220}
        y={y - 13}
        width={150}
        height={26}
        rx={13}
        fill={tagColor}
        fillOpacity={0.15}
        stroke={tagColor}
      />
      <text
        x={x + 295}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={700}
        fill={tagColor}
      >
        {tag}
      </text>
    </g>
  );
}

function BandwidthNote() {
  return (
    <g>
      <line
        x1={BRACKET_X}
        x2={BRACKET_X}
        y1={ROAD.top}
        y2={ROAD.bottom}
        stroke="var(--primary)"
        strokeWidth={2}
      />
      <line
        x1={BRACKET_X - 6}
        x2={BRACKET_X + 6}
        y1={ROAD.top}
        y2={ROAD.top}
        stroke="var(--primary)"
        strokeWidth={2}
      />
      <line
        x1={BRACKET_X - 6}
        x2={BRACKET_X + 6}
        y1={ROAD.bottom}
        y2={ROAD.bottom}
        stroke="var(--primary)"
        strokeWidth={2}
      />
      <text
        x={BRACKET_X + 10}
        y={LANE_MID - 8}
        fontSize={12}
        fontWeight={700}
        fill="var(--primary)"
      >
        রাস্তার চওড়া
      </text>
      <text
        x={BRACKET_X + 10}
        y={LANE_MID + 10}
        fontSize={12}
        fontWeight={700}
        fill="var(--primary)"
      >
        = bandwidth
      </text>
    </g>
  );
}

function Footer() {
  return (
    <g fontSize={12} fill="var(--sd-edge)" textAnchor="middle">
      <text
        x={W / 2}
        y={30}
        fontSize={14}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {'ফার্মগেট → মতিঝিল: কোনটা "দ্রুত"?'}
      </text>
      <text x={W / 2} y={252}>
        বাস ৬০ জন না ভরা পর্যন্ত দাঁড়ায় (= batching): প্রতিজনের দেরি বাড়ে,
        মোট পরিবহন বাড়ে
      </text>
      <text x={W / 2} y={274}>
        শাহবাগে জ্যাম লাগলে দুটোই আটকায় (= queuing)
      </text>
    </g>
  );
}

/** Analogy: CNG vs BRTC bus on the same road. */
export function Day007Analogy() {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      <Footer />
      <Road />
      <Place x={50} label="ফার্মগেট" />
      <Place x={690} label="মতিঝিল" />
      <Vehicle
        x={180}
        y={(ROAD.top + LANE_MID) / 2}
        emoji="🛺"
        lines={["CNG: ৩ জন, ২০ মিনিট", "ঘণ্টায় ~৯ জন"]}
        tag="কম latency"
        tagColor="var(--sd-ok)"
      />
      <Vehicle
        x={180}
        y={(LANE_MID + ROAD.bottom) / 2}
        emoji="🚌"
        lines={["বাস: ৬০ জন, ৪৫ মিনিট", "ঘণ্টায় ~৮০ জন"]}
        tag="বেশি throughput"
        tagColor="var(--primary)"
      />
      <BandwidthNote />
    </svg>
  );
}
