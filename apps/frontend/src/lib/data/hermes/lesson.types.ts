// Shape of one Hermes documentation lesson (lib/data/hermes/docs/<contentId>.json).
// Prose fields are markdown. Diagrams and simulators are data-driven so a
// lesson needs no custom React.

import type {
  ArchitectureEdge,
  ArchitectureNode,
  SequenceMessage,
  SequenceParticipant,
} from "@/components/shared/diagram";

export type DiagramSpec =
  | {
      kind: "architecture";
      caption: string;
      nodes: ArchitectureNode[];
      edges: ArchitectureEdge[];
    }
  | {
      kind: "sequence";
      caption: string;
      participants: SequenceParticipant[];
      messages: SequenceMessage[];
    }
  | {
      kind: "steps";
      caption: string;
      steps: { title: string; body: string }[];
    }
  | {
      kind: "compare";
      caption: string;
      beforeTitle?: string;
      before: string;
      afterTitle?: string;
      after: string;
    };

export type CalloutTone = "tip" | "warning" | "info";

export type LessonBlock =
  | { type: "markdown"; markdown: string }
  | { type: "callout"; tone: CalloutTone; title: string; markdown: string }
  | { type: "diagram"; diagram: DiagramSpec }
  | { type: "simulator"; id: string; props?: Record<string, unknown> };

export interface HermesQuizQuestion {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface HermesLesson {
  contentId: string;
  title: string;
  /** Official docs URL this lesson retells, e.g. https://hermes-agent.nousresearch.com/docs/user-guide/features/memory */
  sourceUrl: string;
  /** One line, plain Bangla: "এই lesson শেষে তুমি কী পারবে". */
  oneLiner: string;
  blocks: LessonBlock[];
  quiz: HermesQuizQuestion[];
  recap: string[];
}
