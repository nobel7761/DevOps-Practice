import {
  SequenceDiagram,
  StepThrough,
  type SequenceMessage,
  type SequenceParticipant,
} from "@/components/shared/diagram";

const PARTICIPANTS: SequenceParticipant[] = [
  { id: "producer", kind: "server", label: "Producer" },
  { id: "queue", kind: "queue", label: "Queue" },
  { id: "consumer", kind: "server", label: "Consumer" },
  { id: "dlq", kind: "queue", label: "DLQ" },
];

const MESSAGES: SequenceMessage[] = [
  { from: "producer", to: "queue", label: "publish (order #42)" },
  { from: "queue", to: "producer", label: "stored ✓", dashed: true },
  { from: "queue", to: "consumer", label: "deliver #42 (in-flight)" },
  { from: "consumer", to: "queue", label: "ack ✓ → delete", dashed: true },
  { from: "queue", to: "consumer", label: "deliver #43" },
  { from: "consumer", to: "queue", label: "✕ crash, ack আসেনি", dashed: true },
  { from: "queue", to: "consumer", label: "timeout শেষ → আবার deliver" },
  { from: "queue", to: "dlq", label: "৩ বার fail → DLQ" },
];

const STEPS = [
  "Producer order #42-এর message queue-তে পাঠায়।",
  "Broker message disk-এ লিখে নিশ্চিত করে। Producer এখন নিশ্চিন্তে user-কে উত্তর দিতে পারে।",
  "একজন consumer message নেয়। এটা এখন in-flight: অন্য কেউ নিতে পারবে না, কিন্তু মোছাও হয়নি।",
  "কাজ শেষে consumer ack দেয়। তখনই broker message মুছে দেয়।",
  "পরের message #43 consumer-এর কাছে যায়।",
  "Consumer কাজের মাঝে crash করল, ack আর এলো না। Message হারায়নি, broker অপেক্ষা করছে।",
  "Visibility timeout শেষ হওয়ায় message আবার দৃশ্যমান হলো, আর আবার deliver হলো।",
  "বারবার fail করছে (poison message)? Max retries-এর পরে message DLQ-তে সরে যায়, পরে দেখার জন্য।",
];

/** Step-by-step message lifecycle (Plan doc Section 6.1, deep dive). */
export function Day012Lifecycle() {
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
