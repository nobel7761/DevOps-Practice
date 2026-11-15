import {
  ArchitectureDiagram,
  type ArchitectureEdge,
  type ArchitectureNode,
} from "@/components/shared/diagram";

// Day 9 architecture diagrams, built from the shared visual vocabulary.

const BEFORE_NODES: ArchitectureNode[] = [
  { id: "web", kind: "client", label: "Web users", x: 0, y: 0 },
  { id: "mobile", kind: "client", label: "Mobile users", x: 0, y: 110 },
  { id: "agent", kind: "client", label: "Agent app", x: 0, y: 220 },
  {
    id: "server",
    kind: "server",
    label: "একমাত্র Server",
    x: 260,
    y: 110,
    status: "failed",
  },
  { id: "db", kind: "database", label: "Database", x: 500, y: 110 },
];

const BEFORE_EDGES: ArchitectureEdge[] = [
  { from: "web", to: "server", label: "সবাই এখানে" },
  { from: "mobile", to: "server", label: "CPU 100%", tone: "failed" },
  { from: "agent", to: "server", label: "timeout ✕", tone: "failed" },
  { from: "server", to: "db" },
];

/** Before: every user hits the one and only server. */
export function Day009Before() {
  return <ArchitectureDiagram nodes={BEFORE_NODES} edges={BEFORE_EDGES} />;
}

const MAIN_NODES: ArchitectureNode[] = [
  { id: "users", kind: "client", label: "Users", x: 0, y: 120 },
  {
    id: "lb",
    kind: "load-balancer",
    label: "Load Balancer",
    x: 220,
    y: 120,
    status: "highlight",
  },
  { id: "s1", kind: "server", label: "Server 1", x: 470, y: 0 },
  { id: "s2", kind: "server", label: "Server 2", x: 470, y: 120 },
  {
    id: "s3",
    kind: "server",
    label: "Server 3",
    x: 470,
    y: 240,
    status: "failed",
  },
  { id: "db", kind: "database", label: "Database", x: 710, y: 120 },
];

const MAIN_EDGES: ArchitectureEdge[] = [
  { from: "users", to: "lb", label: "একটাই ঠিকানা" },
  { from: "lb", to: "s1", label: "~৫০%", tone: "active" },
  { from: "lb", to: "s2", label: "~৫০%", tone: "active" },
  {
    from: "lb",
    to: "s3",
    label: "health ✕ · বাদ",
    tone: "failed",
    dashed: true,
  },
  { from: "s1", to: "db" },
  { from: "s2", to: "db" },
  { from: "s3", to: "db", dashed: true },
];

/** After (main diagram): one entry point spreads requests over healthy servers only. */
export function Day009Main() {
  return <ArchitectureDiagram nodes={MAIN_NODES} edges={MAIN_EDGES} />;
}

const HA_NODES: ArchitectureNode[] = [
  { id: "users", kind: "client", label: "Users", x: 0, y: 130 },
  { id: "vip", kind: "external", label: "Floating IP (VIP)", x: 210, y: 130 },
  {
    id: "lbA",
    kind: "load-balancer",
    label: "LB-A (active)",
    x: 440,
    y: 20,
    status: "highlight",
  },
  {
    id: "lbB",
    kind: "load-balancer",
    label: "LB-B (standby)",
    x: 440,
    y: 240,
    status: "dimmed",
  },
  { id: "pool", kind: "server", label: "Server pool", x: 680, y: 130 },
];

const HA_EDGES: ArchitectureEdge[] = [
  { from: "users", to: "vip", label: "203.0.113.10" },
  { from: "vip", to: "lbA", label: "এখন A-র কাছে", tone: "active" },
  { from: "vip", to: "lbB", label: "A মরলে B নেয়", dashed: true },
  { from: "lbA", to: "lbB", label: "VRRP heartbeat", dashed: true },
  { from: "lbA", to: "pool", tone: "active" },
  { from: "lbB", to: "pool", dashed: true },
];

/** Active-passive LB pair sharing a floating IP (keepalived/VRRP). */
export function Day009LbPair() {
  return <ArchitectureDiagram nodes={HA_NODES} edges={HA_EDGES} />;
}

const SUMMARY_NODES: ArchitectureNode[] = [
  { id: "users", kind: "client", label: "Users", x: 0, y: 100 },
  { id: "lb", kind: "load-balancer", label: "Load Balancer", x: 200, y: 100 },
  { id: "s1", kind: "server", label: "Server 1", x: 420, y: 0 },
  { id: "s2", kind: "server", label: "Server 2", x: 420, y: 100 },
  {
    id: "s3",
    kind: "server",
    label: "Server 3",
    x: 420,
    y: 200,
    status: "failed",
  },
];

const SUMMARY_EDGES: ArchitectureEdge[] = [
  { from: "users", to: "lb" },
  { from: "lb", to: "s1", label: "algorithm" },
  { from: "lb", to: "s2" },
  {
    from: "lb",
    to: "s3",
    label: "health ✕",
    tone: "failed",
    dashed: true,
  },
];

/** Compact version for the summary card. */
export function Day009Summary() {
  return <ArchitectureDiagram nodes={SUMMARY_NODES} edges={SUMMARY_EDGES} />;
}
