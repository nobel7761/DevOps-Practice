import {
  SequenceDiagram,
  StepThrough,
  type SequenceMessage,
  type SequenceParticipant,
} from "@/components/shared/diagram";

const PARTICIPANTS: SequenceParticipant[] = [
  { id: "a", kind: "client", label: "User A" },
  { id: "b", kind: "client", label: "User B" },
  { id: "edge", kind: "cdn", label: "Edge (PoP)" },
  { id: "origin", kind: "server", label: "Origin" },
];

const MESSAGES: SequenceMessage[] = [
  { from: "a", to: "edge", label: "GET /logo.svg" },
  { from: "edge", to: "origin", label: "MISS → GET" },
  {
    from: "origin",
    to: "edge",
    label: "200 · max-age=20 · ETag",
    dashed: true,
  },
  { from: "edge", to: "a", label: "200 · MISS (কপি রাখল)", dashed: true },
  { from: "b", to: "edge", label: "GET /logo.svg" },
  { from: "edge", to: "b", label: "200 · HIT", dashed: true },
  { from: "b", to: "edge", label: "২০s পরে GET" },
  { from: "edge", to: "origin", label: "If-None-Match: ETag" },
  { from: "origin", to: "edge", label: "304 Not Modified", dashed: true },
  { from: "edge", to: "b", label: "200 · REVALIDATED", dashed: true },
  { from: "a", to: "edge", label: "GET /app.7c21.js (নতুন)" },
  { from: "edge", to: "origin", label: "নতুন key → MISS" },
];

const STEPS = [
  "User A প্রথমবার logo.svg চাইল। Request DNS বা anycast দিয়ে কাছের edge-এ এলো।",
  "Edge-এর cache-এ এই key নেই (MISS)। Edge origin-কে চাইল।",
  "Origin file পাঠাল, সাথে নির্দেশ: Cache-Control: public, max-age=20, আর একটা ETag (file-এর fingerprint)।",
  "Edge User A-কে file দিল আর একটা কপি ২০ সেকেন্ডের জন্য রেখে দিল। User A-র জন্য এটা ধীর ছিল, origin পর্যন্ত যেতে হয়েছে।",
  "কয়েক সেকেন্ড পরে User B একই file চাইল।",
  "কপি এখনো তাজা: HIT। Origin কিছুই জানল না, আর User B পেল কাছের edge থেকে, কয়েক ms-এ।",
  "২০ সেকেন্ড পেরিয়েছে, কপির মেয়াদ শেষ। User B আবার চাইল।",
  "পুরো file আবার না চেয়ে edge জিজ্ঞেস করল: 'আমার কাছে এই ETag-এর কপি আছে, বদলেছে?' (If-None-Match)",
  "বদলায়নি: origin শুধু 304 Not Modified পাঠাল, body ছাড়া, কয়েকশো byte।",
  "Edge নিজের কপির মেয়াদ আবার বাড়িয়ে User B-কে দিল (REVALIDATED)। একটা round trip লাগল, কিন্তু file-এর bandwidth লাগল না।",
  "নতুন deploy-এ JS বদলেছে, build তার নাম দিয়েছে app.7c21.js। HTML এখন নতুন নামটা দেখায়।",
  "নতুন নাম মানে নতুন cache key, তাই edge প্রথমবারেই origin থেকে নতুনটা আনে। কোনো purge লাগল না, আর পুরনো app.3f9a.js cache-এ থেকে গেল rollback-এর জন্য।",
];

/** Step-by-step: MISS → origin fetch → HIT → TTL expiry → 304 → new versioned name. */
export function Day011RequestFlow() {
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
