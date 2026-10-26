import {
  ArchitectureDiagram,
  type ArchitectureEdge,
  type ArchitectureNode,
} from "@/components/shared/diagram";

// Day 12 architecture diagrams, built from the shared visual vocabulary.

const BEFORE_NODES: ArchitectureNode[] = [
  { id: "user", kind: "client", label: "User", x: 0, y: 150 },
  { id: "order", kind: "server", label: "Order Service", x: 210, y: 150 },
  { id: "email", kind: "external", label: "Email Service", x: 450, y: 0 },
  { id: "invoice", kind: "server", label: "Invoice (PDF)", x: 450, y: 100 },
  { id: "warehouse", kind: "server", label: "Warehouse", x: 450, y: 200 },
  {
    id: "sms",
    kind: "external",
    label: "SMS Gateway",
    x: 450,
    y: 300,
    status: "failed",
  },
];

const BEFORE_EDGES: ArchitectureEdge[] = [
  { from: "user", to: "order", label: "POST /order" },
  { from: "order", to: "email", label: "১. 800ms" },
  { from: "order", to: "invoice", label: "২. 1.2s" },
  { from: "order", to: "warehouse", label: "৩. 400ms" },
  {
    from: "order",
    to: "sms",
    label: "৪. timeout ✕",
    tone: "failed",
    dashed: true,
  },
];

/** Before: the order request calls every service in turn. */
export function Day012Before() {
  return <ArchitectureDiagram nodes={BEFORE_NODES} edges={BEFORE_EDGES} />;
}

const MAIN_NODES: ArchitectureNode[] = [
  { id: "user", kind: "client", label: "User", x: 0, y: 100 },
  {
    id: "order",
    kind: "server",
    label: "Order Service",
    x: 240,
    y: 100,
    status: "highlight",
  },
  { id: "queue", kind: "queue", label: "orders queue", x: 460, y: 100 },
  { id: "email", kind: "server", label: "Email Worker", x: 690, y: 0 },
  { id: "invoice", kind: "server", label: "Invoice Worker", x: 690, y: 100 },
  { id: "warehouse", kind: "server", label: "Stock Worker", x: 690, y: 200 },
];

const MAIN_EDGES: ArchitectureEdge[] = [
  { from: "user", to: "order", label: "~120ms ✓" },
  { from: "order", to: "queue", label: "publish", tone: "active" },
  { from: "queue", to: "email", label: "consume" },
  { from: "queue", to: "invoice", label: "consume" },
  { from: "queue", to: "warehouse", label: "consume" },
];

/** After (main diagram): Order Service publishes, workers consume at their own pace. */
export function Day012Main() {
  return <ArchitectureDiagram nodes={MAIN_NODES} edges={MAIN_EDGES} />;
}

const SUMMARY_NODES: ArchitectureNode[] = [
  { id: "producer", kind: "server", label: "Producer", x: 0, y: 60 },
  { id: "queue", kind: "queue", label: "Queue", x: 200, y: 60 },
  { id: "w1", kind: "server", label: "Consumer 1", x: 400, y: 0 },
  { id: "w2", kind: "server", label: "Consumer 2", x: 400, y: 120 },
  { id: "dlq", kind: "queue", label: "DLQ", x: 200, y: 190, status: "failed" },
];

const SUMMARY_EDGES: ArchitectureEdge[] = [
  { from: "producer", to: "queue", label: "publish" },
  { from: "queue", to: "w1", label: "deliver" },
  { from: "queue", to: "w2" },
  {
    from: "queue",
    to: "dlq",
    label: "বারবার fail",
    dashed: true,
    tone: "failed",
  },
];

/** Compact version for the summary card. */
export function Day012Summary() {
  return <ArchitectureDiagram nodes={SUMMARY_NODES} edges={SUMMARY_EDGES} />;
}
