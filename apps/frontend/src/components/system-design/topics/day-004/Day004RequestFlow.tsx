import {
  SequenceDiagram,
  StepThrough,
  type SequenceMessage,
  type SequenceParticipant,
} from "@/components/shared/diagram";

const PARTICIPANTS: SequenceParticipant[] = [
  { id: "client", kind: "client", label: "Mobile App" },
  { id: "api", kind: "server", label: "API Server" },
  { id: "check", kind: "server", label: "Auth + Validation" },
  { id: "db", kind: "database", label: "Shop DB" },
];

const MESSAGES: SequenceMessage[] = [
  { from: "client", to: "api", label: "POST /orders + token + JSON" },
  { from: "api", to: "check", label: "কে? অনুমতি? body ঠিক?" },
  { from: "check", to: "api", label: "✓ (ভুল হলে 401/403/422)", dashed: true },
  { from: "api", to: "db", label: "stock যাচাই + INSERT order" },
  { from: "db", to: "api", label: "order id = 42", dashed: true },
  {
    from: "api",
    to: "client",
    label: "201 Created · Location: /orders/42",
    dashed: true,
  },
  { from: "client", to: "api", label: "GET /orders/42" },
  { from: "api", to: "client", label: "200 OK + order JSON", dashed: true },
];

const STEPS = [
  "App একটা HTTP request পাঠায়: method POST, path /orders, Authorization header-এ token, আর body-তে JSON: কোন product, কয়টা, কোন ঠিকানায়।",
  "API আগে যাচাই করে: token আসল কিনা (কে আপনি), এই user order দিতে পারে কিনা, আর JSON-এ দরকারি field আছে কিনা, qty ধনাত্মক কিনা।",
  "সব ঠিক থাকলে এগোয়। ভুল হলে এখানেই থামে: token নেই → 401, অনুমতি নেই → 403, body ভুল → 400/422। Database-এ হাতই পড়ে না।",
  "এবার business rule: stock আছে কিনা দেখে order row লেখা হয়। Stock না থাকলে 409 Conflict-এর মতো একটা স্পষ্ট উত্তর।",
  "Database নতুন order-এর id দেয়। এই মুহূর্তে order সত্যিই তৈরি হলো।",
  "API উত্তর দেয় 201 Created, Location header-এ নতুন resource-এর ঠিকানা, আর body-তে order-এর JSON representation।",
  "পরে app order-এর অবস্থা জানতে ওই ঠিকানাতেই GET পাঠায়। প্রতিটা request নিজের মধ্যে সম্পূর্ণ, token আবার সাথে যায় (stateless)।",
  "API database থেকে পড়ে 200 OK আর JSON ফেরত দেয়। GET কিছু বদলায় না, তাই এটা যতবার খুশি পাঠানো নিরাপদ।",
];

/** Step-by-step: one request through the API (Plan doc Section 6.1, deep dive). */
export function Day004RequestFlow() {
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
