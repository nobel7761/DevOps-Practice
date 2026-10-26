import { edgeEndpoints } from "@/lib/system-design/diagram/geometry";
import { DiagramEdge, type EdgeTone } from "./DiagramEdge";
import { DiagramNode, NODE_HEIGHT, NODE_WIDTH } from "./DiagramNode";
import type { DiagramKind, DiagramNodeStatus } from "./diagram-kinds";

export interface ArchitectureNode {
  id: string;
  kind: DiagramKind;
  label?: string;
  /** Top-left corner, in diagram units. */
  x: number;
  y: number;
  status?: DiagramNodeStatus;
}

export interface ArchitectureEdge {
  from: string;
  to: string;
  label?: string;
  dashed?: boolean;
  tone?: EdgeTone;
}

const PADDING = 16;

const boxOf = (node: ArchitectureNode) => ({
  x: node.x,
  y: node.y,
  width: NODE_WIDTH,
  height: NODE_HEIGHT,
});

/** Which component talks to which: boxes and arrows (Plan doc Section 6.2). */
export function ArchitectureDiagram({
  nodes,
  edges,
}: {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
}) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const width = Math.max(...nodes.map((n) => n.x + NODE_WIDTH)) + PADDING;
  const height = Math.max(...nodes.map((n) => n.y + NODE_HEIGHT)) + PADDING;

  return (
    <svg
      viewBox={`${-PADDING} ${-PADDING} ${width + PADDING} ${height + PADDING}`}
      width="100%"
    >
      {edges.map((edge) => {
        const from = byId.get(edge.from);
        const to = byId.get(edge.to);
        if (!from || !to) return null;
        return (
          <DiagramEdge
            key={`${edge.from}-${edge.to}`}
            segment={edgeEndpoints(boxOf(from), boxOf(to))}
            label={edge.label}
            dashed={edge.dashed}
            tone={edge.tone}
          />
        );
      })}
      {nodes.map((node) => (
        <DiagramNode
          key={node.id}
          kind={node.kind}
          label={node.label}
          x={node.x}
          y={node.y}
          status={node.status}
        />
      ))}
    </svg>
  );
}
