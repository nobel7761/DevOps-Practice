import type { DiagramEntry } from "@/components/system-design/diagram-registry";
import { Day005Analogy } from "./Day005Analogy";
import { Day005BeforeAfter } from "./Day005BeforeAfter";
import { Day005Before, Day005Main, Day005Summary } from "./Day005Diagrams";
import { Day005Growth } from "./Day005Growth";
import { Day005LatencyKnee } from "./Day005LatencyKnee";
import { Day005ScalingCurve } from "./Day005ScalingCurve";

export const DAY_005_DIAGRAMS: Record<string, DiagramEntry> = {
  "day-005-before": { render: () => <Day005Before />, minWidth: 560 },
  "day-005-analogy": { render: () => <Day005Analogy />, minWidth: 600 },
  "day-005-main": { render: () => <Day005Main />, minWidth: 680 },
  "day-005-before-after": {
    render: () => <Day005BeforeAfter />,
    framed: false,
  },
  "day-005-growth": { render: () => <Day005Growth />, framed: false },
  "day-005-scaling-curve": {
    render: () => <Day005ScalingCurve />,
    minWidth: 560,
  },
  "day-005-latency-knee": {
    render: () => <Day005LatencyKnee />,
    minWidth: 560,
  },
  "day-005-summary": { render: () => <Day005Summary /> },
};
