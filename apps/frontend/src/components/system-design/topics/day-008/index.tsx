import type { DiagramEntry } from "@/components/system-design/diagram-registry";
import { Day008Analogy } from "./Day008Analogy";
import { Day008BeforeAfter } from "./Day008BeforeAfter";
import { Day008Before, Day008Summary } from "./Day008Diagrams";
import { Day008Main } from "./Day008Main";
import { Day008Pacelc } from "./Day008Pacelc";
import { Day008Quorum } from "./Day008Quorum";
import { Day008Steps } from "./Day008Steps";

export const DAY_008_DIAGRAMS: Record<string, DiagramEntry> = {
  "day-008-before": { render: () => <Day008Before />, minWidth: 600 },
  "day-008-analogy": { render: () => <Day008Analogy />, minWidth: 600 },
  "day-008-main": { render: () => <Day008Main />, minWidth: 640 },
  "day-008-before-after": {
    render: () => <Day008BeforeAfter />,
    framed: false,
  },
  "day-008-steps": { render: () => <Day008Steps />, framed: false },
  "day-008-quorum": { render: () => <Day008Quorum />, minWidth: 560 },
  "day-008-pacelc": { render: () => <Day008Pacelc />, minWidth: 600 },
  "day-008-summary": { render: () => <Day008Summary /> },
};
