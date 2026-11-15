import { StepThrough } from "@/components/shared/diagram";

// StepThrough: a ৳500 transfer through session → buffer cache → WAL → data file, then two crash cases.

const COL_W = 168;
const COL_GAP = 12;

interface Column {
  title: string;
  kind: "server" | "cache" | "database";
}

const COLUMNS: Column[] = [
  { title: "Session (client)", kind: "server" },
  { title: "Buffer Cache (RAM)", kind: "cache" },
  { title: "WAL (disk)", kind: "database" },
  { title: "Data File (disk)", kind: "database" },
];

interface Frame {
  text: string;
  cells: [string[], string[], string[], string[]];
  hot: number[];
  crash?: boolean;
}

const OLD = ["রহিম ১০০০", "করিম ২০০"];

const FRAMES: Frame[] = [
  {
    text: "BEGIN: transaction শুরু। এখনো কিছুই বদলায়নি; data file-এ রহিম ১০০০, করিম ২০০।",
    cells: [["BEGIN"], ["(এখনো কিছু না)"], ["…আগের record"], OLD],
    hot: [0],
  },
  {
    text: "রহিমের −৫০০: রহিমের page memory-তে আনা হলো আর সেখানেই বদলাল (dirty page)। বদলের একটা record WAL-এ যোগ হলো, তবে এখনো fsync হয়নি।",
    cells: [
      ["UPDATE রহিম −৫০০"],
      ["রহিম ৫০০ (dirty)"],
      ["+ রহিম ১০০০→৫০০", "(এখনো flush হয়নি)"],
      OLD,
    ],
    hot: [0, 1, 2],
  },
  {
    text: "করিমের +৫০০: একইভাবে memory-তে বদল আর WAL-এ আরেকটা record। Data file তখনো পুরনো।",
    cells: [
      ["UPDATE করিম +৫০০"],
      ["রহিম ৫০০ (dirty)", "করিম ৭০০ (dirty)"],
      ["+ রহিম ১০০০→৫০০", "+ করিম ২০০→৭০০"],
      OLD,
    ],
    hot: [0, 1, 2],
  },
  {
    text: "COMMIT: commit record WAL-এ যোগ হলো, WAL disk-এ fsync হলো, তারপরই client 'COMMIT OK' পেল। খেয়াল করুন, data file এখনো পুরনো!",
    cells: [
      ["COMMIT → OK ✓"],
      ["রহিম ৫০০ (dirty)", "করিম ৭০০ (dirty)"],
      ["+ রহিম, + করিম", "+ COMMIT ✓ fsync"],
      ["রহিম ১০০০ (পুরনো)", "করিম ২০০ (পুরনো)"],
    ],
    hot: [0, 2],
  },
  {
    text: "পরে checkpoint: dirty page-গুলো data file-এ লেখা হলো। এখন memory আর disk মিলে গেছে; এই পর্যন্ত WAL আর recovery-র জন্য লাগবে না।",
    cells: [
      ["(অন্য কাজ)"],
      ["রহিম ৫০০", "করিম ৭০০ (clean)"],
      ["checkpoint record"],
      ["রহিম ৫০০", "করিম ৭০০"],
    ],
    hot: [1, 3],
  },
  {
    text: "Crash ক: দুটো UPDATE-এর পরে, COMMIT-এর আগে বিদ্যুৎ গেল। RAM মুছে গেল; WAL-এ এই transaction-এর commit record নেই। Restart-এ এটা কখনো হয়নি ধরা হয়: রহিম ১০০০, করিম ২০০।",
    cells: [
      ["⚡ COMMIT হয়নি"],
      ["(RAM মুছে গেছে)"],
      ["record থাকতে পারে", "কিন্তু COMMIT নেই"],
      ["রহিম ১০০০ ✓", "করিম ২০০ ✓"],
    ],
    hot: [2, 3],
    crash: true,
  },
  {
    text: "Crash খ: COMMIT OK-এর পরে, checkpoint-এর আগে বিদ্যুৎ গেল। Data file পুরনো, কিন্তু WAL-এ commit আছে। Restart-এ শেষ checkpoint থেকে WAL replay (redo): data file হয়ে গেল রহিম ৫০০, করিম ৭০০।",
    cells: [
      ["⚡ COMMIT হয়েছিল"],
      ["(RAM মুছে গেছে)"],
      ["+ রহিম, + করিম", "+ COMMIT ✓ → replay"],
      ["রহিম ৫০০ ✓", "করিম ৭০০ ✓"],
    ],
    hot: [2, 3],
    crash: true,
  },
];

function ColumnBox({
  column,
  index,
  lines,
  hot,
}: {
  column: Column;
  index: number;
  lines: string[];
  hot: boolean;
}) {
  const x = 10 + index * (COL_W + COL_GAP);
  return (
    <g>
      <text
        x={x + COL_W / 2}
        y={22}
        textAnchor="middle"
        fontSize={12.5}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {column.title}
      </text>
      <rect
        x={x}
        y={34}
        width={COL_W}
        height={110}
        rx={8}
        fill={`var(--sd-${column.kind}-soft)`}
        stroke={hot ? "var(--primary)" : `var(--sd-${column.kind})`}
        strokeWidth={hot ? 3 : 1.5}
      />
      {lines.map((line, i) => (
        <text
          key={line}
          x={x + COL_W / 2}
          y={70 + i * 24}
          textAnchor="middle"
          fontSize={12}
          fontWeight={hot ? 700 : 400}
          fill="var(--sd-label)"
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function FrameSvg({ frame }: { frame: Frame }) {
  return (
    <svg viewBox="0 0 720 180" width="100%">
      {COLUMNS.map((column, i) => (
        <ColumnBox
          key={column.title}
          column={column}
          index={i}
          lines={frame.cells[i]}
          hot={frame.hot.includes(i)}
        />
      ))}
      <text x={10} y={170} fontSize={11} fill="var(--sd-edge)">
        RAM = বিদ্যুৎ গেলে মুছে যায়
      </text>
      <text
        x={370}
        y={170}
        fontSize={11}
        fill={frame.crash ? "var(--sd-fail)" : "var(--sd-edge)"}
        fontWeight={frame.crash ? 700 : 400}
      >
        {frame.crash
          ? "⚡ crash → restart → recovery"
          : "disk = বিদ্যুৎ গেলেও থাকে (fsync-এর পরে)"}
      </text>
    </svg>
  );
}

/** Step-by-step transfer with the WAL, and what recovery does in each crash case. */
export function Day010WalSteps() {
  return (
    <StepThrough
      steps={FRAMES.map((f) => f.text)}
      frames={FRAMES.map((frame, i) => (
        <div key={i} className="overflow-x-auto">
          <div className="min-w-140">
            <FrameSvg frame={frame} />
          </div>
        </div>
      ))}
    />
  );
}
