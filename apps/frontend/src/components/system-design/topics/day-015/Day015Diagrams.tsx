import {
  ArchitectureDiagram,
  DiagramEdge,
  DiagramNode,
  NODE_HEIGHT,
  NODE_WIDTH,
  type ArchitectureEdge,
  type ArchitectureNode,
} from "@/components/shared/diagram";
import { edgeEndpoints } from "@/lib/system-design/diagram/geometry";

// Day 15 architecture diagrams, built from the shared visual vocabulary.
// Proxies use the "gateway" kind (a doorway), labelled with their role.

const BEFORE_NODES: ArchitectureNode[] = [
  { id: "laptops", kind: "client", label: "Office Laptops", x: 0, y: 10 },
  { id: "internet", kind: "external", label: "Internet", x: 280, y: 10 },
  { id: "students", kind: "user", label: "Students", x: 0, y: 200 },
  { id: "app1", kind: "server", label: "App Server 1", x: 280, y: 110 },
  { id: "app2", kind: "server", label: "App Server 2", x: 280, y: 200 },
  {
    id: "app3",
    kind: "server",
    label: "App Server 3",
    x: 280,
    y: 290,
    status: "failed",
  },
];

const BEFORE_EDGES: ArchitectureEdge[] = [
  { from: "laptops", to: "internet", label: "নিয়ন্ত্রণ নেই" },
  { from: "students", to: "app1", label: "public IP" },
  { from: "students", to: "app2", label: "public IP" },
  {
    from: "students",
    to: "app3",
    label: "worker শেষ ✕",
    tone: "failed",
    dashed: true,
  },
];

/** Before: laptops go straight out, users hit every app server directly. */
export function Day015Before() {
  // Only two columns wide: cap the width so it isn't blown up next to the five-column "after".
  return (
    <div className="mx-auto max-w-xl">
      <ArchitectureDiagram nodes={BEFORE_NODES} edges={BEFORE_EDGES} />
    </div>
  );
}

type MainNode = ArchitectureNode & { note?: string };

const MAIN_NODES: MainNode[] = [
  { id: "laptops", kind: "client", label: "Office Laptops", x: 0, y: 100 },
  {
    id: "fwd",
    kind: "gateway",
    label: "Forward Proxy (Squid)",
    x: 190,
    y: 100,
    status: "highlight",
    note: "filter · log · cache",
  },
  { id: "internet", kind: "external", label: "Internet", x: 380, y: 100 },
  {
    id: "rp",
    kind: "gateway",
    label: "Reverse Proxy (NGINX)",
    x: 570,
    y: 100,
    status: "highlight",
    note: "TLS · buffer · gzip · cache",
  },
  { id: "app1", kind: "server", label: "App Server 1", x: 770, y: 0 },
  { id: "app2", kind: "server", label: "App Server 2", x: 770, y: 100 },
  { id: "app3", kind: "server", label: "App Server 3", x: 770, y: 200 },
];

const MAIN_EDGES: ArchitectureEdge[] = [
  { from: "laptops", to: "fwd" },
  { from: "fwd", to: "internet", tone: "active" },
  { from: "internet", to: "rp", tone: "active" },
  { from: "rp", to: "app1" },
  { from: "rp", to: "app2" },
  { from: "rp", to: "app3" },
];

const boxOf = (node: ArchitectureNode) => ({
  x: node.x,
  y: node.y,
  width: NODE_WIDTH,
  height: NODE_HEIGHT,
});

function SideLabel({ x, y, text }: { x: number; y: number; text: string }) {
  return (
    <text x={x} y={y} textAnchor="middle" fontSize={12} fill="var(--sd-edge)">
      {text}
    </text>
  );
}

function MainEdges() {
  const byId = new Map(MAIN_NODES.map((node) => [node.id, node]));
  return (
    <>
      {MAIN_EDGES.map((edge) => {
        const from = byId.get(edge.from);
        const to = byId.get(edge.to);
        if (!from || !to) return null;
        return (
          <DiagramEdge
            key={`${edge.from}-${edge.to}`}
            segment={edgeEndpoints(boxOf(from), boxOf(to))}
            tone={edge.tone}
          />
        );
      })}
    </>
  );
}

function MainNodes() {
  return (
    <>
      {MAIN_NODES.map((node) => (
        <g key={node.id}>
          <DiagramNode
            kind={node.kind}
            label={node.label}
            x={node.x}
            y={node.y}
            status={node.status}
          />
          {node.note && (
            <SideLabel
              x={node.x + NODE_WIDTH / 2}
              y={node.y + NODE_HEIGHT + 20}
              text={node.note}
            />
          )}
        </g>
      ))}
    </>
  );
}

/** After (main diagram): forward proxy on the client side, reverse proxy on the server side. */
export function Day015Main() {
  return (
    <svg viewBox="-16 -40 934 320" width="100%">
      <SideLabel x={161} y={-18} text="← client-এর হয়ে (অফিসের দিক)" />
      <SideLabel x={700} y={-18} text="server-এর হয়ে (আমাদের site) →" />
      <MainEdges />
      <MainNodes />
    </svg>
  );
}

const SIDECAR_NODES: ArchitectureNode[] = [
  { id: "cp", kind: "server", label: "Control Plane", x: 290, y: 0 },
  { id: "order", kind: "server", label: "Order Service", x: 0, y: 160 },
  {
    id: "sa",
    kind: "gateway",
    label: "Order sidecar",
    x: 190,
    y: 160,
    status: "highlight",
  },
  {
    id: "sb",
    kind: "gateway",
    label: "Payment sidecar",
    x: 390,
    y: 160,
    status: "highlight",
  },
  { id: "payment", kind: "server", label: "Payment Service", x: 580, y: 160 },
];

const SIDECAR_EDGES: ArchitectureEdge[] = [
  { from: "cp", to: "sa", label: "config", dashed: true },
  { from: "cp", to: "sb", label: "config", dashed: true },
  { from: "order", to: "sa", label: "localhost" },
  { from: "sa", to: "sb", label: "mTLS", tone: "active" },
  { from: "sb", to: "payment", label: "localhost" },
];

/** Sidecar proxies: service-to-service traffic goes sidecar to sidecar. */
export function Day015Sidecar() {
  return <ArchitectureDiagram nodes={SIDECAR_NODES} edges={SIDECAR_EDGES} />;
}

const SUMMARY_NODES: ArchitectureNode[] = [
  { id: "client", kind: "client", label: "Client", x: 0, y: 60 },
  { id: "fwd", kind: "gateway", label: "Forward Proxy", x: 180, y: 60 },
  { id: "internet", kind: "external", label: "Internet", x: 360, y: 60 },
  { id: "rp", kind: "gateway", label: "Reverse Proxy", x: 540, y: 60 },
  { id: "s1", kind: "server", label: "Server 1", x: 720, y: 0 },
  { id: "s2", kind: "server", label: "Server 2", x: 720, y: 120 },
];

const SUMMARY_EDGES: ArchitectureEdge[] = [
  { from: "client", to: "fwd" },
  { from: "fwd", to: "internet", label: "client-এর হয়ে" },
  { from: "internet", to: "rp", label: "server-এর হয়ে" },
  { from: "rp", to: "s1" },
  { from: "rp", to: "s2" },
];

/** Compact version for the summary card. */
export function Day015Summary() {
  return <ArchitectureDiagram nodes={SUMMARY_NODES} edges={SUMMARY_EDGES} />;
}
