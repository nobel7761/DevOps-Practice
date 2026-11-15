// Before: two requests read-modify-write the same orders.json, and a crash mid-write breaks the file.

const MONO = "ui-monospace, SFMono-Regular, Menlo, monospace";
const ROW_H = 34;
const TOP = 16;

const COLUMNS = [
  { x: 10, width: 56, title: "সময়" },
  { x: 72, width: 196, title: "Request A (রহিম)" },
  { x: 274, width: 196, title: "Request B (করিম)" },
  { x: 476, width: 194, title: "orders.json-এ" },
];

interface TimelineRow {
  time: string;
  a: string;
  b: string;
  file: string;
  bad?: boolean;
}

const ROWS: TimelineRow[] = [
  { time: "t1", a: "পড়ল → ৪১টা order", b: "", file: "৪১টা" },
  { time: "t2", a: "", b: "পড়ল → ৪১টা order", file: "৪১টা" },
  { time: "t3", a: "লিখল: ৪১ + রহিম", b: "", file: "৪২টা (রহিম আছে)" },
  {
    time: "t4",
    a: "",
    b: "লিখল: ৪১ + করিম",
    file: "৪২টা (রহিম নেই!)",
    bad: true,
  },
];

function HeaderRow() {
  return (
    <g>
      {COLUMNS.map((col) => (
        <text
          key={col.title}
          x={col.x + 8}
          y={TOP + 18}
          fontSize={12.5}
          fontWeight={700}
          fill="var(--sd-label)"
        >
          {col.title}
        </text>
      ))}
    </g>
  );
}

function Cell({
  col,
  row,
  text,
  bad,
}: {
  col: number;
  row: number;
  text: string;
  bad?: boolean;
}) {
  const { x, width } = COLUMNS[col];
  const y = TOP + (row + 1) * ROW_H;
  const isFile = col === 3;
  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={ROW_H - 6}
        rx={5}
        fill={
          bad
            ? "var(--sd-canvas)"
            : isFile
              ? "var(--sd-external-soft)"
              : text
                ? "var(--sd-server-soft)"
                : "var(--sd-canvas)"
        }
        stroke={bad ? "var(--sd-fail)" : "var(--sd-edge)"}
        strokeWidth={bad ? 2.5 : 1}
        strokeDasharray={text || isFile || col === 0 ? undefined : "3 4"}
      />
      <text
        x={x + 8}
        y={y + (ROW_H - 6) / 2}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={bad ? 700 : 400}
        fill={bad ? "var(--sd-fail)" : "var(--sd-label)"}
      >
        {text}
      </text>
    </g>
  );
}

function CrashBox() {
  const y = TOP + 5 * ROW_H + 14;
  return (
    <g>
      <rect
        x={10}
        y={y}
        width={660}
        height={70}
        rx={8}
        fill="var(--sd-canvas)"
        stroke="var(--sd-fail)"
        strokeWidth={2}
        strokeDasharray="6 4"
      />
      <text
        x={22}
        y={y + 22}
        fontSize={12.5}
        fontWeight={700}
        fill="var(--sd-fail)"
      >
        ⚡ লেখার মাঝপথে বিদ্যুৎ গেল → disk-এ অর্ধেক লেখা file:
      </text>
      <text
        x={22}
        y={y + 44}
        fontSize={12}
        fontFamily={MONO}
        fill="var(--sd-label)"
      >
        {'[ {"id": 41, ...}, {"id": 42, "cust'}
      </text>
      <text x={22} y={y + 61} fontSize={11.5} fill="var(--sd-edge)">
        পরের দিন JSON parse error: একটা order-ও আর পড়া যায় না
      </text>
    </g>
  );
}

/** Before: lost update between two requests, plus a torn file after a crash. */
export function Day010Before() {
  return (
    <svg viewBox="0 0 680 290" width="100%">
      <HeaderRow />
      {ROWS.map((row, i) => (
        <g key={row.time}>
          <Cell col={0} row={i} text={row.time} />
          <Cell col={1} row={i} text={row.a} />
          <Cell col={2} row={i} text={row.b} />
          <Cell col={3} row={i} text={row.file} bad={row.bad} />
        </g>
      ))}
      <CrashBox />
    </svg>
  );
}
