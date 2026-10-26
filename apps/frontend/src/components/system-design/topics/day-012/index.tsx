import type { DiagramEntry } from "@/components/system-design/diagram-registry";
import { Day012Analogy } from "./Day012Analogy";
import { Day012BeforeAfter } from "./Day012BeforeAfter";
import { Day012Before, Day012Main, Day012Summary } from "./Day012Diagrams";
import { Day012Lifecycle } from "./Day012Lifecycle";
import { Day012Partitions } from "./Day012Partitions";

export const DAY_012_DIAGRAMS: Record<string, DiagramEntry> = {
  "day-012-before": { render: () => <Day012Before />, minWidth: 560 },
  "day-012-analogy": { render: () => <Day012Analogy />, minWidth: 560 },
  "day-012-main": { render: () => <Day012Main />, minWidth: 640 },
  "day-012-before-after": {
    render: () => <Day012BeforeAfter />,
    framed: false,
  },
  "day-012-lifecycle": { render: () => <Day012Lifecycle />, framed: false },
  "day-012-partitions": { render: () => <Day012Partitions />, minWidth: 560 },
  "day-012-summary": { render: () => <Day012Summary /> },
};
