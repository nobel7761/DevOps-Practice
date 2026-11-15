import {
  ArchitectureDiagram,
  BeforeAfter,
  type ArchitectureEdge,
  type ArchitectureNode,
} from "@/components/shared/diagram";

// Day 19 architecture diagrams: the guessed 11.11 design vs the estimated one.

const BEFORE_NODES: ArchitectureNode[] = [
  { id: "users", kind: "user", label: "11.11 Users", x: 0, y: 90 },
  { id: "lb", kind: "load-balancer", label: "Load Balancer", x: 200, y: 90 },
  { id: "app1", kind: "server", label: "App ×8 (আন্দাজ)", x: 400, y: 20 },
  { id: "app2", kind: "server", label: "App server", x: 400, y: 160 },
  {
    id: "db",
    kind: "database",
    label: "একটাই DB",
    x: 680,
    y: 20,
    status: "failed",
  },
  {
    id: "disk",
    kind: "database",
    label: "Local disk (ছবি)",
    x: 680,
    y: 160,
    status: "failed",
  },
];

const BEFORE_EDGES: ArchitectureEdge[] = [
  { from: "users", to: "lb", label: "~৫০k QPS" },
  { from: "lb", to: "app1" },
  { from: "lb", to: "app2" },
  {
    from: "app1",
    to: "db",
    label: "connection শেষ",
    tone: "failed",
    dashed: true,
  },
  { from: "app2", to: "disk", label: "৯৮% ভরা", tone: "failed", dashed: true },
];

/** Problem: an architecture sized by "last year × 2". */
export function Day019Before() {
  return <ArchitectureDiagram nodes={BEFORE_NODES} edges={BEFORE_EDGES} />;
}

const AFTER_NODES: ArchitectureNode[] = [
  { id: "users", kind: "user", label: "11.11 Users", x: 0, y: 120 },
  { id: "cdn", kind: "cdn", label: "CDN (ছবি)", x: 200, y: 0 },
  { id: "lb", kind: "load-balancer", label: "Load Balancer", x: 200, y: 160 },
  {
    id: "app",
    kind: "server",
    label: "App ×85 (N+1)",
    x: 400,
    y: 160,
    status: "highlight",
  },
  { id: "obj", kind: "database", label: "Object storage", x: 400, y: 0 },
  { id: "cache", kind: "cache", label: "Cache (hot ২০%)", x: 610, y: 90 },
  { id: "db", kind: "database", label: "DB primary", x: 610, y: 230 },
  { id: "replica", kind: "database", label: "Read replica", x: 820, y: 230 },
];

const AFTER_EDGES: ArchitectureEdge[] = [
  { from: "users", to: "cdn", label: "ছবি" },
  { from: "users", to: "lb", label: "API" },
  { from: "cdn", to: "obj", label: "miss" },
  { from: "lb", to: "app", tone: "active" },
  { from: "app", to: "cache", label: "hit ৯০%+", tone: "active" },
  { from: "app", to: "db", label: "miss" },
  { from: "db", to: "replica", label: "copy", dashed: true },
];

/** After: the design the numbers asked for. */
export function Day019After() {
  return <ArchitectureDiagram nodes={AFTER_NODES} edges={AFTER_EDGES} />;
}

export function Day019BeforeAfter() {
  return (
    <BeforeAfter
      stacked
      beforeTitle="আগে: আন্দাজে (গত বছর × ২)"
      afterTitle="পরে: হিসাব করে"
      before={<Day019Before />}
      after={<Day019After />}
      beforeNote="৮টা server, একটা database, ছবি app server-এর disk-এ: peak ~৫০,০০০ QPS-এ database আর disk দুটোই ভাঙে।"
      afterNote="ছবি CDN আর object storage-এ, cache hit ৯০%+ হলে DB দেখে ~৫,০০০ QPS, app server মাপা capacity-র ৬০%-এ, সাথে N+1।"
    />
  );
}
