import type { DiagramEntry } from "@/components/system-design/diagram-registry";
import { Day018Analogy } from "./Day018Analogy";
import { Day018BeforeAfter, Day018Distributed } from "./Day018BeforeAfter";
import { Day018Before, Day018Main, Day018Summary } from "./Day018Diagrams";
import { Day018Retry } from "./Day018Retry";
import { Day018TokenBucket } from "./Day018TokenBucket";
import { Day018Windows } from "./Day018Windows";

export const DAY_018_DIAGRAMS: Record<string, DiagramEntry> = {
  "day-018-before": { render: () => <Day018Before />, minWidth: 560 },
  "day-018-analogy": { render: () => <Day018Analogy />, minWidth: 560 },
  "day-018-main": { render: () => <Day018Main />, minWidth: 680 },
  "day-018-before-after": {
    render: () => <Day018BeforeAfter />,
    framed: false,
  },
  "day-018-token-bucket": {
    render: () => <Day018TokenBucket />,
    framed: false,
  },
  "day-018-windows": { render: () => <Day018Windows />, minWidth: 600 },
  "day-018-retry": { render: () => <Day018Retry />, minWidth: 560 },
  "day-018-distributed": { render: () => <Day018Distributed />, framed: false },
  "day-018-summary": { render: () => <Day018Summary /> },
};
