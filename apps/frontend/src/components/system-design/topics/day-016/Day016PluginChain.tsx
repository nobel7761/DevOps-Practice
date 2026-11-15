import { DiagramEdge, StepThrough } from "@/components/shared/diagram";

// One request through the gateway's plugin chain (Plan doc Section 6.1, deep dive).

const STAGES = [
  { label: "Route match", exit: "মেলেনি → 404" },
  { label: "Auth", exit: "key ভুল → 401" },
  { label: "Rate limit", exit: "সীমা পার → 429" },
  { label: "Transform", exit: "" },
  { label: "Upstream", exit: "ধীর → 504" },
  { label: "Response", exit: "" },
  { label: "Log", exit: "" },
];

const BOX_W = 92;
const GAP = 14;
const LEFT = 20;
const BOX_Y = 80;
const BOX_H = 56;

interface Frame {
  /** Index into STAGES; -1 = the request has only just arrived. */
  active: number;
  request: string;
}

const FRAMES: Frame[] = [
  { active: -1, request: "GET /orders/42 · apikey: rahim-secret-123" },
  { active: 0, request: "GET /orders/42 → route: orders-route" },
  { active: 1, request: "apikey ✓ → consumer: rahim-app" },
  { active: 2, request: "rahim-app: 3/5 এই মিনিটে ✓" },
  { active: 3, request: "GET /42 · X-Consumer-Username · apikey সরানো" },
  { active: 4, request: "→ orders-service (সুস্থ instance), timeout সহ" },
  { active: 5, request: "200 + RateLimit-Remaining: 2" },
  { active: 6, request: "log: 200 · latency · request id" },
];

const STEPS = [
  "Client একটা request পাঠাল। Gateway-র কাছে এটা এখনো শুধু কিছু bytes: path আর header।",
  "Route match: path /orders দেখে orders-route পাওয়া গেল। কোন plugin কোন config-এ চলবে, এখন জানা গেল। না মিললে এখানেই 404।",
  "Auth: apikey যাচাই, consumer চেনা গেল rahim-app। Key না থাকলে বা ভুল হলে এখানেই 401, পেছনের কোনো ধাপ চলে না।",
  "Rate limit: rahim-app-এর counter বাড়ল (3/5)। সীমা পেরোলে এখানেই 429 আর Retry-After। ভুল key-এর request এই পর্যন্ত আসেই না।",
  "Transform: /orders prefix কাটা, পরিচয়ের header যোগ, client-এর apikey সরানো (hide_credentials)।",
  "Upstream: orders-service-এর একটা সুস্থ instance-এ পাঠানো, timeout সহ। ধীর হলে 504; retry শুধু idempotent request-এ।",
  "Response: service-এর উত্তরে gateway rate limit header (আর দরকারে CORS header) যোগ করে client-কে ফেরত দেয়।",
  "Log: উত্তর চলে যাওয়ার পরে log আর metrics লেখা হয়, তাই user-এর latency-তে যোগ হয় না।",
];

const boxX = (index: number) => LEFT + index * (BOX_W + GAP);

function StageBox({ index, active }: { index: number; active: number }) {
  const stage = STAGES[index];
  const isActive = index === active;
  const isDone = index < active;
  const x = boxX(index);
  return (
    <g opacity={index > active ? 0.4 : 1}>
      <rect
        x={x}
        y={BOX_Y}
        width={BOX_W}
        height={BOX_H}
        rx={10}
        fill={isDone ? "var(--sd-gateway-soft)" : "var(--sd-canvas)"}
        stroke={isActive ? "var(--primary)" : "var(--sd-gateway)"}
        strokeWidth={isActive ? 3 : 1.5}
      />
      <text
        x={x + BOX_W / 2}
        y={BOX_Y + BOX_H / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight={700}
        fill="var(--sd-label)"
      >
        {isDone ? "✓ " : ""}
        {stage.label}
      </text>
      {isActive && stage.exit && (
        <text
          x={x + BOX_W / 2}
          y={BOX_Y + BOX_H + 22}
          textAnchor="middle"
          fontSize={11}
          fontWeight={600}
          fill="var(--sd-fail)"
        >
          {stage.exit}
        </text>
      )}
    </g>
  );
}

function ChainFrame({ frame }: { frame: Frame }) {
  const width = boxX(STAGES.length) + LEFT;
  return (
    <svg viewBox={`0 0 ${width} 190`} width="100%" style={{ minWidth: 640 }}>
      <rect
        x={4}
        y={60}
        width={width - 8}
        height={110}
        rx={14}
        fill="none"
        stroke="var(--sd-gateway)"
        strokeDasharray="6 4"
      />
      <text x={14} y={52} fontSize={12} fontWeight={700} fill="var(--sd-label)">
        API Gateway
      </text>
      <text
        x={width / 2}
        y={24}
        textAnchor="middle"
        fontSize={13}
        fontWeight={600}
        fill="var(--primary)"
      >
        {frame.request}
      </text>
      {STAGES.slice(0, -1).map((stage, index) => (
        <DiagramEdge
          key={stage.label}
          segment={{
            x1: boxX(index) + BOX_W,
            y1: BOX_Y + BOX_H / 2,
            x2: boxX(index + 1),
            y2: BOX_Y + BOX_H / 2,
          }}
          tone={index < frame.active ? "active" : "normal"}
        />
      ))}
      {STAGES.map((stage, index) => (
        <StageBox key={stage.label} index={index} active={frame.active} />
      ))}
    </svg>
  );
}

/** Step-by-step: one request through route → auth → rate limit → transform → upstream → response → log. */
export function Day016PluginChain() {
  return (
    <StepThrough
      steps={STEPS}
      frames={FRAMES.map((frame, step) => (
        <div key={step} className="overflow-x-auto">
          <ChainFrame frame={frame} />
        </div>
      ))}
    />
  );
}
