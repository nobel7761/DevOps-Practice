import type { DiagramEntry } from "@/components/system-design/diagram-registry";
import { Day002Analogy } from "./Day002Analogy";
import { Day002BeforeAfter } from "./Day002BeforeAfter";
import { Day002Before, Day002Main, Day002Summary } from "./Day002Diagrams";
import { Day002Journey } from "./Day002Journey";
import { Day002Nat } from "./Day002Nat";
import { Day002P2P } from "./Day002P2P";
import { Day002Packet } from "./Day002Packet";

export const DAY_002_DIAGRAMS: Record<string, DiagramEntry> = {
  "day-002-before": { render: () => <Day002Before />, minWidth: 560 },
  "day-002-analogy": { render: () => <Day002Analogy />, minWidth: 560 },
  "day-002-main": { render: () => <Day002Main />, minWidth: 640 },
  "day-002-before-after": {
    render: () => <Day002BeforeAfter />,
    framed: false,
  },
  "day-002-packet": { render: () => <Day002Packet />, minWidth: 560 },
  "day-002-journey": { render: () => <Day002Journey />, framed: false },
  "day-002-nat": { render: () => <Day002Nat />, minWidth: 600 },
  "day-002-p2p": { render: () => <Day002P2P />, minWidth: 480 },
  "day-002-summary": { render: () => <Day002Summary /> },
};
