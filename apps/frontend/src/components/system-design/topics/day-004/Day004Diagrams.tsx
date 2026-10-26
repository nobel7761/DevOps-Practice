import {
  ArchitectureDiagram,
  type ArchitectureEdge,
  type ArchitectureNode,
} from "@/components/shared/diagram";

// Day 4 architecture diagrams, built from the shared visual vocabulary.

const BEFORE_NODES: ArchitectureNode[] = [
  { id: "app", kind: "client", label: "Mobile App", x: 0, y: 0 },
  { id: "web", kind: "client", label: "Website", x: 0, y: 130 },
  { id: "courier", kind: "external", label: "Courier Partner", x: 0, y: 260 },
  { id: "backend", kind: "server", label: "Backend", x: 270, y: 65 },
  { id: "db", kind: "database", label: "Shop DB", x: 540, y: 160 },
];

const BEFORE_EDGES: ArchitectureEdge[] = [
  { from: "app", to: "backend", label: "/getAllProducts" },
  { from: "web", to: "backend", label: "/doOrderNew" },
  { from: "backend", to: "db", label: "SQL" },
  {
    from: "courier",
    to: "db",
    label: "DB password দিয়ে সরাসরি ✕",
    tone: "failed",
    dashed: true,
  },
];

/** Before: every client talks to the shop in its own ad-hoc way; the partner even reads the database directly. */
export function Day004Before() {
  return <ArchitectureDiagram nodes={BEFORE_NODES} edges={BEFORE_EDGES} />;
}

const MAIN_NODES: ArchitectureNode[] = [
  { id: "app", kind: "client", label: "Mobile App", x: 0, y: 0 },
  { id: "web", kind: "client", label: "Website", x: 0, y: 120 },
  { id: "courier", kind: "external", label: "Courier Partner", x: 0, y: 240 },
  {
    id: "api",
    kind: "server",
    label: "REST API",
    x: 300,
    y: 120,
    status: "highlight",
  },
  { id: "db", kind: "database", label: "Shop DB", x: 560, y: 120 },
];

const MAIN_EDGES: ArchitectureEdge[] = [
  { from: "app", to: "api", label: "GET /products" },
  { from: "web", to: "api", label: "POST /orders", tone: "active" },
  { from: "courier", to: "api", label: "PATCH /orders/42" },
  { from: "api", to: "db", label: "নিজের নিয়মে query" },
];

/** After (main diagram): every client uses the same contract, only the API touches the database. */
export function Day004Main() {
  return <ArchitectureDiagram nodes={MAIN_NODES} edges={MAIN_EDGES} />;
}

const SUMMARY_NODES: ArchitectureNode[] = [
  { id: "client", kind: "client", label: "Client", x: 0, y: 0 },
  { id: "partner", kind: "external", label: "Partner", x: 0, y: 130 },
  {
    id: "api",
    kind: "server",
    label: "REST API",
    x: 240,
    y: 65,
    status: "highlight",
  },
  { id: "db", kind: "database", label: "Database", x: 470, y: 65 },
];

const SUMMARY_EDGES: ArchitectureEdge[] = [
  { from: "client", to: "api", label: "GET /products/7" },
  { from: "partner", to: "api", label: "POST /orders" },
  { from: "api", to: "db", label: "query" },
];

/** Compact version for the summary card. */
export function Day004Summary() {
  return <ArchitectureDiagram nodes={SUMMARY_NODES} edges={SUMMARY_EDGES} />;
}
