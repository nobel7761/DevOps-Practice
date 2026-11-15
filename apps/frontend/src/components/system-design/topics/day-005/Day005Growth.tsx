import {
  ArchitectureDiagram,
  StepThrough,
  type ArchitectureEdge,
  type ArchitectureNode,
  type DiagramNodeStatus,
} from "@/components/shared/diagram";

// One fixed layout; nodes not yet added are dimmed, the stage's new ones are
// highlighted, and the node that has become the bottleneck is drawn as failed.

type NodeId =
  | "users"
  | "cdn"
  | "lb"
  | "app1"
  | "app2"
  | "session"
  | "db"
  | "replica"
  | "queue"
  | "worker";

const LAYOUT: Record<NodeId, Omit<ArchitectureNode, "id" | "status">> = {
  users: { kind: "client", label: "Users", x: 0, y: 160 },
  cdn: { kind: "cdn", label: "CDN", x: 220, y: 20 },
  lb: { kind: "load-balancer", label: "Load Balancer", x: 220, y: 160 },
  app1: { kind: "server", label: "App Server", x: 440, y: 90 },
  app2: { kind: "server", label: "App Server ×N", x: 440, y: 240 },
  session: { kind: "cache", label: "Redis (session + cache)", x: 680, y: 0 },
  db: { kind: "database", label: "Primary DB", x: 680, y: 120 },
  replica: { kind: "database", label: "Read Replica", x: 680, y: 240 },
  queue: { kind: "queue", label: "Queue", x: 680, y: 360 },
  worker: { kind: "server", label: "Worker", x: 900, y: 360 },
};

const ALL = Object.keys(LAYOUT) as NodeId[];

interface Stage {
  present: NodeId[];
  added: NodeId[];
  bottleneck?: NodeId;
  labels?: Partial<Record<NodeId, string>>;
  edges: ArchitectureEdge[];
}

const STAGES: Stage[] = [
  {
    present: ["users", "app1"],
    added: ["app1"],
    labels: { users: "১০০ user", app1: "এক VPS: App + DB" },
    edges: [{ from: "users", to: "app1", label: "~০.১ req/s", tone: "active" }],
  },
  {
    present: ["users", "app1", "db"],
    added: ["db"],
    bottleneck: "db",
    labels: { users: "১০ হাজার user", app1: "বড় App Server" },
    edges: [
      { from: "users", to: "app1", label: "peak ~১০ req/s" },
      { from: "app1", to: "db", label: "slow query!", tone: "failed" },
    ],
  },
  {
    present: ["users", "lb", "app1", "app2", "session", "db"],
    added: ["lb", "app2", "session"],
    bottleneck: "app1",
    labels: { users: "১ লাখ user" },
    edges: [
      { from: "users", to: "lb", label: "peak ~১০০ req/s" },
      { from: "lb", to: "app1", tone: "active" },
      { from: "lb", to: "app2", tone: "active" },
      { from: "app1", to: "session", label: "session" },
      { from: "app1", to: "db" },
      { from: "app2", to: "db" },
    ],
  },
  {
    present: ["users", "cdn", "lb", "app1", "app2", "session", "db", "replica"],
    added: ["cdn", "replica"],
    labels: { users: "৫ লাখ user" },
    edges: [
      { from: "users", to: "cdn", label: "ছবি" },
      { from: "users", to: "lb", label: "peak ~৬০০ req/s" },
      { from: "lb", to: "app1" },
      { from: "lb", to: "app2" },
      { from: "app1", to: "session", label: "hot read", tone: "active" },
      { from: "app1", to: "db", label: "write" },
      { from: "app2", to: "replica", label: "read", tone: "active" },
      { from: "db", to: "replica", dashed: true },
    ],
  },
  {
    present: ALL,
    added: ["queue", "worker"],
    bottleneck: "db",
    labels: { users: "১০ লাখ user" },
    edges: [
      { from: "users", to: "cdn", label: "ছবি" },
      { from: "users", to: "lb", label: "peak ~১,২০০ req/s" },
      { from: "lb", to: "app1" },
      { from: "lb", to: "app2" },
      { from: "app1", to: "session", label: "hot read" },
      { from: "app1", to: "db", label: "write", tone: "failed" },
      { from: "app2", to: "replica", label: "read" },
      { from: "db", to: "replica", dashed: true },
      { from: "app2", to: "queue", label: "email, SMS", tone: "active" },
      { from: "queue", to: "worker" },
    ],
  },
];

function stageNodes(stage: Stage): ArchitectureNode[] {
  return ALL.map((id) => {
    const status: DiagramNodeStatus = !stage.present.includes(id)
      ? "dimmed"
      : stage.bottleneck === id
        ? "failed"
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
  "১০০ user, দিনে কয়েক হাজার request: গড়ে সেকেন্ডে একটারও কম। (প্রতিটা ধাপে ধরছি একজন user দিনে ~২০টা request পাঠায়, আর peak গড়ের ~৫ গুণ।) একটা ছোট VPS-এ app আর database একসাথে। এখানে কিছু scale করার দরকার নেই, দরকার শুধু backup আর একটু monitoring।",
  "১০ হাজার user: app আর DB একই CPU-RAM নিয়ে টানাটানি করছিল, তাই DB আলাদা machine-এ গেল, আর app-এর machine বড় করা হলো (vertical scaling)। নতুন লাল দাগ: index ছাড়া query, যেটা data বাড়ায় ধীর হচ্ছে। সমাধান index (Day 22), নতুন server না।",
  "১ লাখ user: বড় machine-এর CPU-ও ৯০%-এ, আর ওটা মরলে সব বন্ধ। সামনে load balancer, পেছনে একাধিক app server। এর শর্ত: server stateless, তাই session গেল Redis-এ। এখন app server যোগ করলেই ক্ষমতা বাড়ে।",
  "৫ লাখ user: app server যত খুশি বাড়ানো যায়, কিন্তু সবাই একটা DB-কে প্রশ্ন করছে। Read কমাতে cache আর read replica, আর ছবি-JS গেল CDN-এ, যাতে সেগুলো আমাদের server পর্যন্ত আসেই না।",
  "১০ লাখ user: email-SMS-এর মতো ধীর কাজ queue-তে, worker-রা পরে করে। এখন বাকি থাকল শুধু write, সব একটা primary DB-তে। এটাই সবচেয়ে কঠিন সীমা, আর এখানেই একদিন sharding (Day 29) নিয়ে ভাবতে হবে। খেয়াল করুন: প্রতিটা ধাপ একটা bottleneck সরিয়েছে, আর পরেরটাকে সামনে এনেছে।",
];

/** Step-by-step: a startup grows from 100 users to a million (deep dive). */
export function Day005Growth() {
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
