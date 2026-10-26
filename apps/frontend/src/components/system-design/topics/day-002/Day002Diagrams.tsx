import {
  ArchitectureDiagram,
  type ArchitectureEdge,
  type ArchitectureNode,
} from "@/components/shared/diagram";

// Day 2 architecture diagrams, built from the shared visual vocabulary.

const BEFORE_NODES: ArchitectureNode[] = [
  { id: "rina", kind: "client", label: "রিনার phone", x: 0, y: 0 },
  { id: "dbRina", kind: "database", label: "stock: 1", x: 240, y: 0 },
  { id: "suman", kind: "client", label: "সুমনের phone", x: 0, y: 110 },
  { id: "dbSuman", kind: "database", label: "stock: 1", x: 240, y: 110 },
  { id: "friend", kind: "client", label: "বন্ধুর laptop", x: 0, y: 240 },
  {
    id: "laptop",
    kind: "server",
    label: "localhost:3000",
    x: 240,
    y: 240,
    status: "failed",
  },
];

const BEFORE_EDGES: ArchitectureEdge[] = [
  { from: "rina", to: "dbRina", label: "কিনল ✓" },
  { from: "suman", to: "dbSuman", label: "কিনল ✓" },
  {
    from: "friend",
    to: "laptop",
    label: "পৌঁছায় না ✕",
    tone: "failed",
    dashed: true,
  },
];

/** Before: every phone keeps its own copy of the data, and localhost isn't reachable from outside. */
export function Day002Before() {
  return <ArchitectureDiagram nodes={BEFORE_NODES} edges={BEFORE_EDGES} />;
}

const MAIN_NODES: ArchitectureNode[] = [
  { id: "phone", kind: "client", label: "Phone (ঢাকা)", x: 0, y: 0 },
  { id: "laptop", kind: "client", label: "Laptop (ঢাকা)", x: 0, y: 150 },
  { id: "router", kind: "gateway", label: "Wi-Fi Router", x: 200, y: 75 },
  { id: "isp", kind: "external", label: "ISP", x: 390, y: 75 },
  { id: "internet", kind: "external", label: "Undersea cable", x: 580, y: 75 },
  {
    id: "server",
    kind: "server",
    label: "Server (SG)",
    x: 770,
    y: 75,
    status: "highlight",
  },
  { id: "db", kind: "database", label: "Database", x: 770, y: 210 },
];

const MAIN_EDGES: ArchitectureEdge[] = [
  { from: "phone", to: "router", label: "request" },
  { from: "laptop", to: "router", label: "request" },
  { from: "router", to: "isp", label: "NAT" },
  { from: "isp", to: "internet", label: "IIG" },
  { from: "internet", to: "server", label: "router-রা", tone: "active" },
  { from: "server", to: "db", label: "query" },
];

/** After (main diagram): clients reach one server across the Internet. */
export function Day002Main() {
  return <ArchitectureDiagram nodes={MAIN_NODES} edges={MAIN_EDGES} />;
}

const SUMMARY_NODES: ArchitectureNode[] = [
  { id: "phone", kind: "client", label: "Phone", x: 0, y: 0 },
  { id: "laptop", kind: "client", label: "Laptop", x: 0, y: 100 },
  { id: "app", kind: "client", label: "Backend", x: 0, y: 200 },
  { id: "internet", kind: "external", label: "Internet", x: 210, y: 100 },
  {
    id: "server",
    kind: "server",
    label: "Server",
    x: 420,
    y: 100,
    status: "highlight",
  },
  { id: "db", kind: "database", label: "Database", x: 420, y: 220 },
];

const SUMMARY_EDGES: ArchitectureEdge[] = [
  { from: "phone", to: "internet", label: "request" },
  { from: "laptop", to: "internet" },
  { from: "app", to: "internet" },
  { from: "internet", to: "server", label: "packet-এ" },
  { from: "server", to: "db", label: "একটাই সত্য" },
];

/** Compact version for the summary card. */
export function Day002Summary() {
  return <ArchitectureDiagram nodes={SUMMARY_NODES} edges={SUMMARY_EDGES} />;
}
