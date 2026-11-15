import {
  ArchitectureDiagram,
  StepThrough,
  type ArchitectureEdge,
  type ArchitectureNode,
} from "@/components/shared/diagram";

// Resizing a database with near-zero downtime: grow the replica first,
// fail over to it, then grow the old primary and bring it back as a replica.

interface Frame {
  left: { label: string; status?: ArchitectureNode["status"] };
  right: { label: string; status?: ArchitectureNode["status"] };
  appTo: "left" | "right";
  copy: { from: "left" | "right"; label: string } | null;
}

const FRAMES: Frame[] = [
  {
    left: { label: "Primary · 16 vCPU", status: "highlight" },
    right: { label: "Replica · 16 vCPU" },
    appTo: "left",
    copy: { from: "left", label: "copy" },
  },
  {
    left: { label: "Primary · 16 vCPU", status: "highlight" },
    right: { label: "Replica: resize চলছে", status: "dimmed" },
    appTo: "left",
    copy: null,
  },
  {
    left: { label: "Primary · 16 vCPU", status: "highlight" },
    right: { label: "Replica · 32 vCPU" },
    appTo: "left",
    copy: { from: "left", label: "catch up" },
  },
  {
    left: { label: "পুরনো · 16 vCPU", status: "dimmed" },
    right: { label: "Primary · 32 vCPU", status: "highlight" },
    appTo: "right",
    copy: null,
  },
  {
    left: { label: "Replica · 32 vCPU" },
    right: { label: "Primary · 32 vCPU", status: "highlight" },
    appTo: "right",
    copy: { from: "right", label: "copy" },
  },
];

const STEPS = [
  "শুরু: App সব write পাঠায় 16 vCPU-র Primary-তে, Replica সেটার copy রাখে।",
  "Replica-কে stop করে 32 vCPU-তে বড় করা হচ্ছে। App-এর কিছুই টের পাওয়ার কথা না, Primary চলছে।",
  "বড় Replica চালু হয়ে বাকি পড়া change-গুলো ধরে ফেলছে। Replication lag শূন্যে আসা পর্যন্ত অপেক্ষা।",
  "Failover: Replica-কে Primary বানানো, App-এর connection নতুন Primary-তে। কয়েক সেকেন্ড write বন্ধ, মিনিট না।",
  "পুরনো Primary-কেও 32 vCPU করে নতুন Replica হিসেবে ফিরিয়ে আনা। দুটোই বড়, redundancy আবার পুরো।",
];

const side = (s: "left" | "right") => (s === "left" ? "dbA" : "dbB");

function frameDiagram(frame: Frame) {
  const nodes: ArchitectureNode[] = [
    { id: "app", kind: "server", label: "App", x: 200, y: 0 },
    { id: "dbA", kind: "database", x: 0, y: 150, ...frame.left },
    { id: "dbB", kind: "database", x: 400, y: 150, ...frame.right },
  ];
  const edges: ArchitectureEdge[] = [
    { from: "app", to: side(frame.appTo), label: "read/write", tone: "active" },
  ];
  if (frame.copy) {
    const from = side(frame.copy.from);
    edges.push({
      from,
      to: from === "dbA" ? "dbB" : "dbA",
      label: frame.copy.label,
      dashed: true,
    });
  }
  return <ArchitectureDiagram nodes={nodes} edges={edges} />;
}

/** Step-by-step: resize a database via its replica and a failover. */
export function Day013DbResize() {
  return (
    <StepThrough
      steps={STEPS}
      frames={FRAMES.map((frame, i) => (
        <div key={i} className="mx-auto w-full max-w-xl overflow-x-auto">
          {frameDiagram(frame)}
        </div>
      ))}
    />
  );
}
