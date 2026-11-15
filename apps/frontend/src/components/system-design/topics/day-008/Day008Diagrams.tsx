import {
  ArchitectureDiagram,
  type ArchitectureEdge,
  type ArchitectureNode,
} from "@/components/shared/diagram";

// Day 8 architecture diagrams built from the shared visual vocabulary.

const BEFORE_NODES: ArchitectureNode[] = [
  { id: "rahim", kind: "user", label: "রহিম", x: 0, y: 60 },
  {
    id: "dhaka",
    kind: "database",
    label: "Dhaka: A1 sold",
    x: 210,
    y: 60,
    status: "highlight",
  },
  { id: "ctg", kind: "database", label: "Ctg: A1 free", x: 450, y: 60 },
  { id: "karim", kind: "user", label: "করিম", x: 680, y: 60 },
];

const BEFORE_EDGES: ArchitectureEdge[] = [
  { from: "rahim", to: "dhaka", label: "A1 কিনলেন ✓", tone: "active" },
  {
    from: "dhaka",
    to: "ctg",
    label: "replicate ✕",
    tone: "failed",
    dashed: true,
  },
  { from: "karim", to: "ctg", label: "A1 খালি?" },
];

/** Before: the link between the two copies is cut, so they disagree about seat A1. */
export function Day008Before() {
  return <ArchitectureDiagram nodes={BEFORE_NODES} edges={BEFORE_EDGES} />;
}

const SUMMARY_NODES: ArchitectureNode[] = [
  { id: "a", kind: "database", label: "Node A (majority)", x: 210, y: 0 },
  { id: "b", kind: "database", label: "Node B (একা)", x: 210, y: 150 },
  { id: "client", kind: "client", label: "Client", x: 0, y: 150 },
  { id: "cp", kind: "external", label: "CP: error দাও", x: 440, y: 80 },
  { id: "ap", kind: "external", label: "AP: পুরনো data দাও", x: 440, y: 220 },
];

const SUMMARY_EDGES: ArchitectureEdge[] = [
  { from: "a", to: "b", label: "partition ✕", tone: "failed", dashed: true },
  { from: "client", to: "b", label: "read?" },
  { from: "b", to: "cp" },
  { from: "b", to: "ap" },
];

/** Compact version for the summary card. */
export function Day008Summary() {
  return <ArchitectureDiagram nodes={SUMMARY_NODES} edges={SUMMARY_EDGES} />;
}

const nodesFor = (node3: string): ArchitectureNode[] => [
  { id: "rahim", kind: "user", label: "রহিম", x: 0, y: 0 },
  { id: "n1", kind: "database", label: "Node 1: ৳1000", x: 220, y: 0 },
  { id: "n2", kind: "database", label: "Node 2: ৳1000", x: 220, y: 130 },
  { id: "n3", kind: "database", label: node3, x: 470, y: 65 },
  { id: "karim", kind: "user", label: "করিম", x: 700, y: 65 },
];

const SHARED_EDGES: ArchitectureEdge[] = [
  { from: "rahim", to: "n1", label: "৳4000 পাঠাও ✓", tone: "active" },
  { from: "n1", to: "n2", label: "replicate ✓" },
  { from: "n1", to: "n3", label: "✕", tone: "failed", dashed: true },
];

/** AP behaviour for a money transfer: the isolated node accepts it too. */
export function Day008ApTransfer() {
  return (
    <ArchitectureDiagram
      nodes={nodesFor("Node 3: ৳1000")}
      edges={[
        ...SHARED_EDGES,
        { from: "karim", to: "n3", label: "৳4000 পাঠাও ✓", tone: "failed" },
      ]}
    />
  );
}

/** CP behaviour for the same transfer: the isolated node refuses. */
export function Day008CpTransfer() {
  return (
    <ArchitectureDiagram
      nodes={nodesFor("Node 3: ৳5000 (পুরনো)")}
      edges={[
        ...SHARED_EDGES,
        {
          from: "karim",
          to: "n3",
          label: "error: পরে চেষ্টা",
          dashed: true,
        },
      ]}
    />
  );
}
