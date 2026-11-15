import {
  SequenceDiagram,
  StepThrough,
  type SequenceMessage,
  type SequenceParticipant,
} from "@/components/shared/diagram";

// Lost update: two sessions read the same stock, both write stock - 1 computed in the app.

const PARTICIPANTS: SequenceParticipant[] = [
  { id: "a", kind: "server", label: "Session A" },
  { id: "db", kind: "database", label: "Database" },
  { id: "b", kind: "server", label: "Session B" },
];

const MESSAGES: SequenceMessage[] = [
  { from: "a", to: "db", label: "SELECT stock → 10" },
  { from: "b", to: "db", label: "SELECT stock → 10" },
  { from: "a", to: "db", label: "UPDATE stock = 9; COMMIT" },
  { from: "b", to: "db", label: "UPDATE stock = 9; COMMIT" },
  { from: "db", to: "a", label: "stock = 9 (হওয়ার কথা 8) ✕", dashed: true },
];

const STEPS = [
  "Session A চা পাতার stock পড়ে: ১০। App-এ হিসাব করে, বিক্রির পরে হবে ৯।",
  "প্রায় একই সময়ে Session B-ও পড়ে: ১০, কারণ A এখনো কিছু লেখেনি। সে-ও হিসাব করে ৯।",
  "A লেখে stock = 9 আর commit করে।",
  "B লেখে stock = 9 আর commit করে। B জানে না যে A-র পড়া আর তার পড়া একই পুরনো মানের উপর।",
  "দুটো বিক্রি, কিন্তু stock কমল একটা: A-র update হারিয়ে গেল। সমাধান: stock = stock - 1 (atomic), বা SELECT ... FOR UPDATE, বা version check।",
];

/** Step-by-step lost update under Read Committed with read-modify-write in the app. */
export function Day010LostUpdate() {
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
