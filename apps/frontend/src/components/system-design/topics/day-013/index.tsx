import type { DiagramEntry } from "@/components/system-design/diagram-registry";
import { Day013Analogy } from "./Day013Analogy";
import { Day013Before } from "./Day013Before";
import { Day013BeforeAfter } from "./Day013BeforeAfter";
import { Day013BlastRadius } from "./Day013BlastRadius";
import { Day013CostCurve } from "./Day013CostCurve";
import { Day013DbResize } from "./Day013DbResize";
import { Day013Main, Day013Summary } from "./Day013Diagrams";
import { Day013Numa } from "./Day013Numa";

export const DAY_013_DIAGRAMS: Record<string, DiagramEntry> = {
  "day-013-before": { render: () => <Day013Before />, minWidth: 560 },
  "day-013-analogy": { render: () => <Day013Analogy />, minWidth: 600 },
  "day-013-main": { render: () => <Day013Main />, minWidth: 680 },
  "day-013-before-after": {
    render: () => <Day013BeforeAfter />,
    framed: false,
  },
  "day-013-cost-curve": { render: () => <Day013CostCurve />, minWidth: 560 },
  "day-013-blast-radius": {
    render: () => <Day013BlastRadius />,
    minWidth: 560,
  },
  "day-013-numa": { render: () => <Day013Numa />, minWidth: 600 },
  "day-013-db-resize": { render: () => <Day013DbResize />, framed: false },
  "day-013-summary": { render: () => <Day013Summary /> },
};
