// Placeholder diagrams for previewing the library — not lesson content.
import type {
  ArchitectureEdge,
  ArchitectureNode,
  DiagramState,
  DiagramTransition,
} from "@/components/shared/diagram";

export const sampleNodes: ArchitectureNode[] = [
  { id: "client", kind: "client", x: 0, y: 90 },
  { id: "lb", kind: "load-balancer", x: 200, y: 90 },
  { id: "s1", kind: "server", label: "Server 1", x: 400, y: 0 },
  {
    id: "s2",
    kind: "server",
    label: "Server 2",
    x: 400,
    y: 90,
    status: "failed",
  },
  { id: "s3", kind: "server", label: "Server 3", x: 400, y: 180 },
  { id: "cache", kind: "cache", x: 600, y: 40 },
  { id: "db", kind: "database", x: 600, y: 150 },
];

export const sampleEdges: ArchitectureEdge[] = [
  { from: "client", to: "lb", tone: "active" },
  { from: "lb", to: "s1" },
  { from: "lb", to: "s2", tone: "failed", dashed: true },
  { from: "lb", to: "s3" },
  { from: "s1", to: "cache" },
  { from: "s3", to: "db" },
];

export const sampleStates: DiagramState[] = [
  { id: "a", label: "State A", x: 0, y: 0 },
  { id: "b", label: "State B", x: 260, y: 0 },
  { id: "c", label: "State C", x: 130, y: 120 },
];

export const sampleTransitions: DiagramTransition[] = [
  { from: "a", to: "b", label: "event 1" },
  { from: "b", to: "c", label: "event 2" },
  { from: "c", to: "b", label: "event 3" },
  { from: "c", to: "a", label: "event 4" },
];

export const sampleRecapTopics = Array.from({ length: 7 }, (_, i) => ({
  day: i + 1,
  title: `Topic ${i + 1}`,
  definition: `Topic ${i + 1}-এর এক লাইনের placeholder সংজ্ঞা।`,
}));
