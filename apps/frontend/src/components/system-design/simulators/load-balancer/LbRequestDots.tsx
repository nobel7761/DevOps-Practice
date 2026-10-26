import type {
  LbRequest,
  LbState,
} from "@/lib/system-design/sim/load-balancer/engine";
import {
  RESPONSE_MS,
  TRAVEL_MS,
  USER_X,
  userColor,
  type LbLayout,
} from "./lb-layout";

type Point = { x: number; y: number };

const lerp = (a: Point, b: Point, t: number): Point => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

function FailMark({ at }: { at: Point }) {
  return (
    <text
      x={at.x}
      y={at.y}
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={14}
      fontWeight={800}
      fill="var(--sd-fail)"
    >
      ✕
    </text>
  );
}

/** Animated requests: a dot travels user → LB → server, a hollow dot carries the response back, failures show ✕. */
export function LbRequestDots({
  state,
  layout,
}: {
  state: LbState;
  layout: LbLayout;
}) {
  const now = state.timeMs;
  const serverIndex = new Map(state.servers.map((s, i) => [s.id, i]));
  const userPoint = (r: LbRequest): Point => ({
    x: USER_X,
    y: layout.userY(r.userId),
  });
  const serverPoint = (r: LbRequest): Point | null => {
    const index = r.serverId ? serverIndex.get(r.serverId) : undefined;
    return index === undefined ? null : layout.serverAnchor(index);
  };

  return (
    <g>
      {state.requests.map((r) => {
        const age = now - r.sentAt;
        const server = serverPoint(r);
        if (
          r.status === "failed" &&
          r.finishedAt !== null &&
          now - r.finishedAt < TRAVEL_MS * 2
        ) {
          return <FailMark key={r.id} at={server ?? layout.lbCentre} />;
        }
        if (age < TRAVEL_MS) {
          const t = age / TRAVEL_MS;
          const at =
            t < 0.5 || !server
              ? lerp(userPoint(r), layout.lbCentre, Math.min(1, t * 2))
              : lerp(layout.lbCentre, server, (t - 0.5) * 2);
          return (
            <circle
              key={r.id}
              cx={at.x}
              cy={at.y}
              r={4.5}
              fill={userColor(r.userId)}
            />
          );
        }
        if (
          r.status === "succeeded" &&
          r.finishedAt !== null &&
          server &&
          now - r.finishedAt < RESPONSE_MS
        ) {
          const at = lerp(
            server,
            userPoint(r),
            (now - r.finishedAt) / RESPONSE_MS,
          );
          return (
            <circle
              key={r.id}
              cx={at.x}
              cy={at.y}
              r={4}
              fill="none"
              stroke={userColor(r.userId)}
              strokeWidth={2}
            />
          );
        }
        return null;
      })}
    </g>
  );
}
