// Day 7 · Latency vs Throughput — Phase 1 introduction (Day 95 goes deeper into
// latency budgets and tail latency).

import { topicHrefForDay } from "@/lib/data/courses/system-design-a-z";
import type { SdLesson } from "@/lib/system-design/lesson.types";

const day = topicHrefForDay;

export const day007Lesson: SdLesson = {
  topicId: "sd-day-007",
  day: 7,
  title: "Latency vs Throughput",
  definition:
    "Latency হলো একটা কাজ শুরু থেকে শেষ হতে কত সময় লাগে, আর throughput হলো প্রতি সেকেন্ডে কতগুলো কাজ শেষ হয়; দুটো আলাদা সংখ্যা, একটা ভালো হলেই অন্যটা ভালো হয় না।",

  objectives: [
    "Latency, throughput আর bandwidth-এর পার্থক্য উদাহরণ দিয়ে বলতে পারবেন, আর কেন একটা ভালো হলেও অন্যটা খারাপ হতে পারে, বুঝিয়ে বলতে পারবেন।",
    "একটা request-এর সময় DNS, TCP, TLS, server আর transfer-এ ভাগ করে কোথায় সময় যাচ্ছে খুঁজে বের করতে পারবেন, আর sequential বনাম parallel call-এর latency budget হিসাব করতে পারবেন।",
    "গড়ের বদলে p50/p95/p99 দিয়ে latency পড়তে পারবেন, আর fan-out-এ tail latency কেন বিস্ফোরিত হয় (1 − 0.99ⁿ) হিসাব করে দেখাতে পারবেন।",
    "Little's Law (L = λ × W) দিয়ে কাঙ্ক্ষিত throughput-এর জন্য কত concurrency, thread বা connection লাগবে হিসাব করতে পারবেন।",
    "Batching, caching, parallelism, hedged request-এর মতো কৌশল latency-তে আর throughput-এ কী প্রভাব ফেলে, trade-off সহ বলতে পারবেন।",
  ],

  prerequisites: [
    { day: 2, title: "Client, Server ও Internet", href: day(2) },
    { day: 3, title: "DNS, HTTP ও একটি URL-এর গল্প", href: day(3) },
    { day: 5, title: "Scalability", href: day(5) },
  ],

  problem: {
    markdown: `রাফি আর তার দুই বন্ধু "টিকিটঘর" নামে একটা app বানিয়েছে: ঢাকা থেকে বিভিন্ন জেলার বাসের টিকিট কাটা যায়। খরচ বাঁচাতে server রেখেছে আমেরিকার পূর্ব উপকূলের একটা সস্তা cloud region-এ। User প্রায় সবাই বাংলাদেশে।

App-এর monitoring dashboard দেখে সবাই খুশি: **server গড়ে ৩০ms-এ উত্তর দেয়।** অথচ Play Store-এ review: "app খুলতেই ৩ সেকেন্ড", "বারবার ঘুরতে থাকে"। রাফি বিভ্রান্ত। Server তো দ্রুত!

হিসাব করে দেখা গেল সময় আসলে কোথায় যায়। ঢাকা থেকে ওই server-এ একবার যাওয়া-আসা (round trip, RTT) প্রায় **২৫০ms**।

1. **নতুন connection:** DNS (~৪০ms), তারপর TCP handshake (১ RTT = ২৫০ms), TLS handshake (আরও ১ RTT = ২৫০ms)। Server এখনো একটা লাইনও code চালায়নি, অথচ ~৫৪০ms শেষ।
2. **Home page:** একটা request, ১ RTT + ৩০ms server = ২৮০ms।
3. **তারপর app একটার পর একটা ৬টা API call করে:** profile, শহরের তালিকা, offer, আগের টিকিট, ব্যানার, notification। প্রতিটা আগেরটার উত্তর আসার পরে শুরু হয়। ৬ × ২৮০ = **১,৬৮০ms**।

মোট প্রায় **২.৫ সেকেন্ড**, যার মধ্যে server-এর আসল কাজ মাত্র ৭ × ৩০ = ২১০ms। বাকি ৯০%-এর বেশি সময় data শুধু সমুদ্রের নিচের cable দিয়ে আসা-যাওয়া করছে।

আরও দুটো ধাঁধা ছিল:
- **বৃহস্পতিবার সন্ধ্যায়** (ছুটির আগে টিকিটের ভিড়) dashboard-এ গড় ৪৫ms, তেমন খারাপ না। কিন্তু support-এ অভিযোগ, কারও কারও ৫-৬ সেকেন্ড লাগছে। গড় সংখ্যাটা ধীরতম ১-২% user-কে পুরো লুকিয়ে ফেলছিল।
- একজন বন্ধু বলল, "bandwidth কম, server-এর plan 100 Mbps থেকে 1 Gbps করি।" করা হলো, খরচ বাড়ল, কিন্তু app-এর গতি প্রায় একই থাকল। কারণ প্রতিটা response মাত্র কয়েক KB; সেগুলো পাঠাতে bandwidth কখনো সমস্যাই ছিল না, সমস্যা ছিল দূরত্ব আর round trip-এর সংখ্যা।

তিনটা ভুল ধারণা একসাথে: server-এর latency মানেই user-এর latency; গড় দিয়েই সব বোঝা যায়; আর bandwidth বাড়ালেই দ্রুত হবে। এই lesson-এর বিষয় এটাই: **latency, throughput আর bandwidth তিনটা আলাদা জিনিস, আর এদের ঠিকভাবে মাপতে ও আলাদা করে ভাবতে জানা।**`,
    diagrams: [
      {
        id: "day-007-before",
        caption:
          "আগে: server-এর dashboard বলছে ৩০ms, কিন্তু ঢাকা থেকে প্রতিটা call-এ ~২৫০ms round trip, আর ৬টা call একটার পর একটা; user অপেক্ষা করে ~২.৫ সেকেন্ড।",
        alt: "বামে ঢাকার একটা Browser, মাঝে US East-এ API Server, ডানে Database। Browser থেকে server-এ লাল তীর, লেখা ৬টা call একটার পর একটা, প্রতিটায় RTT ২৫০ms। Server থেকে database-এ ৩০ms। নিচে একটা monitoring dashboard, dashed তীরে লেখা শুধু server-এর সময়: গড় ৩০ms।",
      },
    ],
  },

  analogy: {
    markdown: `ফার্মগেট থেকে মতিঝিল যেতে হবে। রাস্তার মোড়ে দুটো বিকল্প।

**CNG:** তিনজন উঠলেই ছেড়ে দেয়, অলিগলি দিয়ে ২০ মিনিটে পৌঁছে দেয়। প্রতিটা যাত্রীর জন্য খুব দ্রুত। কিন্তু একটা CNG ঘণ্টায় মোটে ৯ জন যাত্রী (২০ মিনিটে ৩ জন) পার করতে পারে।

**দোতলা BRTC বাস:** ৬০ জন না ভরা পর্যন্ত stand-এ দাঁড়িয়ে থাকে, পথে প্রতিটা stop-এ থামে, পৌঁছাতে লাগে ৪৫ মিনিট। প্রতিটা যাত্রীর জন্য ধীর। কিন্তু একটা বাস ঘণ্টায় ৮০ জন (৪৫ মিনিটে ৬০ জন) পার করে, CNG-এর প্রায় ৯ গুণ।

- **Latency = একজন যাত্রীর যাত্রার সময়।** CNG জেতে (২০ বনাম ৪৫ মিনিট)।
- **Throughput = ঘণ্টায় কতজন পৌঁছায়।** বাস জেতে (৮০ বনাম ৯ জন)।
- **Bandwidth = রাস্তা কত চওড়া, কয়টা lane।** চার lane-এর রাস্তায় একসাথে অনেক গাড়ি চলতে পারে, কিন্তু রাস্তা চওড়া করলে কোনো একটা গাড়ির গতি বাড়ে না, ফার্মগেট-মতিঝিলের দূরত্বও কমে না।

আরও দুটো জিনিস এই দৃশ্যে লুকিয়ে আছে:
- বাস যে "ভরা পর্যন্ত অপেক্ষা করে", সেটাই **batching**: প্রতিটা যাত্রীর দেরি বাড়ে, কিন্তু মোট পরিবহন বাড়ে।
- শাহবাগের মোড়ে জ্যাম লাগলে CNG-ও আটকে যায়। রাস্তা যত ভরা, অপেক্ষা তত বেশি। এটাই **queuing**, আর রাস্তা প্রায় পুরো ভরা হলে অপেক্ষা হঠাৎ অনেক বেড়ে যায়।

কোনটা ভালো? প্রশ্নটাই ভুল। অফিসে দেরি হয়ে গেলে আপনার দরকার কম latency (CNG)। শহরের লক্ষ মানুষকে রোজ সরাতে হলে দরকার বেশি throughput (বাস)। Software-এও একই: user যে page-এর জন্য অপেক্ষা করছে সেখানে latency, রাতে চলা report বা video encode-এ throughput।`,
    diagrams: [
      {
        id: "day-007-analogy",
        caption:
          "ফার্মগেট থেকে মতিঝিল: CNG একজনকে দ্রুত পৌঁছায় (কম latency), বাস ঘণ্টায় অনেক বেশি মানুষ পার করে (বেশি throughput), আর রাস্তার চওড়া হলো bandwidth।",
        alt: "একটা চওড়া রাস্তা, বামে ফার্মগেট, ডানে মতিঝিল। উপরের lane-এ একটা CNG, পাশে লেখা ৩ জন, ২০ মিনিট, ঘণ্টায় ~৯ জন। নিচের lane-এ একটা বাস, পাশে লেখা ৬০ জন, ৪৫ মিনিট, ঘণ্টায় ~৮০ জন। রাস্তার পাশে বন্ধনী দিয়ে লেখা রাস্তার চওড়া = bandwidth।",
      },
    ],
  },

  coreConcept: {
    markdown: `তিনটা শব্দ, তিনটা আলাদা প্রশ্ন:

- **Latency** (দেরি): একটা কাজ শুরু থেকে শেষ হতে কত সময় লাগে। একক সাধারণত **ms** (millisecond)। "একটা search request-এ ১২০ms লাগল।"
- **Throughput** (কাজের হার): প্রতি একক সময়ে কতগুলো কাজ শেষ হয়। একক **req/s**, **MB/s**, order/minute। "Server সেকেন্ডে ২,০০০টা request সামলায়।"
- **Bandwidth** (পাইপের মোটা): একটা link সর্বোচ্চ কত data বহন করতে পারে, যেমন 100 Mbps। এটা ক্ষমতা, আসলে কতটা যাচ্ছে সেটা না। আসলে যতটা যাচ্ছে সেটা throughput, আর throughput কখনো bandwidth-এর বেশি হতে পারে না।

**কেন এরা আলাদা?** একটা মজার উদাহরণ: ২ TB data-ভরা একটা hard drive কুরিয়ারে চট্টগ্রাম পাঠালেন, পৌঁছাল ২ দিনে। Latency **২ দিন**, ভয়ংকর। কিন্তু throughput = ২ TB ÷ ২ দিন ≈ **৯২ Mbps**, যেটা অনেক বাসার internet-এর চেয়ে বেশি! উল্টো দিকে, একটা chat message ৫০ms-এ পৌঁছায় (দারুণ latency), কিন্তু তাতে data মাত্র কয়েক byte।

| পরিস্থিতি | Latency | Throughput |
|---|---|---|
| কুরিয়ারে hard drive | খুব খারাপ (দিন) | খুব ভালো |
| ঢাকা থেকে Singapore-এ ছোট API call | ভালো (~৫০ms) | একটা connection-এ কম |
| রাতে চলা batch report | গুরুত্বহীন | গুরুত্বপূর্ণ |
| ১০০% ব্যস্ত server | খারাপ (লাইন) | সর্বোচ্চ |

**Latency কোথা থেকে আসে?** [Day 2](${day(2)})-এ চারটা উৎস দেখেছি: **propagation** (দূরত্ব; fiber-এ আলো ~২,০০,০০০ km/s, মানে প্রতি ১,০০০ km-এ ~৫ms এক দিকে), **transmission** (bit লাইনে তোলা; bandwidth-এর উপর নির্ভর), **queuing** (ভিড়ে লাইনে দাঁড়ানো) আর **processing** (server-এর আসল কাজ)। [Day 3](${day(3)})-এ দেখেছি নতুন HTTPS connection-এ DNS, TCP আর TLS-এর জন্য কয়েকটা round trip লাগে। এগুলো জোড়া দিলে একটা request-এর পুরো সময়টা একটা **timeline** (waterfall) হিসেবে দেখা যায়, নিচের মূল diagram-এ।

খেয়াল করুন: server-এর আসল কাজ এই timeline-এর একটা ছোট টুকরো। **User যে latency অনুভব করে = network + handshake + লাইনে অপেক্ষা + server-এর কাজ + data ফেরত আসা।** তাই server-এর log-এ লেখা "৩০ms" দিয়ে user-এর অভিজ্ঞতা বোঝা যায় না।

**একটার পর একটা, নাকি একসাথে?** টিকিটঘরের ৬টা call পরস্পরের উপর নির্ভর করে না। একটার পর একটা (sequential) চালালে সময় **যোগ** হয়; একসাথে (parallel) চালালে সময় হয় **সবচেয়ে ধীরটার সমান**। এটা latency budget-এর সবচেয়ে মৌলিক নিয়ম (নিচের before/after diagram)।

**গড় কেন মিথ্যা বলে: percentile।** ১,০০০টা request-এর মধ্যে ৯৯০টা ৩০ms-এ আর ১০টা ৫ সেকেন্ডে শেষ হলে গড় হয় ~৮০ms, যেটা কারও অভিজ্ঞতার সাথেই মেলে না। তাই latency মাপা হয় **percentile** দিয়ে:
- **p50 (median)**: অর্ধেক request এর চেয়ে দ্রুত। "সাধারণ" user-এর অভিজ্ঞতা।
- **p95 / p99**: ৯৫% বা ৯৯% request এর মধ্যে শেষ হয়। বাকি ৫% বা ১% এর চেয়ে ধীর।
- **p99.9**: হাজারে একজনের অভিজ্ঞতা।

p99 = ৮০০ms মানে প্রতি ১০০টা request-এ একটা ৮০০ms-এর বেশি নেয়। একজন user এক session-এ ৫০টা request করলে তার ধীর request পাওয়ার সম্ভাবনা অনেক, তাই **tail** (ধীরতম কয়েক %) আসলে অনেক user-কেই ছোঁয়।

**Load বাড়লে দুটো জড়িয়ে যায়।** [Day 5](${day(5)})-এ load test-এর "knee" দেখেছি: capacity-র কাছে গেলে throughput আর বাড়ে না, কিন্তু latency খাড়া উপরে ওঠে, কারণ request লাইনে দাঁড়ায়। তাই "throughput বাড়াতে server-কে ১০০% চালাই" আর "latency কম রাখি" একসাথে হয় না। এই সম্পর্কের অঙ্ক (Little's Law) গভীরে যাই অংশে।`,
    diagrams: [
      {
        id: "day-007-main",
        caption:
          "একটা নতুন HTTPS request-এর timeline (ঢাকা থেকে Singapore, RTT ~৫০ms): বেশিরভাগ সময় network আর handshake-এ, server-এর কাজ ছোট একটা অংশ। নিচের নামগুলো curl -w-এর variable।",
        alt: "Waterfall chart, X অক্ষে ০ থেকে ২৬০ms। পাঁচটা অনুভূমিক bar ক্রমে: DNS ০-৩০ms, TCP handshake ৩০-৮০ms, TLS handshake ৮০-১৩০ms, request পাঠানো + server-এর কাজ + প্রথম byte ফেরা ১৩০-২২০ms (এর ভেতরে server-এর অংশ ৪০ms আলাদা রঙে), বাকি data transfer ২২০-২৬০ms। প্রতিটা সীমায় curl-এর নাম: time_namelookup, time_connect, time_appconnect, time_starttransfer, time_total।",
        downloadable: true,
      },
      {
        id: "day-007-before-after",
        caption:
          "একই তিনটা স্বাধীন call: একটার পর একটা চালালে ৪০০ms (যোগফল), একসাথে চালালে ২০০ms (সবচেয়ে ধীরটা)।",
        alt: "উপরে sequential: Profile ৮০ms, Recommendations ২০০ms, Cart ১২০ms একটার পর একটা, মোট ৪০০ms। নিচে parallel: তিনটা bar একসাথে ০ থেকে শুরু, সবচেয়ে লম্বা Recommendations ২০০ms, মোট ২০০ms।",
      },
      {
        id: "day-007-percentiles",
        caption:
          "১,০০০টা request-এর latency (উদাহরণ): বেশিরভাগ ৫০ms-এর নিচে, কিন্তু লম্বা লেজ; গড় (~৫৬ms) কোনো দলকেই ঠিকমতো দেখায় না, p99 (~৫০০ms) দেখায় ধীরতম ১%-এর অবস্থা।",
        alt: "Histogram। X অক্ষে latency-র ভাগ: ০-২৫, ২৫-৫০, ৫০-১০০, ১০০-২৫০, ২৫০-৫০০, ৫০০-১০০০, ১০০০ms-এর বেশি। Request সংখ্যা যথাক্রমে ৩০০, ৫২০, ১০০, ৫০, ২০, ৮, ২। উপরে চিহ্ন: p50 ≈ ৩৫ms, গড় ≈ ৫৬ms, p95 ≈ ১৯০ms, p99 ≈ ৫০০ms।",
      },
    ],
  },

  deepDive: [
    {
      title: "একটা request-এর যাত্রা: cold বনাম warm",
      markdown: `মূল diagram-এর timeline-টা এবার ধাপে ধাপে দেখি। ধরুন user ঢাকায়, server Singapore-এ, RTT ৫০ms, আর এটা এই site-এ user-এর প্রথম request (**cold request**: DNS cache-এ নেই, কোনো connection খোলা নেই)।

| ধাপ | সময় | জমা সময় |
|---|---|---|
| DNS lookup | ৩০ms | ৩০ms |
| TCP handshake (১ RTT) | ৫০ms | ৮০ms |
| TLS 1.3 handshake (১ RTT) | ৫০ms | ১৩০ms |
| Request server-এ পৌঁছানো (½ RTT) | ২৫ms | ১৫৫ms |
| Server-এ লাইনে অপেক্ষা | ১০ms | ১৬৫ms |
| Server-এর কাজ (app + database) | ৩০ms | ১৯৫ms |
| প্রথম byte ফেরা (½ RTT) | ২৫ms | ২২০ms ← **TTFB** |
| বাকি data (৫০০ KB, 100 Mbps-এ) | ৪০ms | ২৬০ms |

**TTFB** (Time To First Byte) মানে request শুরু থেকে প্রথম byte আসা পর্যন্ত। শেষ লাইনের হিসাব: ৫০০ KB = ৪ Mbit, 100 Mbps-এ ৪ ÷ ১০০ = ০.০৪ s = ৪০ms। (বাস্তবে TCP শুরুতে ধীরে গতি বাড়ায়, তাই একটু বেশি লাগে।)

এবার একই user কয়েক সেকেন্ড পরে আরেকটা page খুলল (**warm request**): DNS-এর উত্তর cache-এ, আর connection খোলা আছে (keep-alive, [Day 3](${day(3)}))। তখন প্রথম তিন ধাপ বাদ: ২৬০ − ১৩০ = **১৩০ms**। অর্ধেক সময় শুধু handshake-এ যাচ্ছিল!

এজন্য performance-এর বড় অংশ হলো **round trip-এর সংখ্যা কমানো**: connection reuse, connection pool, কম redirect, কম domain। আর বাকিটা **RTT নিজেই কমানো**: data user-এর কাছে নিয়ে যাওয়া (CDN, [Day 11](${day(11)}))।`,
      diagrams: [
        {
          id: "day-007-journey",
          caption:
            "ধাপে ধাপে: একটা cold request-এর প্রতিটা অংশে কত সময় যায়, আর মোট সময় কিভাবে জমে।",
          alt: "Step-through timeline। প্রতিটা ধাপে একটা নতুন bar যোগ হয়: DNS, TCP, TLS, request যাত্রা, লাইনে অপেক্ষা, server-এর কাজ, প্রথম byte ফেরা, বাকি data; উপরে একটা ঘড়ি জমা সময় দেখায়, ৩০ms থেকে ২৬০ms।",
        },
      ],
    },
    {
      title: "Latency-র সিঁড়ি: কোন কাজে মোটামুটি কত সময়",
      markdown: `Design-এর সিদ্ধান্ত নিতে exact সংখ্যা লাগে না, লাগে **কোনটা কোনটার চেয়ে কত হাজার গুণ ধীর** সেই ধারণা। নিচের সংখ্যাগুলো **আনুমানিক order of magnitude** (দশের ঘাত), hardware আর জায়গা অনুযায়ী বদলায়। (এই ধরনের তালিকা জনপ্রিয় হয়েছিল Jeff Dean আর Peter Norvig-এর "latency numbers every programmer should know" থেকে; সংখ্যাগুলো এখানে মোটা দাগে, আর শেষের দুটো আমাদের নিজের ping থেকে।)

| কাজ | মোটামুটি সময় | ১ns-কে ১ সেকেন্ড ধরলে |
|---|---|---|
| CPU-র L1 cache থেকে পড়া | ~১ns | ১ সেকেন্ড |
| RAM থেকে পড়া | ~১০০ns | ~২ মিনিট |
| SSD থেকে এলোমেলো জায়গায় পড়া | ~১০-১০০µs | কয়েক ঘণ্টা থেকে ~১ দিন |
| একই datacenter-এ round trip | ~০.৫ms (কয়েকশো µs) | ~৬ দিন |
| পুরনো hard disk-এ seek | ~১০ms | ~৪ মাস |
| ঢাকা ↔ Singapore round trip | ~৫০ms | ~১.৬ বছর |
| ঢাকা ↔ আমেরিকার পূর্ব উপকূল round trip | ~২৫০ms | ~৮ বছর |

এই সিঁড়ি থেকে তিনটা শিক্ষা:
1. **Memory থেকে network-এ গেলেই হাজার গুণ লাফ।** একটা network call-এর সময়ে RAM থেকে লাখ লাখ বার পড়া যায়। তাই একটা loop-এর ভেতরে database বা API call (**N+1 query**) সবচেয়ে প্রচলিত ধীরতার কারণ। ১০০টা item-এর জন্য ১০০টা call না, একটা batch call।
2. **দূরত্বের নিচের সীমা আছে।** ঢাকা থেকে Singapore সরলরেখায় ~২,৯০০ km; ২,০০,০০০ km/s গতিতে যাওয়া-আসা কমপক্ষে ~২৯ms। বাস্তবে cable ঘুরে যায় আর পথে router আছে, তাই ~৫০ms। কোনো code optimization এই ২৯ms ভাঙতে পারবে না; একমাত্র উপায় data কাছে আনা।
3. **Cache কেন এত কাজের।** Database (network + disk) থেকে আনার বদলে process-এর memory বা কাছের Redis থেকে আনলে কয়েক ধাপ নিচে নেমে আসেন। Caching নিয়ে [Day 17](${day(17)})-এ।`,
      diagrams: [
        {
          id: "day-007-ladder",
          caption:
            "Latency-র সিঁড়ি (log scale, আনুমানিক): প্রতিটা ধাপ আগেরটার চেয়ে দশ থেকে হাজার গুণ ধীর; memory থেকে network-এ গেলেই বড় লাফ।",
          alt: "অনুভূমিক bar chart, log scale-এ ১ns থেকে ১ সেকেন্ড। উপর থেকে নিচে: L1 cache ~১ns, RAM ~১০০ns, SSD random read ~১০০µs, একই datacenter round trip ~৫০০µs, HDD seek ~১০ms, ঢাকা-Singapore RTT ~৫০ms, ঢাকা-US East RTT ~২৫০ms। প্রতিটার ডানে লেখা ১ns = ১ সেকেন্ড ধরলে কত সময়।",
        },
      ],
    },
    {
      title: "Little's Law: latency, throughput আর concurrency-র সম্পর্ক",
      markdown: `Latency আর throughput আলাদা, কিন্তু একটা সহজ সূত্র এদের বাঁধে:

\`\`\`
L = λ × W
L = system-এর ভেতরে একসাথে কতগুলো কাজ চলছে (concurrency, in-flight)
λ = throughput (প্রতি সেকেন্ডে কতগুলো কাজ ঢোকে = বের হয়)
W = প্রতিটা কাজ system-এর ভেতরে গড়ে কত সময় থাকে (latency)
\`\`\`

এটা **Little's Law** (John Little, ১৯৬১)। শর্ত মাত্র একটা: system স্থিতিশীল, মানে লম্বা সময়ে যত ঢোকে তত বের হয়। Queue-এর ধরন বা request-এর বণ্টন যাই হোক, গড়ের হিসাবে এটা খাটে।

**উদাহরণ ১: কত concurrency লাগবে?** লক্ষ্য ২,০০০ req/s, প্রতিটা request গড়ে ৫০ms নেয়। L = ২,০০০ × ০.০৫ = **১০০**। অর্থাৎ যেকোনো মুহূর্তে গড়ে ১০০টা request চলছে। আপনার server-এ মোট ৪০টা worker thread থাকলে ২,০০০ req/s কখনোই হবে না; সর্বোচ্চ ৪০ ÷ ০.০৫ = ৮০০ req/s।

**উদাহরণ ২: connection pool-এর size।** App সেকেন্ডে ৫০০টা query করে, প্রতিটা query connection ধরে রাখে ২০ms। গড়ে ব্যস্ত connection = ৫০০ × ০.০২ = **১০**। Pool ঠিক ১০ রাখলে সেটা ১০০% ব্যস্ত, মানে লাইন আর বাড়তি latency (Day 5-এর knee)। তাই headroom রেখে ১৫-২০।

**উদাহরণ ৩: ধীর dependency কিভাবে throughput খেয়ে ফেলে।** একটা service-এ ২০০টা thread, প্রতিটা request একটা বাইরের payment API-র জন্য অপেক্ষা করে, মোট ০.৫ s। সর্বোচ্চ throughput = ২০০ ÷ ০.৫ = ৪০০ req/s। একদিন payment API ধীর হয়ে ২ s নিল। এখন সর্বোচ্চ ২০০ ÷ ২ = **১০০ req/s**। আপনার code একটুও বদলায়নি, CPU প্রায় অলস, অথচ throughput চার ভাগের এক ভাগ, কারণ সব thread অপেক্ষায় আটকে। এজন্যই dependency-তে **timeout** রাখা এত জরুরি (Day 59-এ circuit breaker)।

**উদাহরণ ৪: network pipe-ও একটা queue।** একটা link-এ একসাথে কত data "পথে" থাকতে পারে? L = bandwidth × RTT। একে বলে **bandwidth-delay product (BDP)**। 100 Mbps link, RTT ২৫০ms: ১০০ × ০.২৫ = ২৫ Mbit ≈ **৩.১ MB** পথে থাকতে হবে link ভরাতে। TCP একবারে যতটা data ack ছাড়া পাঠাতে পারে (window), সেটা যদি ৬৪ KB হয়, তাহলে throughput ≤ ৬৪ KB ÷ ০.২৫ s = **২৫৬ KB/s ≈ ২ Mbps**, link 100 Mbps হলেও! আধুনিক TCP window scaling দিয়ে window অনেক বড় করতে পারে, কিন্তু মূল কথা থাকে: **দূরের link-এ একটা connection-এর throughput RTT দিয়ে সীমিত**। তাই দূরের server থেকে বড় file নামাতে অনেক tool একাধিক connection খোলে। (TCP-র ভেতরের কথা [Day 39](${day(39)})-এ।)

**লোড বাড়লে কী হয়, Little-এর চোখে।** Server-এর throughput-এর একটা ছাদ আছে (ধরুন ১৮০ req/s)। ছাদে পৌঁছানোর পরও যদি আরও বেশি client একসাথে request পাঠায় (L বাড়ে), λ তো আর বাড়তে পারে না, তাই বাড়ে **W**। এটাই Day 5-এর knee-এর আরেক ব্যাখ্যা: ছাদের পরে বাড়তি load শুধু লাইনে যোগ হয়। Lab-এ নিজের চোখে দেখবেন: concurrency ১৬ থেকে ৬৪ করলে req/s প্রায় একই থাকে, আর latency প্রায় চার গুণ হয়।

একটা সতর্কতা: Little's Law **গড়** নিয়ে কথা বলে। এটা দিয়ে p99 হিসাব করা যায় না।`,
    },
    {
      title: "Tail latency আর fan-out: কেন ১% ধীরতা ৬৩% user-কে ছোঁয়",
      markdown: `বড় system-এ একটা user request প্রায়ই পেছনে অনেকগুলো server-এ ভাগ হয়ে যায় (**fan-out**): একটা search ১০০টা index server-এ যায়, একটা feed ৩০টা service থেকে data আনে। User-এর উত্তর তৈরি হয় তখনই, যখন **সবচেয়ে ধীর** উত্তরটাও আসে।

ধরুন প্রতিটা backend-এর ১% request ধীর (১ সেকেন্ড)। n-টা backend-এ fan-out করলে অন্তত একটা ধীর হওয়ার সম্ভাবনা:

\`\`\`
P(অন্তত একটা ধীর) = 1 − 0.99ⁿ

n = 1    → 1%
n = 10   → 1 − 0.904 ≈ 9.6%
n = 50   → 1 − 0.605 ≈ 39.5%
n = 100  → 1 − 0.366 ≈ 63.4%
\`\`\`

প্রতিটা server-এর জন্য যেটা "বিরল" (p99), ১০০-way fan-out-এ সেটা **প্রায় দুই-তৃতীয়াংশ user-এর সাধারণ অভিজ্ঞতা**। এই হিসাবটা বিখ্যাত হয়েছে Google-এর Jeffrey Dean আর Luiz André Barroso-র প্রবন্ধ **"The Tail at Scale"** (Communications of the ACM, ২০১৩) থেকে।

উল্টো দিক থেকে ভাবুন: ১০০-way fan-out-এ মাত্র ১% user ধীর উত্তর পাক চাইলে প্রতিটা backend-কে ধীর হতে হবে মাত্র ~০.০১% request-এ (1 − (1 − q)¹⁰⁰ = 0.01 থেকে q ≈ 0.0001)। মানে প্রতিটা backend-এর **p99.99** ভালো হতে হবে। Fan-out যত বড়, backend-এর tail তত গুরুত্বপূর্ণ।

**Tail কেন হয়?** একই code, একই hardware, তবুও কিছু request ধীর: garbage collection-এর বিরতি, ব্যাকগ্রাউন্ডের কোনো কাজ (log rotate, compaction), shared CPU বা disk-এ অন্য কারও ভিড়, cache miss, একটা packet হারিয়ে TCP-র retransmit। এগুলো পুরো দূর করা যায় না। তাই "The Tail at Scale"-এর মূল কথা: **tail দূর করার চেষ্টার বদলে tail-সহিষ্ণু system বানাও।**

কয়েকটা হাতিয়ার:
- **Hedged request:** একটা replica-কে request পাঠান। নির্দিষ্ট সময়ের মধ্যে (ধরুন ওই ধরনের request-এর p95) উত্তর না এলে একই request আরেকটা replica-কে পাঠান, যেটা আগে আসে সেটা নিন, অন্যটা বাতিল। মাত্র ~৫% request দুবার যায়, কিন্তু ধীর replica-র ফাঁদ থেকে বাঁচা যায়। প্রবন্ধে একটা Google benchmark-এ (১০০টা Bigtable server-এ ছড়ানো ১,০০০টা key পড়া) ১০ms পরে hedge পাঠিয়ে p99.9 latency প্রায় ১,৮০০ms থেকে ৭৪ms-এ নেমেছিল, বাড়তি request মাত্র ~২%।
- **Tied request:** দুটো server-এর queue-তে একসাথে রাখা হয়, একজন কাজ শুরু করলেই অন্যজনকে বাতিল করতে বলে। দুবার কাজ হওয়ার অপচয় আরও কম।
- **Timeout:** অপেক্ষার একটা সীমা। খুব বড় (বা নেই) হলে thread আটকে throughput পড়ে যায় (আগের অংশের উদাহরণ ৩); খুব ছোট হলে স্বাভাবিক ধীর request-ও fail করে। সাধারণ নিয়ম: dependency-র p99 বা p99.9 দেখে ঠিক করুন, আর পুরো request-এর মোট সময়সীমা (deadline) নিচের call-গুলোতে পাঠান, যাতে উপরের caller হাল ছেড়ে দেওয়ার পরও নিচে কাজ না চলতে থাকে।

সাবধান: hedge আর retry দুটোই load বাড়ায়। শুধু idempotent (দুবার হলেও ক্ষতি নেই) read-এ ব্যবহার করুন, আর সীমা রাখুন; নইলে ধীর system-এ বাড়তি request পাঠিয়ে তাকে আরও ধীর করবেন (Day 57-এ retry, Day 59-এ circuit breaker)।

এখন এটুকু জানলেই চলবে, [Day 95](${day(95)})-এ (Latency Budget ও Tail Latency) গভীরে যাব।`,
      diagrams: [
        {
          id: "day-007-fanout",
          caption:
            "Fan-out যত বড়, অন্তত একটা ধীর উত্তরের সম্ভাবনা তত বেশি: প্রতিটা backend ১% ধীর হলে ১০০-way fan-out-এ ~৬৩%; ০.১% হলে ~১০%।",
          alt: "Line chart। X অক্ষে fan-out সংখ্যা ১ থেকে ১০০, Y অক্ষে অন্তত একটা ধীর হওয়ার সম্ভাবনা ০ থেকে ১০০%। একটা রেখা প্রতি backend ১% ধীর ধরে: n=১০-এ ~১০%, n=৫০-এ ~৪০%, n=১০০-এ ~৬৩%। আরেকটা নিচু রেখা ০.১% ধরে, n=১০০-এ ~১০%।",
        },
      ],
    },
    {
      title:
        "ঠিকভাবে মাপা: কোথায় মাপছেন, কোন সময়ে, আর কেন percentile গড় করা যায় না",
      markdown: `Latency-র সংখ্যা যতটা ঠিক, design-এর সিদ্ধান্তও ততটা ঠিক। চারটা জায়গায় সবচেয়ে বেশি ভুল হয়।

**১. Client-side বনাম server-side।** Server যখন বলে "৩০ms", সে মাপছে request হাতে পাওয়া থেকে response পাঠানো পর্যন্ত। এর বাইরে থাকে: network, DNS/TCP/TLS, load balancer-এ বা OS-এর connection queue-তে অপেক্ষা, আর client-এর নিজের কাজ। তাই তিন স্তরে মাপা ভালো: server-এর ভেতরে (কোন অংশ ধীর), load balancer-এ (server-এর সামনের লাইনসহ), আর আসল user-এর device-এ (**RUM**, real user monitoring)। User-এর অভিজ্ঞতার সবচেয়ে কাছের সংখ্যা শেষেরটা।

**২. Percentile সময়ের জানালায়।** "আজকের p99 = ২০০ms" ভালো শোনায়, কিন্তু হয়তো দুপুর ২টায় ৫ মিনিট p99 ছিল ৪ সেকেন্ড। দিনের সব request একসাথে ধরলে ওই ৫ মিনিট হারিয়ে যায়। তাই dashboard-এ ছোট জানালায় (প্রতি মিনিটে) p99 আঁকা হয়, আর SLO লেখা হয় নির্দিষ্ট জানালায় ("২৮ দিনে ৯৯% request ৩০০ms-এর মধ্যে")।

**৩. Percentile গড় করা যায় না।** দুটো server: A ৯০০টা request সামলায়, p99 = ১০০ms; B ১০০টা, p99 = ২ s। দুটোর গড় (১,০৫০ms) বা অন্য কোনো সহজ হিসাব থেকে মোট ১,০০০টা request-এর আসল p99 পাওয়া যায় না; সেটা নির্ভর করে পুরো বণ্টনের উপর। একই কারণে প্রতি ঘণ্টার p99-গুলোর গড় নিয়ে দিনের p99 হয় না। সঠিক উপায়: প্রতিটা জায়গায় **histogram** রাখুন (কোন latency-র ঘরে কয়টা request), histogram-গুলো যোগ করুন, তারপর যোগফল থেকে percentile বের করুন। Prometheus-এর histogram ঠিক এভাবে কাজ করে, আর HdrHistogram-এর মতো library এই কাজের জন্যই।

**৪. Coordinated omission (load test-এর ফাঁদ)।** বেশিরভাগ সহজ load tool (যেমন lab-এর \`hey -c 16\`) "closed loop": ১৬টা কাল্পনিক user, প্রত্যেকে আগের উত্তর পেলে তবেই পরের request পাঠায়। এখন server ২ সেকেন্ড আটকে গেল। বাস্তবে ওই ২ সেকেন্ডে নতুন user-রা আসতেই থাকত, আর সবাই ধীর উত্তর পেত। কিন্তু tool তখন নতুন request পাঠানো থামিয়ে অপেক্ষা করছে, তাই ধীর sample মাত্র ১৬টা রেকর্ড হয়। ফল: p99 বাস্তবের চেয়ে অনেক ভালো দেখায়। Gil Tene এই সমস্যার নাম দিয়েছেন coordinated omission। সমাধান: **নির্দিষ্ট হারে** request পাঠানো (open loop), যেমন wrk2-এর \`-R\` বা k6-এর constant-arrival-rate, যাতে server ধীর হলেও নতুন request আসতে থাকে।

এই কারণে load test-এর রিপোর্টে সবসময় লিখুন: কোন হারে, কতক্ষণ, কোথা থেকে মাপা, আর কোন percentile। মাপার বিস্তারিত (metrics, tracing) [Day 89](${day(89)})-এ, SLO [Day 90](${day(90)})-এ।`,
    },
    {
      title:
        "Latency budget: sequential যোগ, parallel সর্বোচ্চ, আর head-of-line blocking",
      markdown: `একটা page বা API-র জন্য লক্ষ্য ঠিক করা হয়, ধরুন **p95 ≤ ৩০০ms**। এই সময়টা একটা বাজেট, যেটা ভেতরের প্রতিটা ধাপের মধ্যে ভাগ করে দিতে হয়।

ধরুন product page-এর server-side কাজ:
- Gateway আর auth: ১০ + ২০ = ৩০ms (একটার পর একটা, কারণ auth ছাড়া এগোনো যাবে না)
- তারপর তিনটা স্বাধীন call: product details ৫০ms, recommendation ১২০ms, stock ৬০ms
- শেষে HTML/JSON বানানো: ৩০ms

**Sequential হলে:** ৩০ + ৫০ + ১২০ + ৬০ + ৩০ = **২৯০ms**, বাজেটের একদম কিনারায়।
**তিনটা call parallel হলে:** ৩০ + max(৫০, ১২০, ৬০) + ৩০ = **১৮০ms**।

নিয়ম: **নির্ভরশীল ধাপ যোগ হয়, স্বাধীন ধাপের ক্ষেত্রে সবচেয়ে ধীরটা গোনে।** সবচেয়ে লম্বা নির্ভরশীল পথটাকে বলে **critical path**; latency কমাতে হলে সেই পথের কোনো ধাপ ছোট করতে হবে। এখানে recommendation (১২০ms) ছোট না করলে বাকি দুটো যতই দ্রুত হোক, page দ্রুত হবে না।

দুটো সূক্ষ্ম বিষয়:
1. **Parallel-এর tail।** তিনটা call-এর প্রত্যেকটা ৯৫% সময় নিজের p95-এর মধ্যে থাকলেও, তিনটাই একসাথে থাকার সম্ভাবনা 0.95³ ≈ ৮৬%। অর্থাৎ parallel করলে গড় সময় কমে, কিন্তু "কেউ একজন ধীর" হওয়ার সম্ভাবনা বাড়ে, আগের অংশের fan-out-এর ছোট সংস্করণ।
2. **বাজেটে network-ও রাখুন।** ঢাকার user, Singapore-এর server: ৩০০ms-এর মধ্যে warm request-এও অন্তত ১ RTT (~৫০ms) network-এ যাবে, cold হলে আরও ২-৩ RTT।

**Head-of-line (HOL) blocking।** একটা লাইনের সামনেরটা আটকে গেলে পেছনের সবাই আটকে যায়, পেছনেরগুলো নিজেরা যত দ্রুতই হোক। কয়েকটা চেনা জায়গা:
- **HTTP/1.1:** একটা connection-এ একসময়ে একটাই request-response চলে। সামনের response ধীর হলে পেছনেরগুলো অপেক্ষায়। Browser তাই প্রতি host-এ কয়েকটা connection খোলে।
- **HTTP/2:** এক connection-এ অনেক request একসাথে চলে (multiplexing), তাই HTTP-স্তরের HOL দূর হয়। কিন্তু নিচে একটাই TCP stream: একটা packet হারালে TCP ক্রম রাখতে পেছনের সব data আটকে রাখে, সব request-ই থামে।
- **HTTP/3 (QUIC):** UDP-র উপর প্রতিটা stream আলাদা, তাই একটা stream-এর হারানো packet অন্যদের আটকায় না। বিস্তারিত [Day 42](${day(42)})-এ।
- **Application-এর queue-তে:** একজন worker-এর FIFO queue-তে একটা ৫ সেকেন্ডের কাজ থাকলে পেছনের ১০ms-এর কাজগুলোও ৫ সেকেন্ড অপেক্ষা করে। সমাধান: ধীর আর দ্রুত কাজের আলাদা queue বা worker pool।`,
    },
  ],

  tradeOffs: {
    markdown: `**কখন latency-কে অগ্রাধিকার দেবেন:** User বা অন্য service অপেক্ষা করছে: page load, search, checkout, login, payment authorize, game বা video call। এখানে লক্ষ্য লেখা হয় percentile-এ (যেমন p99 ≤ ২০০ms)।

**কখন throughput-কে অগ্রাধিকার দেবেন:** কেউ সরাসরি অপেক্ষা করছে না, মোট কাজ শেষ হওয়াই আসল: রাতের report, data pipeline/ETL, video encode, log ingest, backup, email campaign। এখানে batching আর বড় buffer বন্ধু, প্রতিটা item-এর দেরি সমস্যা না।

বেশিরভাগ কৌশল একটা বাড়ায় তো অন্যটার দাম নেয়। এক নজরে:`,
    table: {
      headers: [
        "কৌশল",
        "Latency-তে প্রভাব",
        "Throughput-এ প্রভাব",
        "কখন ভালো / দাম কী",
      ],
      rows: [
        [
          "Batching (একসাথে অনেকগুলো পাঠানো/লেখা)",
          "প্রতিটা item-এর বাড়ে (batch ভরার অপেক্ষা)",
          "বাড়ে (প্রতি item-এ overhead কমে)",
          "Log, event, bulk insert; batch-এর সর্বোচ্চ অপেক্ষার সময় বেঁধে দিন",
        ],
        [
          "Buffer / Queue (Day 12)",
          "User-এর দেখা latency কমে; কাজ শেষ হতে দেরি বাড়তে পারে",
          "Spike শোষণ করে, worker বাড়িয়ে বাড়ানো যায়",
          "কাজ পরে হলেও চলে এমন জায়গায়; backlog monitor করুন",
        ],
        [
          "Compression (gzip, brotli)",
          "CPU-র সময় যোগ হয়; ধীর link-এ transfer কমায়",
          "একই bandwidth-এ বেশি data",
          "বড় text/JSON, ধীর বা দামি network; খুব ছোট response-এ লাভ কম",
        ],
        [
          "বেশি worker / server (parallelism)",
          "একটা request-এর latency প্রায় একই",
          "বাড়ে",
          "Load বেশি হলে; একটা request-কে দ্রুত করে না",
        ],
        [
          "একটা request-এর ভেতরে parallel call",
          "কমে (যোগফলের বদলে সর্বোচ্চ)",
          "প্রায় একই; backend-এ একসাথে বেশি চাপ",
          "স্বাধীন call-এ; fan-out বড় হলে tail বাড়ে",
        ],
        [
          "Cache, CDN, edge (Day 11, 17)",
          "অনেক কমে (কাছে, কম কাজ)",
          "বাড়ে (backend-এ কম load)",
          "বারবার পড়া data; দাম হলো পুরনো data (staleness)",
        ],
        [
          "Connection reuse / keep-alive",
          "কমে (handshake বাদ)",
          "বাড়ে",
          "প্রায় সবসময়; pool size Little's Law দিয়ে হিসাব করুন",
        ],
        [
          "Hedged request",
          "Tail (p99, p99.9) কমে",
          "Backend-এ কয়েক % বাড়তি load",
          "Idempotent read, replica আছে এমন জায়গায়",
        ],
        [
          "Server ১০০% utilization-এর কাছে চালানো",
          "অনেক বাড়ে (লাইন)",
          "সর্বোচ্চ",
          "শুধু batch কাজে; user-facing-এ headroom রাখুন (Day 5)",
        ],
      ],
    },
  },

  industry: {
    markdown: `- **Google, "The Tail at Scale":** Jeffrey Dean ও Luiz André Barroso-র এই প্রবন্ধ (Communications of the ACM, Feb 2013) fan-out-এ tail latency কিভাবে বড় হয় (প্রতিটা server-এর ১% ধীরতা, ১০০-way fan-out-এ ~৬৩% request ধীর) আর hedged request, tied request-এর মতো কৌশল দিয়ে কিভাবে সামলানো যায়, সেটা দেখিয়েছে। "Tail-tolerant" system-এর ধারণা এখান থেকেই ছড়িয়েছে।
- **Amazon, Dynamo paper:** DeCandia ও অন্যান্যদের "Dynamo: Amazon's Highly Available Key-value Store" (SOSP 2007) জানায়, Amazon-এর ভেতরের service-গুলোর SLA গড় বা median-এ না, **99.9th percentile**-এ মাপা হতো, যাতে প্রায় সব customer ভালো অভিজ্ঞতা পায়।
- **Google SRE book:** "Site Reliability Engineering" বইয়ের Service Level Objectives অধ্যায় latency-র SLI percentile দিয়ে মাপার কথা বলে, কারণ গড় tail-এর খারাপ অভিজ্ঞতা লুকিয়ে ফেলে।
- **Prometheus:** Latency সাধারণত **histogram** metric হিসেবে রাখা হয়, আর \`histogram_quantile()\` দিয়ে percentile বের করা হয়। Prometheus-এর documentation স্পষ্ট বলে, client-side summary-র quantile আলাদা instance থেকে যোগ বা গড় করে অর্থপূর্ণ ফল পাওয়া যায় না, histogram-এর bucket যোগ করা যায়।
- **Load testing tool:** \`hey\`, \`wrk\`, \`ab\` সহজ closed-loop tool। Gil Tene-র **wrk2** নির্দিষ্ট হারে request পাঠায় আর **HdrHistogram** দিয়ে coordinated omission ঠিক করে latency রেকর্ড করে; **k6**-এ constant-arrival-rate executor আছে।
- **Linux \`tc netem\`:** Network-এ কৃত্রিম delay, loss আর jitter যোগ করার kernel-এর নিজস্ব tool। দূরের user-এর অভিজ্ঞতা নিজের machine-এ পরীক্ষা করতে বহুল ব্যবহৃত (lab-এ ব্যবহার করবেন)।
- **CDN আর edge:** Cloudflare, Akamai, Amazon CloudFront-এর মতো CDN-গুলো content user-এর কাছের শহরে রেখে propagation latency কমায় (Day 11)।

*উৎস: J. Dean & L. A. Barroso, "The Tail at Scale", Communications of the ACM 56(2), 2013; G. DeCandia et al., "Dynamo: Amazon's Highly Available Key-value Store", SOSP 2007; Beyer et al. (eds.), "Site Reliability Engineering", O'Reilly 2016, অধ্যায় "Service Level Objectives"; Prometheus documentation, "Histograms and summaries"; wrk2 ও HdrHistogram-এর README (Gil Tene); Linux tc-netem(8) man page; J. D. C. Little, "A Proof for the Queuing Formula: L = λW", Operations Research, 1961।*`,
  },

  mistakes: [
    {
      mistake:
        "Latency-র রিপোর্ট আর alert গড় দিয়ে করা। গড় ৫০ms দেখে সব ঠিক ভাবা, অথচ ১% user ৫ সেকেন্ড অপেক্ষা করছে।",
      fix: "p50, p95, p99 (দরকারে p99.9) দেখুন, histogram রাখুন, আর alert দিন percentile-এ।",
    },
    {
      mistake:
        "Server-এর log-এর সময়কে user-এর অভিজ্ঞতা ধরে নেওয়া। Network, handshake, load balancer-এর queue বাদ পড়ে যায়।",
      fix: "Load balancer আর client-এর দিক থেকেও মাপুন (RUM), আর timeline ভাগ করে দেখুন কোথায় সময় যায়।",
    },
    {
      mistake:
        "কয়েকটা server-এর p99 গড় করে মোট p99 বলা, বা প্রতি ঘণ্টার p99-এর গড়কে দিনের p99 বলা।",
      fix: "Histogram যোগ করুন, তারপর যোগফল থেকে percentile বের করুন।",
    },
    {
      mistake:
        "ধীর API-র সমাধান হিসেবে bandwidth বাড়ানো। ছোট response-এ সময় যায় round trip-এ, bandwidth-এ না।",
      fix: "আগে মাপুন latency কোথায় যাচ্ছে; round trip কমান (connection reuse, batch endpoint), আর data কাছে আনুন (CDN, কাছের region)।",
    },
    {
      mistake:
        "পরস্পর-স্বাধীন call একটার পর একটা await করা, বা loop-এর ভেতরে প্রতিটা item-এর জন্য আলাদা database/API call (N+1)।",
      fix: "স্বাধীন call parallel-এ চালান (যেমন Promise.all), আর অনেক item একটা batch call-এ আনুন।",
    },
    {
      mistake:
        "Dependency-তে timeout না রাখা বা library-র default (৩০ s, এমনকি অসীম) রেখে দেওয়া, আর সীমাহীন retry।",
      fix: "Dependency-র p99/p99.9 দেখে timeout ঠিক করুন, পুরো request-এর deadline নিচে পাঠান, retry সীমিত রাখুন backoff সহ।",
    },
    {
      mistake:
        "Closed-loop tool দিয়ে load test করে তার p99-কে সত্য ধরা (coordinated omission), বা শুধু কম load-এ test করা।",
      fix: "নির্দিষ্ট arrival rate-এ (wrk2, k6 constant-arrival-rate) test করুন, আর capacity-র কাছাকাছি load পর্যন্ত মাপুন।",
    },
  ],

  lab: [
    {
      title: "পরীক্ষা ১: একটা HTTPS request-এর সময় ভাগ করুন (cold বনাম warm)",
      markdown: `[Day 2](${day(2)})-এ \`curl -w\` একবার চালিয়েছিলেন। এবার একই site-এ পরপর তিনবার চালিয়ে cold আর warm request-এর পার্থক্য দেখুন:

\`\`\`bash
for i in 1 2 3; do
  curl -s -o /dev/null -w "dns=%{time_namelookup} tcp=%{time_connect} tls=%{time_appconnect} ttfb=%{time_starttransfer} total=%{time_total}\\n" https://www.wikipedia.org
done
\`\`\`

সব সংখ্যা শুরু থেকে **জমা সময়**, সেকেন্ডে। আমাদের machine-এ (ঢাকা থেকে) এসেছিল:

\`\`\`
dns=0.123984 tcp=0.176019 tls=0.248059 ttfb=0.319318 total=0.456638
dns=0.002401 tcp=0.055004 tls=0.110835 ttfb=0.182123 total=0.318026
dns=0.002172 tcp=0.055210 tls=0.119499 ttfb=0.191617 total=0.331527
\`\`\`

পড়ার নিয়ম (প্রথম লাইন দিয়ে):
- **DNS** = ১২৪ms। দ্বিতীয়বার থেকে মাত্র ~২ms, কারণ উত্তর এখন OS-এর cache-এ।
- **TCP handshake** = tcp − dns = ১৭৬ − ১২৪ = ~৫২ms, মানে প্রায় এক RTT। এখান থেকেই বোঝা যায় server কত দূরে।
- **TLS handshake** = tls − tcp = ~৭২ms।
- **Server-এর অপেক্ষা + এক RTT** = ttfb − tls = ~৭১ms।
- **Body নামানো** = total − ttfb।

লক্ষ্য করুন: প্রতিবার curl নতুন process, তাই TCP আর TLS প্রতিবার আবার হয়; শুধু DNS cache থেকে আসে। Browser-এ keep-alive থাকায় দ্বিতীয় page-এ TCP/TLS-ও লাগত না। আপনার সংখ্যা জায়গা আর সময় অনুযায়ী আলাদা হবে।`,
    },
    {
      title: "পরীক্ষা ২: ২০টা request, তারপর p50 আর p95 নিজে বের করুন",
      markdown: `একটা মাপ দিয়ে কিছু বোঝা যায় না। ২০ বার মেপে ছোট থেকে বড় সাজান:

\`\`\`bash
for i in $(seq 1 20); do
  curl -s -o /dev/null -w "%{time_total}\\n" https://www.wikipedia.org
done | sort -n | awk '{print NR": "$0}'
\`\`\`

**Nearest-rank** নিয়মে p-তম percentile হলো সাজানো তালিকার ⌈p/100 × n⌉-তম মান। n = ২০ হলে:
- **p50** = ⌈০.৫ × ২০⌉ = ১০ নম্বর লাইন
- **p95** = ⌈০.৯৫ × ২০⌉ = ১৯ নম্বর লাইন

আমাদের একটা run-এ ১০ নম্বর ছিল ০.৩০১ s, ১৯ নম্বর ০.৩৩০ s, আর ২০ নম্বর (সবচেয়ে ধীর) ০.৪৪৯ s। আরও মজার: প্রথম ৮টা ~০.১৬-০.১৯ s, পরেরগুলো ~০.৩০-০.৩৩ s, মানে দুটো আলাদা দল (হয়তো আলাদা server বা path)। গড় (~০.২৬ s) এই দুই দলের কোনোটাকেই ঠিকমতো দেখায় না।

২০টা sample-এ p99 বের করা অর্থহীন (⌈০.৯৯ × ২০⌉ = ২০, মানে শুধু সবচেয়ে ধীরটা)। ভালো p99-এর জন্য কয়েক হাজার sample লাগে।`,
    },
    {
      title: "পরীক্ষা ৩: দূরত্বের দাম, ping দিয়ে",
      markdown: `দুটো AWS region-এর S3 endpoint-কে ping করুন, একটা Singapore-এ, একটা আমেরিকার পূর্ব উপকূলে (Virginia):

\`\`\`bash
ping -c 5 s3.ap-southeast-1.amazonaws.com
ping -c 5 s3.us-east-1.amazonaws.com
\`\`\`

(Windows-এ \`-c\`-এর বদলে \`-n\`।) শেষ লাইনের \`avg\` দেখুন। ঢাকা থেকে আমরা পেয়েছি Singapore **~৫১ms**, Virginia **~২৪৩ms**।

এবার পদার্থবিজ্ঞানের নিচের সীমার সাথে মেলান (fiber-এ ~২,০০,০০০ km/s, মানে প্রতি ১,০০০ km-এ এক দিকে ৫ms):
- ঢাকা → Singapore ~২,৯০০ km: RTT কমপক্ষে ২ × ২,৯০০ ÷ ২,০০,০০০ s ≈ **২৯ms**। মাপা ৫১ms।
- ঢাকা → Virginia ~১২,৫০০ km: RTT কমপক্ষে ≈ **১২৫ms**। মাপা ~২৪৩ms।

মাপা সংখ্যা সবসময় বেশি, কারণ cable সরলরেখায় যায় না আর পথে অনেক router। কিন্তু অনুপাতটা দেখুন: Virginia প্রায় ৫ গুণ দূরের সমান দেরি। টিকিটঘরের server Singapore-এ সরালেই প্রতিটা round trip-এ ~১৯০ms বাঁচত।

আপনি বাংলাদেশের বাইরে থাকলে নিজের শহর থেকে দূরত্ব বের করে একই হিসাব করুন।`,
    },
    {
      title: "প্রস্তুতি: ইচ্ছা করে সীমিত একটা server",
      markdown: `এবার নিজের একটা server বানাই, যার ক্ষমতা আমরা জানি: **একসাথে মাত্র ৪টা request-এর কাজ** চলতে পারে, প্রতিটায় **২০ms**। তাহলে তাত্ত্বিক ছাদ ৪ ÷ ০.০২ = ২০০ req/s।

একটা ফাঁকা folder-এ \`app.py\`:

\`\`\`python
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

WORKERS = 4          # একসাথে মাত্র ৪টা request-এর কাজ চলতে পারে
SERVICE_TIME = 0.020  # প্রতিটা request-এর আসল কাজ: ২০ms

slots = threading.Semaphore(WORKERS)


class Handler(BaseHTTPRequestHandler):
    protocol_version = "HTTP/1.1"  # keep-alive, যাতে প্রতি request-এ নতুন TCP না লাগে
    disable_nagle_algorithm = True  # ছোট response আটকে না রেখে সাথে সাথে পাঠাও

    def do_GET(self):
        with slots:  # ৪টা slot ভর্তি থাকলে এখানে লাইনে দাঁড়াতে হয় (queuing)
            time.sleep(SERVICE_TIME)
        body = b"ok\\n"
        self.send_response(200)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass


class Server(ThreadingHTTPServer):
    request_queue_size = 512


print("app listening on :8000", flush=True)
Server(("0.0.0.0", 8000), Handler).serve_forever()
\`\`\`

একটা Docker network বানিয়ে server চালান। \`--cap-add NET_ADMIN\` দেওয়া হলো যাতে পরে container-এর network-এ কৃত্রিম delay যোগ করা যায়:

\`\`\`bash
docker network create sdlab-day007-net
docker run -d --name sdlab-day007-app --network sdlab-day007-net --cap-add NET_ADMIN \\
  -v "$PWD/app.py:/app.py:ro" python:3.12-alpine python /app.py
docker logs sdlab-day007-app
\`\`\`

\`app listening on :8000\` দেখলে তৈরি।

**একটা ছোট গল্প:** প্রথমে আমরা \`disable_nagle_algorithm\` লাইনটা ছাড়া চালিয়েছিলাম। তখন একটা একা request-ও ~৭৩ms নিচ্ছিল, ২০ms-এর বদলে! কারণ Python header আর body আলাদা দুটো ছোট টুকরোয় পাঠায়, আর TCP-র **Nagle's algorithm** (ছোট packet জমিয়ে একসাথে পাঠানো, throughput-এর জন্য ভালো) client-এর **delayed ACK**-এর সাথে মিলে দ্বিতীয় টুকরোটা কয়েক দশক ms আটকে রাখছিল। Batching-এর latency-দাম, একদম হাতেনাতে। চাইলে লাইনটা মুছে পরের পরীক্ষা চালিয়ে দেখুন।`,
    },
    {
      title:
        "পরীক্ষা ৪: concurrency বাড়ান, throughput-এর ছাদ আর latency-র লাফ দেখুন",
      markdown: `**hey** দিয়ে ১০ সেকেন্ড করে load দিন, একসাথে ১, ৪, ১৬ আর ৬৪টা client:

\`\`\`bash
for c in 1 4 16 64; do
  echo "== concurrency $c"
  docker run --rm --platform linux/amd64 --network sdlab-day007-net \\
    williamyeh/hey -z 10s -c $c http://sdlab-day007-app:8000/ \\
    | grep -E "Requests/sec|Average|50%|95%|99%"
done
\`\`\`

(\`williamyeh/hey\` image শুধু amd64-এর, তাই \`--platform linux/amd64\`; Apple Silicon-এ emulation-এ চলে।) hey-এর পুরো output-এ একটা latency **histogram** আর **Latency distribution** (10% থেকে 99%) থাকে; একবার \`grep\` ছাড়া চালিয়ে দেখে নিন।

আমাদের machine-এ এসেছিল:

| Concurrency | Requests/sec | p50 | p95 | p99 |
|---|---|---|---|---|
| ১ | ~৪০ | ~২৫ms | ~৩০ms | ~৫২ms |
| ৪ | ~১৬৬ | ~২৪ms | ~২৭ms | ~৩১ms |
| ১৬ | ~১৭৬ | ~৮৯ms | ~১৫৩ms | ~১৬৬ms |
| ৬৪ | ~১৭৭ | ~৩৫৭ms | ~৬৯০ms | ~৭১০ms |

কী দেখলেন:
- **১ → ৪:** throughput ~৪ গুণ, latency প্রায় একই। ফাঁকা slot ছিল, তাই বাড়তি client সরাসরি কাজ পেল।
- **৪ → ১৬ → ৬৪:** throughput **আটকে গেছে** ~১৭৫-এর আশেপাশে (তাত্ত্বিক ২০০-এর চেয়ে একটু কম, Python আর network-এর overhead), কিন্তু latency প্রায় **১৫ গুণ**। বাড়তি client শুধু লাইনে দাঁড়াচ্ছে।
- **Little's Law মিলিয়ে নিন:** concurrency ১৬-এ গড় latency ছিল ০.০৯০ s। L = λ × W = ১৭৬ × ০.০৯০ ≈ **১৫.৯**, প্রায় ঠিক ১৬। ৬৪-এ: ১৭৭ × ০.৩৫৫ ≈ ৬৩। সূত্রটা সত্যিই খাটে।

এখানে throughput বাড়ানোর একমাত্র উপায় ছাদ উঁচু করা (\`WORKERS\` বাড়ানো বা আরেকটা server, [Day 5](${day(5)})); client বাড়ালে শুধু latency বাড়ে।`,
    },
    {
      title: "পরীক্ষা ৫: network-এ ৫০ms delay যোগ করুন (tc netem)",
      markdown: `এবার ধরি server অনেক দূরে। Container-এ \`tc\` install করে প্রতিটা বের হওয়া packet-এ ৫০ms delay দিন:

\`\`\`bash
docker exec sdlab-day007-app apk add --no-cache iproute2-tc
docker exec sdlab-day007-app tc qdisc add dev eth0 root netem delay 50ms
\`\`\`

একটা request-এর timeline দেখুন, একই network-এর ভেতর থেকে:

\`\`\`bash
docker run --rm --network sdlab-day007-net --entrypoint sh curlimages/curl:8.11.1 -c \\
  'for i in 1 2 3; do curl -s -o /dev/null -w "tcp=%{time_connect} ttfb=%{time_starttransfer}\\n" http://sdlab-day007-app:8000/; done'
\`\`\`

আমরা পেয়েছি \`tcp≈0.052 ttfb≈0.127\` (প্রথম লাইন একটু বেশি আসতে পারে)। TCP handshake-এ ~৫০ms (server-এর SYN-ACK দেরিতে ফেরে), তারপর ২০ms কাজ + আরও ৫০ms উত্তর ফেরা। আগে পুরোটা ছিল ~২২ms।

এবার আগের মতো load দিন, concurrency ৪ আর ১৬:

\`\`\`bash
for c in 4 16; do
  echo "== concurrency $c"
  docker run --rm --platform linux/amd64 --network sdlab-day007-net \\
    williamyeh/hey -z 10s -c $c http://sdlab-day007-app:8000/ \\
    | grep -E "Requests/sec|Average|50%|99%"
done
\`\`\`

আমাদের ফল: concurrency ৪-এ **~৪৯ req/s** (আগে ছিল ~১৬৬), গড় ~৮১ms; concurrency ১৬-এ আবার **~১৭৬ req/s**, গড় ~৯০ms।

Little's Law দিয়ে ব্যাখ্যা: latency (W) বাড়ল, তাই একই L (৪)-এ λ কমে গেল (৪ ÷ ০.০৮১ ≈ ৪৯)। বেশি concurrency (১৬) দিলে throughput ফিরে আসে, কিন্তু latency-র মেঝে (~৭০ms+) আর নামে না। **দূরত্ব latency বাড়ায়; বেশি জিনিস একসাথে পথে রেখে throughput ফিরিয়ে আনা যায়, latency না।** এটাই bandwidth-delay product-এর মূল কথা।

Delay সরাতে:

\`\`\`bash
docker exec sdlab-day007-app tc qdisc del dev eth0 root
\`\`\``,
    },
    {
      title: "পরিষ্কার করুন",
      markdown: `\`\`\`bash
docker rm -f sdlab-day007-app
docker network rm sdlab-day007-net
\`\`\`

Image-গুলোও মুছতে চাইলে:

\`\`\`bash
docker rmi williamyeh/hey python:3.12-alpine curlimages/curl:8.11.1
\`\`\`

চাইলে আরও খেলুন: \`WORKERS = 8\` করে পরীক্ষা ৪ আবার চালান। ছাদ কত হওয়া উচিত (৮ ÷ ০.০২), আর concurrency ১৬-এ latency কত হবে (Little দিয়ে), আগে হিসাব করে তারপর মিলিয়ে দেখুন।`,
    },
  ],

  connections: {
    markdown: `- **[Day 1](${day(1)}) · System Design কী:** সেখানে বলেছিলাম latency আর throughput আলাদা; আজ দেখলাম কতটা আলাদা, আর কিভাবে মাপতে হয়।
- **[Day 2](${day(2)}) · Client, Server ও Internet:** Latency-র চার উৎস (propagation, transmission, queuing, processing) আর fiber-এ আলোর গতির হিসাব সেখান থেকে। আজ সেগুলো দিয়ে একটা পুরো request-এর timeline বানালাম।
- **[Day 3](${day(3)}) · DNS, HTTP ও URL:** DNS, TCP আর TLS handshake-এর round trip, আর keep-alive। আজ দেখলাম cold request-এর প্রায় অর্ধেক সময় এখানেই যায়।
- **[Day 5](${day(5)}) · Scalability:** Load test-এর knee আর headroom। আজ Little's Law দিয়ে দেখলাম ছাদের পরে বাড়তি load কেন শুধু latency বাড়ায়।
- **[Day 6](${day(6)}) · Availability:** খুব ধীর service user-এর কাছে প্রায় বন্ধ service-এর মতোই, আর timeout ছাড়া একটা ধীর dependency পুরো system-এর thread আটকে দিতে পারে।

সামনে যা আসছে: [Day 9](${day(9)})-এ Load Balancer (কোন server-এ পাঠালে latency কম), [Day 11](${day(11)})-এ CDN (data user-এর কাছে), [Day 12](${day(12)})-এ Message Queue (ধীর কাজ request-এর বাইরে), [Day 17](${day(17)})-এ Caching, [Day 19](${day(19)})-এ Capacity Estimation, [Day 39](${day(39)})-এ TCP vs UDP, [Day 42](${day(42)})-এ HTTP/1.1 vs HTTP/2 vs HTTP/3 (head-of-line blocking গভীরে), [Day 58](${day(58)})-এ Backpressure ও Batching, [Day 90](${day(90)})-এ SLI/SLO, আর [Day 95](${day(95)})-এ Latency Budget ও Tail Latency। Tail latency নিয়ে এখন এটুকু জানলেই চলবে, Day 95-এ গভীরে যাব।`,
  },

  explainYourself: [
    {
      question:
        'আপনার manager বলছেন, "app ধীর, চলো server-এর bandwidth দ্বিগুণ করি।" আপনি কী প্রশ্ন করবেন, আর কখন এটা কাজে দেবে না?',
      idealAnswer:
        "প্রথমে জানতে চাইব সময়টা আসলে কোথায় যাচ্ছে: response কত বড়, আর একটা page-এ কয়টা round trip। ছোট JSON response-এ transmission time (size ÷ bandwidth) খুবই কম, সময় যায় propagation, handshake আর sequential call-এ; সেখানে bandwidth দ্বিগুণ করলে প্রায় কিছুই বদলাবে না। Bandwidth তখনই সাহায্য করে যখন বড় file (ছবি, video, বড় download) পাঠাতে গিয়ে link ভরে যাচ্ছে। ছোট request-এ উপায় হলো round trip কমানো, call parallel করা, connection reuse আর server বা CDN user-এর কাছে আনা।",
    },
    {
      question:
        "একটা service-এর গড় latency ৪০ms, p99 ১.২ s। এই দুটো সংখ্যা থেকে কী বোঝেন, আর কোনটা নিয়ে আগে কাজ করবেন?",
      idealAnswer:
        "বেশিরভাগ request দ্রুত, কিন্তু প্রতি ১০০টায় একটা ১.২ সেকেন্ডের বেশি নেয়, মানে একটা লম্বা লেজ আছে যেটা গড় লুকিয়ে রাখছে। একজন user অনেকগুলো request করে, আর এই service যদি অন্য service-এর fan-out-এর অংশ হয়, তাহলে ১% ধীরতা অনেক বেশি user-কে ছোঁয়। তাই আগে tail নিয়ে কাজ করব: ধীর request-গুলোর মধ্যে মিল খুঁজব (GC pause, নির্দিষ্ট query, কোনো একটা ধীর replica, cold cache), আর দরকারে timeout ও hedged request-এর কথা ভাবব।",
    },
    {
      question:
        "Little's Law দিয়ে বোঝান: একটা service-এর ১০০টা thread, প্রতিটা request ২০০ms। বাইরের একটা API হঠাৎ ধীর হয়ে request ১ s নিলে কী হবে?",
      idealAnswer:
        "Throughput-এর ছাদ = thread ÷ latency। আগে ১০০ ÷ ০.২ = ৫০০ req/s। এখন ১০০ ÷ ১ = ১০০ req/s, মানে পাঁচ ভাগের এক ভাগ, যদিও CPU প্রায় অলস। আগের মতো ৩০০ req/s আসতে থাকলে বাকি request লাইনে জমবে, latency আরও বাড়বে, শেষে timeout আর error। সমাধান হলো বাইরের call-এ কড়া timeout, circuit breaker, আর ওই dependency-র জন্য আলাদা সীমিত thread pool (bulkhead), যাতে একটা ধীর dependency পুরো service আটকাতে না পারে।",
    },
  ],

  interviewQuestions: [
    {
      question:
        "Latency, throughput আর bandwidth-এর পার্থক্য কী? একটা উদাহরণ দিন যেখানে একটা ভালো কিন্তু অন্যটা খারাপ।",
      answerOutline: `- Latency: একটা কাজের শুরু থেকে শেষ (ms); throughput: প্রতি সেকেন্ডে কত কাজ (req/s, MB/s); bandwidth: link-এর সর্বোচ্চ ক্ষমতা
- Throughput ≤ bandwidth; latency মূলত দূরত্ব, round trip আর queue-এর উপর নির্ভর
- উদাহরণ: কুরিয়ারে hard drive (latency দিন, throughput বিশাল); batch job বনাম interactive API
- Little's Law দিয়ে সম্পর্ক: concurrency = throughput × latency
- কোনটা optimize করবেন use case-এর উপর নির্ভর করে: user-facing → latency (percentile), batch → throughput`,
    },
    {
      question:
        "Latency মাপতে গড় কেন যথেষ্ট না? p99 কিভাবে বের করবেন আর কিভাবে aggregate করবেন?",
      answerOutline: `- Latency-র বণ্টন লম্বা লেজওয়ালা; গড় outlier-এ টানে কিন্তু tail লুকায়
- p50 = সাধারণ অভিজ্ঞতা, p95/p99/p99.9 = ধীরতম অংশ; user অনেক request করে বলে tail অনেককে ছোঁয়
- Histogram রাখা, ছোট time window-এ percentile; percentile গড় করা যায় না, histogram যোগ করতে হয় (Prometheus histogram_quantile)
- কোথায় মাপছি: server, load balancer, client (RUM)
- Load test-এ coordinated omission; constant arrival rate (wrk2, k6)`,
    },
    {
      question:
        "একটা request ১০০টা backend-এ fan-out করে। প্রতিটা backend-এর p99 ভালো, তবুও user-রা ধীরতা দেখছে। কেন, আর কী করবেন?",
      answerOutline: `- 1 − 0.99¹⁰⁰ ≈ 63%: প্রায় সব user request-এ অন্তত একটা backend p99-এর tail-এ পড়ে
- Backend-এর p99.9/p99.99 গুরুত্বপূর্ণ হয়ে যায়
- কৌশল: hedged/tied request (idempotent read-এ), ভালো timeout ও deadline, fan-out কমানো, partial result দিয়ে উত্তর (যেখানে গ্রহণযোগ্য)
- Tail-এর কারণ খোঁজা: GC, background job, noisy neighbour, queue
- উৎস: Dean & Barroso, "The Tail at Scale"`,
    },
    {
      question:
        "Target ৫,০০০ req/s, প্রতিটা request গড়ে ৮০ms (এর মধ্যে ৬০ms database-এর জন্য অপেক্ষা)। কয়টা worker/connection লাগবে?",
      answerOutline: `- Little's Law: in-flight = ৫,০০০ × ০.০৮ = ৪০০টা request একসাথে
- Database connection: ৫,০০০ × ০.০৬ = ৩০০টা connection একসাথে ব্যস্ত (প্রতি request-এ একটা query ধরে)
- Headroom (৭০-৮০% utilization-এর লক্ষ্য), ফলে আরও বেশি; একাধিক server-এ ভাগ
- Database কি ৩০০+ connection নিতে পারবে? না পারলে query দ্রুত করা, cache, connection pooler
- Peak আর p99 আলাদা: গড় দিয়ে হিসাব শুরু, load test দিয়ে যাচাই`,
    },
    {
      question:
        "একটা page-এর p95 লক্ষ্য ৩০০ms। ভেতরে কয়েকটা service call আছে। কিভাবে latency budget ভাগ করবেন?",
      answerOutline: `- Network আর handshake আগে বাদ দিন (user কোথায়, RTT কত, connection warm কিনা)
- নির্ভরশীল ধাপ যোগ হয়, স্বাধীন ধাপ parallel-এ সর্বোচ্চ; critical path খুঁজুন
- প্রতিটা dependency-কে নিজের বাজেট আর timeout দিন, deadline নিচে পাঠান
- Parallel fan-out-এ tail-এর গুণফল (0.95³ ≈ 86%) মাথায় রাখুন
- কমানোর উপায়: cache, round trip কমানো, batch endpoint, ধীর কাজ queue-তে (Day 12)`,
    },
  ],

  summary: {
    points: [
      "Latency = একটা কাজে কত সময়; throughput = প্রতি সেকেন্ডে কতগুলো কাজ; bandwidth = link-এর সর্বোচ্চ ক্ষমতা। একটা ভালো হলেই অন্যটা ভালো না।",
      "User-এর latency = DNS + TCP + TLS + network + লাইনে অপেক্ষা + server-এর কাজ + transfer; server-এর log এর ছোট একটা অংশ।",
      "গড় না, percentile (p50, p95, p99) দেখুন; percentile গড় করা যায় না, histogram যোগ করুন।",
      "Fan-out-এ tail বিস্ফোরিত হয়: প্রতিটা ১% ধীর হলে ১০০-way-তে 1 − 0.99¹⁰⁰ ≈ ৬৩% request ধীর।",
      "Little's Law: concurrency = throughput × latency; ছাদের পরে বাড়তি load শুধু latency বাড়ায়।",
      "স্বাধীন call parallel-এ চালালে সময় যোগফল থেকে সর্বোচ্চে নামে; round trip কমানো আর data কাছে আনা সবচেয়ে বড় লাভ।",
      "Batching, buffer, compression throughput বাড়ায় কিন্তু latency-র দাম নিতে পারে; cache/CDN দুটোই উন্নত করে।",
    ],
    diagram: {
      id: "day-007-summary",
      caption: "এক নজরে Latency vs Throughput",
      alt: "তিনটা card: Latency (একটা request-এর সময়, ms, percentile দিয়ে মাপুন), Throughput (প্রতি সেকেন্ডে কতগুলো, req/s), আর Little's Law L = λ × W; নিচে একটা ছোট timeline DNS, TCP, TLS, server, transfer।",
    },
  },
};
