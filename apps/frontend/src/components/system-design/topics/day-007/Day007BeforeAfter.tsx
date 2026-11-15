import { BeforeAfter } from "@/components/shared/diagram";

// Sequential vs parallel calls for one page: the sum vs the slowest.

interface Call {
  label: string;
  ms: number;
  color: string;
}

const CALLS: Call[] = [
  { label: "Profile", ms: 80, color: "server" },
  { label: "Recommendations", ms: 200, color: "cache" },
  { label: "Cart", ms: 120, color: "database" },
];

const W = 640;
const H = 196;
const LEFT = 150;
const PLOT_W = 440;
const MAX_MS = 400;
const ROW_H = 36;
const TOP = 16;

const x = (ms: number) => LEFT + (ms / MAX_MS) * PLOT_W;

function CallBar({
  call,
  start,
  row,
}: {
  call: Call;
  start: number;
  row: number;
}) {
  const y = TOP + row * ROW_H;
  return (
    <g>
      <text
        x={LEFT - 10}
        y={y + 12}
        textAnchor="end"
        dominantBaseline="central"
        fontSize={12}
        fill="var(--sd-label)"
      >
        {call.label}
      </text>
      <rect
        x={x(start)}
        y={y}
        width={x(start + call.ms) - x(start)}
        height={24}
        rx={4}
        fill={`var(--sd-${call.color}-soft)`}
        stroke={`var(--sd-${call.color})`}
        strokeWidth={1.5}
      />
      <text
        x={(x(start) + x(start + call.ms)) / 2}
        y={y + 12}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {call.ms}ms
      </text>
    </g>
  );
}

function TotalLine({ ms, tone }: { ms: number; tone: "fail" | "ok" }) {
  const color = `var(--sd-${tone})`;
  const bottom = TOP + CALLS.length * ROW_H;
  return (
    <g>
      <line
        x1={x(ms)}
        x2={x(ms)}
        y1={TOP - 6}
        y2={bottom + 4}
        stroke={color}
        strokeWidth={2}
        strokeDasharray="5 3"
      />
      <text
        x={x(ms)}
        y={bottom + 20}
        textAnchor="middle"
        fontSize={12}
        fontWeight={700}
        fill={color}
      >
        মোট {ms}ms
      </text>
    </g>
  );
}

function Axis() {
  const y = TOP + CALLS.length * ROW_H + 40;
  return (
    <g fontSize={10} fill="var(--sd-edge)">
      <line
        x1={x(0)}
        x2={x(MAX_MS)}
        y1={y}
        y2={y}
        stroke="var(--sd-edge)"
        strokeOpacity={0.5}
      />
      {[0, 100, 200, 300, 400].map((ms) => (
        <text key={ms} x={x(ms)} y={y + 13} textAnchor="middle">
          {ms}ms
        </text>
      ))}
    </g>
  );
}

function Gantt({ parallel }: { parallel: boolean }) {
  // Sequential calls start where the previous ones ended (running sum).
  const ends = CALLS.map((_, i) =>
    CALLS.slice(0, i + 1).reduce((sum, c) => sum + c.ms, 0),
  );
  const bars = CALLS.map((call, row) => {
    const start = parallel ? 0 : ends[row] - call.ms;
    return <CallBar key={call.label} call={call} start={start} row={row} />;
  });
  const total = parallel
    ? Math.max(...CALLS.map((c) => c.ms))
    : ends[ends.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" role="img">
      {bars}
      <TotalLine ms={total} tone={parallel ? "ok" : "fail"} />
      <Axis />
    </svg>
  );
}

export function Day007BeforeAfter() {
  return (
    <BeforeAfter
      stacked
      beforeTitle="আগে: একটার পর একটা (sequential)"
      afterTitle="পরে: একসাথে (parallel)"
      before={<Gantt parallel={false} />}
      after={<Gantt parallel />}
      beforeNote="প্রতিটা call আগেরটার শেষের অপেক্ষা করে, তাই সময় যোগ হয়: ৮০ + ২০০ + ১২০ = ৪০০ms।"
      afterNote="তিনটা call পরস্পরের উপর নির্ভর করে না, তাই একসাথে শুরু; সময় = সবচেয়ে ধীরটা = ২০০ms। আরও কমাতে হলে Recommendations-কেই দ্রুত করতে হবে (critical path)।"
    />
  );
}
