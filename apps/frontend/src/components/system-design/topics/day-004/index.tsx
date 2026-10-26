import type { DiagramEntry } from "@/components/system-design/diagram-registry";
import { Day004Analogy } from "./Day004Analogy";
import { Day004BeforeAfter } from "./Day004BeforeAfter";
import { Day004Before, Day004Main, Day004Summary } from "./Day004Diagrams";
import { Day004Maturity } from "./Day004Maturity";
import { Day004PutPatch } from "./Day004PutPatch";
import { Day004RequestFlow } from "./Day004RequestFlow";

export const DAY_004_DIAGRAMS: Record<string, DiagramEntry> = {
  "day-004-before": { render: () => <Day004Before />, minWidth: 560 },
  "day-004-analogy": { render: () => <Day004Analogy />, minWidth: 560 },
  "day-004-main": { render: () => <Day004Main />, minWidth: 640 },
  "day-004-before-after": {
    render: () => <Day004BeforeAfter />,
    framed: false,
  },
  "day-004-request-flow": {
    render: () => <Day004RequestFlow />,
    framed: false,
  },
  "day-004-put-patch": { render: () => <Day004PutPatch />, minWidth: 560 },
  "day-004-maturity": { render: () => <Day004Maturity />, minWidth: 560 },
  "day-004-summary": { render: () => <Day004Summary /> },
};
