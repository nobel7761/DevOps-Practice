import type { LbState } from "@/lib/system-design/sim/load-balancer/engine";
import { USER_RADIUS, USER_X, type LbLayout } from "./lb-layout";

/** Faint wiring: users → LB, LB → each server (red dashed when out of rotation). */
export function LbLinks({
  state,
  layout,
}: {
  state: LbState;
  layout: LbLayout;
}) {
  const { lbCentre, lbRightX } = layout;
  return (
    <g>
      {Array.from({ length: state.config.traffic.userCount }, (_, userId) => (
        <line
          key={userId}
          x1={USER_X + USER_RADIUS}
          y1={layout.userY(userId)}
          x2={lbCentre.x - 60}
          y2={lbCentre.y}
          stroke="var(--sd-edge)"
          strokeOpacity={0.25}
        />
      ))}
      {state.servers.map((server, index) => {
        const anchor = layout.serverAnchor(index);
        const out = !server.inRotation;
        return (
          <line
            key={server.id}
            x1={lbRightX}
            y1={lbCentre.y}
            x2={anchor.x}
            y2={anchor.y}
            stroke={out ? "var(--sd-fail)" : "var(--sd-edge)"}
            strokeOpacity={out ? 0.8 : 0.4}
            strokeDasharray={out ? "5 5" : undefined}
          />
        );
      })}
    </g>
  );
}
