import {
  ArchitectureDiagram,
  StepThrough,
  type ArchitectureEdge,
  type ArchitectureNode,
  type DiagramNodeStatus,
} from "@/components/shared/diagram";

// One fixed layout for every stage: components that haven't arrived yet are
// dimmed, the ones added in this stage are highlighted, so the picture "grows".

type NodeId =
  | "client"
  | "cdn"
  | "lb"
  | "app1"
  | "app2"
  | "cache"
  | "db"
  | "replica"
  | "queue"
  | "worker";

const LAYOUT: Record<NodeId, Omit<ArchitectureNode, "id" | "status">> = {
  client: { kind: "client", label: "Client", x: 0, y: 170 },
  cdn: { kind: "cdn", label: "CDN", x: 220, y: 20 },
  lb: { kind: "load-balancer", label: "Load Balancer", x: 220, y: 170 },
  app1: { kind: "server", label: "App Server", x: 440, y: 100 },
  app2: { kind: "server", label: "App Server 2", x: 440, y: 260 },
  cache: { kind: "cache", label: "Cache", x: 680, y: 0 },
  db: { kind: "database", label: "Database", x: 680, y: 130 },
  replica: { kind: "database", label: "Read Replica", x: 680, y: 260 },
  queue: { kind: "queue", label: "Queue", x: 680, y: 390 },
  worker: { kind: "server", label: "Worker", x: 900, y: 390 },
};

interface Stage {
  present: NodeId[];
  added: NodeId[];
  edges: ArchitectureEdge[];
  labels?: Partial<Record<NodeId, string>>;
}

const FULL_EDGES: ArchitectureEdge[] = [
  { from: "client", to: "cdn", label: "ছবি" },
  { from: "client", to: "lb", label: "request" },
  { from: "lb", to: "app1" },
  { from: "lb", to: "app2" },
  { from: "app1", to: "cache", label: "hot data" },
  { from: "app1", to: "db", label: "write" },
  { from: "app2", to: "replica", label: "read" },
  { from: "db", to: "replica", label: "copy", dashed: true },
  { from: "app2", to: "queue", label: "ধীর কাজ" },
  { from: "queue", to: "worker" },
];

const ALL: NodeId[] = [
  "client",
  "cdn",
  "lb",
  "app1",
  "app2",
  "cache",
  "db",
  "replica",
  "queue",
  "worker",
];

const STAGES: Stage[] = [
  {
    present: ["client", "app1"],
    added: ["app1"],
    labels: { app1: "App + DB" },
    edges: [
      { from: "client", to: "app1", label: "সব request", tone: "active" },
    ],
  },
  {
    present: ["client", "app1", "db"],
    added: ["db"],
    edges: [
      { from: "client", to: "app1", label: "request" },
      { from: "app1", to: "db", label: "read/write", tone: "active" },
    ],
  },
  {
    present: ["client", "lb", "app1", "app2", "cache", "db"],
    added: ["lb", "app2", "cache"],
    edges: [
      { from: "client", to: "lb", label: "request" },
      { from: "lb", to: "app1", tone: "active" },
      { from: "lb", to: "app2", tone: "active" },
      { from: "app1", to: "cache", label: "hot data", tone: "active" },
      { from: "app1", to: "db" },
      { from: "app2", to: "db" },
    ],
  },
  {
    present: ALL,
    added: ["cdn", "replica", "queue", "worker"],
    edges: FULL_EDGES,
  },
  {
    present: ALL,
    added: ["lb", "db"],
    edges: FULL_EDGES,
  },
];

function stageNodes(stage: Stage): ArchitectureNode[] {
  return ALL.map((id) => {
    const status: DiagramNodeStatus = !stage.present.includes(id)
      ? "dimmed"
      : stage.added.includes(id)
        ? "highlight"
        : "normal";
    return {
      id,
      ...LAYOUT[id],
      label: stage.labels?.[id] ?? LAYOUT[id].label,
      status,
    };
  });
}

const STEPS = [
  "শুরু, কয়েকশো user: একটা server-এ app আর database দুটোই। সস্তা, সহজ, আর এই অবস্থায় এটাই ঠিক design।",
  "হাজার খানেক user: app আর database একই CPU-RAM নিয়ে টানাটানি করছিল। Database আলাদা machine-এ গেল, এখন দুটোকে আলাদাভাবে বড় করা যায়।",
  "দশ হাজার থেকে লাখ user: একটা app server আর পারে না। সামনে load balancer, পেছনে দুটো stateless server, আর বারবার পড়া data-র জন্য cache।",
  "দশ লাখ user: ছবি গেল CDN-এ, read-এর চাপ নিতে database-এর কপি (read replica), আর email-SMS-এর মতো ধীর কাজ queue আর worker-এ।",
  'এখন প্রতিটা box দেখিয়ে জিজ্ঞেস করুন, "এটা মরলে কী হবে?" একটাই load balancer আর একটাই primary database এখনো single point of failure, তাই বাস্তবে এদেরও কপি রাখা হয়।',
];

/** Step-by-step: how a design grows from one user to a million (deep dive). */
export function Day001Evolution() {
  return (
    <StepThrough
      steps={STEPS}
      frames={STAGES.map((stage, i) => (
        <div key={i} className="overflow-x-auto">
          <div className="min-w-[640px]">
            <ArchitectureDiagram
              nodes={stageNodes(stage)}
              edges={stage.edges}
            />
          </div>
        </div>
      ))}
    />
  );
}
