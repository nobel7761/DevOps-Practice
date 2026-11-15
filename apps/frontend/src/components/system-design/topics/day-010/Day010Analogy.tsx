import { DiagramEdge } from "@/components/shared/diagram";

// Analogy: an open grocery-shop notebook (= a file) vs a bank branch whose cashier writes the register first (= a database with WAL).

const KHATA_PROBLEMS = [
  "দুজন একসাথে একই পাতায় লেখে",
  "চা পড়ে পাতা ভিজলে হিসাব শেষ",
  "মোট বাকি জানতে সব পাতা উল্টাও",
  "অচেনা নামেও বাকি লেখা যায়",
];

function Khata() {
  return (
    <g>
      <rect
        x={10}
        y={20}
        width={280}
        height={250}
        rx={10}
        fill="var(--sd-canvas)"
        stroke="var(--sd-fail)"
        strokeWidth={2}
        strokeDasharray="6 4"
      />
      <text
        x={150}
        y={48}
        textAnchor="middle"
        fontSize={14}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        📒 মুদি দোকানের খোলা খাতা
      </text>
      <text
        x={150}
        y={68}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        = সরাসরি file-এ data
      </text>
      {KHATA_PROBLEMS.map((problem, i) => (
        <g key={problem}>
          <rect
            x={26}
            y={88 + i * 42}
            width={248}
            height={32}
            rx={5}
            fill="var(--sd-external-soft)"
            stroke="var(--sd-external)"
          />
          <text
            x={38}
            y={104 + i * 42}
            dominantBaseline="central"
            fontSize={12}
            fill="var(--sd-label)"
          >
            ✗ {problem}
          </text>
        </g>
      ))}
    </g>
  );
}

function Person({
  cx,
  emoji,
  label,
}: {
  cx: number;
  emoji: string;
  label: string;
}) {
  return (
    <g>
      <circle
        cx={cx}
        cy={120}
        r={26}
        fill="var(--sd-user-soft)"
        stroke="var(--sd-user)"
        strokeWidth={1.5}
      />
      <text
        x={cx}
        y={120}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={24}
      >
        {emoji}
      </text>
      <text
        x={cx}
        y={164}
        textAnchor="middle"
        fontSize={12}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {label}
      </text>
    </g>
  );
}

function StepBox({
  y,
  title,
  sub,
  color,
}: {
  y: number;
  title: string;
  sub: string;
  color: "database" | "cache";
}) {
  return (
    <g>
      <rect
        x={560}
        y={y}
        width={150}
        height={52}
        rx={8}
        fill={`var(--sd-${color}-soft)`}
        stroke={`var(--sd-${color})`}
        strokeWidth={2}
      />
      <text
        x={572}
        y={y + 21}
        fontSize={12.5}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {title}
      </text>
      <text x={572} y={y + 39} fontSize={11} fill="var(--sd-edge)">
        {sub}
      </text>
    </g>
  );
}

function BankRules() {
  const lines = [
    "নিয়ম: account না থাকলে লেনদেন না, balance ঋণাত্মক না = Constraint",
    "Transfer-এর debit আর credit voucher একসাথে = Transaction",
  ];
  return (
    <g>
      <rect
        x={320}
        y={200}
        width={390}
        height={70}
        rx={8}
        fill="var(--sd-canvas)"
        stroke="var(--sd-ok)"
        strokeWidth={1.5}
      />
      {lines.map((line, i) => (
        <text
          key={line}
          x={332}
          y={226 + i * 24}
          fontSize={11.5}
          fill="var(--sd-label)"
        >
          {line}
        </text>
      ))}
    </g>
  );
}

function Bank() {
  return (
    <g>
      <text
        x={515}
        y={30}
        textAnchor="middle"
        fontSize={14}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        🏦 ব্যাংকের শাখা = Database
      </text>
      <Person cx={350} emoji="🧑" label="গ্রাহক" />
      <DiagramEdge
        segment={{ x1: 378, y1: 120, x2: 440, y2: 120 }}
        tone="active"
      />
      <Person cx={468} emoji="🧑‍💼" label="Cashier" />
      <DiagramEdge
        segment={{ x1: 494, y1: 108, x2: 558, y2: 76 }}
        label="①"
        tone="active"
      />
      <StepBox
        y={50}
        title="আগে register-এ লেখা"
        sub="= Write-Ahead Log"
        color="database"
      />
      <DiagramEdge
        segment={{ x1: 494, y1: 132, x2: 558, y2: 150 }}
        label="②"
        tone="active"
      />
      <StepBox
        y={124}
        title="তারপর টাকা দেওয়া"
        sub="= COMMIT-এর OK"
        color="cache"
      />
      <BankRules />
    </g>
  );
}

/** Analogy illustration: the open notebook breaks; the bank writes the register first and follows rules. */
export function Day010Analogy() {
  return (
    <svg viewBox="0 0 720 285" width="100%">
      <Khata />
      <Bank />
    </svg>
  );
}
