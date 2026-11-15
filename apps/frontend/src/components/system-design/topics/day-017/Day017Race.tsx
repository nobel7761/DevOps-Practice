import {
  SequenceDiagram,
  StepThrough,
  type SequenceMessage,
  type SequenceParticipant,
} from "@/components/shared/diagram";

// Cache-aside read and write, then the classic read/write race that leaves a
// stale value in the cache, then the delayed second delete that cleans it up.

const PARTICIPANTS: SequenceParticipant[] = [
  { id: "a", kind: "server", label: "Request A (পড়া)" },
  { id: "cache", kind: "cache", label: "Redis" },
  { id: "db", kind: "database", label: "Database" },
  { id: "b", kind: "server", label: "Request B (লেখা)" },
];

const MESSAGES: SequenceMessage[] = [
  { from: "a", to: "cache", label: "GET product:1" },
  { from: "cache", to: "a", label: "miss (key নেই)", dashed: true },
  { from: "a", to: "db", label: "SELECT → price = 80" },
  { from: "b", to: "db", label: "UPDATE price = 75 ✓" },
  { from: "b", to: "cache", label: "DEL product:1" },
  { from: "a", to: "cache", label: "SET product:1 = 80 ✕ (পুরনো!)" },
  {
    from: "cache",
    to: "a",
    label: "পরের সবাই পায় 80, TTL পর্যন্ত",
    dashed: true,
  },
  { from: "b", to: "cache", label: "~১s পরে আবার DEL product:1" },
];

const STEPS = [
  "Cache-aside read: Request A আগে Redis-এ product:1 খোঁজে।",
  "Key নেই (miss, হয়তো TTL শেষ)। তাই A-কে database-এ যেতে হবে।",
  "A database থেকে পড়ে price = 80। কিন্তু cache-এ লেখার আগেই A একটু আটকে গেল (GC pause, ধীর network)।",
  "ঠিক এই ফাঁকে Request B (admin) দাম বদলায়: database-এ price = 75, commit হয়ে গেল।",
  "B নিয়ম মেনে cache থেকে key মুছে দেয় (delete-on-write)। Key তো এমনিতেই নেই, তাই এই DEL কিছুই করে না।",
  "এবার A জেগে উঠে নিজের হাতে থাকা পুরনো 80 cache-এ বসিয়ে দেয়। Database বলছে 75, cache বলছে 80।",
  "পরের সব request cache থেকে 80 পায়, TTL শেষ না হওয়া পর্যন্ত। কোনো error নেই, শুধু চুপচাপ ভুল দাম।",
  "Delayed double delete: B কিছুক্ষণ পরে (A-র মতো ধীর read শেষ হওয়ার মতো সময়) আবার DEL করে। পুরনো 80 মুছে যায়, পরের read database থেকে 75 আনে। TTL শেষ রক্ষাকবচ।",
];

/** Step-by-step: cache-aside read/write and the stale-set race (deep dive). */
export function Day017Race() {
  return (
    <StepThrough
      steps={STEPS}
      frames={STEPS.map((_, step) => (
        <div key={step} className="overflow-x-auto">
          <SequenceDiagram
            participants={PARTICIPANTS}
            messages={MESSAGES}
            activeStep={step}
          />
        </div>
      ))}
    />
  );
}
