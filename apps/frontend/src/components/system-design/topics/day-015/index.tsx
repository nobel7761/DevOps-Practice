import type { DiagramEntry } from "@/components/system-design/diagram-registry";
import { Day015Analogy } from "./Day015Analogy";
import { Day015BeforeAfter } from "./Day015BeforeAfter";
import { Day015ConnectFlow } from "./Day015ConnectFlow";
import {
  Day015Before,
  Day015Main,
  Day015Sidecar,
  Day015Summary,
} from "./Day015Diagrams";
import { Day015Headers } from "./Day015Headers";

export const DAY_015_DIAGRAMS: Record<string, DiagramEntry> = {
  "day-015-before": { render: () => <Day015Before />, minWidth: 480 },
  "day-015-analogy": { render: () => <Day015Analogy />, minWidth: 560 },
  "day-015-main": { render: () => <Day015Main />, minWidth: 680 },
  "day-015-before-after": {
    render: () => <Day015BeforeAfter />,
    framed: false,
  },
  "day-015-connect-flow": {
    render: () => <Day015ConnectFlow />,
    framed: false,
  },
  "day-015-headers": { render: () => <Day015Headers />, minWidth: 640 },
  "day-015-sidecar": { render: () => <Day015Sidecar />, minWidth: 600 },
  "day-015-summary": { render: () => <Day015Summary /> },
};
