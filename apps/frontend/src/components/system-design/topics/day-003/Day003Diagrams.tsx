import {
  ArchitectureDiagram,
  type ArchitectureEdge,
  type ArchitectureNode,
} from "@/components/shared/diagram";

// Day 3 architecture diagrams, built from the shared visual vocabulary.

const BEFORE_NODES: ArchitectureNode[] = [
  { id: "u1", kind: "client", label: "ক্রেতা ১", x: 0, y: 0 },
  { id: "u2", kind: "client", label: "ক্রেতা ২", x: 0, y: 140 },
  {
    id: "old",
    kind: "server",
    label: "পুরনো server",
    x: 300,
    y: 70,
    status: "failed",
  },
  {
    id: "new",
    kind: "server",
    label: "নতুন server",
    x: 560,
    y: 70,
    status: "dimmed",
  },
];

const BEFORE_EDGES: ArchitectureEdge[] = [
  {
    from: "u1",
    to: "old",
    label: "203.0.113.10 ✕",
    tone: "failed",
    dashed: true,
  },
  {
    from: "u2",
    to: "old",
    label: "203.0.113.10 ✕",
    tone: "failed",
    dashed: true,
  },
];

/** Before: customers hold the raw IP; moving the server breaks every copy of it. */
export function Day003Before() {
  return <ArchitectureDiagram nodes={BEFORE_NODES} edges={BEFORE_EDGES} />;
}

const AFTER_NODES: ArchitectureNode[] = [
  { id: "u1", kind: "client", label: "ক্রেতা ১", x: 0, y: 0 },
  { id: "u2", kind: "client", label: "ক্রেতা ২", x: 0, y: 160 },
  {
    id: "dns",
    kind: "external",
    label: "DNS",
    x: 270,
    y: 80,
    status: "highlight",
  },
  { id: "new", kind: "server", label: "নতুন server", x: 560, y: 80 },
];

const AFTER_EDGES: ArchitectureEdge[] = [
  { from: "u1", to: "dns", label: "boighor.com?" },
  { from: "u2", to: "dns", label: "boighor.com?" },
  { from: "dns", to: "new", label: "A → 198.51.100.20", tone: "active" },
];

/** After: customers keep the name; only the DNS record changes. */
export function Day003After() {
  return <ArchitectureDiagram nodes={AFTER_NODES} edges={AFTER_EDGES} />;
}

const MAIN_NODES: ArchitectureNode[] = [
  { id: "browser", kind: "client", label: "Browser", x: 0, y: 210 },
  {
    id: "resolver",
    kind: "server",
    label: "DNS Resolver",
    x: 250,
    y: 90,
    status: "highlight",
  },
  { id: "root", kind: "external", label: "Root (.)", x: 540, y: 0 },
  { id: "tld", kind: "external", label: "TLD (.com)", x: 540, y: 100 },
  { id: "auth", kind: "external", label: "Authoritative", x: 540, y: 200 },
  { id: "server", kind: "server", label: "boighor.com", x: 540, y: 330 },
  { id: "db", kind: "database", label: "Database", x: 790, y: 330 },
];

const MAIN_EDGES: ArchitectureEdge[] = [
  { from: "browser", to: "resolver", label: "১. IP কত?" },
  { from: "resolver", to: "root", label: "২" },
  { from: "resolver", to: "tld", label: "৩" },
  { from: "resolver", to: "auth", label: "৪. A + TTL" },
  {
    from: "browser",
    to: "server",
    label: "৫. TCP → TLS → GET /",
    tone: "active",
  },
  { from: "server", to: "db" },
];

/** Main diagram: DNS resolution, then the HTTPS request straight to the server. */
export function Day003Main() {
  return <ArchitectureDiagram nodes={MAIN_NODES} edges={MAIN_EDGES} />;
}

const CACHE_NODES: ArchitectureNode[] = [
  { id: "browser", kind: "client", label: "Browser", x: 0, y: 0 },
  { id: "bc", kind: "cache", label: "Browser cache", x: 200, y: 0 },
  { id: "os", kind: "cache", label: "OS cache", x: 400, y: 0 },
  { id: "rc", kind: "cache", label: "Resolver cache", x: 600, y: 0 },
  {
    id: "auth",
    kind: "external",
    label: "Authoritative",
    x: 800,
    y: 0,
    status: "highlight",
  },
];

const CACHE_EDGES: ArchitectureEdge[] = [
  { from: "browser", to: "bc", label: "আছে?" },
  { from: "bc", to: "os", label: "miss" },
  { from: "os", to: "rc", label: "miss" },
  { from: "rc", to: "auth", label: "TTL শেষ", tone: "active" },
];

/** Internal structure: the cache layers a DNS answer passes through. */
export function Day003CacheLayers() {
  return <ArchitectureDiagram nodes={CACHE_NODES} edges={CACHE_EDGES} />;
}

const SUMMARY_NODES: ArchitectureNode[] = [
  { id: "browser", kind: "client", label: "Browser", x: 0, y: 120 },
  { id: "dns", kind: "external", label: "DNS", x: 230, y: 0 },
  { id: "server", kind: "server", label: "Web Server", x: 460, y: 120 },
];

const SUMMARY_EDGES: ArchitectureEdge[] = [
  { from: "browser", to: "dns", label: "নাম → IP" },
  {
    from: "browser",
    to: "server",
    label: "HTTPS: GET → 200 OK",
    tone: "active",
  },
];

/** Compact version for the summary card. */
export function Day003Summary() {
  return <ArchitectureDiagram nodes={SUMMARY_NODES} edges={SUMMARY_EDGES} />;
}
