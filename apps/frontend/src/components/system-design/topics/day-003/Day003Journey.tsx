import {
  SequenceDiagram,
  StepThrough,
  type SequenceMessage,
  type SequenceParticipant,
} from "@/components/shared/diagram";

const PARTICIPANTS: SequenceParticipant[] = [
  { id: "browser", kind: "client", label: "Browser" },
  { id: "resolver", kind: "server", label: "Resolver" },
  { id: "root", kind: "external", label: "Root" },
  { id: "tld", kind: "external", label: "TLD (.com)" },
  { id: "auth", kind: "external", label: "Authoritative" },
  { id: "server", kind: "server", label: "Web Server" },
];

const MESSAGES: SequenceMessage[] = [
  { from: "browser", to: "resolver", label: "A? www.boighor.com" },
  { from: "resolver", to: "root", label: "A? www.boighor.com" },
  {
    from: "root",
    to: "resolver",
    label: "referral: .com-এর server",
    dashed: true,
  },
  { from: "resolver", to: "tld", label: "A? www.boighor.com" },
  {
    from: "tld",
    to: "resolver",
    label: "referral: boighor-এর NS",
    dashed: true,
  },
  { from: "resolver", to: "auth", label: "A? www.boighor.com" },
  {
    from: "auth",
    to: "resolver",
    label: "A 198.51.100.20, TTL 300",
    dashed: true,
  },
  {
    from: "resolver",
    to: "browser",
    label: "198.51.100.20 (cache-এ রাখল)",
    dashed: true,
  },
  { from: "browser", to: "server", label: "TCP handshake → :443" },
  { from: "browser", to: "server", label: "TLS handshake, certificate যাচাই" },
  { from: "browser", to: "server", label: "GET /books  Host: www.boighor.com" },
  { from: "server", to: "browser", label: "200 OK + HTML", dashed: true },
  {
    from: "browser",
    to: "server",
    label: "GET style.css, app.js, ছবি (একই connection)",
  },
  { from: "server", to: "browser", label: "200 / 304 → render", dashed: true },
];

const STEPS = [
  'Enter চাপার পর browser আগে নিজের cache, তারপর OS-এর cache (আর /etc/hosts) দেখে। কোথাও নেই, তাই OS-এর stub resolver recursive resolver-কে বলে: "পুরো উত্তরটা এনে দাও।"',
  "Resolver-এর cache-এও নেই। সে root server-কে জিজ্ঞেস করে। (বাস্তবে .com-এর ঠিকানা প্রায় সবসময় cache-এ থাকে, তাই এই ধাপ খুব কমই লাগে।)",
  'Root নাম চেনে না, শুধু referral দেয়: ".com-এর TLD server-দের জিজ্ঞেস করো।" এটাই iterative query।',
  "Resolver এবার .com-এর TLD server-কে একই প্রশ্ন করে।",
  "TLD-ও উত্তর জানে না, কিন্তু জানে boighor.com-এর দায়িত্ব কোন name server-এর (NS record)। আবার referral।",
  "Resolver boighor.com-এর authoritative server-কে জিজ্ঞেস করে।",
  "Authoritative-এর কাছে আসল record: A 198.51.100.20, TTL 300। এটাই চূড়ান্ত উত্তর।",
  "Resolver উত্তরটা ৫ মিনিটের জন্য cache-এ রাখে আর browser-কে দেয়। পরের লাখো প্রশ্ন এখন cache থেকেই যাবে।",
  "IP পেয়ে browser server-এর 443 port-এ TCP connection খোলে। খরচ প্রায় এক round trip।",
  "TLS handshake: server certificate দেখায়, browser যাচাই করে সেটা সত্যিই www.boighor.com-এর আর বিশ্বস্ত CA-র সই করা কিনা। তারপর encryption-এর key ঠিক হয়।",
  "এখন আসল HTTP request: method GET, path, আর Host header-এ কোন site চাই। Cookie থাকলে সেটাও যায়।",
  "Server process করে 200 OK আর HTML পাঠায়, সাথে Content-Type, Cache-Control-এর মতো header।",
  "HTML পড়ে browser দেখে আরও CSS, JavaScript, ছবি লাগবে। Keep-alive থাকায় একই connection-এ request যায়, নতুন handshake লাগে না।",
  "সব এলে browser page আঁকে (render)। Cache-এ থাকা কোনো file না বদলালে server শুধু 304 দেয়, পুরো file আবার আসে না।",
];

/** Step-by-step URL → page journey (Plan doc Section 6.1, deep dive). */
export function Day003Journey() {
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
