import { DiagramEdge } from "@/components/shared/diagram";
import { InfoBox } from "./Day008Parts";

// Internal structure: the PACELC decision tree (Abadi, 2012).

const LEAVES = [
  { x: 0, title: "PA", lines: ["উত্তর দাও, পরে মেলাও", "যেমন: like counter"] },
  { x: 190, title: "PC", lines: ["error দাও বা অপেক্ষা", "যেমন: টাকা পাঠানো"] },
  {
    x: 400,
    title: "EL",
    lines: ["কাছের replica, দ্রুত", "যেমন: Cassandra ONE"],
  },
  {
    x: 590,
    title: "EC",
    lines: ["leader/quorum-এ নিশ্চিত", "যেমন: etcd default read"],
  },
];

const LEAF_W = 170;
const LEAF_Y = 240;

function Branches() {
  return (
    <g>
      <DiagramEdge
        segment={{ x1: 350, y1: 60, x2: 175, y2: 118 }}
        label="হ্যাঁ"
      />
      <DiagramEdge
        segment={{ x1: 410, y1: 60, x2: 590, y2: 118 }}
        label="না (Else)"
      />
      <DiagramEdge segment={{ x1: 150, y1: 176, x2: 90, y2: 238 }} label="A" />
      <DiagramEdge segment={{ x1: 190, y1: 176, x2: 270, y2: 238 }} label="C" />
      <DiagramEdge segment={{ x1: 570, y1: 176, x2: 490, y2: 238 }} label="L" />
      <DiagramEdge segment={{ x1: 610, y1: 176, x2: 670, y2: 238 }} label="C" />
    </g>
  );
}

/** PACELC: if Partition → A or C; Else → Latency or Consistency. */
export function Day008Pacelc() {
  return (
    <svg viewBox="-5 0 770 330" width="100%">
      <Branches />
      <InfoBox
        x={260}
        y={8}
        width={240}
        height={52}
        title="Network partition আছে?"
        tone="primary"
      />
      <InfoBox
        x={40}
        y={120}
        width={270}
        height={56}
        title="P: Availability না Consistency?"
        lines={["(CAP-এর অংশ)"]}
      />
      <InfoBox
        x={450}
        y={120}
        width={270}
        height={56}
        title="E: Latency না Consistency?"
        lines={["(স্বাভাবিক সময়, প্রায় সবসময়)"]}
      />
      {LEAVES.map((leaf) => (
        <InfoBox
          key={leaf.title}
          x={leaf.x}
          y={LEAF_Y}
          width={LEAF_W}
          height={78}
          title={leaf.title}
          lines={leaf.lines}
          tone={leaf.title.endsWith("C") ? "ok" : "warn"}
        />
      ))}
    </svg>
  );
}
