import type { DiagramEntry } from "@/components/system-design/diagram-registry";
import { Day003Analogy } from "./Day003Analogy";
import { Day003BeforeAfter } from "./Day003BeforeAfter";
import {
  Day003Before,
  Day003CacheLayers,
  Day003Main,
  Day003Summary,
} from "./Day003Diagrams";
import { Day003DnsTree } from "./Day003DnsTree";
import { Day003HttpMessage } from "./Day003HttpMessage";
import { Day003Journey } from "./Day003Journey";
import { Day003Url } from "./Day003Url";

export const DAY_003_DIAGRAMS: Record<string, DiagramEntry> = {
  "day-003-before": { render: () => <Day003Before />, minWidth: 560 },
  "day-003-analogy": { render: () => <Day003Analogy />, minWidth: 620 },
  "day-003-url": { render: () => <Day003Url />, minWidth: 600 },
  "day-003-main": { render: () => <Day003Main />, minWidth: 680 },
  "day-003-http-message": {
    render: () => <Day003HttpMessage />,
    minWidth: 640,
  },
  "day-003-before-after": {
    render: () => <Day003BeforeAfter />,
    framed: false,
  },
  "day-003-journey": { render: () => <Day003Journey />, framed: false },
  "day-003-dns-tree": { render: () => <Day003DnsTree />, minWidth: 600 },
  "day-003-cache-layers": {
    render: () => <Day003CacheLayers />,
    minWidth: 680,
  },
  "day-003-summary": { render: () => <Day003Summary /> },
};
