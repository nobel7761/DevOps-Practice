import {
  ArchitectureDiagram,
  type ArchitectureEdge,
  type ArchitectureNode,
} from "@/components/shared/diagram";

// Day 5 architecture diagrams, built from the shared visual vocabulary.

const BEFORE_NODES: ArchitectureNode[] = [
  { id: "u1", kind: "client", label: "Mobile users", x: 0, y: 0 },
  { id: "u2", kind: "client", label: "Web users", x: 0, y: 110 },
  { id: "u3", kind: "client", label: "Sale-এর ভিড়", x: 0, y: 220 },
  {
    id: "server",
    kind: "server",
    label: "একমাত্র Server (App + DB)",
    x: 260,
    y: 110,
    status: "failed",
  },
  { id: "disk", kind: "database", label: "Local disk", x: 640, y: 110 },
];

const BEFORE_EDGES: ArchitectureEdge[] = [
  { from: "u1", to: "server", label: "request" },
  { from: "u2", to: "server", label: "request" },
  {
    from: "u3",
    to: "server",
    label: "৫০× request",
    tone: "failed",
  },
  {
    from: "server",
    to: "disk",
    label: "CPU 100% · timeout",
    tone: "failed",
    dashed: true,
  },
];

/** Before: every user hits one machine that runs both app and database. */
export function Day005Before() {
  return <ArchitectureDiagram nodes={BEFORE_NODES} edges={BEFORE_EDGES} />;
}

const MAIN_NODES: ArchitectureNode[] = [
  { id: "users", kind: "client", label: "Users", x: 0, y: 170 },
  { id: "cdn", kind: "cdn", label: "CDN (Day 11)", x: 220, y: 20 },
  {
    id: "lb",
    kind: "load-balancer",
    label: "Load Balancer (Day 9)",
    x: 220,
    y: 170,
    status: "highlight",
  },
  { id: "app1", kind: "server", label: "App 1 (stateless)", x: 450, y: 80 },
  { id: "app2", kind: "server", label: "App 2 (stateless)", x: 450, y: 170 },
  { id: "app3", kind: "server", label: "App 3 (stateless)", x: 450, y: 260 },
  { id: "cache", kind: "cache", label: "Cache (Day 17)", x: 690, y: 0 },
  { id: "db", kind: "database", label: "Primary DB (writes)", x: 690, y: 120 },
  {
    id: "replica",
    kind: "database",
    label: "Read Replica (Day 28)",
    x: 690,
    y: 240,
  },
  { id: "queue", kind: "queue", label: "Queue (Day 12)", x: 690, y: 360 },
  { id: "worker", kind: "server", label: "Workers", x: 910, y: 360 },
];

const MAIN_EDGES: ArchitectureEdge[] = [
  { from: "users", to: "cdn", label: "ছবি, JS" },
  { from: "users", to: "lb", label: "API", tone: "active" },
  { from: "lb", to: "app1", tone: "active" },
  { from: "lb", to: "app2", tone: "active" },
  { from: "lb", to: "app3", tone: "active" },
  { from: "app1", to: "cache", label: "hot read" },
  { from: "app2", to: "db", label: "write" },
  { from: "app2", to: "replica", label: "read" },
  { from: "db", to: "replica", label: "copy", dashed: true },
  { from: "app3", to: "queue", label: "ধীর কাজ" },
  { from: "queue", to: "worker" },
];

/** Main diagram: a scaled web app and where each tool from the toolkit sits. */
export function Day005Main() {
  return <ArchitectureDiagram nodes={MAIN_NODES} edges={MAIN_EDGES} />;
}

const SUMMARY_NODES: ArchitectureNode[] = [
  { id: "users", kind: "client", label: "Users", x: 0, y: 90 },
  { id: "lb", kind: "load-balancer", label: "Load Balancer", x: 200, y: 90 },
  { id: "a1", kind: "server", label: "App ×N", x: 400, y: 0 },
  { id: "a2", kind: "server", label: "App ×N", x: 400, y: 180 },
  { id: "cache", kind: "cache", label: "Cache", x: 600, y: 0 },
  {
    id: "db",
    kind: "database",
    label: "DB (প্রথম bottleneck)",
    x: 600,
    y: 180,
    status: "highlight",
  },
];

const SUMMARY_EDGES: ArchitectureEdge[] = [
  { from: "users", to: "lb" },
  { from: "lb", to: "a1" },
  { from: "lb", to: "a2" },
  { from: "a1", to: "cache", label: "read" },
  { from: "a2", to: "db", label: "write" },
];

/** Compact version for the summary card. */
export function Day005Summary() {
  return <ArchitectureDiagram nodes={SUMMARY_NODES} edges={SUMMARY_EDGES} />;
}
