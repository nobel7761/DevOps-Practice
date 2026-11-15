import { BeforeAfter, DiagramEdge } from "@/components/shared/diagram";

// Before/after: a crash in the middle of a ৳500 transfer, without and with a transaction.

type Tone = "ok" | "fail" | "neutral";

interface ChainStep {
  title: string;
  sub: string;
  tone: Tone;
}

const STEP_W = 150;
const STEP_GAP = 22;

const STROKE: Record<Tone, string> = {
  ok: "var(--sd-ok)",
  fail: "var(--sd-fail)",
  neutral: "var(--sd-database)",
};

function StepCard({ step, index }: { step: ChainStep; index: number }) {
  const x = 10 + index * (STEP_W + STEP_GAP);
  return (
    <g>
      <rect
        x={x}
        y={20}
        width={STEP_W}
        height={58}
        rx={8}
        fill="var(--sd-canvas)"
        stroke={STROKE[step.tone]}
        strokeWidth={2}
      />
      <text
        x={x + STEP_W / 2}
        y={43}
        textAnchor="middle"
        fontSize={12.5}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {step.title}
      </text>
      <text
        x={x + STEP_W / 2}
        y={63}
        textAnchor="middle"
        fontSize={11}
        fill="var(--sd-edge)"
      >
        {step.sub}
      </text>
    </g>
  );
}

function Chain({ steps }: { steps: ChainStep[] }) {
  return (
    <g>
      {steps.slice(1).map((_, i) => {
        const x1 = 10 + (i + 1) * STEP_W + i * STEP_GAP + 2;
        return (
          <DiagramEdge
            key={x1}
            segment={{ x1, y1: 49, x2: x1 + STEP_GAP - 4, y2: 49 }}
          />
        );
      })}
      {steps.map((step, i) => (
        <StepCard key={step.title} step={step} index={i} />
      ))}
    </g>
  );
}

function Outcome({ lines, tone }: { lines: string[]; tone: Tone }) {
  return (
    <g>
      <rect
        x={10}
        y={96}
        width={680}
        height={20 + lines.length * 20}
        rx={8}
        fill="var(--sd-canvas)"
        stroke={STROKE[tone]}
        strokeWidth={1.5}
        strokeDasharray="5 4"
      />
      {lines.map((line, i) => (
        <text
          key={line}
          x={24}
          y={118 + i * 20}
          fontSize={12}
          fontWeight={i === 0 ? 700 : 400}
          fill={i === 0 ? STROKE[tone] : "var(--sd-label)"}
        >
          {line}
        </text>
      ))}
    </g>
  );
}

const WITHOUT: ChainStep[] = [
  { title: "রহিম −৫০০", sub: "১০০০ → ৫০০ (স্থায়ী)", tone: "neutral" },
  { title: "⚡ Crash", sub: "server বন্ধ", tone: "fail" },
  { title: "করিম +৫০০", sub: "হয়নি ✗", tone: "fail" },
  { title: "Restart", sub: "যা ছিল তাই", tone: "fail" },
];

const WITH: ChainStep[] = [
  { title: "BEGIN", sub: "transaction শুরু", tone: "neutral" },
  { title: "রহিম −৫০০", sub: "শুধু transaction-এর ভেতরে", tone: "neutral" },
  { title: "⚡ Crash", sub: "COMMIT হয়নি", tone: "fail" },
  { title: "Recovery", sub: "commit record নেই → বাতিল", tone: "ok" },
];

/** Without a transaction: half a transfer survives the crash. */
export function Day010TransferWithout() {
  return (
    <svg viewBox="0 0 700 140" width="100%">
      <Chain steps={WITHOUT} />
      <Outcome
        tone="fail"
        lines={["রহিম ৫০০ + করিম ২০০ = ৭০০। শুরুতে ছিল ১২০০, ৫০০ টাকা উধাও।"]}
      />
    </svg>
  );
}

/** With a transaction: a crash before COMMIT leaves nothing behind; after COMMIT, both halves survive. */
export function Day010TransferWith() {
  return (
    <svg viewBox="0 0 700 160" width="100%">
      <Chain steps={WITH} />
      <Outcome
        tone="ok"
        lines={[
          "রহিম ১০০০ + করিম ২০০ = ১২০০ ✓ (যেন কিছুই হয়নি)",
          "COMMIT-এর পরে crash হলে: WAL replay → রহিম ৫০০, করিম ৭০০, মোট ১২০০ ✓",
        ]}
      />
    </svg>
  );
}

export function Day010TransferCrash() {
  return (
    <BeforeAfter
      stacked
      beforeTitle="আগে: Transaction ছাড়া, দুটো আলাদা UPDATE"
      afterTitle="পরে: BEGIN … COMMIT-এর ভেতরে"
      before={<Day010TransferWithout />}
      after={<Day010TransferWith />}
      beforeNote="প্রতিটা UPDATE নিজেই আলাদা commit; মাঝে crash মানে অর্ধেক transfer স্থায়ী।"
      afterNote="হয় দুটোই, নয় কোনোটাই না: Atomicity আর Durability একসাথে।"
    />
  );
}
