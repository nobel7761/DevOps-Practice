import {
  ArchitectureDiagram,
  StepThrough,
  type ArchitectureEdge,
  type ArchitectureNode,
  type DiagramNodeStatus,
} from "@/components/shared/diagram";

// Step-by-step failover: failure → detection → switch → recovery.

interface FailoverFrame {
  app1: DiagramNodeStatus;
  app2: DiagramNodeStatus;
  toApp1: Omit<ArchitectureEdge, "from" | "to">;
  toApp2: Omit<ArchitectureEdge, "from" | "to">;
  text: string;
}

const FRAMES: FailoverFrame[] = [
  {
    app1: "normal",
    app2: "normal",
    toApp1: { label: "৫০% · health ✓" },
    toApp2: { label: "৫০% · health ✓" },
    text: "স্বাভাবিক অবস্থা: load balancer দুটো app server-এ traffic ভাগ করে, আর প্রতি ৫ সেকেন্ডে দুজনকেই health check পাঠায়।",
  },
  {
    app1: "failed",
    app2: "normal",
    toApp1: { label: "request ✕", tone: "failed" },
    toApp2: { label: "৫০%" },
    text: "Failure: App Server 1 crash করল। Load balancer এখনো জানে না, তাই তার ভাগের request-গুলো fail করছে (retry না থাকলে user error দেখে)।",
  },
  {
    app1: "failed",
    app2: "normal",
    toApp1: { label: "health ✕ ✕ ✕", tone: "failed", dashed: true },
    toApp2: { label: "health ✓" },
    text: "Detection: পরপর ৩টা health check fail (৩ × ৫s ≈ ১৫ সেকেন্ড)। একবারেই বাদ দেওয়া হয় না, যাতে একটা হারানো packet-এ সুস্থ server বাদ না পড়ে।",
  },
  {
    app1: "dimmed",
    app2: "highlight",
    toApp1: { dashed: true },
    toApp2: { label: "১০০% traffic", tone: "active" },
    text: "Switch: load balancer App Server 1-কে unhealthy ধরে বাদ দিল, সব traffic এখন App Server 2-তে। এর ঘাড়ে পুরো ভার নেওয়ার মতো capacity (N+1) থাকতে হবে।",
  },
  {
    app1: "highlight",
    app2: "normal",
    toApp1: { label: "health ✓ ✓ (traffic নেই)", dashed: true },
    toApp2: { label: "১০০%", tone: "active" },
    text: "Recovery: App Server 1 auto-restart হয়ে ফিরল। পরপর কয়েকটা health check সফল না হওয়া পর্যন্ত সে traffic পায় না, যাতে 'এই আছে, এই নেই' (flapping) না হয়।",
  },
  {
    app1: "normal",
    app2: "normal",
    toApp1: { label: "৫০% · health ✓" },
    toApp2: { label: "৫০% · health ✓" },
    text: "আবার স্বাভাবিক। User-এর দেখা downtime ছিল শুধু detection + switch-এর সময়টুকু, server যতক্ষণ বন্ধ ছিল ততক্ষণ না।",
  },
];

function frameDiagram(frame: FailoverFrame) {
  const nodes: ArchitectureNode[] = [
    { id: "user", kind: "client", label: "Users", x: 0, y: 100 },
    { id: "lb", kind: "load-balancer", label: "Load Balancer", x: 210, y: 100 },
    {
      id: "app1",
      kind: "server",
      label: "App Server 1",
      x: 440,
      y: 10,
      status: frame.app1,
    },
    {
      id: "app2",
      kind: "server",
      label: "App Server 2",
      x: 440,
      y: 190,
      status: frame.app2,
    },
    { id: "db", kind: "database", label: "Database", x: 670, y: 100 },
  ];
  const edges: ArchitectureEdge[] = [
    { from: "user", to: "lb" },
    { from: "lb", to: "app1", ...frame.toApp1 },
    { from: "lb", to: "app2", ...frame.toApp2 },
    { from: "app1", to: "db", dashed: frame.app1 !== "normal" },
    { from: "app2", to: "db" },
  ];
  return <ArchitectureDiagram nodes={nodes} edges={edges} />;
}

/** Step-by-step failover (Plan doc Section 6.1, deep dive). */
export function Day006Failover() {
  return (
    <StepThrough
      steps={FRAMES.map((frame) => frame.text)}
      frames={FRAMES.map((frame, step) => (
        <div key={step} className="overflow-x-auto">
          <div className="min-w-[560px]">{frameDiagram(frame)}</div>
        </div>
      ))}
    />
  );
}
