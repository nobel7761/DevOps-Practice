import type { RlState } from "@/lib/system-design/sim/rate-limiter/engine";

const W = 760;
const LEFT = 20;
const RIGHT = 20;
const SPAN_MS = 6000;
const LANE_Y = 70;
const DOT = 5;

/**
 * Last few seconds on a timeline: green = allowed, red = 429. Window algorithms
 * also show their window boundaries, so the edge burst is visible.
 */
export function RlTimeline({ state }: { state: RlState }) {
  const now = state.timeMs;
  const from = now - SPAN_MS;
  const x = (t: number) => LEFT + ((t - from) / SPAN_MS) * (W - LEFT - RIGHT);
  const showWindows = ["fixed-window", "sliding-counter"].includes(
    state.config.algorithm,
  );
  const firstBoundary =
    Math.ceil(from / state.config.windowMs) * state.config.windowMs;
  const boundaries: number[] = [];
  for (let t = firstBoundary; t <= now; t += state.config.windowMs)
    boundaries.push(t);

  // Stack same-moment requests vertically so a burst reads as a column.
  const stackAt = new Map<number, number>();
  const recent = state.requests.filter((r) => r.at > from);

  return (
    <g>
      <text
        x={LEFT}
        y={18}
        fontSize={12}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        গত {SPAN_MS / 1000} সেকেন্ডের request (সবুজ = ছাড়া হলো, লাল = 429)
      </text>
      <line
        x1={LEFT}
        y1={LANE_Y + 70}
        x2={W - RIGHT}
        y2={LANE_Y + 70}
        stroke="var(--sd-edge)"
      />
      {showWindows &&
        boundaries.map((t) => (
          <g key={t}>
            <line
              x1={x(t)}
              y1={30}
              x2={x(t)}
              y2={LANE_Y + 74}
              stroke="var(--sd-edge)"
              strokeDasharray="3 4"
            />
            <text
              x={x(t) + 3}
              y={LANE_Y + 86}
              fontSize={10}
              fill="var(--sd-edge)"
            >
              {t / 1000}s
            </text>
          </g>
        ))}
      {recent.map((r) => {
        const key = Math.round(r.at / 25);
        const level = stackAt.get(key) ?? 0;
        stackAt.set(key, level + 1);
        return (
          <circle
            key={r.id}
            cx={x(r.at)}
            cy={LANE_Y + 62 - (level % 12) * (DOT * 2 + 1)}
            r={DOT}
            fill={r.allowed ? "var(--sd-ok)" : "var(--sd-fail)"}
          >
            <title>{`Request #${r.id}: ${r.allowed ? "ছাড়া হলো" : "429"}`}</title>
          </circle>
        );
      })}
      <text
        x={W - RIGHT}
        y={LANE_Y + 86}
        textAnchor="end"
        fontSize={10}
        fill="var(--sd-edge)"
      >
        এখন →
      </text>
    </g>
  );
}
