import {
  ArchitectureDiagram,
  type ArchitectureEdge,
  type ArchitectureNode,
} from "@/components/shared/diagram";

// Compact version of the main diagram for the summary card.

const NODES: ArchitectureNode[] = [
  { id: "app", kind: "server", label: "App", x: 0, y: 70 },
  { id: "pool", kind: "server", label: "Connection Pool", x: 190, y: 70 },
  {
    id: "db",
    kind: "database",
    label: "Database Engine",
    x: 380,
    y: 70,
    status: "highlight",
  },
  { id: "wal", kind: "database", label: "WAL (আগে)", x: 570, y: 0 },
  { id: "data", kind: "database", label: "Data Files (পরে)", x: 570, y: 140 },
];

const EDGES: ArchitectureEdge[] = [
  { from: "app", to: "pool", label: "ধার" },
  { from: "pool", to: "db", label: "SQL", tone: "active" },
  { from: "db", to: "wal", label: "COMMIT: fsync", tone: "active" },
  { from: "db", to: "data", label: "checkpoint" },
];

export function Day010Summary() {
  return <ArchitectureDiagram nodes={NODES} edges={EDGES} />;
}
