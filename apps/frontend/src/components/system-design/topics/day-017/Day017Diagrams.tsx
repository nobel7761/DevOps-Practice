import {
  ArchitectureDiagram,
  type ArchitectureEdge,
  type ArchitectureNode,
} from "@/components/shared/diagram";

// Day 17 architecture diagrams, built from the shared visual vocabulary.

const BEFORE_NODES: ArchitectureNode[] = [
  { id: "u1", kind: "client", label: "User-রা", x: 0, y: 0 },
  { id: "u2", kind: "client", label: "Mobile app", x: 0, y: 160 },
  { id: "lb", kind: "load-balancer", label: "Load Balancer", x: 210, y: 80 },
  { id: "a1", kind: "server", label: "App 1", x: 420, y: 0 },
  { id: "a2", kind: "server", label: "App 2", x: 420, y: 160 },
  {
    id: "db",
    kind: "database",
    label: "PostgreSQL (CPU 100%)",
    x: 700,
    y: 80,
    status: "failed",
  },
];

const BEFORE_EDGES: ArchitectureEdge[] = [
  { from: "u1", to: "lb", label: "GET /product/1" },
  { from: "u2", to: "lb" },
  { from: "lb", to: "a1" },
  { from: "lb", to: "a2" },
  {
    from: "a1",
    to: "db",
    label: "একই query বারবার",
    tone: "failed",
  },
  { from: "a2", to: "db", label: "~৩০০ms", tone: "failed", dashed: true },
];

/** Before: every request runs the same heavy query on the database. */
export function Day017Before() {
  return <ArchitectureDiagram nodes={BEFORE_NODES} edges={BEFORE_EDGES} />;
}

const MAIN_NODES: ArchitectureNode[] = [
  { id: "client", kind: "client", label: "Client", x: 0, y: 90 },
  {
    id: "app",
    kind: "server",
    label: "App Server",
    x: 230,
    y: 90,
    status: "highlight",
  },
  { id: "cache", kind: "cache", label: "Redis (cache)", x: 500, y: 0 },
  { id: "db", kind: "database", label: "Database", x: 500, y: 190 },
];

const MAIN_EDGES: ArchitectureEdge[] = [
  { from: "client", to: "app", label: "GET /product/1" },
  { from: "app", to: "cache", label: "১. GET key → hit ✓", tone: "active" },
  { from: "app", to: "db", label: "২. miss হলে SELECT", dashed: true },
  { from: "db", to: "cache", label: "৩. SET key EX ttl", dashed: true },
];

/** Main diagram: cache-aside. App asks the cache first, the DB only on a miss. */
export function Day017Main() {
  return <ArchitectureDiagram nodes={MAIN_NODES} edges={MAIN_EDGES} />;
}

const SUMMARY_NODES: ArchitectureNode[] = [
  { id: "app", kind: "server", label: "App", x: 0, y: 80 },
  { id: "cache", kind: "cache", label: "Cache (hit ~১ms)", x: 230, y: 0 },
  { id: "db", kind: "database", label: "DB (miss ~২০ms+)", x: 230, y: 160 },
];

const SUMMARY_EDGES: ArchitectureEdge[] = [
  { from: "app", to: "cache", label: "আগে cache", tone: "active" },
  { from: "app", to: "db", label: "miss হলে", dashed: true },
  { from: "db", to: "cache", label: "ভরো + TTL", dashed: true },
];

/** Compact version for the summary card. */
export function Day017Summary() {
  return <ArchitectureDiagram nodes={SUMMARY_NODES} edges={SUMMARY_EDGES} />;
}

const STAMPEDE_BEFORE_NODES: ArchitectureNode[] = [
  { id: "r1", kind: "client", label: "Request ১", x: 0, y: 0 },
  { id: "r2", kind: "client", label: "Request ২", x: 0, y: 100 },
  { id: "r3", kind: "client", label: "... Request ২০", x: 0, y: 200 },
  {
    id: "cache",
    kind: "cache",
    label: "key মেয়াদোত্তীর্ণ",
    x: 230,
    y: 100,
    status: "dimmed",
  },
  {
    id: "db",
    kind: "database",
    label: "DB: ২০টা একই query",
    x: 470,
    y: 100,
    status: "failed",
  },
];

const STAMPEDE_BEFORE_EDGES: ArchitectureEdge[] = [
  { from: "r1", to: "cache", label: "miss" },
  { from: "r2", to: "cache", label: "miss" },
  { from: "r3", to: "cache", label: "miss" },
  { from: "cache", to: "db", label: "×২০", tone: "failed" },
];

/** Stampede without protection: every miss goes to the DB. */
export function Day017StampedeBefore() {
  return (
    <ArchitectureDiagram
      nodes={STAMPEDE_BEFORE_NODES}
      edges={STAMPEDE_BEFORE_EDGES}
    />
  );
}

const STAMPEDE_AFTER_NODES: ArchitectureNode[] = [
  { id: "r1", kind: "client", label: "Request ১ (lock পেল)", x: 0, y: 0 },
  { id: "r2", kind: "client", label: "Request ২", x: 0, y: 100 },
  { id: "r3", kind: "client", label: "... Request ২০", x: 0, y: 200 },
  {
    id: "cache",
    kind: "cache",
    label: "lock:product:3",
    x: 230,
    y: 100,
    status: "highlight",
  },
  { id: "db", kind: "database", label: "DB: ১টা query", x: 470, y: 100 },
];

const STAMPEDE_AFTER_EDGES: ArchitectureEdge[] = [
  { from: "r1", to: "cache", label: "SET NX ✓", tone: "active" },
  { from: "r2", to: "cache", label: "অপেক্ষা", dashed: true },
  { from: "r3", to: "cache", label: "অপেক্ষা", dashed: true },
  { from: "cache", to: "db", label: "×১", tone: "active" },
];

/** Stampede with a per-key lock: one request rebuilds, the rest wait for it. */
export function Day017StampedeAfter() {
  return (
    <ArchitectureDiagram
      nodes={STAMPEDE_AFTER_NODES}
      edges={STAMPEDE_AFTER_EDGES}
    />
  );
}
