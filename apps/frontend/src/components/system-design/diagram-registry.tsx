// Every lesson diagram, by the id used in lesson data (`LessonDiagram.id`).
// Each topic exports its own map from components/system-design/topics/day-NNN/index.tsx.
// `framed: false` diagrams bring their own border/controls (step-throughs,
// before/after) and are shown without the scrolling canvas frame.

import type { ReactNode } from "react";
import { DAY_002_DIAGRAMS } from "@/components/system-design/topics/day-002";
import { DAY_001_DIAGRAMS } from "@/components/system-design/topics/day-001";
import { DAY_003_DIAGRAMS } from "@/components/system-design/topics/day-003";
import { DAY_004_DIAGRAMS } from "@/components/system-design/topics/day-004";
import { DAY_018_DIAGRAMS } from "@/components/system-design/topics/day-018";
import { DAY_022_DIAGRAMS } from "@/components/system-design/topics/day-022";
import { DAY_005_DIAGRAMS } from "@/components/system-design/topics/day-005";
import { DAY_006_DIAGRAMS } from "@/components/system-design/topics/day-006";
import { DAY_007_DIAGRAMS } from "@/components/system-design/topics/day-007";
import { DAY_008_DIAGRAMS } from "@/components/system-design/topics/day-008";
import { DAY_010_DIAGRAMS } from "@/components/system-design/topics/day-010";
import { DAY_009_DIAGRAMS } from "@/components/system-design/topics/day-009";
import { DAY_011_DIAGRAMS } from "@/components/system-design/topics/day-011";
import { DAY_014_DIAGRAMS } from "@/components/system-design/topics/day-014";
import { DAY_013_DIAGRAMS } from "@/components/system-design/topics/day-013";
import { DAY_015_DIAGRAMS } from "@/components/system-design/topics/day-015";
import { DAY_016_DIAGRAMS } from "@/components/system-design/topics/day-016";
import { DAY_019_DIAGRAMS } from "@/components/system-design/topics/day-019";
import { DAY_017_DIAGRAMS } from "@/components/system-design/topics/day-017";
import { DAY_012_DIAGRAMS } from "@/components/system-design/topics/day-012";

export interface DiagramEntry {
  render: () => ReactNode;
  framed?: boolean;
  /** Below this width the frame scrolls instead of shrinking. */
  minWidth?: number;
}

export const DIAGRAMS: Record<string, DiagramEntry> = {
  ...DAY_002_DIAGRAMS,
  ...DAY_001_DIAGRAMS,
  ...DAY_003_DIAGRAMS,
  ...DAY_004_DIAGRAMS,
  ...DAY_018_DIAGRAMS,
  ...DAY_022_DIAGRAMS,
  ...DAY_005_DIAGRAMS,
  ...DAY_006_DIAGRAMS,
  ...DAY_007_DIAGRAMS,
  ...DAY_008_DIAGRAMS,
  ...DAY_010_DIAGRAMS,
  ...DAY_009_DIAGRAMS,
  ...DAY_011_DIAGRAMS,
  ...DAY_014_DIAGRAMS,
  ...DAY_013_DIAGRAMS,
  ...DAY_015_DIAGRAMS,
  ...DAY_016_DIAGRAMS,
  ...DAY_019_DIAGRAMS,
  ...DAY_017_DIAGRAMS,
  ...DAY_012_DIAGRAMS,
};

export const findDiagram = (id: string): DiagramEntry | undefined =>
  DIAGRAMS[id];
