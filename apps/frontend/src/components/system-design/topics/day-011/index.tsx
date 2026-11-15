import type { DiagramEntry } from "@/components/system-design/diagram-registry";
import { Day011Analogy } from "./Day011Analogy";
import { Day011BeforeAfter } from "./Day011BeforeAfter";
import { Day011CacheKey } from "./Day011CacheKey";
import {
  Day011Before,
  Day011IspCache,
  Day011Main,
  Day011Summary,
} from "./Day011Diagrams";
import { Day011RequestFlow } from "./Day011RequestFlow";
import { Day011Shield } from "./Day011Shield";

export const DAY_011_DIAGRAMS: Record<string, DiagramEntry> = {
  "day-011-before": { render: () => <Day011Before />, minWidth: 600 },
  "day-011-analogy": { render: () => <Day011Analogy />, minWidth: 600 },
  "day-011-main": { render: () => <Day011Main />, minWidth: 680 },
  "day-011-before-after": {
    render: () => <Day011BeforeAfter />,
    framed: false,
  },
  "day-011-request-flow": {
    render: () => <Day011RequestFlow />,
    framed: false,
  },
  "day-011-cache-key": { render: () => <Day011CacheKey />, minWidth: 640 },
  "day-011-shield": { render: () => <Day011Shield />, framed: false },
  "day-011-isp-cache": { render: () => <Day011IspCache />, minWidth: 640 },
  "day-011-summary": { render: () => <Day011Summary /> },
};
