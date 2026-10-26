// Internal structure: the same 10 requests (5 just before and 5 just after the
// one-minute edge) judged by Fixed Window, Sliding Window Log and Sliding
// Window Counter. Limit: 5 requests per 60s.

const X0 = 185;
const X1 = 690;
const T_MAX = 120;
const ROW_H = 92;
const TOP = 40;

const xOf = (t: number) => X0 + (t / T_MAX) * (X1 - X0);

type Outcome = "ok" | "reject";

interface Row {
  title: string;
  sub: string;
  outcomes: Outcome[];
  note: string;
  noteTone: "fail" | "ok";
}

const TIMES = [50, 52, 54, 56, 58, 61, 63, 65, 67, 69];
const okThen = (ok: number): Outcome[] =>
  TIMES.map((_, i) => (i < ok ? "ok" : "reject"));

const ROWS: Row[] = [
  {
    title: "Fixed Window",
    sub: "প্রতি মিনিটে একটা counter",
    outcomes: okThen(10),
    note: "দুই window-এ ৫+৫ = ১৯ সেকেন্ডে ১০টা পাস: limit-এর 2×",
    noteTone: "fail",
  },
  {
    title: "Sliding Window Log",
    sub: "প্রতিটা timestamp মনে রাখে",
    outcomes: okThen(5),
    note: "t=61s: শেষ ৬০s-এ (1s→61s) আগেই ৫টা আছে → ✕, ঠিক ৫টাই পাস",
    noteTone: "ok",
  },
  {
    title: "Sliding Window Counter",
    sub: "দুই counter, ওজন দিয়ে আন্দাজ",
    outcomes: okThen(6),
    note: "t=63s: 5×(57/60) + 1 = 5.75 ≥ 5 → ✕ (আন্দাজ, তাই ৬টা পাস)",
    noteTone: "ok",
  },
];

function Axis({ y }: { y: number }) {
  return (
    <g>
      <line x1={X0} y1={y} x2={X1} y2={y} stroke="var(--sd-edge)" />
      {[0, 30, 60, 90, 120].map((t) => (
        <text
          key={t}
          x={xOf(t)}
          y={y + 16}
          textAnchor="middle"
          fontSize={11}
          fill="var(--sd-edge)"
        >
          {t}s
        </text>
      ))}
    </g>
  );
}

function FixedWindows({ y }: { y: number }) {
  return (
    <g>
      {[0, 60].map((start) => (
        <g key={start}>
          <rect
            x={xOf(start) + 2}
            y={y - 34}
            width={xOf(60) - xOf(0) - 4}
            height={30}
            rx={6}
            fill="var(--sd-queue-soft)"
            stroke="var(--sd-queue)"
          />
          <text
            x={(xOf(start) + xOf(start + 60)) / 2}
            y={y - 40}
            textAnchor="middle"
            fontSize={11}
            fill="var(--sd-label)"
          >
            window {start}–{start + 60}s: 5/5 ✓
          </text>
        </g>
      ))}
    </g>
  );
}

function SlidingRange({
  y,
  from,
  to,
}: {
  y: number;
  from: number;
  to: number;
}) {
  return (
    <rect
      x={xOf(from)}
      y={y - 34}
      width={xOf(to) - xOf(from)}
      height={30}
      rx={6}
      fill="var(--sd-cache-soft)"
      stroke="var(--sd-cache)"
      strokeDasharray="5 3"
    />
  );
}

function RequestDots({ y, outcomes }: { y: number; outcomes: Outcome[] }) {
  return (
    <g>
      {TIMES.map((t, i) => (
        <circle
          key={t}
          cx={xOf(t)}
          cy={y - 19}
          r={5}
          fill={outcomes[i] === "ok" ? "var(--sd-ok)" : "var(--sd-fail)"}
        />
      ))}
    </g>
  );
}

function WindowRow({ row, index }: { row: Row; index: number }) {
  const y = TOP + (index + 1) * ROW_H - 20;
  return (
    <g>
      <text
        x={10}
        y={y - 30}
        fontSize={13}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {row.title}
      </text>
      <text x={10} y={y - 14} fontSize={10} fill="var(--sd-edge)">
        {row.sub}
      </text>
      {index === 0 ? (
        <FixedWindows y={y} />
      ) : (
        <SlidingRange
          y={y}
          from={index === 1 ? 1 : 3}
          to={index === 1 ? 61 : 63}
        />
      )}
      <RequestDots y={y} outcomes={row.outcomes} />
      <Axis y={y} />
      <text
        x={X0}
        y={y + 32}
        fontSize={11}
        fontWeight={600}
        fill={row.noteTone === "fail" ? "var(--sd-fail)" : "var(--sd-label)"}
      >
        {row.note}
      </text>
    </g>
  );
}

/** Window algorithms side by side on one timeline (Plan doc Section 6.1, internal structure). */
export function Day018Windows() {
  return (
    <svg viewBox="0 0 720 340" width="100%">
      <text x={10} y={20} fontSize={13} fill="var(--sd-label)">
        Limit: প্রতি ৬০ সেকেন্ডে ৫টা · একই ১০টা request (৫টা 50–58s-এ, ৫টা
        61–69s-এ) · সবুজ = পাস, লাল = 429
      </text>
      {ROWS.map((row, index) => (
        <WindowRow key={row.title} row={row} index={index} />
      ))}
    </svg>
  );
}
