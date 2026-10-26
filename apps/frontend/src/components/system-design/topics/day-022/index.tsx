import type { DiagramEntry } from "@/components/system-design/diagram-registry";
import { Day022Analogy } from "./Day022Analogy";
import { Day022BeforeAfter } from "./Day022BeforeAfter";
import { Day022Lookup, Day022Structure } from "./Day022BPlusTree";
import { Day022Clustered } from "./Day022Clustered";
import { Day022Composite } from "./Day022Composite";
import { Day022Before, Day022Main, Day022Summary } from "./Day022Diagrams";

export const DAY_022_DIAGRAMS: Record<string, DiagramEntry> = {
  "day-022-before": { render: () => <Day022Before />, minWidth: 560 },
  "day-022-analogy": { render: () => <Day022Analogy />, minWidth: 560 },
  "day-022-main": { render: () => <Day022Main />, minWidth: 640 },
  "day-022-before-after": {
    render: () => <Day022BeforeAfter />,
    framed: false,
  },
  "day-022-btree": { render: () => <Day022Structure />, minWidth: 560 },
  "day-022-lookup": { render: () => <Day022Lookup />, framed: false },
  "day-022-clustered": { render: () => <Day022Clustered />, minWidth: 600 },
  "day-022-composite": { render: () => <Day022Composite />, minWidth: 560 },
  "day-022-summary": { render: () => <Day022Summary /> },
};
