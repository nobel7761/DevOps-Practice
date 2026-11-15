import type { DiagramEntry } from "@/components/system-design/diagram-registry";
import { Day006Analogy } from "./Day006Analogy";
import { Day006BeforeAfter, Day006Correlated } from "./Day006BeforeAfter";
import { Day006Before, Day006Main, Day006Summary } from "./Day006Diagrams";
import { Day006Failover } from "./Day006Failover";
import { Day006SeriesParallel } from "./Day006SeriesParallel";

export const DAY_006_DIAGRAMS: Record<string, DiagramEntry> = {
  "day-006-before": { render: () => <Day006Before />, minWidth: 560 },
  "day-006-analogy": { render: () => <Day006Analogy />, minWidth: 560 },
  "day-006-main": { render: () => <Day006Main />, minWidth: 640 },
  "day-006-before-after": {
    render: () => <Day006BeforeAfter />,
    framed: false,
  },
  "day-006-series-parallel": {
    render: () => <Day006SeriesParallel />,
    minWidth: 600,
  },
  "day-006-correlated": { render: () => <Day006Correlated />, framed: false },
  "day-006-failover": { render: () => <Day006Failover />, framed: false },
  "day-006-summary": { render: () => <Day006Summary /> },
};
