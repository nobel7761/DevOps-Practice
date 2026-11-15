import {
  ArchitectureDiagram,
  type ArchitectureEdge,
  type ArchitectureNode,
} from "@/components/shared/diagram";

// Day 14 architecture diagrams, built from the shared visual vocabulary.

const BEFORE_NODES: ArchitectureNode[] = [
  { id: "user", kind: "client", label: "User (sid=ab12)", x: 0, y: 120 },
  { id: "lb", kind: "load-balancer", label: "Load Balancer", x: 230, y: 120 },
  { id: "app1", kind: "server", label: "App 1 (cart আছে)", x: 480, y: 0 },
  {
    id: "app2",
    kind: "server",
    label: "App 2 (cart নেই)",
    x: 480,
    y: 120,
    status: "failed",
  },
  {
    id: "app3",
    kind: "server",
    label: "App 3 (login নেই)",
    x: 480,
    y: 240,
    status: "failed",
  },
];

const BEFORE_EDGES: ArchitectureEdge[] = [
  { from: "user", to: "lb", label: "GET /cart" },
  { from: "lb", to: "app1", label: "req ১ ✓", tone: "active" },
  {
    from: "lb",
    to: "app2",
    label: "req ২: cart খালি ✕",
    tone: "failed",
    dashed: true,
  },
  {
    from: "lb",
    to: "app3",
    label: "req ৩: আবার login ✕",
    tone: "failed",
    dashed: true,
  },
];

/** Before: each app server keeps the session and cart in its own memory. */
export function Day014Before() {
  return <ArchitectureDiagram nodes={BEFORE_NODES} edges={BEFORE_EDGES} />;
}

const MAIN_NODES: ArchitectureNode[] = [
  { id: "user", kind: "client", label: "User", x: 0, y: 120 },
  { id: "lb", kind: "load-balancer", label: "Load Balancer", x: 260, y: 120 },
  { id: "app1", kind: "server", label: "App 1 (stateless)", x: 500, y: 0 },
  {
    id: "app2",
    kind: "server",
    label: "App 2 (stateless)",
    x: 500,
    y: 120,
    status: "highlight",
  },
  { id: "app3", kind: "server", label: "App 3 (stateless)", x: 500, y: 240 },
  {
    id: "redis",
    kind: "cache",
    label: "Session Store (Redis)",
    x: 760,
    y: 40,
  },
  { id: "db", kind: "database", label: "Database", x: 760, y: 200 },
  {
    id: "obj",
    kind: "external",
    label: "Object Storage",
    x: 260,
    y: 290,
  },
];

const MAIN_EDGES: ArchitectureEdge[] = [
  { from: "user", to: "lb", label: "cookie: sid=ab12" },
  { from: "lb", to: "app1" },
  { from: "lb", to: "app2", label: "যেকোনো server", tone: "active" },
  { from: "lb", to: "app3" },
  { from: "app1", to: "redis", label: "session" },
  { from: "app2", to: "redis", tone: "active" },
  { from: "app3", to: "redis" },
  { from: "app1", to: "db" },
  { from: "app2", to: "db", label: "cart, order" },
  { from: "app3", to: "db" },
  { from: "user", to: "obj", label: "ছবি upload", dashed: true },
];

/** After (main diagram): servers keep nothing; state lives in shared stores. */
export function Day014Main() {
  return <ArchitectureDiagram nodes={MAIN_NODES} edges={MAIN_EDGES} />;
}

const SUMMARY_NODES: ArchitectureNode[] = [
  { id: "user", kind: "client", label: "User", x: 0, y: 70 },
  { id: "lb", kind: "load-balancer", label: "Load Balancer", x: 190, y: 70 },
  {
    id: "app",
    kind: "server",
    label: "Stateless App ×N",
    x: 380,
    y: 70,
    status: "highlight",
  },
  { id: "redis", kind: "cache", label: "Redis (session)", x: 590, y: 0 },
  { id: "db", kind: "database", label: "DB / Storage", x: 590, y: 140 },
];

const SUMMARY_EDGES: ArchitectureEdge[] = [
  { from: "user", to: "lb", label: "token/cookie" },
  { from: "lb", to: "app", label: "যেকোনো একটা" },
  { from: "app", to: "redis" },
  { from: "app", to: "db" },
];

/** Compact version for the summary card. */
export function Day014Summary() {
  return <ArchitectureDiagram nodes={SUMMARY_NODES} edges={SUMMARY_EDGES} />;
}
