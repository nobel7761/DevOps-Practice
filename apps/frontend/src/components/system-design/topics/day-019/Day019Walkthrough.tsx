import { StepThrough } from "@/components/shared/diagram";

// StepThrough: one full estimate for the fictional "টাকাঘর" wallet, as a
// worksheet that fills one line per step (current line highlighted).

const W = 720;
const ROW_H = 34;
const TOP = 44;

const ROWS: { label: string; formula: string; value: string }[] = [
  {
    label: "Assumption",
    formula: "১ কোটি DAU × ২ লেনদেন; peak ×১০; ১KB/লেনদেন",
    value: "লিখে রাখা",
  },
  { label: "গড় TPS", formula: "2×10⁷ ÷ 10⁵", value: "~২০০" },
  {
    label: "Peak",
    formula: "২০০ × ১০; প্রতি লেনদেনে ৫টা read",
    value: "২,০০০ write, ১০,০০০ read/s",
  },
  {
    label: "Storage (raw)",
    formula: "2×10⁷ × 1KB = ২০GB/দিন × ৩৬৫",
    value: "~৭.৩TB/বছর",
  },
  {
    label: "Storage (আসল)",
    formula: "৭.৩TB × 1.5 (index) × 3 (কপি)",
    value: "~৩৩TB/বছর",
  },
  {
    label: "Bandwidth",
    formula: "১২,০০০/s × 2KB = 24MB/s × 8",
    value: "~০.২ Gbps",
  },
  { label: "Cache", formula: "১ কোটি account summary × 100B", value: "~১GB" },
  {
    label: "App server",
    formula: "২,০০০ ÷ (৪০০ × 0.6) = ৮.৩ → ৯, + ১",
    value: "১০টা",
  },
  {
    label: "Sanity check",
    formula: "৩৩TB ÷ (2×10⁷ × ৩৬৫) ≈ ৪.৫KB = 1KB × 1.5 × 3",
    value: "মিলেছে ✓",
  },
];

const STEPS = [
  "আগে assumption লিখি: ১ কোটি DAU, প্রতি জন দিনে ২টা লেনদেন, মাসের শুরু আর ঈদের আগে peak গড়ের ১০ গুণ, প্রতি লেনদেনে সব row মিলিয়ে ~১KB। সব সংখ্যা কাল্পনিক।",
  "দিনে ২ কোটি লেনদেন। ৮৬,৪০০-এর বদলে 10⁵ দিয়ে ভাগ: গড় ~২০০ TPS (আসল ~২৩১, মাথার হিসাব একটু কম বলে)।",
  "Peak ১০ গুণ: ২,০০০ TPS write। প্রতি লেনদেনের আশেপাশে balance আর history দেখা মিলিয়ে ~৫টা read, তাই ~১০,০০০ read/s।",
  "Raw storage: ২ কোটি × ১KB = দিনে ২০GB, বছরে ~৭.৩TB। Payment-এর record বহু বছর রাখতে হয়, তাই এটা প্রতি বছর জমবে।",
  "Index-এর জন্য ৫০% বাড়তি আর ৩টা কপি: ৭.৩ × ১.৫ × ৩ ≈ ৩৩TB/বছর। Raw সংখ্যার সাড়ে চার গুণ।",
  "Bandwidth: peak-এ মোট ১২,০০০ request/s × ~২KB response = ২৪MB/s, × ৮ = ~১৯২ Mbps। Wallet-এ bandwidth কোনো সমস্যা না।",
  "Cache: প্রোফাইল আর সাম্প্রতিক summary, ১ কোটি × ~১০০ byte ≈ ১GB। টাকার আসল balance-এর উৎস কিন্তু database, cache শুধু দেখানোর জন্য।",
  "Load test-এ একটা app server p99 ঠিক রেখে ৪০০ TPS পারে। ৬০%-এ ২৪০। ২,০০০ ÷ ২৪০ = ৮.৩ → ৯টা, N+1-এ ১০টা। আসল চাপ database-এর write-এ, তাই sharding-এর পরিকল্পনা শুরু।",
  "উল্টো দিক থেকে মেলাই: ৩৩TB-কে বছরের মোট লেনদেন দিয়ে ভাগ করলে প্রতি লেনদেনে ~৪.৫KB, যা ১KB × ১.৫ × ৩-এর সাথে মেলে। হিসাবে কোনো একক হারায়নি।",
];

function Sheet({ upTo }: { upTo: number }) {
  const height = TOP + ROWS.length * ROW_H + 16;
  return (
    <svg viewBox={`0 0 ${W} ${height}`} width="100%" role="img">
      <rect
        x={4}
        y={4}
        width={W - 8}
        height={height - 8}
        rx={12}
        fill="var(--sd-canvas)"
        stroke="var(--sd-edge)"
        strokeOpacity={0.4}
      />
      <text x={20} y={30} fontSize={14} fontWeight={700} fill="var(--sd-label)">
        🧮 টাকাঘর wallet: estimate খাতা
      </text>
      {ROWS.map((row, i) => {
        const y = TOP + i * ROW_H;
        const shown = i <= upTo;
        const current = i === upTo;
        return (
          <g key={row.label} opacity={shown ? 1 : 0.25}>
            <rect
              x={12}
              y={y}
              width={W - 24}
              height={ROW_H - 4}
              rx={6}
              fill={current ? "var(--sd-cache-soft)" : "transparent"}
              stroke={current ? "var(--sd-cache)" : "none"}
            />
            <text
              x={22}
              y={y + 19}
              fontSize={12}
              fontWeight={700}
              fill="var(--sd-label)"
            >
              {row.label}
            </text>
            <text x={140} y={y + 19} fontSize={12} fill="var(--sd-label)">
              {shown ? row.formula : "…"}
            </text>
            <text
              x={W - 22}
              y={y + 19}
              textAnchor="end"
              fontSize={12}
              fontWeight={700}
              fill={shown ? "var(--primary)" : "var(--sd-edge)"}
            >
              {shown ? row.value : "?"}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** Deep dive: one full napkin estimate, line by line. */
export function Day019Walkthrough() {
  return (
    <StepThrough
      steps={STEPS}
      frames={ROWS.map((row, i) => (
        <Sheet key={row.label} upTo={i} />
      ))}
    />
  );
}
