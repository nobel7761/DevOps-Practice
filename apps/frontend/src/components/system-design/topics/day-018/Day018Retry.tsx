import {
  SequenceDiagram,
  type SequenceMessage,
  type SequenceParticipant,
} from "@/components/shared/diagram";

// What a well-behaved client and server say to each other around a 429.

const PARTICIPANTS: SequenceParticipant[] = [
  { id: "client", kind: "client", label: "Client" },
  { id: "limiter", kind: "gateway", label: "Rate Limiter" },
  { id: "api", kind: "server", label: "API Server" },
];

const MESSAGES: SequenceMessage[] = [
  { from: "client", to: "limiter", label: "GET /orders (৬১তম, limit 60/min)" },
  {
    from: "limiter",
    to: "client",
    label: "429 · Retry-After: 20",
    dashed: true,
  },
  { from: "client", to: "limiter", label: "২০s + jitter অপেক্ষা, তারপর আবার" },
  { from: "limiter", to: "api", label: "token আছে → forward" },
  { from: "api", to: "limiter", label: "200 OK", dashed: true },
  {
    from: "limiter",
    to: "client",
    label: "200 · X-RateLimit-Remaining: 59",
    dashed: true,
  },
];

/** 429 → wait (Retry-After + jitter) → retry → success. */
export function Day018Retry() {
  return (
    <div className="overflow-x-auto">
      <SequenceDiagram participants={PARTICIPANTS} messages={MESSAGES} />
    </div>
  );
}
