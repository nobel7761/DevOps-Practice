import {
  ArchitectureDiagram,
  StepThrough,
  type ArchitectureEdge,
  type ArchitectureNode,
  type DiagramNodeStatus,
} from "@/components/shared/diagram";

// Step-by-step: a session that lives in Redis survives a server crash and a
// deploy, then ends by TTL or by logout.

type EdgeLook = Omit<ArchitectureEdge, "from" | "to">;

interface FlowFrame {
  app1?: DiagramNodeStatus;
  app2?: DiagramNodeStatus;
  redis?: DiagramNodeStatus;
  app1Label?: string;
  toLb?: EdgeLook;
  toApp1?: EdgeLook;
  toApp2?: EdgeLook;
  app1Redis?: EdgeLook;
  app2Redis?: EdgeLook;
  back?: EdgeLook;
  text: string;
}

const FRAMES: FlowFrame[] = [
  {
    app1: "highlight",
    toLb: { tone: "active" },
    toApp1: { label: "round robin → App 1", tone: "active" },
    app1Redis: { label: "SET sess:ab12 … EX 1800", tone: "active" },
    back: {
      label: "Set-Cookie: sid=ab12",
      dashed: true,
      tone: "active",
    },
    text: "Login সফল। App 1 একটা random session id (ab12) বানিয়ে Redis-এ user-এর তথ্য রাখে, ৩০ মিনিটের TTL সহ। User পায় শুধু id-টা, cookie-তে। App 1 নিজের memory-তে কিছুই রাখে না।",
  },
  {
    app2: "highlight",
    toLb: { label: "GET /cart · sid=ab12", tone: "active" },
    toApp2: { label: "এবার App 2", tone: "active" },
    app2Redis: { label: "GET sess:ab12 → user 42", tone: "active" },
    text: "পরের request গেল App 2-তে। App 2 আগে কখনো এই user দেখেনি, তাতে কিছু যায় আসে না: cookie-র id দিয়ে Redis থেকে session পড়ে নিল। প্রতিটা request নিজের পরিচয় সাথে নিয়ে আসে।",
  },
  {
    app1: "failed",
    toLb: { label: "/checkout · sid=ab12" },
    toApp1: { label: "health ✕ → বাদ", tone: "failed", dashed: true },
    toApp2: { label: "সব traffic", tone: "active" },
    app2Redis: { label: "GET sess:ab12 ✓", tone: "active" },
    text: "App 1 crash করল। Health check তাকে বাদ দিল (Day 9), সব request App 2-তে। User কিছু টেরই পেল না, কারণ App 1-এর সাথে কোনো session মরেনি। হারাল শুধু capacity।",
  },
  {
    app1: "highlight",
    app1Label: "App 1 (v2, নতুন)",
    app2: "dimmed",
    toLb: { label: "GET /cart · sid=ab12" },
    toApp1: { label: "নতুন version", tone: "active" },
    toApp2: { label: "SIGTERM → draining", dashed: true },
    app1Redis: { label: "GET sess:ab12 ✓", tone: "active" },
    text: "Deploy: নতুন version-এর App 1 চালু, পুরনো App 2 draining-এ (নতুন request নেয় না, চলমানগুলো শেষ করে)। নতুন server-ও একই Redis থেকে একই session পড়ে। Deploy-এর সময় কেউ logout হয় না।",
  },
  {
    redis: "highlight",
    app1Label: "App 1 (v2, নতুন)",
    toApp1: { label: "৩১ মিনিট পরে · sid=ab12" },
    app1Redis: { label: "TTL শেষ → key নেই", tone: "failed", dashed: true },
    back: { label: "401 · আবার login", dashed: true },
    text: "User ৩০ মিনিট কিছু করেনি। Redis নিজেই TTL শেষে key মুছে দিয়েছে। পরের request-এ session নেই, তাই আবার login। কোনো cleanup job লাগেনি।",
  },
  {
    app1: "highlight",
    redis: "highlight",
    app1Label: "App 1 (v2, নতুন)",
    toLb: { tone: "active" },
    toApp1: { label: "sid=cd34", tone: "active" },
    app1Redis: { label: "DEL sess:cd34", tone: "active" },
    back: { label: "POST /logout ⇄ cookie মোছা", dashed: true },
    text: "আরেকজন user (sid=cd34) logout চাপল। Server Redis থেকে তার session key মুছে দেয়। এর পরে কেউ পুরনো cookie চুরি করে পাঠালেও কাজ হবে না, সাথে সাথে। Server-side session-এর এটাই বড় সুবিধা, JWT-তে এটা এত সহজ না।",
  },
];

function frameDiagram(frame: FlowFrame) {
  const nodes: ArchitectureNode[] = [
    { id: "user", kind: "client", label: "User", x: 0, y: 110 },
    { id: "lb", kind: "load-balancer", label: "Load Balancer", x: 290, y: 110 },
    {
      id: "app1",
      kind: "server",
      label: frame.app1Label ?? "App 1",
      x: 540,
      y: 0,
      status: frame.app1,
    },
    {
      id: "app2",
      kind: "server",
      label: "App 2",
      x: 540,
      y: 220,
      status: frame.app2,
    },
    {
      id: "redis",
      kind: "cache",
      label: "Redis (session)",
      x: 840,
      y: 110,
      status: frame.redis,
    },
  ];
  const edges: ArchitectureEdge[] = [
    { from: "user", to: "lb", ...frame.toLb },
    { from: "lb", to: "app1", ...frame.toApp1 },
    { from: "lb", to: "app2", ...frame.toApp2 },
    { from: "app1", to: "redis", ...frame.app1Redis },
    { from: "app2", to: "redis", ...frame.app2Redis },
  ];
  if (frame.back) edges.push({ from: "lb", to: "user", ...frame.back });
  return <ArchitectureDiagram nodes={nodes} edges={edges} />;
}

/** Step-by-step session life in a shared store (Plan doc Section 6.1, deep dive). */
export function Day014SessionFlow() {
  return (
    <StepThrough
      steps={FRAMES.map((frame) => frame.text)}
      frames={FRAMES.map((frame, step) => (
        <div key={step} className="overflow-x-auto">
          <div className="min-w-[620px]">{frameDiagram(frame)}</div>
        </div>
      ))}
    />
  );
}
