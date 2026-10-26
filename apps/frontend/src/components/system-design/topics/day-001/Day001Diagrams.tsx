import {
  ArchitectureDiagram,
  type ArchitectureEdge,
  type ArchitectureNode,
} from "@/components/shared/diagram";

// Day 1 architecture diagrams, built from the shared visual vocabulary.

const BEFORE_NODES: ArchitectureNode[] = [
  { id: "u1", kind: "user", label: "User", x: 0, y: 0 },
  { id: "u2", kind: "user", label: "User", x: 0, y: 110 },
  { id: "u3", kind: "user", label: "আরো ৫০k user", x: 0, y: 220 },
  {
    id: "server",
    kind: "server",
    label: "App + ছবি",
    x: 250,
    y: 110,
    status: "failed",
  },
  {
    id: "db",
    kind: "database",
    label: "MySQL",
    x: 500,
    y: 110,
    status: "highlight",
  },
];

const BEFORE_EDGES: ArchitectureEdge[] = [
  { from: "u1", to: "server" },
  { from: "u2", to: "server" },
  { from: "u3", to: "server", label: "একসাথে", tone: "failed" },
  {
    from: "server",
    to: "db",
    label: "connection শেষ",
    tone: "failed",
    dashed: true,
  },
];

/** Before: one machine holds the app, the images and the database. */
export function Day001Before() {
  return <ArchitectureDiagram nodes={BEFORE_NODES} edges={BEFORE_EDGES} />;
}

const MAIN_NODES: ArchitectureNode[] = [
  { id: "client", kind: "client", label: "Client", x: 0, y: 150 },
  { id: "cdn", kind: "cdn", label: "CDN", x: 230, y: 0 },
  { id: "lb", kind: "load-balancer", label: "Load Balancer", x: 230, y: 150 },
  { id: "app1", kind: "server", label: "App Server 1", x: 460, y: 80 },
  { id: "app2", kind: "server", label: "App Server 2", x: 460, y: 230 },
  { id: "cache", kind: "cache", label: "Cache", x: 700, y: 0 },
  { id: "db", kind: "database", label: "Database", x: 700, y: 150 },
  { id: "queue", kind: "queue", label: "Queue", x: 700, y: 300 },
  { id: "worker", kind: "server", label: "Worker", x: 930, y: 300 },
];

const MAIN_EDGES: ArchitectureEdge[] = [
  { from: "client", to: "cdn", label: "ছবি, CSS" },
  { from: "client", to: "lb", label: "request", tone: "active" },
  { from: "lb", to: "app1" },
  { from: "lb", to: "app2" },
  { from: "app1", to: "cache", label: "hot data" },
  { from: "app1", to: "db", label: "read/write" },
  { from: "app2", to: "db" },
  { from: "app2", to: "queue", label: "ধীর কাজ" },
  { from: "queue", to: "worker", label: "consume" },
];

/** Main diagram: the first map of the core building blocks. */
export function Day001Main() {
  return <ArchitectureDiagram nodes={MAIN_NODES} edges={MAIN_EDGES} />;
}

const SUMMARY_NODES: ArchitectureNode[] = [
  { id: "client", kind: "client", label: "Client", x: 0, y: 70 },
  { id: "lb", kind: "load-balancer", label: "Load Balancer", x: 200, y: 70 },
  { id: "app", kind: "server", label: "Servers", x: 400, y: 70 },
  { id: "cache", kind: "cache", label: "Cache", x: 600, y: 0 },
  { id: "db", kind: "database", label: "Database", x: 600, y: 140 },
  { id: "queue", kind: "queue", label: "Queue", x: 400, y: 200 },
];

const SUMMARY_EDGES: ArchitectureEdge[] = [
  { from: "client", to: "lb" },
  { from: "lb", to: "app", label: "ভাগ" },
  { from: "app", to: "cache" },
  { from: "app", to: "db" },
  { from: "app", to: "queue", label: "পরে" },
];

/** Compact version for the summary card. */
export function Day001Summary() {
  return <ArchitectureDiagram nodes={SUMMARY_NODES} edges={SUMMARY_EDGES} />;
}
