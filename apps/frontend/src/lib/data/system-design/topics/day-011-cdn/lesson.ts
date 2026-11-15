// Day 11 · CDN — Phase 1 introduction. Caching in general goes deeper on Day 17;
// DNS, TLS and HTTP versions on Days 40-42; DDoS on Day 81; multi-region/edge on Day 88.

import { topicHrefForDay } from "@/lib/data/courses/system-design-a-z";
import type { SdLesson } from "@/lib/system-design/lesson.types";

export const day011Lesson: SdLesson = {
  topicId: "sd-day-011",
  day: 11,
  title: "CDN",
  definition:
    "CDN (Content Delivery Network) হলো user-এর কাছাকাছি ছড়িয়ে থাকা অনেকগুলো edge server-এর network, যেগুলো আপনার ছবি, JS, video-র কপি cache করে রাখে, যাতে প্রতিটা request দূরের origin server পর্যন্ত যেতে না হয়।",

  objectives: [
    "দূরের origin থেকে সব file দিলে latency, origin-এর load আর bandwidth খরচ কোথায় কোথায় বাড়ে, আর CDN-এর edge PoP প্রতিটা কিভাবে কমায়, সংখ্যা দিয়ে ব্যাখ্যা করতে পারবেন।",
    "একটা request কিভাবে কাছের edge-এ পৌঁছায় (DNS steering, anycast), তারপর cache HIT, MISS, origin fetch, TTL আর 304 revalidation-এর পুরো পথ ধাপে ধাপে আঁকতে পারবেন।",
    "Cache-Control (max-age, s-maxage, public/private, no-cache বনাম no-store), ETag আর Vary দিয়ে কোন response কতক্ষণ কোথায় cache হবে ঠিক করতে পারবেন, আর cache key কিভাবে hit ratio-কে প্রভাবিত করে বলতে পারবেন।",
    "Purge-এর বদলে versioned file name, origin shield, request collapsing আর ISP-embedded cache কোন সমস্যার সমাধান করে, hit ratio আর origin fetch-এর হিসাব করে যুক্তি দিতে পারবেন।",
    "Docker-এ NGINX দিয়ে একটা ছোট CDN edge বানিয়ে MISS, HIT, REVALIDATED আর no-store-এর আচরণ নিজের চোখে দেখতে পারবেন।",
  ],

  prerequisites: [
    {
      day: 3,
      title: "DNS, HTTP ও একটি URL-এর গল্প",
      href: topicHrefForDay(3),
    },
    { day: 7, title: "Latency vs Throughput", href: topicHrefForDay(7) },
    { day: 9, title: "Load Balancers", href: topicHrefForDay(9) },
  ],

  problem: {
    markdown: `নাদিয়া "সাজঘর" নামে একটা online পোশাকের দোকান চালায়। Server বসানো আমেরিকার পূর্ব উপকূলের (US East) একটা cloud region-এ, কারণ শুরুতে সেটাই default ছিল আর সস্তাও। Customer প্রায় সবাই বাংলাদেশে: ঢাকা, চট্টগ্রাম, সিলেট।

Product page খুললে browser একটা HTML-এর পরে আরও প্রায় ৪০টা file চায়: product-এর ছবি, \`app.js\`, \`style.css\`, font। প্রতিটা file আসে ওই একটাই server থেকে।

ঈদের sale-এর সপ্তাহে চারটা সমস্যা একসাথে এলো।

**১. সবকিছু ধীর, অথচ server ব্যস্ত না।** [Day 7](${topicHrefForDay(7)})-এ দেখেছি, ঢাকা থেকে US East-এ এক round trip (RTT) প্রায় **২৫০ms**। নতুন HTTPS connection-এ TCP আর TLS handshake মিলিয়ে কাজ শুরুর আগেই কয়েকটা RTT চলে যায়, তারপর ৪০টা file কয়েক দফায় আসে। Server প্রতিটা ছবি ৫ms-এ দিলেও page পুরো আসতে ৩-৪ সেকেন্ড। সমস্যাটা server-এ না, **দূরত্বে**। আলোর গতি কোনো code দিয়ে বাড়ানো যায় না।

**২. একই ছবি লাখবার।** Sale-এর banner ছবিটা (৩০০ KB) সেদিন ৫ লাখ বার দেখা হলো। প্রতিবার origin server disk থেকে পড়ল, CPU খরচ করে পাঠাল। মোট ~১৫০ GB শুধু একটা ছবির জন্য। ছবি পাঠাতে পাঠাতে server-এর network আর CPU ভরে গেল, আর একই server-এ চলা **checkout API** ধীর হয়ে গেল। মানুষ ছবি দেখছে, কিন্তু order দিতে পারছে না।

**৩. Bill.** Cloud provider server থেকে internet-এ যাওয়া প্রতিটা GB-র জন্য টাকা নেয় (**egress** খরচ)। একই ছবি লাখবার পাঠানো মানে একই জিনিসের জন্য লাখবার টাকা দেওয়া।

**৪. সমুদ্রের নিচের cable দিয়ে একই byte বারবার।** ঢাকার প্রতিটা user-এর জন্য ছবিটা আলাদাভাবে আমেরিকা থেকে সাবমেরিন cable পেরিয়ে আসছে। পাশাপাশি দুই বাসার দুজন একই ছবি দেখলেও দুবার পুরো পথ পাড়ি।

নাদিয়া ভাবল আরও বড় server নেবে। কিন্তু বড় server ২ আর ৩ নম্বর সমস্যা একটু কমায়, ১ আর ৪ নম্বর একটুও না। কারণ server যত শক্তিশালীই হোক, সেটা এখনো আমেরিকায়।`,
    diagrams: [
      {
        id: "day-011-before",
        caption:
          "আগে: ঢাকা, চট্টগ্রাম, সিলেটের সবাই প্রতিটা ছবি আর JS আমেরিকার একটাই origin থেকে আনছে; প্রতিটা request-এ ~২৫০ms RTT, আর origin একই file বারবার পাঠাচ্ছে।",
        alt: "বামে তিনজন user: ঢাকা, চট্টগ্রাম, সিলেট। প্রত্যেকের থেকে লাল তীর ডানে অনেক দূরের Origin (US) server-এ, প্রতিটা তীরে লেখা RTT ~২৫০ms। Origin থেকে 'ছবি ও file' storage-এ তীর, লেখা একই ছবি লাখবার।",
      },
    ],
  },

  analogy: {
    markdown: `"দেশি বাজার" নামে একটা কোম্পানির কথা ভাবুন, যাদের একটাই বড় গুদাম, ঢাকার তেজগাঁওয়ে। সিলেটের কেউ এক প্যাকেট চা-পাতা order দিলে সেটা ঢাকা থেকে বাসে যায়, দুই দিন লাগে। আর ঈদের আগে একই চা-পাতা সিলেটের এক হাজার জন order দিলে, এক হাজারটা আলাদা প্যাকেট ঢাকা থেকে আলাদা আলাদা যায়। গুদামের কর্মীরা দম ফেলার সময় পায় না, পরিবহন খরচ আকাশে।

তারপর কোম্পানি প্রতিটা জেলায় একটা ছোট **depot** খুলল।

- সিলেটে প্রথম কেউ চা-পাতা চাইলে depot-এ নেই (**MISS**)। Depot ঢাকা থেকে আনায়, customer-কে দেয়, আর **কয়েক প্যাকেট বাড়তি রেখে দেয়**।
- পরের ৯৯৯ জন সাথে সাথে পায়, ঢাকা পর্যন্ত যেতেই হয় না (**HIT**)। ঢাকার গুদাম এখন শুধু প্রথমবারের কাজটা করে।
- প্রতিটা প্যাকেটে একটা **"এই তারিখ পর্যন্ত চলবে"** লেখা থাকে (**TTL**)। তারিখ পেরোলে depot ঢাকায় ফোন করে জিজ্ঞেস করে, "আগের মতোই আছে তো?" ঢাকা বলে "হ্যাঁ, বদলায়নি" (**304 Not Modified**), তাহলে নতুন মাল না এনেই আরও কিছুদিন বিক্রি চলে।
- ষাটটা জেলার depot যদি সবাই সরাসরি ঢাকায় ফোন করে, ঢাকা আবার চাপে পড়ে। তাই মাঝে একটা **বিভাগীয় hub** বসানো হলো, যেমন চট্টগ্রাম বিভাগের সব depot আগে চট্টগ্রাম hub-কে জিজ্ঞেস করে। Hub-এ না থাকলে তবেই ঢাকা (**origin shield**)।
- মোড়ক বদলালে (নতুন design) পুরনো প্যাকেট সব depot থেকে ফেরত আনা ঝামেলা। তার চেয়ে নতুন মোড়কের **নতুন product code** দিলে depot নিজেই নতুনটা আনবে (**versioned file name**)।

- **তেজগাঁওয়ের গুদাম = Origin server**
- **জেলার depot = Edge server (PoP)**
- **বিভাগীয় hub = Origin shield**
- **প্যাকেটের মেয়াদ = TTL**

একটা জিনিস depot রাখে না: কোনো customer-এর **নিজস্ব** অর্ডার, যেমন তার নাম লেখা gift box। সেটা সবসময় ঢাকা থেকেই আসে। CDN-ও ঠিক এভাবে personalised response সাধারণত cache করে না।`,
    diagrams: [
      {
        id: "day-011-analogy",
        caption:
          "ঢাকার গুদাম, বিভাগীয় hub আর জেলার depot: depot-এ থাকলে সাথে সাথে (HIT), না থাকলে hub হয়ে ঢাকা থেকে আনে আর বাড়তি রেখে দেয় (MISS)।",
        alt: "বামে ঢাকার গুদাম (Origin)। মাঝে চট্টগ্রাম বিভাগীয় hub (Origin shield)। ডানে তিনটা জেলার depot (Edge): সিলেট আর কুমিল্লার তাকে প্যাকেট আর মেয়াদের তারিখ, কক্সবাজারের তাক খালি। Depot-এর পাশে customer-রা সাথে সাথে প্যাকেট নিচ্ছে; একটা depot-এর খালি তাক থেকে dashed তীর hub-এর দিকে।",
      },
    ],
  },

  coreConcept: {
    markdown: `**CDN (Content Delivery Network)** হলো পৃথিবীর নানা জায়গায় বসানো অনেকগুলো server-এর একটা network, যারা আপনার content-এর কপি user-এর কাছাকাছি রাখে।

তিনটা শব্দ মনে রাখুন:
- **Origin**: আপনার আসল server (বা S3-এর মতো object storage), যেখানে file-এর মূল কপি থাকে। CDN-এর চোখে "সত্যের উৎস"।
- **Edge server**: CDN-এর server, যে user-এর request নেয় আর cache থেকে উত্তর দেয়। এটা আসলে একটা **reverse proxy** (user-এর হয়ে না, আপনার server-এর হয়ে সামনে দাঁড়ানো proxy; [Day 15](${topicHrefForDay(15)})-এ বিস্তারিত)।
- **PoP (Point of Presence)**: একটা শহর বা data center-এ CDN-এর edge server-গুলোর দল। "ঢাকায় CDN-এর PoP আছে" মানে ঢাকার ভেতরেই কিছু edge server বসানো।

**১. User কিভাবে কাছের edge-এ পৌঁছায়?**

আপনি নিজের domain-কে CDN-এর দিকে দেখিয়ে দেন, সাধারণত একটা CNAME দিয়ে: \`static.sajghor.com → sajghor.cdn-provider.net\`। এরপর দুইটা প্রচলিত উপায়:

- **DNS-based steering**: CDN-এর authoritative DNS দেখে প্রশ্নটা কোন resolver থেকে এলো, আর কাছের PoP-এর IP উত্তর দেয়। এটা [Day 3](${topicHrefForDay(3)})-এর GeoDNS-এর মতোই, সেই সীমাবদ্ধতাসহ: DNS user-কে না, resolver-কে দেখে।
- **Anycast**: একই IP address অনেক PoP থেকে একসাথে ঘোষণা (BGP announce) করা হয়। Internet-এর routing নিজেই packet-কে network-এর হিসাবে কাছের PoP-এ নিয়ে যায়। [Day 9](${topicHrefForDay(9)})-এ load balancer-কে SPOF-মুক্ত রাখার আলোচনায় এটা একবার দেখেছিলাম। Cloudflare-এর documentation অনুযায়ী তাদের network anycast-এর উপর চলে।

DNS আর routing-এর এই খুঁটিনাটি এখন এটুকু জানলেই চলবে, [Day 40](${topicHrefForDay(40)})-এ (DNS গভীরে) আর [Day 88](${topicHrefForDay(88)})-এ (Multi-region ও Edge) গভীরে যাব।

**২. Edge-এ পৌঁছানোর পরে: HIT, MISS আর TTL**

Edge একটা প্রশ্ন করে: "এই জিনিসটা কি আমার cache-এ আছে, আর এখনো তাজা?"
- **Cache HIT**: আছে, আর মেয়াদ (TTL) শেষ হয়নি। Edge সাথে সাথে দিয়ে দেয়। Origin কিছুই জানে না।
- **Cache MISS**: নেই। Edge origin থেকে আনে (**origin fetch**), user-কে দেয়, আর response-এর নির্দেশ অনুযায়ী একটা কপি রেখে দেয়।
- **TTL (Time To Live)**: কপিটা কতক্ষণ "তাজা" ধরা হবে। এটা ঠিক হয় মূলত origin-এর পাঠানো \`Cache-Control\` header দিয়ে, যেমন \`Cache-Control: public, max-age=86400\` মানে "যে কেউ cache করতে পারো, ১ দিন পর্যন্ত"।
- TTL শেষ হলে edge পুরো file আবার না এনে জিজ্ঞেস করতে পারে "বদলেছে?" (**revalidation**)। না বদলালে origin শুধু \`304 Not Modified\` দেয়, body ছাড়া। [Day 3](${topicHrefForDay(3)})-এর lab-এ ETag দিয়ে এই 304 নিজেই বানিয়েছিলেন; আজ দেখব edge সেটা কিভাবে কাজে লাগায়।

**৩. লাভটা কোথায়?** তিনটা জায়গায়:
1. **Latency কমে**: ঢাকার user ঢাকার PoP থেকে পায়। RTT ২৫০ms-এর বদলে ধরুন ১০ms। নতুন HTTPS connection-এ ৩টা RTT (TCP, TLS, request) লাগলে সেটা ৭৫০ms থেকে নেমে ৩০ms। এটা Day 7-এর মূল কথা: **round trip কমানো, আর RTT নিজেই কমানো**।
2. **Origin-এর load কমে**: ৫ লাখ request-এর ৯৯% edge-এ HIT হলে origin পায় মাত্র ৫,০০০। Checkout API আবার নিঃশ্বাস নিতে পারে।
3. **Bandwidth খরচ কমে**: origin থেকে বের হওয়া data অনেক কমে যায়, আর আন্তর্জাতিক link-এ একই byte বারবার আসে না।

**৪. কী CDN-এ দেবেন, কী দেবেন না?**
- **খুব ভালো**: ছবি, CSS, JS, font (static assets); software বা PDF download; video-র ছোট ছোট segment (deep dive-এ দেখব কেন)।
- **সাবধানে**: সবার জন্য একই এমন HTML বা API response (যেমন product list), ছোট TTL দিয়ে।
- **সাধারণত না**: personalised বা গোপন response, যেমন \`/api/me\`, cart, bKash balance। এগুলো \`Cache-Control: private\` বা \`no-store\` দিয়ে পাঠান। ভুল করে এগুলো shared cache-এ গেলে একজনের তথ্য আরেকজন দেখবে, এটা CDN-এর সবচেয়ে বিপজ্জনক ভুল।

**৫. Cache hit ratio: সবচেয়ে জরুরি সংখ্যা**

**Hit ratio** = মোট request-এর কত অংশ edge-এ HIT হলো। একটা হিসাব দেখুন, দিনে ১ কোটি request:

| Hit ratio | Origin-এ যায় | Origin-এর load |
|---|---|---|
| ৯০% | ১০ লাখ | ১০× |
| ৯৫% | ৫ লাখ | ৫× |
| ৯৯% | ১ লাখ | ১× |

খেয়াল করুন: ৯৫% থেকে ৯৯%-এ যাওয়া শুনতে "মাত্র ৪%", কিন্তু origin-এর load **৫ ভাগের ১ ভাগ** হয়ে যায়। কারণ আসল হিসাব **miss ratio**-তে: ৫% থেকে ১%। তাই CDN-এর কাজ মানে আসলে miss কমানোর কাজ।

গড় latency-ও miss ঠিক করে। HIT-এ ২০ms আর MISS-এ ৩০০ms হলে:
- ৯০% hit: ০.৯ × ২০ + ০.১ × ৩০০ = **৪৮ms**
- ৯৯% hit: ০.৯৯ × ২০ + ০.০১ × ৩০০ = **২২.৮ms**

**দামটা কী?** CDN বিনামূল্যে আসে না: (১) **পুরনো data**: TTL চলাকালীন origin-এ file বদলালেও user পুরনোটা দেখতে পারে; (২) cache নিয়ন্ত্রণের নতুন জটিলতা (header, purge, cache key); (৩) user আর আপনার server-এর মাঝে একটা তৃতীয় পক্ষ, যে আপনার traffic দেখে আর যার নিজেরও outage হতে পারে।`,
    diagrams: [
      {
        id: "day-011-main",
        caption:
          "পরে: user-রা কাছের edge PoP থেকে পায়; MISS হলে edge আগে origin shield-কে জিজ্ঞেস করে, তারপর দরকার হলে origin-কে।",
        alt: "বামে তিনজন user: ঢাকা, চট্টগ্রাম, সিলেট। তারা দুটো Edge PoP-এ যায়, তীরে লেখা HIT ~১০ms। দুটো Edge থেকে dashed তীর মাঝের Origin Shield-এ, লেখা শুধু MISS। Shield থেকে একটা তীর ডানে Origin (US)-এ, লেখা কদাচিৎ fetch।",
        downloadable: true,
      },
      {
        id: "day-011-before-after",
        caption:
          "পাশাপাশি: CDN ছাড়া প্রতিটা file ~২৫০ms দূর থেকে আর origin সব request সামলায়; CDN দিয়ে বেশিরভাগ file ~১০ms-এ edge থেকে, origin পায় শুধু miss। (সংখ্যাগুলো উদাহরণ)",
        alt: "উপরে আগের design: তিনজন user সরাসরি দূরের origin-এ। নিচে CDN সহ design: user থেকে edge PoP, edge থেকে origin shield, shield থেকে origin। প্রতিটার নিচে latency আর origin load-এর পার্থক্য লেখা।",
      },
    ],
  },

  deepDive: [
    {
      title:
        "Cache-Control, ETag আর Vary: origin কিভাবে CDN-কে নির্দেশ দেয়, আর cache key",
      markdown: `CDN নিজে থেকে বোঝে না কোন response কতক্ষণ রাখা নিরাপদ। নির্দেশটা দেয় origin, HTTP header দিয়ে। এখানে ভুল করলে হয় পুরনো জিনিস দেখাবে, নয়তো কিছুই cache হবে না।

**Cache-Control-এর মূল directive-গুলো:**

| Directive | মানে | কোথায় ব্যবহার |
|---|---|---|
| \`max-age=N\` | N সেকেন্ড পর্যন্ত তাজা, browser আর CDN দুজনের জন্যই | বেশিরভাগ static file |
| \`s-maxage=N\` | শুধু **shared cache**-এর (CDN, proxy) জন্য; থাকলে তারা max-age-এর বদলে এটা মানে | Browser-এ ১ মিনিট, CDN-এ ১ ঘণ্টা রাখতে চাইলে |
| \`public\` | Shared cache-ও রাখতে পারে | সবার জন্য একই response |
| \`private\` | শুধু user-এর নিজের browser রাখতে পারে, CDN না | User-এর profile page |
| \`no-cache\` | রাখা যাবে, কিন্তু **প্রতিবার ব্যবহারের আগে** origin-কে জিজ্ঞেস করতে হবে | সবসময় সর্বশেষটা দেখাতে হবে এমন HTML |
| \`no-store\` | কোথাও রাখাই যাবে না | Balance, OTP, ব্যক্তিগত তথ্য |
| \`immutable\` | মেয়াদের মধ্যে এটা কখনো বদলাবে না, reload-এও revalidate করার দরকার নেই | Versioned file (\`app.3f9a.js\`) |
| \`stale-while-revalidate=N\` | মেয়াদ শেষের পরেও N সেকেন্ড পুরনোটা দাও, পেছনে নতুনটা আনো | যেখানে কয়েক সেকেন্ড পুরনো চলে |

সবচেয়ে প্রচলিত বিভ্রান্তি: **\`no-cache\` মানে "cache করো না" না।** মানে "cache করো, কিন্তু না জিজ্ঞেস করে দিও না"। সত্যিই রাখতে না চাইলে \`no-store\`। (MDN-এর HTTP caching guide এই পার্থক্যটা আলাদা করে জোর দিয়ে বলে।)

**ETag আর 304: পুরো file না নামিয়ে মিলিয়ে নেওয়া**

Origin প্রতিটা response-এর সাথে একটা **ETag** দেয়, file-এর একটা fingerprint, যেমন \`ETag: "6ab2d11ed88a"\`। TTL শেষ হলে edge জিজ্ঞেস করে \`If-None-Match: "6ab2d11ed88a"\`। File না বদলালে origin শুধু \`304 Not Modified\` পাঠায়, কয়েকশো byte। ৩০০ KB-র ছবিতে এতে প্রায় পুরো bandwidth বাঁচে, শুধু একটা round trip লাগে। (\`Last-Modified\` আর \`If-Modified-Since\` একই কাজ সময় দিয়ে করে, তবে ETag বেশি নির্ভুল।)

**\`Age\` header:** অনেক CDN response-এ \`Age: 120\` দেয়, মানে এই কপি ১২০ সেকেন্ড ধরে cache-এ আছে। \`max-age=300\` আর \`Age: 120\` মানে আরও ১৮০ সেকেন্ড তাজা।

**Cache key: edge কিভাবে চেনে "এটা একই জিনিস"**

Edge প্রতিটা কপি একটা **key** দিয়ে খুঁজে পায়। সাধারণত key = scheme + host + path + **query string**। মানে:
- \`/banner.jpg?utm_source=facebook\` আর \`/banner.jpg?utm_source=whatsapp\` দুটো **আলাদা** key। একই ছবি দুবার origin থেকে আসবে, দুবার জায়গা নেবে। Marketing link-এর tracking parameter নীরবে hit ratio খেয়ে ফেলে। সমাধান: cache key থেকে অপ্রয়োজনীয় query parameter বাদ দেওয়া, বা query সাজিয়ে (sort) নেওয়া; বেশিরভাগ CDN-এ এই setting আছে।
- উল্টো বিপদ: key-তে দরকারি কিছু বাদ দিলে দুটো **আলাদা** response একই key পায়। যেমন ভাষা cookie দিয়ে বদলায় অথচ key-তে নেই, তাহলে বাংলা user ইংরেজি page পেতে পারে।

**Vary: একই URL, আলাদা কপি**

\`Vary: Accept-Encoding\` মানে "request-এর \`Accept-Encoding\` header অনুযায়ী আলাদা কপি রাখো", কারণ gzip-চাওয়া আর brotli-চাওয়া client আলাদা byte পায়। এটা দরকারি আর নিরাপদ।

কিন্তু \`Vary: User-Agent\` বা \`Vary: Cookie\` দিলে বিপদ: User-Agent-এর হাজারো রকম মান, প্রতিটার জন্য আলাদা কপি। একই ছবির হাজার কপি, প্রায় সব MISS। Vary যত বিস্তৃত, cache তত টুকরো, hit ratio তত কম।

নিচে প্রথমে ধাপে ধাপে একটা file-এর পুরো জীবন, তারপর edge-এর ভেতরে cache key দিয়ে সাজানো table।`,
      diagrams: [
        {
          id: "day-011-request-flow",
          caption:
            "ধাপে ধাপে: প্রথম request MISS → origin fetch → cache-এ রাখা → পরের user HIT → TTL শেষে 304 revalidation → নতুন version-এর নতুন নাম।",
          alt: "User A, User B, Edge আর Origin-এর মধ্যে sequence diagram। User A-র GET edge-এ MISS, edge origin থেকে 200 আর Cache-Control ও ETag পায়, User A-কে দেয়। User B-র GET সরাসরি HIT। TTL শেষে edge If-None-Match পাঠায়, origin 304 দেয়। শেষে নতুন file name app.7c21.js-এর request আবার MISS হয়ে origin থেকে আসে।",
        },
        {
          id: "day-011-cache-key",
          caption:
            "Edge-এর ভেতরে: request থেকে cache key তৈরি হয়, আর প্রতিটা key-র সাথে রাখা থাকে response, মেয়াদ আর ETag। একই ছবি আলাদা query-তে দুবার জায়গা নিচ্ছে, আর no-store response রাখাই হয়নি।",
          alt: "বামে একটা request: GET https://static.sajghor.com/banner.jpg?utm=fb, Accept-Encoding br। মাঝে cache key তৈরির বাক্স: scheme, host, path, query, আর Vary অনুযায়ী header। ডানে একটা table: key, অবস্থা, মেয়াদ, ETag। সারিগুলো: app.3f9a.js তাজা ১ বছর; logo.svg তাজা ১২s বাকি; banner.jpg?utm=fb আর banner.jpg?utm=wa একই ছবির দুটো আলাদা কপি, লাল চিহ্ন; style.css-এর gzip আর br দুটো variant; /api/me no-store তাই রাখা হয়নি।",
        },
      ],
    },
    {
      title:
        "Invalidation: purge বনাম versioned file name, আর pull বনাম push CDN",
      markdown: `Computer science-এর পুরনো রসিকতা: সবচেয়ে কঠিন দুটো কাজ, cache invalidation আর নাম দেওয়া। CDN-এ দুটো একসাথে আসে।

ধরুন \`app.js\` ১ দিনের TTL দিয়ে cache করা। আজ একটা bug fix deploy করলেন। এখন কিছু user নতুন HTML পাচ্ছে কিন্তু পুরনো JS, কারণ edge-এ পুরনো \`app.js\` এখনো তাজা। দুটো উপায়:

**১. Purge (invalidation):** CDN-কে বলা "এই URL-এর কপি সব PoP থেকে মুছে ফেলো"। কাজ করে, কিন্তু সমস্যা আছে:
- সব PoP-এ পৌঁছাতে সময় লাগে, আর সেই সময়ে কিছু user পুরনো, কিছু নতুন পায়।
- **Browser-এর cache** CDN purge করতে পারে না। User-এর browser-এ \`max-age=86400\` দিয়ে রাখা কপি একদিন থেকে যাবে।
- Purge-এর পরে সব PoP একসাথে MISS, origin-এ হঠাৎ ঢেউ (নিচের stampede দেখুন)।
- অনেক CDN purge-এর সংখ্যা বা হারে সীমা রাখে, অথবা কিছু ক্ষেত্রে খরচ নেয়।

**২. Versioned (fingerprinted) file name:** Build tool file-এর content-এর hash নামে জুড়ে দেয়: \`app.3f9a.js\`। Content বদলালে hash বদলায়, নাম হয় \`app.7c21.js\`। HTML নতুন নামটা দেখায়।
- নতুন নাম মানে নতুন cache key, তাই প্রথম request-এই origin থেকে নতুন file। কোনো purge লাগে না।
- পুরনো নাম কখনো বদলায় না, তাই নিশ্চিন্তে \`Cache-Control: public, max-age=31536000, immutable\` (১ বছর) দেওয়া যায়, browser আর CDN দুজনেই।
- Rollback সহজ: HTML আবার পুরনো নাম দেখালেই হলো, পুরনো file তো এখনো cache-এ।
- HTML নিজে versioned হয় না (URL তো \`/\`), তাই HTML-কে ছোট TTL বা \`no-cache\` দিন। এটাই প্রচলিত জোড়া: **HTML ছোট TTL, asset-এর নাম versioned আর TTL লম্বা।**

কেন দ্বিতীয়টা ভালো: এটা cache-এর সাথে লড়াই করে না, cache-এর নিয়মের ভেতরেই কাজ করে। "পুরনো কপি মুছতে হবে" প্রশ্নটাই আর ওঠে না, কারণ নতুন জিনিসের নামই আলাদা।

Purge তবুও লাগে: ভুল করে গোপন কিছু cache হয়ে গেলে, বা যেসব URL বদলানো যায় না (\`/logo.png\` অন্য site link করে রেখেছে)। তখন purge-এর পরে origin-এর চাপের জন্য প্রস্তুত থাকুন।

**Pull বনাম Push CDN**

- **Pull CDN**: Edge নিজে থেকে কিছু রাখে না। প্রথম request-এ MISS হলে origin থেকে টেনে (pull) আনে। Setup সহজ: শুধু DNS বদলান। দাম: প্রতিটা PoP-এ প্রতিটা file-এর **প্রথম** request ধীর। ওয়েবসাইটের জন্য এটাই বেশি প্রচলিত।
- **Push CDN**: আপনি নিজে আগে থেকে file CDN-এর storage-এ upload করেন। প্রথম user-ও দ্রুত পায়, origin-এর উপর কোনো চাপ নেই। দাম: কী আছে, কী মুছতে হবে, সব আপনার দায়িত্ব, আর storage-এর খরচ। বড় download, game patch, বা আগে থেকে জানা জনপ্রিয় content-এর জন্য ভালো।

বাস্তবে অনেক system দুটো মেশায়: সাধারণ জিনিস pull, আর জানা বড় release (নতুন episode, app update) আগে থেকে "warm" করে রাখা। Netflix-এর Open Connect এর একটা বড় উদাহরণ, পরের অংশে দেখব।`,
    },
    {
      title: "Origin shield, cache stampede আর long tail: origin-কে বাঁচানো",
      markdown: `**সমস্যা: অনেক PoP, প্রত্যেকে আলাদা MISS**

প্রতিটা PoP-এর cache আলাদা। ধরুন CDN-এর ৫০টা PoP, আর একটা জনপ্রিয় ছবির TTL ৬০ সেকেন্ড। প্রতি মিনিটে প্রতিটা PoP-এ কপির মেয়াদ শেষ হয়, প্রত্যেকে আলাদাভাবে origin-কে জিজ্ঞেস করে। এক ছবির জন্য মিনিটে **৫০টা** origin request। ১,০০০টা জনপ্রিয় file হলে মিনিটে **৫০,০০০**। Hit ratio কাগজে ভালো দেখালেও origin চাপে থাকে।

**সমাধান: Origin shield / tiered cache**

PoP-গুলো আর origin-এর মাঝে একটা (বা কয়েকটা) **মাঝের স্তরের cache** বসানো হয়। Edge-এ MISS হলে edge আগে shield-কে জিজ্ঞেস করে; shield-এও না থাকলে তবেই origin।
- এখন ৫০টা PoP-এর MISS একটা shield-এ গিয়ে মেলে। Shield-এর কপি তাজা থাকলে origin কিছুই পায় না।
- ওই উদাহরণে origin-এর request মিনিটে ৫০,০০০ থেকে নেমে প্রায় **১,০০০** (প্রতি file-এ shield থেকে একবার)।
- দাম: edge-এ MISS হলে এখন একটা বাড়তি hop (edge → shield), তাই ওই কয়েকটা request একটু ধীর। আর shield নিজেই একটা জায়গা, যেটা ভালোভাবে চালু থাকতে হবে।
- নাম আলাদা, idea এক: Amazon CloudFront-এ **Origin Shield**, Cloudflare-এ **Tiered Cache**, Fastly-তে **shielding**। Shield সাধারণত origin-এর কাছের অঞ্চলে বসানো হয়।

**Cache stampede: জনপ্রিয় জিনিসের মেয়াদ একসাথে শেষ**

ঈদের sale শুরু, banner ছবির TTL এইমাত্র শেষ হলো, আর ঠিক সেই সেকেন্ডে একটা PoP-এ ২,০০০টা request এলো। Edge-এর কাছে তাজা কপি নেই। সাধারণ নিয়মে ২,০০০টাই MISS, আর ২,০০০টাই origin-এ যায়, একই file-এর জন্য। একে বলে **cache stampede** (thundering herd)। Purge-এর পরেও ঠিক এটা হয়।

সমাধান:
- **Request collapsing (coalescing)**: একই key-র জন্য প্রথম request-টাই origin-এ যায়; বাকিরা অপেক্ষা করে, আর সেই একটা উত্তর সবাই পায়। NGINX-এ \`proxy_cache_lock on\`, Varnish-এ এটা default আচরণ। Lab-এ দেখবেন: lock ছাড়া ২০টা একসাথে request-এ origin পায় ২০টা, lock দিয়ে ১টা।
- **Stale-while-revalidate**: মেয়াদ শেষ হলেও কিছুক্ষণ পুরনো কপি দিতে থাকো, আর পেছনে একটা request দিয়ে নতুনটা আনো। User দেরি টের পায় না, origin একটাই request পায়।
- **Stale-if-error**: Origin down থাকলে পুরনো কপি দিতে থাকো। CDN তখন availability-ও বাড়ায় ([Day 6](${topicHrefForDay(6)}))।

Stampede-এর আরও কৌশল (যেমন probabilistic early expiration) সাধারণ caching-এর অংশ; এখন এটুকু জানলেই চলবে, [Day 17](${topicHrefForDay(17)})-এ (Caching) গভীরে যাব।

**Long tail: যেখানে CDN কম কাজে আসে**

সব content সমান জনপ্রিয় না। একটা marketplace-এ ২০ লাখ product-এর ছবি, এর মধ্যে কয়েক হাজার ছবি সবাই দেখে, বাকি লাখো ছবি মাসে এক-দুবার। শেষেরগুলোই **long tail**।

Long tail-এর ছবি প্রতিটা PoP-এ একবার দেখা হয়, তারপর আর কেউ চায় না। প্রথম request-টা সবসময় MISS, আর পরের request আসার আগেই cache ভরে যাওয়ায় কপিটা সরিয়ে দেওয়া হয় (**eviction**)। ফলে এসব content-এ hit ratio কম, যতই TTL বাড়ান।

কী করা যায়:
- Origin shield: ৫০টা PoP-এ একবার করে দেখা ছবি shield-এ মিলে কয়েকবার হয়, তাই shield-এ HIT।
- Origin নিজে যেন long tail সস্তায় দিতে পারে, যেমন object storage (S3-ধাঁচের; [Day 33](${topicHrefForDay(33)}))।
- Hit ratio মাপুন **byte** দিয়েও, শুধু request দিয়ে না। ছোট জনপ্রিয় icon-এ request hit ratio ৯৯% হতে পারে, অথচ বেশিরভাগ byte আসছে বড় long-tail video থেকে যেগুলো MISS।`,
      diagrams: [
        {
          id: "day-011-shield",
          caption:
            "Origin shield: ছাড়া হলে প্রতিটা PoP-এর MISS আলাদাভাবে origin-এ যায়; shield থাকলে সব MISS আগে shield-এ মেলে, origin পায় একটা।",
          alt: "উপরে: চারটা Edge PoP, প্রতিটা থেকে আলাদা লাল তীর একটা Origin-এ, লেখা ৪টা fetch। নিচে: চারটা Edge PoP থেকে তীর একটা Origin Shield-এ, Shield থেকে একটা মাত্র তীর Origin-এ, লেখা ১টা fetch।",
        },
      ],
    },
    {
      title: "Video streaming: কেন HLS আর DASH CDN-এর জন্য বানানো",
      markdown: `একটা ২ ঘণ্টার ছবি একটা বড় file হিসেবে দিলে তিনটা সমস্যা: শুরু করতে অনেক data লাগে, মাঝখান থেকে চালাতে কঠিন, আর network ধীর হলে পুরোটাই আটকায়।

আধুনিক streaming (যেমন **HLS**, HTTP Live Streaming, আর **MPEG-DASH**) video-কে কয়েক সেকেন্ডের ছোট ছোট **segment**-এ কেটে সাধারণ HTTP file হিসেবে দেয়:
- একটা **manifest / playlist** (HLS-এ \`.m3u8\`, DASH-এ \`.mpd\`): কোন quality-তে কোন segment কোথায় আছে, তার তালিকা।
- প্রতিটা quality-র (যেমন 360p, 720p, 1080p) আলাদা segment file।
- Player network-এর গতি দেখে প্রতিটা segment-এর আগে quality বদলায় (**adaptive bitrate**)। মোবাইল data দুর্বল হলে 360p, Wi-Fi-তে 1080p।

CDN-এর জন্য এটা আদর্শ কেন?
- প্রতিটা segment একটা সাধারণ, **কখনো না বদলানো** file। লম্বা TTL দিয়ে নিশ্চিন্তে cache করা যায়, ঠিক versioned JS-এর মতো।
- একটা জনপ্রিয় নাটক এক PoP-এ হাজার মানুষ দেখলে, প্রতিটা segment origin থেকে আসে একবার, বাকিরা HIT।
- কোনো বিশেষ streaming server লাগে না; যে edge HTTP file cache করতে পারে, সে video-ও দিতে পারে।

**Live** streaming-এ একটা সূক্ষ্মতা: segment-গুলো বদলায় না, কিন্তু playlist প্রতি কয়েক সেকেন্ডে নতুন segment যোগ করে। তাই playlist-এর TTL খুব ছোট (segment-এর দৈর্ঘ্যের কাছাকাছি বা কম), segment-এর TTL লম্বা। একটা বড় ক্রিকেট ম্যাচের সময় লাখো দর্শক একই মুহূর্তে একই নতুন segment চায়, তাই এখানে request collapsing আর origin shield না থাকলে origin সাথে সাথে ভেঙে পড়ে।

বড় file-এর আরেকটা কৌশল **range request** (\`Range: bytes=0-1048575\`): client file-এর একটা অংশ চায়, আর অনেক CDN বড় file-কে টুকরো করে cache করে, যাতে পুরো file না এনেই প্রথম অংশ দেওয়া যায়।`,
    },
    {
      title:
        "ISP-এর ভেতরে cache: Netflix Open Connect, Google Global Cache, আর বাংলাদেশের জন্য কেন জরুরি",
      markdown: `সাধারণ CDN-এর PoP বসে বড় data center বা **IXP**-তে (Internet Exchange Point: যেখানে অনেক ISP আর network একে অপরের সাথে সরাসরি traffic বদল করে)। কিন্তু সবচেয়ে বেশি traffic যাদের, তারা আরেক ধাপ এগিয়ে **ISP-র নিজের network-এর ভেতরে** cache server বসায়।

**Netflix Open Connect:** Netflix-এর নিজের বানানো CDN। Netflix-এর Open Connect site অনুযায়ী:
- Netflix নিজের **Open Connect Appliance (OCA)** নামের cache server বানায়, যেগুলো ISP-র network-এর ভেতরে (embedded) বা IXP-তে বসানো হয়।
- যোগ্য (qualifying) ISP-দের এই appliance **বিনা খরচে** দেওয়া হয়; ISP জায়গা, বিদ্যুৎ আর connectivity দেয়।
- ISP চাইলে IXP-তে Netflix-এর সাথে সরাসরি **peering**-ও করতে পারে।
- Appliance-গুলো আগে থেকে ভরা হয়, সাধারণত কম ব্যস্ত সময়ে (off-peak), সেই content দিয়ে যেটা ওই অঞ্চলে জনপ্রিয় হবে বলে আশা করা হয়। এটা একরকম **push**: user চাওয়ার আগেই কপি কাছে।

**Google Global Cache (GGC):** Google-এর cache server, যেগুলো ISP-র network-এর ভেতরে বসানো হয়, আর YouTube-এর মতো Google-এর জনপ্রিয় content সেখান থেকেই user-এর কাছে যায়।

**বাংলাদেশের মতো দেশের জন্য কেন এটা বড় ব্যাপার?**

বাংলাদেশের ISP-রা বাইরের internet-এর জন্য **আন্তর্জাতিক bandwidth** কেনে (সাবমেরিন cable বা প্রতিবেশী দেশের মাধ্যমে terrestrial link দিয়ে), আর এটা দেশের ভেতরের traffic-এর চেয়ে দামি আর সীমিত। ভাবুন একটা জনপ্রিয় video এক সন্ধ্যায় একটা ISP-র ১ লাখ গ্রাহক দেখল:
- **Cache ছাড়া**: ১ লাখ কপি আন্তর্জাতিক link দিয়ে আসে। Video প্রতি ৫০০ MB হলে ৫০ TB, সব বিদেশ থেকে।
- **ISP-র ভেতরে cache থাকলে**: video-টা আন্তর্জাতিক link দিয়ে আসে কয়েকবার (cache ভরার সময়), বাকি সব ISP-র নিজের network থেকে।

ফলে তিনজনেরই লাভ: user পায় কম latency আর কম buffering; ISP-র দামি আন্তর্জাতিক bandwidth বাঁচে, সন্ধ্যার ভিড়ে link আটকায় না; আর content company-র নিজের network খরচ কমে।

System design-এর শিক্ষা: CDN শুধু "দ্রুত" করার জন্য না, **কোন link দিয়ে byte যাবে** সেটা ঠিক করার জন্যও। সবচেয়ে দামি বা সবচেয়ে সরু link-এর আগে cache বসানোই মূল কৌশল।`,
      diagrams: [
        {
          id: "day-011-isp-cache",
          caption:
            "ISP-র ভেতরে cache: জনপ্রিয় video একবার আন্তর্জাতিক link পেরিয়ে ISP-র ভেতরের cache-এ আসে, তারপর হাজারো গ্রাহক সেখান থেকেই পায়।",
          alt: "বামে বাংলাদেশের গ্রাহক, তাদের থেকে মোটা তীর ISP-র ভেতরের cache-এ, লেখা বেশিরভাগ HIT; নিচে ISP network-এ অন্য traffic। Cache থেকে dashed তীর IXP বা CDN PoP-এ, লেখা miss / fill; সেখান থেকে আরেকটা dashed তীর ডানে বিদেশের Origin-এ, লেখা আন্তর্জাতিক link।",
        },
      ],
    },
    {
      title: "Edge-এ TLS, edge compute আর DDoS shield",
      markdown: `**TLS termination at the edge**

User-এর HTTPS connection শেষ হয় edge-এ, origin-এ না। তাই TCP আর TLS handshake-এর round trip (Day 7) হয় ঢাকার কাছের PoP-এর সাথে, ৩০ms-এ, ৭৫০ms-এ না। আর edge থেকে origin পর্যন্ত connection আগে থেকে খোলা রাখা হয় (connection reuse), তাই MISS-এও নতুন handshake লাগে না। Cache-এ না থাকা dynamic API-ও এভাবে কিছুটা দ্রুত হয়।

কিন্তু এর মানে কী, ভাবুন:
- **CDN আপনার traffic plaintext-এ দেখে।** Certificate (বা তার ব্যবহারের অধিকার) CDN-এর কাছে থাকে। আপনি তাকে বিশ্বাস করছেন।
- **Edge → origin অংশটাও encrypt করুন।** কিছু setting-এ user থেকে edge HTTPS, কিন্তু edge থেকে origin সাধারণ HTTP। Browser-এ তালা দেখায়, অথচ পথের অর্ধেক খোলা। Cloudflare-এর SSL mode-গুলোর মধ্যে "Flexible" ঠিক এটা করে; তারা নিজেরাই origin-এ certificate রেখে "Full (strict)" ব্যবহারের পরামর্শ দেয়।
- **Origin-এ সরাসরি আসা বন্ধ করুন।** Origin-এর IP জানা থাকলে যে কেউ CDN-কে পাশ কাটিয়ে সরাসরি আঘাত করতে পারে। Origin-এ শুধু CDN-এর IP range থেকে আসা traffic নিন।

TLS handshake কিভাবে কাজ করে, এখন এটুকু জানলেই চলবে, [Day 41](${topicHrefForDay(41)})-এ (TLS/SSL Handshake) আর [Day 78](${topicHrefForDay(78)})-এ (Encryption ও TLS) গভীরে যাব। আর HTTP/2, HTTP/3 edge-এ কী বদলায়, [Day 42](${topicHrefForDay(42)})-এ।

**Edge compute (পরিচিতি)**

এখন অনেক CDN edge-এ ছোট code চালাতে দেয়: Cloudflare Workers, CloudFront Functions ও Lambda@Edge, Fastly Compute। কাজ যেমন: URL redirect, header বদলানো, A/B test-এ user ভাগ করা, bot আটকানো, JWT যাচাই করে অননুমোদিত request edge-এই ফিরিয়ে দেওয়া। লাভ: user-এর কাছেই সিদ্ধান্ত, origin পর্যন্ত যেতে হয় না। সীমাবদ্ধতা: code-এর সময় আর memory সীমিত, আর database সাধারণত দূরে থাকে, তাই database-ভারী কাজ edge-এ চালালে লাভ হারায়। Serverless-এর দিক থেকে [Day 64](${topicHrefForDay(64)})-এ আর edge architecture [Day 88](${topicHrefForDay(88)})-এ দেখব।

**CDN একটা DDoS ঢাল**

**Volumetric DDoS** attack-এ লক্ষ লক্ষ machine থেকে এত traffic পাঠানো হয় যে আপনার server-এর link বা CPU ভরে যায়। একটা server বা একটা data center একা এটা সামলাতে পারে না।

CDN এখানে স্বাভাবিকভাবেই সাহায্য করে:
- তার মোট network capacity অনেক বড়, আর অনেক PoP-এ ছড়ানো। Anycast-এর কারণে attack traffic-ও যেখান থেকে আসছে তার কাছের PoP-গুলোতে ভাগ হয়ে যায়, এক জায়গায় জমে না।
- Cache থেকে দেওয়া জিনিসের জন্য attack origin পর্যন্ত পৌঁছায়ই না।
- Edge-এ rate limit ([Day 18](${topicHrefForDay(18)})) আর filtering দিয়ে খারাপ traffic আগেই আটকানো যায়।

তবে CDN জাদু না: cache হয় না এমন dynamic endpoint (যেমন \`/search?q=random\`) দিয়ে attacker প্রতিটা request origin-এ পাঠাতে পারে, আর origin-এর IP ফাঁস হলে পুরো ঢালটাই অর্থহীন। DDoS নিয়ে এখন এটুকু জানলেই চলবে, [Day 81](${topicHrefForDay(81)})-এ (DDoS Mitigation) গভীরে যাব।`,
    },
  ],

  tradeOffs: {
    markdown: `**কখন CDN ব্যবহার করবেন:** User-রা origin থেকে দূরে বা অনেক জায়গায় ছড়ানো; অনেক static file (ছবি, JS, CSS, font); video বা বড় download; traffic-এ বড় spike (sale, live খেলা); origin-কে আড়াল করা আর DDoS থেকে বাঁচানো দরকার।

**কখন লাভ কম, বা সাবধান:** সব user আর server একই শহরে আর content প্রায় সবই personalised (যেমন একটা অফিসের internal tool), তখন cache-এর সুযোগ কম, CDN মূলত TLS আর সুরক্ষার জন্য। প্রতিটা response user-ভেদে আলাদা, বা কয়েক সেকেন্ডের পুরনো data-ও চলবে না (bKash balance, stock-এর দাম), সেখানে cache না, শুধু pass-through।

**TTL বাছাইয়ের trade-off:** লম্বা TTL = বেশি hit ratio, কম origin load, কিন্তু বদল দেখাতে দেরি। ছোট TTL = তাজা data, কিন্তু বেশি miss। Versioned file name এই trade-off প্রায় মুছে দেয়, কারণ নাম বদলালেই নতুন জিনিস।

কোন ধরনের content কিভাবে পৌঁছাবেন, পাশাপাশি:`,
    table: {
      headers: [
        "বিষয়",
        "শুধু Origin",
        "Pull CDN",
        "Push CDN (আগে upload)",
        "ISP-র ভেতরে cache",
      ],
      rows: [
        [
          "User-এর latency",
          "দূরত্ব অনুযায়ী বেশি (ঢাকা-US ~২৫০ms RTT)",
          "HIT-এ কম; প্রতিটা PoP-এ প্রথম request ধীর",
          "প্রথম request থেকেই কম",
          "সবচেয়ে কম, ISP-র নিজের network-এ",
        ],
        [
          "Origin-এর load",
          "সব request",
          "শুধু miss (shield দিলে আরও কম)",
          "প্রায় শূন্য (upload-এর সময় ছাড়া)",
          "প্রায় শূন্য, cache ভরার সময় ছাড়া",
        ],
        [
          "Setup",
          "কিছু লাগে না",
          "সহজ: DNS/CNAME বদল আর header ঠিক করা",
          "Upload pipeline আর কী রাখবেন তার হিসাব লাগে",
          "ISP-র সাথে চুক্তি, hardware; শুধু খুব বড় traffic-এর জন্য",
        ],
        [
          "নতুন content দেখানো",
          "সাথে সাথে",
          "TTL বা purge বা versioned name অনুযায়ী",
          "আবার upload করলে",
          "Fill/refresh-এর সময় অনুযায়ী",
        ],
        [
          "Long-tail content",
          "সমস্যা নেই, সব origin থেকে",
          "Hit ratio কম",
          "সব upload করলে storage খরচ বেশি",
          "শুধু জনপ্রিয় content রাখা হয়, বাকিটা উপরের স্তর থেকে",
        ],
        [
          "উপযুক্ত",
          "ছোট app, একই অঞ্চলের user",
          "বেশিরভাগ website-এর static asset আর ছবি",
          "বড় download, game patch, আগে থেকে জানা release",
          "Netflix, YouTube-এর মতো বিশাল video traffic",
        ],
      ],
    },
  },

  industry: {
    markdown: `- **Netflix Open Connect**: Netflix-এর নিজের CDN। Netflix-এর Open Connect site অনুযায়ী তারা **Open Connect Appliance (OCA)** নামে নিজস্ব cache server বানায়, যেগুলো ISP-র network-এর ভেতরে বা IXP-তে বসানো হয়, আর যোগ্য ISP-দের বিনা খরচে দেওয়া হয়। Appliance-গুলো কম ব্যস্ত সময়ে জনপ্রিয় হবে এমন content দিয়ে আগে থেকে ভরা হয়।
- **Google Global Cache (GGC)**: Google-এর cache server, ISP-র network-এর ভেতরে বসানো, যেখান থেকে YouTube-এর মতো Google-এর জনপ্রিয় content স্থানীয়ভাবে দেওয়া হয়। Google-এর peering/interconnect documentation-এ ISP-দের জন্য এর বর্ণনা আছে।
- **Cloudflare**: তাদের documentation অনুযায়ী network anycast-এ চলে, response-এ \`cf-cache-status\` header দেয় (HIT, MISS, EXPIRED, REVALIDATED, DYNAMIC ইত্যাদি), আর default-এ নির্দিষ্ট file extension-এর static জিনিস cache করে; HTML-এর মতো response default-এ cache হয় না যদি না rule দিয়ে বলা হয়। Origin-এর \`Cache-Control\` সাধারণত মানা হয়, আর **Tiered Cache** তাদের origin shield-ধাঁচের feature।
- **Amazon CloudFront**: AWS-এর CDN; **Origin Shield** নামে আলাদা একটা মাঝের cache স্তর চালু করা যায়, আর **CloudFront Functions / Lambda@Edge** দিয়ে edge-এ code চালানো যায়।
- **Fastly**: shielding আর Compute (edge-এ code), আর Varnish-ধারার configuration-এর জন্য পরিচিত।

জনপ্রিয় নিজে চালানোর tool: **NGINX** (\`proxy_cache\`, আজকের lab), **Varnish Cache** (HTTP accelerator, request coalescing default), **Apache Traffic Server**। অনেক কোম্পানি ছোট পরিসরে নিজের "mini CDN" এগুলো দিয়েই বানায়।

সাধারণ ব্যবহার: e-commerce-এর product ছবি আর JS bundle, news site-এর ছবি আর ছোট TTL-এর home page, OTT প্ল্যাটফর্মের video segment, mobile app-এর update আর config file, software download।

*উৎস: Netflix Open Connect (openconnect.netflix.com: overview, ISP partnership, appliance deployment); Google Global Cache (Google peering/interconnect documentation); Cloudflare documentation (anycast network, cache-status values, default cache behavior, Tiered Cache, SSL/TLS encryption modes); Amazon CloudFront Developer Guide (Origin Shield, edge functions); MDN Web Docs: HTTP caching ও Cache-Control; NGINX documentation (ngx_http_proxy_module: proxy_cache, proxy_cache_lock, proxy_cache_revalidate)।*`,
  },

  mistakes: [
    {
      mistake:
        "Personalised বা গোপন response (cart, profile, /api/me) public cache-যোগ্য header দিয়ে পাঠানো, অথবা CDN-এ 'সব cache করো' rule দেওয়া। একজনের তথ্য আরেকজন দেখে ফেলে।",
      fix: "এসব response-এ Cache-Control: private বা no-store দিন, আর CDN-এ শুধু নির্দিষ্ট path (যেমন /static/) cache করুন। Deploy-এর পরে দুটো আলাদা account দিয়ে যাচাই করুন।",
    },
    {
      mistake:
        "'no-cache' দিয়ে ভাবা যে কিছুই cache হবে না। আসলে এটা রাখতে দেয়, শুধু প্রতিবার revalidate করায়।",
      fix: "সত্যিই কোথাও রাখতে না চাইলে no-store। প্রতিবার তাজা যাচাই চাইলে no-cache (ETag সহ, যাতে 304 পাওয়া যায়)।",
    },
    {
      mistake:
        "app.js, style.css-এর মতো একই নামে লম্বা TTL দেওয়া, তারপর deploy-এর পরে purge করে বা অপেক্ষা করে পুরনো JS-এর bug নিয়ে ভোগা। Browser-এর cache তো purge-ও হয় না।",
      fix: "Build-এ content hash দিয়ে versioned নাম (app.3f9a.js) আর max-age=31536000, immutable; HTML-কে ছোট TTL বা no-cache।",
    },
    {
      mistake:
        "Query string-এর tracking parameter (utm_source, fbclid) বা Vary: User-Agent দিয়ে cache key টুকরো টুকরো করা। একই ছবির শত কপি, hit ratio তলানিতে।",
      fix: "Cache key থেকে অপ্রয়োজনীয় query parameter বাদ দিন, আর Vary শুধু সত্যিই দরকারি header-এ (যেমন Accept-Encoding)।",
    },
    {
      mistake:
        "CDN বসিয়েও origin-এর IP খোলা রাখা, আর edge থেকে origin সাধারণ HTTP-তে। Attacker CDN-কে পাশ কাটায়, আর পথের অর্ধেক encrypt হয় না।",
      fix: "Origin-এ শুধু CDN-এর IP range থেকে traffic নিন, আর edge → origin-ও TLS দিয়ে, certificate যাচাই সহ।",
    },
    {
      mistake:
        "শুধু request hit ratio দেখে খুশি থাকা। ছোট icon-এ ৯৯% HIT, অথচ বড় video বা long-tail ছবি প্রায় সব MISS আর origin-এর bandwidth বিল কমছেই না।",
      fix: "Byte hit ratio, origin-এর request ও bandwidth, আর PoP অনুযায়ী MISS-এর হারও মাপুন; দরকারে origin shield চালু করুন।",
    },
    {
      mistake:
        "একটা বড় purge বা জনপ্রিয় file-এর মেয়াদ শেষে origin-এ হঠাৎ ঢেউ আসবে, এটা হিসাবে না রাখা।",
      fix: "Request collapsing, stale-while-revalidate আর origin shield চালু রাখুন; বড় purge কম ভিড়ের সময় করুন।",
    },
  ],

  lab: [
    {
      title: "প্রস্তুতি: একটা দূরের origin আর একটা NGINX edge",
      markdown: `এই lab-এ Docker Compose দিয়ে নিজের একটা ছোট CDN বানাবেন:
- **origin**: একটা ছোট Python server, প্রতিটা উত্তরে ইচ্ছা করে **৪০০ms** দেরি করে (দূরের server-এর ভান), আর প্রতিটা file-এর সাথে নিজের \`Cache-Control\` ও \`ETag\` পাঠায়।
- **edge**: NGINX, \`proxy_cache\` দিয়ে cache করে, আর প্রতিটা response-এ \`X-Cache-Status\` header-এ বলে দেয় HIT না MISS।

Docker আর \`curl\` ছাড়া কিছু লাগবে না। (\`%header{...}\` ব্যবহারের জন্য curl 7.84 বা নতুন লাগবে; \`curl --version\` দিয়ে দেখে নিন।)

\`\`\`bash
mkdir -p cdn-lab/edge && cd cdn-lab
\`\`\`

\`origin.py\`: পাঁচটা "file", প্রতিটার আলাদা Cache-Control। \`X-Origin-Hit\` header বলে origin এ পর্যন্ত মোট কতবার কাজ করেছে।

\`\`\`bash
cat > origin.py <<'EOF'
import hashlib
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

DELAY = 0.4  # দূরের origin-এর ভান: প্রতিটা উত্তরে ৪০০ms
hits = 0

# path → (body, Cache-Control)
FILES = {
    "/static/logo.svg": (b"<svg>" + b"x" * 50000 + b"</svg>", "public, max-age=20"),
    "/static/app.3f9a.js": (b"console.log('v1');" * 2000, "public, max-age=31536000, immutable"),
    "/static/app.7c21.js": (b"console.log('v2');" * 2000, "public, max-age=31536000, immutable"),
    "/api/me": (b'{"name": "Rahim", "balance": 500}', "private, no-store"),
    "/static/banner.jpg": (b"J" * 80000, "public, max-age=60"),
}


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        global hits
        path = self.path.split("?")[0]
        if path not in FILES:
            self.send_response(404)
            self.end_headers()
            return
        hits += 1
        time.sleep(DELAY)
        body, cache_control = FILES[path]
        etag = '"' + hashlib.md5(body).hexdigest()[:12] + '"'
        if self.headers.get("If-None-Match") == etag:
            self.send_response(304)  # বদলায়নি, body পাঠানোর দরকার নেই
            self.send_header("ETag", etag)
            self.send_header("Cache-Control", cache_control)
            self.send_header("X-Origin-Hit", str(hits))
            self.end_headers()
            print(f"#{hits} {path} -> 304", flush=True)
            return
        self.send_response(200)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", cache_control)
        self.send_header("ETag", etag)
        self.send_header("X-Origin-Hit", str(hits))
        self.end_headers()
        self.wfile.write(body)
        print(f"#{hits} {path} -> 200", flush=True)

    def log_message(self, *args):
        pass


print("origin listening on :8000", flush=True)
ThreadingHTTPServer(("0.0.0.0", 8000), Handler).serve_forever()
EOF
\`\`\`

\`edge/default.conf\`: এটাই আপনার CDN edge।

\`\`\`bash
cat > edge/default.conf <<'EOF'
proxy_cache_path /var/cache/nginx/edge levels=1:2 keys_zone=edge:10m
                 max_size=100m inactive=10m use_temp_path=off;

server {
    listen 80;

    location / {
        proxy_pass http://origin:8000;
        proxy_cache edge;
        proxy_cache_key $scheme$host$request_uri;
        proxy_cache_valid 200 1m;     # origin কিছু না বললে ১ মিনিট
        proxy_cache_revalidate on;    # মেয়াদ শেষে If-None-Match দিয়ে জিজ্ঞেস
        proxy_cache_lock on;          # একই miss-এ origin-এ একটাই request
        add_header X-Cache-Status $upstream_cache_status always;
    }
}
EOF
\`\`\`

কয়েকটা লাইনের মানে:
- \`proxy_cache_path\`: cache কোথায় থাকবে, key-র জন্য কত memory (\`keys_zone\`), সর্বোচ্চ কত বড়, আর ১০ মিনিট কেউ না চাইলে মুছে ফেলো (\`inactive\`)।
- \`proxy_cache_key\`: cache key। এখানে query string-ও আছে, পরীক্ষা ৫-এ এর ফল দেখবেন।
- \`proxy_cache_valid\`: origin নিজে \`Cache-Control\` না দিলে কতক্ষণ রাখবে। Origin \`max-age\` দিলে NGINX সেটাই মানে।

\`compose.yaml\`: edge থাকবে host-এর **8111** port-এ, আর তুলনার জন্য origin-কে সরাসরি **8112**-তে খোলা রাখছি।

\`\`\`bash
cat > compose.yaml <<'EOF'
name: sdlab-day011

services:
  origin:
    image: python:3.12-alpine
    container_name: sdlab-day011-origin
    command: python /origin.py
    volumes:
      - ./origin.py:/origin.py:ro
    ports:
      - "8112:8000"

  edge:
    image: nginx:1.27-alpine
    container_name: sdlab-day011-edge
    depends_on:
      - origin
    volumes:
      - ./edge:/etc/nginx/conf.d:ro
    ports:
      - "8111:80"

networks:
  default:
    name: sdlab-day011-net
EOF

docker compose up -d
docker compose ps
\`\`\`

দুটো container \`Up\` দেখাবে।`,
    },
    {
      title: "পরীক্ষা ১: প্রথমবার MISS, তারপর HIT",
      markdown: `একই file তিনবার চান, আর শুধু দরকারি header দেখুন:

\`\`\`bash
for i in 1 2 3; do
  curl -sI http://localhost:8111/static/logo.svg | grep -iE "^(cache-control|etag|x-origin-hit|x-cache-status)"
  echo
done
\`\`\`

এমন কিছু দেখবেন (ETag-এর মান আলাদা হতে পারে):

\`\`\`
Cache-Control: public, max-age=20
ETag: "6ab2d11ed88a"
X-Origin-Hit: 1
X-Cache-Status: MISS

Cache-Control: public, max-age=20
ETag: "6ab2d11ed88a"
X-Origin-Hit: 1
X-Cache-Status: HIT
...
\`\`\`

প্রথমবার \`MISS\`: edge-এর কাছে ছিল না, origin থেকে আনল। পরের দুবার \`HIT\`, আর \`X-Origin-Hit\` এখনো \`1\`। মানে origin একবারই কাজ করেছে; দ্বিতীয় আর তৃতীয় উত্তর edge-এর রাখা কপি, এমনকি header-গুলোও।

(\`curl -I\` আসলে \`HEAD\` request পাঠায়। NGINX cache-এর জন্য সেটাকে origin-এ \`GET\` হিসেবে পাঠায়, তাই কাজ করছে। আমাদের ছোট origin নিজে \`HEAD\` বোঝে না, তাই origin-কে সরাসরি জিজ্ঞেস করতে নিচে \`GET\` ব্যবহার করব।)`,
    },
    {
      title: "পরীক্ষা ২: সময় মাপুন, origin বনাম edge",
      markdown: `\`banner.jpg\` এখনো কেউ চায়নি। Origin-কে সরাসরি একবার, তারপর edge দিয়ে দুবার:

\`\`\`bash
curl -s -o /dev/null -w "origin সরাসরি: %{time_total}s\\n" http://localhost:8112/static/banner.jpg
for i in 1 2; do
  curl -s -o /dev/null -w "edge: %header{x-cache-status} %{time_total}s\\n" http://localhost:8111/static/banner.jpg
done
\`\`\`

মোটামুটি এমন:

\`\`\`
origin সরাসরি: 0.42s
edge: MISS 0.42s
edge: HIT 0.002s
\`\`\`

MISS-এ edge দিয়েও origin-এর সমান সময় (আসলে একটু বেশি, কারণ মাঝে একটা বাড়তি hop)। HIT-এ প্রায় দুইশো গুণ দ্রুত। এখানে ৪০০ms দেরি আমরা বানিয়েছি; বাস্তবে এটা ঢাকা থেকে দূরের region-এর round trip আর handshake। CDN এই দূরত্বটাই মুছে দেয়, কিন্তু **শুধু HIT-এ**।`,
    },
    {
      title: "পরীক্ষা ৩: TTL শেষ, তারপর 304 দিয়ে revalidation",
      markdown: `\`logo.svg\`-এর \`max-age=20\`। পরীক্ষা ১-এর পরে ২০ সেকেন্ড পার হয়ে থাকলে আবার চান (না হলে একটু অপেক্ষা করুন):

\`\`\`bash
sleep 21
curl -sI http://localhost:8111/static/logo.svg | grep -i x-cache-status
curl -sI http://localhost:8111/static/logo.svg | grep -i x-cache-status
docker logs sdlab-day011-origin
\`\`\`

প্রথমটা \`X-Cache-Status: REVALIDATED\`, দ্বিতীয়টা আবার \`HIT\`। আর origin-এর log-এর শেষ লাইন:

\`\`\`
#... /static/logo.svg -> 304
\`\`\`

কী ঘটল: মেয়াদ শেষ হওয়ায় edge পুরো file না চেয়ে \`If-None-Match\` দিয়ে জিজ্ঞেস করল "বদলেছে?" (এটা চালু করেছে \`proxy_cache_revalidate on\`)। Origin বলল \`304\`, body ছাড়া। Edge নিজের কপির মেয়াদ আবার ২০ সেকেন্ড বাড়িয়ে দিল। ৫০ KB-র বদলে শুধু কয়েকটা header আসা-যাওয়া করল।

\`proxy_cache_revalidate\` বন্ধ থাকলে এখানে \`EXPIRED\` দেখাত আর origin পুরো file আবার পাঠাত।`,
    },
    {
      title: "পরীক্ষা ৪: no-store, যেটা কখনো cache হয় না",
      markdown: `\`/api/me\` একজন user-এর ব্যক্তিগত তথ্য, origin পাঠায় \`Cache-Control: private, no-store\`:

\`\`\`bash
for i in 1 2 3; do
  curl -s -o /dev/null -D - http://localhost:8111/api/me | grep -iE "^(x-origin-hit|x-cache-status)"
done
\`\`\`

প্রতিবার \`X-Cache-Status: MISS\`, আর \`X-Origin-Hit\` প্রতিবার এক করে বাড়ছে। Edge প্রতিটা request origin-এ পাঠাচ্ছে, কিছুই রাখছে না। ঠিক এটাই চাই।

এবার ভাবুন origin ভুল করে এখানে \`public, max-age=60\` পাঠালে কী হতো: প্রথম user-এর \`{"name": "Rahim", "balance": 500}\` পরের এক মিনিট যে-ই \`/api/me\` চাইত সে-ই পেত। (চাইলে \`origin.py\`-এ বদলে \`docker compose restart origin\` দিয়ে নিজে দেখুন, তারপর আবার ঠিক করে দিন।)`,
    },
    {
      title: "পরীক্ষা ৫: cache key, versioned file name আর purge",
      markdown: `\`\`\`bash
url=http://localhost:8111/static
curl -s -o /dev/null -w "app.3f9a.js:        %header{x-cache-status}\\n" $url/app.3f9a.js
curl -s -o /dev/null -w "app.3f9a.js:        %header{x-cache-status}\\n" $url/app.3f9a.js
curl -s -o /dev/null -w "app.7c21.js:        %header{x-cache-status}\\n" $url/app.7c21.js
curl -s -o /dev/null -w "app.3f9a.js?utm=fb: %header{x-cache-status}\\n" "$url/app.3f9a.js?utm=fb"
\`\`\`

ফল: \`MISS\`, \`HIT\`, \`MISS\`, \`MISS\`।

- \`app.7c21.js\` (নতুন version) প্রথমবারেই \`MISS\` হয়ে origin থেকে এলো। কোনো purge লাগেনি, কারণ নামটাই নতুন, তাই cache key নতুন। পুরনো \`app.3f9a.js\` cache-এ থেকে গেল, rollback করলে কাজে লাগবে।
- \`?utm=fb\` জুড়তেই একই file আবার \`MISS\`, কারণ আমাদের cache key-তে \`$request_uri\` আছে, যার মধ্যে query string-ও পড়ে। Marketing link এভাবেই hit ratio কমায়।

**Purge:** Open-source NGINX-এ purge-এর আলাদা command নেই, তবে পুরো cache মুছে দেখা যায়:

\`\`\`bash
docker exec sdlab-day011-edge sh -c 'rm -rf /var/cache/nginx/edge/*'
curl -s -o /dev/null -w "%header{x-cache-status}\\n" $url/app.3f9a.js
\`\`\`

আবার \`MISS\`। এটা "সব purge"; বাস্তব CDN-এ নির্দিষ্ট URL বা tag ধরে purge করা যায়। খেয়াল করুন, purge-এর পরে প্রথম request-গুলো সব origin-এ যায়।`,
    },
    {
      title: "পরীক্ষা ৬: cache stampede আর request collapsing",
      markdown: `একটা নতুন key-তে (\`?campaign=eid\`, তাই cache-এ নেই) একসাথে ২০টা request পাঠান, আর গুনুন origin কয়টা পেল:

\`\`\`bash
before=$(docker logs sdlab-day011-origin 2>&1 | grep -c banner)
seq 20 | xargs -P 20 -I{} curl -s -o /dev/null -w "%header{x-cache-status}\\n" "http://localhost:8111/static/banner.jpg?campaign=eid" | sort | uniq -c
after=$(docker logs sdlab-day011-origin 2>&1 | grep -c banner)
echo "origin-এ নতুন request: $((after - before))"
\`\`\`

\`\`\`
  19 HIT
   1 MISS
origin-এ নতুন request: 1
\`\`\`

\`proxy_cache_lock on\`-এর কারণে প্রথম request origin-এ গেল, বাকি ১৯টা অপেক্ষা করে সেই উত্তরটাই পেল।

এবার lock বন্ধ করে একই পরীক্ষা, নতুন key দিয়ে (\`?campaign=puja\`):

\`\`\`bash
sed -i.bak 's/proxy_cache_lock on;/proxy_cache_lock off;/' edge/default.conf
docker exec sdlab-day011-edge nginx -s reload
sleep 2   # পুরনো worker-রা বিদায় নিক

before=$(docker logs sdlab-day011-origin 2>&1 | grep -c banner)
seq 20 | xargs -P 20 -I{} curl -s -o /dev/null -w "%header{x-cache-status}\\n" "http://localhost:8111/static/banner.jpg?campaign=puja" | sort | uniq -c
after=$(docker logs sdlab-day011-origin 2>&1 | grep -c banner)
echo "origin-এ নতুন request: $((after - before))"
\`\`\`

\`\`\`
  20 MISS
origin-এ নতুন request: 20
\`\`\`

একই file-এর জন্য origin ২০ বার কাজ করল। এটাই **cache stampede**, ছোট আকারে। এক PoP-এ ২,০০০ জন বা ৫০টা PoP একসাথে হলে কী হতো ভাবুন। Lock আবার চালু করুন:

\`\`\`bash
sed -i.bak 's/proxy_cache_lock off;/proxy_cache_lock on;/' edge/default.conf
docker exec sdlab-day011-edge nginx -s reload
\`\`\`

(Reload-এর পরে পুরনো worker process-গুলো হাতের কাজ শেষ করে তবে বিদায় নেয়, তাই \`sleep 2\`; না দিলে প্রথম কয়েকটা request পুরনো config-এ চলতে পারে। \`sed -i.bak\` Linux আর macOS দুই জায়গাতেই চলে; পাশে একটা \`.bak\` file থাকবে, NGINX শুধু \`.conf\` পড়ে, তাই সমস্যা নেই।)`,
    },
    {
      title: "পরীক্ষা ৭ (ঐচ্ছিক): একটা আসল CDN-এর header পড়ুন",
      markdown: `যেকোনো public CDN থেকে আসা একটা file-এর header দেখুন, যেমন cdnjs-এর একটা JavaScript library:

\`\`\`bash
curl -sI https://cdnjs.cloudflare.com/ajax/libs/jquery/3.7.1/jquery.min.js | grep -iE "^(cache-control|age|cf-cache-status|etag|last-modified|vary|server)"
\`\`\`

মান সময় আর জায়গা অনুযায়ী বদলায়, তাই নিজের output এভাবে পড়ুন:
- \`cache-control\`: versioned library, তাই সাধারণত খুব লম্বা \`max-age\` আর \`immutable\`। URL-এর \`3.7.1\` অংশটাই version, ঠিক আমাদের \`app.3f9a.js\`-এর মতো।
- \`cf-cache-status\`: আপনার কাছের edge-এ HIT না MISS।
- \`age\` (থাকলে): কপিটা edge-এ কত সেকেন্ড ধরে আছে।
- \`vary\`: সাধারণত \`Accept-Encoding\`, অর্থাৎ compression অনুযায়ী আলাদা কপি।

দুই-তিনবার চালান: প্রথমবার MISS এলেও পরের বার সাধারণত HIT।`,
    },
    {
      title: "পরিষ্কার করুন",
      markdown: `\`\`\`bash
docker compose down
cd .. && rm -rf cdn-lab
\`\`\`

এটা দুটো container আর \`sdlab-day011-net\` network মুছে দেবে। Image-গুলো অন্য lab-এও লাগে; মুছতে চাইলে \`docker rmi python:3.12-alpine nginx:1.27-alpine\`।

চাইলে আরও খেলুন: \`origin.py\`-এ \`logo.svg\`-এর header \`public, max-age=5, stale-while-revalidate=30\` করুন (\`docker compose restart origin\`), আর edge-এর config-এ \`proxy_cache_background_update on;\` যোগ করে \`nginx -s reload\` দিন। এখন ৫ সেকেন্ড পরের প্রথম request-এ \`STALE\` আসবে, প্রায় HIT-এর গতিতে, আর NGINX পেছনে নতুন কপি আনবে; পরেরটা আবার \`HIT\`। আর \`proxy_cache_key\`-এ \`$request_uri\`-এর বদলে \`$uri\` দিয়ে দেখুন \`?utm=fb\` এখন HIT হয় কিনা।`,
    },
  ],

  connections: {
    markdown: `- **[Day 2](${topicHrefForDay(2)}) · Client, Server ও Internet**: latency-র চার উৎসের মধ্যে **propagation** শুধু দূরত্ব কমিয়েই কমানো যায়। CDN ঠিক সেটা করে: data user-এর কাছে আনে।
- **[Day 3](${topicHrefForDay(3)}) · DNS, HTTP ও URL**: CNAME আর GeoDNS দিয়ে user কাছের PoP-এ যায়; DNS-এর TTL আর CDN-এর TTL একই idea (কতক্ষণ পুরনো উত্তর বিশ্বাস করা যায়); \`Cache-Control\`, ETag আর 304 সেখানেই প্রথম দেখেছিলাম।
- **[Day 5](${topicHrefForDay(5)}) · Scalability**: read-heavy load-এর প্রথম হাতিয়ারগুলোর একটা। Origin না বাড়িয়েই অনেক বেশি user সামলানো যায়।
- **[Day 6](${topicHrefForDay(6)}) · Availability**: stale-if-error দিয়ে origin down থাকলেও পুরনো কপি দেওয়া, আর anycast-এ একটা PoP পড়লে পরেরটায় যাওয়া।
- **[Day 7](${topicHrefForDay(7)}) · Latency vs Throughput**: RTT ২৫০ms থেকে ১০ms, আর handshake-এর round trip কাছের edge-এ। Hit ratio দিয়ে গড় latency-র হিসাব।
- **[Day 9](${topicHrefForDay(9)}) · Load Balancers**: anycast আর DNS-based steering সেখানে load balancer-এর উপরের স্তর হিসেবে দেখেছিলাম; CDN-এর প্রতিটা PoP-এর ভেতরেও load balancer edge server-গুলোর মধ্যে request ভাগ করে।

সামনে যেখানে এগুলো আবার আসবে: [Day 15](${topicHrefForDay(15)})-এ Proxy Servers (CDN আসলে একটা বিশাল reverse proxy), [Day 17](${topicHrefForDay(17)})-এ Caching গভীরে (eviction, stampede-এর আরও কৌশল, cache-এর ধরন), [Day 18](${topicHrefForDay(18)})-এ Rate Limiting, [Day 19](${topicHrefForDay(19)})-এ Capacity Estimation (bandwidth আর hit ratio-র হিসাব), [Day 33](${topicHrefForDay(33)})-এ Object Storage (CDN-এর সবচেয়ে প্রচলিত origin), [Day 40](${topicHrefForDay(40)})-এ DNS গভীরে, [Day 41](${topicHrefForDay(41)})-এ TLS Handshake, [Day 42](${topicHrefForDay(42)})-এ HTTP/1.1 vs HTTP/2 vs HTTP/3, [Day 64](${topicHrefForDay(64)})-এ Serverless, [Day 81](${topicHrefForDay(81)})-এ DDoS Mitigation, আর [Day 88](${topicHrefForDay(88)})-এ Multi-region ও Edge।`,
  },

  explainYourself: [
    {
      question:
        'আপনার teammate বলছে, "server-টা আরও শক্তিশালী করলেই ঢাকার user-দের জন্য site দ্রুত হবে, CDN লাগবে না।" কতটা ঠিক?',
      idealAnswer:
        "আংশিক ঠিক। Server ভিড়ে ধীর হলে বড় server queuing আর processing-এর সময় কমায়। কিন্তু server দূরে (যেমন US East) থাকলে প্রতিটা round trip-এ ~২৫০ms propagation আর handshake-এর কয়েকটা RTT থেকেই যায়, কারণ আলোর গতি বাড়ানো যায় না। CDN data user-এর কাছে আনে, ফলে RTT ১০ms-এর ঘরে নামে, আর একই সাথে origin-এর load ও bandwidth খরচও কমায়, যেটা বড় server দিয়ে শুধু টাকা খরচ করে কিনতে হতো।",
    },
    {
      question:
        "Deploy-এর পরে কিছু user নতুন HTML-এর সাথে পুরনো app.js পাচ্ছে আর page ভেঙে যাচ্ছে। কেন হলো, আর কিভাবে স্থায়ীভাবে ঠিক করবেন?",
      idealAnswer:
        "app.js একই নামে লম্বা TTL দিয়ে cache করা ছিল, তাই CDN-এর edge আর user-এর browser দুজনেই পুরনো কপিকে তাজা ধরছে, যদিও HTML নতুন। Purge করলে CDN ঠিক হয়, কিন্তু browser-এর cache থেকে যায়, আর সব PoP-এ পৌঁছাতে সময়ও লাগে। স্থায়ী সমাধান হলো build-এ content hash দিয়ে versioned নাম (app.7c21.js) আর লম্বা TTL ও immutable, আর HTML-কে ছোট TTL বা no-cache; নতুন HTML নতুন নাম দেখায়, তাই পুরনো কপির প্রশ্নই ওঠে না।",
    },
    {
      question:
        "আপনার CDN-এ ৫০টা PoP। একটা জনপ্রিয় ছবির TTL ৬০ সেকেন্ড। Hit ratio ৯৯%, তবুও origin চাপে আছে। কারণ কী হতে পারে, আর কী করবেন?",
      idealAnswer:
        "প্রতিটা PoP-এর cache আলাদা, তাই প্রতি মিনিটে প্রতিটা PoP-এ মেয়াদ শেষ হলে প্রত্যেকে আলাদাভাবে origin-কে জিজ্ঞেস করে: একটা ছবিতেই মিনিটে ৫০টা, হাজারটা জনপ্রিয় file-এ মিনিটে ৫০,০০০। আর মেয়াদ শেষের মুহূর্তে একই PoP-এ অনেক request একসাথে এলে stampede হয়। সমাধান: origin shield বা tiered cache দিয়ে সব PoP-এর miss এক জায়গায় মেলানো, request collapsing আর stale-while-revalidate চালু করা, ETag দিয়ে 304 revalidation, আর সম্ভব হলে versioned নাম দিয়ে TTL অনেক বাড়ানো।",
    },
  ],

  interviewQuestions: [
    {
      question:
        "একটা e-commerce site-এর product ছবি আর JS বাংলাদেশের user-দের কাছে দ্রুত পৌঁছাতে design করুন। Origin আছে Singapore-এ।",
      answerOutline: `- সমস্যা মাপুন: RTT, প্রতিটা page-এ কত file, দিনে কত request ও GB (napkin math)
- CDN সামনে: static.domain → CNAME → CDN; কাছের PoP (DNS steering/anycast)
- Origin: ছবির জন্য object storage, JS/CSS build artifact
- Header: asset-এ versioned নাম + max-age=31536000, immutable; HTML ছোট TTL বা no-cache; API-তে private/no-store
- Cache key: অপ্রয়োজনীয় query বাদ, Vary শুধু Accept-Encoding
- Origin shield, request collapsing; ছবির জন্য আলাদা আকার (thumbnail) যাতে বড় file কম যায়
- Metrics: hit ratio (request ও byte), origin egress, edge latency p95`,
    },
    {
      question: "Cache invalidation কিভাবে করবেন? Purge নাকি versioning?",
      answerOutline: `- Purge: সব PoP-এ পৌঁছাতে সময়, browser cache ছোঁয় না, origin-এ ঢেউ, সীমা/খরচ
- Versioned (content-hash) নাম: নতুন key, purge লাগে না, লম্বা TTL নিরাপদ, rollback সহজ
- HTML বা যে URL বদলানো যায় না: ছোট TTL, no-cache + ETag, বা stale-while-revalidate
- Purge রাখুন জরুরি অবস্থার জন্য (ভুল করে গোপন কিছু cache হলে)`,
    },
    {
      question: "CDN-এর hit ratio কম। কী কী কারণ হতে পারে, কিভাবে বাড়াবেন?",
      answerOutline: `- Cache key টুকরো: tracking query, Vary: User-Agent/Cookie → key normalize
- TTL খুব ছোট বা origin no-cache/private পাঠাচ্ছে ভুল করে → header ঠিক করা
- Long tail: অনেক অজনপ্রিয় object → origin shield/tiered cache, বড় cache
- অনেক PoP-এ traffic ছড়ানো → প্রতি PoP-এ কম request → tiered cache
- Purge বেশি ঘন ঘন → versioned নাম
- মাপুন request আর byte দুই hit ratio, PoP ও path অনুযায়ী`,
    },
    {
      question:
        "একটা জনপ্রিয় live খেলার stream লাখো মানুষ একসাথে দেখবে। CDN-এর দিক থেকে কী প্রস্তুতি নেবেন?",
      answerOutline: `- HLS/DASH: segment immutable → লম্বা TTL; playlist খুব ছোট TTL
- একই নতুন segment সবাই একসাথে চায় → request collapsing আবশ্যক
- Origin shield / tiered cache যাতে origin (packager) একবার পায়
- Adaptive bitrate: দুর্বল network-এ কম quality
- Stale-if-error/playlist-এর জন্য সতর্কতা; origin redundancy
- আগে থেকে capacity planning, ISP/IXP-এর কাছাকাছি cache`,
    },
    {
      question:
        "CDN ব্যবহার করলে নিরাপত্তার দিক থেকে কী লাভ, আর কী নতুন ঝুঁকি?",
      answerOutline: `- লাভ: volumetric DDoS শোষণ (বড় capacity, anycast-এ ছড়ানো), cache-এর জিনিসে origin পর্যন্ত attack পৌঁছায় না, edge-এ WAF/rate limit, origin আড়াল
- ঝুঁকি: CDN TLS terminate করে, traffic plaintext-এ দেখে (বিশ্বাস)
- Edge → origin HTTP হলে অর্ধেক পথ খোলা → Full (strict)-ধাঁচের TLS
- Origin IP ফাঁস হলে পাশ কাটানো → শুধু CDN-এর IP range allow
- ভুল header-এ ব্যক্তিগত data shared cache-এ (cache poisoning/leak) → private/no-store`,
    },
  ],

  summary: {
    points: [
      "CDN content-এর কপি user-এর কাছের edge PoP-এ রাখে; লাভ তিনটা: কম latency, কম origin load, কম bandwidth খরচ।",
      "User কাছের edge-এ যায় DNS steering বা anycast দিয়ে; সেখানে HIT হলে সাথে সাথে, MISS হলে origin fetch করে রেখে দেয়।",
      "Origin-ই নির্দেশ দেয়: Cache-Control (max-age, s-maxage, public/private), আর no-cache মানে 'জিজ্ঞেস করে দাও', no-store মানে 'রেখো না'।",
      "TTL শেষে ETag আর If-None-Match দিয়ে revalidation; না বদলালে 304, body ছাড়া।",
      "Hit ratio-র আসল হিসাব miss-এ: ৯৫% থেকে ৯৯% মানে origin-এর load পাঁচ ভাগের এক ভাগ। Cache key আর Vary টুকরো হলে hit ratio পড়ে যায়।",
      "Purge-এর বদলে versioned file name (app.3f9a.js) আর লম্বা TTL; HTML-কে ছোট TTL।",
      "Origin shield, request collapsing আর ISP-এর ভেতরের cache (Open Connect, GGC) origin আর আন্তর্জাতিক link-কে বাঁচায়।",
    ],
    diagram: {
      id: "day-011-summary",
      caption: "এক নজরে CDN",
      alt: "User থেকে Edge PoP (HIT), Edge থেকে Origin Shield (MISS), Shield থেকে Origin।",
    },
  },
};
