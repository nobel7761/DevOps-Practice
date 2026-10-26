import {
  SequenceDiagram,
  StepThrough,
  type SequenceMessage,
  type SequenceParticipant,
} from "@/components/shared/diagram";

const PARTICIPANTS: SequenceParticipant[] = [
  { id: "phone", kind: "client", label: "Phone" },
  { id: "router", kind: "gateway", label: "Wi-Fi Router" },
  { id: "isp", kind: "external", label: "ISP" },
  { id: "internet", kind: "external", label: "Internet" },
  { id: "server", kind: "server", label: "Server" },
];

const MESSAGES: SequenceMessage[] = [
  { from: "phone", to: "router", label: "packet → 198.51.100.7:443" },
  { from: "router", to: "isp", label: "NAT: src = public IP" },
  { from: "isp", to: "internet", label: "IIG → undersea cable" },
  { from: "internet", to: "server", label: "hop → hop → hop" },
  { from: "server", to: "internet", label: "response packet", dashed: true },
  { from: "internet", to: "isp", label: "ফেরার পথ", dashed: true },
  { from: "isp", to: "router", label: "public IP:port-এ", dashed: true },
  { from: "router", to: "phone", label: "NAT table → phone", dashed: true },
];

const STEPS = [
  "Phone একটা packet বানায়: destination server-এর IP আর port 443। Server local network-এ নেই, তাই packet যায় default gateway, মানে বাসার Wi-Fi router-এর কাছে।",
  "Router packet-এর source private ঠিকানা (192.168.0.105) বদলে নিজের public IP বসায়, NAT table-এ লিখে রাখে, তারপর ISP-র network-এ পাঠায়।",
  "Destination দেশের বাইরে, তাই ISP traffic International Internet Gateway হয়ে undersea cable (বা স্থলপথের cable) ধরে বিদেশে পাঠায়।",
  "পথে অনেক router: প্রত্যেকে destination IP দেখে routing table মিলিয়ে শুধু পরের hop ঠিক করে। শেষে packet server-এর data center-এ পৌঁছায়, OS port 443 দেখে web server program-কে দেয়।",
  "Server request process করে (হয়তো database থেকে data এনে) response packet পাঠায়, destination আপনার router-এর public IP।",
  "Response আবার router থেকে router হয়ে ফেরে। ফেরার পথ যাওয়ার পথের মতোই হবে, এমন কোনো নিশ্চয়তা নেই।",
  "Packet ISP হয়ে আপনার router-এর public IP আর সেই port-এ পৌঁছায়।",
  "Router NAT table দেখে বোঝে এটা phone-এর connection, তাই ঠিকানা আবার private-এ বদলে phone-কে দেয়। একটা round trip শেষ।",
];

/** Step-by-step journey of one request and its response (Plan doc Section 6.1, deep dive). */
export function Day002Journey() {
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
