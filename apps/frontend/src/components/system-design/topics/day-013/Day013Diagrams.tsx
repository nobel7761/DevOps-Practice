import {
  ArchitectureDiagram,
  type ArchitectureEdge,
  type ArchitectureNode,
} from "@/components/shared/diagram";

// Day 13 architecture diagrams, built from the shared visual vocabulary.

const MAIN_NODES: ArchitectureNode[] = [
  { id: "users", kind: "client", label: "Students", x: 0, y: 140 },
  { id: "lb", kind: "load-balancer", label: "Load Balancer", x: 210, y: 140 },
  { id: "app1", kind: "server", label: "App 1", x: 430, y: 20 },
  { id: "app2", kind: "server", label: "App 2", x: 430, y: 140 },
  { id: "app3", kind: "server", label: "App N (scale out)", x: 430, y: 260 },
  {
    id: "primary",
    kind: "database",
    label: "Primary DB (scale up)",
    x: 680,
    y: 60,
    status: "highlight",
  },
  { id: "replica", kind: "database", label: "Read Replica", x: 680, y: 240 },
];

const MAIN_EDGES: ArchitectureEdge[] = [
  { from: "users", to: "lb", label: "request" },
  { from: "lb", to: "app1" },
  { from: "lb", to: "app2" },
  { from: "lb", to: "app3" },
  { from: "app1", to: "primary", label: "write", tone: "active" },
  { from: "app2", to: "primary" },
  { from: "app3", to: "replica", label: "read" },
  { from: "primary", to: "replica", label: "copy", dashed: true },
];

/** After (main diagram): stateless app tier scales out, the database scales up. */
export function Day013Main() {
  return <ArchitectureDiagram nodes={MAIN_NODES} edges={MAIN_EDGES} />;
}

const SUMMARY_NODES: ArchitectureNode[] = [
  {
    id: "big",
    kind: "server",
    label: "বড় Server (scale up)",
    x: 0,
    y: 90,
    status: "highlight",
  },
  { id: "lb", kind: "load-balancer", label: "Load Balancer", x: 220, y: 90 },
  { id: "s1", kind: "server", label: "Server", x: 430, y: 0 },
  { id: "s2", kind: "server", label: "Server", x: 430, y: 90 },
  { id: "s3", kind: "server", label: "Server (scale out)", x: 430, y: 180 },
  { id: "db", kind: "database", label: "DB: আগে up", x: 220, y: 230 },
];

const SUMMARY_EDGES: ArchitectureEdge[] = [
  { from: "lb", to: "s1" },
  { from: "lb", to: "s2" },
  { from: "lb", to: "s3" },
  { from: "s3", to: "db", dashed: true },
];

/** Compact version for the summary card. */
export function Day013Summary() {
  return <ArchitectureDiagram nodes={SUMMARY_NODES} edges={SUMMARY_EDGES} />;
}
