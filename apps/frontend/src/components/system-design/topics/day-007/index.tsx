import type { DiagramEntry } from "@/components/system-design/diagram-registry";
import { Day007Analogy } from "./Day007Analogy";
import { Day007BeforeAfter } from "./Day007BeforeAfter";
import { Day007Before } from "./Day007Diagrams";
import { Day007Fanout } from "./Day007Fanout";
import { Day007Journey } from "./Day007Journey";
import { Day007Ladder } from "./Day007Ladder";
import { Day007Main } from "./Day007Main";
import { Day007Percentiles } from "./Day007Percentiles";
import { Day007Summary } from "./Day007Summary";

export const DAY_007_DIAGRAMS: Record<string, DiagramEntry> = {
  "day-007-before": { render: () => <Day007Before />, minWidth: 560 },
  "day-007-analogy": { render: () => <Day007Analogy />, minWidth: 640 },
  "day-007-main": { render: () => <Day007Main />, minWidth: 600 },
  "day-007-before-after": {
    render: () => <Day007BeforeAfter />,
    framed: false,
  },
  "day-007-percentiles": {
    render: () => <Day007Percentiles />,
    minWidth: 560,
  },
  "day-007-journey": { render: () => <Day007Journey />, framed: false },
  "day-007-ladder": { render: () => <Day007Ladder />, minWidth: 640 },
  "day-007-fanout": { render: () => <Day007Fanout />, minWidth: 560 },
  "day-007-summary": { render: () => <Day007Summary /> },
};
