import {
  SequenceDiagram,
  StepThrough,
  type SequenceMessage,
  type SequenceParticipant,
} from "@/components/shared/diagram";

const PARTICIPANTS: SequenceParticipant[] = [
  { id: "browser", kind: "client", label: "Browser" },
  { id: "proxy", kind: "gateway", label: "Forward Proxy" },
  { id: "origin", kind: "server", label: "example.com" },
];

const MESSAGES: SequenceMessage[] = [
  { from: "browser", to: "proxy", label: "CONNECT example.com:443" },
  { from: "proxy", to: "origin", label: "policy ✓ · DNS · TCP connect" },
  {
    from: "proxy",
    to: "browser",
    label: "200 Connection established",
    dashed: true,
  },
  { from: "browser", to: "origin", label: "TLS ClientHello (SNI)" },
  {
    from: "origin",
    to: "browser",
    label: "certificate: CN=example.com",
    dashed: true,
  },
  { from: "browser", to: "origin", label: "🔒 GET /account (encrypted)" },
  {
    from: "origin",
    to: "browser",
    label: "🔒 200 OK (encrypted)",
    dashed: true,
  },
];

const STEPS = [
  "Browser proxy-কে বলে: example.com-এর 443 port-এ একটা পাইপ খুলে দাও। Hostname আর port এখানে খোলা।",
  "Proxy নিয়ম দেখে (domain কি allowed? port কি 443?), নিজে DNS করে, server-এর সাথে TCP connection খোলে।",
  "Proxy বলে '200 Connection established'। এখন থেকে সে শুধু bytes এপাশ-ওপাশ করবে, না বুঝে।",
  "Browser tunnel-এর ভেতর দিয়ে সরাসরি server-এর সাথে TLS handshake শুরু করে।",
  "Certificate আসে আসল server-এর। Proxy মাঝে থেকেও তালা ভাঙেনি, তাই browser সন্তুষ্ট।",
  "আসল request (path, cookie, password) encrypted অবস্থায় tunnel দিয়ে যায়। Proxy এর কিছুই পড়তে পারে না।",
  "উত্তরও encrypted। Proxy-র log-এ থাকে শুধু 'CONNECT example.com:443', সময় আর কত bytes গেল।",
];

/** Step-by-step HTTPS request through a forward proxy (CONNECT tunnel). */
export function Day015ConnectFlow() {
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
