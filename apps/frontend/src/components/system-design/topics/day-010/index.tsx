import type { DiagramEntry } from "@/components/system-design/diagram-registry";
import { Day010Analogy } from "./Day010Analogy";
import { Day010Before } from "./Day010Before";
import { Day010LostUpdate } from "./Day010LostUpdate";
import { Day010Main } from "./Day010Main";
import { Day010NoSqlMap } from "./Day010NoSqlMap";
import { Day010Schema } from "./Day010Schema";
import { Day010Summary } from "./Day010Summary";
import { Day010TransferCrash } from "./Day010TransferCrash";
import { Day010WalSteps } from "./Day010WalSteps";

export const DAY_010_DIAGRAMS: Record<string, DiagramEntry> = {
  "day-010-before": { render: () => <Day010Before />, minWidth: 560 },
  "day-010-analogy": { render: () => <Day010Analogy />, minWidth: 560 },
  "day-010-main": { render: () => <Day010Main />, minWidth: 640 },
  "day-010-schema": { render: () => <Day010Schema />, minWidth: 600 },
  "day-010-before-after": {
    render: () => <Day010TransferCrash />,
    framed: false,
  },
  "day-010-nosql-map": { render: () => <Day010NoSqlMap />, minWidth: 560 },
  "day-010-wal-steps": { render: () => <Day010WalSteps />, framed: false },
  "day-010-lost-update": { render: () => <Day010LostUpdate />, framed: false },
  "day-010-summary": { render: () => <Day010Summary /> },
};
