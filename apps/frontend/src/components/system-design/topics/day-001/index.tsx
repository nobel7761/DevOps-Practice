import type { DiagramEntry } from "@/components/system-design/diagram-registry";
import { Day001Analogy } from "./Day001Analogy";
import { Day001BeforeAfter } from "./Day001BeforeAfter";
import { Day001Before, Day001Main, Day001Summary } from "./Day001Diagrams";
import { Day001Evolution } from "./Day001Evolution";
import { Day001Qualities } from "./Day001Qualities";
import { Day001TradeOff } from "./Day001TradeOff";

export const DAY_001_DIAGRAMS: Record<string, DiagramEntry> = {
  "day-001-before": { render: () => <Day001Before />, minWidth: 560 },
  "day-001-analogy": { render: () => <Day001Analogy />, minWidth: 600 },
  "day-001-qualities": { render: () => <Day001Qualities />, minWidth: 560 },
  "day-001-main": { render: () => <Day001Main />, minWidth: 720 },
  "day-001-before-after": {
    render: () => <Day001BeforeAfter />,
    framed: false,
  },
  "day-001-evolution": { render: () => <Day001Evolution />, framed: false },
  "day-001-tradeoff": { render: () => <Day001TradeOff />, minWidth: 600 },
  "day-001-summary": { render: () => <Day001Summary /> },
};
