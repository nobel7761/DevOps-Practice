import {
  ArchitectureDiagram,
  type ArchitectureEdge,
  type ArchitectureNode,
} from "@/components/shared/diagram";

// Day 18 architecture diagrams, built from the shared visual vocabulary.

const BEFORE_NODES: ArchitectureNode[] = [
  { id: "bot", kind: "client", label: "Login Bot", x: 0, y: 0 },
  { id: "scraper", kind: "client", label: "Scraper", x: 0, y: 120 },
  { id: "user", kind: "user", label: "Real User", x: 0, y: 240 },
  {
    id: "api",
    kind: "server",
    label: "API Server",
    x: 270,
    y: 120,
    status: "failed",
  },
  {
    id: "db",
    kind: "database",
    label: "Database",
    x: 520,
    y: 120,
    status: "failed",
  },
];

const BEFORE_EDGES: ArchitectureEdge[] = [
  { from: "bot", to: "api", label: "হাজারো password/min" },
  { from: "scraper", to: "api", label: "শত শত search/s" },
  {
    from: "user",
    to: "api",
    label: "১টা request → timeout ✕",
    tone: "failed",
    dashed: true,
  },
  { from: "api", to: "db", label: "CPU 100%", tone: "failed" },
];

/** Before: nobody limits anyone, so a few noisy clients starve everyone else. */
export function Day018Before() {
  return <ArchitectureDiagram nodes={BEFORE_NODES} edges={BEFORE_EDGES} />;
}

const MAIN_NODES: ArchitectureNode[] = [
  { id: "user", kind: "user", label: "User A", x: 0, y: 0 },
  { id: "bot", kind: "client", label: "Bot", x: 0, y: 220 },
  {
    id: "gateway",
    kind: "gateway",
    label: "API Gateway",
    x: 250,
    y: 110,
    status: "highlight",
  },
  { id: "redis", kind: "cache", label: "Redis counter", x: 250, y: 280 },
  { id: "api", kind: "server", label: "API Server", x: 500, y: 110 },
  { id: "db", kind: "database", label: "Database", x: 740, y: 110 },
];

const MAIN_EDGES: ArchitectureEdge[] = [
  { from: "user", to: "gateway", label: "১০ req/min ✓" },
  {
    from: "bot",
    to: "gateway",
    label: "৫০০ req/s → 429 ✕",
    tone: "failed",
    dashed: true,
  },
  { from: "gateway", to: "redis", label: "token আছে?" },
  { from: "gateway", to: "api", label: "allowed", tone: "active" },
  { from: "api", to: "db" },
];

/** After (main diagram): the gateway checks a shared counter and turns away the excess with 429. */
export function Day018Main() {
  return <ArchitectureDiagram nodes={MAIN_NODES} edges={MAIN_EDGES} />;
}

const LOCAL_NODES: ArchitectureNode[] = [
  { id: "user", kind: "user", label: "User 42", x: 0, y: 120 },
  { id: "lb", kind: "load-balancer", label: "Load Balancer", x: 220, y: 120 },
  { id: "s1", kind: "server", label: "Server 1", x: 470, y: 0 },
  { id: "s2", kind: "server", label: "Server 2", x: 470, y: 120 },
  { id: "s3", kind: "server", label: "Server 3", x: 470, y: 240 },
];

const LOCAL_EDGES: ArchitectureEdge[] = [
  { from: "user", to: "lb", label: "300 req/min" },
  { from: "lb", to: "s1", label: "100 ✓ (নিজে গোনে)" },
  { from: "lb", to: "s2", label: "100 ✓" },
  { from: "lb", to: "s3", label: "100 ✓" },
];

/** Wrong: every server counts alone, so a 100/min limit really allows 300/min. */
export function Day018LocalCounters() {
  return <ArchitectureDiagram nodes={LOCAL_NODES} edges={LOCAL_EDGES} />;
}

const SHARED_NODES: ArchitectureNode[] = [
  ...LOCAL_NODES,
  {
    id: "redis",
    kind: "cache",
    label: "Redis",
    x: 720,
    y: 120,
    status: "highlight",
  },
];

const SHARED_EDGES: ArchitectureEdge[] = [
  { from: "user", to: "lb", label: "300 req/min" },
  { from: "lb", to: "s1" },
  { from: "lb", to: "s2" },
  { from: "lb", to: "s3" },
  { from: "s1", to: "redis", label: "INCR" },
  { from: "s2", to: "redis", label: "INCR" },
  { from: "s3", to: "redis", label: "INCR" },
];

/** Right: all servers update one shared counter per user. */
export function Day018SharedCounter() {
  return <ArchitectureDiagram nodes={SHARED_NODES} edges={SHARED_EDGES} />;
}

const SUMMARY_NODES: ArchitectureNode[] = [
  { id: "client", kind: "client", label: "Client", x: 0, y: 0 },
  { id: "bot", kind: "client", label: "Noisy client", x: 0, y: 150 },
  {
    id: "limiter",
    kind: "gateway",
    label: "Rate Limiter",
    x: 220,
    y: 75,
    status: "highlight",
  },
  { id: "redis", kind: "cache", label: "Redis", x: 220, y: 220 },
  { id: "service", kind: "server", label: "Service", x: 440, y: 75 },
];

const SUMMARY_EDGES: ArchitectureEdge[] = [
  { from: "client", to: "limiter", label: "সীমার ভেতরে" },
  { from: "bot", to: "limiter", label: "429 ✕", tone: "failed", dashed: true },
  { from: "limiter", to: "redis", label: "count" },
  { from: "limiter", to: "service", label: "✓", tone: "active" },
];

/** Compact version for the summary card. */
export function Day018Summary() {
  return <ArchitectureDiagram nodes={SUMMARY_NODES} edges={SUMMARY_EDGES} />;
}
