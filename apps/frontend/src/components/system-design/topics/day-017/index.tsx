import type { DiagramEntry } from "@/components/system-design/diagram-registry";
import { Day017Analogy } from "./Day017Analogy";
import { Day017BeforeAfter, Day017Stampede } from "./Day017BeforeAfter";
import { Day017Before, Day017Main, Day017Summary } from "./Day017Diagrams";
import { Day017Layers } from "./Day017Layers";
import { Day017Lru } from "./Day017Lru";
import { Day017Race } from "./Day017Race";
import { Day017WritePatterns } from "./Day017WritePatterns";

export const DAY_017_DIAGRAMS: Record<string, DiagramEntry> = {
  "day-017-before": { render: () => <Day017Before />, minWidth: 600 },
  "day-017-analogy": { render: () => <Day017Analogy />, minWidth: 600 },
  "day-017-main": { render: () => <Day017Main />, minWidth: 600 },
  "day-017-before-after": {
    render: () => <Day017BeforeAfter />,
    framed: false,
  },
  "day-017-layers": { render: () => <Day017Layers />, minWidth: 640 },
  "day-017-write-patterns": {
    render: () => <Day017WritePatterns />,
    minWidth: 640,
  },
  "day-017-race": { render: () => <Day017Race />, framed: false },
  "day-017-lru": { render: () => <Day017Lru />, minWidth: 640 },
  "day-017-stampede": { render: () => <Day017Stampede />, framed: false },
  "day-017-summary": { render: () => <Day017Summary /> },
};
