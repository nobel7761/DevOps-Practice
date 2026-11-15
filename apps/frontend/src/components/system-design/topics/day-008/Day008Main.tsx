import { DiagramEdge } from "@/components/shared/diagram";
import { edgeEndpoints } from "@/lib/system-design/diagram/geometry";
import { InfoBox, Node, Note, PartitionLine, nodeBox } from "./Day008Parts";

// Main diagram: node 3 is cut off; a read there is answered CP-style (refuse)
// or AP-style (stale value), while the majority side keeps working.

const CLIENT_A = nodeBox(10, 40);
const NODE_1 = nodeBox(220, 10);
const NODE_2 = nodeBox(220, 150);
const NODE_3 = nodeBox(480, 80);
const CLIENT_B = nodeBox(700, 80);

function MajoritySide() {
  return (
    <g>
      <DiagramEdge
        segment={edgeEndpoints(CLIENT_A, NODE_1)}
        label="write 300"
        tone="active"
      />
      <DiagramEdge
        segment={edgeEndpoints(NODE_1, NODE_2)}
        label="replicate ✓"
      />
      <Node kind="client" label="Client A" x={CLIENT_A.x} y={CLIENT_A.y} />
      <Node kind="database" label="Node 1: 300" x={NODE_1.x} y={NODE_1.y} />
      <Node kind="database" label="Node 2: 300" x={NODE_2.x} y={NODE_2.y} />
      <Note x={286} y={252} bold color="var(--sd-ok)">
        Majority (২/৩): read-write চলে
      </Note>
      <Note x={286} y={272}>
        দরকারে নিজেরাই নতুন leader বাছে
      </Note>
    </g>
  );
}

function MinoritySide() {
  return (
    <g>
      <DiagramEdge
        segment={edgeEndpoints(NODE_1, NODE_3)}
        label="replicate ✕"
        tone="failed"
        dashed
      />
      <DiagramEdge segment={edgeEndpoints(CLIENT_B, NODE_3)} label="balance?" />
      <Node kind="database" label="Node 3: 500" x={NODE_3.x} y={NODE_3.y} />
      <Node kind="client" label="Client B" x={CLIENT_B.x} y={CLIENT_B.y} />
    </g>
  );
}

function Choices() {
  return (
    <g>
      <DiagramEdge segment={{ x1: 530, y1: 146, x2: 545, y2: 238 }} />
      <DiagramEdge segment={{ x1: 560, y1: 146, x2: 745, y2: 238 }} />
      <InfoBox
        x={455}
        y={240}
        width={180}
        height={78}
        title="CP: error / অপেক্ষা"
        lines={["ভুল উত্তর যায় না", "কিন্তু এখানে সেবা বন্ধ"]}
        tone="ok"
      />
      <InfoBox
        x={655}
        y={240}
        width={180}
        height={78}
        title="AP: 500 ফেরত"
        lines={["উত্তর মিলল, কিন্তু পুরনো", "পরে মেলাতে হবে"]}
        tone="warn"
      />
    </g>
  );
}

/** Partition between the majority and node 3, with the CP vs AP choice. */
export function Day008Main() {
  return (
    <svg viewBox="0 -20 850 350" width="100%">
      <PartitionLine x={420} y1={10} y2={320} label="Network partition" />
      <MajoritySide />
      <MinoritySide />
      <Choices />
    </svg>
  );
}
