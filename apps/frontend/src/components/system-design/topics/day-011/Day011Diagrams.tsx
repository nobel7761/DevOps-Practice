import {
  ArchitectureDiagram,
  type ArchitectureEdge,
  type ArchitectureNode,
} from "@/components/shared/diagram";

// Day 11 architecture diagrams, built from the shared visual vocabulary.

const BEFORE_NODES: ArchitectureNode[] = [
  { id: "dhaka", kind: "user", label: "ঢাকা", x: 0, y: 0 },
  { id: "ctg", kind: "user", label: "চট্টগ্রাম", x: 0, y: 120 },
  { id: "syl", kind: "user", label: "সিলেট", x: 0, y: 240 },
  {
    id: "origin",
    kind: "server",
    label: "Origin (US)",
    x: 480,
    y: 120,
    status: "highlight",
  },
  { id: "files", kind: "database", label: "ছবি ও file", x: 720, y: 120 },
];

const BEFORE_EDGES: ArchitectureEdge[] = [
  { from: "dhaka", to: "origin", label: "RTT ~২৫০ms", tone: "failed" },
  { from: "ctg", to: "origin", label: "RTT ~২৫০ms", tone: "failed" },
  { from: "syl", to: "origin", label: "RTT ~২৫০ms", tone: "failed" },
  { from: "origin", to: "files", label: "একই ছবি লাখবার" },
];

/** Before: every user fetches every file from one far-away origin. */
export function Day011Before() {
  return <ArchitectureDiagram nodes={BEFORE_NODES} edges={BEFORE_EDGES} />;
}

const MAIN_NODES: ArchitectureNode[] = [
  { id: "dhaka", kind: "user", label: "ঢাকা", x: 0, y: 0 },
  { id: "ctg", kind: "user", label: "চট্টগ্রাম", x: 0, y: 120 },
  { id: "syl", kind: "user", label: "সিলেট", x: 0, y: 240 },
  { id: "pop1", kind: "cdn", label: "Edge PoP ১", x: 250, y: 50 },
  { id: "pop2", kind: "cdn", label: "Edge PoP ২", x: 250, y: 200 },
  { id: "shield", kind: "cache", label: "Origin Shield", x: 500, y: 120 },
  {
    id: "origin",
    kind: "server",
    label: "Origin (US)",
    x: 750,
    y: 120,
  },
];

const MAIN_EDGES: ArchitectureEdge[] = [
  { from: "dhaka", to: "pop1", label: "HIT ~১০ms", tone: "active" },
  { from: "ctg", to: "pop1", label: "HIT", tone: "active" },
  { from: "syl", to: "pop2", label: "HIT", tone: "active" },
  { from: "pop1", to: "shield", label: "শুধু MISS", dashed: true },
  { from: "pop2", to: "shield", label: "শুধু MISS", dashed: true },
  { from: "shield", to: "origin", label: "কদাচিৎ fetch", dashed: true },
];

/** After (main diagram): users hit nearby edges; misses meet at the shield first. */
export function Day011Main() {
  return <ArchitectureDiagram nodes={MAIN_NODES} edges={MAIN_EDGES} />;
}

const POPS = [0, 90, 180, 270];

const SHIELD_BEFORE_NODES: ArchitectureNode[] = [
  ...POPS.map((y, i) => ({
    id: `pop${i}`,
    kind: "cdn" as const,
    label: `Edge PoP ${["১", "২", "৩", "৪"][i]}`,
    x: 0,
    y,
  })),
  {
    id: "origin",
    kind: "server",
    label: "Origin",
    x: 580,
    y: 135,
    status: "highlight",
  },
];

const SHIELD_BEFORE_EDGES: ArchitectureEdge[] = POPS.map((_, i) => ({
  from: `pop${i}`,
  to: "origin",
  label: "MISS",
  tone: "failed",
}));

/** Without a shield: every PoP's miss goes to the origin separately. */
export function Day011ShieldBefore() {
  return (
    <ArchitectureDiagram
      nodes={SHIELD_BEFORE_NODES}
      edges={SHIELD_BEFORE_EDGES}
    />
  );
}

const SHIELD_AFTER_NODES: ArchitectureNode[] = [
  ...SHIELD_BEFORE_NODES.slice(0, POPS.length),
  { id: "shield", kind: "cache", label: "Origin Shield", x: 300, y: 135 },
  { id: "origin", kind: "server", label: "Origin", x: 580, y: 135 },
];

const SHIELD_AFTER_EDGES: ArchitectureEdge[] = [
  ...POPS.map((_, i) => ({
    from: `pop${i}`,
    to: "shield",
    dashed: true,
  })),
  { from: "shield", to: "origin", label: "১টা fetch", tone: "active" },
];

/** With a shield: all misses meet at one mid-tier cache. */
export function Day011ShieldAfter() {
  return (
    <ArchitectureDiagram
      nodes={SHIELD_AFTER_NODES}
      edges={SHIELD_AFTER_EDGES}
    />
  );
}

const ISP_NODES: ArchitectureNode[] = [
  { id: "users", kind: "user", label: "গ্রাহক", x: 0, y: 60 },
  {
    id: "embedded",
    kind: "cdn",
    label: "ISP-র ভেতরের cache",
    x: 250,
    y: 60,
    status: "highlight",
  },
  { id: "ixp", kind: "cdn", label: "IXP / CDN PoP", x: 500, y: 60 },
  { id: "origin", kind: "server", label: "Origin (বিদেশ)", x: 750, y: 60 },
  { id: "isp", kind: "external", label: "ISP network", x: 250, y: 200 },
];

const ISP_EDGES: ArchitectureEdge[] = [
  { from: "users", to: "embedded", label: "বেশিরভাগ HIT", tone: "active" },
  { from: "users", to: "isp", label: "অন্য traffic" },
  { from: "embedded", to: "ixp", label: "miss / fill", dashed: true },
  {
    from: "ixp",
    to: "origin",
    label: "আন্তর্জাতিক link",
    dashed: true,
  },
];

/** ISP-embedded cache: popular content crosses the international link only to fill. */
export function Day011IspCache() {
  return <ArchitectureDiagram nodes={ISP_NODES} edges={ISP_EDGES} />;
}

const SUMMARY_NODES: ArchitectureNode[] = [
  { id: "user", kind: "user", label: "User", x: 0, y: 40 },
  { id: "edge", kind: "cdn", label: "Edge PoP", x: 200, y: 40 },
  { id: "shield", kind: "cache", label: "Origin Shield", x: 400, y: 40 },
  { id: "origin", kind: "server", label: "Origin", x: 600, y: 40 },
];

const SUMMARY_EDGES: ArchitectureEdge[] = [
  { from: "user", to: "edge", label: "HIT ✓", tone: "active" },
  { from: "edge", to: "shield", label: "MISS", dashed: true },
  { from: "shield", to: "origin", label: "MISS", dashed: true },
];

/** Compact version for the summary card. */
export function Day011Summary() {
  return <ArchitectureDiagram nodes={SUMMARY_NODES} edges={SUMMARY_EDGES} />;
}
