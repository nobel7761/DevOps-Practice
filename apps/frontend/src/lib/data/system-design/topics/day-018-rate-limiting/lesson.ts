// Day 18 · Rate Limiting — Phase 2 lesson (Day 81 goes deeper into DDoS, Day 57 into retries).

import { topicHrefForDay } from "@/lib/data/courses/system-design-a-z";
import type { SdLesson } from "@/lib/system-design/lesson.types";

export const day018Lesson: SdLesson = {
  topicId: "sd-day-018",
  day: 18,
  title: "Rate Limiting",
  definition:
    "Rate Limiting হলো একটা নিয়ম, যেটা ঠিক করে দেয় একজন client নির্দিষ্ট সময়ে কয়টা request পাঠাতে পারবে; সীমা পেরোলে বাড়তি request সাথে সাথে ফিরিয়ে দেওয়া হয় (সাধারণত HTTP 429)।",

  objectives: [
    "কেন rate limit লাগে (brute-force, scraping, noisy neighbour, খরচ, downstream রক্ষা, fairness), আর কোথায় কোন key ধরে (IP, user, API key, endpoint) বসাবেন, যুক্তি দিয়ে বলতে পারবেন।",
    "Token Bucket, Leaky Bucket, Fixed Window, Sliding Window Log আর Sliding Window Counter কিভাবে কাজ করে, burst-এ কেমন আচরণ করে আর কত memory খায়, তুলনা করতে পারবেন।",
    "Token refill, সর্বোচ্চ burst, N সেকেন্ডে সর্বোচ্চ request আর fixed window-এর edge burst (2×) হিসাব করতে পারবেন।",
    "429, Retry-After আর rate limit header দিয়ে সঠিক উত্তর দিতে, আর client-এ exponential backoff with jitter বানাতে পারবেন।",
    "Load balancer-এর পেছনে একাধিক server-এর জন্য Redis দিয়ে distributed rate limiter ডিজাইন করতে পারবেন: atomicity, race condition আর Redis down হলে fail-open/fail-closed সিদ্ধান্ত সহ।",
  ],

  prerequisites: [
    { day: 4, title: "API কী? REST-এর বেসিক", href: topicHrefForDay(4) },
    { day: 9, title: "Load Balancers", href: topicHrefForDay(9) },
    { day: 16, title: "API Gateway", href: topicHrefForDay(16) },
    { day: 17, title: "Caching", href: topicHrefForDay(17) },
  ],

  problem: {
    markdown: `"টিকিটঘর" একটা ছোট startup, online-এ বাসের টিকিট বেচে। সারা বছর সব ঠিকঠাক চলে। তারপর ঈদের আগের সপ্তাহে, যখন সবচেয়ে বেশি বিক্রি হওয়ার কথা, তখনই site প্রায় অচল হয়ে গেল। Log ঘেঁটে টিম যা পেল:

1. **Login endpoint-এ bot:** একটা script ফাঁস হওয়া password-এর তালিকা নিয়ে মিনিটে হাজার হাজার বার \`POST /login\` করছে (**brute-force** আর credential stuffing)। প্রতিটা চেষ্টায় password hash মেলাতে CPU খরচ হচ্ছে।
2. **Scraper:** এক প্রতিযোগী সেকেন্ডে শত শত বার \`/search\` call করে সব route-এর দাম তুলে নিচ্ছে। প্রতিটা search database-এ ভারী query।
3. **OTP-র বিল:** কেউ \`/send-otp\` বারবার চাপছে। প্রতিটা SMS-এর জন্য টিকিটঘর SMS gateway-কে টাকা দেয়, এক রাতে বিল কয়েক গুণ।
4. **Partner-এর bug:** একটা travel agency-র integration-এ loop-এর ভুলে একই \`/seats\` request অনবরত আসছে।

ফল: database CPU 100%, আর **সাধারণ যাত্রী**, যে একটা টিকিট কাটতে চায়, সে timeout পাচ্ছে। দোষ তার না, কিন্তু ভুগছে সে।

টিমের প্রথম চিন্তা: "আরও server দাও।" দিল। বিল বাড়ল, কিন্তু bot-ও তো নিজের গতি বাড়াতে পারে, আর database সহজে ১০ গুণ করা যায় না। আসল সমস্যা server কম না। সমস্যা হলো **কে কতটা পাবে, তার কোনো নিয়ম নেই**। একজন চাইলেই সবার ভাগ খেয়ে ফেলতে পারে।`,
    diagrams: [
      {
        id: "day-018-before",
        caption:
          "আগে: কোনো সীমা নেই; কয়েকটা bot আর scraper পুরো server আর database দখল করে, সাধারণ user timeout পায়।",
        alt: "Login Bot আর Scraper অনেক request পাঠাচ্ছে API Server-এ; API Server আর Database লাল চিহ্নে overloaded; Real User-এর একটা request timeout হচ্ছে।",
      },
    ],
  },

  analogy: {
    markdown: `ঢাকার একটা ছয়তলা বাসার কথা ভাবুন। নিচে একটা মোটর, আর ছাদে **প্রতিটা ফ্ল্যাটের আলাদা ছোট ট্যাংক**।

- মোটর প্রতিটা ট্যাংক একটা **নির্দিষ্ট গতিতে** ভরে, ধরুন ঘণ্টায় ১০০ লিটার। এর বেশি দ্রুত ভরানো যায় না।
- প্রতিটা ট্যাংক **৫০০ লিটারের বেশি ধরে না**। ভরা থাকলে বাড়তি পানি উপচে পড়ে যায়, জমে না।
- সকালে ট্যাংক ভরা থাকলে আপনি একসাথে অনেক পানি পান: গোসল, কাপড় ধোয়া, সব একবারে। এটা **burst**।
- কিন্তু সারাদিন washing machine চালিয়ে ট্যাংক খালি করে ফেললে কল দিয়ে শুধু ততটুকুই পড়বে, যতটুকু মোটর ভরছে। কল শুকনো মানে "এখন না, একটু পরে আসুন"।
- আর সবচেয়ে জরুরি: তিনতলার ভাড়াটিয়া নিজের ট্যাংক খালি করলেও **অন্যদের ট্যাংকে হাত দিতে পারে না**। প্রত্যেকের ভাগ আলাদা।

Rate Limiting ঠিক এটাই:
- **মোটরের গতি = refill rate** (প্রতি সেকেন্ডে কয়টা request-এর অনুমতি জমে)
- **ট্যাংকের মাপ = bucket capacity** (একবারে সর্বোচ্চ কত request, অর্থাৎ burst)
- **প্রতি ফ্ল্যাটে আলাদা ট্যাংক = per-user limit** (একজনের বাড়াবাড়ি আরেকজনকে ভোগায় না)
- **শুকনো কল = 429 Too Many Requests**

বাড়িওয়ালা যদি সবার জন্য একটাই বড় ট্যাংক রাখতেন, এক ফ্ল্যাটের অপচয়ে পুরো বাসা পানিহীন হতো। টিকিটঘরে ঠিক সেটাই হয়েছিল।`,
    diagrams: [
      {
        id: "day-018-analogy",
        caption:
          "একটা মোটর প্রতিটা ফ্ল্যাটের নিজের ট্যাংক নির্দিষ্ট গতিতে ভরে; খালি ট্যাংক মানে অপেক্ষা, অন্যের ট্যাংক অক্ষত।",
        alt: "বামে একটা মোটর, pipe দিয়ে তিনটা ট্যাংকে পানি যাচ্ছে: ফ্ল্যাট ১-এর ট্যাংক প্রায় ভরা, ফ্ল্যাট ২-এর অর্ধেক, ফ্ল্যাট ৩-এর খালি আর লাল দাগে চিহ্নিত।",
      },
    ],
  },

  coreConcept: {
    markdown: `**Rate Limiting** মানে প্রতিটা client-এর request গোনা, আর নির্দিষ্ট সময়ে নির্দিষ্ট সংখ্যার বেশি হলে বাড়তি request **কাজ শুরুর আগেই** ফিরিয়ে দেওয়া। যেমন: "প্রতি user প্রতি মিনিটে ৬০টা request", "প্রতি IP প্রতি ১৫ মিনিটে ৫টা login চেষ্টা"।

**কেন লাগে?** এক কথায়, একটা shared resource (server, database, টাকা) যেন কেউ একা খেয়ে ফেলতে না পারে।
- **Abuse ঠেকানো:** brute-force login, OTP/SMS bombing, fake account তৈরি।
- **Scraping কমানো:** কেউ আপনার পুরো catalog বা দাম টেনে নিতে পারে না, অন্তত দ্রুত পারে না।
- **Noisy neighbour:** অনেক customer একই system ভাগ করলে (multi-tenant) একজনের ভারী ব্যবহার বাকিদের ধীর করে না।
- **খরচ নিয়ন্ত্রণ:** SMS, email, payment বা AI API-র মতো যেসব call-এ প্রতিবার টাকা লাগে।
- **Downstream রক্ষা:** database, পুরনো কোনো service বা partner-এর API, যেগুলো একটা নির্দিষ্ট চাপের বেশি নিতে পারে না।
- **Fairness:** সবাই নিজের ন্যায্য ভাগ পায়।

**কোথায় বসাবেন?**
- **Client-এ:** button দুবার চাপা আটকানো, SDK-তে নিজের গতি সীমিত রাখা। ভদ্রতা, কিন্তু **নিরাপত্তা না**: attacker আপনার client ব্যবহারই করবে না।
- **Edge / API Gateway-তে** (Day 16): সবচেয়ে প্রচলিত জায়গা। বাড়তি request server-এ পৌঁছানোর আগেই আটকে যায়, আর সব service-এর জন্য এক জায়গায় নিয়ম।
- **Service-এর ভেতরে (middleware):** যখন business context লাগে, যেমন "free plan-এ দিনে ১০০টা export"। Gateway এটা জানে না।
- **বাইরে যাওয়া call-এ (outbound):** partner যদি বলে "সেকেন্ডে ১০টার বেশি পাঠাবেন না", তাহলে নিজের দিকেই limit বসান।

**কিসের ভিত্তিতে গুনবেন (key)?**
- **IP address:** login-এর আগে এটাই একমাত্র উপায়। কিন্তু সাবধান: অনেক mobile network আর অফিসে শত শত মানুষ একই public IP দিয়ে বের হয় (NAT), তাই কঠোর IP limit নির্দোষ মানুষকেও আটকায়।
- **User ID বা API key:** login-এর পরে সবচেয়ে ন্যায্য, কারণ মানুষ ধরে গোনে।
- **Endpoint:** \`/login\` আর \`/send-otp\`-এ কঠোর, \`/search\`-এ মাঝারি, static জিনিসে প্রায় কিছু না।
- বাস্তবে প্রায়ই **মিশ্রণ**: "user + endpoint", বা login-এ "IP + username" দুটোই।

একটা request-এর পথ: request আসে → key বের করা হয় (যেমন \`user:42\`) → counter বা bucket দেখা হয় → জায়গা থাকলে request এগোয়, না থাকলে সাথে সাথে **429 Too Many Requests** ফেরত যায়।

মূল লাভটা খেয়াল করুন: একটা request বাতিল করা প্রায় বিনামূল্যে, একটা counter দেখা মাত্র। অথচ সেটা ঢুকতে দিলে database query, password hash, SMS-এর টাকা, সব খরচ হতো।

**খরচ কী?** প্রতিটা request-এ একটা বাড়তি ধাপ (counter দেখা), একটা নতুন অংশ (যেমন Redis) চালু রাখা, আর limit ভুল হলে আসল user-কেও আটকানোর ঝুঁকি। Limit খুব ঢিলা হলে সুরক্ষা নেই, খুব কড়া হলে ভালো customer রাগ করে চলে যায়।`,
    diagrams: [
      {
        id: "day-018-main",
        caption:
          "পরে: API Gateway প্রতিটা request-এ shared counter দেখে; সীমার ভেতরে থাকলে এগোয়, বাড়তি হলে সাথে সাথে 429।",
        alt: "User A আর Bot API Gateway-তে request পাঠায়; Gateway Redis counter-এ token আছে কিনা দেখে; User A-র request API Server ও Database-এ যায়, Bot-এর বাড়তি request লাল দাগে 429 পায়।",
        downloadable: true,
      },
      {
        id: "day-018-before-after",
        caption:
          "পাশাপাশি: সীমা ছাড়া কয়েকজন সবার ভাগ খায়; rate limiter থাকলে বাড়তি request gateway-তেই থামে।",
        alt: "উপরে সীমাহীন design যেখানে bot ও scraper server আর database overload করছে; নিচে API Gateway আর Redis counter সহ design যেখানে bot 429 পাচ্ছে।",
      },
    ],
  },

  deepDive: [
    {
      title: "Bucket-ভিত্তিক algorithm: Token Bucket আর Leaky Bucket",
      markdown: `**Token Bucket** সবচেয়ে বেশি ব্যবহৃত algorithm। দুটো সংখ্যা দিয়ে চলে:
- **Capacity (b):** bucket-এ সর্বোচ্চ কয়টা token থাকতে পারে
- **Refill rate (r):** প্রতি সেকেন্ডে কয়টা token ঢোকে

প্রতিটা request একটা token খরচ করে। Token থাকলে পাস, না থাকলে 429। ভরা bucket-এ নতুন token জমে না, উপচে যায়।

Implementation-এ আসলে কোনো timer টোকেন ঢোকায় না। প্রতি key-র জন্য শুধু দুটো জিনিস রাখা হয়: \`tokens\` আর \`last_refill\` (শেষ কখন হিসাব হয়েছিল)। Request এলে:

\`\`\`text
elapsed = now - last_refill
tokens  = min(capacity, tokens + elapsed × rate)
last_refill = now
if tokens >= 1: tokens -= 1, allow
else: reject (429)
\`\`\`

তাই memory খুব কম: প্রতি key-তে দুটো সংখ্যা।

**হিসাবগুলো মুখস্থ না, বুঝে রাখুন:**
- সবচেয়ে বড় burst = **capacity**। (b = 10 হলে একবারে সর্বোচ্চ 10টা।)
- টানা চাপে দীর্ঘমেয়াদি গতি = **refill rate**। (r = 2/s হলে মিনিটে 120টা।)
- যেকোনো T সেকেন্ডে সর্বোচ্চ request = **b + r × T**। (b = 10, r = 2/s, T = 5s হলে 10 + 10 = 20টা।)
- খালি bucket পুরো ভরতে লাগে **b ÷ r** সেকেন্ড। (10 ÷ 2 = 5s।)

Token Bucket জনপ্রিয় কারণ এটা মানুষের আসল আচরণের সাথে মেলে: app খোলার সময় একসাথে ৮-১০টা call যায়, তারপর অনেকক্ষণ চুপ। এই ছোট burst সে মেনে নেয়, কিন্তু দীর্ঘ চাপ মানে না। আরেকটা সুবিধা: সব request-এর দাম সমান না হলে ভারী request-এ একাধিক token কাটা যায় (যেমন একটা bulk export = 10 token)।

**Leaky Bucket** উল্টো দিক থেকে ভাবে। Request-গুলো একটা নির্দিষ্ট মাপের **queue**-তে ঢোকে, আর queue থেকে **স্থির গতিতে** বের হয়ে process হয়, যেমন ফুটো বালতি থেকে টপটপ করে পানি পড়ে। Queue ভরা থাকলে নতুন request বাদ।
- **ফল:** downstream সবসময় সমান, মসৃণ গতিতে request পায়। burst আসলেও বের হয় একই গতিতে।
- **দাম:** burst-এর request-গুলো queue-তে অপেক্ষা করে, তাই latency বাড়ে। Queue 10, বের হওয়ার গতি 5/s হলে queue-এর শেষ request প্রায় 2s অপেক্ষা করবে।
- **কখন:** যখন পেছনের জিনিসটা (পুরনো system, partner API, SMS gateway) এক বিন্দুও বাড়তি চাপ নিতে পারে না।

NGINX-এর \`limit_req\` module নিজেকে leaky bucket পদ্ধতি বলে। সেখানে \`burst\` হলো queue-এর মাপ, আর \`nodelay\` দিলে queue-তে বসিয়ে না রেখে burst-এর request সাথে সাথে ছেড়ে দেয়, ফলে আচরণ token bucket-এর কাছাকাছি হয়ে যায়। নিচের lab-এ নিজে দেখবেন।

নিচের simulator-এ নিজে চালিয়ে দেখুন: capacity আর refill rate বদলে burst পাঠালে কয়টা পাস হয়।`,
      diagrams: [
        {
          id: "day-018-token-bucket",
          caption:
            "ধাপে ধাপে Token Bucket (capacity 5, refill 1/s): burst পাস, খালি হলে 429, আর চুপ থাকলেও token 5-এর বেশি জমে না।",
          alt: "বামে একটা bucket-এ পাঁচটা token-এর ঘর, প্রতি ধাপে কয়টা ভরা দেখায়; ডানে 0 থেকে 12 সেকেন্ডের timeline-এ সবুজ (পাস) আর লাল (429) বিন্দু।",
        },
      ],
    },
    {
      title:
        "Window-ভিত্তিক algorithm: Fixed Window, Sliding Log আর Sliding Counter",
      markdown: `**Fixed Window Counter** সবচেয়ে সহজ। সময়কে সমান টুকরোয় ভাগ করুন (যেমন প্রতি মিনিট), প্রতি টুকরোর জন্য একটা counter রাখুন। Key হয় এরকম: \`rl:user42:10:05\`। Request এলে counter বাড়ান, limit পেরোলে 429। মিনিট বদলালে নতুন key, তাই counter আপনা আপনি শূন্য থেকে শুরু।
- Memory: প্রতি key-তে একটা সংখ্যা। Redis-এ \`INCR\` আর \`EXPIRE\` দিয়ে দুই লাইনে হয়ে যায়।
- **সমস্যা: window-এর কিনারায় burst।** Limit মিনিটে 100। কেউ 10:00:59-এ 100টা পাঠাল (প্রথম window-এ, ঠিক আছে), তারপর 10:01:00-এ আরও 100টা (নতুন window, counter শূন্য, ঠিক আছে)। দুই সেকেন্ডে **200টা**, অর্থাৎ **limit-এর 2 গুণ**। কোনো নিয়ম ভাঙেনি, তবু server দুই সেকেন্ডে দ্বিগুণ চাপ খেল। সাধারণভাবে, window-এর সমান দৈর্ঘ্যের যেকোনো সময়ে সর্বোচ্চ **2 × limit** পর্যন্ত পাস হতে পারে।
- আরেকটা ছোট সমস্যা: নতুন window শুরু হতেই সবাই একসাথে ঝাঁপিয়ে পড়ে।

**Sliding Window Log** এই সমস্যা পুরো মেটায়। প্রতি key-র জন্য প্রতিটা request-এর **timestamp** একটা তালিকায় রাখুন (Redis-এ sorted set)। Request এলে:
1. \`now − 60s\`-এর চেয়ে পুরনো timestamp মুছে ফেলুন
2. বাকি কয়টা আছে গুনুন
3. Limit-এর কম হলে নতুন timestamp যোগ করে পাস, নাহলে 429

এটা সবচেয়ে নিখুঁত: যেকোনো ৬০ সেকেন্ডের টুকরোয় কখনো limit-এর বেশি পাস হয় না। কিন্তু **memory বেশি**: প্রতি key-তে limit-সংখ্যক timestamp। হিসাব করুন: limit ঘণ্টায় 1,000, user 10 লাখ, প্রতি timestamp ন্যূনতম 8 byte হলেও 1,000 × 10,00,000 × 8 = **৮ GB**, data structure-এর overhead বাদেই। Fixed window-এ একই কাজ মাত্র ১০ লাখটা counter।

**Sliding Window Counter** মাঝামাঝি পথ। শুধু দুটো counter রাখুন: আগের window আর চলতি window। তারপর আন্দাজ করুন:

\`\`\`text
estimate = previous_count × (window-এর যে অংশ এখনো আগের window-এর মধ্যে পড়ে) + current_count
\`\`\`

উদাহরণ: limit মিনিটে 100, আগের মিনিটে 80টা, চলতি মিনিটের 15 সেকেন্ড পেরিয়েছে আর এর মধ্যে 30টা এসেছে। আগের মিনিটের 45/60 = 75% অংশ এখনো "শেষ ৬০ সেকেন্ডে" পড়ে। তাই estimate = 80 × 0.75 + 30 = **90**। 100-এর কম, তাই পাস।

এটা ধরে নেয় আগের window-এর request-গুলো সমানভাবে ছড়ানো ছিল, তাই পুরো নিখুঁত না। কিন্তু memory প্রায় fixed window-এর মতোই কম, আর edge burst প্রায় পুরোটা ঠেকায়। Cloudflare তাদের blog-এ জানিয়েছে, তারা rate limiting-এ এই ধরনের আন্দাজ ব্যবহার করে, আর ভুলের হার খুব কম পেয়েছে।

নিচের diagram-এ একই দশটা request (window-এর কিনারার দুই পাশে) তিনটা algorithm কিভাবে বিচার করে দেখুন।`,
      diagrams: [
        {
          id: "day-018-windows",
          caption:
            "একই timeline-এ তিন algorithm: fixed window কিনারায় ১০টাই ছেড়ে দেয় (2×), sliding log ঠিক ৫টা, sliding counter আন্দাজে ৬টা।",
          alt: "তিনটা সারি, প্রতিটায় 0 থেকে 120 সেকেন্ডের timeline আর 50 থেকে 69 সেকেন্ডের মধ্যে দশটা request বিন্দু। Fixed Window সারিতে দশটাই সবুজ; Sliding Window Log সারিতে প্রথম পাঁচটা সবুজ, বাকি লাল; Sliding Window Counter সারিতে প্রথম ছয়টা সবুজ, বাকি লাল।",
        },
      ],
    },
    {
      title:
        "Limit পেরোলে কী বলবেন: 429, Retry-After, header আর client-এর backoff",
      markdown: `Rate limiter শুধু "না" বললে হয় না, **ভদ্রভাবে আর কাজের তথ্য দিয়ে** "না" বলতে হয়, যাতে ভালো client নিজেকে ঠিক করতে পারে।

**Status code: 429 Too Many Requests.** এটা RFC 6585-এ সংজ্ঞায়িত, ঠিক এই কাজের জন্যই। 4xx মানে "client-এর দিক থেকে সমস্যা: আপনি বেশি পাঠাচ্ছেন"। 503 Service Unavailable মানে "server-এর নিজের সমস্যা"। তাই সাধারণ নিয়ম: client-এর quota শেষ হলে 429, server নিজেই চাপে পড়ে traffic ফেলে দিলে (load shedding) 503। (NGINX-এর \`limit_req\` default-এ 503 দেয়, তাই \`limit_req_status 429\` দিয়ে বদলে নেওয়া ভালো। Lab-এ করব।)

**Retry-After header:** কত সেকেন্ড পরে আবার চেষ্টা করা যাবে (বা একটা তারিখ-সময়)। এটা HTTP standard-এর অংশ। এটা না দিলে client আন্দাজে retry করে, প্রায়ই সাথে সাথেই।

**Quota জানানোর header:** অনেক API প্রতিটা response-এ জানায় কতটা বাকি:
- \`X-RateLimit-Limit\`: মোট কত
- \`X-RateLimit-Remaining\`: আর কত বাকি
- \`X-RateLimit-Reset\`: কখন counter আবার ভরবে

এগুলো কোনো official standard না। প্রতিটা API নিজের মতো নাম আর মানে ঠিক করে (যেমন Reset কি "আর কত সেকেন্ড", নাকি Unix timestamp?)। IETF-এ এগুলোকে standard করার জন্য **RateLimit header fields**-এর একটা draft চলছে (\`RateLimit\`, \`RateLimit-Policy\`), কিন্তু এটা এখনো draft, আর version-ভেদে format বদলেছে। তাই যে API ব্যবহার করছেন, তার documentation দেখে নিন।

**Client-এর দায়িত্ব: exponential backoff with jitter।** 429 বা 503 পেলে:
1. \`Retry-After\` থাকলে অন্তত ততক্ষণ অপেক্ষা করুন।
2. না থাকলে প্রতিবার অপেক্ষা দ্বিগুণ করুন: 1s, 2s, 4s, 8s... একটা সর্বোচ্চ সীমা (যেমন 60s) আর সর্বোচ্চ চেষ্টার সংখ্যা রাখুন।
3. **Jitter যোগ করুন:** অপেক্ষার সময়ে একটু random মেশান, যেমন 0 থেকে হিসাব করা সময়ের মধ্যে যেকোনো একটা।

Jitter কেন? ধরুন 10,000 mobile app একসাথে 429 পেল, আর সবাই ঠিক 4 সেকেন্ড পরে retry করল। Server আবার একই মুহূর্তে 10,000 request-এর ধাক্কা খাবে, আবার সবাই 429 পাবে। একে **thundering herd** বা retry storm বলে। Random jitter দিলে retry-গুলো সময়ের উপর ছড়িয়ে যায়।

আর মনে রাখবেন, শুধু **idempotent** request (GET, বা idempotency key সহ POST) নিশ্চিন্তে retry করা যায় (Day 4)। Retry নিয়ে Day 57-এ গভীরে যাব।`,
      diagrams: [
        {
          id: "day-018-retry",
          caption:
            "ভালো আচরণ: 429-এর সাথে Retry-After আসে, client jitter মিশিয়ে অপেক্ষা করে, তারপর retry করে সফল হয়।",
          alt: "Client, Rate Limiter আর API Server-এর sequence diagram: ৬১তম request-এ 429 আর Retry-After 20, client অপেক্ষা করে আবার পাঠায়, এবার request API Server-এ যায় আর 200 ফেরে remaining header সহ।",
        },
      ],
    },
    {
      title: "Distributed rate limiting: অনেক server, একটাই হিসাব",
      markdown: `এখন পর্যন্ত ধরে নিয়েছি counter একটা জায়গায় আছে। কিন্তু বাস্তবে load balancer-এর পেছনে (Day 9) অনেক server। প্রতিটা server যদি নিজের memory-তে আলাদা গোনে:

Limit মিনিটে 100, server 3টা, load balancer round-robin। User 300টা পাঠালে প্রতিটা server দেখে মাত্র 100টা, সবাই ভাবে "ঠিক আছে"। **আসল limit হয়ে গেল 300**, আর server বাড়ালে আরও বাড়বে। Autoscaling-এ server সংখ্যা ওঠানামা করলে limit-ও ওঠানামা করে।

**সমাধান ১: একটা central store, সাধারণত Redis।** সব server একই key-তে গোনে। Fixed window-এর সবচেয়ে সহজ রূপ:

\`\`\`text
n = INCR rl:user42:1005
if n == 1: EXPIRE rl:user42:1005 60
if n > 100: reject (429)
\`\`\`

\`INCR\` নিজে atomic: দুই server একসাথে বাড়ালেও কোনো গণনা হারায় না। কিন্তু দুটো ফাঁদ আছে:
- **Read-then-write race:** কেউ যদি লেখে "আগে GET করে দেখি 99 কিনা, তারপর SET 100", তাহলে দুই server একসাথে 99 পড়ে দুজনেই ছেড়ে দেবে। Counter বাড়ানো আর যাচাই একই atomic ধাপে করুন।
- **INCR আর EXPIRE আলাদা command:** INCR-এর পরে, EXPIRE-এর আগে server crash করলে key-র কোনো মেয়াদ থাকে না। Counter চিরকাল থেকে যায়, user চিরকাল block। সমাধান: দুটোকে একটা **Lua script**-এ রাখুন (Redis পুরো script একবারে, মাঝখানে অন্য কোনো command না ঢুকিয়ে চালায়), অথবা MULTI/EXEC transaction।

Token bucket-এ এটা আরও জরুরি, কারণ সেখানে "tokens আর last_refill পড়ো → হিসাব করো → লেখো" তিনটা ধাপ। এগুলো Lua script-এ একসাথে না করলে দুই server একই token দুবার খরচ করবে। একটা খুঁটিনাটি: সময় নিন একটা উৎস থেকে (যেমন Redis-এর \`TIME\`), কারণ আলাদা server-এর ঘড়ি কয়েক millisecond এদিক-ওদিক থাকে।

**দাম:** প্রতিটা request-এ একটা network round-trip, আর Redis এখন critical path-এ। খুব বেশি traffic-এ Redis cluster-এ key ভাগ করে দিতে হয় (key-তে user id থাকলে স্বাভাবিকভাবেই ছড়িয়ে যায়)। তবে একজন খুব ব্যস্ত customer-এর key একটা node-এ **hot key** হয়ে যেতে পারে।

**সমাধান ২: Sticky routing।** Load balancer একই user-কে সবসময় একই server-এ পাঠায় (যেমন user id-র hash দিয়ে), তাহলে local counter-ই যথেষ্ট। সহজ আর দ্রুত, কিন্তু server যোগ-বিয়োগ হলে user অন্য server-এ সরে যায় আর counter শূন্য থেকে শুরু হয়, আর এক ভারী user একটা server-কে অসমান চাপ দেয়।

**সমাধান ৩: Local + global hybrid।** প্রতিটা server নিজের memory-তে একটা ছোট local limiter রাখে, আর মাঝে মাঝে (যেমন প্রতি সেকেন্ডে) central store-এর সাথে হিসাব মিলিয়ে নেয়, অথবা global limit-এর একটা ভাগ "ধার" নেয়। প্রতিটা request-এ Redis call লাগে না, তাই দ্রুত। দাম: sync-এর মাঝের সময়ে limit একটু পেরিয়ে যেতে পারে।

**মূল সিদ্ধান্ত: কতটা নিখুঁত দরকার?** বেশিরভাগ API-তে "100-এর জায়গায় মাঝে মাঝে 103 পাস হলো" কোনো ক্ষতি না। কিন্তু প্রতিটা request-এ সব server-এর মধ্যে নিখুঁত মিল চাইলে latency আর জটিলতা অনেক বাড়ে। তাই বেশিরভাগ বড় system **সামান্য ভুল মেনে নিয়ে** দ্রুততা বেছে নেয়। Login বা টাকার মতো জায়গায় কড়া, বাকি জায়গায় ঢিলা।`,
      diagrams: [
        {
          id: "day-018-distributed",
          caption:
            "প্রতিটা server আলাদা গুনলে limit server-সংখ্যা দিয়ে গুণ হয়ে যায়; shared Redis counter-এ সবাই একটাই হিসাব দেখে।",
          alt: "উপরে User 42 Load Balancer হয়ে তিনটা server-এ ১০০টা করে মোট ৩০০ request পাঠাচ্ছে, প্রতিটা server নিজে গুনে সব ছেড়ে দিচ্ছে; নিচে তিনটা server-ই একটা Redis-এ INCR করছে।",
        },
      ],
    },
    {
      title: "Redis down হলে কী করবেন: fail-open বনাম fail-closed",
      markdown: `Rate limiter এখন প্রতিটা request-এর পথে। Redis বন্ধ হলে, বা ধীর হয়ে গেলে, দুটো পথ:

- **Fail-open:** limiter কাজ না করলে request **ছেড়ে দাও**। API চালু থাকে, কিন্তু কিছুক্ষণ কোনো সুরক্ষা নেই।
- **Fail-closed:** limiter কাজ না করলে request **আটকাও**। সুরক্ষা থাকে, কিন্তু Redis-এর একটা সমস্যায় **পুরো API বন্ধ**। Rate limiter নিজেই single point of failure হয়ে গেল।

বেশিরভাগ সাধারণ API endpoint-এ **fail-open** বেছে নেওয়া হয়, কারণ rate limiter-এর কাজ অসাধারণ ব্যবহার ঠেকানো, আর কয়েক মিনিট সুরক্ষা না থাকার ঝুঁকি পুরো site বন্ধের চেয়ে কম। কিন্তু যেখানে abuse-এর ক্ষতি সরাসরি টাকা বা নিরাপত্তা (OTP/SMS পাঠানো, login, টাকা পাঠানো), সেখানে fail-closed বা আরও কড়া fallback যুক্তিসঙ্গত। সিদ্ধান্তটা endpoint ধরে নিন, পুরো system-এর জন্য একটা না।

ভালো অভ্যাস:
- Redis call-এ **ছোট timeout** দিন। ধীর Redis-এর জন্য প্রতিটা request ঝুলে থাকা down Redis-এর চেয়েও খারাপ।
- বারবার fail করলে কিছুক্ষণ Redis-কে call করাই বন্ধ রাখুন (circuit breaker, Day 59)।
- Fail-open-এর সময় পুরোপুরি খালি না রেখে প্রতিটা server-এ একটা **ঢিলা local limiter**-এ নেমে আসুন। নিখুঁত না, কিন্তু কিছু একটা।
- নতুন limit চালুর আগে কিছুদিন শুধু **log করুন** কারা আটকাত (dry run / shadow mode), তারপর enforce করুন। NGINX-এ এর জন্য \`limit_req_dry_run\` আছে।
- জরুরি অবস্থায় limiter বন্ধ করার একটা switch রাখুন।`,
    },
    {
      title:
        "চার আত্মীয়: Rate Limiting, Throttling, Quota আর Load Shedding; আর tier অনুযায়ী limit",
      markdown: `এই শব্দগুলো প্রায়ই গুলিয়ে যায়। মোটামুটি পার্থক্য:

- **Rate Limiting:** অল্প সময়ের **গতি** সীমিত করা, প্রতি client ধরে। "মিনিটে 60টা।" বাড়তি request বাতিল (429)।
- **Throttling:** শব্দটা অনেকে rate limiting-এর সমার্থক হিসেবেই বলে (AWS API Gateway-ও তাদের rate limit-কে throttling বলে)। তবে অনেক সময় এর মানে বাতিল না করে **ধীর করে দেওয়া**: request queue-তে বসিয়ে রাখা বা দেরিতে উত্তর দেওয়া, যেমন NGINX-এর \`burst\` delay।
- **Quota:** দীর্ঘ সময়ের **মোট পরিমাণ**, সাধারণত billing-এর সাথে যুক্ত। "Free plan-এ মাসে 10,000 API call।" শেষ হলে upgrade না করা পর্যন্ত বন্ধ। গতি ঠিক থাকলেও quota শেষ হতে পারে।
- **Load Shedding:** client কে, তা না দেখে **server নিজের অবস্থা** দেখে traffic ফেলে দেয়। "CPU 90%, তাই কম জরুরি request বাদ।" এমনকি যে client নিজের limit-এর অনেক নিচে, তার request-ও বাদ যেতে পারে। সাধারণত 503। উদ্দেশ্য user-এর মধ্যে ন্যায্যতা না, **system বাঁচানো**।

একটা ভালো design প্রায়ই সবগুলো একসাথে ব্যবহার করে: per-user rate limit (একজনের বাড়াবাড়ি থামাতে), আর তার উপরে load shedding (সবাই মিলে বেশি হলে, যেমন ঈদের sale-এ, জরুরি কাজ বাঁচাতে)। Load shedding-এ request-কে **অগ্রাধিকার** দিয়ে ভাগ করা হয়: টিকিটঘরে "payment সম্পূর্ণ করা" সবার আগে, "search" তার পরে, "analytics event" সবার শেষে, তাই চাপে সবার আগে analytics বাদ যায়।

**Tier অনুযায়ী limit:** SaaS API-তে limit প্রায়ই plan-এর সাথে যুক্ত:

| Plan | উদাহরণ limit |
|---|---|
| Free | মিনিটে 60, মাসে 10,000 |
| Pro | মিনিটে 600, মাসে 5 লাখ |
| Enterprise | চুক্তি অনুযায়ী, আলাদা bucket |

(সংখ্যাগুলো শুধু উদাহরণ।) Implementation-এ key-র সাথে plan দেখে capacity আর refill rate ঠিক হয়। Plan-এর তথ্য প্রতিটা request-এ database থেকে না পড়ে cache করুন (Day 17)।

**সব request-এর দাম সমান না।** একটা \`GET /user\` আর একটা "পুরো বছরের report বানাও" একই ১টা গোনা অন্যায্য। তাই অনেক API **cost-based** limit দেয়: ভারী request বেশি token কাটে। GitHub-এর GraphQL API যেমন query-র জটিলতা অনুযায়ী point হিসাব করে।`,
    },
  ],

  simulator: "rate-limiter-sim",

  tradeOffs: {
    markdown: `**কখন rate limit দেবেন:** প্রায় সব public API-তে, অন্তত একটা ঢিলা limit। Login, OTP, password reset, sign-up-এর মতো abuse-প্রবণ endpoint-এ অবশ্যই কড়া limit। যেকোনো call যেটায় প্রতিবার টাকা খরচ হয়। Multi-tenant system-এ, যাতে এক customer অন্যদের ধীর না করে।

**কখন সাবধান:** Internal service-এর মধ্যে কড়া limit দিলে নিজের system-ই নিজেকে আটকাতে পারে; সেখানে প্রায়ই concurrency limit, backpressure (Day 58) বা load shedding বেশি কাজের। শুধু IP ধরে কড়া limit দিলে একই NAT-এর পেছনের নির্দোষ user আটকে যায়। আর মনে রাখবেন, rate limiting একা বড় DDoS ঠেকায় না: লাখো আলাদা IP থেকে আসা আক্রমণে প্রতিটা IP নিজের limit-এর ভেতরেই থাকে। এখন এটুকু জানলেই চলবে, Day 81-এ গভীরে যাব।

পাঁচটা algorithm পাশাপাশি:`,
    table: {
      headers: [
        "Algorithm",
        "কিভাবে গোনে",
        "Burst-এ আচরণ",
        "নির্ভুলতা",
        "Memory (প্রতি key)",
        "কখন ভালো",
      ],
      rows: [
        [
          "Token Bucket",
          "Token জমে স্থির গতিতে, request token খরচ করে",
          "Capacity পর্যন্ত burst মেনে নেয়",
          "ভালো; T সেকেন্ডে সর্বোচ্চ b + r×T",
          "খুব কম: tokens + সময়",
          "সাধারণ API; ছোট burst ঠিক আছে, দীর্ঘ চাপ না",
        ],
        [
          "Leaky Bucket",
          "Request queue-তে, বের হয় স্থির গতিতে",
          "Burst queue-তে অপেক্ষা করে; queue ভরা হলে বাদ",
          "Output গতি একদম স্থির",
          "Queue-এর মাপ",
          "Downstream বাড়তি চাপ একদমই নিতে পারে না",
        ],
        [
          "Fixed Window",
          "প্রতি window-এ একটা counter",
          "Window-এর কিনারায় 2× পর্যন্ত পাস",
          "কিনারায় দুর্বল",
          "সবচেয়ে কম: একটা সংখ্যা",
          "সহজ quota, ঢিলা limit, দ্রুত বানানো",
        ],
        [
          "Sliding Window Log",
          "প্রতিটা request-এর timestamp",
          "যেকোনো window-এ কখনো limit-এর বেশি না",
          "নিখুঁত",
          "সবচেয়ে বেশি: limit-সংখ্যক timestamp",
          "কম limit, কড়া নিয়ম (login, OTP)",
        ],
        [
          "Sliding Window Counter",
          "আগের ও চলতি window-এর counter, ওজন দিয়ে",
          "Edge burst প্রায় পুরো ঠেকায়",
          "আন্দাজ, সাধারণত যথেষ্ট কাছে",
          "কম: দুটো সংখ্যা",
          "বড় scale-এ ভালো নির্ভুলতা আর কম memory",
        ],
      ],
    },
  },

  industry: {
    markdown: `- **Stripe:** তাদের engineering blog-এর "Scaling your API with rate limiters" (2017) লেখায় চার ধরনের limiter বর্ণনা করা আছে: **request rate limiter** (প্রতি user-এর প্রতি সেকেন্ডে request-এর সীমা, যেটাকে তারা সবচেয়ে গুরুত্বপূর্ণ বলেছে), **concurrent requests limiter** (একসাথে কয়টা request চলতে পারবে), **fleet usage load shedder** (পুরো infrastructure-এর একটা অংশ critical request-এর জন্য সংরক্ষিত রাখা) আর **worker utilization load shedder** (worker-রা চাপে পড়লে কম জরুরি traffic ধাপে ধাপে বাদ দেওয়া)। তারা **token bucket** algorithm ব্যবহার করে, state রাখে **Redis**-এ। লেখাটায় নতুন limiter আগে "dark launch" করে (শুধু দেখে, আটকায় না) তারপর চালু করার পরামর্শও আছে।
- **GitHub REST API:** প্রতিটা response-এ primary rate limit-এর header পাঠায়: \`x-ratelimit-limit\`, \`x-ratelimit-remaining\`, \`x-ratelimit-used\`, \`x-ratelimit-reset\` (Unix epoch সেকেন্ডে)। Limit শেষ হলে 403 বা 429 দেয়। এর বাইরে **secondary rate limit** আছে (যেমন একসাথে অনেক request বা খুব দ্রুত content তৈরি করলে), সেখানেও 403 বা 429, কখনো \`retry-after\` header সহ।
- **NGINX:** \`limit_req_zone\` আর \`limit_req\` directive দিয়ে IP বা যেকোনো variable ধরে limit; documentation অনুযায়ী এটা leaky bucket পদ্ধতিতে চলে, \`burst\` দিয়ে queue আর \`nodelay\` দিয়ে সাথে সাথে ছাড়া। Default reject status 503, \`limit_req_status\` দিয়ে বদলানো যায়।
- **Envoy proxy:** local rate limit (প্রতিটা instance-এ token bucket) আর global rate limit (একটা আলাদা rate limit service-কে জিজ্ঞেস করে) দুটোই দেয়, ঠিক আমাদের local + global hybrid ভাবনার মতো।
- **Cloudflare আর AWS API Gateway:** দুটোই managed rate limiting দেয়। Cloudflare edge-এ নিয়ম বসিয়ে request আপনার server-এ পৌঁছানোর আগেই আটকায়। AWS API Gateway-র documentation বলে তারা throttling-এ token bucket algorithm ব্যবহার করে, আর usage plan দিয়ে API key ধরে rate ও quota ঠিক করা যায়।
- **Redis:** অনেক team নিজেরাই \`INCR\` + \`EXPIRE\` বা Lua script দিয়ে limiter বানায়; Redis-এর documentation-এই \`INCR\`-এর rate limiter pattern দেখানো আছে।

*উৎস: Stripe Engineering Blog, "Scaling your API with rate limiters" (Paul Tarjan, 2017); GitHub Docs, "Rate limits for the REST API"; NGINX documentation, ngx_http_limit_req_module; Envoy documentation (local ও global rate limiting); AWS API Gateway Developer Guide (throttling, usage plans); Cloudflare blog ও documentation (rate limiting); Redis documentation (INCR, EVAL); RFC 6585 (429); RFC 9110 (Retry-After); IETF draft "RateLimit header fields for HTTP"।*`,
  },

  mistakes: [
    {
      mistake:
        "শুধু IP ধরে কড়া limit দেওয়া। একই mobile network বা অফিসের NAT-এর পেছনে শত শত নির্দোষ user একসাথে আটকে যায়, আর attacker সহজেই IP বদলায়।",
      fix: "Login-এর পরে user ID বা API key ধরে গুনুন; login-এর আগে IP-র সাথে username/phone মিশিয়ে key বানান, আর IP limit ঢিলা রাখুন।",
    },
    {
      mistake:
        "Load balancer-এর পেছনে প্রতিটা server নিজের memory-তে আলাদা গোনা। N server মানে আসল limit N গুণ, আর autoscaling-এ সেটা ওঠানামা করে।",
      fix: "Shared store (যেমন Redis) ব্যবহার করুন, অথবা জেনে-বুঝে local + global hybrid বানান।",
    },
    {
      mistake:
        "Redis-এ GET করে দেখে তারপর SET করা, বা INCR আর EXPIRE আলাদা পাঠানো। Race-এ limit পেরিয়ে যায়, আর crash হলে মেয়াদহীন key-তে user চিরকাল block।",
      fix: "যাচাই আর বাড়ানো একসাথে করুন: atomic INCR, আর পুরো token bucket logic একটা Lua script-এ।",
    },
    {
      mistake:
        "Limit পেরোলে 500, 503 বা 200-এর ভেতরে error পাঠানো, কোনো Retry-After ছাড়া। Client বোঝে না কী হলো, তাই সাথে সাথে retry করে চাপ আরও বাড়ায়।",
      fix: "429 Too Many Requests দিন, সাথে Retry-After আর বাকি quota-র header।",
    },
    {
      mistake:
        "Client-এ 429 পেয়ে সাথে সাথে বা ঠিক একই বিরতিতে retry করা। হাজারো client একসাথে ফিরে এসে retry storm তৈরি করে।",
      fix: "Retry-After মানুন, না থাকলে exponential backoff with jitter, সর্বোচ্চ চেষ্টার সীমা সহ।",
    },
    {
      mistake:
        "সব endpoint-এ একই limit। Login-এ মিনিটে 100টা চেষ্টা brute-force-এর জন্য যথেষ্ট, আবার ভারী report endpoint-এ 100টা server-কে বসিয়ে দেয়।",
      fix: "Endpoint আর খরচ অনুযায়ী আলাদা limit দিন; ভারী request বেশি token কাটুক।",
    },
    {
      mistake:
        "না ভেবে fail-closed রাখা। Redis একটু বন্ধ হলেই পুরো API বন্ধ, অথচ সমস্যা ছিল শুধু limiter-এ।",
      fix: "Endpoint ধরে সিদ্ধান্ত নিন: সাধারণ API-তে fail-open আর local fallback, OTP/login-এর মতো জায়গায় fail-closed। Redis call-এ ছোট timeout দিন।",
    },
  ],

  lab: [
    {
      title: "NGINX-এ একটা সাধারণ limit বসান",
      markdown: `একটা ফাঁকা folder-এ \`conf.d/default.conf\` file বানান:

\`\`\`bash
mkdir -p rl-lab/conf.d && cd rl-lab
cat > conf.d/default.conf <<'EOF'
# প্রতি IP-র জন্য গড়ে সেকেন্ডে 5টা request; counter রাখার জন্য 10MB shared memory
limit_req_zone $binary_remote_addr zone=perip:10m rate=5r/s;

server {
    listen 80;

    location / {
        limit_req zone=perip;
        root /usr/share/nginx/html;
    }
}
EOF

docker run -d --name rl-nginx -p 8080:80 -v "$PWD/conf.d:/etc/nginx/conf.d:ro" nginx:1.27-alpine
\`\`\`

\`rate=5r/s\` মানে NGINX আসলে প্রতি 200ms-এ একটা request ছাড়ে। খেয়াল করুন, আমরা \`return 200\` না লিখে \`root\` দিয়ে file serve করছি। কারণ \`return\` directive request processing-এর আগের এক ধাপে উত্তর দিয়ে দেয়, তখন \`limit_req\` চালানোর সুযোগই পায় না।`,
    },
    {
      title: "Request-এর বন্যা পাঠান",
      markdown: `যত দ্রুত পারেন ১০টা request:

\`\`\`bash
for i in $(seq 1 10); do curl -s -o /dev/null -w "%{http_code} " http://localhost:8080/; done; echo
\`\`\`

দেখবেন প্রথমটা \`200\`, বাকি প্রায় সব \`503\`। কারণ burst-এর কোনো জায়গা নেই, আর পরপর request-গুলো 200ms-এর অনেক কম ব্যবধানে আসছে।

এবার একটু ধীরে, প্রতি request-এর মাঝে 250ms:

\`\`\`bash
for i in $(seq 1 10); do curl -s -o /dev/null -w "%{http_code} " http://localhost:8080/; sleep 0.25; done; echo
\`\`\`

সব \`200\`। Limit গতির উপর, মোট সংখ্যার উপর না। NGINX-এর log-এও দেখতে পারেন কাকে আটকানো হলো:

\`\`\`bash
docker logs rl-nginx 2>&1 | grep "limiting requests" | head -3
\`\`\``,
    },
    {
      title: "burst দিন: queue-তে বসিয়ে রাখা (leaky bucket)",
      markdown: `\`conf.d/default.conf\`-এ \`limit_req\` লাইনটা বদলে লিখুন:

\`\`\`nginx
        limit_req zone=perip burst=5;
\`\`\`

তারপর config যাচাই করে reload দিন, আর এবার ১০টা request **একসাথে** (parallel) পাঠান, প্রতিটার সময় সহ:

\`\`\`bash
docker exec rl-nginx nginx -t && docker exec rl-nginx nginx -s reload
for i in $(seq 1 10); do curl -s -o /dev/null -w "%{http_code} %{time_total}s\n" http://localhost:8080/ & done; wait
\`\`\`

এরকম কিছু দেখবেন: ৬টা \`200\` (১টা সাথে সাথে + ৫টা queue-তে), ৪টা \`503\`। আর \`200\`-গুলোর সময় দেখুন: প্রায় 0.2s, 0.4s, 0.6s, 0.8s, 1.0s। Queue-তে বসা request-গুলো স্থির গতিতে, 200ms পরপর ছাড়া হচ্ছে। এটাই leaky bucket: মসৃণ output, কিন্তু latency বাড়ে।`,
    },
    {
      title: "nodelay আর 429",
      markdown: `এবার দুই লাইন:

\`\`\`nginx
        limit_req zone=perip burst=5 nodelay;
        limit_req_status 429;
\`\`\`

Reload করে আবার parallel পাঠান:

\`\`\`bash
docker exec rl-nginx nginx -t && docker exec rl-nginx nginx -s reload
for i in $(seq 1 10); do curl -s -o /dev/null -w "%{http_code} %{time_total}s\n" http://localhost:8080/ & done; wait
curl -si http://localhost:8080/ | head -1
\`\`\`

এখন burst-এর ৬টা সাথে সাথে (কয়েক millisecond-এ) \`200\` পায়, বাকিরা \`429\`। \`nodelay\` মানে queue-তে বসিয়ে না রেখে burst-এর জায়গা থাকলে এখনই ছাড়ো, আচরণটা token bucket-এর মতো। আর status এখন \`HTTP/1.1 429 Too Many Requests\`।

চাইলে load testing tool দিয়েও দেখুন (\`ab\` macOS-এ সাথেই আসে; Ubuntu-তে \`sudo apt install apache2-utils\`):

\`\`\`bash
ab -n 100 -c 10 http://127.0.0.1:8080/ | grep -E "Complete requests|Non-2xx"
\`\`\`

100টার মধ্যে প্রায় 90-এর বেশি \`Non-2xx responses\`, কারণ ab এক সেকেন্ডেরও কম সময়ে সব পাঠিয়ে দেয়।`,
    },
    {
      title: "Redis দিয়ে নিজের fixed window counter",
      markdown: `এবার distributed limiter-এর মূল ইটটা নিজে বানাই। Redis চালান:

\`\`\`bash
docker run -d --name rl-redis redis:7-alpine
\`\`\`

একটা user-এর জন্য limit "৬০ সেকেন্ডে ৫টা", ৭টা request পাঠিয়ে দেখুন:

\`\`\`bash
for i in $(seq 1 7); do
  n=$(docker exec rl-redis redis-cli INCR rl:user42)
  [ "$n" = "1" ] && docker exec rl-redis redis-cli EXPIRE rl:user42 60 > /dev/null
  if [ "$n" -le 5 ]; then echo "request $i: allowed ($n/5)"; else echo "request $i: 429 ($n/5)"; fi
done
docker exec rl-redis redis-cli TTL rl:user42
\`\`\`

প্রথম ৫টা allowed, ৬ আর ৭ নম্বর 429। \`TTL\` দেখাবে key আর কত সেকেন্ড বাঁচবে; ৬০ সেকেন্ড পরে key মুছে যাবে, counter আবার শূন্য।

এখানে INCR আর EXPIRE দুটো আলাদা command, মাঝখানে crash হলে key মেয়াদহীন থেকে যেত। একই কাজ একটা atomic Lua script-এ:

\`\`\`bash
docker exec rl-redis redis-cli DEL rl:user42
docker exec rl-redis redis-cli EVAL "local n = redis.call('INCR', KEYS[1]) if n == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end return n" 1 rl:user42 60
docker exec rl-redis redis-cli TTL rl:user42
\`\`\`

Script পুরোটা একবারে চলে, মাঝখানে অন্য কোনো client-এর command ঢোকে না।`,
    },
    {
      title: "পরিষ্কার করুন",
      markdown: `\`\`\`bash
docker rm -f rl-nginx rl-redis
cd .. && rm -rf rl-lab
\`\`\``,
    },
  ],

  connections: {
    markdown: `- **Day 4 · API ও REST:** সেখানে status code শিখেছিলাম; 429 হলো 4xx পরিবারের "আপনি বেশি পাঠাচ্ছেন"। আর কোন request retry করা নিরাপদ (idempotent), সেটা backoff-এর সময় কাজে লাগে।
- **Day 9 · Load Balancers:** Load balancer request ভাগ করে দেয় বলেই প্রতিটা server-এর আলাদা counter ভুল হিসাব দেয়। Sticky routing-এর ধারণাও সেখান থেকে।
- **Day 16 · API Gateway:** Rate limiting-এর সবচেয়ে প্রচলিত জায়গা, auth আর routing-এর পাশে। Gateway-ই সাধারণত 429 আর header পাঠায়।
- **Day 17 · Caching:** একই Redis, কিন্তু অন্য কাজে। Cache-এ TTL দিয়ে পুরনো data মুছি, এখানে TTL দিয়ে window-এর counter মুছি। আর plan/tier-এর তথ্য cache করে প্রতিটা request-এ database এড়াই।
- **Day 12 · Message Queues:** Leaky bucket আসলে একটা ছোট queue যার consumer স্থির গতিতে চলে। Queue spike শোষণ করে, rate limiter spike ফিরিয়ে দেয়।

সামনে যা আসছে: Day 19-এ Capacity Estimation, যেটা দিয়ে ঠিক করবেন limit কত হওয়া উচিত; Day 53-এ Distributed Locking (Redis-এ atomicity আরও গভীরে); Day 57-এ Idempotency ও Retry; Day 58-এ Backpressure; Day 59-এ Circuit Breaker; Day 80-এ API Security; আর Day 81-এ DDoS Mitigation। ([Day 19](${topicHrefForDay(19)}), [Day 57](${topicHrefForDay(57)}), [Day 81](${topicHrefForDay(81)}))`,
  },

  explainYourself: [
    {
      question:
        'আপনার API-র limit মিনিটে 100, fixed window দিয়ে বানানো। একজন বলছে, "কেউ তো কখনো মিনিটে 100-এর বেশি পাঠাতে পারবে না।" কথাটা কি ঠিক?',
      idealAnswer:
        "না। প্রতিটা ঘড়ি-ধরা মিনিটে (window) 100-এর বেশি পাস হয় না ঠিক, কিন্তু যেকোনো ৬০ সেকেন্ডের টুকরোয় না। কেউ 10:00:59-এ 100টা আর 10:01:00-এ আরও 100টা পাঠালে দুই সেকেন্ডে 200টা পাস হবে, কারণ মাঝখানে counter শূন্য হয়ে গেছে। এটা limit-এর 2 গুণ। Sliding window log বা sliding window counter দিলে এই কিনারার burst ঠেকে।",
    },
    {
      question:
        "Token bucket-এ capacity 20 আর refill rate 5/s। একটা client অনেকক্ষণ চুপ থেকে হঠাৎ টানা পাঠাতে শুরু করল। প্রথম 4 সেকেন্ডে সর্বোচ্চ কয়টা পাস হবে, আর এরপর গতি কত থাকবে?",
      idealAnswer:
        "চুপ থাকায় bucket ভরা, 20টা token। শুরুতেই 20টা একসাথে পাস হতে পারে (burst), আর 4 সেকেন্ডে আরও 5 × 4 = 20টা token জমে। তাই প্রথম 4 সেকেন্ডে সর্বোচ্চ 20 + 20 = 40টা। এরপর bucket খালি থাকে, তাই টানা চাপে গতি refill rate-এর সমান: সেকেন্ডে 5টা।",
    },
    {
      question:
        "আপনার rate limiter Redis-এ চলে। Redis হঠাৎ বন্ধ হলো। Login endpoint আর product listing endpoint-এ আপনি কী আচরণ চাইবেন, কেন?",
      idealAnswer:
        "Product listing-এ fail-open: request ছেড়ে দেব, কারণ কয়েক মিনিট সুরক্ষা না থাকার চেয়ে পুরো দোকান বন্ধ হওয়া অনেক বড় ক্ষতি; সাথে প্রতিটা server-এ একটা ঢিলা local limiter রাখব। Login (আর OTP)-এ ঝুঁকি brute-force আর SMS-এর খরচ, তাই fail-closed বা অন্তত কড়া local limit যুক্তিসঙ্গত। দুই ক্ষেত্রেই Redis call-এ ছোট timeout আর circuit breaker দেব, যাতে ধীর Redis পুরো API ঝুলিয়ে না রাখে।",
    },
  ],

  interviewQuestions: [
    {
      question: "একটা API-র জন্য rate limiter ডিজাইন করুন।",
      answerOutline: `- Requirement জিজ্ঞেস করুন: কিসের ভিত্তিতে (user, IP, API key, endpoint), কত (প্রতি সেকেন্ড/মিনিট), burst চলবে কিনা, কতটা নিখুঁত লাগবে, কত server আর কত traffic
- কোথায়: API gateway বা middleware; client-side শুধু ভদ্রতা
- Algorithm বাছাই আর কারণ: সাধারণত token bucket (burst + কম memory), কড়া জায়গায় sliding window
- State: Redis-এ key প্রতি user; atomic update (Lua script), TTL দিয়ে পরিষ্কার
- Response: 429 + Retry-After + remaining/reset header
- Failure: Redis down হলে fail-open/closed endpoint ধরে, ছোট timeout, local fallback
- Scale: Redis cluster-এ key ছড়ানো, hot key, local + global hybrid; monitoring (কতজন 429 পাচ্ছে)`,
    },
    {
      question: "Token bucket আর leaky bucket-এর পার্থক্য কী? কখন কোনটা?",
      answerOutline: `- Token bucket: token স্থির গতিতে জমে, request token খরচ করে; capacity পর্যন্ত burst সাথে সাথে পাস
- Leaky bucket: request queue-তে, স্থির গতিতে বের হয়; burst অপেক্ষা করে, output মসৃণ
- হিসাব: token bucket-এ T সেকেন্ডে সর্বোচ্চ b + r×T
- Token bucket: user-facing API, যেখানে ছোট burst স্বাভাবিক
- Leaky bucket: downstream (partner API, SMS gateway) স্থির গতি ছাড়া নিতে পারে না
- উদাহরণ: NGINX limit_req (burst queue, nodelay), Stripe ও AWS API Gateway-তে token bucket`,
    },
    {
      question: "Fixed window counter-এর সমস্যা কী, আর কিভাবে ঠিক করবেন?",
      answerOutline: `- Window-এর কিনারায় burst: শেষ মুহূর্তে limit + শুরুতে limit = অল্প সময়ে 2× limit
- নতুন window-এর শুরুতে সবাই একসাথে ঝাঁপিয়ে পড়ে
- Sliding window log: নিখুঁত, কিন্তু প্রতিটা timestamp রাখায় memory বেশি
- Sliding window counter: আগের window-এর count ওজন দিয়ে; দুটো সংখ্যা, প্রায় নিখুঁত
- অথবা token bucket, যেখানে window-ই নেই`,
    },
    {
      question:
        "আপনার service 10টা server-এ চলে। Rate limit সবার মধ্যে কিভাবে ঠিক রাখবেন?",
      answerOutline: `- Local counter-এ limit 10 গুণ হয়ে যায়, autoscaling-এ ওঠানামা করে
- Central Redis: INCR + EXPIRE বা Lua script-এ token bucket; read-then-write race এড়ান; crash-safe TTL
- খরচ: প্রতি request-এ network hop, Redis critical path-এ, hot key
- বিকল্প: sticky routing (সহজ, কিন্তু rebalancing-এ counter হারায়), local + global hybrid (দ্রুত, সামান্য বেশি পাস)
- সিদ্ধান্ত: কতটা নিখুঁত দরকার; বেশিরভাগ ক্ষেত্রে সামান্য ভুল মেনে দ্রুততা`,
    },
    {
      question: "Rate limiting আর load shedding-এর পার্থক্য কী? দুটোই কি লাগে?",
      answerOutline: `- Rate limiting: প্রতি client-এর গতি, ন্যায্যতার জন্য; বাড়তি হলে 429
- Load shedding: server-এর নিজের অবস্থা (CPU, worker, queue) দেখে, অগ্রাধিকার অনুযায়ী কম জরুরি traffic বাদ; সাধারণত 503
- সবাই নিজের limit-এর ভেতরে থেকেও মোট traffic বেশি হতে পারে (ঈদের sale), তখন শুধু rate limit যথেষ্ট না
- Quota: দীর্ঘমেয়াদি মোট পরিমাণ, billing-এর সাথে
- Stripe-এর উদাহরণ: request rate limiter ও concurrent limiter-এর পাশাপাশি দুই ধরনের load shedder`,
    },
  ],

  summary: {
    points: [
      "Rate Limiting প্রতি client-এর request গুনে সীমা পেরোলে কাজ শুরুর আগেই ফিরিয়ে দেয়, যাতে কেউ একা shared resource খেয়ে ফেলতে না পারে।",
      "Key বুঝে বাছুন: login-এর আগে IP (NAT-এর কথা মাথায় রেখে), পরে user বা API key; abuse-প্রবণ endpoint-এ আলাদা কড়া limit।",
      "Token Bucket: capacity পর্যন্ত burst, দীর্ঘমেয়াদে refill rate; T সেকেন্ডে সর্বোচ্চ b + r×T। Leaky Bucket: স্থির গতির মসৃণ output।",
      "Fixed Window সহজ কিন্তু কিনারায় 2× পর্যন্ত পাস হয়; Sliding Log নিখুঁত কিন্তু memory বেশি; Sliding Counter কম memory-তে ভালো আন্দাজ।",
      "উত্তর দিন 429 + Retry-After দিয়ে; client retry করুক exponential backoff with jitter দিয়ে।",
      "একাধিক server-এ একটা shared counter (Redis) লাগে, আর update হতে হবে atomic (INCR বা Lua script)।",
      "Redis down হলে fail-open বা fail-closed, সিদ্ধান্ত endpoint ধরে; rate limiting আর load shedding আলাদা কাজ করে।",
    ],
    diagram: {
      id: "day-018-summary",
      caption: "এক নজরে Rate Limiting",
      alt: "Client সীমার ভেতরে থেকে Rate Limiter পেরিয়ে Service-এ যায়; Noisy client 429 পায়; Rate Limiter Redis-এ count রাখে।",
    },
  },
};
