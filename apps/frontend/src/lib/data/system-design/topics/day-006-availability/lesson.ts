// Day 6 · Availability — introductory lesson (Day 90 goes deeper into SLI/SLO/SLA and error budgets).

import { topicHrefForDay } from "@/lib/data/courses/system-design-a-z";
import type { SdLesson } from "@/lib/system-design/lesson.types";

export const day006Lesson: SdLesson = {
  topicId: "sd-day-006",
  day: 6,
  title: "Availability",
  definition:
    "Availability হলো মোট সময়ের (বা মোট request-এর) কত ভাগ user system-টা ঠিকমতো ব্যবহার করতে পেরেছে; বাড়ানোর মূল অস্ত্র redundancy, দ্রুত failure ধরা আর দ্রুত সেরে ওঠা।",

  objectives: [
    "Availability-কে সময় আর request, দুইভাবে মাপতে পারবেন, আর 99.9% বা 99.99%-এর মতো 'nines'-কে বছরে/মাসে কত downtime, সেই হিসাবে বদলাতে পারবেন।",
    "একটা architecture দেখে single point of failure খুঁজে বের করতে পারবেন, আর active-active, active-passive, health check ও failover দিয়ে কিভাবে সেটা সরাবেন বলতে পারবেন।",
    "Series আর parallel component-এর availability হিসাব করতে পারবেন, আর MTBF/MTTR দিয়ে দেখাতে পারবেন কেন দ্রুত সেরে ওঠা প্রায়ই সস্তা পথ।",
    "Correlated failure, blast radius, multi-AZ বনাম multi-region আর graceful degradation বিবেচনা করে বাস্তবসম্মত availability লক্ষ্য ঠিক করতে পারবেন।",
  ],

  prerequisites: [
    { day: 1, title: "সিস্টেম ডিজাইন আসলে কী?", href: topicHrefForDay(1) },
    { day: 2, title: "Client, Server ও Internet", href: topicHrefForDay(2) },
    { day: 5, title: "Scalability", href: topicHrefForDay(5) },
  ],

  problem: {
    markdown: `ধরুন আপনি "ঘরের বাজার" নামে একটা online grocery চালান। সবকিছু একটা মাত্র server-এ: web app, API, আর database একই machine-এ। ছয় মাস ভালোই চলল।

তারপর এক বৃহস্পতিবার সন্ধ্যা, সপ্তাহের সবচেয়ে ব্যস্ত সময়। Server-এর disk ভরে গেল, database লেখা বন্ধ করে দিল, আর app crash করল। User-রা দেখছে শুধু \`502 Bad Gateway\` বা ঘুরতে থাকা loading।

যা হলো:
1. **পুরো business বন্ধ।** একটা machine-এর একটা সমস্যা, আর browse, cart, payment, delivery tracking সব একসাথে গেল। কারণ সব কিছু ওই একটা জিনিসের উপর নির্ভর করছিল। একে বলে **single point of failure (SPOF)**: এমন একটা অংশ, যেটা ভাঙলেই পুরো system ভাঙে।
2. **কেউ জানত না।** কোনো alert ছিল না। ২০ মিনিট পর একজন customer Facebook page-এ লিখল, "ভাই, সাইট তো খোলে না।" সমস্যা ধরতেই ২০ মিনিট।
3. **সারাতে আরও দেড় ঘণ্টা।** SSH করে log খোঁজা, disk পরিষ্কার, database restart, তারপর দেখা গেল একটা table corrupt।

সব মিলিয়ে প্রায় দুই ঘণ্টা বন্ধ, ঠিক ব্যস্ততম সময়ে। আর বড় প্রশ্নটা থেকে গেল: **"আমাদের site কতটা নির্ভরযোগ্যভাবে চালু থাকে?"** এই প্রশ্নের উত্তর মাপতে, লক্ষ্য ঠিক করতে আর সেই লক্ষ্যে পৌঁছাতে যে ধারণাটা লাগে, সেটাই **Availability**।`,
    diagrams: [
      {
        id: "day-006-before",
        caption:
          "আগে: সব কিছু একটা server-এ; সেটা পড়লেই user-এর সব request fail, কারণ বিকল্প কোনো পথ নেই।",
        alt: "User একটা single server-কে request পাঠায়, server লাল ✕ চিহ্নে বন্ধ; server-এর সাথে যুক্ত database-এ পৌঁছানোর আর কোনো পথ নেই।",
      },
    ],
  },

  analogy: {
    markdown: `ঢাকার একটা হাসপাতালের কথা ভাবুন। লোডশেডিং হলে কী হয়?

ভালো হাসপাতালে বিদ্যুৎ গেলে কয়েক সেকেন্ডের মধ্যে **generator** চালু হয়ে যায়। একটা **auto switch** (ATS) নিজে থেকেই বোঝে লাইনে বিদ্যুৎ নেই, আর generator-এর দিকে সুইচ করে দেয়। ICU-র ventilator থামে না, operation theatre-এ আলো থাকে।

এখানে availability-র প্রায় সব ধারণা লুকিয়ে আছে:
- **বিদ্যুৎ লাইন = Primary**, **Generator = Standby**। Generator সারাদিন বসে থাকে, শুধু দরকারে কাজ করে। এটা **active-passive redundancy**।
- **Auto switch = Health check + Failover**। বিদ্যুৎ নেই তা ধরতে (detection) আর generator-এ সরতে (switch) যে কয়েক সেকেন্ড অন্ধকার, সেটাই failover-এর সময়।
- **Generator চলাকালে AC আর লিফটের একটা বাদে বাকি বন্ধ রাখা = Graceful degradation**। জরুরি কাজ চলে, আরামের জিনিস পরে।
- **মাসে একবার generator চালিয়ে পরীক্ষা করা**: যে backup কখনো পরীক্ষা হয়নি, সেটা দরকারের দিন চালু হবে কিনা কেউ জানে না।

আর দুটো বিপদ, যেটা সফটওয়্যারেও হুবহু হয়:
- Auto switch নিজেই নষ্ট হলে? তাহলে generator থেকেও লাভ নেই। Switch-টাই নতুন **SPOF**।
- বর্ষায় basement-এ পানি ঢুকে main panel আর generator **দুটোই** ডুবে গেল। দুটো আলাদা জিনিস, কিন্তু একই জায়গায় থাকায় একসাথে নষ্ট। একে বলে **correlated failure**। Backup তখনই কাজের, যখন সেটা আসল জিনিসের সাথে একই কারণে নষ্ট হয় না।`,
    diagrams: [
      {
        id: "day-006-analogy",
        caption:
          "হাসপাতাল: লাইনে বিদ্যুৎ গেলে auto switch generator-এ সরে যায়; জরুরি বিভাগ চলে, AC-র মতো কম জরুরি জিনিস বন্ধ থাকে।",
        alt: "বামে বিদ্যুৎ লাইন (লাল ✕, লোডশেডিং) আর generator; মাঝে auto switch; ডানে হাসপাতাল, যেখানে ICU, Emergency আর লিফট চালু, AC বন্ধ।",
      },
    ],
  },

  coreConcept: {
    markdown: `**Availability** মানে: user যখন system ব্যবহার করতে চায়, তখন সেটা কত ভাগ সময় ঠিকমতো কাজ করে। খেয়াল করুন, মাপকাঠি **user-এর চোখে**। Server চালু আছে কিন্তু প্রতিটা page ৩০ সেকেন্ড নিচ্ছে, বা login ছাড়া সব চলছে, user-এর কাছে সেটা "চলছে না"।

**মাপার দুটো উপায়:**
- **সময় দিয়ে:** Availability = uptime ÷ (uptime + downtime)। মাসে ৭২০ ঘণ্টার মধ্যে ৭১৯ ঘণ্টা চালু, মানে 719/720 ≈ **99.86%**।
- **Request দিয়ে:** Availability = সফল request ÷ মোট request। ১০ লাখ request-এর মধ্যে ১,২০০টা 5xx error, মানে 998,800/1,000,000 = **99.88%**।

Request দিয়ে মাপা বেশি সৎ, কারণ রাত ৩টায় ১০ মিনিট বন্ধ আর ঈদের sale-এর সময় ১০ মিনিট বন্ধ, সময়ের হিসাবে সমান, কিন্তু user-এর ক্ষতিতে আকাশ-পাতাল।

### "The nines"

Availability সাধারণত কয়টা ৯ আছে তা দিয়ে বলা হয়। এক বছর = ৮,৭৬০ ঘণ্টা, আর মাস = বছরের ১/১২ ধরে:

| Availability | বছরে downtime | মাসে downtime | দিনে downtime |
| --- | --- | --- | --- |
| 99% ("two nines") | ~3.65 দিন | ~7.3 ঘণ্টা | ~14.4 মিনিট |
| 99.9% ("three nines") | ~8.76 ঘণ্টা | ~43.8 মিনিট | ~1.44 মিনিট |
| 99.99% ("four nines") | ~52.6 মিনিট | ~4.38 মিনিট | ~8.6 সেকেন্ড |
| 99.999% ("five nines") | ~5.26 মিনিট | ~26.3 সেকেন্ড | ~0.86 সেকেন্ড |

হিসাবটা সহজ: downtime = (1 − availability) × মোট সময়। 99.9% মানে 0.001 × 8,760 ঘণ্টা = 8.76 ঘণ্টা। প্রতিটা বাড়তি ৯ মানে downtime **দশ ভাগের এক ভাগ**। আর 99.99%-এ মাসে ৪ মিনিট, মানে একজন মানুষ alert পেয়ে laptop খুলতে খুলতেই budget শেষ। তাই চার-পাঁচটা ৯ মানে **মানুষ ছাড়া, স্বয়ংক্রিয়ভাবে** সেরে ওঠা।

### SLI, SLO আর SLA (পরিচিতি)
- **SLI (Service Level Indicator)**: যা আসলে মাপছেন। যেমন "সফল request-এর %"।
- **SLO (Service Level Objective)**: নিজেদের লক্ষ্য। যেমন "৩০ দিনে 99.9% request সফল হবে"।
- **SLA (Service Level Agreement)**: customer-এর সাথে চুক্তি, না মানলে জরিমানা (সাধারণত service credit)। SLA সাধারণত SLO-র চেয়ে ঢিলা রাখা হয়, যাতে চুক্তি ভাঙার আগেই ভেতরে সতর্ক হওয়া যায়।

এখন এটুকু জানলেই চলবে, [Day 90](${topicHrefForDay(90)})-এ গভীরে যাব।

### SPOF সরানোর উপায়: Redundancy
**Redundancy** মানে একই কাজের জন্য একাধিক কপি রাখা, যাতে একটা পড়লে অন্যটা চালায়।
- **Active-active**: সব কপি একসাথে traffic নেয় (যেমন load balancer-এর পেছনে দুটো app server)। একটা পড়লে বাকিরা পুরো ভার নেয়। Capacity নষ্ট হয় না, কিন্তু প্রতিটা কপিকে বাড়তি ভার নেওয়ার মতো জায়গা রাখতে হয়।
- **Active-passive**: একটা কাজ করে, আরেকটা অপেক্ষায় (যেমন database primary আর standby replica)। সহজ, বিশেষ করে যেখানে "লেখার মালিক" একজনই হওয়া দরকার। কিন্তু standby-র খরচ দিচ্ছেন অথচ সাধারণ সময়ে কাজে লাগছে না, আর switch করতে সময় লাগে।

Redundancy একা যথেষ্ট না। দুটো জিনিস লাগে:
- **Health check**: load balancer কয়েক সেকেন্ড পরপর প্রতিটা server-কে জিজ্ঞেস করে "ঠিক আছ?" (যেমন \`GET /health\`)। পরপর কয়েকবার উত্তর না এলে server-কে "unhealthy" ধরে।
- **Failover**: unhealthy কপিকে বাদ দিয়ে traffic সুস্থ কপিতে পাঠানো। Active-passive-এ standby-কে primary বানানো।

### MTBF আর MTTR
- **MTBF (Mean Time Between Failures)**: গড়ে কত সময় পরপর failure হয়।
- **MTTR (Mean Time To Recovery)**: failure হলে গড়ে সেরে উঠতে কত সময়।

**Availability = MTBF ÷ (MTBF + MTTR)**

মাসে একবার failure (MTBF ≈ ৭২০ ঘণ্টা), সারাতে ১ ঘণ্টা: 720/721 ≈ **99.86%**। এখন দুটো পথ:
- Failure অর্ধেক করুন (MTBF ১,৪৪০ ঘণ্টা): 1440/1441 ≈ **99.93%**
- সেরে ওঠা ১০ গুণ দ্রুত করুন (MTTR ৬ মিনিট): 720/720.1 ≈ **99.986%**

দ্বিতীয়টা অনেক বেশি লাভ দিল। আর বাস্তবে "কখনো fail করবে না" বানানো খুব কঠিন ও দামি, কিন্তু ভালো alert, auto-restart, এক click-এ rollback আর অভ্যাস করা runbook দিয়ে MTTR কমানো তুলনায় সস্তা। তাই আধুনিক system ধরে নেয় **failure হবেই**, আর জোর দেয় দ্রুত ধরা আর দ্রুত সেরে ওঠায়।

### তিনটা কাছাকাছি শব্দ, আলাদা অর্থ
- **Availability**: চাইলে পাওয়া যায় কিনা। ATM-এ গেলে টাকা তোলা যাচ্ছে কিনা।
- **Reliability**: দীর্ঘ সময় ধরে **ঠিকঠাক** কাজ করে কিনা, ভুল ছাড়া। ATM চলছে, কিন্তু মাঝে মাঝে ভুল balance দেখায়: available, কিন্তু reliable না।
- **Durability**: data একবার রাখলে হারায় না তো? ব্যাংকের server আজ ১ ঘণ্টা বন্ধ ছিল (availability কমল), কিন্তু কারও টাকার হিসাব হারায়নি (durability ঠিক আছে)।

### Planned আর unplanned downtime
**Unplanned**: crash, disk নষ্ট, network কাটা। **Planned**: maintenance, database upgrade, "রাত ২টা থেকে ৪টা বন্ধ থাকবে"। অনেক SLA planned downtime হিসাবের বাইরে রাখে, কিন্তু user-এর কাছে বন্ধ মানে বন্ধ। তাই ভালো system চেষ্টা করে planned downtime-ও শূন্যে আনতে: একটা একটা server বদলে (rolling deploy), বা নতুন version পাশে চালু করে traffic সরিয়ে।

### Graceful degradation
সব feature সমান জরুরি না। Online shop-এ "আপনার জন্য সুপারিশ" service down হলে পুরো page ভাঙার দরকার নেই: সুপারিশের জায়গায় একটা সাধারণ "জনপ্রিয় পণ্য" list দেখান, আর cart, checkout, payment চালু রাখুন। একে বলে **graceful degradation**: আংশিক সমস্যায় পুরো system না পড়ে, কম গুরুত্বপূর্ণ অংশ বাদ দিয়ে মূল কাজটা চালিয়ে যাওয়া। এর জন্য আগে ঠিক করতে হয় কোন dependency **critical** (না থাকলে কাজ অসম্ভব, যেমন payment) আর কোনটা **optional** (না থাকলেও চলে)।`,
    diagrams: [
      {
        id: "day-006-main",
        caption:
          "পরে: load balancer দুটো Availability Zone-এ রাখা app server-এ traffic ভাগ করে, health check দিয়ে নষ্ট server বাদ দেয়; database primary-র একটা replica অন্য zone-এ।",
        alt: "উপরে Users, তার নিচে Load Balancer। নিচে একটা Region-এর ভেতরে দুটো Availability Zone: Zone A-তে App Server 1 আর DB Primary, Zone B-তে App Server 2 আর DB Replica। Load balancer দুটো app server-এ traffic পাঠায়, দুই app server primary-তে লেখে, primary থেকে replica-তে replication।",
        downloadable: true,
      },
      {
        id: "day-006-before-after",
        caption:
          "পাশাপাশি: এক server-এ যেকোনো failure মানে পুরো downtime; redundancy থাকলে একটা server বা একটা zone পড়লেও user সেবা পায়।",
        alt: "উপরে আগের single server design, server বন্ধ; নিচে দুই zone-এ ছড়ানো redundant design, একটা app server বন্ধ থাকলেও load balancer অন্যটায় traffic পাঠাচ্ছে।",
      },
    ],
  },

  deepDive: [
    {
      title: "Availability-র অঙ্ক: series আর parallel",
      markdown: `একটা request সাধারণত অনেকগুলো component পার হয়: load balancer → app → database। প্রত্যেকটার নিজের availability আছে। পুরো system-এর availability কত?

**Series (সবগুলো লাগবে):** একটা request সফল হতে হলে প্রতিটা component-কে চালু থাকতে হবে। তাই availability **গুণ** হয়:

A = A₁ × A₂ × A₃

LB 99.99%, App 99.9%, DB 99.9% হলে: 0.9999 × 0.999 × 0.999 ≈ **0.9979 = 99.79%**। খেয়াল করুন, ফলাফল **সবচেয়ে দুর্বল অংশের চেয়েও খারাপ**। বছরে প্রায় ১৮ ঘণ্টা downtime, অথচ কোনো একক অংশও এত খারাপ না।

**এজন্যই প্রতিটা নতুন dependency availability কমায়।** একটা API যদি request-এর পথে ১০টা আলাদা service call করে, প্রতিটা 99.9%: 0.999¹⁰ ≈ **99.0%**। দশটা "three nines" মিলে হলো "two nines"! Microservice বাড়ালে এই অঙ্ক মাথায় রাখতে হয়।

**Parallel (যেকোনো একটা চললেই হবে):** দুটো app server-এর একটা চালু থাকলেই চলে। পুরো জিনিসটা তখনই পড়বে যখন **সবগুলো একসাথে** পড়বে। একটার পড়ে থাকার সম্ভাবনা (1 − A), সবগুলো একসাথে (1 − A)ⁿ। তাই:

A = 1 − (1 − A)ⁿ

দুটো 99% server parallel-এ: 1 − (0.01)² = 1 − 0.0001 = **99.99%**। দুটো সাধারণ server মিলে "four nines"! তিনটা হলে 99.9999%।

**দুটো মিলিয়ে:** LB 99.99% → [দুটো app, প্রতিটা 99.9%, parallel] → DB 99.9%:
- App অংশ: 1 − (0.001)² = 99.9999%
- মোট: 0.9999 × 0.999999 × 0.999 ≈ **99.89%**

এখন সবচেয়ে বড় দুর্বলতা single database। Series chain-এ সবচেয়ে কম availability-র অংশটা পুরো ফলাফল টেনে নামায়, তাই সেখানেই আগে redundancy দিন।

**কিন্তু একটা বড় শর্ত:** parallel-এর সূত্র ধরে নেয় failure-গুলো **স্বাধীন** (independent)। দুটো server একই power supply-তে, একই code version-এ, একই config-এ থাকলে তারা একসাথে পড়ে, তখন এই অঙ্ক মিথ্যা হয়ে যায়। পরের অংশে সেটাই।`,
      diagrams: [
        {
          id: "day-006-series-parallel",
          caption:
            "ভেতরের গঠন: series-এ availability গুণ হয়ে কমে; parallel-এ সবগুলো একসাথে পড়ার সম্ভাবনা এত কম যে availability বাড়ে।",
          alt: "উপরের সারিতে LB 99.99%, App 99.9%, DB 99.9% একটার পর একটা, ফলাফল প্রায় 99.79%। নিচের সারিতে দুটো App 99% পাশাপাশি, ফলাফল 1 − 0.01² = 99.99%।",
        },
      ],
    },
    {
      title: "Correlated failure, blast radius আর multi-AZ বনাম multi-region",
      markdown: `Redundancy-র পুরো যুক্তি দাঁড়িয়ে আছে একটা অনুমানের উপর: **কপিগুলো একই কারণে একসাথে নষ্ট হবে না।** বাস্তবে অনেক failure একসাথে অনেক কপিকে মারে:

- **একই জায়গা:** দুটো server একই rack-এ (একই power, একই switch), একই data center-এ, একই region-এ।
- **একই খারাপ deploy:** নতুন version-এ bug, আর আপনি একসাথে সব server-এ deploy করলেন। ১০টা কপি, ১০টাই crash।
- **একই config:** ভুল একটা config বা মেয়াদ শেষ হওয়া একটা TLS certificate সব কপিতে একই।
- **একই shared dependency:** সব কপি একই DNS, একই auth service বা একই storage-এর উপর নির্ভর করে। সেটা পড়লে সবাই পড়ে।
- **একই ভার:** একটা server পড়ায় বাকিদের ভার বাড়ল, তারাও overload হয়ে পড়ল (cascading failure)।

**Cloud-এ জায়গার স্তর:** AWS-এর মতো cloud দুটো স্তরে ভাগ করে।
- **Availability Zone (AZ)**: একটা region-এর ভেতরে এক বা একাধিক আলাদা data center, নিজস্ব power ও network সহ, অন্য AZ থেকে শারীরিকভাবে দূরে, কিন্তু কম latency-র link দিয়ে যুক্ত। একটা AZ-এর আগুন, বন্যা বা power সমস্যা অন্যটায় ছড়ানোর কথা না।
- **Region**: একটা ভৌগোলিক এলাকা (যেমন সিঙ্গাপুর, মুম্বাই), যার ভেতরে কয়েকটা AZ।

**Multi-AZ**: একই region-এর দুই-তিনটা AZ-এ কপি। একটা data center-এর সমস্যা সামলায়। Latency কম, তাই database-এর synchronous replication-ও চলে। বেশিরভাগ production system-এর জন্য এটাই যুক্তিসঙ্গত শুরু।

**Multi-region**: আলাদা region-এ কপি। পুরো region-এর সমস্যা (বা region-জুড়ে একটা service-এর সমস্যা) সামলায়। কিন্তু দাম অনেক: region-এর মধ্যে latency বেশি, তাই data replication সাধারণত asynchronous, ফলে failover-এ সাম্প্রতিক কিছু data হারাতে পারে; consistency নিয়ে কঠিন সিদ্ধান্ত ([Day 8 · CAP](${topicHrefForDay(8)})); খরচ প্রায় দ্বিগুণ; আর failover নিজেই জটিল। Multi-region নিয়ে [Day 88](${topicHrefForDay(88)})-এ আর disaster recovery (RPO/RTO) নিয়ে [Day 94](${topicHrefForDay(94)})-এ বিস্তারিত।

**Blast radius**: একটা failure কতটা এলাকা জুড়ে ক্ষতি করে। লক্ষ্য শুধু failure কমানো না, **ক্ষতির পরিধি ছোট রাখা**:
- Deploy একসাথে সবখানে না দিয়ে আগে ১-৫% server-এ (canary), ঠিক থাকলে বাকিতে ([Day 85](${topicHrefForDay(85)}))।
- একটা বড় system-কে কয়েকটা স্বাধীন **cell**-এ ভাগ করা, প্রতিটা cell কিছু customer-কে সেবা দেয়। একটা cell পড়লে শুধু সেই customer-রা প্রভাবিত হয়।
- এক AZ বা region-এ একসাথে পরিবর্তন সীমিত রাখা।`,
      diagrams: [
        {
          id: "day-006-correlated",
          caption:
            "দুই কপি একই zone-এ থাকলে zone পড়লে দুটোই যায়; আলাদা zone-এ থাকলে একটা zone-এর সমস্যায় অন্যটা সেবা দেয়।",
          alt: "উপরে: দুটো app server একই Availability Zone-এ, zone লাল (বন্ধ), দুটো server-ই বন্ধ। নিচে: App Server 1 Zone A-তে (বন্ধ), App Server 2 Zone B-তে (চালু), load balancer Zone B-তে traffic পাঠাচ্ছে।",
        },
      ],
    },
    {
      title: "ধাপে ধাপে failover: failure → detection → switch → recovery",
      markdown: `User যে downtime দেখে, সেটা শুধু "server কতক্ষণ বন্ধ ছিল" না। Failover-এর প্রতিটা ধাপের সময় যোগ হয়:

**Downtime ≈ detection-এর সময় + switch-এর সময়** (redundancy থাকলে)
**Downtime ≈ detection + সারানোর সময়** (redundancy না থাকলে)

**Detection:** Load balancer প্রতি ৫ সেকেন্ডে health check পাঠায়, আর পরপর ৩বার fail হলে unhealthy ধরে। তাহলে failure ধরতে ১০-১৫ সেকেন্ড, আর প্রতিটা check-এর timeout যোগ করলে আরও একটু। এই সময়ে নষ্ট server-এ যাওয়া request fail করে।

কেন ১বারেই unhealthy ধরা হয় না? কারণ network-এ একটা packet হারানো বা একটা ধীর GC pause-এ সুস্থ server-কেও বাদ দিয়ে দেবেন। **দ্রুত detection আর ভুল detection (false positive)-এর মধ্যে সবসময় একটা trade-off।** Interval ছোট আর threshold কম মানে দ্রুত ধরা, কিন্তু অকারণে বেশি failover।

**Health check-এ কী দেখবেন:** শুধু "process চালু আছে" (liveness) না, "request নেওয়ার মতো অবস্থায় আছে কিনা" (readiness)। তবে health check-এর ভেতর database বা অন্য shared dependency পরীক্ষা করলে সাবধান: database এক মুহূর্ত ধীর হলে **সব** app server একসাথে unhealthy হয়ে যেতে পারে, আর load balancer সবাইকে বাদ দিয়ে নিজেই পুরো outage বানায়।

**Passive detection:** আলাদা health check ছাড়াও, আসল request fail হলে load balancer সেটা দেখে server-কে কিছুক্ষণ বাদ রাখতে পারে (NGINX-এর \`max_fails\`/\`fail_timeout\`)। আর একটা request fail হলে সাথে সাথে অন্য server-এ **retry** করলে user error-ই দেখে না। Lab-এ দুটোই নিজে দেখবেন। তবে retry শুধু সেই request-এ নিরাপদ, যেটা দুবার হলেও ক্ষতি নেই ([Day 4](${topicHrefForDay(4)})-এর idempotency মনে আছে?)।

**Recovery:** নষ্ট server ঠিক হলে (auto-restart বা নতুন instance), health check পরপর কয়েকবার সফল হলে তবে সে আবার traffic পায়। একবার সফল হলেই ফেরানো হয় না, যাতে "এই আছে, এই নেই" (flapping) server বারবার আসা-যাওয়া না করে।

**Capacity-র শর্ত (N+1):** দুটো server প্রত্যেকে ৭০% CPU-তে চললে, একটা পড়ার পর বাকিটার ঘাড়ে ১৪০%। সে-ও পড়বে। Redundancy তখনই কাজ করে যখন বাকিরা পড়ে যাওয়াটার ভার নিতে পারে। দুটো server হলে প্রত্যেকটা ৫০%-এর নিচে, N-টা হলে মোটামুটি (N−1)/N-এর নিচে রাখুন।`,
      diagrams: [
        {
          id: "day-006-failover",
          caption:
            "ধাপে ধাপে: একটা app server পড়ে, health check সেটা ধরে, load balancer traffic সরায়, তারপর সুস্থ হলে আবার ফিরিয়ে আনে।",
          alt: "User, Load Balancer, App Server 1, App Server 2 আর Database-এর architecture; প্রতিটা ধাপে App Server 1-এর অবস্থা আর load balancer-এর traffic-এর পথ বদলায়।",
        },
      ],
    },
    {
      title: "Failure ধরা কঠিন কেন: heartbeat, timeout আর split-brain",
      markdown: `Distributed system-এ "ওই server মারা গেছে" নিশ্চিতভাবে জানার কোনো উপায় নেই। আপনি শুধু জানেন **উত্তর আসছে না**। কারণ হতে পারে:
- Server সত্যিই crash করেছে
- Server বেঁচে আছে কিন্তু খুব ধীর (CPU 100%, লম্বা GC pause)
- Server ঠিক আছে, কিন্তু মাঝের network কেটে গেছে (network partition)

**Heartbeat**: প্রতিটা node নিয়মিত "আমি বেঁচে আছি" বার্তা পাঠায়। নির্দিষ্ট সময় (timeout) কোনো heartbeat না এলে তাকে মৃত ধরা হয়। Timeout ছোট হলে দ্রুত ধরা যায়, কিন্তু ধীর-কিন্তু-জীবিত node-কেও মৃত ভাবার ঝুঁকি।

**False failover**: Database primary আসলে ঠিক ছিল, শুধু monitoring-এর সাথে network কিছুক্ষণ কাটা। Monitoring ভাবল primary মৃত, replica-কে নতুন primary বানাল। এখন:
- পুরনো primary জানে না সে বাদ, কিছু app server এখনো তাকেই লিখছে
- নতুন primary-তেও লেখা হচ্ছে

দুজনেই নিজেকে primary ভাবছে, দুই দিকে আলাদা data লেখা হচ্ছে। একে বলে **split-brain**, আর পরে এই দুই ইতিহাস মেলানো প্রায়ই অসম্ভব (একই product দুজনকে বিক্রি, একই টাকা দুবার)।

বাস্তবে এর প্রতিরোধ:
- **Quorum**: সিদ্ধান্ত নেয় সংখ্যাগরিষ্ঠ node, তাই network দুভাগ হলে শুধু বড় ভাগটা primary বানাতে পারে। এজন্যই cluster-এ সাধারণত ৩ বা ৫টা node রাখা হয়, ২টা না।
- **Fencing**: নতুন primary আসার আগে পুরনোটাকে জোর করে লেখা থেকে আটকানো (যেমন তার storage access কেটে দেওয়া)।

এখন এটুকু জানলেই চলবে। Quorum [Day 49](${topicHrefForDay(49)})-এ, leader election [Day 52](${topicHrefForDay(52)})-এ, আর fencing token [Day 53](${topicHrefForDay(53)})-এ গভীরে যাব।`,
    },
    {
      title: "Error budget: 100% কেন ভুল লক্ষ্য",
      markdown: `"আমাদের লক্ষ্য 100% uptime", শুনতে দায়িত্বশীল, কিন্তু আসলে ভুল লক্ষ্য। কারণ:
- User-এর নিজের phone, Wi-Fi, ISP-ই 100% না। আপনি 99.99% থেকে 99.999%-এ গেলে user বেশিরভাগ ক্ষেত্রে পার্থক্য টেরই পাবে না, কারণ তার নিজের network আরও বেশি সময় বন্ধ থাকে।
- প্রতিটা বাড়তি ৯-এর খরচ আগেরটার চেয়ে অনেক বেশি: বেশি region, বেশি কপি, বেশি automation, ধীর ও সতর্ক release।
- 100% চাইলে কোনো পরিবর্তনই নিরাপদ না, তাই নতুন feature আসা থেমে যায়।

Google-এর _Site Reliability Engineering_ বই এর একটা সুন্দর সমাধান দেয়: **error budget**। SLO যদি 99.9% হয়, তাহলে বাকি **0.1% হলো budget**, যেটা "খরচ" করার অনুমতি আছে।
- ৩০ দিনে 0.1% = 0.001 × 30 × 24 × 60 = **43.2 মিনিট**।
- Request-এর হিসাবে, মাসে ১ কোটি request হলে ১০,০০০টা fail করার budget।

Budget বাকি থাকলে: নতুন release, experiment, ঝুঁকি নেওয়া যায়। Budget শেষ হলে: release থামিয়ে reliability-র কাজ। এতে "dev দ্রুত চায়, ops স্থিতিশীলতা চায়" ঝগড়াটা একটা সংখ্যার ভিত্তিতে মীমাংসা হয়।

একটা হিসাব মনে রাখার মতো: আপনার failover-এ ৩০ সেকেন্ড লাগে, আর মাসে ১০বার failover হয়। মোট ৫ মিনিট downtime, যা 99.99%-এর মাসিক budget (~৪.৪ মিনিট) একাই শেষ করে দেয়। তাই উঁচু লক্ষ্যে detection আর failover-এর প্রতিটা সেকেন্ড গোনা হয়। এ নিয়ে [Day 90](${topicHrefForDay(90)})-এ বিস্তারিত।`,
    },
  ],

  tradeOffs: {
    markdown: `**কত availability চাই, সেটাই প্রথম প্রশ্ন।** একটা internal admin panel-এর জন্য 99.5%-ই যথেষ্ট হতে পারে; payment বা login-এর জন্য 99.95% বা তার বেশি লাগতে পারে। লক্ষ্য ঠিক হয় business-এর ক্ষতি দিয়ে: এক ঘণ্টা বন্ধ থাকলে কত টাকা আর কত আস্থা যায়, আর সেটা ঠেকাতে কত খরচ।

**কখন বেশি redundancy নেবেন:** downtime-এ সরাসরি টাকা বা মানুষের নিরাপত্তা জড়িত (payment, হাসপাতাল, যোগাযোগ); অনেক user একসাথে নির্ভর করে; SLA-তে জরিমানা আছে।

**কখন নেবেন না:** ছোট project বা MVP, যেখানে এক ঘণ্টা বন্ধ থাকা সহ্য করা যায়; batch job যেটা পরে আবার চালানো যায়। এখানে multi-region-এর খরচ আর জটিলতা লাভের চেয়ে বেশি। ভালো backup আর দ্রুত restore (কম MTTR) প্রায়ই যথেষ্ট।

চারটা সাধারণ ধাপ পাশাপাশি:`,
    table: {
      headers: [
        "বিষয়",
        "Single server",
        "Active-passive (standby)",
        "Active-active, multi-AZ",
        "Multi-region",
      ],
      rows: [
        [
          "কী সামলায়",
          "কিছুই না; যেকোনো failure = পুরো downtime",
          "Primary-র failure",
          "একটা server বা একটা AZ-এর failure",
          "পুরো region-এর সমস্যা",
        ],
        [
          "Failover-এর সময়",
          "নেই; সারানো পর্যন্ত বন্ধ (MTTR = সারানোর সময়)",
          "Detection + standby চালু হওয়া (সেকেন্ড থেকে মিনিট)",
          "প্রায় সাথে সাথে; LB শুধু নষ্টটাকে বাদ দেয়",
          "সাধারণত মিনিট; DNS বা traffic routing বদলাতে হয়",
        ],
        [
          "খরচ",
          "সবচেয়ে কম",
          "প্রায় দ্বিগুণ, standby বসে থাকে",
          "বেশি, কিন্তু সব কপি কাজে লাগে",
          "সবচেয়ে বেশি, সাথে region-এর মধ্যে data transfer",
        ],
        [
          "জটিলতা",
          "সবচেয়ে সহজ",
          "মাঝারি; split-brain ঠেকাতে হয়",
          "মাঝারি; app-কে stateless রাখতে হয়",
          "অনেক বেশি; data replication, consistency, failover drill",
        ],
        [
          "Data-র ঝুঁকি",
          "Backup-এর পর থেকে সব হারাতে পারে",
          "Asynchronous replication হলে সামান্য হারাতে পারে",
          "AZ-এর মধ্যে synchronous replication সম্ভব",
          "সাধারণত asynchronous, failover-এ সাম্প্রতিক data হারানোর ঝুঁকি",
        ],
        [
          "উপযুক্ত",
          "MVP, internal tool, শেখা",
          "Database primary, stateful service",
          "বেশিরভাগ production web app",
          "Payment, বিশ্বজুড়ে user, কঠোর SLA",
        ],
      ],
    },
  },

  industry: {
    markdown: `- **Amazon S3, ২৮ ফেব্রুয়ারি ২০১৭ (US-EAST-1):** AWS-এর প্রকাশিত post-incident summary অনুযায়ী, S3 team billing system-এর একটা ধীরগতির সমস্যা debug করছিল। একজন অনুমোদিত team member একটা প্রতিষ্ঠিত playbook মেনে কিছু server সরানোর command চালান, কিন্তু command-এর একটা input ভুল দেওয়া হয়, ফলে উদ্দেশ্যের চেয়ে অনেক বেশি server সরে যায়। সেগুলো S3-এর দুটো গুরুত্বপূর্ণ subsystem (index আর placement) চালাত; দুটোকেই পুরো restart করতে হয়, আর সেই সময় S3 ওই region-এ request সামলাতে পারেনি। S3-এর উপর নির্ভরশীল ওই region-এর অন্য AWS service-গুলোও (যেমন S3 console, নতুন EC2 instance চালু করা, Lambda) প্রভাবিত হয়। AWS-এর নিজের Service Health Dashboard-ও শুরুতে update করা যায়নি, কারণ সেটাও S3-এর উপর নির্ভর করত। Summary-তে বলা হয়, বড় region-এ এই subsystem-গুলো অনেক বছর পুরো restart হয়নি, আর ততদিনে S3 এত বড় হয়েছিল যে restart আর safety check প্রত্যাশার চেয়ে বেশি সময় নেয়। পরে AWS tool-টা বদলায় যাতে capacity ধীরে সরে আর কোনো subsystem ন্যূনতম capacity-র নিচে না নামে, index subsystem-কে ছোট ছোট **cell**-এ ভাগ করার কাজ এগিয়ে আনে (blast radius কমাতে), আর Dashboard-কে একাধিক region-এ চালানোর ব্যবস্থা করে। শিক্ষা: shared dependency series-এ বসে পুরো chain-এর availability কমায়; recovery (MTTR) নিয়মিত অনুশীলন না করলে নীরবে বেড়ে যায়; আর monitoring বা status page যেন যে জিনিস monitor করছে তার উপরই নির্ভর না করে।
- **AWS Regions ও Availability Zones:** AWS-এর documentation অনুযায়ী প্রতিটা region-এ একাধিক, একে অপর থেকে বিচ্ছিন্ন AZ থাকে; প্রতিটা AZ-এ এক বা একাধিক data center, নিজস্ব power, networking আর connectivity সহ, আর AZ-গুলো কম latency-র network-এ যুক্ত। AWS-এর পরামর্শ: production workload একাধিক AZ-এ ছড়িয়ে রাখা। **Elastic Load Balancing** একাধিক AZ-এর target-এ traffic ভাগ করে আর health check-এ fail করা target-এ traffic পাঠানো বন্ধ রাখে। **Amazon RDS Multi-AZ** deployment-এ অন্য AZ-এ একটা standby রাখা হয়, primary-তে সমস্যা হলে স্বয়ংক্রিয় failover হয়।
- **Google SRE:** _Site Reliability Engineering_ (O'Reilly, 2016) বইয়ের "Embracing Risk" অধ্যায়ে error budget-এর ধারণা: 100% reliability প্রায় কখনো সঠিক লক্ষ্য না, আর (1 − SLO) হলো সেই budget যেটা দিয়ে product team release-এর ঝুঁকি নিতে পারে।
- **Kubernetes:** **liveness probe** fail করলে container restart হয় (MTTR কমায়), আর **readiness probe** fail করলে pod-কে Service-এর traffic থেকে সরিয়ে রাখা হয়, ঠিক load balancer-এর health check-এর মতো।
- **NGINX ও HAProxy:** Open-source NGINX upstream-এ **passive** health check দেয় (\`max_fails\`, \`fail_timeout\`) আর fail হলে অন্য server-এ পাঠানোর জন্য \`proxy_next_upstream\`; নিয়মিত probe পাঠানো **active** health check (\`health_check\` directive) NGINX Plus-এর feature। HAProxy open-source version-এই server-এর উপর \`check\` দিয়ে active health check দেয়।

*উৎস: AWS, "Summary of the Amazon S3 Service Disruption in the Northern Virginia (US-EAST-1) Region" (মার্চ ২০১৭); AWS documentation: Regions and Availability Zones, Elastic Load Balancing (health checks), Amazon RDS Multi-AZ; Google, Site Reliability Engineering (O'Reilly, 2016), অধ্যায় "Embracing Risk"; Kubernetes documentation (liveness, readiness probes); NGINX documentation (ngx_http_upstream_module, ngx_http_proxy_module); HAProxy documentation (health checks)।*`,
  },

  mistakes: [
    {
      mistake:
        "দুটো server রেখে ভাবা SPOF শেষ, অথচ সামনের load balancer, database বা DNS এখনো একটাই।",
      fix: "Request-এর পুরো পথ ধরে প্রতিটা অংশের জন্য প্রশ্ন করুন: 'এটা পড়লে কী হবে?' যেখানে উত্তর 'সব বন্ধ', সেটাই পরের SPOF।",
    },
    {
      mistake:
        "সব কপি একই rack, একই AZ বা একই deploy-এ রাখা, আর parallel-এর অঙ্ক দিয়ে 'four nines' দাবি করা।",
      fix: "কপিগুলো আলাদা AZ-এ ছড়ান, deploy ধাপে ধাপে দিন (canary), আর মনে রাখুন parallel-এর সূত্র শুধু স্বাধীন failure-এ খাটে।",
    },
    {
      mistake:
        "দুটো server-ই ৭০-৮০% ভারে চালানো। একটা পড়লে অন্যটা overload হয়ে সেও পড়ে।",
      fix: "N+1 capacity রাখুন: একটা কপি বাদ গেলেও বাকিরা পুরো ভার নিতে পারে, এমন headroom।",
    },
    {
      mistake:
        "Health check-এ database-সহ সব dependency পরীক্ষা করা, ফলে database এক মুহূর্ত ধীর হলে সব server একসাথে 'unhealthy' হয়ে পুরো outage।",
      fix: "Readiness check-এ শুধু নিজের অবস্থা দেখুন; shared dependency-র সমস্যা আলাদাভাবে alert আর graceful degradation দিয়ে সামলান।",
    },
    {
      mistake:
        "Backup বা standby রাখা, কিন্তু কখনো failover বা restore অনুশীলন না করা।",
      fix: "নিয়মিত failover drill আর restore test করুন। যে recovery কখনো চালানো হয়নি, তার MTTR অজানা।",
    },
    {
      mistake:
        "Server-এর uptime দেখে availability মাপা, অথচ user error পাচ্ছে (ভুল config, DNS সমস্যা, ধীর response)।",
      fix: "User-এর চোখে মাপুন: load balancer বা edge-এ সফল request-এর হার, আর বাইরে থেকে synthetic check।",
    },
    {
      mistake:
        "একটা optional feature (recommendation, review) down হলে পুরো page বা checkout ভেঙে দেওয়া।",
      fix: "Critical আর optional dependency আলাদা করুন; optional-এ timeout আর fallback দিন (graceful degradation)।",
    },
  ],

  lab: [
    {
      title: "দুটো backend আর একটা NGINX load balancer সাজান",
      markdown: `একটা ফাঁকা folder-এ চারটা file বানাবো: \`compose.yaml\`, backend আর load balancer-এর NGINX config, আর একটা ছোট script। প্রথমে \`compose.yaml\`:

\`\`\`bash
mkdir -p ha-lab/backend ha-lab/lb && cd ha-lab
cat > compose.yaml <<'EOF'
name: sdlab-day006

services:
  backend-1:
    image: nginx:1.27-alpine
    container_name: sdlab-day006-backend-1
    hostname: backend-1
    volumes:
      - ./backend:/etc/nginx/conf.d:ro

  backend-2:
    image: nginx:1.27-alpine
    container_name: sdlab-day006-backend-2
    hostname: backend-2
    volumes:
      - ./backend:/etc/nginx/conf.d:ro

  lb:
    image: nginx:1.27-alpine
    container_name: sdlab-day006-lb
    ports:
      - "8086:80"
    volumes:
      - ./lb:/etc/nginx/conf.d:ro
    depends_on:
      - backend-1
      - backend-2
EOF
\`\`\`

প্রতিটা backend শুধু নিজের নাম বলবে, যাতে বোঝা যায় কে উত্তর দিল:

\`\`\`bash
cat > backend/default.conf <<'EOF'
server {
    listen 80;
    location / {
        default_type text/plain;
        return 200 "served by $hostname";
    }
}
EOF
\`\`\``,
    },
    {
      title: "Load balancer-এ health check আর retry বসান",
      markdown: `Load balancer-এর config, \`lb/default.conf\`:

\`\`\`bash
cat > lb/default.conf <<'EOF'
upstream app {
    zone app 64k;
    server backend-1:80 max_fails=1 fail_timeout=10s;
    server backend-2:80 max_fails=1 fail_timeout=10s;
}

server {
    listen 80;
    location / {
        proxy_pass http://app;
        proxy_connect_timeout 1s;
        proxy_read_timeout 2s;
        proxy_next_upstream error timeout http_502 http_503;
        proxy_next_upstream_tries 2;
    }
}
EOF
\`\`\`

প্রতিটা লাইনের কাজ:
- \`max_fails=1 fail_timeout=10s\`: একটা server-এ request fail করলে NGINX তাকে **১০ সেকেন্ড বাদ** রাখে, তারপর আবার একবার চেষ্টা করে। এটা **passive health check**: আলাদা probe না পাঠিয়ে আসল request-এর ফল দেখে সিদ্ধান্ত।
- \`proxy_next_upstream ...\`: connect-এ error, timeout বা 502/503 এলে একই request **অন্য server-এ retry** করে। User error-ই দেখে না।
- \`proxy_connect_timeout 1s\`: নষ্ট server-এর জন্য বেশিক্ষণ অপেক্ষা না করা (default 60 সেকেন্ড!)। এটাই detection-এর সময়।
- \`zone app 64k\`: NGINX-এর সব worker process একই upstream state ভাগ করে, যাতে "কে বাদ" সেটা সবাই জানে আর round-robin ঠিকমতো পালা করে।

এবার request গোনার একটা script, \`loop.sh\`:

\`\`\`bash
cat > loop.sh <<'EOF'
#!/usr/bin/env bash
# ব্যবহার: ./loop.sh [কতবার]   (default 60, প্রতি 0.5 সেকেন্ডে একটা request)
N=\${1:-60}
ok=0; fail=0
for i in $(seq 1 "$N"); do
  resp=$(curl -s --max-time 3 -w '\\n%{http_code}' http://localhost:8086/)
  code=$(echo "$resp" | tail -n 1)
  if [ "$code" = "200" ]; then
    ok=$((ok+1)); echo "$i: $code $(echo "$resp" | head -n 1)"
  else
    fail=$((fail+1)); echo "$i: $code ✕"
  fi
  sleep 0.5
done
echo "ok=$ok fail=$fail availability=$(awk -v o=$ok -v n=$N 'BEGIN{printf "%.1f", 100*o/n}')%"
EOF
chmod +x loop.sh
\`\`\`

চালু করে একবার দেখুন:

\`\`\`bash
docker compose up -d
./loop.sh 6
\`\`\`

\`\`\`text
1: 200 served by backend-1
2: 200 served by backend-2
3: 200 served by backend-1
...
ok=6 fail=0 availability=100.0%
\`\`\`

দুটো backend পালা করে উত্তর দিচ্ছে: active-active।`,
    },
    {
      title: "পরীক্ষা ১: একটা backend মেরে দিন",
      markdown: `দুটো terminal লাগবে। **Terminal 1**-এ ৩০ সেকেন্ডের loop চালান:

\`\`\`bash
./loop.sh 60
\`\`\`

কয়েক সেকেন্ড পর **Terminal 2**-এ:

\`\`\`bash
docker stop sdlab-day006-backend-1
\`\`\`

Terminal 1-এ দেখবেন, এর পর থেকে সব উত্তর \`200 served by backend-2\`। একটাও error না।

খেয়াল করুন, মাঝে মাঝে একটা request প্রায় ১ সেকেন্ড দেরিতে আসে। কারণ বন্ধ container-এর ঠিকানায় connect চেষ্টা \`proxy_connect_timeout\`-এ (১s) গিয়ে fail করে, তারপর NGINX request-টা backend-2-এ retry করে। আর ১০ সেকেন্ড (\`fail_timeout\`) পরপর NGINX backend-1-কে আবার একবার পরীক্ষা করে। User error দেখল না, কিন্তু latency দিয়ে detection-এর দাম দিল।

NGINX-এর log-এ এটা দেখতে পাবেন:

\`\`\`bash
docker logs sdlab-day006-lb 2>&1 | grep upstream | tail -2
\`\`\`

\`\`\`text
... upstream server temporarily disabled while connecting to upstream ...
... upstream timed out (110: Operation timed out) while connecting to upstream ...
\`\`\``,
    },
    {
      title: "পরীক্ষা ২: দুটোই বন্ধ, তারপর ফিরিয়ে আনুন",
      markdown: `Terminal 1-এ আবার \`./loop.sh 60\` চালান। Terminal 2-এ কয়েক সেকেন্ড পর পর:

\`\`\`bash
docker stop sdlab-day006-backend-2        # এবার দুটোই বন্ধ
# ৮-১০ সেকেন্ড অপেক্ষা করুন, তারপর:
docker start sdlab-day006-backend-1 sdlab-day006-backend-2
\`\`\`

(আগের পরীক্ষায় backend-1 বন্ধই আছে। না থাকলে আগে সেটাও stop করুন।)

আমাদের একটা চালানোয় এরকম এসেছিল:

\`\`\`text
23: 200 served by backend-2
24: 502 ✕
...
42: 502 ✕
43: 200 served by backend-2
...
ok=41 fail=19 availability=68.3%
\`\`\`

দুটো জিনিস খেয়াল করুন:
1. দুটোই বন্ধ হলে \`502 Bad Gateway\`, আর NGINX log-এ \`no live upstreams\`। Redundancy-র সব কপি একসাথে পড়লে কিছুই বাঁচাতে পারে না, এটাই correlated failure-এর চেহারা।
2. Container চালু করার **পরেও** কয়েক সেকেন্ড 502 চলতে পারে (সর্বোচ্চ \`fail_timeout\`, অর্থাৎ ১০ সেকেন্ড)। কারণ NGINX তখনো তাদের "বাদ" ধরে রাখতে পারে, \`fail_timeout\` শেষ হলে তবে আবার চেষ্টা করে। কতক্ষণ চলবে তা stop/start-এর সময়ের উপর নির্ভর করে। অর্থাৎ MTTR = সারানোর সময় + "সেরে উঠেছে" সেটা ধরার সময়।

**Availability হিসাব:** loop-এর শেষ লাইন নিজেই হিসাব করে: সফল ÷ মোট। উপরের উদাহরণে 41 ÷ 60 = **68.3%**। শুধু পরীক্ষা ১-এর সময় (একটা backend বন্ধ) হিসাব করলে 100%, কারণ retry আর passive health check মিলে user কোনো error দেখেনি। আপনার সংখ্যা stop/start-এর সময়ের উপর নির্ভর করে একটু আলাদা হবে।`,
    },
    {
      title: "পরীক্ষা ৩ (ঐচ্ছিক): retry বন্ধ করলে কী হয়",
      markdown: `দুটো backend চালু আছে নিশ্চিত হয়ে নিন (\`./loop.sh 4\`-এ দুজনের নামই আসছে)। তারপর \`lb/default.conf\`-এ retry বন্ধ করে NGINX reload দিন:

\`\`\`bash
sed -i.bak 's/proxy_next_upstream error timeout http_502 http_503;/proxy_next_upstream off;/' lb/default.conf
docker exec sdlab-day006-lb nginx -t && docker exec sdlab-day006-lb nginx -s reload
docker stop sdlab-day006-backend-1
./loop.sh 30
\`\`\`

এবার backend-1 বন্ধ হওয়ার পর প্রথম request-টা \`504 ✕\` (connect timeout), তারপর ১০ সেকেন্ড সব backend-2-এ যায়, আর \`fail_timeout\` শেষে NGINX আবার backend-1 চেষ্টা করলে আরেকটা \`504\`। আমাদের চালানোয় ৩০-এ ২টা fail, availability 93.3%।

শিক্ষা: শুধু health check (নষ্টটাকে বাদ দেওয়া) যথেষ্ট না; detection-এর মুহূর্তের request-গুলো বাঁচাতে **retry** লাগে। দুটো ছোট সতর্কতা: \`nginx -t\` চালানোর সময় দুটো backend চালু থাকা দরকার, কারণ বন্ধ container-এর নাম Docker-এর DNS-এ পাওয়া যায় না আর config test fail করে। আর আমরা config-এর পুরো folder mount করেছি, একটা file না; কারণ \`sed -i\` আসলে নতুন file বানিয়ে পুরনোটার জায়গায় বসায়, আর single-file mount container-এর ভেতরে পুরনো file-টাই দেখাতে থাকে।

শেষে সব পরিষ্কার করুন:

\`\`\`bash
docker compose down
\`\`\``,
    },
  ],

  connections: {
    markdown: `- **[Day 1 · সিস্টেম ডিজাইন আসলে কী?](${topicHrefForDay(1)})**: সেখানে বলেছিলাম system design মানে trade-off। Availability তার সবচেয়ে স্পষ্ট উদাহরণ: প্রতিটা বাড়তি ৯-এর দাম আছে, আর কতটা লাগবে তা ঠিক করে business।
- **[Day 2 · Client, Server ও Internet](${topicHrefForDay(2)})**: একটা request client থেকে অনেক hop পার হয়ে server-এ যায়। আজ দেখলাম সেই পথের প্রতিটা অংশ series-এ বসা, আর প্রত্যেকে মোট availability-তে ভাগ বসায়।
- **[Day 4 · API কী? REST-এর বেসিক](${topicHrefForDay(4)})**: Failover-এর সময় retry হয়, তাই idempotent request আর idempotency key এখানে সরাসরি কাজে লাগে।
- **[Day 5 · Scalability](${topicHrefForDay(5)})**: Horizontal scaling-এ একাধিক server রাখি ভার সামলাতে; একই কপিগুলো redundancy-ও দেয়। তবে দুটো আলাদা লক্ষ্য: scaling-এর প্রশ্ন "কত ভার?", availability-র প্রশ্ন "কিছু পড়লে কী?"

সামনে যেখানে এগুলো আবার আসবে:
- **[Day 8 · CAP Theorem](${topicHrefForDay(8)})**: Network ভাগ হলে availability আর consistency-র মধ্যে বাছাই।
- **[Day 9 · Load Balancers](${topicHrefForDay(9)})**: Health check, algorithm আর LB নিজে যেন SPOF না হয়।
- **[Day 28 · Database Replication](${topicHrefForDay(28)})**: Primary-replica, synchronous বনাম asynchronous, আর database failover।
- **[Day 49](${topicHrefForDay(49)}) · [52](${topicHrefForDay(52)}) · [53](${topicHrefForDay(53)})**: Quorum, leader election আর fencing, অর্থাৎ split-brain ঠেকানোর কৌশল।
- **[Day 59 · Circuit Breaker & Bulkhead](${topicHrefForDay(59)})**: Graceful degradation আর cascading failure থামানোর pattern।
- **[Day 85 · Blue-Green ও Canary Deploy](${topicHrefForDay(85)})**: Planned downtime শূন্যে আনা আর খারাপ deploy-এর blast radius ছোট রাখা।
- **[Day 88 · Multi-region ও Edge](${topicHrefForDay(88)})**: এখন এটুকু জানলেই চলবে, Day 88-এ গভীরে যাব।
- **[Day 90 · SLI, SLO, SLA ও Error Budget](${topicHrefForDay(90)})**: এখন এটুকু জানলেই চলবে, Day 90-এ গভীরে যাব।
- **[Day 92 · Chaos Engineering](${topicHrefForDay(92)})** আর **[Day 94 · Disaster Recovery](${topicHrefForDay(94)})**: ইচ্ছা করে failure ঘটিয়ে redundancy পরীক্ষা, আর RPO/RTO।`,
  },

  explainYourself: [
    {
      question:
        'আপনার manager বলছেন, "আমাদের দুটো app server আছে, প্রতিটা 99.9%, তাই আমরা 99.9999% available।" এই দাবিতে কী কী সমস্যা আছে?',
      idealAnswer:
        "প্রথমত, 1 − (0.001)² = 99.9999% সূত্রটা শুধু app অংশের, আর শুধু তখনই খাটে যখন দুটো server-এর failure স্বাধীন। একই AZ, একই deploy বা একই config-এ থাকলে তারা একসাথে পড়বে। দ্বিতীয়ত, request-এর পথে load balancer, database, DNS-এর মতো আরও অংশ series-এ আছে; সেগুলোর availability গুণ হয়ে মোট ফলাফল অনেক কমবে, single database থাকলে সেটাই ছাদ। তৃতীয়ত, failover-এর সময় detection-এর কয়েক সেকেন্ডে কিছু request fail করে, আর একটা server পড়লে অন্যটা পুরো ভার নিতে পারবে কিনা (N+1 capacity) সেটাও দেখতে হবে।",
    },
    {
      question:
        "আপনার service মাসে গড়ে দুবার পড়ে, প্রতিবার সারাতে ৪৫ মিনিট লাগে। availability বাড়াতে আপনার হাতে একটা quarter আছে। কোথায় সময় দেবেন, আর কেন?",
      idealAnswer:
        "এখন মাসে প্রায় ৯০ মিনিট downtime, মানে প্রায় 99.8%। Failure-এর সংখ্যা অর্ধেক করলেও ৪৫ মিনিট থাকে। কিন্তু MTTR ৪৫ থেকে ৫ মিনিটে আনলে মাসে মাত্র ১০ মিনিট, প্রায় 99.98%। তাই আগে MTTR কমানোয় জোর দেব: ভালো alert যাতে সাথে সাথে জানা যায়, auto-restart আর health check দিয়ে স্বয়ংক্রিয় failover, এক command-এ rollback, আর লেখা ও অনুশীলন করা runbook। পাশাপাশি দুটো failure-এর মূল কারণ খুঁজে বড়টা সারাব।",
    },
    {
      question:
        "Availability, reliability আর durability-র পার্থক্য একটা bKash বা ব্যাংকিং app-এর উদাহরণ দিয়ে বোঝান।",
      idealAnswer:
        "Availability: app খুলে send money করতে চাইলে সেটা করা যাচ্ছে কিনা; সার্ভার বন্ধ থাকলে availability কমে। Reliability: যা করছে তা ঠিকঠাক করছে কিনা, দীর্ঘ সময় ধরে; app চালু কিন্তু মাঝে মাঝে ভুল balance দেখালে সেটা available কিন্তু reliable না। Durability: একবার লেনদেন সফল দেখালে সেই রেকর্ড কখনো হারাবে না; এক ঘণ্টা app বন্ধ থাকলেও (availability কমল) কারও লেনদেনের রেকর্ড হারায়নি মানে durability ঠিক আছে। তিনটার সমাধানও আলাদা: availability-র জন্য redundancy আর failover, reliability-র জন্য testing আর সঠিক logic, durability-র জন্য replication আর backup।",
    },
  ],

  interviewQuestions: [
    {
      question: "এই system-কে highly available কিভাবে বানাবেন?",
      answerOutline: `- আগে লক্ষ্য জিজ্ঞেস করুন: কত nines, কোন অংশের জন্য, কত downtime-এ কত ক্ষতি
- Request-এর পথ ধরে SPOF খুঁজুন: DNS, LB, app, cache, database, বাইরের dependency
- Stateless app: LB-এর পেছনে active-active, একাধিক AZ-এ, health check + N+1 capacity
- Database: primary + অন্য AZ-এ standby/replica, স্বয়ংক্রিয় failover, split-brain প্রতিরোধ
- Correlated failure: ধাপে ধাপে deploy (canary), config-ও ধাপে, AZ-এ ছড়ানো
- Graceful degradation: critical বনাম optional dependency, timeout আর fallback
- মাপা: request-ভিত্তিক SLI, SLO, alert; MTTR কমানো (runbook, rollback)`,
    },
    {
      question:
        "তিনটা service series-এ: 99.95%, 99.9% আর 99.99%। মোট availability কত? কিভাবে বাড়াবেন?",
      answerOutline: `- Series-এ গুণ: 0.9995 × 0.999 × 0.9999 ≈ 0.9984 → প্রায় 99.84%, বছরে ~১৪ ঘণ্টা
- ফলাফল সবচেয়ে দুর্বল অংশের (99.9%) চেয়েও কম
- বাড়ানোর পথ: সবচেয়ে দুর্বল অংশে redundancy (দুটো 99.9% parallel → 99.9999%)
- Critical path থেকে dependency সরানো: async (queue), cache, optional হলে fallback
- উল্লেখ করুন parallel-এর অঙ্ক স্বাধীন failure ধরে নেয়`,
    },
    {
      question: "Active-active আর active-passive-এর মধ্যে কখন কোনটা?",
      answerOutline: `- Active-active: সব কপি traffic নেয়; stateless service-এ স্বাভাবিক; capacity নষ্ট হয় না; failover প্রায় তাৎক্ষণিক; কিন্তু N+1 headroom লাগে, আর stateful হলে একাধিক writer-এর conflict
- Active-passive: একজন কাজ করে, standby অপেক্ষায়; database primary-র মতো "এক writer" দরকার এমন জায়গায়; সহজ consistency; কিন্তু standby-র খরচ, switch-এর সময়, আর split-brain ঝুঁকি
- Standby-র ধরন: hot (সাথে সাথে প্রস্তুত), warm, cold, যত ঠান্ডা তত সস্তা কিন্তু তত ধীর`,
    },
    {
      question: "Health check কিভাবে design করবেন? কী ভুল হতে পারে?",
      answerOutline: `- Interval, timeout, unhealthy/healthy threshold; detection-এর সময় ≈ interval × threshold
- দ্রুত detection বনাম false positive-এর trade-off; flapping ঠেকাতে healthy threshold
- Liveness (restart করো) বনাম readiness (traffic দিও না)
- Deep check-এর ফাঁদ: shared database check করলে সব instance একসাথে unhealthy, LB নিজেই outage বানায়
- Passive check (আসল request-এর ফল) + retry অন্য instance-এ, শুধু idempotent request-এ`,
    },
    {
      question: "আপনার SLO 99.9%। এর মানে কী, আর team কিভাবে এটা ব্যবহার করবে?",
      answerOutline: `- SLI ঠিক করুন: যেমন সফল (non-5xx, নির্দিষ্ট latency-র নিচে) request-এর %
- 30 দিনে 0.1% error budget ≈ 43.2 মিনিট, বা মোট request-এর 0.1%
- Budget থাকলে release আর experiment; শেষ হলে release থামিয়ে reliability-র কাজ
- SLA (customer চুক্তি) SLO-র চেয়ে ঢিলা রাখুন
- 100% কেন লক্ষ্য না: খরচ, user-এর নিজের network-ও 100% না, release থেমে যায়`,
    },
  ],

  summary: {
    points: [
      "Availability = user কত ভাগ সময় বা কত ভাগ request-এ system ঠিকমতো ব্যবহার করতে পারল; মাপুন user-এর চোখে।",
      "প্রতিটা বাড়তি ৯ মানে downtime দশ ভাগের এক ভাগ: 99.9% ≈ বছরে 8.76 ঘণ্টা, 99.99% ≈ 52.6 মিনিট।",
      "SPOF সরাতে redundancy (active-active বা active-passive), সাথে health check আর failover।",
      "Series-এ availability গুণ হয়ে কমে; parallel-এ 1 − (1 − A)ⁿ, কিন্তু শুধু স্বাধীন failure-এ।",
      "A = MTBF ÷ (MTBF + MTTR); দ্রুত সেরে ওঠা প্রায়ই failure কমানোর চেয়ে সস্তা।",
      "Correlated failure (একই AZ, deploy, config) redundancy-কে অকেজো করে; blast radius ছোট রাখুন।",
      "100% ভুল লক্ষ্য: SLO ঠিক করুন, error budget দিয়ে ঝুঁকি আর গতির ভারসাম্য রাখুন।",
    ],
    diagram: {
      id: "day-006-summary",
      caption: "এক নজরে Availability",
      alt: "Load balancer দুটো app server-এ traffic পাঠায়, একটা বন্ধ তাই সব traffic অন্যটায়; নিচে database primary আর replica।",
    },
  },
};
