import { StepThrough } from "@/components/shared/diagram";

// Token bucket over time: capacity 5, refill 1 token/s, one token per request.

const CAPACITY = 5;
const T_MAX = 12;
const AXIS_X0 = 300;
const AXIS_X1 = 690;
const AXIS_Y = 230;

type Outcome = "ok" | "reject";

interface RequestDot {
  t: number;
  outcome: Outcome;
}

interface Frame {
  t: number;
  /** Tokens left after this moment's requests. */
  tokens: number;
  headline: string;
  /** Requests that arrive at this frame's moment. */
  arrivals: RequestDot[];
}

const at = (t: number, ok: number, rejected = 0): RequestDot[] => [
  ...Array.from({ length: ok }, () => ({ t, outcome: "ok" as const })),
  ...Array.from({ length: rejected }, () => ({
    t,
    outcome: "reject" as const,
  })),
];

const FRAMES: Frame[] = [
  { t: 0, tokens: 5, headline: "শুরু: bucket ভরা (5/5)", arrivals: [] },
  {
    t: 0,
    tokens: 0,
    headline: "৫টা request একসাথে → ৫টাই ✓",
    arrivals: at(0, 5),
  },
  {
    t: 0.5,
    tokens: 0.5,
    headline: "আরেকটা request → token নেই → 429",
    arrivals: at(0.5, 0, 1),
  },
  {
    t: 1,
    tokens: 0,
    headline: "১ token জমেছে → request ✓",
    arrivals: at(1, 1),
  },
  {
    t: 4,
    tokens: 0,
    headline: "৩s চুপ → 3 token; ৪টা এলো → ৩ ✓, ১ ✕",
    arrivals: at(4, 3, 1),
  },
  {
    t: 12,
    tokens: 5,
    headline: "৮s চুপ, কিন্তু token 5-এর বেশি জমে না",
    arrivals: [],
  },
];

const STEPS = [
  "Bucket-এর capacity 5, প্রতি সেকেন্ডে 1টা করে token ঢোকে। শুরুতে bucket ভরা।",
  "একসাথে ৫টা request এলো। প্রতিটা একটা করে token নিল, সবাই পাস। এটাই burst: জমানো token একবারে খরচ।",
  "আধা সেকেন্ড পরে আরেকটা request। মাত্র 0.5 token জমেছে, পুরো 1টা নেই, তাই 429 Too Many Requests।",
  "t = 1s-এ পুরো 1টা token হলো। নতুন request সেটা নিয়ে পাস। এখন থেকে টানা চাপ দিলে সেকেন্ডে মাত্র 1টা পাস হবে: এটাই sustained rate।",
  "তিন সেকেন্ড কেউ আসেনি, 3টা token জমেছে। এবার ৪টা request: ৩টা পাস, ৪র্থটা 429।",
  "আট সেকেন্ড চুপ থাকলেও token 8টা হয় না, 5-এ আটকে থাকে। তাই সবচেয়ে বড় burst সবসময় capacity-র সমান। যেকোনো 10s-এ সর্বোচ্চ 5 + 10×1 = 15টা request।",
];

const xOf = (t: number) => AXIS_X0 + (t / T_MAX) * (AXIS_X1 - AXIS_X0);
const dotColor = (outcome: Outcome) =>
  outcome === "ok" ? "var(--sd-ok)" : "var(--sd-fail)";

function Bucket({ tokens }: { tokens: number }) {
  const whole = Math.floor(tokens);
  const partial = tokens - whole;
  return (
    <g>
      <text
        x={130}
        y={28}
        textAnchor="middle"
        fontSize={12}
        fill="var(--sd-edge)"
      >
        ⬇ +1 token / সেকেন্ড
      </text>
      <path
        d="M 40 50 L 220 50 L 200 210 L 60 210 Z"
        fill="var(--sd-cache-soft)"
        stroke="var(--sd-cache)"
        strokeWidth={2}
      />
      {Array.from({ length: CAPACITY }, (_, i) => {
        const cx = 85 + (i % 3) * 45;
        const cy = 175 - Math.floor(i / 3) * 50;
        const filled = i < whole;
        const half = i === whole && partial > 0;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={17}
            fill={filled || half ? "var(--sd-cache)" : "var(--sd-canvas)"}
            fillOpacity={half ? 0.35 : 1}
            stroke="var(--sd-cache)"
            strokeDasharray={filled ? undefined : "4 3"}
            strokeWidth={1.5}
          />
        );
      })}
      <text
        x={130}
        y={240}
        textAnchor="middle"
        fontSize={14}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        Token: {tokens} / {CAPACITY}
      </text>
    </g>
  );
}

function Timeline({ dots, now }: { dots: RequestDot[]; now: number }) {
  const stackIndex = new Map<number, number>();
  return (
    <g>
      <line
        x1={AXIS_X0}
        y1={AXIS_Y}
        x2={AXIS_X1}
        y2={AXIS_Y}
        stroke="var(--sd-edge)"
        strokeWidth={1.5}
      />
      {[0, 2, 4, 6, 8, 10, 12].map((t) => (
        <g key={t}>
          <line
            x1={xOf(t)}
            y1={AXIS_Y - 4}
            x2={xOf(t)}
            y2={AXIS_Y + 4}
            stroke="var(--sd-edge)"
          />
          <text
            x={xOf(t)}
            y={AXIS_Y + 18}
            textAnchor="middle"
            fontSize={11}
            fill="var(--sd-edge)"
          >
            {t}s
          </text>
        </g>
      ))}
      <line
        x1={xOf(now)}
        y1={70}
        x2={xOf(now)}
        y2={AXIS_Y}
        stroke="var(--primary)"
        strokeWidth={2}
        strokeDasharray="4 3"
      />
      {dots.map((dot, i) => {
        const level = stackIndex.get(dot.t) ?? 0;
        stackIndex.set(dot.t, level + 1);
        return (
          <circle
            key={i}
            cx={xOf(dot.t) + (dot.t === 0.5 ? 8 : 0)}
            cy={AXIS_Y - 14 - level * 16}
            r={6}
            fill={dotColor(dot.outcome)}
          />
        );
      })}
      <text x={AXIS_X0} y={AXIS_Y + 36} fontSize={11} fill="var(--sd-edge)">
        ● সবুজ = পাস · ● লাল = 429
      </text>
    </g>
  );
}

function TokenBucketFrame({ index }: { index: number }) {
  const frame = FRAMES[index];
  const dots = FRAMES.slice(0, index + 1).flatMap((f) => f.arrivals);
  return (
    <svg viewBox="0 0 720 280" width="100%">
      <Bucket tokens={frame.tokens} />
      <text
        x={AXIS_X0}
        y={36}
        fontSize={15}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        t = {frame.t}s
      </text>
      <text x={AXIS_X0} y={58} fontSize={13} fill="var(--sd-label)">
        {frame.headline}
      </text>
      <Timeline dots={dots} now={frame.t} />
    </svg>
  );
}

/** Step-by-step token bucket (Plan doc Section 6.1, deep dive). */
export function Day018TokenBucket() {
  return (
    <StepThrough
      steps={STEPS}
      frames={STEPS.map((_, step) => (
        <div key={step} className="overflow-x-auto">
          <TokenBucketFrame index={step} />
        </div>
      ))}
    />
  );
}
