// Day 19 · Capacity Estimation (Napkin Math) — Phase 2. Builds on Day 5's first
// worked example and Day 13's N+1/cost curves; forward links to Day 22 (indexes),
// Day 28 (replication), Day 29 (sharding), Day 87 (autoscaling), Day 116 (interview steps).

import { topicHrefForDay } from "@/lib/data/courses/system-design-a-z";
import type { SdLesson } from "@/lib/system-design/lesson.types";

export const day019Lesson: SdLesson = {
  topicId: "sd-day-019",
  day: 19,
  title: "Capacity Estimation (Napkin Math)",
  definition:
    "Capacity Estimation হলো কয়েকটা ধারণা থেকে খাতা-কলমে traffic, storage, bandwidth, memory আর server-এর মাত্রা বের করা, যাতে design-এর সিদ্ধান্ত অনুমানে না, হিসাবে হয়।",

  objectives: [
    "Powers of two, 86,400 ≈ 10⁵, bit বনাম byte, read:write ratio আর peak factor দিয়ে যেকোনো system-এর গড় ও peak QPS কয়েক মিনিটে বের করতে পারবেন।",
    "Assumption → traffic → storage → bandwidth → cache → server: এই ছয় ধাপে একটা পুরো estimate করে, প্রতিটা ধাপে sanity check দিতে পারবেন।",
    "Index overhead, replication factor, write amplification আর headroom (utilization, N+1, AZ) মিলিয়ে database আর server-এর আসল আকার হিসাব করতে পারবেন।",
    "Little's Law দিয়ে concurrency, thread আর connection-এর সংখ্যা, আর load test-এর মাপা req/s থেকে server-এর সংখ্যা বের করতে পারবেন।",
    "Egress আর storage-এর খরচ মোটা দাগে হিসাব করে, কোন অংশটা আসলে বিল বাড়াবে আগে থেকেই চিহ্নিত করতে পারবেন।",
  ],

  prerequisites: [
    { day: 5, title: "Scalability", href: topicHrefForDay(5) },
    { day: 7, title: "Latency vs Throughput", href: topicHrefForDay(7) },
    {
      day: 13,
      title: "Vertical vs Horizontal Scaling",
      href: topicHrefForDay(13),
    },
  ],

  problem: {
    markdown: `"হাটবাজার" একটা কাল্পনিক online marketplace। গত বছর 11.11 sale-এ ৪টা app server আর একটা database দিয়ে চলেছিল, একটু ধীর হলেও টিকে গিয়েছিল। এ বছর marketing team বিশাল প্রচার চালাচ্ছে, TV-তে বিজ্ঞাপন, মধ্যরাতে ৯৯ টাকার flash deal।

Planning meeting-এ CTO জিজ্ঞেস করলেন, "এবার কয়টা server লাগবে?" কেউ হিসাব করেনি। একজন বলল, "গত বছর ৪টায় চলেছে, দ্বিগুণ করি, ৮টা।" সবাই মাথা নাড়ল। Meeting শেষ।

11.11-এর রাত:

1. **১১:৫৫:** App খোলা মানুষের সংখ্যা গত বছরের তিন গুণ। সবাই অপেক্ষা করছে ঠিক ১২টার জন্য।
2. **১২:০০:০০:** এক মিনিটে যত request এলো, স্বাভাবিক দিনে আসে পুরো এক ঘণ্টায়। ৮টা server-এর CPU ১০০%, page খুলতে ২০ সেকেন্ড।
3. **১২:০২:** Database-এর connection শেষ, "too many connections" error। Cart-এ যোগ হচ্ছে না।
4. **১২:১০:** Team তাড়াহুড়ো করে আরও server চালু করল, কিন্তু সব server একই database-কে প্রশ্ন করছে। Server বাড়ানোয় database-এর চাপ আরও বাড়ল।
5. **পরদিন:** আরেকটা চমক। Seller-রা গত সপ্তাহে লাখ লাখ নতুন product ছবি upload করেছে, আর ছবিগুলো রাখা হচ্ছিল app server-এর disk-এ। Disk ৯৮% ভরা।

Postmortem-এ দেখা গেল, পনেরো মিনিটের একটা খাতা-কলমের হিসাবই বলে দিত: peak হবে গত বছরের দশ গুণের বেশি, আসল চাপ পড়বে database-এ, cache ছাড়া চলবে না, আর ছবির জন্য আলাদা storage লাগবে। সমস্যা server কম ছিল না, সমস্যা ছিল **কেউ সংখ্যা দিয়ে ভাবেনি**।`,
    diagrams: [
      {
        id: "day-019-before",
        caption:
          "আন্দাজে বানানো design: ৮টা server, একটা database, ছবি app server-এর disk-এ; 11.11-এর spike-এ database আর disk দুটোই ভেঙে পড়ে।",
        alt: "অনেক user একটা Load Balancer-এ যাচ্ছে, তার পেছনে চারটা App server (৮টার প্রতিনিধি), সবাই একটা Database-এ যুক্ত, Database লাল চিহ্নে ব্যর্থ, লেখা connection শেষ; App server-এর নিচে Local disk লাল, লেখা ৯৮% ভরা।",
      },
    ],
  },

  analogy: {
    markdown: `বিয়ে বাড়ির বাবুর্চির কথা ভাবুন। কনের বাবা বললেন, "৫০০ জন অতিথি।" বাবুর্চি কখনো বলেন না "ঠিক ৪৮৭ জনের হিসাবে রাঁধব"। তিনি মাথায় একটা হিসাব কষেন:

- **মাথাপিছু কত:** প্রতি জনে ~২৫০ গ্রাম পোলাওয়ের চাল, তাই ৫০০ জনে ~১২৫ কেজি
- **একসাথে কত জন বসবে:** প্যান্ডেলে একবারে ২০০ জন বসে, তাই সবচেয়ে ভিড়ের ব্যাচের জন্য খাবার গরম রাখতে হবে
- **একটা ডেগে কত:** একটা বড় ডেগে ~২৫ কেজি চালের পোলাও হয়, তাই ৫টা ডেগ
- **বাড়তি:** একটা ডেগ পুড়ে গেলে বা হঠাৎ ৫০ জন বেশি এলে? তাই আরেকটা ডেগ, আর ১০% বাড়তি বাজার

খেয়াল করুন, তিনি গ্রাম পর্যন্ত মাপেননি। কিন্তু "৫টা না ৫০টা ডেগ" এই প্রশ্নে কখনো ভুল করেন না। আর শুধু মোট অতিথি না, **সবচেয়ে ভিড়ের মুহূর্ত** নিয়ে ভাবেন।

- **অতিথির সংখ্যা = DAU (Daily Active Users)**
- **মাথাপিছু চাল = প্রতি user-এর request বা data**
- **সবচেয়ে ভিড়ের ব্যাচ = Peak traffic**
- **একটা ডেগের ক্ষমতা = এক server-এর মাপা capacity**
- **বাড়তি একটা ডেগ = N+1 headroom**

Capacity Estimation ঠিক এই বাবুর্চির হিসাব, software-এর জন্য।`,
    diagrams: [
      {
        id: "day-019-analogy",
        caption:
          "বিয়ে বাড়ির বাবুর্চি: অতিথি × মাথাপিছু চাল → মোট বাজার → ডেগের সংখ্যা, সাথে একটা বাড়তি ডেগ।",
        alt: "বাম থেকে ডানে চারটা ধাপ তীর দিয়ে যুক্ত: অতিথি ৫০০ জন (= DAU), মাথাপিছু ২৫০ গ্রাম (= per user), মোট ১২৫ কেজি (= মোট load), আর পাঁচটা ডেগ ও একটা ড্যাশ দেওয়া বাড়তি ডেগ (= server, N+1)। নিচে লেখা সবচেয়ে ভিড়ের ব্যাচ ২০০ জন = peak।",
      },
    ],
  },

  coreConcept: {
    markdown: `**Capacity Estimation** (back-of-the-envelope বা **napkin math**, মানে খাবারের টেবিলের ন্যাপকিনে করা যায় এমন হিসাব) হলো কয়েকটা যুক্তিসঙ্গত ধারণা থেকে system-এর আকার মোটা দাগে বের করা।

**কেন করব?** দুই জায়গায় এটা লাগে:
- **Design review আর planning:** "Redis লাগবে কি?", "Sharding কি এখনই দরকার?", "Bandwidth-এর বিল কত আসবে?" এসব প্রশ্নের উত্তর মতামতে না, সংখ্যায় দেওয়া যায়।
- **Interview:** System design interview-এর শুরুতেই প্রায় সবসময় estimation চায়। Interviewer দেখতে চান সংখ্যা থেকে আপনি design-এর সিদ্ধান্তে যেতে পারেন কিনা।

**লক্ষ্য order of magnitude (দশের ঘাত), নিখুঁত সংখ্যা না।** ১০০ QPS, ১০,০০০ QPS আর ১০,০০,০০০ QPS তিনটা সম্পূর্ণ আলাদা architecture। কিন্তু ৯,২০০ আর ১১,৫০০ একই architecture। তাই সংখ্যা গোল করুন, আর মাথায় রাখুন উত্তরটা ঠিক ঘরে পড়ল কিনা।

**[Day 5](${topicHrefForDay(5)})-এর recap:** সেখানে একটা প্রথম হিসাব করেছিলাম: DAU × request ÷ ৮৬,৪০০ = গড় QPS, × peak factor = peak QPS, আর storage ও bandwidth। **[Day 13](${topicHrefForDay(13)})-এ** দেখেছি N+1 (k-টা failure-এ বাড়তি = k ÷ (N − k)) আর machine-এর আকার অনুযায়ী খরচের U-বাঁক। আজ সেই টুকরোগুলো একটা পুরো পদ্ধতিতে জুড়ব, আর অনেক গভীরে যাব।

### Toolkit: মাথায় রাখার মতো সংখ্যা

**১. Powers of two আর data-র একক।** 2¹⁰ = 1,024 ≈ 10³। তাই প্রতি ১০টা ঘাতে এক ধাপ:

| 2-এর ঘাত | প্রায় | একক | কী আঁটে (মোটা দাগে) |
|---|---|---|---|
| 2¹⁰ | 10³ (হাজার) | KB | একটা ছোট JSON বা text row |
| 2²⁰ | 10⁶ (মিলিয়ন) | MB | একটা ছবি |
| 2³⁰ | 10⁹ (বিলিয়ন) | GB | একটা সিনেমা |
| 2⁴⁰ | 10¹² | TB | একটা বড় disk |
| 2⁵⁰ | 10¹⁵ | PB | বড় video platform-এর storage |

কিছু ছোট আকার: একটা ASCII অক্ষর ১ byte (বাংলা অক্ষর UTF-8-এ ৩ byte), একটা integer বা timestamp ৮ byte, UUID binary-তে ১৬ byte (text হিসেবে ৩৬)।

**২. বাংলা সংখ্যার সাথে মিল।** ১ লাখ = 10⁵, ১০ লাখ = 10⁶ (মিলিয়ন), ১ কোটি = 10⁷। "১ কোটি DAU" মানে ১০ মিলিয়ন।

**৩. সময়।** একদিনে ৮৬,৪০০ সেকেন্ড ≈ **10⁵**। একটা চমৎকার শর্টকাট: **দিনে ১০ লাখ request ≈ সেকেন্ডে ~১২টা**। এক মাসে ~২৫ লাখ সেকেন্ড, এক বছরে ~৩.২ কোটি (≈ π × 10⁷)।

**৪. Bit বনাম byte।** Network-এর গতি লেখা হয় **bit**-এ (Mbps, Gbps), file-এর আকার **byte**-এ (MB, GB)। ১ byte = ৮ bit। তাই 1 Gbps link-এ সর্বোচ্চ ~১২৫ MB/s। এই ৮ গুণের গোলমাল সবচেয়ে প্রচলিত ভুল।

**৫. Latency-র সিঁড়ি।** RAM থেকে পড়া ~১০০ns, SSD random read ~১০০µs, একই data center-এ round trip ~০.৫ms, ঢাকা থেকে Singapore ~৫০ms। পুরো তালিকা [Day 7](${topicHrefForDay(7)})-এ। Estimation-এ এটা বলে দেয়, কোন কাজ memory-তে রাখতেই হবে আর কোনটা network পার হলেও চলবে।

**৬. Read:write ratio।** বেশিরভাগ consumer app read-heavy: product দেখা অনেক, কেনা কম (১০০:১ পর্যন্ত)। কিন্তু payment বা location tracking-এর মতো system write-heavy। Ratio বলে দেয় চাপ কোথায় পড়বে: read-heavy হলে cache আর replica, write-heavy হলে primary database আর sharding।

**৭. Peak factor।** Traffic সারাদিন সমান না। সন্ধ্যার ভিড়ে গড়ের ২-৩ গুণ, ঈদের আগে বা মাসের শুরুতে আরও বেশি, আর flash sale-এর প্রথম মিনিটে ১০ গুণ বা তারও বেশি হতে পারে। Design সবসময় **peak**-এর জন্য।

### ছয় ধাপের পদ্ধতি

নিচের মূল diagram-এ পুরো pipeline:

1. **Assumption লিখুন:** DAU, প্রতি user কয়টা কাজ, read:write, data-র আকার, peak factor। সবার সামনে লিখে রাখুন, যাতে কেউ দ্বিমত করলে কোন সংখ্যা বদলাতে হবে বোঝা যায়।
2. **Traffic:** গড় QPS = দিনের মোট request ÷ 10⁵; peak = গড় × peak factor; তারপর read আর write আলাদা করুন।
3. **Storage:** দিনে কত write × প্রতিটার আকার × ৩৬৫ × কয় বছর; তারপর × index overhead × replication factor।
4. **Bandwidth:** Peak QPS × response-এর আকার = egress (বাইরে যাওয়া); upload থাকলে ingress আলাদা। Byte থেকে bit-এ যেতে × ৮।
5. **Cache memory:** কোন data সবচেয়ে বেশি পড়া হয় (প্রায়ই ২০% data-তে ৮০% read), তার আকার।
6. **Server:** Peak ÷ (load test-এ মাপা প্রতি server-এর capacity × target utilization), তারপর N+1।

প্রতিটা ধাপের পরে একটা **sanity check**: উল্টো দিক থেকে মিলিয়ে দেখুন। "বছরে ৩৩ TB" পেলে ভাগ করে দেখুন প্রতি transaction-এ কত byte দাঁড়াল, যুক্তিসঙ্গত কিনা।

### একটা ছোট উদাহরণ: "টাকাঘর" wallet

ধরি bKash-এর মতো একটা কাল্পনিক mobile wallet। **সব সংখ্যা আমাদের নিজের ধারণা, কোনো কোম্পানির আসল data না।**

- **১ কোটি DAU**, প্রতি জন দিনে **২টা** লেনদেন → দিনে ২ কোটি (2 × 10⁷)
- গড় = 2 × 10⁷ ÷ 10⁵ = **~২০০ TPS** (transaction per second)
- মাসের শুরুতে আর ঈদের আগে সন্ধ্যায় peak factor ১০ → **~২,০০০ TPS**
- প্রতি লেনদেনে সব row মিলিয়ে ~১KB → দিনে ২০GB, বছরে ~৭.৩TB

এই চার লাইনেই একটা সিদ্ধান্ত বেরিয়ে এলো: এটা write-heavy, আর ২,০০০ TPS write একটা primary database-এর জন্য গুরুতর চাপ। পুরো হিসাবটা ধাপে ধাপে গভীরে যাই অংশে।`,
    diagrams: [
      {
        id: "day-019-main",
        caption:
          "Estimation pipeline: assumption থেকে ধাপে ধাপে traffic, storage, bandwidth, cache, server, আর প্রতিটা ধাপের সূত্র।",
        alt: "বাম থেকে ডানে ছয়টা box তীর দিয়ে যুক্ত: Assumptions (DAU, per user, ratio, size, peak), Traffic (দিনের request ÷ 10^5 × peak), Storage (write × size × দিন × index × replica), Bandwidth (QPS × size × 8), Cache (hot 20%), Servers (peak ÷ capacity × utilization + N+1)। নিচে একটা ফিরতি ড্যাশ তীর, লেখা sanity check: উল্টো দিক থেকে মেলান।",
        downloadable: true,
      },
      {
        id: "day-019-before-after",
        caption:
          "পাশাপাশি: আন্দাজে ৮টা server আর একটা database বনাম হিসাব করে CDN, cache, N+1 সহ server আর object storage।",
        alt: "উপরে আগের design: Users, Load Balancer, App servers, একটা Database (ব্যর্থ) আর Local disk (ভরা)। নিচে হিসাবের পরের design: Users, CDN (ছবি), Load Balancer, App servers (N+1), Cache, Database primary ও replica, Object storage।",
      },
    ],
  },

  deepDive: [
    {
      title:
        "পুরো চারটা estimate: wallet, 11.11 sale, ride location আর short video",
      markdown: `চারটা ভিন্ন ধরনের system, চারটা ভিন্ন bottleneck। **সব নাম আর সংখ্যা কাল্পনিক উদাহরণ**, বাস্তব কোম্পানির আকারের কাছাকাছি ধরনের, কিন্তু কোনো কোম্পানির প্রকাশিত data না।

**১. "টাকাঘর" wallet (bKash-ধরনের): write-heavy, consistency-ই সব।** নিচের StepThrough-এ পুরো হিসাব ধাপে ধাপে। সারকথা: peak ~২,০০০ TPS write, বছরে index আর ৩টা কপি মিলিয়ে ~৩৩TB, bandwidth মাত্র ~০.২ Gbps। অর্থাৎ এখানে bandwidth বা cache আসল প্রশ্ন না, আসল প্রশ্ন primary database কতটা write নিতে পারে, আর কবে account দিয়ে sharding ([Day 29](${topicHrefForDay(29)})) লাগবে।

**২. "হাটবাজার" 11.11 sale (Daraz-ধরনের): read-heavy, ভয়ংকর spike।**
- স্বাভাবিক দিনে ৫০ লাখ DAU, 11.11-এ ধরি **১.৫ কোটি**; প্রতি জন ~৪০টা API request → দিনে **6 × 10⁸**
- সারাদিনের গড়: 6 × 10⁸ ÷ 10⁵ = **~৬,০০০ QPS**
- কিন্তু মধ্যরাতের প্রথম ঘণ্টায় দিনের ১০% traffic: 6 × 10⁷ ÷ ৩,৬০০ ≈ **~১৭,০০০ QPS**
- আর ১২:০০-এর flash deal-এর প্রথম মিনিটে আরও ৩ গুণ: **~৫০,০০০ QPS**। এটাই design-এর সংখ্যা। গড়ের প্রায় ৮ গুণ।
- Read:write ~১০০:১ → write (cart, order) মাত্র ~৫০০/s। চাপটা read-এ।
- **Catalog:** ১ কোটি product × ~৫KB = **৫০GB**। পুরোটাই memory-তে আঁটে! সবচেয়ে বেশি দেখা ২০% = ১০GB।
- **Cache-এর প্রভাব:** hit ratio ৯০% হলে database দেখে ৫০,০০০ × ০.১ = ৫,০০০ QPS; ৯৫% হলে ২,৫০০। পাঁচ শতাংশের পার্থক্যে database-এর চাপ অর্ধেক।
- **ছবি:** ১ কোটি product × ৫টা ছবি × ২০০KB = **১০TB**। App server-এর disk-এ না, object storage আর CDN-এ ([Day 11](${topicHrefForDay(11)}))।
- **API bandwidth:** ৫০,০০০ × ২০KB = ১GB/s = **৮ Gbps**, ছবি বাদেই।
- **Server:** Load test-এ একটা server p99 ঠিক রেখে ১,০০০ QPS পারে; ৬০% utilization-এ ৬০০। ৫০,০০০ ÷ ৬০০ = ৮৩.৩ → **৮৪টা**, N+1-এ ৮৫।

**৩. "চলো রাইড" location stream (Pathao-ধরনের): ছোট data, বিশাল write rate।**
- Peak-এ **১ লাখ** online driver, প্রতি **৪ সেকেন্ডে** একবার location পাঠায় → 10⁵ ÷ ৪ = **২৫,০০০ write/s**
- প্রতিটা update ~১০০ byte (driver id, lat, lon, সময়, গতি, দিক, protocol-এর খরচ) → ২.৫MB/s = **২০ Mbps**। Bandwidth কোনো সমস্যাই না।
- সবার **সর্বশেষ** location: ১ লাখ × ১০০ byte = **১০MB**। Geo-index-এর খরচ দশ গুণ ধরলেও ১০০MB। একটা Redis-এ আরামে আঁটে।
- History: সারাদিনে গড়ে ৪০,০০০ driver online → ১০,০০০ update/s × ৮৬,৪০০ ≈ 8.6 × 10⁸/দিন × ১০০ byte ≈ **৮৬GB/দিন**, বছরে ~**৩১TB**।
- **সিদ্ধান্ত:** প্রতিটা update একটা SQL database-এর indexed table-এ লেখা মানে ২৫,০০০ random write/s, প্রতিটা আবার index-এ। তার বদলে সর্বশেষ অবস্থান memory-তে (Redis-এর geo command, [Day 35](${topicHrefForDay(35)})), আর history একটা log-এ (যেমন Kafka) জমিয়ে batch করে সস্তা storage-এ। হিসাবটাই বলে দিল: সমস্যা আকারে না, **হারে**।

**৪. Short video app: storage বছরে PB, আর egress তার চেয়েও বড়।**
- ১ কোটি DAU, ১% প্রতিদিন video upload করে → **১ লাখ video/দিন**
- প্রতিটা video: original ~১০MB + তিনটা resolution-এ transcode করা কপি ~২০MB = **৩০MB**
- দিনে 10⁵ × ৩০MB = **৩TB**, বছরে ~**১.১PB**
- ৩টা কপি (replication factor ৩) → **~৩.৩PB/বছর**। Erasure coding দিয়ে (নিচে দেখব) ~১.৬PB।
- **দেখা (egress):** প্রতি user দিনে ৫০টা video × ~৫MB = ২৫০MB → 10⁷ × ২৫০MB = **২.৫PB প্রতিদিন**।

শেষ লাইনটা থেমে দেখার মতো: **একদিনের egress, পুরো বছরের নতুন storage-এর দ্বিগুণের বেশি।** এই app-এর বিল ঠিক করবে CDN আর egress, disk না।`,
      diagrams: [
        {
          id: "day-019-walkthrough",
          caption:
            'ধাপে ধাপে: "টাকাঘর" wallet-এর পুরো estimate, assumption থেকে server আর sanity check পর্যন্ত।',
          alt: "একটা হিসাবের খাতা, প্রতি ধাপে একটা নতুন লাইন যোগ হয় আর সেটা হাইলাইট হয়: assumption (১ কোটি DAU, ২ লেনদেন, peak ×১০), গড় ২০০ TPS, peak ২,০০০ TPS ও read ১০,০০০/s, storage দিনে ২০GB ও বছরে ~৭.৩TB, index ও ৩ কপি সহ ~৩৩TB, bandwidth ~০.২ Gbps, cache ~১GB, app server ১০টা, আর sanity check।",
        },
      ],
    },
    {
      title: "Load test-এর সংখ্যা থেকে server-এর সংখ্যা, আর headroom-এর গুণফল",
      markdown: `**এক server-এর capacity কোথা থেকে আসে?** Spec sheet বা "Node.js সেকেন্ডে ১০ হাজার request পারে" জাতীয় blog post থেকে না। আপনার নিজের app, আপনার নিজের query, আপনার নিজের response-এর আকারে **load test** করে মাপুন। আর মাপুন **latency-র শর্ত সহ**: "p99 ২০০ms-এর মধ্যে রেখে সর্বোচ্চ কত req/s"। CPU ১০০% আর p99 ৩ সেকেন্ডে পাওয়া req/s আপনার capacity না, সেটা ভাঙনের বিন্দু।

Lab-এ দেখবেন: concurrency বাড়ালে একটা জায়গার পরে req/s আর বাড়ে না, শুধু latency বাড়ে ([Day 5](${topicHrefForDay(5)})-এর knee)। Capacity হলো knee-এর ঠিক আগের সংখ্যা।

**কেন ১০০% না: queue-এর অঙ্ক।** একটা সরল queue model (M/M/1) বলে, server-এর utilization ρ হলে গড় response time:

\`\`\`
R = S ÷ (1 − ρ)        S = একটা request-এর আসল কাজের সময়

S = 10ms হলে:
ρ = 50%  →  R = 20ms
ρ = 70%  →  R ≈ 33ms
ρ = 80%  →  R = 50ms
ρ = 90%  →  R = 100ms
ρ = 95%  →  R = 200ms
\`\`\`

৫০% থেকে ৯০%-এ যেতে load বাড়ল ১.৮ গুণ, latency বাড়ল ৫ গুণ। বাস্তব system এই model-এর মতো নিখুঁত না, কিন্তু বাঁকের আকারটা একই। উল্টো দিক থেকেও কাজে লাগে: S = 20ms আর লক্ষ্য গড় ≤ 50ms হলে, 1 − ρ ≥ 20/50, অর্থাৎ **ρ ≤ ৬০%**। এভাবেই target utilization একটা যুক্তিসঙ্গত সংখ্যা হয়, মুখস্থ "৭০%" না।

**সূত্রটা:**

\`\`\`
চালু server (N) = ⌈ peak ÷ (মাপা capacity × target utilization) ⌉
মোট            = N + k                  (k-টা failure সহ্য করতে)
\`\`\`

**তারপর বড় failure domain।** [Day 13](${topicHrefForDay(13)})-এ দেখেছি, পুরো availability zone (AZ) চলে গেলেও চলতে হলে বাকি AZ-গুলোকে পুরো peak নিতে হবে। "হাটবাজার"-এর ৮৪টা server-এর capacity লাগে:
- **৩টা AZ, একটা হারালেও চলবে:** বাকি ২টায় ৮৪ লাগবে → প্রতি AZ-এ ৪২ → মোট **১২৬** (১.৫ গুণ)
- **২টা AZ:** প্রতিটায় পুরো ৮৪ → মোট **১৬৮** (২ গুণ)

**গুণফলের ফাঁদ।** প্রতিটা নিরাপত্তা-গুণক আলাদাভাবে যুক্তিসঙ্গত, কিন্তু গুণ হতে হতে বিশাল হয়:

\`\`\`
peak factor ×8  →  utilization ÷0.6 (×1.67)  →  AZ ×1.5  →  ৬ মাসের growth ×1.5
মোট: গড়ের প্রায় ৩০ গুণ ক্ষমতা
\`\`\`

এটা ভুল না, যদি প্রতিটা গুণকের পেছনে কারণ থাকে। ভুল হলো কারণ ছাড়া "আরও ২ গুণ, নিরাপদে থাকি" যোগ করা, যখন peak factor ইতিমধ্যে সবচেয়ে খারাপ মিনিট ধরে নিয়েছে। প্রতিটা গুণক আলাদা লাইনে লিখুন, কেন সেটা আছে সহ। Interview-তেও এটাই দেখায় আপনি বুঝে হিসাব করছেন।

**আর মনে রাখুন:** ১২৬টা server সারা বছর চালাতে হবে না। 11.11-এর জন্য আগে থেকে বাড়িয়ে (pre-scale), পরে কমিয়ে দেওয়া যায়। Autoscaling স্বাভাবিক ওঠানামা সামলায়, কিন্তু মধ্যরাতের এক মিনিটের spike-এ নতুন server চালু হওয়ার আগেই ভিড় চলে আসে। তাই জানা ঘটনার আগে হাতে বাড়ানো ([Day 87](${topicHrefForDay(87)})-এ গভীরে)।`,
      diagrams: [
        {
          id: "day-019-utilization",
          caption:
            "Utilization বাড়লে response time: ৫০%-এ কাজের সময়ের ২ গুণ, ৯০%-এ ১০ গুণ; তাই server ৬০-৭০%-এ রাখা হয়।",
          alt: "Line chart। X অক্ষে utilization ০% থেকে ৯৫%, Y অক্ষে response time ms-এ (S = 10ms)। রেখা ১০ms থেকে শুরু, ৫০%-এ ২০, ৭০%-এ ৩৩, ৮০%-এ ৫০, ৯০%-এ ১০০, ৯৫%-এ ২০০, খাড়া উপরে ওঠে। ৬০-৭০% অংশ সবুজ ছায়ায়, লেখা নিরাপদ এলাকা।",
        },
      ],
    },
    {
      title:
        "Little's Law: কয়টা request একসাথে, কয়টা connection, কয়টা thread",
      markdown: `QPS বলে সেকেন্ডে কতগুলো আসছে। কিন্তু memory, thread আর connection ঠিক করে **একসাথে কতগুলো চলছে** (concurrency)। দুটো জোড়ে [Day 7](${topicHrefForDay(7)})-এর **Little's Law**:

\`\`\`
L = λ × W

L = একসাথে system-এ কয়টা (in-flight)
λ = প্রতি সেকেন্ডে কয়টা আসে (throughput)
W = প্রতিটা কতক্ষণ থাকে (latency)
\`\`\`

**১. In-flight request:** "টাকাঘর"-এ ২,০০০ TPS, প্রতিটা app-এ ~১৫০ms → L = ২,০০০ × ০.১৫ = **৩০০টা** একসাথে। ১০টা server-এ প্রতিটায় ~৩০টা। Thread-per-request server-এ প্রতিটায় ৩০টার বেশি thread লাগবে, বাড়তি সহ ধরুন ৬০।

**২. Database connection pool:** প্রতিটা লেনদেন database connection ধরে রাখে ~২০ms → ২,০০০ × ০.০২ = **৪০টা connection** গড়ে ব্যস্ত। Burst-এর জন্য দ্বিগুণ ধরলে ~৮০, ১০টা server-এ প্রতিটার pool ৮-১০। "প্রতি server-এ ১০০টা connection" দিলে ১০ server-এ ১,০০০টা, যেটা database-এর জন্য নিজেই একটা বোঝা (প্রতিটা connection memory খায়)। Little's Law বলে, দরকার তার এক-দশমাংশেরও কম।

**৩. ধীর downstream কেন সব ডোবায়:** ধরুন bank gateway-র latency ১৫০ms থেকে হঠাৎ ৩ সেকেন্ড হলো। একই ২,০০০ TPS-এ L = ২,০০০ × ৩ = **৬,০০০** in-flight। কিন্তু ১০টা server × ২০০ thread = ২,০০০টাই আছে। তাহলে সর্বোচ্চ throughput = L ÷ W = ২,০০০ ÷ ৩ ≈ **৬৬৭ TPS**। বাকিরা লাইনে দাঁড়ায়, timeout হয়, retry করে আরও চাপ বাড়ায়। একটা ধীর dependency পুরো system-এর ক্ষমতা তিন ভাগের এক ভাগে নামিয়ে দিল। এজন্যই timeout আর circuit breaker ([Day 59](${topicHrefForDay(59)}))।

**৪. দীর্ঘ connection (WebSocket):** "চলো রাইড"-এ rider ride track করার সময় একটা WebSocket খোলা রাখে। প্রতি সেকেন্ডে ৫০টা নতুন tracking session শুরু হয়, গড়ে প্রতিটা ২০ মিনিট (১,২০০ সেকেন্ড) চলে → L = ৫০ × ১,২০০ = **৬০,০০০** খোলা connection। Load test-এ একটা server ২০,০০০ connection পারে, ৬০%-এ ১২,০০০ → ৫টা, N+1-এ ৬টা। এখানে QPS প্রায় অর্থহীন, সংখ্যাটা connection-এর ([Day 43](${topicHrefForDay(43)})-এ WebSocket গভীরে)।

**Lab-এ যাচাই:** hey দিয়ে concurrency ১৬-তে মাপলে req/s × গড় latency ≈ ১৬ আসবে। Little's Law কাগজের সূত্র না, আপনার terminal-এ মেলে।`,
    },
    {
      title:
        "Storage-এর আসল আকার: index, replication factor আর write amplification",
      markdown: `"দিনে ২০GB" কখনো disk-এ ২০GB না। একটা logical write disk-এ পৌঁছাতে পৌঁছাতে কয়েক গুণ হয়।

**Database sizing-এর সূত্র:**

\`\`\`
disk = row সংখ্যা × row-এর আকার × (1 + index overhead) × replication factor ÷ disk-এর লক্ষ্য ভরাট
\`\`\`

উদাহরণ: ৫০ কোটি (5 × 10⁸) row × ২০০ byte = ১০০GB। Index ([Day 22](${topicHrefForDay(22)})) প্রায়ই data-র ৫০-১০০% বা তার বেশি জায়গা নেয়; ১০০% ধরলে ২০০GB। প্রতিটা replica-তে এই ২০০GB। কিন্তু disk ১০০% ভরলে database বিপদে পড়ে (vacuum, compaction, migration-এর জন্য খালি জায়গা লাগে), তাই ~৭০% ভরাটের লক্ষ্যে প্রতিটা node-এ ২০০ ÷ ০.৭ ≈ **~২৯০GB** disk, আর ৩টা node-এ মোট ~৮৬০GB। শুরুর ১০০GB থেকে প্রায় ৯ গুণ।

**Write amplification:** একটা "টাকা পাঠানো" লেনদেন আসলে অনেকগুলো write:
- Logical row: transaction row, প্রেরকের debit ledger row, প্রাপকের credit ledger row, notification-এর outbox row = **৪টা row**
- প্রতিটা row-এর primary key আর ধরি ২টা secondary index = **৩টা B-tree-তে লেখা** → ১২টা
- প্রতিটা পরিবর্তন আগে **WAL** (write-ahead log, crash থেকে বাঁচার জন্য আগে লেখা log)-এ যায়, তারপর data page-এ
- ৩টা replica-র প্রত্যেকে একই কাজ করে → মোটা দাগে ১২ × ৩ = **৩৬টা tree-write**, WAL বাদেই

১,০০০ TPS মানে cluster-জুড়ে ~৩৬,০০০ physical write/s। তাই "১,০০০ TPS, সহজ" ভাবার আগে গুণে দেখুন। প্রতিটা নতুন secondary index read দ্রুত করে, কিন্তু প্রতিটা write-এর দাম বাড়ায়। LSM-tree ভিত্তিক database-এ compaction একই data বারবার নতুন করে লেখে, সেটা আরেক ধরনের amplification ([Day 23](${topicHrefForDay(23)}))।

**Replication factor বনাম erasure coding।** Object storage-এ ৩টা পূর্ণ কপি মানে ৩ গুণ জায়গা। **Erasure coding** data-কে টুকরো করে কিছু parity টুকরো যোগ করে। যেমন **RS(6,3)**: ৬টা data টুকরো + ৩টা parity, মোট ৯টা, তাই খরচ ৯/৬ = **১.৫ গুণ**, আর যেকোনো ৩টা টুকরো হারালেও data ফেরানো যায়। Short video app-এ ১.১PB raw: ৩ কপিতে ৩.৩PB, RS(6,3)-এ ~১.৬৫PB। দাম: পড়তে বা ভাঙা টুকরো ফেরাতে বেশি CPU আর network লাগে, তাই সাধারণত কম-পড়া (warm/cold) data-র জন্য। Replication নিয়ে বিস্তারিত [Day 28](${topicHrefForDay(28)})-এ।

**Storage-এর খরচ জমতে থাকে।** Traffic স্থির থাকলেও storage-এর বিল প্রতি মাসে বাড়ে, কারণ পুরনো data থেকেই যায়। Short video app-এ দিনে ৩TB নতুন: প্রথম মাস শেষে ~৯০TB, বারো মাস শেষে ~১,০৯৫TB। প্রতি TB-মাস $২০ ধরলে (উদাহরণের দাম) প্রথম মাসের বিল ~$১,৮০০, বারোতম মাসের ~$২২,০০০। তাই retention policy (কত দিন রাখব, কবে সস্তা storage-এ সরাব) estimation-এরই অংশ।`,
      diagrams: [
        {
          id: "day-019-write-amp",
          caption:
            "একটা লেনদেন, অনেক write: ৪টা row × ৩টা index-tree × ৩টা replica ≈ ৩৬টা physical write (WAL বাদে)।",
          alt: "বামে একটা box লেখা ১টা লেনদেন। তার থেকে চারটা তীর চারটা row-এ: transaction, debit, credit, outbox। প্রতিটা row থেকে তিনটা ছোট box: PK, index 1, index 2। ডানে তিনটা database replica, লেখা প্রতিটায় একই ১২টা লেখা। নিচে মোট ≈ ৩৬।",
        },
      ],
    },
    {
      title: "Cache memory sizing: 80/20, hit ratio আর লুকানো overhead",
      markdown: `**80/20 (Pareto) নিয়ম:** প্রায়ই ২০% data-তে ৮০% read পড়ে। এটা প্রকৃতির নিয়ম না, একটা ভালো শুরুর ধারণা। বাস্তব data-তে প্রায়ই আরও বাঁকা: অল্প কিছু item-এ বিশাল ভিড় (flash deal-এর ১০০টা product)। সম্ভব হলে নিজের access log থেকে মাপুন: শীর্ষ কত শতাংশ key-তে কত শতাংশ read।

**Cache-এর আকারের হিসাব:**

\`\`\`
cache memory = hot item-এর সংখ্যা × item-এর আকার × overhead × replica
\`\`\`

"হাটবাজার": hot set ১০GB raw। কিন্তু:
- **প্রতি key-এর overhead:** Redis-এর মতো store-এ প্রতিটা key-এর সাথে metadata, pointer, expiry থাকে; ছোট value হলে এই overhead value-এর সমান বা বেশি হতে পারে
- **Fragmentation:** allocator-এর কারণে কিছু memory নষ্ট হয়
- **Serialization:** JSON-এ রাখলে binary-র চেয়ে বড়

মোটা দাগে ×২ ধরলে ২০GB, আর প্রতিটা cache node-এর একটা replica রাখলে **৪০GB**। তারপর machine-এর RAM-এর পুরোটা না, \`maxmemory\` RAM-এর নিচে রাখুন, যাতে OS আর background কাজের জায়গা থাকে।

**Hit ratio-র অঙ্কটাই আসল।** Database-এর load = মোট read × (1 − hit ratio):

\`\`\`
৫০,০০০ QPS, hit 80%  →  DB-তে 10,000
             hit 90%  →  DB-তে  5,000
             hit 95%  →  DB-তে  2,500
             hit 99%  →  DB-তে    500
\`\`\`

৯০% থেকে ৯৯%-এ যাওয়া মানে database-এর চাপ ১০ ভাগের এক ভাগ। তাই hit ratio-র প্রতিটা শতাংশ, শেষের দিকে, অনেক দামি। আর উল্টো বিপদ: cache restart হলে (cold cache) hit ratio হঠাৎ শূন্যের কাছে, পুরো ৫০,০০০ QPS database-এ। Estimate-এ জিজ্ঞেস করুন: "cache ছাড়া database কি অন্তত কিছুক্ষণ টিকবে?" না হলে cache-এর replica আর warm-up পরিকল্পনা লাগবে। Caching-এর বাকি গভীরতা [Day 17](${topicHrefForDay(17)})-এ।`,
    },
    {
      title: "Egress bandwidth আর খরচের মোটা দাগের হিসাব",
      markdown: `**Ingress বনাম egress।** অনেক বড় cloud provider-এ ভেতরে আসা data (ingress) সাধারণত বিনামূল্যে, কিন্তু বাইরে যাওয়া data (**egress**) GB প্রতি চার্জ হয়। তাই upload-heavy app-এর চেয়ে view-heavy app-এর network বিল অনেক বড়।

**খরচের তিন ভাগ, তিন রকম সূত্র (সব দাম উদাহরণ মাত্র, আসল দাম provider-এর pricing page-এ দেখুন):**
- **Compute:** server সংখ্যা × মাসিক দাম। "হাটবাজার": ৮৫টা × $১০০ = ~$৮,৫০০/মাস, যদি সারা মাস চালাতে হয়; শুধু sale-এর দিনগুলোয় চালালে অনেক কম।
- **Storage:** জমা TB × TB-মাসের দাম, আর এটা প্রতি মাসে বাড়ে (আগের অংশ)।
- **Egress:** মাসে মোট GB × GB-এর দাম। Short video app: দিনে ২.৫PB = ২৫ লাখ GB; $০.০২/GB ধরলে **দিনে $৫০,০০০**। Storage-এর বিল এর পাশে নগণ্য।

**CDN offload।** Origin-এর egress = মোট × (1 − CDN hit ratio)। ৮ Gbps traffic, CDN ৯৫% সামলালে origin থেকে যায় মাত্র ০.৪ Gbps। তাই video আর ছবি-ভারী app-এ CDN চুক্তিই সবচেয়ে বড় খরচের সিদ্ধান্ত।

**Link-এর আকার বনাম মাসের বিল।** দুটো আলাদা প্রশ্ন:
- **Link বা NIC কত বড় লাগবে:** peak-এর হার দিয়ে (Gbps)
- **মাসের বিল কত:** মোট পরিমাণ দিয়ে (GB), অথবা কিছু transit আর data center চুক্তিতে **95th percentile billing**: মাসজুড়ে প্রতি ৫ মিনিটে হার মাপা হয়, সবচেয়ে উঁচু ৫% নমুনা বাদ দিয়ে বাকিগুলোর সর্বোচ্চটা দিয়ে বিল। ৩০ দিনের মাসে ৫% মানে ~৩৬ ঘণ্টা। তাই 11.11-এর ২ ঘণ্টার spike এই পদ্ধতিতে বিলে প্রায় ধরাই পড়ে না, কিন্তু link-কে সেটা সামলাতেই হবে।

**Bit বনাম byte আবার।** "Peak egress ১২০MB/s, আমাদের 1 Gbps link আছে, অনেক জায়গা" — না! ১২০MB/s = ৯৬০ Mbps, link-এর ৯৬%। আসলে প্রায় শেষ সীমায়।`,
    },
  ],

  tradeOffs: {
    markdown: `**কতটা নিখুঁত হবেন?** Estimation-এর মূল trade-off হলো সময় বনাম নির্ভুলতা। Interview-তে বা প্রথম design আলোচনায় ৫ মিনিটের napkin math যথেষ্ট, কারণ লক্ষ্য শুধু ঠিক ঘরটা (১০০ নাকি ১ লাখ)। কিন্তু টাকা খরচের আগে (hardware কেনা, বছরব্যাপী চুক্তি) মাপা data আর load test লাগবে।

**কখন napkin math যথেষ্ট:** নতুন system-এর design, কোন component লাগবে সেই সিদ্ধান্ত, interview, "এটা কি আদৌ সমস্যা?" যাচাই।

**কখন যথেষ্ট না:** বড় অঙ্কের কেনাকাটা, SLA-র প্রতিশ্রুতি, চলমান system-এর পরের quarter-এর পরিকল্পনা। তখন আসল metrics (traffic-এর ধরন, growth trend) আর load test দিয়ে হিসাব।

চারটা উদাহরণের bottleneck পাশাপাশি (সব সংখ্যা কাল্পনিক উদাহরণ):`,
    table: {
      headers: [
        "বিষয়",
        "টাকাঘর (wallet)",
        "হাটবাজার 11.11",
        "চলো রাইড (location)",
        "Short video",
      ],
      rows: [
        [
          "Peak হার",
          "~২,০০০ TPS write",
          "~৫০,০০০ QPS read",
          "~২৫,০০০ write/s",
          "দিনে ১ লাখ upload, ৫০ কোটি view",
        ],
        [
          "Read:write",
          "write-heavy",
          "~১০০:১",
          "write-heavy",
          "view অনেক বেশি",
        ],
        [
          "Storage/বছর",
          "~৩৩TB (index + ৩ কপি)",
          "ছবি ~১০TB মোট",
          "history ~৩১TB raw",
          "~৩.৩PB (৩ কপি)",
        ],
        [
          "Bandwidth",
          "~০.২ Gbps, নগণ্য",
          "API ~৮ Gbps + ছবি CDN-এ",
          "~২০ Mbps, নগণ্য",
          "দিনে ~২.৫PB egress",
        ],
        [
          "আসল bottleneck",
          "Primary DB-র write",
          "Spike আর DB read",
          "Write-এর হার",
          "Egress-এর খরচ",
        ],
        [
          "মূল সিদ্ধান্ত",
          "Account দিয়ে sharding-এর পরিকল্পনা",
          "Cache, CDN, pre-scale",
          "Memory-তে সর্বশেষ, log-এ history",
          "CDN, erasure coding, retention",
        ],
      ],
    },
  },

  industry: {
    markdown: `- **Jeff Dean (Google)** তাঁর বিখ্যাত talk "Designs, Lessons and Advice from Building Large Distributed Systems" (২০০৯)-এ "Numbers Everyone Should Know" তালিকা দেখিয়ে বলেছিলেন, design বাছার আগে back-of-the-envelope হিসাব করে দেখতে হয় কোনটা চলবে। আজকের latency-র সিঁড়ি আর napkin math-এর জনপ্রিয়তা অনেকটা সেখান থেকে।
- **Google-এর Site Reliability Engineering বই** capacity planning-কে SRE-র মূল দায়িত্বের একটা হিসেবে দেখায়: চাহিদার পূর্বাভাস, load test দিয়ে মাপা capacity, আর planned ও unplanned outage একসাথে সামলানোর মতো বাড়তি (N+2)। বইটায় Auxon নামে Google-এর একটা intent-based capacity planning tool-এর বর্ণনাও আছে।
- **Little's Law** (John Little, ১৯৬১) queueing theory-র একটা মৌলিক ফল; thread pool আর connection pool-এর আকার ঠিক করতে আজও সরাসরি ব্যবহার হয়।
- **Erasure coding:** HDFS (Hadoop 3 থেকে) erasure coding সমর্থন করে, যেমন RS-6-3 policy, যেখানে সাধারণ 3× replication-এর বদলে ~১.৫ গুণ জায়গা লাগে। Facebook-এর **f4** warm BLOB storage-এর paper (OSDI ২০১৪) দেখিয়েছিল, কম-পড়া ছবির জন্য replication-এর বদলে Reed-Solomon coding দিয়ে effective replication factor অনেক কমানো যায়।
- **Cloud pricing:** AWS, Google Cloud, Azure-এর pricing calculator আছে, যেখানে server, storage আর egress-এর আনুমানিক মাসিক খরচ বের করা যায়। এদের data transfer pricing-এ ভেতরে আসা data সাধারণত বিনামূল্যে, বাইরে যাওয়া চার্জ হয়।

জনপ্রিয় tool:
- **Load test:** hey, wrk, k6, Locust, JMeter
- **হিসাব:** একটা spreadsheet বা ছোট Python script (Lab-এ বানাবেন), যাতে assumption বদলালেই সব নতুন করে হিসাব হয়
- **বাস্তব data:** Prometheus/Grafana-র মতো monitoring থেকে আসল QPS, peak factor আর growth trend

*উৎস: Jeff Dean, "Designs, Lessons and Advice from Building Large Distributed Systems" (LADIS 2009 keynote); Beyer et al., "Site Reliability Engineering" (O'Reilly, 2016); J. D. C. Little, "A Proof for the Queuing Formula L = λW" (Operations Research, 1961); Apache Hadoop HDFS Erasure Coding documentation; Muralidhar et al., "f4: Facebook's Warm BLOB Storage System" (OSDI 2014); AWS/Google Cloud/Azure pricing pages।*`,
  },

  mistakes: [
    {
      mistake:
        'Bit আর byte গুলিয়ে ফেলা: ১২০MB/s-কে ১২০ Mbps ভেবে 1 Gbps link-কে "অনেক বড়" মনে করা। আসলে সেটা ৯৬০ Mbps।',
      fix: "Network-এর হিসাব সবসময় bit-এ লিখুন, আর MB/s থেকে Mbps-এ যেতে × ৮ আলাদা লাইনে লিখুন।",
    },
    {
      mistake:
        "গড় QPS দিয়ে server গোনা। ১১.১১-এর প্রথম মিনিট গড়ের ৮-১০ গুণ, আর ঠিক সেই মিনিটেই সবচেয়ে বেশি বিক্রি।",
      fix: "Peak factor স্পষ্ট লিখুন আর কারণ দিন (সন্ধ্যার ভিড়, sale, মাসের শুরু); design করুন peak-এর জন্য।",
    },
    {
      mistake:
        "Storage-এ শুধু raw data গোনা: index, replication factor, WAL, backup আর disk-এর খালি জায়গা ভুলে যাওয়া। আসল disk ৫-১০ গুণ বড় লাগে।",
      fix: "সূত্রটা মেনে চলুন: row × আকার × (1 + index) × replica ÷ লক্ষ্য ভরাট, আর retention কত বছর তা লিখুন।",
    },
    {
      mistake:
        'মিথ্যা নির্ভুলতা: "আমাদের ১১,৫৭৪ QPS লাগবে"। Assumption-গুলোই ±৫০% অনিশ্চিত, তাই শেষ অঙ্কের দশমিক অর্থহীন।',
      fix: "এক-দুই significant digit-এ গোল করুন (~১২,০০০), আর বলুন কোন assumption বদলালে উত্তর সবচেয়ে বেশি বদলায়।",
    },
    {
      mistake:
        "Server-এর capacity ধরে নেওয়া blog বা spec sheet থেকে, অথবা load test-এর সেই সংখ্যা নেওয়া যেখানে CPU ১০০% আর p99 কয়েক সেকেন্ড।",
      fix: "নিজের app-এ load test করুন, আর capacity ধরুন সেই হার যেখানে p99 এখনো লক্ষ্যের মধ্যে; তারপর ৬০-৭০% utilization।",
    },
    {
      mistake:
        'প্রতি ধাপে কারণ ছাড়া "আরও ২ গুণ, নিরাপদে" যোগ করা, ফলে গুণকের উপর গুণক চেপে ১০-২০ গুণ বেশি খরচ।',
      fix: "প্রতিটা গুণক (peak, utilization, N+1, AZ, growth) আলাদা লাইনে কারণসহ লিখুন; একই ঝুঁকি দুবার গুনবেন না।",
    },
    {
      mistake:
        "শুধু QPS দেখা, concurrency না দেখা: WebSocket বা ধীর downstream-এ thread আর connection আগে ফুরায়।",
      fix: "Little's Law (L = λ × W) দিয়ে in-flight request, connection pool আর খোলা connection-এর সংখ্যা আলাদা করে হিসাব করুন।",
    },
  ],

  lab: [
    {
      title: "প্রস্তুতি: একটা estimation script",
      markdown: `এই lab-এ দুটো কাজ: একটা ছোট Python script দিয়ে পুরো estimate বানাবেন আর assumption বদলে দেখবেন উত্তর কিভাবে নড়ে; তারপর একটা আসল container-এর req/s মেপে সেই সংখ্যা script-এ বসিয়ে server-এর সংখ্যা বের করবেন।

একটা ফাঁকা folder-এ \`estimate.py\` বানান (শুধু Python 3 লাগবে, কোনো library না):

\`\`\`python
import math
import sys

# ---- ধারণা (assumption): এগুলো বদলে দেখুন ----
DAU = 10_000_000             # দৈনিক active user
REQ_PER_USER = 20            # প্রতি user দিনে কয়টা request
WRITE_SHARE = 0.10           # request-এর কত ভাগ write
PEAK_FACTOR = 5              # peak, গড়ের কত গুণ
ROW_BYTES = 1_000            # প্রতি write-এ কত byte data জমে
INDEX_OVERHEAD = 0.5         # index-এর জন্য বাড়তি (0.5 = ৫০%)
REPLICAS = 3                 # কয়টা কপি
RESPONSE_BYTES = 20_000      # গড় response-এর আকার
HOT_WINDOW_DAYS = 30         # শেষ কত দিনের data বেশি পড়া হয়
HOT_SHARE = 0.20             # তার কত ভাগ "গরম" (cache-এ রাখব)
SERVER_RPS = float(sys.argv[1]) if len(sys.argv) > 1 else 500  # load test-এ মাপা
TARGET_UTIL = 0.6            # প্রতি server সর্বোচ্চ কত ভাগ ব্যস্ত রাখব
SPARE = 1                    # N+1

SECONDS_PER_DAY = 86_400


def human(n_bytes):
    for unit in ["B", "KB", "MB", "GB", "TB", "PB"]:
        if n_bytes < 1000:
            return f"{n_bytes:,.1f} {unit}"
        n_bytes /= 1000
    return f"{n_bytes:,.1f} EB"


req_per_day = DAU * REQ_PER_USER
avg_qps = req_per_day / SECONDS_PER_DAY
peak_qps = avg_qps * PEAK_FACTOR
peak_write_qps = peak_qps * WRITE_SHARE

writes_per_day = req_per_day * WRITE_SHARE
raw_per_day = writes_per_day * ROW_BYTES
per_year = raw_per_day * 365 * (1 + INDEX_OVERHEAD) * REPLICAS

egress = peak_qps * RESPONSE_BYTES  # byte/s
cache = raw_per_day * HOT_WINDOW_DAYS * HOT_SHARE

per_server = SERVER_RPS * TARGET_UTIL
needed = math.ceil(peak_qps / per_server)

print(f"দিনে request         : {req_per_day:,.0f}")
print(f"গড় QPS               : {avg_qps:,.0f}  (মাথায়: ÷10^5 = {req_per_day / 1e5:,.0f})")
print(f"Peak QPS             : {peak_qps:,.0f}  (write {peak_write_qps:,.0f}/s)")
print(f"নতুন data/দিন (raw)   : {human(raw_per_day)}")
print(f"এক বছরে (index+কপি)  : {human(per_year)}")
print(f"Peak egress          : {human(egress)}/s = {egress * 8 / 1e9:,.1f} Gbps")
print(f"Cache (৩০ দিনের ২০%)  : {human(cache)}")
print(f"Server: {peak_qps:,.0f} ÷ ({SERVER_RPS:,.0f} × {TARGET_UTIL}) = {needed} + {SPARE} বাড়তি = {needed + SPARE}টা")
\`\`\`

চালান:

\`\`\`bash
python3 estimate.py
\`\`\`

(Python না থাকলে: \`docker run --rm -v "$PWD":/w -w /w python:3.12-alpine python estimate.py\`)

এরকম আসবে:

\`\`\`
দিনে request         : 200,000,000
গড় QPS               : 2,315  (মাথায়: ÷10^5 = 2,000)
Peak QPS             : 11,574  (write 1,157/s)
নতুন data/দিন (raw)   : 20.0 GB
এক বছরে (index+কপি)  : 32.9 TB
Peak egress          : 231.5 MB/s = 1.9 Gbps
Cache (৩০ দিনের ২০%)  : 120.0 GB
Server: 11,574 ÷ (500 × 0.6) = 39 + 1 বাড়তি = 40টা
\`\`\`

খেয়াল করুন দ্বিতীয় লাইন: ৮৬,৪০০-এর বদলে 10⁵ দিয়ে ভাগ করলে ২,০০০, আসল ২,৩১৫। মাথার হিসাব ~১৪% **কম** বলে, কারণ আমরা সেকেন্ড বেশি ধরেছি। তাই মাথায় হিসাব করলে অন্য জায়গায় একটু উপরের দিকে গোল করুন।`,
    },
    {
      title: "পরীক্ষা ১: assumption নাড়িয়ে দেখুন কোনটা উত্তর বদলায়",
      markdown: `একটা করে সংখ্যা বদলান, চালান, আগের সাথে মেলান:

1. \`PEAK_FACTOR = 10\` করুন। Server প্রায় দ্বিগুণ (৭৮টা), কিন্তু storage একটুও বদলায় না। Peak শুধু হার-নির্ভর জিনিস (server, bandwidth) বদলায়, জমা জিনিস (storage) না।
2. \`REPLICAS = 1\` আর \`INDEX_OVERHEAD = 0\` করুন। বছরের storage ৩২.৯TB থেকে ৭.৩TB। "raw data দেখে disk কেনা" কতটা ভুল, এই এক লাইনে।
3. \`RESPONSE_BYTES = 200_000\` (ছবি সহ response) করুন। Egress ~১৮.৫ Gbps! এটাই কারণ ছবি CDN-এ যায়।
4. \`DAU\`-কে ১০ গুণ করুন। সব কিছু ১০ গুণ। Linear হিসাবে এটাই প্রত্যাশিত, কিন্তু বাস্তবে database-এর ক্ষেত্রে ১০ গুণ load মানে প্রায়ই নতুন architecture (sharding)।

সবচেয়ে গুরুত্বপূর্ণ শিক্ষা: যে assumption বদলালে উত্তর সবচেয়ে বেশি নড়ে, সেটাই যাচাই করার জন্য সবচেয়ে বেশি সময় দিন।`,
    },
    {
      title: "পরীক্ষা ২: একটা container-এর আসল req/s মাপুন",
      markdown: `এবার "SERVER_RPS = 500" অনুমান না করে মাপব। একই folder-এ \`app.py\`, প্রতিটা request-এ একটু CPU-র কাজ করে:

\`\`\`python
import socket
from http.server import BaseHTTPRequestHandler, HTTPServer


def busy_work():
    # প্রতিটা request-এ একটু CPU-র কাজ (JSON বানানো, template ইত্যাদির ভান)
    total = 0
    for i in range(200_000):
        total += i * i
    return total


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        busy_work()
        body = f"ok from {socket.gethostname()}\\n".encode()
        self.send_response(200)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass


class Server(HTTPServer):
    request_queue_size = 256


print("listening on :8000", flush=True)
Server(("0.0.0.0", 8000), Handler).serve_forever()
\`\`\`

একটা network আর ঠিক ১টা CPU-র একটা container চালান:

\`\`\`bash
docker network create sdlab-day019-net
docker run -d --name sdlab-day019-app --network sdlab-day019-net \\
  --cpus 1 -p 8191:8000 \\
  -v "$PWD/app.py:/app.py:ro" python:3.12-alpine python /app.py
curl localhost:8191/
\`\`\`

\`ok from <container id>\` আসবে। এবার **hey** দিয়ে ১০ সেকেন্ড ধরে load, তিনটা ভিন্ন concurrency-তে (\`-c\` মানে একসাথে কয়টা request):

\`\`\`bash
for c in 1 4 16; do
  echo "=== c=$c"
  docker run --rm --platform linux/amd64 --network sdlab-day019-net \\
    williamyeh/hey -z 10s -c $c http://sdlab-day019-app:8000/ \\
    | grep -E "Requests/sec|Average|99%"
done
\`\`\`

(\`williamyeh/hey\` image শুধু amd64-এর জন্য, তাই \`--platform linux/amd64\`; Apple Silicon Mac-এ emulation-এ চলে।)

আমাদের machine-এ এরকম এলো (আপনার সংখ্যা machine অনুযায়ী আলাদা হবে, ধরনটা একই থাকবে):

\`\`\`
c=1   Requests/sec: 123.6   Average: 0.0081 secs   99% in 0.0177 secs
c=4   Requests/sec: 134.5   Average: 0.0297 secs   99% in 0.0411 secs
c=16  Requests/sec: 132.3   Average: 0.1201 secs   99% in 0.1598 secs
\`\`\`

পড়ুন:
- c=4 থেকে c=16: req/s **একই** (~১৩০), কিন্তু p99 ৪১ms থেকে ১৬০ms। এটাই knee। বাড়তি concurrency শুধু লাইন লম্বা করছে।
- **Little's Law যাচাই:** c=16-এ req/s × গড় latency = ১৩২ × ০.১২ ≈ **১৬**। c=4-এ ১৩৪ × ০.০৩ ≈ **৪**। সূত্রটা মিলে গেল।
- এই app-এর capacity: **~১৩০ req/s**, p99 ৫০ms-এর নিচে রেখে (c=4-এর সারি)।`,
    },
    {
      title: "পরীক্ষা ৩: মাপা সংখ্যা থেকে server-এর সংখ্যা",
      markdown: `মাপা capacity script-কে argument হিসেবে দিন:

\`\`\`bash
python3 estimate.py 130
\`\`\`

শেষ লাইন:

\`\`\`
Server: 11,574 ÷ (130 × 0.6) = 149 + 1 বাড়তি = 150টা
\`\`\`

অনুমানের ৫০০ req/s-এ ছিল ৪০টা, মাপা ১৩০-এ ১৫০টা। প্রায় চার গুণ পার্থক্য, শুধু একটা সংখ্যা মাপার কারণে। এখন ভাবুন:
- এই app single-process, একটা core-এর বেশি কাজে লাগায় না। প্রতি container-এ একাধিক process চালালে capacity বাড়বে, server কমবে ([Day 13](${topicHrefForDay(13)})-এর lab)।
- \`TARGET_UTIL\` ০.৮ করলে server কমে, কিন্তু উপরের utilization চার্ট মনে রাখুন: p99 কী হবে?
- ৩টা AZ-এ ছড়িয়ে একটা AZ হারালেও চলতে হলে কয়টা? (১৪৯-কে ২টা AZ-এ ভাগ: প্রতিটায় ৭৫, মোট ২২৫।)

**পরিষ্কার করুন:**

\`\`\`bash
docker rm -f sdlab-day019-app
docker network rm sdlab-day019-net
\`\`\``,
    },
  ],

  connections: {
    markdown: `- **[Day 5](${topicHrefForDay(5)}) · Scalability**: সেখানে প্রথম estimate করেছিলাম (DAU → QPS, storage, bandwidth)। আজ সেটাকে ছয় ধাপের পদ্ধতিতে বাঁধলাম, আর index, replication, cache, egress আর খরচ যোগ করলাম।
- **[Day 7](${topicHrefForDay(7)}) · Latency vs Throughput**: Latency-র সিঁড়ি আর Little's Law সেখান থেকে। আজ Little's Law দিয়ে connection pool, thread আর WebSocket connection গুনলাম।
- **[Day 11](${topicHrefForDay(11)}) · CDN**: Egress-এর হিসাব বলে দেয় কখন CDN ছাড়া চলবে না, আর CDN hit ratio origin-এর bandwidth কতটা কমায়।
- **[Day 13](${topicHrefForDay(13)}) · Vertical vs Horizontal Scaling**: N+1-এর সূত্র আর AZ-এর হিসাব সেখান থেকে; আজ সেগুলো load test-এর সংখ্যা আর utilization-এর queue অঙ্কের সাথে জুড়লাম।
- **[Day 17](${topicHrefForDay(17)}) · Caching**: Hit ratio-র প্রতিটা শতাংশ database-এর চাপ কতটা বদলায়, আজ সংখ্যায় দেখলাম।

সামনে যা আসছে: [Day 22](${topicHrefForDay(22)})-এ Database Indexes (index-এর জায়গা আর write-এর দাম), [Day 23](${topicHrefForDay(23)})-এ Storage Engines (LSM-এর write amplification), [Day 28](${topicHrefForDay(28)})-এ Replication, [Day 29](${topicHrefForDay(29)})-এ Sharding, [Day 35](${topicHrefForDay(35)})-এ Geo-spatial Indexing, [Day 87](${topicHrefForDay(87)})-এ Autoscaling, আর [Day 116](${topicHrefForDay(116)})-এ System Design Interview-এর ৭ ধাপ, যেখানে estimation দ্বিতীয় ধাপ।`,
  },

  explainYourself: [
    {
      question:
        'আপনার teammate বলছে, "estimate করে লাভ কী, সংখ্যাগুলো তো সব আন্দাজ।" আপনি কী বলবেন?',
      idealAnswer:
        'Estimation-এর লক্ষ্য নিখুঁত সংখ্যা না, ঠিক মাত্রা (order of magnitude)। ১০০ QPS আর ১ লাখ QPS সম্পূর্ণ আলাদা architecture, আর আন্দাজ ±৫০% ভুল হলেও সেটা ঠিক ঘরেই পড়ে। তাছাড়া assumption লিখে রাখলে দ্বিমত হলে কোন সংখ্যাটা বদলাতে হবে বোঝা যায়, আর কোন assumption-এ উত্তর সবচেয়ে বেশি নড়ে সেটা জেনে সেটাই আগে যাচাই করা যায়। "হাটবাজার" দেখিয়েছে, হিসাব না করলে bottleneck (database, disk) আগে থেকে চোখেই পড়ে না।',
    },
    {
      question:
        "একটা ride app-এ ১ লাখ driver প্রতি ৪ সেকেন্ডে location পাঠায়। কেন এই data-র আকার না, হার-ই আসল সমস্যা, আর design-এ সেটা কী বদলায়?",
      idealAnswer:
        "হার ১ লাখ ÷ ৪ = ২৫,০০০ write/s, কিন্তু প্রতিটা ~১০০ byte, তাই bandwidth মাত্র ~২০ Mbps আর সবার সর্বশেষ location মাত্র ~১০MB, memory-তে আরামে আঁটে। সমস্যা হলো প্রতিটা update একটা indexed SQL table-এ লিখলে ২৫,০০০ random write/s, আর প্রতিটা আবার index আর replica-তে গুণ হয়। তাই সর্বশেষ অবস্থান memory-তে (যেমন Redis geo), আর history একটা log-এ জমিয়ে batch করে সস্তা storage-এ লেখা হয়।",
    },
    {
      question:
        "Load test-এ একটা server ৮০০ req/s পর্যন্ত গেল, তখন CPU ১০০% আর p99 ২ সেকেন্ড। ৬০০ req/s-এ p99 ছিল ১২০ms। Capacity হিসেবে কোন সংখ্যা নেবেন, আর peak ১২,০০০ হলে কয়টা server?",
      idealAnswer:
        "Capacity ধরব ৬০০ req/s, কারণ সেখানে p99 এখনো লক্ষ্যের মধ্যে; ৮০০ হলো ভাঙনের বিন্দু, সেখানে request লাইনে দাঁড়াচ্ছে। তারপর target utilization ধরি ৬০-৭০%: ৬০০ × ০.৬ = ৩৬০, ১২,০০০ ÷ ৩৬০ ≈ ৩৩.৩, মানে ৩৪টা, N+1-এ ৩৫টা। AZ হারানো সহ্য করতে হলে আরও বাড়বে (৩ AZ-এ ~১.৫ গুণ)।",
    },
  ],

  interviewQuestions: [
    {
      question:
        "একটা photo sharing app: ৫ কোটি DAU, প্রতি user দিনে গড়ে ০.২টা ছবি upload আর ৫০টা ছবি দেখে। Estimate করুন।",
      answerOutline: `- Assumption বলুন: ছবি ~৫০০KB (বিভিন্ন আকারের কপি সহ ~১MB), read:write ~২৫০:১, peak factor ~৩
- Upload: ৫ কোটি × ০.২ = ১ কোটি/দিন → ÷10⁵ ≈ ১০০/s গড়, ~৩০০/s peak
- View: ৫ কোটি × ৫০ = ২৫০ কোটি/দিন → ~২৫,০০০/s গড়, ~৭৫,০০০/s peak
- Storage: 10⁷ × ১MB = ১০TB/দিন → ~৩.৬PB/বছর, × replication (বা erasure coding ~১.৫ গুণ)
- Egress: ২৫০ কোটি × ধরি ২০০KB (thumbnail/মাঝারি) = ৫০০TB/দিন → CDN বাধ্যতামূলক, খরচের মূল অংশ
- Metadata DB: ছোট, কিন্তু view counter/feed-এর read বিশাল → cache
- শেষে বলুন কোন assumption সবচেয়ে সংবেদনশীল (ছবির আকার, view/user)`,
    },
    {
      question:
        "Peak 30,000 QPS। কয়টা server লাগবে, আর সংখ্যাটা কিভাবে defend করবেন?",
      answerOutline: `- প্রতি server-এর capacity মাপতে হবে load test-এ, p99 লক্ষ্যের শর্তে (ধরি 1,000 QPS)
- Target utilization কেন (queue: R = S/(1−ρ), ৯০%-এ latency ১০ গুণ) → ৬০% → 600
- 30,000 ÷ 600 = 50 → N+1/N+2
- Failure domain: ৩ AZ-এ একটা হারালে ৫০ লাগবে বাকি ২টায় → ৭৫
- Growth আর জানা ঘটনা (sale) → pre-scale; autoscaling বাকিটা
- প্রতিটা গুণক কারণসহ, দ্বিগুণ গোনা নয়`,
    },
    {
      question: "আপনার database-এর জন্য কত disk লাগবে, কিভাবে হিসাব করবেন?",
      answerOutline: `- Row-এর সংখ্যা (এখন + growth × retention) × row-এর আকার (column গুনে, overhead সহ)
- Index overhead: প্রতিটা index আলাদা জায়গা নেয়, প্রায়ই data-র ৫০-১০০%+
- Replication factor (primary + replica), backup আর WAL-এর জায়গা
- Disk ৬০-৭০%-এর বেশি ভরানো যাবে না (compaction, vacuum, migration)
- Write amplification: IOPS-এর হিসাব আলাদা — row × index × replica
- Sanity check: প্রতি user বা প্রতি row-এ byte উল্টো দিক থেকে মেলান`,
    },
    {
      question:
        "Little's Law দিয়ে একটা connection pool-এর আকার কিভাবে ঠিক করবেন? একটা উদাহরণ দিন।",
      answerOutline: `- L = λ × W: প্রতি সেকেন্ডে কয়টা query × প্রতিটা connection কতক্ষণ ধরে রাখে
- উদাহরণ: 2,000 query/s × 20ms = 40টা connection গড়ে ব্যস্ত; burst-এ ×২ → 80
- ১০টা app server-এ ভাগ: প্রতিটায় ~8-10
- বড় pool-এর বিপদ: database-এ হাজার connection, memory আর context switch
- Downstream ধীর হলে W বাড়ে, L ফুরায় → timeout, circuit breaker`,
    },
    {
      question: "Estimation-এ সবচেয়ে সাধারণ ভুলগুলো কী, আর কিভাবে ধরবেন?",
      answerOutline: `- Bit বনাম byte (৮ গুণ), KB 1000 বনাম 1024 (TB-তে ~১০%, সাধারণত উপেক্ষা করা যায়)
- গড় দিয়ে design, peak ভুলে যাওয়া
- Index, replication, backup ভুলে যাওয়া
- মিথ্যা নির্ভুলতা; এক-দুই digit-এ গোল করুন
- Sanity check: উল্টো দিক থেকে প্রতি user-এ কত, পরিচিত machine-এর সীমার সাথে তুলনা, আসল metrics থাকলে মিলিয়ে দেখা`,
    },
  ],

  summary: {
    points: [
      "Capacity Estimation-এর লক্ষ্য order of magnitude: সংখ্যা গোল করুন, assumption লিখে রাখুন।",
      "Toolkit: 2¹⁰ ≈ 10³, দিনে ৮৬,৪০০ ≈ 10⁵ সেকেন্ড (দিনে ১০ লাখ ≈ ১২/s), ১ byte = ৮ bit, read:write, peak factor।",
      "ছয় ধাপ: assumption → traffic → storage → bandwidth → cache → server, প্রতি ধাপে sanity check।",
      "Storage-এ সবসময় × index overhead × replication factor, আর disk পুরো ভরানো যায় না।",
      "Server = peak ÷ (মাপা capacity × target utilization) + N+1; capacity মাপুন load test-এ, p99-এর শর্তে।",
      "Little's Law (L = λ × W) দিয়ে thread, connection pool আর খোলা connection গুনুন।",
      "View-heavy app-এ egress-ই বিল ঠিক করে; CDN আর erasure coding বড় খরচ কমায়।",
    ],
    diagram: {
      id: "day-019-summary",
      caption: "এক নজরে Capacity Estimation",
      alt: "ছয়টা ছোট ধাপ: Assumptions, QPS, Storage, Bandwidth, Cache, Servers; নিচে তিনটা মূল সংখ্যা: 86,400 ≈ 10^5, 1 byte = 8 bit, 2^10 ≈ 10^3।",
    },
  },
};
