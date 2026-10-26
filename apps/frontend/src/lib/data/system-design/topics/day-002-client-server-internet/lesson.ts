// Day 2 · Client, Server ও Internet — introductory lesson (Day 60 goes deeper).

import type { SdLesson } from "@/lib/system-design/lesson.types";

export const day002Lesson: SdLesson = {
  topicId: "sd-day-002",
  day: 2,
  title: "Client, Server ও Internet",
  definition:
    "Client চায়, Server দেয়: একজন request পাঠায়, আরেকজন উত্তর দেয়, আর মাঝে Internet হলো অসংখ্য network জোড়া লাগানো রাস্তা, যেখান দিয়ে data ছোট ছোট packet-এ ভাগ হয়ে যায়।",

  objectives: [
    "Client আর Server যে machine না বরং ভূমিকা (role), আর request/response কিভাবে কাজ করে, উদাহরণ দিয়ে ব্যাখ্যা করতে পারবেন।",
    "ঢাকার একটা phone থেকে বিদেশের server পর্যন্ত একটা request-এর পথ (Wi-Fi router, ISP, undersea cable, router, server) এঁকে দেখাতে পারবেন।",
    "IP address, port, packet, NAT আর private/public IP কী, আর কেন এগুলো দরকার, সহজ ভাষায় বলতে পারবেন।",
    "Latency-র চারটা উৎস (propagation, transmission, queuing, processing) আলাদা করে হিসাব করতে পারবেন, আর বুঝবেন কেন দূরত্ব কমানো ছাড়া কিছু latency কমানো যায় না।",
    "কেন server কখনো client-এর পাঠানো data অন্ধভাবে বিশ্বাস করে না, আর thin বনাম thick client কখন বাছবেন, যুক্তি দিয়ে বলতে পারবেন।",
  ],

  prerequisites: [
    {
      day: 1,
      title: "সিস্টেম ডিজাইন আসলে কী?",
      href: "/course/system-design-a-z?milestone=sd-phase-01&module=sd-day-001",
    },
  ],

  problem: {
    markdown: `ধরুন আপনি ঢাকায় বসে একটা ছোট online বইয়ের দোকান বানালেন, নাম "বইঘর"। নিজের laptop-এ app চালালেন, browser-এ \`localhost:3000\` খুললেন, সব চমৎকার চলছে।

খুশি হয়ে চট্টগ্রামের বন্ধুকে link পাঠালেন: \`http://localhost:3000\`। বন্ধু খুলল, কিছুই এলো না। কারণ **localhost** মানে "এই machine নিজেই"। বন্ধুর laptop-এ localhost মানে বন্ধুর laptop, আপনার না।

তখন আপনি আরেকটা বুদ্ধি করলেন: পুরো app আর বইয়ের তালিকা (stock, দাম) সবার phone-এ install করিয়ে দিলেন। এবার তিনটা নতুন সমস্যা:

1. **Data এক জায়গায় নেই।** "আমার আছে বাংলার মুখ"-এর শেষ কপিটা সিলেটের রিনা আর খুলনার সুমন, দুজনেই একই সময়ে কিনে ফেলল। দুজনের phone-ই বলছিল "stock: 1"।
2. **বদল ছড়ায় না।** আপনি দাম ৩০০ থেকে ২৫০ করলেন, কিন্তু সেটা শুধু আপনার copy-তে। বাকি সবার phone-এ পুরনো দাম।
3. **কেউ চাইলে নিয়ম বদলে দিতে পারে।** Data যেহেতু user-এর phone-এ, একজন একটু চালাক user দাম ২৫০ থেকে ২৫ করে নিজের order পাঠিয়ে দিল।

সমস্যার মূলে একটাই জিনিস নেই: **একটা কেন্দ্রীয় জায়গা**, যেটা সবাই একই ঠিকানায় খুঁজে পায়, যেখানে data-র একটাই সত্য copy থাকে, আর যে নিজে নিয়ম যাচাই করে। এই জায়গাটাই **server**, আর সেখানে পৌঁছানোর রাস্তা **Internet**।`,
    diagrams: [
      {
        id: "day-002-before",
        caption:
          "আগে: প্রত্যেকের phone-এ আলাদা data, কেউ কারও সাথে মেলে না; আর laptop-এর localhost বন্ধুর কাছ থেকে পৌঁছানোই যায় না।",
        alt: "দুটো phone, প্রত্যেকটার পাশে নিজস্ব database যেখানে stock 1 লেখা; একটা laptop-এ localhost:3000, বন্ধুর phone থেকে সেখানে যাওয়ার লাল ভাঙা তীর।",
      },
    ],
  },

  analogy: {
    markdown: `**প্রথম ভাগ: ব্যাংকের counter (Client আর Server)**

আপনি সোনালী ব্যাংকের কোনো শাখায় গেলেন টাকা তুলতে। আপনি slip লিখে counter-এ দিলেন: "আমার account থেকে ৫,০০০ টাকা দিন।" এটাই **request**। Teller নিজের খাতা (system) দেখে নিশ্চিত হলেন আপনার balance আছে কিনা, তারপর টাকা দিলেন বা বললেন "balance নেই"। এটাই **response**।

খেয়াল করুন কয়েকটা জিনিস:
- **আপনি (Client)** চাইছেন, **teller (Server)** দিচ্ছেন। আপনি আগ বাড়িয়ে কথা শুরু করেন, teller অপেক্ষা করেন।
- আপনি যদি slip-এ লিখে দেন "আমার balance ১০ লাখ", teller সেটা বিশ্বাস করবেন না। নিজের খাতা দেখবেন। **Server client-এর কথায় চলে না।**
- একজন teller সারাদিন শত শত মানুষকে সামলান। **একটা server, অনেক client।**
- Teller আপনাকে মনে রাখেন না। পরের বার গেলে আবার slip, আবার চেক বই বা পরিচয় দেখাতে হয়। প্রতিটা request নিজের মধ্যেই সম্পূর্ণ (**stateless**)।

**দ্বিতীয় ভাগ: কুরিয়ার (Internet)**

এখন ধরুন আপনি ঢাকা থেকে রাজশাহীতে একটা বইয়ের বড় বাক্স পাঠাবেন। কুরিয়ার অফিস বাক্সটাকে কয়েকটা ছোট প্যাকেটে ভাগ করল, প্রতিটার গায়ে লিখল **পাঠানোর ঠিকানা** আর **প্রাপকের ঠিকানা**, সাথে "৩-এর ১, ৩-এর ২" এভাবে নম্বর।

প্যাকেটগুলো ঢাকার hub থেকে বগুড়ার hub হয়ে রাজশাহী গেল। একটা প্যাকেট হয়তো অন্য ট্রাকে অন্য পথে গেল। কোনো hub-এর মানুষ পুরো রাস্তা জানে না, শুধু জানে "রাজশাহীর জিনিস এই ট্রাকে তুলে দাও"। রাজশাহীতে প্রাপক নম্বর মিলিয়ে বাক্স আবার জোড়া দিলেন।

- **প্যাকেট = packet**, **ঠিকানা = IP address**, **hub = router**
- **ঠিকানার বাসা নম্বর হলো IP, আর ফ্ল্যাট নম্বর হলো port**: একই বিল্ডিং-এ অনেক ফ্ল্যাট, একই server-এ অনেক program
- দূর হলে সময় বেশি লাগে, যত দ্রুত ট্রাকই হোক। এটাই **distance latency**।`,
    diagrams: [
      {
        id: "day-002-analogy",
        caption:
          "উপরে ব্যাংক: customer slip দেয়, teller নিজের খাতা দেখে উত্তর দেয়। নিচে কুরিয়ার: বাক্স ভাগ হয়ে প্যাকেট hub থেকে hub-এ যায়।",
        alt: "উপরের সারিতে customer, counter-এর teller আর খাতা, মাঝে request আর response তীর। নিচের সারিতে ঢাকা থেকে বগুড়া hub হয়ে রাজশাহী পর্যন্ত তিনটা নম্বর দেওয়া প্যাকেট।",
      },
    ],
  },

  coreConcept: {
    markdown: `**Client** হলো যে কিছু চায় আর কথা শুরু করে। **Server** হলো যে অপেক্ষা করে, request শোনে আর উত্তর দেয়। Browser, mobile app, এমনকি আরেকটা backend service, সবাই client হতে পারে।

**সবচেয়ে জরুরি কথা: client আর server ভূমিকা (role), machine না।** আপনার laptop-এ \`npm run dev\` চালালে সেটা server। আবার আপনার backend যখন bKash-এর payment API call করে, তখন আপনার backend নিজেই client। একটা program একই সময়ে একজনের server আর আরেকজনের client হতে পারে।

**Request/Response:** Client একটা request পাঠায় ("বইয়ের তালিকা দাও"), server process করে একটা response ফেরত দেয় (তালিকা, বা "পাওয়া যায়নি")। Response না আসা পর্যন্ত client সাধারণত অপেক্ষা করে। এই আদান-প্রদানের ভাষা হলো **protocol**, যেমন HTTP। HTTP আর ঠিকানা খোঁজার DNS নিয়ে Day 3-এ বিস্তারিত।

**Internet** কোনো একটা বিশাল computer না। এটা **network-এর network**: আপনার বাসার Wi-Fi, আপনার **ISP** (Internet Service Provider, যে আপনাকে internet দেয়), দেশের বড় ISP-রা, বিদেশের network, data center, সবাই নিজেদের মধ্যে যুক্ত। প্রতিটা device-এর একটা **IP address** থাকে, আর data যায় ছোট ছোট **packet**-এ ভাগ হয়ে। পথে **router**-রা প্রতিটা packet দেখে ঠিক করে পরের ধাপে কোন দিকে পাঠাবে।

"বইঘর"-এর সমাধান তাহলে সোজা: app-এর data আর নিয়ম থাকবে একটা **server**-এ, যার একটা public ঠিকানা আছে। সবার phone শুধু **client**: দেখায়, জিজ্ঞেস করে, আর server-এর উত্তর মানে।

এতে তিনটা লাভ:
1. **একটাই সত্য (single source of truth):** stock আর দাম শুধু server-এর database-এ। শেষ কপি একজনই কিনতে পারবে।
2. **বদল সাথে সাথে সবার কাছে:** দাম বদলালে পরের request-এ সবাই নতুন দাম পায়।
3. **নিয়ম server-এ:** দাম, stock, ছাড় সব server হিসাব করে। Client যা-ই পাঠাক, server যাচাই করে।

**কেন server client-কে বিশ্বাস করে না?** কারণ client-এর code user-এর হাতে। App-এর ভেতরে যে দাম লেখা, browser-এর developer tools দিয়ে বা \`curl\` দিয়ে যে কেউ নিজের মতো request বানিয়ে পাঠাতে পারে। তাই client-এ validation শুধু user-এর সুবিধার জন্য (তাড়াতাড়ি ভুল দেখানো), নিরাপত্তার জন্য না। আসল যাচাই সবসময় server-এ।

**Stateless request/response:** HTTP-র মতো protocol-এ প্রতিটা request নিজের মধ্যেই সম্পূর্ণ, server আগের request মনে রাখতে বাধ্য না। তাই প্রতিটা request-এর সাথে client নিজের পরিচয় (যেমন একটা token বা cookie) পাঠায়। এর বড় সুবিধা: যেকোনো server যেকোনো request সামলাতে পারে, তাই পরে server বাড়ানো সহজ। (Stateful vs Stateless নিয়ে Day 14-এ গভীরে যাব।)

**এক server, অনেক client:** একটা server একই সময়ে হাজার হাজার client-এর request সামলায়। কিন্তু একটা machine-এর সীমা আছে। Client অনেক বেড়ে গেলে কী করতে হয়, সেটাই Day 5 (Scalability) আর Day 9 (Load Balancer)-এর গল্প।

**Thin vs thick client:** Client কতটা কাজ নিজে করবে, সেটা একটা design সিদ্ধান্ত।
- **Thin client:** প্রায় সব কাজ server-এ, client শুধু দেখায়। যেমন server-rendered web page।
- **Thick (fat) client:** অনেক কাজ client-এ, যেমন mobile app যেটা offline-এ চলে, বা browser game।
দুই ক্ষেত্রেই আসল নিয়ম আর সত্য data server-এ থাকে। পার্থক্য হলো কতটা হিসাব, rendering আর cache client-এ হবে।

এটা বিনামূল্যে না। এখন সবকিছু server-এর উপর নির্ভর করে: server বন্ধ মানে কেউ কিছু পায় না (Day 6: Availability), আর প্রতিটা কাজে network-এর যাওয়া-আসার সময় যোগ হয় (Day 7: Latency)।

এখন এটুকু জানলেই চলবে। Client-Server architecture-এর ভেতরের layer, tier আর pattern নিয়ে Day 60-এ গভীরে যাব।`,
    diagrams: [
      {
        id: "day-002-main",
        caption:
          "পরে: phone আর laptop শুধু client; request Wi-Fi router, ISP আর undersea cable হয়ে Singapore-এর server-এ যায়, response একই পথে ফেরে।",
        alt: "দুটো client (ঢাকার phone আর laptop) একটা Wi-Fi router-এ যুক্ত, router থেকে ISP, ISP থেকে Internet (undersea cable), সেখান থেকে Singapore-এর server, server-এর পাশে database।",
        downloadable: true,
      },
      {
        id: "day-002-before-after",
        caption:
          "পাশাপাশি: সবার কাছে আলাদা data বনাম এক server-এ একটাই সত্য; দাম বদলালে পরের request-এই সবাই নতুনটা পায়।",
        alt: "উপরে আগের design, যেখানে প্রতিটা phone-এর নিজের database; নিচে পরের design, যেখানে সব client Internet হয়ে এক server আর এক database-এ যায়।",
      },
    ],
  },

  deepDive: [
    {
      title: "IP address আর port: কোন machine, কোন program",
      markdown: `Packet ঠিক জায়গায় পৌঁছাতে দুটো জিনিস লাগে।

**IP address** বলে কোন machine (আরও ঠিক করে বললে, কোন network interface)। দুই রকম:
- **IPv4**: ৩২-bit, যেমন \`203.0.113.25\`। মোট প্রায় ৪৩০ কোটি (2³²) ঠিকানা, যেটা আজকের পৃথিবীর device-সংখ্যার তুলনায় কম। IANA-র হাতে থাকা নতুন IPv4 block-এর ভাণ্ডার ২০১১ সালেই শেষ হয়ে গেছে।
- **IPv6**: ১২৮-bit, যেমন \`2001:db8::1\`। ঠিকানা কার্যত অফুরন্ত, ধীরে ধীরে চালু হচ্ছে।

**Port** বলে ওই machine-এর কোন program। Port একটা ১৬-bit সংখ্যা, তাই 0 থেকে 65535। প্রচলিত কিছু: HTTP **80**, HTTPS **443**, SSH **22**, PostgreSQL **5432**। Server একটা নির্দিষ্ট port-এ "শোনে" (listen)।

Client-এরও একটা port থাকে, কিন্তু সেটা operating system নিজে থেকে একটা অস্থায়ী নম্বর দেয় (**ephemeral port**, যেমন 52814)। তাই একটা connection আসলে চিহ্নিত হয় পাঁচটা জিনিস দিয়ে, যাকে বলে **5-tuple**:

\`(protocol, client IP, client port, server IP, server port)\`

এজন্যই একই laptop-এ দশটা browser tab একই server-এর 443 port-এ যুক্ত হলেও সবার connection আলাদা থাকে: প্রত্যেকের client port আলাদা।

Subnet, CIDR (\`/24\` মানে কী) আর port-এর বিস্তারিত Day 38-এ।`,
      diagrams: [
        {
          id: "day-002-packet",
          caption:
            "একটা packet-এর ভেতরে: IP header বলে কোন machine, TCP header বলে কোন program, তারপর আসল data।",
          alt: "একটা লম্বা বাক্স তিন ভাগে: বামে IP header (source IP, destination IP, TTL), মাঝে TCP header (source port, destination port, sequence number), ডানে payload যেখানে GET /books লেখা।",
        },
      ],
    },
    {
      title: "Packet, router আর একটা request-এর আসল যাত্রা",
      markdown: `ঢাকার একটা phone থেকে Singapore-এর server-এ request গেলে মোটামুটি এই পথ:

1. **Phone → Wi-Fi router:** Phone জানে server তার নিজের local network-এ নেই, তাই packet দেয় **default gateway**-কে, মানে বাসার router-কে।
2. **Router → ISP:** বাসার router packet পাঠায় ISP-র network-এ (fiber বা অন্য কোনো link দিয়ে)। Mobile data হলে phone সরাসরি mobile operator-এর network-এ যায়।
3. **ISP → দেশের বাইরে:** বিদেশে যাওয়া traffic বাংলাদেশে সাধারণত International Internet Gateway (IIG) হয়ে **undersea (submarine) cable** বা ভারতের ভেতর দিয়ে যাওয়া স্থলপথের cable ধরে দেশের বাইরে যায়।
4. **অনেক router, অনেক network:** পথে প্রতিটা router packet-এর destination IP দেখে নিজের **routing table** মিলিয়ে পরের hop ঠিক করে। কোনো router পুরো পথ জানে না, শুধু "পরের ধাপ"।
5. **Server:** Server-এর data center-এ packet পৌঁছায়, operating system port দেখে ঠিক program-কে দেয়।
6. **Response:** একই রকম যাত্রা উল্টো দিকে। মজার ব্যাপার, ফেরার পথ যাওয়ার পথের মতো হবেই, এমন কোনো নিশ্চয়তা নেই।

**Network-এর network কিভাবে জোড়া লাগে?** প্রতিটা বড় network (একটা ISP, একটা cloud company) হলো একটা **Autonomous System (AS)**। AS-রা নিজেদের মধ্যে **BGP** (Border Gateway Protocol) দিয়ে জানায় "এই IP-গুলো আমার কাছে পাওয়া যায়"। কোনো কেন্দ্রীয় নিয়ন্ত্রক নেই; হাজারো network-এর পারস্পরিক চুক্তিতেই Internet চলে। অনেক দেশে স্থানীয় ISP-রা একটা **IXP** (Internet Exchange Point)-এ যুক্ত হয়, যাতে দেশের ভেতরের traffic বিদেশ ঘুরে না আসে।

**TTL কেন দরকার?** কোনো ভুল routing-এ packet যেন চিরকাল ঘুরতে না থাকে, তাই IP header-এ একটা **TTL** (Time To Live) সংখ্যা থাকে। প্রতিটা router এক কমায়, শূন্য হলে packet ফেলে দিয়ে পাঠানোকে জানায়। \`traceroute\` ঠিক এই কৌশলেই পথের প্রতিটা router খুঁজে বের করে (Lab-এ চালিয়ে দেখবেন)।

**বড় data কি একবারে যায়?** না। সাধারণ Ethernet-এ একটা packet প্রায় ১৫০০ byte-এর বেশি হয় না (**MTU**)। ১ MB-র একটা ছবি তাই কয়েকশো packet-এ ভাগ হয়, আর অন্য প্রান্তে আবার জোড়া লাগে।`,
      diagrams: [
        {
          id: "day-002-journey",
          caption:
            "ধাপে ধাপে: phone থেকে Wi-Fi router, ISP, undersea cable হয়ে server, তারপর response-এর ফেরা।",
          alt: "Phone, Wi-Fi Router, ISP, Internet আর Server-এর মধ্যে request আর response packet-এর আদান-প্রদানের sequence diagram।",
        },
      ],
    },
    {
      title: "TCP আর UDP: packet পৌঁছানোর দায়িত্ব কে নেয়?",
      markdown: `IP শুধু চেষ্টা করে packet পৌঁছাতে (**best effort**)। Packet হারাতে পারে, দুবার আসতে পারে, উল্টো ক্রমে আসতে পারে। এর উপরে দুটো জনপ্রিয় protocol দুই রকম প্রতিশ্রুতি দেয়:

- **TCP:** আগে connection তৈরি করে (**3-way handshake**: SYN → SYN-ACK → ACK), তারপর প্রতিটা byte-এর হিসাব রাখে। হারানো packet আবার পাঠায়, ক্রম ঠিক করে দেয়। Web page, API, database connection সাধারণত TCP-র উপর।
- **UDP:** কোনো connection নেই, কোনো নিশ্চয়তা নেই, শুধু পাঠিয়ে দেয়। বিনিময়ে কম overhead আর দেরি কম। Video call, online game, DNS query-তে ব্যবহার হয়, যেখানে পুরনো packet দেরিতে আসার চেয়ে না আসাই ভালো।

System design-এ এর একটা সরাসরি প্রভাব: TCP handshake-এ data পাঠানোর আগেই একটা পুরো **round trip** (RTT) খরচ হয়। Singapore-এর server-এর RTT ৬০ms হলে প্রথম byte পাঠানোর আগেই ৬০ms চলে গেল, HTTPS হলে TLS handshake-এ আরও যোগ হয়। এজন্যই connection বারবার নতুন না খুলে আবার ব্যবহার (**keep-alive**, connection pool) করা হয়।

(নতুন HTTP/3 আসলে UDP-র উপর বানানো QUIC protocol ব্যবহার করে, এই handshake-এর খরচ কমাতে। সেটা Day 42-এ।) TCP vs UDP-এর পুরো তুলনা Day 39-এ।`,
    },
    {
      title:
        "NAT: private IP, public IP আর কেন আপনার phone-কে কেউ সরাসরি ডাকতে পারে না",
      markdown: `IPv4 ঠিকানা কম, তাই বাসার প্রতিটা device-কে আলাদা public IP দেওয়া সম্ভব না। সমাধান: **private IP**। কিছু নির্দিষ্ট range শুধু local network-এর ভেতরে ব্যবহারের জন্য রাখা (RFC 1918):

- \`10.0.0.0/8\`
- \`172.16.0.0/12\`
- \`192.168.0.0/16\`

আপনার phone-এর IP হয়তো \`192.168.0.105\`। পৃথিবীর লাখো বাসায় ঠিক এই ঠিকানা আছে, আর তাতে কোনো সমস্যা নেই, কারণ এই ঠিকানা Internet-এ কখনো যায় না।

**NAT (Network Address Translation)** কিভাবে কাজ করে: বাসার router-এর একটা **public IP** থাকে। Phone থেকে packet বের হওয়ার সময় router source ঠিকানা \`192.168.0.105:52814\` বদলে নিজের \`203.0.113.25:40001\` বসায়, আর একটা **translation table**-এ লিখে রাখে কোনটা কার। Response \`203.0.113.25:40001\`-এ ফিরলে table দেখে আবার phone-এর কাছে পাঠায়।

এর তিনটা গুরুত্বপূর্ণ ফল:
1. **Inbound connection সরাসরি আসে না।** Table-এ entry তৈরি হয় শুধু ভেতর থেকে কেউ কথা শুরু করলে। বাইরের কেউ হঠাৎ আপনার phone-কে ডাকতে চাইলে router জানেই না কাকে দেবে। তাই phone সাধারণত server হতে পারে না, আর server-এর দরকার একটা public, স্থির ঠিকানা।
2. **Server push-এর জন্য client-কেই connection খোলা রাখতে হয়।** Chat বা notification-এ phone আগে server-এর সাথে connection খুলে রাখে, যাতে server সেই পথেই খবর পাঠাতে পারে (Day 43: WebSockets)।
3. **অনেক user এক IP-এর পেছনে।** অনেক ISP আর mobile operator **CGNAT** (Carrier-Grade NAT, \`100.64.0.0/10\` range) ব্যবহার করে, মানে হাজারো গ্রাহক একই public IP শেয়ার করে। তাই server-এ "এক IP থেকে বেশি request = attacker" ধরে নিয়ে block করলে একটা পুরো এলাকার নিরীহ user আটকে যেতে পারে (Day 18: Rate Limiting)।

Cloud-এও একই ধারণা: VPC-র ভেতরে server-দের private IP, বাইরে শুধু load balancer-এর public IP।`,
      diagrams: [
        {
          id: "day-002-nat",
          caption:
            "NAT: বাসার router private ঠিকানা বদলে নিজের public ঠিকানা বসায়, আর table-এ মনে রাখে উত্তর কার কাছে যাবে।",
          alt: "বামে দুটো device-এর private IP আর port, মাঝে router-এর NAT translation table যেখানে প্রতিটা private ঠিকানা একটা public port-এর সাথে জোড়া, ডানে Internet-এ একটাই public IP।",
        },
      ],
    },
    {
      title: "Latency কোথা থেকে আসে: চারটা উৎস",
      markdown: `একটা packet-এর মোট দেরি মোটামুটি চারটা অংশের যোগফল:

| উৎস | কী | কী দিয়ে কমে |
|---|---|---|
| **Propagation** | সংকেত তারের ভেতর দিয়ে যেতে যে সময় লাগে | শুধু দূরত্ব কমিয়ে (কাছের server, CDN) |
| **Transmission** | Packet-এর সব bit লাইনে তুলে দিতে যে সময় | বেশি bandwidth, ছোট data |
| **Queuing** | ব্যস্ত router বা server-এ লাইনে অপেক্ষা | কম ভিড়, বেশি capacity |
| **Processing** | Router-এর header দেখা, server-এর আসল কাজ | দ্রুত code, cache |

**Propagation-এর হিসাব:** Fiber-এর ভেতরে আলো চলে মোটামুটি **২,০০,০০০ km/s** (শূন্যস্থানের প্রায় দুই-তৃতীয়াংশ), মানে প্রতি ১,০০০ km-এ প্রায় **৫ms**।
- ঢাকা থেকে Singapore সরলরেখায় প্রায় ২,৯০০ km। এক দিকে ~১৪.৫ms, যাওয়া-আসা (RTT) কমপক্ষে ~২৯ms।
- ঢাকা থেকে আমেরিকার পূর্ব উপকূল প্রায় ১২,৫০০ km-এর মতো। RTT কমপক্ষে ~১২৫ms।

বাস্তবে cable সরলরেখায় যায় না, পথে router আর ভিড় আছে, তাই আসল RTT এর চেয়ে বেশি। কিন্তু মূল কথা: **এই নিচের সীমা কোনো টাকা বা ভালো code দিয়ে ভাঙা যায় না।** পদার্থবিজ্ঞানের নিয়ম।

**Transmission-এর হিসাব:** ১ MB (৮ Mbit) data ৮ Mbps লাইনে তুলতে লাগে ১ সেকেন্ড, ১০০ Mbps-এ ০.০৮ সেকেন্ড। Bandwidth বাড়ালে এটা কমে, কিন্তু propagation একটুও কমে না।

**কেন round trip গুনতে হয়?** একটা page খুলতে যদি পরপর ৪টা round trip লাগে (DNS, TCP, TLS, আসল request), আর RTT হয় ১৫০ms, তাহলে server একটুও সময় না নিলেও ৬০০ms চলে গেল। তাই system design-এ একটা বড় কৌশল হলো **round trip-এর সংখ্যা কমানো** আর **data user-এর কাছে নিয়ে যাওয়া**, যেটা Day 11-এর CDN ঠিক করে।

Latency আর throughput-এর পার্থক্য Day 7-এ আরও পরিষ্কার হবে।`,
    },
    {
      title: "Client-Server-এর বিকল্প: Peer-to-Peer (P2P)",
      markdown: `Client-server-এ ভূমিকা ভাগ করা: কেউ চায়, কেউ দেয়। **Peer-to-peer**-এ প্রতিটা machine (peer) একই সাথে client আর server। প্রত্যেকে অন্যের কাছ থেকে নেয়, আবার অন্যকে দেয়।

উদাহরণ: **BitTorrent**-এ একটা বড় file-এর টুকরো অনেক peer-এর কাছে ছড়ানো থাকে, আর প্রত্যেকে একাধিক peer থেকে টুকরো নিয়ে আবার অন্যকে দেয়। যত বেশি মানুষ download করে, তত বেশি মানুষ upload-ও করে, তাই জনপ্রিয় file দ্রুত হয়। Video call-এ (**WebRTC**) দুজন user-এর মধ্যে media সম্ভব হলে সরাসরি যায়।

**P2P-এর লাভ:** কেন্দ্রীয় server-এর bandwidth খরচ কম, একটা server পড়লে সব বন্ধ হয় না, user বাড়লে capacity-ও বাড়ে।

**P2P-এর কষ্ট:**
- **NAT:** উপরে দেখলাম, বেশিরভাগ device-কে বাইরে থেকে সরাসরি ডাকা যায় না। তাই WebRTC-কে **STUN** দিয়ে নিজের public ঠিকানা জানতে হয়, আর কাজ না হলে **TURN** server দিয়ে relay করতে হয়, যেটা আসলে আবার একটা server।
- **বিশ্বাস:** কোন peer সৎ? কে ভুল data দিচ্ছে? কেন্দ্রীয় নিয়ন্ত্রণ নেই বলে যাচাই কঠিন।
- **Consistency:** "শেষ কপিটা কে কিনল" ধরনের প্রশ্নে একটা সত্য ঠিক করা খুব কঠিন।

তাই "বইঘর"-এর মতো app-এ, যেখানে টাকা, stock আর একটাই সত্য দরকার, client-server স্বাভাবিক পছন্দ। আর বাস্তবে বেশিরভাগ P2P system-ও খোঁজা আর পরিচয়ের জন্য কিছু server রাখে (যেমন BitTorrent tracker বা WebRTC-র signaling server)।

P2P আর decentralization-এর trade-off নিয়ে Day 114-এ গভীরে যাব।`,
      diagrams: [
        {
          id: "day-002-p2p",
          caption:
            "পাশাপাশি: client-server-এ সবাই এক server-এর কাছে যায়; peer-to-peer-এ প্রত্যেকে একে অপরের সাথে আদান-প্রদান করে।",
          alt: "উপরে তিনটা client একটা server-এর দিকে তীর; নিচে চারটা peer, প্রত্যেকটা অন্যদের সাথে দুই দিকের তীরে যুক্ত।",
        },
      ],
    },
  ],

  tradeOffs: {
    markdown: `**Client-server কখন ঠিক:** যেখানে একটা সত্য data দরকার (টাকা, stock, account), নিয়ম কেন্দ্রীয়ভাবে প্রয়োগ করতে হবে, আর client-কে বিশ্বাস করা যায় না। প্রায় সব business app এরকম।

**কখন ভাবতে হবে:** একই data বিশাল সংখ্যক মানুষকে বিতরণ করতে হলে (বড় file, live video) একটা server-এ খরচ আর bandwidth বিশাল; তখন CDN (Day 11) বা P2P সাহায্য করে। আর user-রা server থেকে অনেক দূরে থাকলে propagation latency কমাতে server-কেই user-এর কাছে নিতে হয় (কাছের region, edge)।

**Client কতটা "মোটা" হবে, তার trade-off:**`,
    table: {
      headers: ["বিষয়", "Thin client", "Thick client"],
      rows: [
        [
          "কাজ কোথায় হয়",
          "প্রায় সব server-এ; client শুধু দেখায়",
          "অনেক কাজ (rendering, হিসাব, cache) client-এ",
        ],
        [
          "উদাহরণ",
          "Server-rendered web page, পুরনো ধাঁচের admin panel",
          "Offline-চলা mobile app, browser-এ design tool, game",
        ],
        ["Network না থাকলে", "কিছুই চলে না", "অনেকটাই চলে, পরে sync করে"],
        [
          "Update ছড়ানো",
          "Server-এ deploy করলেই সবাই নতুনটা পায়",
          "User app update না করলে পুরনো version চলতে থাকে",
        ],
        [
          "Server-এর উপর চাপ",
          "বেশি: প্রতিটা ছোট কাজে request",
          "কম: অনেক কাজ local-এ",
        ],
        [
          "User-এর device",
          "দুর্বল device-এও চলে",
          "ভালো CPU/memory লাগে, battery খরচ বেশি",
        ],
        [
          "নিরাপত্তা",
          "Logic লুকানো, server-এ",
          "Client code যে কেউ খুলে দেখতে পারে; তবুও আসল যাচাই server-এ রাখতেই হবে",
        ],
        [
          "Interaction-এর গতি",
          "প্রতিটা click-এ round trip, দূরে থাকলে ধীর",
          "তাৎক্ষণিক, network-এর অপেক্ষা কম",
        ],
      ],
    },
  },

  industry: {
    markdown: `- **বাংলাদেশের সমুদ্রপথের যোগাযোগ:** বাংলাদেশ আন্তর্জাতিক Internet-এ যুক্ত মূলত submarine cable দিয়ে। **SEA-ME-WE 4** cable-এর landing station কক্সবাজারে, আর **SEA-ME-WE 5**-এর কুয়াকাটায়; এগুলো চালায় সরকারি প্রতিষ্ঠান Bangladesh Submarine Cables PLC (BSCPLC, আগের নাম BSCCL)। এর পাশাপাশি ভারতের ভেতর দিয়ে স্থলপথের cable (**ITC**, International Terrestrial Cable) দিয়েও bandwidth আসে। একটা cable কাটা পড়লে বা মেরামতে গেলে দেশের Internet ধীর হয়ে যাওয়ার খবর এজন্যই আসে।
- **Big tech-এর নিজের cable:** Google নিজের অর্থায়নে submarine cable বানিয়েছে, যেমন আমেরিকা থেকে চিলি পর্যন্ত **Curie** আর আমেরিকা থেকে ফ্রান্স পর্যন্ত **Dunant**। Meta আফ্রিকা ঘিরে **2Africa** cable consortium-এর অংশ। কারণ তাদের data center-দের মধ্যে আর user পর্যন্ত বিশাল traffic, আর latency ও নির্ভরযোগ্যতা নিজেদের হাতে রাখা।
- **Cloud region বাছাই:** AWS, Google Cloud, Azure সবাই পৃথিবীর বিভিন্ন জায়গায় **region** রাখে, যেমন AWS-এর Singapore (\`ap-southeast-1\`) আর Mumbai (\`ap-south-1\`)। বাংলাদেশের user-দের জন্য server বানালে দূরের region-এর চেয়ে কাছের region-এ propagation latency স্বাভাবিকভাবেই কম।
- **NAT সবখানে:** বাসার router থেকে mobile operator-এর **CGNAT**, আর cloud-এর VPC-তে **NAT Gateway** (যেমন AWS NAT Gateway), যাতে private server বাইরে request পাঠাতে পারে কিন্তু বাইরে থেকে কেউ সরাসরি ঢুকতে না পারে।
- **Thick client-এর উদাহরণ:** Figma তাদের design editor-এর core C++-এ লিখে WebAssembly দিয়ে browser-এ চালায়, যাতে ভারী rendering client-এর machine-এই হয়। তবুও file-এর সত্য copy আর collaboration server-এ।
- **P2P আর NAT traversal:** Browser-এর video call **WebRTC** দিয়ে চলে, যেটা NAT পার হতে **STUN** আর **TURN** (IETF standard) ব্যবহার করে।

জনপ্রিয় tool, যেগুলো এই lesson-এ লাগে: \`ping\`, \`traceroute\` (Windows-এ \`tracert\`), \`curl\`, \`nc\` (netcat), \`ip\`/\`ifconfig\`, আর Wireshark (packet চোখে দেখার জন্য)।

*উৎস: RFC 1918 (private address), RFC 6598 (CGNAT shared address space), RFC 8489 (STUN), RFC 8656 (TURN), IANA-র IPv4 address space ঘোষণা (২০১১); BSCPLC-এর প্রকাশিত তথ্য (SEA-ME-WE 4/5 landing station); Google Cloud blog (Curie, Dunant cable ঘোষণা); Meta engineering/newsroom (2Africa); AWS documentation (Regions, NAT Gateway); Figma engineering blog (WebAssembly)।*`,
  },

  mistakes: [
    {
      mistake:
        '"Server মানে একটা বড় শক্তিশালী machine" ভাবা। ফলে বোঝা যায় না কেন backend নিজেই অন্য API-র client।',
      fix: "Client আর server-কে ভূমিকা হিসেবে ভাবুন: যে কথা শুরু করে সে client, যে শোনে আর উত্তর দেয় সে server। একই program দুই ভূমিকাই নিতে পারে।",
    },
    {
      mistake:
        "Validation শুধু frontend-এ রাখা, আর server-এ client-এর পাঠানো দাম, discount বা userId সরাসরি মেনে নেওয়া।",
      fix: "Client-এর validation শুধু user-এর সুবিধার জন্য। দাম, অনুমতি, stock সবকিছু server নিজে database থেকে হিসাব ও যাচাই করবে।",
    },
    {
      mistake:
        "Bandwidth বাড়ালেই latency কমবে ধরে নেওয়া। দূরের server-এর জন্য ১ Gbps line কিনেও page ধীর থাকে।",
      fix: "ছোট request-এ propagation আর round trip-এর সংখ্যাই মূল। Server বা content user-এর কাছে আনুন (কাছের region, CDN), আর round trip কমান।",
    },
    {
      mistake:
        "\`localhost\` বা private IP (\`192.168.x.x\`) বাইরের কাউকে দিয়ে ভাবা যে সে পৌঁছাতে পারবে।",
      fix: "localhost মানে নিজের machine, private IP শুধু local network-এ চলে। বাইরে থেকে পৌঁছাতে public IP/domain লাগবে (cloud server, বা পরীক্ষার জন্য tunnel)।",
    },
    {
      mistake:
        "এক IP থেকে বেশি request এলেই একজন user বা attacker ধরে নিয়ে block করা।",
      fix: "CGNAT, office বা university network-এ হাজারো user এক public IP শেয়ার করে। Rate limit যতটা সম্ভব user/token ধরে করুন, IP শুধু একটা সংকেত হিসেবে।",
    },
    {
      mistake:
        "ধরে নেওয়া যে server আগের request মনে রাখবে, তাই দ্বিতীয় request-এ পরিচয় না পাঠানো।",
      fix: "HTTP stateless; প্রতিটা request-এ token বা cookie পাঠান, যাতে যেকোনো server request-টা একা বুঝতে পারে।",
    },
  ],

  lab: [
    {
      title: "নিজের private আর public IP দেখুন",
      markdown: `প্রথমে নিজের machine-এর private IP:

\`\`\`bash
# macOS
ipconfig getifaddr en0
# Linux
ip -4 addr show | grep inet
# Windows (PowerShell)
ipconfig
\`\`\`

সম্ভবত \`192.168.x.x\` বা \`10.x.x.x\` দেখবেন, মানে RFC 1918-এর private range।

এবার বাইরের দুনিয়া আপনাকে কোন ঠিকানায় দেখে:

\`\`\`bash
curl https://api.ipify.org; echo
\`\`\`

দুটো আলাদা হলে আপনি NAT-এর পেছনে আছেন। Router-এর admin page-এ WAN IP দেখে মিলিয়ে নিন: WAN IP যদি \`100.64.x.x\` থেকে \`100.127.x.x\`-এর মধ্যে হয়, তাহলে ISP আবার CGNAT করছে।`,
    },
    {
      title: "কাছের আর দূরের server-এর latency মাপুন",
      markdown: `\`ping\` প্রতিটা packet-এর round trip time (RTT) দেখায়:

\`\`\`bash
ping -c 5 1.1.1.1
ping -c 5 google.com
\`\`\`

(Windows-এ \`-c\`-এর বদলে \`-n\`।) \`time=\` অংশটা RTT। এবার পথের router-গুলো দেখুন:

\`\`\`bash
# macOS / Linux
traceroute google.com
# Windows
tracert google.com
\`\`\`

প্রতিটা লাইন একটা hop, মানে একটা router। প্রথম hop সাধারণত আপনার বাসার router (\`192.168.x.1\`), তারপর ISP-র router। কোনো hop-এ সময় হঠাৎ অনেক বেড়ে গেলে সেখানে সম্ভবত লম্বা দূরত্ব (যেমন সমুদ্র পার হওয়া)। কিছু লাইনে \`* * *\` দেখা স্বাভাবিক; অনেক router এই ধরনের probe-এর উত্তর দেয় না।

Linux-এ \`traceroute\` না থাকলে: \`sudo apt install traceroute\`।`,
    },
    {
      title: "নিজের server চালান, অনেক client থেকে request পাঠান",
      markdown: `Docker দিয়ে একটা nginx web server চালান, host-এর 8080 port-কে container-এর 80 port-এর সাথে জুড়ে:

\`\`\`bash
docker run -d --name myserver -p 8080:80 nginx:1.27-alpine
\`\`\`

এখন তিনটা আলাদা "client" থেকে request পাঠান: browser-এ \`http://localhost:8080\` খুলুন, আর terminal-এ:

\`\`\`bash
curl -s -o /dev/null -w "status: %{http_code}\\n" http://localhost:8080
curl -s -A "BoiGhor-App/1.0" -o /dev/null -w "status: %{http_code}\\n" http://localhost:8080
\`\`\`

Server-এর log দেখুন:

\`\`\`bash
docker logs myserver
\`\`\`

প্রতিটা লাইন একটা request: কোন ঠিকানা থেকে এলো, কোন path, কোন status, আর client নিজেকে কী বলে পরিচয় দিল (User-Agent)। লক্ষ করুন দ্বিতীয় curl-এ User-Agent আমরা নিজেরাই বানিয়ে দিয়েছি। **Client যা খুশি পাঠাতে পারে**, এজন্যই server client-এর দাবি বিশ্বাস করে না।

আরও লক্ষ করুন, client-এর ঠিকানা আপনার আসল IP না, বরং \`172.17.0.1\` বা এর মতো কোনো private ঠিকানা, কারণ Docker মাঝখানে নিজের network দিয়ে packet পৌঁছে দিচ্ছে। NAT-এর পেছনে server যে client-এর আসল ঠিকানা দেখে না, এটা তারই ছোট উদাহরণ।`,
    },
    {
      title: "একটা request-এর সময় কোথায় যায়, ভাগ করে দেখুন",
      markdown: `\`curl\`-এর \`-w\` দিয়ে প্রতিটা ধাপের সময় দেখা যায় (সব সংখ্যা শুরু থেকে জমা সময়, সেকেন্ডে):

\`\`\`bash
curl -s -o /dev/null -w "dns: %{time_namelookup}\\ntcp: %{time_connect}\\ntls: %{time_appconnect}\\nfirst byte: %{time_starttransfer}\\ntotal: %{time_total}\\n" https://www.google.com
\`\`\`

- \`dns\`: নাম থেকে IP খুঁজতে (Day 3)
- \`tcp\` − \`dns\`: TCP handshake, প্রায় এক RTT
- \`tls\` − \`tcp\`: HTTPS-এর TLS handshake
- \`first byte\` − \`tls\`: request পাঠানো + server-এর processing + প্রথম byte ফেরা

একই command আপনার local server-এ (\`http://localhost:8080\`) চালান। সেখানে প্রায় সব সংখ্যা শূন্যের কাছাকাছি, কারণ দূরত্ব নেই। পার্থক্যটাই network-এর খরচ।`,
    },
    {
      title: "Request আসলে শুধু লেখা: netcat দিয়ে হাতে বানান",
      markdown: `TCP connection খুলে নিজে হাতে HTTP request লিখে পাঠান:

\`\`\`bash
printf "GET / HTTP/1.1\\r\\nHost: localhost\\r\\nConnection: close\\r\\n\\r\\n" | nc localhost 8080
\`\`\`

Response-এর প্রথম লাইনে \`HTTP/1.1 200 OK\`, তারপর header, তারপর HTML। Client-server আদান-প্রদান আসলে নির্দিষ্ট নিয়মে লেখা text, যেটা TCP-র উপর দিয়ে যায়। HTTP-র এই নিয়মগুলো Day 3-এ খুলে দেখব।

শেষে পরিষ্কার করুন:

\`\`\`bash
docker rm -f myserver
\`\`\``,
    },
  ],

  connections: {
    markdown: `- **Day 1 · সিস্টেম ডিজাইন আসলে কী?**: সেখানে বলেছিলাম system design মানে অনেকগুলো অংশ কিভাবে একসাথে কাজ করবে তা ঠিক করা। আজ সবচেয়ে মৌলিক দুটো অংশ চিনলাম, client আর server, আর তাদের জোড়া দেওয়ার রাস্তা, Internet।

সামনে এই lesson-এর প্রায় প্রতিটা ধারণা আবার আসবে:
- **Day 3 · DNS, HTTP ও URL-এর গল্প**: ঠিকানা (\`boighor.com\`) থেকে IP কিভাবে আসে, আর request/response-এর ভাষা HTTP।
- **Day 5-7 · Scalability, Availability, Latency**: এক server-এ অনেক client হলে কী হয়, server পড়লে কী হয়, আর দূরত্ব কিভাবে latency বানায়।
- **Day 11 · CDN**: propagation latency কমানোর সবচেয়ে বড় অস্ত্র, data user-এর কাছে রাখা।
- **Day 14 · Stateful vs Stateless**: আজকের "server মনে রাখে না" ধারণার পুরো গল্প।
- **Day 38 · IP, Port ও Subnet** আর **Day 39 · TCP vs UDP**: আজকের deep dive-এর বিস্তারিত।
- **Day 60 · Client-Server Architecture**: এখন এটুকু জানলেই চলবে, Day 60-এ গভীরে যাব (tier, layer, BFF ইত্যাদি)।
- **Day 114 · P2P ও Decentralization**: client-server-এর বিকল্প মডেলের trade-off।`,
  },

  explainYourself: [
    {
      question:
        "আপনার backend যখন একটা payment gateway-এর API call করে, তখন আপনার backend কি client না server? উত্তর দিয়ে বোঝান কেন client/server হলো role, machine না।",
      idealAnswer:
        "ওই মুহূর্তে আপনার backend হলো client, কারণ সে কথা শুরু করছে আর payment gateway উত্তর দিচ্ছে। অথচ একই backend user-দের app-এর কাছে server। Client/server নির্ধারিত হয় কে request শুরু করে আর কে শোনে তা দিয়ে, machine কত বড় বা কোথায় আছে তা দিয়ে না। তাই একটা program একসাথে একজনের server আর আরেকজনের client হতে পারে।",
    },
    {
      question:
        'ঢাকার একজন user-এর জন্য আপনার server আমেরিকায়। Teammate বলছে, "server-এর bandwidth ১০ গুণ বাড়াই, তাহলে app দ্রুত হবে।" আপনি কী বলবেন?',
      idealAnswer:
        "Bandwidth বাড়ালে transmission delay কমে, অর্থাৎ বড় file দ্রুত যায়। কিন্তু ছোট API request-এ সময়ের বড় অংশ propagation: ঢাকা থেকে আমেরিকার পূর্ব উপকূলে আলোরও RTT কমপক্ষে ১২০ms-এর বেশি, আর প্রতিটা নতুন connection-এ কয়েকটা round trip লাগে। এটা bandwidth দিয়ে কমে না। সমাধান হলো server বা content user-এর কাছে আনা (কাছের region, CDN) আর round trip-এর সংখ্যা কমানো (connection reuse)।",
    },
    {
      question:
        "আপনার বাসার Wi-Fi-তে phone-এর IP 192.168.0.105। বাইরের একটা server কি সরাসরি এই phone-এ connection খুলতে পারবে? কেন, আর chat app তাহলে কিভাবে নতুন message পাঠায়?",
      idealAnswer:
        "না। 192.168.0.105 একটা private IP, Internet-এ এর কোনো মানে নেই, আর বাসার router NAT করে সবার জন্য একটাই public IP ব্যবহার করে। Router-এর translation table-এ entry তৈরি হয় শুধু ভেতর থেকে কেউ connection শুরু করলে, তাই বাইরের অচেনা connection কোথায় যাবে router জানে না। এজন্য chat app আগে নিজে server-এর সাথে একটা connection খুলে রাখে (যেমন WebSocket), আর server সেই খোলা পথ দিয়েই নতুন message পাঠায়।",
    },
  ],

  interviewQuestions: [
    {
      question: "Browser-এ একটা website খুললে মোটামুটি কী কী ঘটে? (high level)",
      answerOutline: `- Domain থেকে IP খোঁজা (DNS), বিস্তারিত Day 3
- Server-এর IP:443-এ TCP connection (3-way handshake), তারপর TLS handshake
- HTTP request পাঠানো; packet-গুলো Wi-Fi router → ISP → অনেক router (BGP দিয়ে জোড়া network) → server
- Server process করে (হয়তো database), response পাঠায়
- Browser HTML parse করে, আরও resource (CSS, JS, ছবি) চায়, render করে
- Latency কোথায়: প্রতিটা round trip, দূরত্ব, server processing; উন্নতি: CDN, connection reuse, cache`,
    },
    {
      question: "Client-side validation থাকলে server-side validation কি দরকার?",
      answerOutline: `- অবশ্যই দরকার; client code user-এর নিয়ন্ত্রণে, curl/devtools দিয়ে যেকোনো request বানানো যায়
- Client validation = UX (দ্রুত feedback), server validation = নিরাপত্তা ও সঠিকতা
- দাম, discount, অনুমতি, userId সবসময় server নিজে token/database থেকে নির্ধারণ করবে
- উদাহরণ: cart-এ দাম client থেকে না নিয়ে productId নিয়ে server-এ দাম খোঁজা`,
    },
    {
      question:
        "Latency কমাতে কী কী করবেন? Bandwidth আর latency-র পার্থক্য কী?",
      answerOutline: `- চার উৎস: propagation, transmission, queuing, processing
- Bandwidth = প্রতি সেকেন্ডে কত data; latency = একটা packet যেতে কত সময়
- Propagation-এর নিচের সীমা দূরত্ব/আলোর গতি (fiber-এ ~৫ms প্রতি ১,০০০ km); শুধু কাছে গিয়ে কমে
- কৌশল: কাছের region, CDN, round trip কমানো (keep-alive, batching), cache, দ্রুত server code
- ছোট request-এ latency-bound, বড় transfer-এ bandwidth-bound`,
    },
    {
      question: "NAT কী, আর system design-এ এর কী প্রভাব পড়ে?",
      answerOutline: `- IPv4 ঘাটতি; private range (RFC 1918) আর router-এর public IP
- Translation table: private IP:port ↔ public IP:port
- প্রভাব ১: বাইরে থেকে inbound connection যায় না, তাই push-এর জন্য client connection খোলা রাখে (WebSocket, long polling)
- প্রভাব ২: CGNAT-এ অনেক user এক IP; IP-ভিত্তিক rate limit/ban সাবধানে
- প্রভাব ৩: P2P-তে NAT traversal (STUN/TURN) লাগে
- Cloud: private subnet-এর server বাইরে যায় NAT gateway দিয়ে`,
    },
    {
      question: "Client-server আর peer-to-peer-এর মধ্যে কখন কোনটা বাছবেন?",
      answerOutline: `- Client-server: একটা সত্য data, কেন্দ্রীয় নিয়ম ও নিরাপত্তা, সহজ debug ও update (বেশিরভাগ business app)
- P2P: বিশাল বিতরণ (বড় file, live media), server খরচ কম, single point of failure নেই
- P2P-র কষ্ট: NAT traversal, বিশ্বাস/যাচাই, consistency
- বাস্তবে hybrid: P2P-তেও signaling/tracker server; client-server-এও CDN দিয়ে বিতরণ`,
    },
  ],

  summary: {
    points: [
      "Client চায় আর কথা শুরু করে, server শোনে আর উত্তর দেয়; এগুলো role, machine না।",
      "Internet হলো network-এর network: data packet-এ ভাগ হয়ে router থেকে router হয়ে, ISP আর undersea cable পার হয়ে যায়।",
      "IP address বলে কোন machine, port বলে কোন program; একটা connection চেনা যায় 5-tuple দিয়ে।",
      "NAT-এর কারণে বাসার device-এর private IP বাইরে দেখা যায় না, তাই বাইরে থেকে সরাসরি ডাকা যায় না; server-এর লাগে public ঠিকানা।",
      "Latency = propagation + transmission + queuing + processing; দূরত্বের latency শুধু কাছে গিয়েই কমে।",
      "HTTP request stateless, আর server কখনো client-এর data অন্ধভাবে বিশ্বাস করে না; আসল নিয়ম ও যাচাই server-এ।",
      "Thin বনাম thick client আর client-server বনাম P2P, দুটোই trade-off; একটা সত্য data লাগলে client-server স্বাভাবিক পছন্দ।",
    ],
    diagram: {
      id: "day-002-summary",
      caption: "এক নজরে Client, Server ও Internet",
      alt: "অনেকগুলো client (phone, laptop) Internet হয়ে একটা server-এ request পাঠায়, server database থেকে data নিয়ে response দেয়।",
    },
  },
};
