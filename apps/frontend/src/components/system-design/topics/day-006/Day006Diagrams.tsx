import {
  ArchitectureDiagram,
  type ArchitectureEdge,
  type ArchitectureNode,
} from "@/components/shared/diagram";
import { ZonedArchitecture, type DiagramZone } from "./ZonedArchitecture";

// Day 6 architecture diagrams, built from the shared visual vocabulary.

const BEFORE_NODES: ArchitectureNode[] = [
  { id: "user", kind: "client", label: "Users", x: 0, y: 60 },
  {
    id: "server",
    kind: "server",
    label: "Single Server (app + API)",
    x: 240,
    y: 60,
    status: "failed",
  },
  {
    id: "db",
    kind: "database",
    label: "Database (একই machine)",
    x: 480,
    y: 60,
    status: "dimmed",
  },
];

const BEFORE_EDGES: ArchitectureEdge[] = [
  { from: "user", to: "server", label: "502 / timeout ✕", tone: "failed" },
  { from: "server", to: "db", dashed: true },
];

/** Before: everything on one machine — a single point of failure. */
export function Day006Before() {
  return <ArchitectureDiagram nodes={BEFORE_NODES} edges={BEFORE_EDGES} />;
}

const MAIN_ZONES: DiagramZone[] = [
  { label: "Region", x: 0, y: 200, width: 760, height: 300, outer: true },
  { label: "Availability Zone A", x: 20, y: 230, width: 330, height: 250 },
  { label: "Availability Zone B", x: 410, y: 230, width: 330, height: 250 },
];

const MAIN_NODES: ArchitectureNode[] = [
  { id: "user", kind: "client", label: "Users", x: 314, y: 0 },
  {
    id: "lb",
    kind: "load-balancer",
    label: "Load Balancer",
    x: 314,
    y: 110,
    status: "highlight",
  },
  { id: "app1", kind: "server", label: "App Server 1", x: 119, y: 270 },
  { id: "app2", kind: "server", label: "App Server 2", x: 509, y: 270 },
  { id: "dbp", kind: "database", label: "DB Primary", x: 119, y: 395 },
  { id: "dbr", kind: "database", label: "DB Replica", x: 509, y: 395 },
];

const MAIN_EDGES: ArchitectureEdge[] = [
  { from: "user", to: "lb" },
  { from: "lb", to: "app1", label: "health ✓", tone: "active" },
  { from: "lb", to: "app2", label: "health ✓", tone: "active" },
  { from: "app1", to: "dbp" },
  { from: "app2", to: "dbp" },
  { from: "dbp", to: "dbr", label: "replication", dashed: true },
];

/** After (main diagram): LB + two app servers + primary/replica across two AZs. */
export function Day006Main() {
  return (
    <ZonedArchitecture
      zones={MAIN_ZONES}
      nodes={MAIN_NODES}
      edges={MAIN_EDGES}
    />
  );
}

/** Both zone diagrams sit side by side in one comparison, so they share a frame. */
const ZONE_FRAME = { left: 120, right: 660 };

const ONE_ZONE_ZONES: DiagramZone[] = [
  {
    label: "Availability Zone A ✕",
    x: 200,
    y: 110,
    width: 380,
    height: 120,
    failed: true,
  },
];

const ONE_ZONE_NODES: ArchitectureNode[] = [
  { id: "lb", kind: "load-balancer", label: "Load Balancer", x: 324, y: 0 },
  {
    id: "app1",
    kind: "server",
    label: "App Server 1",
    x: 224,
    y: 145,
    status: "failed",
  },
  {
    id: "app2",
    kind: "server",
    label: "App Server 2",
    x: 424,
    y: 145,
    status: "failed",
  },
];

const ONE_ZONE_EDGES: ArchitectureEdge[] = [
  { from: "lb", to: "app1", tone: "failed", dashed: true },
  { from: "lb", to: "app2", tone: "failed", dashed: true },
];

/** Both copies in one AZ: the AZ fails and takes both copies with it. */
export function Day006OneZone() {
  return (
    <ZonedArchitecture
      zones={ONE_ZONE_ZONES}
      nodes={ONE_ZONE_NODES}
      edges={ONE_ZONE_EDGES}
      frame={ZONE_FRAME}
    />
  );
}

const TWO_ZONE_ZONES: DiagramZone[] = [
  {
    label: "Availability Zone A ✕",
    x: 120,
    y: 110,
    width: 220,
    height: 120,
    failed: true,
  },
  {
    label: "Availability Zone B",
    x: 440,
    y: 110,
    width: 220,
    height: 140,
    labelAtBottom: true,
  },
];

const TWO_ZONE_NODES: ArchitectureNode[] = [
  { id: "lb", kind: "load-balancer", label: "Load Balancer", x: 324, y: 0 },
  {
    id: "app1",
    kind: "server",
    label: "App Server 1",
    x: 164,
    y: 145,
    status: "failed",
  },
  {
    id: "app2",
    kind: "server",
    label: "App Server 2",
    x: 484,
    y: 145,
    status: "highlight",
  },
];

const TWO_ZONE_EDGES: ArchitectureEdge[] = [
  { from: "lb", to: "app1", tone: "failed", dashed: true },
  { from: "lb", to: "app2", label: "100% traffic", tone: "active" },
];

/** Copies spread over two AZs: one AZ fails, the other keeps serving. */
export function Day006TwoZones() {
  return (
    <ZonedArchitecture
      zones={TWO_ZONE_ZONES}
      nodes={TWO_ZONE_NODES}
      edges={TWO_ZONE_EDGES}
      frame={ZONE_FRAME}
    />
  );
}

const SUMMARY_NODES: ArchitectureNode[] = [
  { id: "lb", kind: "load-balancer", label: "Load Balancer", x: 0, y: 70 },
  {
    id: "app1",
    kind: "server",
    label: "App 1",
    x: 210,
    y: 0,
    status: "failed",
  },
  { id: "app2", kind: "server", label: "App 2", x: 210, y: 140 },
  { id: "dbp", kind: "database", label: "DB Primary", x: 420, y: 140 },
  { id: "dbr", kind: "database", label: "DB Replica", x: 420, y: 0 },
];

const SUMMARY_EDGES: ArchitectureEdge[] = [
  { from: "lb", to: "app1", label: "health ✕", tone: "failed", dashed: true },
  { from: "lb", to: "app2", label: "failover", tone: "active" },
  { from: "app2", to: "dbp" },
  { from: "dbp", to: "dbr", label: "replica", dashed: true },
];

/** Compact version for the summary card. */
export function Day006Summary() {
  return <ArchitectureDiagram nodes={SUMMARY_NODES} edges={SUMMARY_EDGES} />;
}
