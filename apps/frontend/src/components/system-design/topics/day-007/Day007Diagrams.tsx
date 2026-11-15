import {
  ArchitectureDiagram,
  type ArchitectureEdge,
  type ArchitectureNode,
} from "@/components/shared/diagram";

// Day 7 problem diagram: the server is fast, the user still waits.

const BEFORE_NODES: ArchitectureNode[] = [
  { id: "browser", kind: "client", label: "Browser (ঢাকা)", x: 0, y: 60 },
  {
    id: "api",
    kind: "server",
    label: "API Server (US East)",
    x: 380,
    y: 60,
    status: "highlight",
  },
  { id: "db", kind: "database", label: "Database", x: 630, y: 60 },
  {
    id: "dash",
    kind: "external",
    label: "Dashboard: গড় ৩০ms ✓",
    x: 380,
    y: 220,
  },
];

const BEFORE_EDGES: ArchitectureEdge[] = [
  {
    from: "browser",
    to: "api",
    label: "৬টা call পরপর · RTT ~২৫০ms",
    tone: "failed",
  },
  { from: "api", to: "db", label: "~৩০ms", tone: "active" },
  {
    from: "api",
    to: "dash",
    label: "শুধু server-এর সময়",
    dashed: true,
  },
];

/** Before: a fast server behind a long, chatty, far-away network path. */
export function Day007Before() {
  return <ArchitectureDiagram nodes={BEFORE_NODES} edges={BEFORE_EDGES} />;
}
