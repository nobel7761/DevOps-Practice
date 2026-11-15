import type { DiagramEntry } from "@/components/system-design/diagram-registry";
import { Day019Analogy } from "./Day019Analogy";
import { Day019Before, Day019BeforeAfter } from "./Day019Diagrams";
import { Day019Pipeline, Day019Summary } from "./Day019Pipeline";
import { Day019Utilization } from "./Day019Utilization";
import { Day019Walkthrough } from "./Day019Walkthrough";
import { Day019WriteAmp } from "./Day019WriteAmp";

export const DAY_019_DIAGRAMS: Record<string, DiagramEntry> = {
  "day-019-before": { render: () => <Day019Before />, minWidth: 600 },
  "day-019-analogy": { render: () => <Day019Analogy />, minWidth: 600 },
  "day-019-main": { render: () => <Day019Pipeline />, minWidth: 640 },
  "day-019-before-after": {
    render: () => <Day019BeforeAfter />,
    framed: false,
  },
  "day-019-walkthrough": { render: () => <Day019Walkthrough />, framed: false },
  "day-019-utilization": { render: () => <Day019Utilization />, minWidth: 560 },
  "day-019-write-amp": { render: () => <Day019WriteAmp />, minWidth: 600 },
  "day-019-summary": { render: () => <Day019Summary /> },
};
