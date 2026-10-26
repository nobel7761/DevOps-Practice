import { DiagramNode } from "@/components/shared/diagram";
import {
  isLbAvailable,
  type LbState,
} from "@/lib/system-design/sim/load-balancer/engine";
import { LB_X, type LbLayout } from "./lb-layout";

/** The primary LB, plus the passive one when redundancy is on. */
export function LbBalancers({
  state,
  layout,
}: {
  state: LbState;
  layout: LbLayout;
}) {
  const { primaryUp } = state.lb;
  const available = isLbAvailable(state);

  return (
    <g>
      <DiagramNode
        kind="load-balancer"
        label={state.config.lbRedundancy ? "LB (primary)" : "Load Balancer"}
        x={LB_X}
        y={layout.lbTop("primary")}
        status={primaryUp ? "highlight" : "failed"}
      />
      {state.config.lbRedundancy && (
        <DiagramNode
          kind="load-balancer"
          label="LB (passive)"
          x={LB_X}
          y={layout.lbTop("passive")}
          status={!primaryUp && available ? "highlight" : "dimmed"}
        />
      )}
      {!available && (
        <text
          x={layout.lbCentre.x}
          y={14}
          textAnchor="middle"
          fontSize={13}
          fontWeight={700}
          fill="var(--sd-fail)"
        >
          ✕ Site down: Load Balancer নেই
        </text>
      )}
    </g>
  );
}
