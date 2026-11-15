import {
  ArchitectureDiagram,
  type ArchitectureEdge,
  type ArchitectureNode,
} from "@/components/shared/diagram";

// Day 16 architecture diagrams, built from the shared visual vocabulary.

const BEFORE_NODES: ArchitectureNode[] = [
  { id: "mobile", kind: "client", label: "Mobile App", x: 0, y: 50 },
  { id: "web", kind: "client", label: "Web", x: 0, y: 170 },
  { id: "partner", kind: "external", label: "Partner", x: 0, y: 290 },
  { id: "user", kind: "server", label: "User Service", x: 380, y: 0 },
  { id: "menu", kind: "server", label: "Menu Service", x: 380, y: 90 },
  { id: "order", kind: "server", label: "Order Service", x: 380, y: 180 },
  { id: "payment", kind: "server", label: "Payment Service", x: 380, y: 270 },
  {
    id: "review",
    kind: "server",
    label: "Review Service",
    x: 380,
    y: 360,
    status: "failed",
  },
];

const BEFORE_EDGES: ArchitectureEdge[] = [
  { from: "mobile", to: "user" },
  { from: "mobile", to: "menu" },
  { from: "mobile", to: "order" },
  { from: "mobile", to: "review", label: "auth নেই ✕", tone: "failed" },
  { from: "web", to: "user" },
  { from: "web", to: "menu" },
  { from: "web", to: "payment" },
  { from: "partner", to: "menu" },
  { from: "partner", to: "order" },
];

/** Before: every client calls every service directly; each does auth its own way. */
export function Day016Before() {
  return <ArchitectureDiagram nodes={BEFORE_NODES} edges={BEFORE_EDGES} />;
}

const MAIN_NODES: ArchitectureNode[] = [
  { id: "mobile", kind: "client", label: "Mobile App", x: 0, y: 30 },
  { id: "web", kind: "client", label: "Web", x: 0, y: 150 },
  { id: "partner", kind: "external", label: "Partner", x: 0, y: 270 },
  {
    id: "gateway",
    kind: "gateway",
    label: "API Gateway",
    x: 250,
    y: 150,
    status: "highlight",
  },
  { id: "redis", kind: "cache", label: "Redis (limit)", x: 250, y: 300 },
  { id: "user", kind: "server", label: "User Service", x: 530, y: 0 },
  { id: "menu", kind: "server", label: "Menu Service", x: 530, y: 100 },
  { id: "order", kind: "server", label: "Order Service", x: 530, y: 200 },
  { id: "payment", kind: "server", label: "Payment Service", x: 530, y: 300 },
];

const MAIN_EDGES: ArchitectureEdge[] = [
  { from: "mobile", to: "gateway", label: "HTTPS" },
  { from: "web", to: "gateway" },
  { from: "partner", to: "gateway", label: "API key" },
  { from: "gateway", to: "redis", label: "counter", dashed: true },
  { from: "gateway", to: "user", label: "/users", tone: "active" },
  { from: "gateway", to: "menu", label: "/menu", tone: "active" },
  { from: "gateway", to: "order", label: "/orders", tone: "active" },
  { from: "gateway", to: "payment", label: "/payments", tone: "active" },
];

/** After (main diagram): one entry point, cross-cutting work once, path-based routing. */
export function Day016Main() {
  return <ArchitectureDiagram nodes={MAIN_NODES} edges={MAIN_EDGES} />;
}

const BFF_NODES: ArchitectureNode[] = [
  { id: "mobile", kind: "client", label: "Mobile App", x: 0, y: 40 },
  { id: "web", kind: "client", label: "Web", x: 0, y: 230 },
  { id: "mbff", kind: "gateway", label: "Mobile BFF", x: 230, y: 40 },
  { id: "wbff", kind: "gateway", label: "Web BFF", x: 230, y: 230 },
  { id: "user", kind: "server", label: "User", x: 500, y: 0 },
  { id: "rest", kind: "server", label: "Restaurant", x: 500, y: 95 },
  { id: "order", kind: "server", label: "Order", x: 500, y: 190 },
  { id: "offer", kind: "server", label: "Offer", x: 500, y: 285 },
];

const BFF_EDGES: ArchitectureEdge[] = [
  { from: "mobile", to: "mbff", label: "১টা call" },
  { from: "web", to: "wbff", label: "১টা call" },
  { from: "mbff", to: "user", tone: "active" },
  { from: "mbff", to: "rest", tone: "active" },
  { from: "mbff", to: "order", tone: "active" },
  { from: "mbff", to: "offer", tone: "active" },
  { from: "wbff", to: "user" },
  { from: "wbff", to: "rest" },
  { from: "wbff", to: "order" },
  { from: "wbff", to: "offer" },
];

/** Backend for Frontend: one thin backend per client, fanning out in parallel. */
export function Day016Bff() {
  return <ArchitectureDiagram nodes={BFF_NODES} edges={BFF_EDGES} />;
}

const LAYER_NODES: ArchitectureNode[] = [
  { id: "client", kind: "client", label: "Client", x: 0, y: 110 },
  { id: "lb", kind: "load-balancer", label: "L4 LB", x: 200, y: 110 },
  { id: "gwa", kind: "gateway", label: "Gateway A", x: 410, y: 20 },
  { id: "gwb", kind: "gateway", label: "Gateway B", x: 410, y: 200 },
  { id: "order", kind: "server", label: "Order Service", x: 640, y: 110 },
  { id: "payment", kind: "server", label: "Payment Service", x: 640, y: 290 },
];

const LAYER_EDGES: ArchitectureEdge[] = [
  { from: "client", to: "lb", label: "north-south" },
  { from: "lb", to: "gwa" },
  { from: "lb", to: "gwb" },
  { from: "gwa", to: "order", tone: "active" },
  { from: "gwb", to: "order", tone: "active" },
  { from: "order", to: "payment", label: "mesh (east-west)", dashed: true },
];

/** Where each layer sits: redundant gateways for outside traffic, mesh for inside traffic. */
export function Day016EdgeLayers() {
  return <ArchitectureDiagram nodes={LAYER_NODES} edges={LAYER_EDGES} />;
}

const SUMMARY_NODES: ArchitectureNode[] = [
  { id: "mobile", kind: "client", label: "Mobile", x: 0, y: 0 },
  { id: "web", kind: "client", label: "Web", x: 0, y: 100 },
  { id: "partner", kind: "external", label: "Partner", x: 0, y: 200 },
  {
    id: "gateway",
    kind: "gateway",
    label: "auth · limit · route",
    x: 220,
    y: 100,
    status: "highlight",
  },
  { id: "s1", kind: "server", label: "Users", x: 440, y: 0 },
  { id: "s2", kind: "server", label: "Orders", x: 440, y: 100 },
  { id: "s3", kind: "server", label: "Payments", x: 440, y: 200 },
];

const SUMMARY_EDGES: ArchitectureEdge[] = [
  { from: "mobile", to: "gateway" },
  { from: "web", to: "gateway" },
  { from: "partner", to: "gateway" },
  { from: "gateway", to: "s1", tone: "active" },
  { from: "gateway", to: "s2", tone: "active" },
  { from: "gateway", to: "s3", tone: "active" },
];

/** Compact version for the summary card. */
export function Day016Summary() {
  return <ArchitectureDiagram nodes={SUMMARY_NODES} edges={SUMMARY_EDGES} />;
}
