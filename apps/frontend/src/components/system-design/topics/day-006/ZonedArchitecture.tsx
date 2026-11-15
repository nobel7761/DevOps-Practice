import {
  DiagramEdge,
  DiagramNode,
  NODE_HEIGHT,
  NODE_WIDTH,
  type ArchitectureEdge,
  type ArchitectureNode,
} from "@/components/shared/diagram";
import { edgeEndpoints } from "@/lib/system-design/diagram/geometry";

// An architecture diagram with labelled boundaries (Region / Availability Zone)
// drawn behind the component boxes. Day 6 needs zones to show where copies live.

export interface DiagramZone {
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  failed?: boolean;
  /** Outer boundary (a Region) is drawn lighter than a zone. */
  outer?: boolean;
  /** Put the label in the bottom-left corner, out of the way of edges entering from above. */
  labelAtBottom?: boolean;
}

const PADDING = 16;

const boxOf = (node: ArchitectureNode) => ({
  x: node.x,
  y: node.y,
  width: NODE_WIDTH,
  height: NODE_HEIGHT,
});

function ZoneRect({ zone }: { zone: DiagramZone }) {
  const stroke = zone.failed ? "var(--sd-fail)" : "var(--sd-edge)";
  return (
    <g>
      <rect
        x={zone.x}
        y={zone.y}
        width={zone.width}
        height={zone.height}
        rx={14}
        fill={zone.outer ? "none" : "var(--sd-canvas)"}
        stroke={stroke}
        strokeWidth={zone.failed ? 2.5 : 1.25}
        strokeDasharray={zone.outer ? "2 4" : "8 5"}
      />
      <text
        x={zone.x + 12}
        y={zone.labelAtBottom ? zone.y + zone.height - 10 : zone.y + 18}
        fontSize={12}
        fontWeight={700}
        fill={zone.failed ? "var(--sd-fail)" : "var(--sd-edge)"}
      >
        {zone.label}
      </text>
    </g>
  );
}

function ZoneEdges({
  nodes,
  edges,
}: {
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
}) {
  const byId = new Map(nodes.map((node) => [node.id, node]));
  return (
    <>
      {edges.map((edge, index) => {
        const from = byId.get(edge.from);
        const to = byId.get(edge.to);
        if (!from || !to) return null;
        return (
          <DiagramEdge
            key={`${edge.from}-${edge.to}-${index}`}
            segment={edgeEndpoints(boxOf(from), boxOf(to))}
            label={edge.label}
            dashed={edge.dashed}
            tone={edge.tone}
          />
        );
      })}
    </>
  );
}

/** Boxes and arrows like ArchitectureDiagram, plus Region/AZ boundaries behind them. */
export function ZonedArchitecture({
  zones,
  nodes,
  edges,
  frame,
}: {
  zones: DiagramZone[];
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  /** Fixed horizontal extent, so diagrams shown together keep the same scale. */
  frame?: { left: number; right: number };
}) {
  const left =
    frame?.left ?? Math.min(...nodes.map((n) => n.x), ...zones.map((z) => z.x));
  const right =
    frame?.right ??
    Math.max(
      ...nodes.map((n) => n.x + NODE_WIDTH),
      ...zones.map((z) => z.x + z.width),
    );
  const bottom = Math.max(
    ...nodes.map((n) => n.y + NODE_HEIGHT),
    ...zones.map((z) => z.y + z.height),
  );
  return (
    <svg
      viewBox={`${left - PADDING} ${-PADDING} ${right - left + 2 * PADDING} ${bottom + 2 * PADDING}`}
      width="100%"
    >
      {zones.map((zone) => (
        <ZoneRect key={zone.label} zone={zone} />
      ))}
      <ZoneEdges nodes={nodes} edges={edges} />
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
