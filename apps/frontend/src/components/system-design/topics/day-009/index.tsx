import type { DiagramEntry } from "@/components/system-design/diagram-registry";
import { Day009Algorithms } from "./Day009Algorithms";
import { Day009Analogy } from "./Day009Analogy";
import { Day009BeforeAfter } from "./Day009BeforeAfter";
import {
  Day009Before,
  Day009LbPair,
  Day009Main,
  Day009Summary,
} from "./Day009Diagrams";
import { Day009L7Flow } from "./Day009L7Flow";
import { Day009Layers } from "./Day009Layers";

export const DAY_009_DIAGRAMS: Record<string, DiagramEntry> = {
  "day-009-before": { render: () => <Day009Before />, minWidth: 560 },
  "day-009-analogy": { render: () => <Day009Analogy />, minWidth: 560 },
  "day-009-main": { render: () => <Day009Main />, minWidth: 640 },
  "day-009-before-after": {
    render: () => <Day009BeforeAfter />,
    framed: false,
  },
  "day-009-layers": { render: () => <Day009Layers />, minWidth: 600 },
  "day-009-algorithms": { render: () => <Day009Algorithms />, minWidth: 600 },
  "day-009-l7-flow": { render: () => <Day009L7Flow />, framed: false },
  "day-009-lb-pair": { render: () => <Day009LbPair />, minWidth: 640 },
  "day-009-summary": { render: () => <Day009Summary /> },
};
