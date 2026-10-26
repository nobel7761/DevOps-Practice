import {
  DiagramNode,
  NODE_WIDTH,
  type DiagramNodeStatus,
} from "@/components/shared/diagram";

const STATUSES: DiagramNodeStatus[] = [
  "normal",
  "highlight",
  "failed",
  "dimmed",
];

/** The four node states side by side. */
export function NodeRow() {
  return (
    <svg viewBox={`0 0 ${STATUSES.length * (NODE_WIDTH + 16)} 72`} width="100%">
      {STATUSES.map((status, index) => (
        <DiagramNode
          key={status}
          kind="server"
          label={status}
          status={status}
          x={index * (NODE_WIDTH + 16) + 4}
          y={4}
        />
      ))}
    </svg>
  );
}
