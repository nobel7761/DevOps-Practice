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
  ...DAY_012_DIAGRAMS,
};

export const findDiagram = (id: string): DiagramEntry | undefined =>
  DIAGRAMS[id];
