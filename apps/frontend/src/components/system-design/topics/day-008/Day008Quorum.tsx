import { DiagramEdge } from "@/components/shared/diagram";
import { edgeEndpoints } from "@/lib/system-design/diagram/geometry";
import { InfoBox, Node, nodeBox } from "./Day008Parts";

// Quorum overlap: with N = 3, W = 2, R = 2 the write set and the read set
// always share at least one replica.

const WRITER = nodeBox(0, 20);
const READER = nodeBox(0, 220);
const REPLICAS = [
  { box: nodeBox(280, 0), label: "Replica 1: v2" },
  { box: nodeBox(280, 120), label: "Replica 2: v2" },
  { box: nodeBox(280, 240), label: "Replica 3: v1" },
];

function Edges() {
  const [r1, r2, r3] = REPLICAS.map((r) => r.box);
  return (
    <g>
      <DiagramEdge
        segment={edgeEndpoints(WRITER, r1)}
        label="write v2 ✓"
        tone="active"
      />
      <DiagramEdge
        segment={edgeEndpoints(WRITER, r2)}
        label="write v2 ✓"
        tone="active"
      />
      <DiagramEdge segment={edgeEndpoints(r2, READER)} label="v2" />
      <DiagramEdge segment={edgeEndpoints(r3, READER)} label="v1" />
    </g>
  );
}

function OverlapMark() {
  return (
    <rect
      x={270}
      y={110}
      width={152}
      height={84}
      rx={14}
      fill="none"
      stroke="var(--primary)"
      strokeWidth={2}
      strokeDasharray="5 4"
    />
  );
}

/** N = 3, W = 2, R = 2: read and write sets overlap on replica 2. */
export function Day008Quorum() {
  return (
    <svg viewBox="-10 -10 740 330" width="100%">
      <Edges />
      <OverlapMark />
      <Node kind="client" label="Writer" x={WRITER.x} y={WRITER.y} />
      <Node kind="client" label="Reader" x={READER.x} y={READER.y} />
      {REPLICAS.map((r) => (
        <Node
          key={r.label}
          kind="database"
          label={r.label}
          x={r.box.x}
          y={r.box.y}
        />
      ))}
      <InfoBox
        x={480}
        y={95}
        width={230}
        height={110}
        title="N = 3, W = 2, R = 2"
        lines={[
          "R + W = 4 > N = 3",
          "Replica 2 দুই দলেই আছে",
          "তাই read সর্বশেষ v2 দেখে ✓",
        ]}
        tone="primary"
      />
    </svg>
  );
}
