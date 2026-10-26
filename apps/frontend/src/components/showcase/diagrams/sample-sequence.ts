// Placeholder flow for previewing the diagram library — not lesson content.
import type {
  SequenceMessage,
  SequenceParticipant,
} from "@/components/shared/diagram";

export const sampleParticipants: SequenceParticipant[] = [
  { id: "client", kind: "client" },
  { id: "lb", kind: "load-balancer" },
  { id: "server", kind: "server", label: "Server 1" },
  { id: "db", kind: "database" },
];

export const sampleMessages: SequenceMessage[] = [
  { from: "client", to: "lb", label: "GET /orders" },
  { from: "lb", to: "server", label: "forward" },
  { from: "server", to: "db", label: "SELECT" },
  { from: "db", to: "server", label: "rows", dashed: true },
  { from: "server", to: "client", label: "200 OK", dashed: true },
];

export const sampleSteps = [
  "Client request পাঠায় Load Balancer-এর কাছে।",
  "Load Balancer একটা সুস্থ server বেছে নেয়।",
  "Server database-এ query চালায়।",
  "Database ফলাফল ফেরত দেয়।",
  "Server response পাঠায় client-কে।",
];
