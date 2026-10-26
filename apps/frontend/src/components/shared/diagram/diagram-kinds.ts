// The fixed visual vocabulary for System Design diagrams (Plan doc Section 6.3
// rule 2): every component kind has one icon and one colour, everywhere.
// Colours are the `--sd-*` tokens in app/globals.css (light + dark).

import {
  Cloud,
  Database,
  DoorOpen,
  Globe,
  ListOrdered,
  Monitor,
  Server,
  Split,
  User,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type DiagramKind =
  | "client"
  | "user"
  | "server"
  | "database"
  | "cache"
  | "queue"
  | "load-balancer"
  | "cdn"
  | "gateway"
  | "external";

export const DIAGRAM_KINDS: Record<
  DiagramKind,
  { label: string; icon: LucideIcon }
> = {
  client: { label: "Client", icon: Monitor },
  user: { label: "User", icon: User },
  server: { label: "Server", icon: Server },
  database: { label: "Database", icon: Database },
  cache: { label: "Cache", icon: Zap },
  queue: { label: "Queue", icon: ListOrdered },
  "load-balancer": { label: "Load Balancer", icon: Split },
  cdn: { label: "CDN", icon: Globe },
  gateway: { label: "API Gateway", icon: DoorOpen },
  external: { label: "External Service", icon: Cloud },
};

export const kindColor = (kind: DiagramKind) => `var(--sd-${kind})`;
export const kindSoftColor = (kind: DiagramKind) => `var(--sd-${kind}-soft)`;

/** Visual state of a component in a diagram or simulator. */
export type DiagramNodeStatus = "normal" | "highlight" | "failed" | "dimmed";
