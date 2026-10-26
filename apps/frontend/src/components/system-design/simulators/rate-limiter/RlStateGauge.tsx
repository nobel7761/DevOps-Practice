import {
  ALGORITHM_LABELS,
  getRlMetrics,
  type RlState,
} from "@/lib/system-design/sim/rate-limiter/engine";

const Y = 190;
const X = 20;
const BAR_W = 300;

function Bar({
  label,
  value,
  max,
  color,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
}) {
  const filled = max === 0 ? 0 : Math.min(1, value / max);
  return (
    <g>
      <text x={X} y={Y} fontSize={12} fontWeight={700} fill="var(--sd-label)">
        {label}: {value}/{max}
      </text>
      <rect
        x={X}
        y={Y + 8}
        width={BAR_W}
        height={16}
        rx={8}
        fill="var(--border)"
      />
      <rect
        x={X}
        y={Y + 8}
        width={BAR_W * filled}
        height={16}
        rx={8}
        fill={color}
      />
    </g>
  );
}

/** What the limiter is holding right now: tokens, queue, or the window counter. */
export function RlStateGauge({ state }: { state: RlState }) {
  const c = state.config;
  const m = getRlMetrics(state);
  const title = `${ALGORITHM_LABELS[c.algorithm]}${c.redisDown ? ` · Redis বন্ধ (${c.fallback === "open" ? "fail-open" : c.fallback === "closed" ? "fail-closed" : "local fallback"})` : ""}`;
  return (
    <g>
      <text
        x={X + BAR_W + 30}
        y={Y}
        fontSize={12}
        fontWeight={700}
        fill={c.redisDown ? "var(--sd-fail)" : "var(--sd-label)"}
      >
        {title}
      </text>
      {c.algorithm === "token-bucket" && (
        <Bar
          label="Bucket-এ token"
          value={m.tokens}
          max={c.bucketCapacity}
          color="var(--sd-ok)"
        />
      )}
      {c.algorithm === "leaky-bucket" && (
        <Bar
          label="Queue-তে অপেক্ষায়"
          value={m.queueLength}
          max={c.queueCapacity}
          color="var(--sd-queue)"
        />
      )}
      {c.algorithm !== "token-bucket" && c.algorithm !== "leaky-bucket" && (
        <Bar
          label="গত ১ সেকেন্ডে ছাড়া"
          value={m.allowedLastSecond}
          max={c.limit}
          color="var(--sd-client)"
        />
      )}
    </g>
  );
}
