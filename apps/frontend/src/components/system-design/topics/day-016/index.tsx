import type { DiagramEntry } from "@/components/system-design/diagram-registry";
import { Day016Analogy } from "./Day016Analogy";
import { Day016BeforeAfter } from "./Day016BeforeAfter";
import {
  Day016Before,
  Day016Bff,
  Day016EdgeLayers,
  Day016Main,
  Day016Summary,
} from "./Day016Diagrams";
import { Day016Phases } from "./Day016Phases";
import { Day016PluginChain } from "./Day016PluginChain";

export const DAY_016_DIAGRAMS: Record<string, DiagramEntry> = {
  "day-016-before": { render: () => <Day016Before />, minWidth: 560 },
  "day-016-analogy": { render: () => <Day016Analogy />, minWidth: 560 },
  "day-016-main": { render: () => <Day016Main />, minWidth: 680 },
  "day-016-before-after": {
    render: () => <Day016BeforeAfter />,
    framed: false,
  },
  "day-016-plugin-chain": {
    render: () => <Day016PluginChain />,
    framed: false,
  },
  "day-016-phases": { render: () => <Day016Phases />, minWidth: 640 },
  "day-016-bff": { render: () => <Day016Bff />, minWidth: 600 },
  "day-016-edge-layers": { render: () => <Day016EdgeLayers />, minWidth: 680 },
  "day-016-summary": { render: () => <Day016Summary /> },
};
