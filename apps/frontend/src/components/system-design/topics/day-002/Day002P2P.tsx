import {
  DiagramEdge,
  DiagramNode,
  NODE_HEIGHT,
  NODE_WIDTH,
} from "@/components/shared/diagram";
import {
  edgeEndpoints,
  offsetSegment,
} from "@/lib/system-design/diagram/geometry";

// Client-server (everyone talks to one server) vs peer-to-peer (everyone talks to everyone).

interface Spot {
  id: string;
  x: number;
  y: number;
}

const box = (spot: Spot) => ({
  x: spot.x,
  y: spot.y,
  width: NODE_WIDTH,
  height: NODE_HEIGHT,
});

const CS_SERVER: Spot = { id: "server", x: 520, y: 70 };
const CS_CLIENTS: Spot[] = [
  { id: "c1", x: 120, y: 0 },
  { id: "c2", x: 120, y: 85 },
  { id: "c3", x: 120, y: 170 },
];

const PEER_TOP = 320;
const PEERS: Spot[] = [
  { id: "p1", x: 120, y: PEER_TOP },
  { id: "p2", x: 520, y: PEER_TOP },
  { id: "p3", x: 120, y: PEER_TOP + 170 },
  { id: "p4", x: 520, y: PEER_TOP + 170 },
];
const PEER_LINKS: [number, number][] = [
  [0, 1],
  [0, 2],
  [1, 3],
  [2, 3],
  [0, 3],
];

function PanelTitle({ y, text }: { y: number; text: string }) {
  return (
    <text x={0} y={y} fontSize={14} fontWeight={700} fill="var(--sd-label)">
      {text}
    </text>
  );
}

function ClientServerPanel() {
  return (
    <g>
      {CS_CLIENTS.map((client, i) => (
        <g key={client.id}>
          <DiagramEdge
            segment={edgeEndpoints(box(client), box(CS_SERVER))}
            label={i === 0 ? "request" : undefined}
          />
          <DiagramNode
            kind="client"
            label={`Client ${i + 1}`}
            x={client.x}
            y={client.y}
          />
        </g>
      ))}
      <DiagramNode
        kind="server"
        label="Server"
        x={CS_SERVER.x}
        y={CS_SERVER.y}
        status="highlight"
      />
    </g>
  );
}

function PeerPanel() {
  return (
    <g>
      {PEER_LINKS.map(([a, b]) => {
        const segment = edgeEndpoints(box(PEERS[a]), box(PEERS[b]));
        const back = edgeEndpoints(box(PEERS[b]), box(PEERS[a]));
        return (
          <g key={`${a}-${b}`}>
            <DiagramEdge segment={offsetSegment(segment, 5)} />
            <DiagramEdge segment={offsetSegment(back, 5)} />
          </g>
        );
      })}
      {PEERS.map((peer, i) => (
        <DiagramNode
          key={peer.id}
          kind="client"
          label={`Peer ${i + 1}`}
          x={peer.x}
          y={peer.y}
        />
      ))}
    </g>
  );
}

export function Day002P2P() {
  return (
    <svg viewBox="-10 -40 700 620" width="100%">
      <PanelTitle y={-14} text="Client-Server: সবাই এক server-এর কাছে" />
      <ClientServerPanel />
      <PanelTitle
        y={PEER_TOP - 26}
        text="Peer-to-Peer: প্রত্যেকে client, প্রত্যেকে server"
      />
      <PeerPanel />
    </svg>
  );
}
