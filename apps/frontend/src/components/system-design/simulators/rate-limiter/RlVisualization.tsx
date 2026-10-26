import type { RlState } from "@/lib/system-design/sim/rate-limiter/engine";
import { RlStateGauge } from "./RlStateGauge";
import { RlTimeline } from "./RlTimeline";

export function RlVisualization({ state }: { state: RlState }) {
  return (
    <svg
      viewBox="0 0 760 230"
      width="100%"
      style={{ minWidth: 560 }}
      role="img"
      aria-label="Request-এর timeline আর rate limiter-এর বর্তমান অবস্থা"
    >
      <RlTimeline state={state} />
      <RlStateGauge state={state} />
    </svg>
  );
}
