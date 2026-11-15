import type { DiagramEntry } from "@/components/system-design/diagram-registry";
import { Day014Analogy } from "./Day014Analogy";
import { Day014BeforeAfter } from "./Day014BeforeAfter";
import { Day014Before, Day014Main, Day014Summary } from "./Day014Diagrams";
import { Day014SessionFlow } from "./Day014SessionFlow";
import { Day014SessionStore } from "./Day014SessionStore";
import { Day014Shutdown } from "./Day014Shutdown";
import { Day014TokenAnatomy } from "./Day014TokenAnatomy";

export const DAY_014_DIAGRAMS: Record<string, DiagramEntry> = {
  "day-014-before": { render: () => <Day014Before />, minWidth: 560 },
  "day-014-analogy": { render: () => <Day014Analogy />, minWidth: 560 },
  "day-014-main": { render: () => <Day014Main />, minWidth: 640 },
  "day-014-before-after": {
    render: () => <Day014BeforeAfter />,
    framed: false,
  },
  "day-014-session-flow": {
    render: () => <Day014SessionFlow />,
    framed: false,
  },
  "day-014-session-store": {
    render: () => <Day014SessionStore />,
    minWidth: 620,
  },
  "day-014-token-anatomy": {
    render: () => <Day014TokenAnatomy />,
    minWidth: 640,
  },
  "day-014-shutdown": { render: () => <Day014Shutdown />, framed: false },
  "day-014-summary": { render: () => <Day014Summary /> },
};
