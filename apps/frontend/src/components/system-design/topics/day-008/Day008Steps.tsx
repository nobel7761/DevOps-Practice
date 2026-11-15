import {
  SequenceDiagram,
  StepThrough,
  type SequenceMessage,
  type SequenceParticipant,
} from "@/components/shared/diagram";

const PARTICIPANTS: SequenceParticipant[] = [
  { id: "a", kind: "client", label: "Client A" },
  { id: "n1", kind: "database", label: "Node 1" },
  { id: "n2", kind: "database", label: "Node 2" },
  { id: "b", kind: "client", label: "Client B" },
];

const MESSAGES: SequenceMessage[] = [
  { from: "a", to: "n1", label: "write balance = 300" },
  { from: "n1", to: "n2", label: "replicate 300 ✓" },
  { from: "a", to: "n1", label: "write balance = 100" },
  { from: "n1", to: "n2", label: "replicate ✕ (partition)", dashed: true },
  { from: "b", to: "n2", label: "read balance?" },
  { from: "n2", to: "b", label: "CP হলে: error / timeout", dashed: true },
  { from: "n2", to: "b", label: "AP হলে: 300 (পুরনো)", dashed: true },
  { from: "n1", to: "n2", label: "heal: জমে থাকা 100 sync" },
  { from: "n2", to: "b", label: "এখন: 100 ✓", dashed: true },
];

const STEPS = [
  "Client A, Node 1-এ balance = 300 লেখে।",
  "Node 1 সেটা Node 2-তে পাঠায়, Node 2 নিশ্চিত করে। দুই কপিই 300: consistent আর available দুটোই।",
  "Network ভাঙার পরে Client A আবার লেখে balance = 100। Node 1 নিজের কাছে লিখে রাখে।",
  "Node 1 পাঠাতে চায়, কিন্তু partition-এর কারণে পৌঁছায় না। এখন Node 1-এ 100, Node 2-এ 300।",
  "Client B, Node 2-এর কাছে balance চায়। Node 2 জানে না তার কপি পুরনো, শুধু জানে Node 1-এর খবর নেই।",
  "CP পথ: Node 2 নিশ্চিত হতে পারছে না, তাই error দেয় বা timeout পর্যন্ত অপেক্ষা করায়। ভুল তথ্য গেল না, কিন্তু Client B কাজ শেষ করতে পারল না।",
  "AP পথ: Node 2 নিজের কপি থেকে 300 দেয়। উত্তর মিলল, কিন্তু পুরনো। এই পথে Node 2 নতুন write-ও নিতে পারে, তখন দুই পাশে দুই ইতিহাস।",
  "Network জোড়া লাগল। Node 1 জমে থাকা update পাঠায়, Node 2 ধরে ফেলে। AP-তে দুই পাশে write হয়ে থাকলে এখানেই conflict মেটাতে হয়।",
  "এখন সবাই আবার 100 দেখে। Partition না থাকায় C আর A দুটোই ফিরে এলো।",
];

/** Step-by-step: write → partition → read on the other side → CP vs AP → heal. */
export function Day008Steps() {
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
