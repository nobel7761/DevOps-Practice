import {
  ArchitectureDiagram,
  StepThrough,
  type ArchitectureEdge,
  type ArchitectureNode,
  type DiagramNodeStatus,
} from "@/components/shared/diagram";

// Step-by-step: one request through an L7 load balancer (TLS termination,
// path routing, algorithm), then a health check taking a dead server out.

type EdgeLook = Omit<ArchitectureEdge, "from" | "to">;

interface L7Frame {
  lb?: DiagramNodeStatus;
  api1?: DiagramNodeStatus;
  api2?: DiagramNodeStatus;
  stat?: DiagramNodeStatus;
  toLb?: EdgeLook;
  toApi1?: EdgeLook;
  toApi2?: EdgeLook;
  toStatic?: EdgeLook;
  back?: EdgeLook;
  text: string;
}

const FRAMES: L7Frame[] = [
  {
    toLb: { label: "GET /api/orders (HTTPS)", tone: "active" },
    text: "Client HTTPS-এ GET /api/orders পাঠায়। TLS এখানে, Load Balancer-এ শেষ হয় (TLS termination), তাই LB এখন request-এর path, Host, header আর cookie পড়তে পারে।",
  },
  {
    lb: "highlight",
    toLb: { label: "GET /api/orders" },
    toApi1: { label: "/api/* → API pool", dashed: true },
    toApi2: { label: "/api/* → API pool", dashed: true },
    text: "LB routing rule মেলায়: path /api/ দিয়ে শুরু, তাই API pool। /static/ হলে Static pool-এ যেত। L4 LB এই সিদ্ধান্ত নিতে পারত না, কারণ সে path দেখেই না।",
  },
  {
    lb: "highlight",
    api1: "highlight",
    toLb: { label: "GET /api/orders" },
    toApi1: { label: "চলমান ৩টা ✓", tone: "active" },
    toApi2: { label: "চলমান ৭টা", dashed: true },
    text: "Pool-এর ভেতরে algorithm বাছে। এখানে Least Connections: API 1-এ এখন ৩টা request চলছে, API 2-তে ৭টা, তাই API 1।",
  },
  {
    api1: "highlight",
    toApi1: { label: "200 OK", tone: "active" },
    back: { label: "200 OK · 42ms", dashed: true, tone: "active" },
    text: "API 1 উত্তর দেয়, LB সেটা client-এ ফেরত পাঠায়। সাথে নিজের log-এ লিখে রাখে: কোন backend, কত ms, কোন status। এই log-ই পরে observability-র মূল উৎস।",
  },
  {
    api2: "failed",
    toApi1: { label: "health ✓" },
    toApi2: { label: "health ✕ (১/৩)", tone: "failed", dashed: true },
    text: "API 2 crash করল। LB প্রতি ৫ সেকেন্ডে প্রতিটা server-এ GET /health পাঠায়। প্রথম check fail, কিন্তু একবারেই বাদ দেয় না, একটা হারানো packet-এ সুস্থ server বাদ পড়তে পারে।",
  },
  {
    lb: "highlight",
    api2: "dimmed",
    toLb: { label: "GET /api/cart" },
    toApi1: { label: "সব /api এখানে", tone: "active" },
    toApi2: { label: "✕✕✕ → rotation থেকে বাদ", tone: "failed", dashed: true },
    text: "পরপর ৩টা fail (unhealthy threshold), API 2 rotation থেকে বাদ। এখন সব /api request API 1-এ। ধরতে লাগল প্রায় ৩ × ৫ = ১৫ সেকেন্ড; এর মধ্যে API 2-তে যাওয়া request retry না থাকলে fail করেছে।",
  },
  {
    stat: "highlight",
    api2: "dimmed",
    toLb: { label: "GET /static/logo.png" },
    toStatic: { label: "/static/* → Static pool", tone: "active" },
    toApi2: { dashed: true },
    text: "এর মধ্যেও /static/ request Static pool-এ নিশ্চিন্তে যাচ্ছে; API pool-এর সমস্যা তাকে ছোঁয়নি। আলাদা pool মানে আলাদা blast radius।",
  },
  {
    api2: "highlight",
    toApi1: { label: "health ✓" },
    toApi2: { label: "health ✓✓ → ফিরল", dashed: true },
    text: "API 2 restart হলো। পরপর ২টা check সফল হলে (healthy threshold) তবে সে আবার traffic পায়। একবার সফল হলেই ফেরানো হয় না, যাতে 'এই আছে, এই নেই' (flapping) না হয়।",
  },
];

function frameDiagram(frame: L7Frame) {
  const nodes: ArchitectureNode[] = [
    { id: "client", kind: "client", label: "Client", x: 0, y: 120 },
    {
      id: "lb",
      kind: "load-balancer",
      label: "L7 Load Balancer",
      x: 320,
      y: 120,
      status: frame.lb,
    },
    {
      id: "api1",
      kind: "server",
      label: "API pool · 1",
      x: 620,
      y: 0,
      status: frame.api1,
    },
    {
      id: "api2",
      kind: "server",
      label: "API pool · 2",
      x: 620,
      y: 120,
      status: frame.api2,
    },
    {
      id: "static",
      kind: "server",
      label: "Static pool",
      x: 620,
      y: 250,
      status: frame.stat,
    },
  ];
  const edges: ArchitectureEdge[] = [
    { from: "client", to: "lb", ...frame.toLb },
    { from: "lb", to: "api1", ...frame.toApi1 },
    { from: "lb", to: "api2", ...frame.toApi2 },
    { from: "lb", to: "static", ...frame.toStatic },
  ];
  if (frame.back) edges.push({ from: "lb", to: "client", ...frame.back });
  return <ArchitectureDiagram nodes={nodes} edges={edges} />;
}

/** Step-by-step L7 routing + health check (Plan doc Section 6.1, deep dive). */
export function Day009L7Flow() {
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
