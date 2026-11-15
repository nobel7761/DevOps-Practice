// Day 5 · Scalability — Phase 1 introduction (Day 13 goes deeper into vertical vs horizontal).

import { topicHrefForDay } from "@/lib/data/courses/system-design-a-z";
import type { SdLesson } from "@/lib/system-design/lesson.types";

const day = topicHrefForDay;

export const day005Lesson: SdLesson = {
  topicId: "sd-day-005",
  day: 5,
  title: "Scalability",
  definition:
    "Scalability হলো load বাড়লে resource যোগ করে system-কে বাড়িয়ে নেওয়ার ক্ষমতা, যাতে performance গ্রহণযোগ্য থাকে আর খরচ load-এর সাথে যুক্তিসঙ্গত হারে বাড়ে।",

  objectives: [
    "Scalability আর performance-এর পার্থক্য, আর load parameter (request/s, read:write ratio, concurrent user, data size) দিয়ে 'load' মাপা, উদাহরণ দিয়ে ব্যাখ্যা করতে পারবেন।",
    "DAU থেকে গড় আর peak QPS, দৈনিক ও বাৎসরিক storage, আর bandwidth-এর মোটা দাগের হিসাব নিজে করতে পারবেন।",
    "একটা system প্রথমে কোথায় ভাঙে (CPU, memory, disk, network, database, lock) খুঁজে বের করে, বাড়তি server আসলে সাহায্য করবে কিনা যুক্তি দিয়ে বলতে পারবেন।",
    "Amdahl's law দিয়ে বাড়তি server-এর বাস্তব লাভ হিসাব করতে পারবেন, আর কেন write scale করা read-এর চেয়ে কঠিন বুঝিয়ে বলতে পারবেন।",
    "Scaling-এর হাতিয়ারগুলো (stateless server, load balancer, cache, CDN, replica, sharding, queue) কোন সমস্যার জন্য, আর scalability বনাম elasticity, এক নজরে চিনতে পারবেন।",
  ],

  prerequisites: [
    { day: 1, title: "সিস্টেম ডিজাইন আসলে কী?", href: day(1) },
    { day: 2, title: "Client, Server ও Internet", href: day(2) },
    { day: 4, title: "API কী? REST-এর বেসিক", href: day(4) },
  ],

  problem: {
    markdown: `তানিয়া আর তার ভাই "ঘরের বাজার" নামে একটা grocery app চালায়। চাল, ডাল, তেল, মাছ অর্ডার করলে দুই ঘণ্টায় বাসায়। পুরো system একটা ভাড়া করা server-এ: Node.js app আর PostgreSQL database একই machine-এ। দিনে দুই-তিন হাজার user, সব মসৃণ। Page খোলে ২০০ms-এ।

তারপর এলো ঈদের আগের সপ্তাহ। একটা ভালো offer আর এক influencer-এর video, এক সন্ধ্যায় user এলো স্বাভাবিকের প্রায় ৫০ গুণ।

যা যা ঘটল, ক্রমে:

1. **প্রথমে সব ধীর।** Page খুলতে ২০০ms থেকে ৮ সেকেন্ড। কোনো error নেই, শুধু অপেক্ষা। CPU ১০০%-এ আটকে আছে।
2. **তারপর timeout।** Request লাইনে দাঁড়িয়ে থাকতে থাকতে browser হাল ছেড়ে দিচ্ছে। User "Order করুন" আবার চাপছে, তাতে load আরও বাড়ছে।
3. **Database-এর connection শেষ।** App প্রতিটা request-এ নতুন connection চাইছে, database-এর সীমা পার হয়ে গেছে, নতুন request সরাসরি error পাচ্ছে।
4. **শেষে server-ই বন্ধ।** Memory শেষ হয়ে process মারা গেল। পুরো app অচল, ঠিক বছরের সবচেয়ে বেশি বিক্রির সন্ধ্যায়।

তানিয়া code-এ কোনো bug খুঁজে পেল না। ৫০ জনের জন্য যে code নিখুঁত, ৫০ গুণ মানুষের জন্য সেটাই ভেঙে পড়ল। ভাই বলল, "বড় server কিনে ফেলি।" কিন্তু কত বড়? আর পরের ঈদে ২০০ গুণ হলে? আর ওই একটা machine মরলে?

এই প্রশ্নগুলোর নামই **Scalability**: load বাড়লে system-কে কিভাবে বাড়াবেন, কোথায় আগে ভাঙবে, আর কত খরচে।`,
    diagrams: [
      {
        id: "day-005-before",
        caption:
          "আগে: সব user একটা machine-এ, যেখানে app আর database একসাথে; ভিড় এলে CPU ১০০%, request timeout।",
        alt: "তিন ধরনের user (mobile, web, sale-এর ভিড়) একটা server-এ request পাঠাচ্ছে; server লাল দাগে ব্যর্থ দেখানো, সেখান থেকে local disk-এ লাল তীর, লেখা CPU 100% আর timeout।",
      },
    ],
  },

  analogy: {
    markdown: `বইমেলায় একটা ফুচকার stall-এর কথা ভাবুন। প্রথম দিন ভিড় কম, একজন মামা একা সামলাচ্ছেন: ফুচকা ভাঙা, আলু ভরা, টক জল দেওয়া, টাকা নেওয়া।

শুক্রবার বিকেলে ভিড় দশ গুণ। মামার হাত দুটো, গতি বাড়ানোর একটা সীমা আছে। লাইন লম্বা হয়, ৪০ মিনিট অপেক্ষা, মানুষ বিরক্ত হয়ে চলে যায়। এটাই **একটা server-এর সীমা**।

মালিকের সামনে দুটো পথ:
- **আরও দক্ষ একজন মামা আনা**, যার হাত দ্বিগুণ দ্রুত (বড় machine, **vertical scaling**)। কাজ হয়, কিন্তু এমন মানুষ পাওয়া কঠিন, দামি, আর তিনি অসুস্থ হলে stall বন্ধ।
- **আরও দুটো counter খোলা** (বেশি machine, **horizontal scaling**), আর সামনে একজন দাঁড় করানো যিনি নতুন customer-কে খালি counter দেখিয়ে দেন (**load balancer**)।

দ্বিতীয় পথে একটা শর্ত আছে: যে কোনো counter থেকে যে কেউ ফুচকা নিতে পারবে, অর্থাৎ কোনো counter "শুধু আমার পরিচিত customer" মনে রাখবে না (**stateless**)।

কিন্তু তিনটা counter চালু হতেই নতুন সমস্যা: **টক জলের হাঁড়ি একটাই**। তিন মামাই একই হাঁড়ি থেকে নিচ্ছেন, হাঁড়ির কাছে ধাক্কাধাক্কি। Counter দশটা করলেও হাঁড়ির সামনে লাইন। এই shared হাঁড়িটাই software-এর **shared database**, আর এটাই সাধারণত পরের **bottleneck**।

Scalability-র পুরো গল্প এটাই: একটা bottleneck সরান, পরেরটা সামনে আসে।`,
    diagrams: [
      {
        id: "day-005-analogy",
        caption:
          "বইমেলার ফুচকা stall: একটা counter-এ লম্বা লাইন; তিনটা counter আর একজন লাইন ভাগ করা মানুষ, কিন্তু সবার একটাই টক-জলের হাঁড়ি।",
        alt: "বামে একটা counter আর সাতজন মানুষের লম্বা লাইন। ডানে একজন মানুষ (load balancer) তিনটা counter-এ লাইন ভাগ করছেন, তিনটা counter থেকে ড্যাশ দেওয়া তীর একটা হাঁড়িতে, যার নিচে লেখা shared Database, পরের bottleneck।",
      },
    ],
  },

  coreConcept: {
    markdown: `**Scalability** মানে load বাড়লে resource যোগ করে system-কে বাড়ানো যায় কিনা, পুরোটা নতুন করে না লিখে, আর তাতে performance গ্রহণযোগ্য থাকে কিনা, খরচও যুক্তিসঙ্গত থাকে কিনা।

**Scalability বনাম performance।** দুটো এক জিনিস না:
- **Performance**: একজন user-এর জন্য system কত দ্রুত। একটা request ১০০ms-এ শেষ হয়।
- **Scalability**: user ১০০ থেকে ১০ লাখ হলে সেই ১০০ms টিকে থাকে কিনা, আর টিকিয়ে রাখতে কত resource লাগে।

একটা system দ্রুত কিন্তু scale করে না (এক machine-এ দারুণ চলে, কিন্তু দ্বিতীয় machine যোগ করার উপায় নেই) হতে পারে। আবার উল্টোটাও: প্রতিটা request ধীর, কিন্তু server যোগ করলে ঠিক ততটাই বেশি request সামলায়। Performance-এর সমস্যা হলে একজন user-ও কষ্ট পায়; scalability-র সমস্যা হলে শুধু ভিড়ে কষ্ট পায়।

**"Load" মাপবেন কী দিয়ে? (load parameters)** "অনেক user" কোনো সংখ্যা না। Load বোঝাতে আপনার system-এর জন্য যে সংখ্যাগুলো আসল, সেগুলো বলুন:
- **Requests per second (QPS/RPS)**: সেকেন্ডে কয়টা request, গড়ে আর peak-এ
- **Read:write ratio**: ১০০টা request-এর কয়টা পড়া আর কয়টা লেখা। Product দেখা (read) বনাম order দেওয়া (write)। ৯৫:৫ আর ৫০:৫০ সম্পূর্ণ আলাদা design চায়।
- **Concurrent users / connections**: একই মুহূর্তে কতজন যুক্ত। Chat app-এ লাখ লাখ খোলা connection, কিন্তু প্রতিটায় কম কাজ।
- **Data size**: database কত বড়, কত দ্রুত বাড়ছে। ১GB আর ১০TB-তে একই query-র আচরণ আলাদা।
- **Geography**: user কি এক শহরে, নাকি পুরো পৃথিবীতে।

**প্রথমে কোথায় ভাঙে?** প্রতিটা machine-এর কয়েকটা সীমিত resource আছে, আর load বাড়লে যেটা আগে ফুরায়, সেটাই আপনার **bottleneck** (বোতলের সরু মুখ, যেখান দিয়ে সবকিছু ধীরে বের হয়):
- **CPU**: হিসাব, JSON বানানো, encryption। ১০০% হলে request লাইনে দাঁড়ায়।
- **Memory (RAM)**: বেশি connection, বড় cache। শেষ হলে swap-এ গিয়ে খুব ধীর, বা process মারা যায়।
- **Disk I/O**: database-এর read/write, log লেখা। Disk-এর সেকেন্ডে কত operation (IOPS) করার সীমা আছে।
- **Network**: bandwidth, খোলা connection-এর সংখ্যা।
- **Database**: সবার shared, তাই সবচেয়ে প্রচলিত bottleneck: connection limit, ধীর query, lock।
- **একটা lock**: একটা জিনিস যেটা একবারে একজনই ব্যবহার করতে পারে, যেমন একটা product-এর stock-এর row। Server যতই থাকুক, সবাই এখানে লাইনে।

**দুই ধরনের scaling (শুধু পরিচিতি):**
- **Vertical scaling (scale up)**: একটা machine-কে বড় করা: বেশি CPU, RAM, দ্রুত disk। Code বদলাতে হয় না, কিন্তু একটা ছাদ আছে, দাম লাফিয়ে বাড়ে, আর machine একটাই।
- **Horizontal scaling (scale out)**: একই রকম অনেক machine যোগ করা। তাত্ত্বিকভাবে সীমা অনেক দূরে, একটা মরলেও বাকিরা চলে, কিন্তু design-কে এর জন্য তৈরি থাকতে হয়।

এখন এটুকু জানলেই চলবে, [Day 13](${day(13)})-এ গভীরে যাব।

**Scaling-এর হাতিয়ার: একটা মানচিত্র।** প্রতিটা হাতিয়ার একটা নির্দিষ্ট চাপ কমায়। মূল diagram-এ দেখুন কোনটা কোথায় বসে:
- **Stateless app server** ([Day 14](${day(14)})): session-এর মতো state server-এর memory-তে না রেখে বাইরে (Redis/DB) রাখা, যাতে যে কোনো server যে কোনো request নিতে পারে। Horizontal scaling-এর পূর্বশর্ত।
- **Load balancer** ([Day 9](${day(9)})): request-গুলো server-দের মধ্যে ভাগ করে, মরা server বাদ দেয়।
- **Caching** ([Day 17](${day(17)})): বারবার পড়া data memory-তে, যাতে database পর্যন্ত যেতেই না হয়।
- **CDN** ([Day 11](${day(11)})): ছবি, video, JS-এর মতো static জিনিস user-এর কাছের server থেকে।
- **Read replica** ([Day 28](${day(28)})): database-এর কপি, যেগুলো থেকে read হয়; primary শুধু write সামলায়।
- **Sharding** ([Day 29](${day(29)})): data ভাগ করে কয়েকটা database-এ রাখা, যখন write বা data size একটা machine-এ আর ধরে না।
- **Queue দিয়ে async কাজ** ([Day 12](${day(12)})): email, PDF, resize-এর মতো ধীর কাজ request-এর বাইরে পাঠানো, আর spike শোষণ করা।

প্রতিটা হাতিয়ারের একটা দাম আছে: নতুন component, নতুন ভাঙার জায়গা, data পুরনো (stale) হওয়ার সম্ভাবনা। তাই আগে মাপুন bottleneck কোথায়, তারপর শুধু সেটার হাতিয়ার আনুন।

**Scalability বনাম elasticity।** Scalability হলো ক্ষমতা: server যোগ করলে system বাড়ে কিনা। **Elasticity** হলো সেই ক্ষমতা স্বয়ংক্রিয়ভাবে আর দ্রুত ব্যবহার করা: সন্ধ্যার ভিড়ে মিনিটের মধ্যে server বাড়ে, রাত ৩টায় কমে যায় (**auto-scaling**, [Day 87](${day(87)}))। Elasticity scalability ছাড়া সম্ভব না: architecture-ই যদি দ্বিতীয় server নিতে না পারে, auto-scaler কিছু করতে পারবে না। আবার scalable কিন্তু elastic না এমন system খুব সাধারণ: নতুন server যোগ করা যায়, কিন্তু হাতে করতে এক সপ্তাহ লাগে।

**খরচ।** ভালোভাবে scale করা system-এ user দ্বিগুণ হলে খরচ মোটামুটি দ্বিগুণ বা তার কম হয়, **প্রতি user-এর খরচ** স্থির থাকে বা কমে। খারাপ design-এ খরচ load-এর চেয়ে দ্রুত বাড়ে: সবচেয়ে বড় machine-এর দাম ছোটগুলোর তুলনায় অনেক বেশি, আর আটকে থাকা bottleneck-এর কারণে দশটা server কিনে পাঁচটার কাজ পাওয়া যায়। আর আছে মানুষের খরচ: প্রতিটা নতুন component চালানো, monitor করা, রাত ২টায় ঠিক করা।`,
    diagrams: [
      {
        id: "day-005-main",
        caption:
          "পরে: scale করা একটা web app; প্রতিটা হাতিয়ার একটা চাপ কমায়, আর পাশে লেখা কোন Day-এ বিস্তারিত।",
        alt: "Users থেকে CDN-এ ছবি আর Load Balancer-এ API request; Load Balancer তিনটা stateless App server-এ ভাগ করে; App server থেকে Cache, Primary DB (write), Read Replica (read) আর Queue-তে তীর; Primary থেকে Replica-তে copy; Queue থেকে Workers।",
        downloadable: true,
      },
      {
        id: "day-005-before-after",
        caption:
          "পাশাপাশি: এক machine-এ সব বনাম scale করা design; শেষেও write একটা primary-তে, সেটাই পরের সীমা।",
        alt: "উপরে আগের design: তিন ধরনের user একটা ব্যর্থ server-এ। নিচে পরের design: Load Balancer, তিনটা App server, Cache, Primary DB, Read Replica, Queue আর Workers।",
      },
    ],
  },

  deepDive: [
    {
      title: "খাতা-কলমের হিসাব: DAU থেকে peak QPS, storage আর bandwidth",
      markdown: `[Day 1](${day(1)})-এ এক ঝলক দেখেছিলাম, আজ পুরো একটা হিসাব হাতে-কলমে করি। লক্ষ্য নিখুঁত সংখ্যা না, **মাত্রা** (১০ নাকি ১,০০০ নাকি ১,০০,০০০)। "ঘরের বাজার" বড় হয়েছে, ধরি:

- **DAU (Daily Active Users)**: ২০ লাখ
- প্রতি user দিনে গড়ে **২৫টা** API request
- Read:write = **৯৫:৫**
- **Peak factor ৫**: সন্ধ্যা ৭-১০টায় আর ঈদের আগে load গড়ের ৫ গুণ

**১. গড় QPS**
- দিনে মোট request: ২০ লাখ × ২৫ = **৫ কোটি**
- একদিনে সেকেন্ড: ৮৬,৪০০ (মাথায় হিসাবের জন্য ≈ ১০⁵)
- গড় QPS = ৫,০০,০০,০০০ ÷ ৮৬,৪০০ ≈ **৫৮০**, মোটা দাগে ~৬০০

**২. Peak QPS**
- ৬০০ × ৫ = **~৩,০০০ QPS**
- এর ৯৫% read ≈ ২,৮৫০/s, ৫% write ≈ **১৫০/s**

Design সবসময় peak-এর জন্য, গড়ের জন্য না। গড় দেখে server কিনলে ঠিক সেই সন্ধ্যায় ভাঙবে, যখন সবচেয়ে বেশি বিক্রি হয়।

**৩. কয়টা app server?** Load test করে দেখলেন একটা app server আপনার কাঙ্ক্ষিত latency রেখে ~৩০০ QPS সামলায়। তাহলে ৩,০০০ ÷ ৩০০ = ১০টা। কিন্তু server-কে ১০০%-এ চালানো বিপজ্জনক (পরের অংশে দেখব কেন latency তখন লাফ দেয়), তাই ~৬০-৭০%-এ রাখার লক্ষ্যে **১৫টা**, আর একটা-দুটো মরলেও যেন চলে।

**৪. Storage**
- দিনে ৫০,০০০ order × ~২KB = ১০০MB/দিন, বছরে ~৩৬GB। এটা কিছুই না।
- কিন্তু দিনে ২০,০০০ review, প্রতিটায় ~৫০০KB-এর একটা ছবি: ১০GB/দিন, বছরে ≈ **৩.৬৫TB**। Durability-র জন্য ৩টা কপি রাখলে ~১১TB।
- শিক্ষা: database নিয়ে চিন্তা নেই, ছবির জন্য object storage আর CDN লাগবে। হিসাবটাই বলে দিল কোথায় মনোযোগ দিতে হবে।

**৫. Bandwidth**
- Peak-এ ৩,০০০ QPS × গড় response ~৪০KB = ১২০MB/s
- Bit-এ: ১২০ × ৮ ≈ **~১ Gbps**। এর বড় অংশ ছবি, যেটা CDN-এ সরালে origin server-এর bandwidth অনেক কমে।

একটা সতর্কতা: MB/s (byte) আর Mbps (bit) গুলিয়ে ফেলা খুব প্রচলিত ভুল, পার্থক্য ৮ গুণ। এই হিসাবের পুরো কৌশল আর মুখস্থ রাখার মতো সংখ্যাগুলো [Day 19](${day(19)})-এ।`,
    },
    {
      title: "১০০ থেকে ১০ লাখ user: প্রতিটা ধাপে কোন bottleneck",
      markdown: `Scaling এক লাফে হয় না। প্রতিটা ধাপে একটা জিনিস প্রথমে ফুরায়, সেটা সরালে পরেরটা সামনে আসে। নিচের StepThrough-এ একটা startup-এর গল্প, প্রতিটা ধাপে আনুমানিক peak QPS সহ (প্রতি user দিনে ~২০ request, peak factor ৫):

- **১০০ user**: সেকেন্ডে একটা request-ও না। একটা VPS-এ সব। এখানে "scale" করা মানে সময় নষ্ট।
- **১০ হাজার user (~১০ QPS peak)**: Database আলাদা machine-এ, app-এর machine একটু বড়। প্রথম আসল bottleneck প্রায়ই একটা **index ছাড়া query**, যার সমাধান নতুন server না, index ([Day 22](${day(22)}))।
- **১ লাখ user (~১০০ QPS)**: CPU আর single point of failure। Load balancer, একাধিক stateless app server, session Redis-এ।
- **৫ লাখ user (~৬০০ QPS)**: সব app server একটা database-কে প্রশ্ন করছে। Cache, read replica, CDN।
- **১০ লাখ user (~১,২০০ QPS)**: ধীর কাজ queue-তে। বাকি থাকে write, একটা primary-তে।

খেয়াল করুন, ১০ লাখ user মানেও মাত্র কয়েক হাজার QPS-এর ঘরে। ভালোভাবে লেখা একটা stack এটা কয়েকটা machine-এই সামলায়। তাই "আমাদের microservice আর Kubernetes লাগবে" বলার আগে হিসাব করুন।`,
      diagrams: [
        {
          id: "day-005-growth",
          caption:
            "ধাপে ধাপে: ১০০ থেকে ১০ লাখ user; মোটা দাগে নতুন component, লাল ড্যাশ দাগে সেই ধাপের bottleneck।",
          alt: "পাঁচ ধাপের architecture diagram: এক VPS থেকে শুরু করে আলাদা DB, তারপর Load Balancer ও একাধিক App server ও Redis, তারপর CDN ও Read Replica, শেষে Queue ও Worker; প্রতিটা ধাপে user সংখ্যা আর peak request/s লেখা।",
        },
      ],
    },
    {
      title: "Amdahl's law: serial অংশটাই সর্বোচ্চ লাভ ঠিক করে দেয়",
      markdown: `ধরুন একটা কাজের কিছু অংশ ভাগ করে অনেক machine-এ একসাথে চালানো যায় (parallel), আর কিছু অংশ একবারে একজনকেই করতে হয় (serial)। **Amdahl's law** (Gene Amdahl, ১৯৬৭) বলে, N গুণ resource দিলে কাজ কত গুণ দ্রুত হবে:

\`\`\`
Speed-up(N) = 1 / ( (1 − p) + p / N )

p = যে অংশ parallel করা যায়
N = machine (বা core) সংখ্যা
\`\`\`

**হিসাব করি।** একটা রাতের report job-এর ৯৫% parallel করা যায় (p = 0.95), ৫% serial (শেষে সব যোগ করা):
- N = 10: 1 / (0.05 + 0.095) = 1 / 0.145 ≈ **৬.৯ গুণ**, ১০ গুণ না
- N = 100: 1 / (0.05 + 0.0095) ≈ **১৬.৮ গুণ**
- N = ∞: 1 / 0.05 = **২০ গুণ**, এর বেশি কখনো না

মাত্র ৫% serial কাজ, অথচ হাজার machine দিলেও ২০ গুণের বেশি পাবেন না। p = 0.9 হলে সীমা ১০ গুণ, p = 0.5 হলে মাত্র ২ গুণ।

**Web system-এ এর মানে।** প্রতিটা request-এ app server-এর কাজ parallel: ১০টা server, ১০টা request একসাথে। কিন্তু সবাই যদি একটা জায়গায় একবারে একজন করে ঢোকে (একটা lock, একটা single-threaded database, একটা shared counter), সেটাই serial অংশ। নিচের lab-এ ঠিক এটাই মাপবেন: প্রতি request-এ একটা "database" ২০ms ধরে একা কাজ করে। তাহলে app server যতই যোগ করুন, সর্বোচ্চ ১ ÷ ০.০২০s = **৫০ request/s**।

তাই scaling-এর প্রথম প্রশ্ন "কয়টা server যোগ করব?" না, প্রশ্ন হলো **"serial অংশটা কোথায়, আর সেটা কিভাবে ছোট করব?"**`,
      diagrams: [
        {
          id: "day-005-scaling-curve",
          caption:
            "Server বাড়লে throughput কত বাড়ে: আদর্শ রেখা, ৫% serial কাজে Amdahl-এর ছাদ (২০ গুণ), আর coordination খরচে একসময় নিচে নামা।",
          alt: "Line chart। X অক্ষে server ১ থেকে ৩২, Y অক্ষে throughput ১ server-এর তুলনায় কত গুণ। ড্যাশ দেওয়া আদর্শ রেখা সোজা উপরে ১৬ গুণ পর্যন্ত; Amdahl রেখা ধীরে বাঁকে, ৩২ server-এ প্রায় সাড়ে ১২ গুণ; coordination খরচের রেখা ১৪ server-এর কাছে প্রায় সাড়ে ৫ গুণে চূড়ায় উঠে আবার নামে।",
        },
      ],
    },
    {
      title: "Database কেন প্রথম bottleneck, আর write কেন read-এর চেয়ে কঠিন",
      markdown: `App server সাধারণত stateless, তাই কপি বানানো সহজ: নতুন একটা চালু করলেই হলো। Database **stateful**: data সেখানেই থাকে, আর সব app server একই data চায়। তাই app server বাড়ালে সব চাপ গিয়ে পড়ে একটা database-এ। প্রথম যে লক্ষণগুলো দেখা যায়: connection শেষ (প্রতিটা app server-এর pool মিলিয়ে database-এর সীমা পার), ধীর query, disk I/O আর lock-এর অপেক্ষা।

**Read scale করা তুলনামূলক সহজ।** একই data-র কপি যত খুশি বানানো যায়, আর প্রতিটা কপি read সামলাতে পারে:
- **Cache**: সবচেয়ে বেশি পড়া জিনিস memory-তে ([Day 17](${day(17)}))
- **Read replica**: database-এর পুরো কপি, শুধু read-এর জন্য ([Day 28](${day(28)}))
- **CDN**: static জিনিস user-এর কাছে

দাম: কপি সামান্য পুরনো হতে পারে (replication lag)। "Order দিলাম, কিন্তু 'আমার order'-এ দেখাচ্ছে না" ধরনের সমস্যা এখান থেকেই।

**Write scale করা কঠিন, কারণ:**
1. **কপি write কমায় না, বাড়ায়।** প্রতিটা write প্রতিটা কপিতে পৌঁছাতে হয়। ৫টা replica মানে একটা write পাঁচ জায়গায়।
2. **একটা সত্যের উৎস লাগে।** "Stock-এ ৩টা আছে, দুজন একসাথে ২টা করে কিনছে" বা "এই email দিয়ে আগে account আছে কিনা", এই সিদ্ধান্তগুলো এক জায়গায় না হলে দুজনই সফল হবে, stock মাইনাসে যাবে। তাই সাধারণত সব write একটা **primary**-তে যায়।
3. **ভাগ করার দাম বড়।** Write ভাগ করার উপায় **sharding**: user ১-১০ লাখ এক database-এ, বাকিরা আরেকটায় ([Day 29](${day(29)}))। কিন্তু তখন দুই shard জুড়ে join আর transaction কঠিন, data আবার ভাগ করা (resharding) কষ্টসাধ্য, আর ভুল key বাছলে একটা shard-এ সব চাপ (hot shard)।

তাই বাস্তব ক্রম সাধারণত: আগে query আর index ঠিক করুন, তারপর বড় database machine (vertical), cache আর replica দিয়ে read সরান, queue দিয়ে write-এর spike সমান করুন, আর sharding রাখুন শেষ উপায় হিসেবে।`,
    },
    {
      title: "Coordination-এর দাম: shared state, lock আর contention",
      markdown: `Amdahl বলে serial অংশ লাভের ছাদ ঠিক করে। বাস্তবে আরও খারাপ হতে পারে: server বাড়ালে throughput **কমে**।

**Contention (একই জিনিসের জন্য লাইন)।** Flash sale-এ একটা জনপ্রিয় ফোন, সবাই একই stock row update করছে। প্রতিটা update row-টাকে ৫ms lock রাখলে, ওই একটা product-এর জন্য সর্বোচ্চ ১ ÷ ০.০০৫ = **২০০ order/s**, server ১০টা হোক বা ১০০টা। বাকি সবাই lock-এর অপেক্ষায়, connection ধরে বসে আছে, ফলে অন্য product-এর order-ও ধীর।

**Coherency (একে অপরের সাথে মিলিয়ে নেওয়া)।** N টা node যদি প্রত্যেকে প্রত্যেকের সাথে state মেলায় (যেমন সব server-এর memory-তে একই cache রাখা, প্রতিটা বদল সবাইকে জানানো), তাহলে যোগাযোগের জোড়া N × (N − 1)। ৪টা server-এ ১২টা, ৪০টায় ১,৫৬০টা। একসময় server-রা কাজের চেয়ে একে অপরকে খবর দিতেই বেশি ব্যস্ত।

Neil Gunther-এর **Universal Scalability Law (USL)** এই দুটো খরচকে Amdahl-এর সাথে যোগ করে একটা model দেয়। মূল কথা শুধু এটুকু মনে রাখুন: contention throughput-কে একটা ছাদে আটকায়, আর coherency খরচ একসময় curve-কে **নিচে নামিয়ে আনে** (retrograde)। উপরের chart-এর লাল রেখা এটাই দেখায়।

**কী করবেন:**
- **Shared state কমান**: server stateless রাখুন, যাতে তাদের মধ্যে মেলানোর কিছু না থাকে
- **Critical section ছোট করুন**: lock-এর ভেতরে শুধু যতটুকু না হলেই না, network call বা ধীর কাজ বাইরে
- **Hot জিনিস ভাগ করুন**: একটা stock counter-এর বদলে ১০টা ছোট counter (প্রতিটায় ১০% stock), বা update queue-তে পাঠিয়ে একজন worker দিয়ে ক্রমে লেখা
- **Lock-এর ধরন বুঝে বাছুন**: optimistic বনাম pessimistic ([Day 27](${day(27)}))`,
    },
    {
      title: "Scalability মাপা: load test আর latency-র 'knee'",
      markdown: `"আমাদের system scalable" দাবি মাপা ছাড়া অর্থহীন। মাপার উপায় **load testing**: একটা tool দিয়ে কৃত্রিম user পাঠানো, ধাপে ধাপে বাড়ানো, আর প্রতিটা ধাপে দুটো সংখ্যা লেখা: **throughput** (সফল request/s) আর **latency**।

Load বাড়ালে একটা পরিচিত আকার দেখবেন:
- শুরুতে load বাড়ে, throughput-ও সমানতালে বাড়ে, latency প্রায় একই।
- Capacity-র কাছাকাছি (প্রায়ই ৭০-৮০%-এর পরে) request লাইনে দাঁড়াতে শুরু করে। Throughput আর বাড়ে না, কিন্তু latency খাড়া উপরে ওঠে। এই বাঁকটাই **knee**।
- আরও চাপ দিলে timeout আর error, অনেক সময় throughput উল্টো কমে।

তাই server-কে ১০০%-এ চালানোর লক্ষ্য রাখা হয় না, knee-এর আগে রাখা হয়। আগের হিসাবে ৬০-৭০% headroom এই কারণেই।

**Scalability test।** একই test ১, ২, ৪ server দিয়ে চালান। প্রতি server-এ throughput কতটা টিকছে, সেটা মাপুন:

\`\`\`
efficiency = throughput(N) ÷ ( N × throughput(1) )
\`\`\`

১ server-এ ৩০০ QPS, ৪ server-এ ১,০২০ QPS হলে efficiency = ১,০২০ ÷ ১,২০০ = **৮৫%**, ভালো। ৪ server-এ ৪৫০ হলে ৩৭.৫%: কোথাও serial bottleneck আছে, server কেনা বন্ধ করে খুঁজুন।

ভালো load test-এর কয়েকটা নিয়ম:
- **Load generator আলাদা machine-এ** চালান, নইলে tool নিজেই CPU খেয়ে ফল নষ্ট করবে
- **বাস্তবের মতো data** দিয়ে test করুন: ১০০ row-এর database-এ সব query দ্রুত
- **Bottleneck খুঁজতে প্রতিটা resource দেখুন**: Brendan Gregg-এর **USE method** একটা ভালো checklist: প্রতিটা resource-এর Utilization (কত ব্যস্ত), Saturation (কত কাজ লাইনে), Errors
- শুধু গড় না, ধীরতম request-গুলোও দেখুন। Latency percentile (p95, p99) [Day 7](${day(7)})-এ।`,
      diagrams: [
        {
          id: "day-005-latency-knee",
          caption:
            "Load test-এর আকার: capacity-র ~৮০% পর্যন্ত latency প্রায় সমান, তারপর 'knee' পেরিয়ে খাড়া উপরে।",
          alt: "Line chart। X অক্ষে load capacity-র ০ থেকে ১০০ শতাংশ, Y অক্ষে গড় latency ০ থেকে ২০০ms। রেখা প্রায় ১০ms-এ সমান চলে, ৮০%-এ ৫০ms, ৯০%-এ ১০০ms, তারপর খাড়া উপরে; ৮০-১০০% অংশ হালকা লাল রঙে, লেখা knee।",
        },
      ],
    },
  ],

  tradeOffs: {
    markdown: `**কখন scaling নিয়ে ভাববেন:** যখন হিসাব (বা metrics) দেখায় আগামী কয়েক মাসে কোনো resource-এর সীমা আসছে; যখন traffic-এ বড় spike জানা আছে (ঈদ, sale, ভর্তি পরীক্ষার ফল); যখন একটা machine মরলে পুরো business বন্ধ।

**কখন ভাববেন না (এখনই):** ১,০০০ user-এর app-এ sharding, ১০টা microservice আর multi-region। এগুলো জটিলতা, খরচ আর ধীর development আনে, অথচ যে scale-এর জন্য, সেটা হয়তো কখনো আসবে না। তবে দুটো সস্তা অভ্যাস শুরু থেকেই রাখুন: app server stateless লিখুন, আর metrics রাখুন। পরে scale করা তখন অনেক সহজ।

Scaling-এর প্রথম দুই পথ পাশাপাশি (গভীর তুলনা Day 13-এ):`,
    table: {
      headers: ["বিষয়", "Vertical (scale up)", "Horizontal (scale out)"],
      rows: [
        [
          "কী করা হয়",
          "একটা machine-এ বেশি CPU, RAM, দ্রুত disk",
          "একই রকম আরও machine, সামনে load balancer",
        ],
        [
          "Code বদলাতে হয়?",
          "সাধারণত না",
          "হ্যাঁ: stateless server, shared session/cache",
        ],
        [
          "সীমা",
          "সবচেয়ে বড় machine-এর ছাদ",
          "অনেক দূরে, কিন্তু shared database আর coordination-এ আটকায়",
        ],
        [
          "খরচের ধরন",
          "উপরের দিকে দাম লাফিয়ে বাড়ে",
          "মোটামুটি linear, কিন্তু চালানোর জটিলতা বাড়ে",
        ],
        [
          "একটা machine মরলে",
          "পুরো system বন্ধ (single point of failure)",
          "বাকিরা চালায়, ক্ষমতা কিছুটা কমে",
        ],
        [
          "বাড়াতে-কমাতে কত দ্রুত",
          "প্রায়ই restart লাগে, downtime",
          "চলন্ত অবস্থায় যোগ-বাদ, auto-scaling সম্ভব",
        ],
        [
          "কোথায় মানায়",
          "Database, শুরুর দিকের app, সহজ রাখতে চাইলে",
          "Stateless web/API server, worker, বড় আর ওঠানামা করা traffic",
        ],
      ],
    },
  },

  industry: {
    markdown: `- **WhatsApp**: ২০১২ সালের শুরুতে তাদের engineering blog-এ ("1 million is so 2011") লিখেছিল, FreeBSD আর Erlang-এ tune করা একটা server-এ তারা একসাথে **২০ লাখের বেশি TCP connection** ধরে রেখেছে। শিক্ষা: scale out-এর আগে প্রতিটা machine থেকে সর্বোচ্চটা বের করা, খুব ছোট team-এর জন্য খুব কাজের কৌশল।
- **Stack Overflow**: Nick Craver-এর "Stack Overflow: The Architecture" (2016) লেখায় দেখা যায়, বিশাল traffic-এর site হয়েও তারা হাতে গোনা কয়েকটা web server আর অনেক RAM-ওয়ালা বড় SQL Server machine-এ চলত, প্রচুর caching সহ। ইচ্ছা করে **scale up** আর efficient code বেছে নেওয়া, শত শত server-এর বদলে। প্রমাণ যে horizontal-ই একমাত্র পথ না।
- **Instagram**: শুরুর দিকের engineering blog ("What Powers Instagram", "Sharding & IDs at Instagram") অনুযায়ী তারা stateless Django app server load balancer-এর পেছনে রাখত, PostgreSQL-এর সাথে Redis আর Memcached। PostgreSQL shard করার সময় অনেকগুলো **logical shard** বানিয়ে অল্প কয়েকটা physical server-এ রেখেছিল, যাতে পরে shard সরিয়ে নতুন machine-এ নেওয়া সহজ হয়।

জনপ্রিয় tool:
- **Load balancer**: NGINX, HAProxy, cloud load balancer (AWS ELB ইত্যাদি)
- **Cache**: Redis, Memcached
- **Load testing**: hey, wrk, ApacheBench (ab), k6, JMeter, Locust
- **Auto-scaling**: Kubernetes Horizontal Pod Autoscaler, AWS Auto Scaling groups

*উৎস: WhatsApp blog, "1 million is so 2011" (জানুয়ারি ২০১২); Nick Craver, "Stack Overflow: The Architecture - 2016 Edition" (nickcraver.com); Instagram Engineering, "What Powers Instagram: Hundreds of Instances, Dozens of Technologies" ও "Sharding & IDs at Instagram"; Gene Amdahl, AFIPS Conference (১৯৬৭); Neil Gunther-এর Universal Scalability Law; Brendan Gregg, "The USE Method"।*`,
  },

  mistakes: [
    {
      mistake:
        "গড় QPS দেখে capacity ঠিক করা। ঠিক peak-এর সন্ধ্যায়, যখন বিক্রি সবচেয়ে বেশি, system ভাঙে।",
      fix: "Peak factor (প্রায়ই গড়ের ৩-১০ গুণ) ধরে হিসাব করুন, আর server-কে knee-এর আগে (~৬০-৭০%) রাখার মতো headroom রাখুন।",
    },
    {
      mistake:
        "Bottleneck না মেপেই app server যোগ করা। আসল সমস্যা database-এর ধীর query বা একটা lock, তাই নতুন server শুধু খরচ বাড়ায়, আর database-এ আরও চাপ দেয়।",
      fix: "আগে প্রতিটা resource-এর utilization আর saturation দেখুন (CPU, memory, disk, network, DB connection, lock wait), তারপর সেই bottleneck-এর হাতিয়ার আনুন।",
    },
    {
      mistake:
        "Session বা upload করা file app server-এর memory/local disk-এ রাখা, তারপর load balancer-এর পেছনে দ্বিতীয় server যোগ করা। User হঠাৎ logout হয়ে যায়, ছবি 'হারায়'।",
      fix: "Server stateless রাখুন: session Redis/DB-তে, file object storage-এ। তাহলে যে কোনো server যে কোনো request নিতে পারে।",
    },
    {
      mistake:
        "Scalability আর performance গুলিয়ে ফেলা: এক user-এর জন্য ৫০ms মানেই 'scalable' ধরে নেওয়া।",
      fix: "Load বাড়িয়ে test করুন, আর ১, ২, ৪ server-এ throughput মেপে efficiency দেখুন।",
    },
    {
      mistake:
        "শুরু থেকেই 'Google-এর মতো' design: ১,০০০ user-এর app-এ sharding, microservice, multi-region।",
      fix: "সরল design দিয়ে শুরু করুন, হিসাব আর metrics দেখে যেখানে সত্যিই সীমা আসছে শুধু সেখানে component যোগ করুন। তবে stateless server আর metrics শুরু থেকেই রাখুন।",
    },
    {
      mistake:
        "App server বাড়ানোর সময় database connection-এর হিসাব ভুলে যাওয়া। ২০টা server × ৫০ connection-এর pool = ১,০০০ connection, database-এর সীমা পার।",
      fix: "মোট connection = server সংখ্যা × pool size হিসাব করুন; pool ছোট রাখুন, দরকারে connection pooler (যেমন PgBouncer) ব্যবহার করুন।",
    },
  ],

  lab: [
    {
      title: "প্রস্তুতি: একটা app, একটা 'database', একটা load balancer",
      markdown: `এই lab-এ Docker Compose দিয়ে একটা ছোট stateless app চালাবেন, \`--scale\` দিয়ে কপি বাড়াবেন, আর নিজের চোখে দেখবেন (১) server যোগ করলে throughput বাড়ে, আর (২) একটা shared serial অংশ থাকলে আর বাড়ে না। Docker ছাড়া আর কিছু লাগবে না।

একটা ফাঁকা folder-এ চারটা file বানান। প্রথমটা \`app.py\`: প্রতিটা request-এ একটু CPU-র কাজ করে, আর \`/order\` path-এ একটা shared "database"-কে call করে:

\`\`\`python
import os
import socket
import urllib.request
from http.server import BaseHTTPRequestHandler, HTTPServer

DB_URL = os.environ.get("DB_URL", "http://db:9000/")


def busy_work():
    # প্রতিটা request-এ একটু CPU-র কাজ (হিসাব), যেমন template render বা JSON বানানো
    total = 0
    for i in range(200_000):
        total += i * i
    return total


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        busy_work()
        if self.path.startswith("/order"):
            # সবার একটাই shared database
            urllib.request.urlopen(DB_URL).read()
        body = f"served by {socket.gethostname()}\\n".encode()
        self.send_response(200)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass


class Server(HTTPServer):
    request_queue_size = 256


print("app listening on :8000", flush=True)
Server(("0.0.0.0", 8000), Handler).serve_forever()
\`\`\`

\`db.py\`: একটা ভান-করা database, যেটা একবারে একটাই write নেয় (যেন একটা lock), প্রতিটায় ২০ms:

\`\`\`python
import time
from http.server import BaseHTTPRequestHandler, HTTPServer


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        time.sleep(0.02)  # একটা write: একবারে একটাই (lock), ২০ms
        self.send_response(200)
        self.send_header("Content-Length", "3")
        self.end_headers()
        self.wfile.write(b"ok\\n")

    def log_message(self, *args):
        pass


class Server(HTTPServer):
    request_queue_size = 256


print("db listening on :9000", flush=True)
Server(("0.0.0.0", 9000), Handler).serve_forever()
\`\`\`

\`nginx.conf\`:

\`\`\`nginx
events {}

http {
  upstream app {
    server app:8000;
  }

  server {
    listen 80;
    location / {
      proxy_pass http://app;
    }
  }
}
\`\`\`

\`compose.yaml\`। প্রতিটা app কপিকে আধা CPU core দেওয়া হলো (\`cpus: 0.5\`), যাতে আপনার laptop-এ যতগুলো core-ই থাকুক, একটা কপির সীমা স্পষ্ট দেখা যায়:

\`\`\`yaml
name: sdlab-day005

services:
  app:
    image: python:3.12-alpine
    command: python /app.py
    volumes:
      - ./app.py:/app.py:ro
    cpus: 0.5

  db:
    image: python:3.12-alpine
    command: python /db.py
    volumes:
      - ./db.py:/db.py:ro

  lb:
    image: nginx:1.27-alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    ports:
      - "8085:80"
    depends_on:
      - app
\`\`\`

চালু করুন আর একবার দেখে নিন:

\`\`\`bash
docker compose up -d
curl localhost:8085/
\`\`\`

\`served by <container id>\` দেখবেন।`,
    },
    {
      title: "পরীক্ষা ১: একটা কপি, কতটা পারে?",
      markdown: `Load দেব **hey** দিয়ে, Compose-এর network-এর ভেতর থেকে। ১০ সেকেন্ড ধরে একসাথে ২০টা request:

\`\`\`bash
docker run --rm --platform linux/amd64 --network sdlab-day005_default \\
  williamyeh/hey -z 10s -c 20 http://lb/
\`\`\`

(\`williamyeh/hey\` image শুধু amd64-এর জন্য, তাই \`--platform\` দেওয়া। Apple Silicon Mac-এ emulation-এ চলে, কোনো সমস্যা নেই।)

Output-এ দেখুন **Requests/sec** আর **Average**। আমাদের machine-এ এসেছিল প্রায় **৬০-৭০ req/s** আর গড় latency প্রায় **৩০০ms**। আপনার সংখ্যা machine অনুযায়ী আলাদা হবে, পরের পরীক্ষাগুলোতে তুলনাটাই আসল।

Test চলার সময় আরেকটা terminal-এ:

\`\`\`bash
docker stats --no-stream
\`\`\`

\`sdlab-day005-app-1\`-এর **CPU %** প্রায় **৫০%**, মানে তার আধা core-এর পুরোটাই খরচ হচ্ছে। Bottleneck খুঁজে পেলাম: **CPU**।`,
    },
    {
      title: "পরীক্ষা ২: তিনটা কপি (horizontal scaling)",
      markdown: `\`\`\`bash
docker compose up -d --scale app=3
for i in 1 2 3 4 5 6; do curl -s localhost:8085/; done
\`\`\`

অবাক করা ব্যাপার: ৬টা উত্তরই সম্ভবত **একই container id** থেকে! Nginx \`app\` নামটা শুধু চালু হওয়ার সময় একবার DNS থেকে খুঁজে মনে রাখে, আর তখন নতুন কপিগুলো DNS-এ ছিল না। নতুন server যোগ করলে load balancer-কে সেটা জানাতে হয় (এটাই service discovery-র সমস্যা, পরে আসবে)। আপাতত nginx restart করুন:

\`\`\`bash
docker compose restart lb
for i in 1 2 3 4 5 6; do curl -s localhost:8085/; done
\`\`\`

এবার তিনটা আলাদা id পালা করে আসবে। (তখনও একটাই id দেখলে কয়েক সেকেন্ড অপেক্ষা করে আবার \`docker compose restart lb\` দিন; নতুন container DNS-এ আসতে একটু সময় নিতে পারে।) আবার load দিন:

\`\`\`bash
docker run --rm --platform linux/amd64 --network sdlab-day005_default \\
  williamyeh/hey -z 10s -c 20 http://lb/
\`\`\`

Requests/sec প্রায় **৩ গুণ** (আমাদের ক্ষেত্রে ~২০০), গড় latency প্রায় এক-তৃতীয়াংশ (~১০০ms)। Code একটুও বদলায়নি। এটা সম্ভব হলো কারণ app **stateless**: কোনো কপি কিছু মনে রাখে না, তাই যে কেউ যে কোনো request নিতে পারে। \`docker stats --no-stream\` চালালে দেখবেন তিনটা কপিই ~৫০% CPU-তে।`,
    },
    {
      title: "পরীক্ষা ৩: shared database-এ ধাক্কা (Amdahl নিজের চোখে)",
      markdown: `এবার \`/order\` path, যেটা প্রতিটা request-এ shared \`db\`-কে call করে:

\`\`\`bash
docker run --rm --platform linux/amd64 --network sdlab-day005_default \\
  williamyeh/hey -z 10s -c 20 http://lb/order
\`\`\`

তিনটা app কপি থাকা সত্ত্বেও মাত্র **~৪৫ req/s**। আরও কপি দিয়ে দেখি:

\`\`\`bash
docker compose up -d --scale app=6
docker compose restart lb
for i in 1 2 3 4 5 6; do curl -s localhost:8085/; done
docker run --rm --platform linux/amd64 --network sdlab-day005_default \\
  williamyeh/hey -z 10s -c 20 http://lb/order
\`\`\`

ছয়টা কপিতেও **~৪৫ req/s**, এক চুলও বাড়েনি। (তুলনা: \`/\` path-এ ছয় কপিতে ~৩০০+ req/s পাওয়া যায়।)

Load চলার সময় \`docker stats --no-stream\` দেখুন: app কপিগুলো এখন মাত্র ~৭% CPU-তে বসে আছে, আর \`db\`-এর CPU **প্রায় ১%**! Database ব্যস্ত দেখাচ্ছে না, অথচ সেটাই bottleneck, কারণ সে একবারে একটাই request নেয় (lock), আর বাকিরা লাইনে। **সব bottleneck CPU graph-এ ধরা পড়ে না।**

হিসাব মিলিয়ে নিন: db প্রতিটা request-এ ২০ms একা কাজ করে, তাই সর্বোচ্চ ১ ÷ ০.০২০ = **৫০ req/s**। App server যতই যোগ করুন, এই serial অংশটাই ছাদ। এটাই Amdahl's law। সমাধান app server না: db-এর কাজ ছোট করা, cache, read replica, বা data ভাগ করা।`,
    },
    {
      title: "পরিষ্কার করুন",
      markdown: `\`\`\`bash
docker compose down
\`\`\`

এটা সব container আর \`sdlab-day005_default\` network মুছে দেবে। Image-গুলোও মুছতে চাইলে:

\`\`\`bash
docker rmi williamyeh/hey python:3.12-alpine nginx:1.27-alpine
\`\`\`

চাইলে আরও খেলুন: \`db.py\`-তে sleep ০.০০৫ করে (৫ms) আবার \`/order\` test করুন। ছাদ কত হওয়া উচিত, আগে হিসাব করে তারপর মিলিয়ে দেখুন।`,
    },
  ],

  connections: {
    markdown: `- **[Day 1](${day(1)}) · সিস্টেম ডিজাইন আসলে কী?**: সেখানে scalability ছিল সাতটা quality-র একটা, আর খাতা-কলমের হিসাবের প্রথম ঝলক। আজ সেই হিসাব পুরোটা করলাম, আর দেখলাম scale করতে গেলে কোথায় কোথায় আটকায়।
- **[Day 2](${day(2)}) · Client, Server ও Internet**: একটা server একসাথে অনেক client সামলায়, কিন্তু তার CPU, RAM, network সীমিত। আজকের প্রশ্ন ছিল ঠিক সেখান থেকে: client আরও বাড়লে কী?
- **[Day 4](${day(4)}) · API কী? REST-এর বেসিক**: REST-এর stateless নিয়ম (প্রতিটা request নিজের মধ্যে সম্পূর্ণ) এখন দেখা গেল কেন এত মূল্যবান: এর জন্যই যে কোনো server যে কোনো request নিতে পারে, আর horizontal scaling সম্ভব হয়। আর GET-এর মতো safe request সহজে cache হয়।

সামনে যা আসছে: [Day 6](${day(6)})-এ Availability (একটা machine মরলে কী), [Day 7](${day(7)})-এ Latency vs Throughput আর percentile, [Day 9](${day(9)})-এ Load Balancer, [Day 13](${day(13)})-এ Vertical vs Horizontal Scaling গভীরে, [Day 14](${day(14)})-এ Stateful vs Stateless, [Day 17](${day(17)})-এ Caching, [Day 19](${day(19)})-এ Capacity Estimation, [Day 28](${day(28)})-এ Replication, [Day 29](${day(29)})-এ Sharding, আর [Day 87](${day(87)})-এ Autoscaling।`,
  },

  explainYourself: [
    {
      question:
        'আপনার manager বলছেন, "site ধীর, আরও ১০টা server কিনে ফেলো।" কেনার আগে আপনি কী কী জানতে চাইবেন, আর কেন?',
      idealAnswer:
        "আগে জানতে চাইব bottleneck কোথায়: app server-এর CPU কি সত্যিই ভরা, নাকি database-এর ধীর query, connection শেষ, disk I/O, বা কোনো lock-এ সবাই অপেক্ষা করছে। App server stateless কিনা, নইলে নতুন server যোগ করা যাবে না। যদি সমস্যা shared database বা একটা serial অংশে হয়, তাহলে Amdahl-এর মতো সেটাই ছাদ, নতুন server শুধু খরচ বাড়াবে আর database-এ আরও connection চাপাবে। তাই আগে metrics আর একটা load test, তারপর শুধু সেই bottleneck-এর সমাধান।",
    },
    {
      question:
        "Scalability আর elasticity কি এক জিনিস? এমন একটা system-এর উদাহরণ দিন যেটা scalable কিন্তু elastic না।",
      idealAnswer:
        "না। Scalability মানে resource যোগ করলে system বাড়তি load নিতে পারে কিনা; elasticity মানে load অনুযায়ী resource স্বয়ংক্রিয়ভাবে আর দ্রুত যোগ-বাদ হয় কিনা। যেমন একটা stateless web app, যেটা load balancer-এর পেছনে ২০টা server পর্যন্ত সুন্দর বাড়ে, কিন্তু নতুন server বসাতে হলে কাউকে হাতে machine কিনে configure করতে হয়, এক সপ্তাহ লাগে। Scalable, কিন্তু elastic না। Elasticity scalable architecture-এর উপর auto-scaling বসিয়ে পাওয়া যায়।",
    },
    {
      question:
        "Read replica যোগ করে কেন write-এর চাপ কমানো যায় না? Write scale করতে হলে আসলে কী করতে হয়?",
      idealAnswer:
        "Replica হলো একই data-র কপি; প্রতিটা write প্রতিটা কপিতেই লিখতে হয়, তাই replica বাড়লে write-এর কাজ কমে না বরং বাড়ে। আর stock বা unique email-এর মতো সিদ্ধান্তের জন্য একটা সত্যের উৎস (primary) লাগে। Write scale করতে হলে প্রথমে query, index আর বড় machine; তারপর queue দিয়ে spike সমান করা বা batch করা; আর শেষে sharding, অর্থাৎ data ভাগ করে আলাদা database-এ রাখা, যাতে প্রতিটা shard শুধু নিজের অংশের write নেয়। তার দাম: shard জুড়ে join/transaction কঠিন আর hot shard-এর ঝুঁকি।",
    },
  ],

  interviewQuestions: [
    {
      question:
        "একটা app-এ ১ কোটি DAU, প্রতি user দিনে ১০টা request। Peak QPS কত ধরবেন, আর কয়টা server লাগবে কিভাবে ঠিক করবেন?",
      answerOutline: `- দিনে ১০ কোটি request ÷ ৮৬,৪০০ ≈ ১,১৬০ গড় QPS (মোটা দাগে ~১,২০০)
- Peak factor বলুন আর কারণ দিন (যেমন ৩-৫ গুণ): ~৩,৫০০-৬,০০০ QPS
- Read:write ratio জিজ্ঞেস করুন, কারণ design ঠিক করে
- প্রতি server-এর ক্ষমতা load test করে মাপুন (ধরা যাক ৫০০ QPS), knee-এর আগে ৬০-৭০% utilization-এ রাখুন
- Failure-এর জন্য N+1 বা N+2; সংখ্যা বলুন, কিন্তু ধারণাগুলো স্পষ্ট করে বলুন`,
    },
    {
      question: "Scalability আর performance-এর পার্থক্য কী?",
      answerOutline: `- Performance: এক user বা এক request-এর জন্য কত দ্রুত
- Scalability: load বাড়লে resource যোগ করে সেই performance রাখা যায় কিনা, কত খরচে
- উদাহরণ: এক machine-এ দ্রুত কিন্তু দ্বিতীয় machine নিতে পারে না (stateful) বনাম ধীর কিন্তু linear বাড়ে
- মাপার উপায়: ১, ২, ৪ server-এ throughput আর latency, efficiency`,
    },
    {
      question:
        "আপনি app server ৪ থেকে ১২ করলেন, কিন্তু throughput প্রায় একই থাকল। কিভাবে debug করবেন?",
      answerOutline: `- Serial/shared bottleneck খুঁজুন: database (CPU, slow query log, connection count, lock wait), cache, বাইরের API-র rate limit
- USE method: প্রতিটা resource-এর utilization, saturation, errors
- Load generator নিজেই bottleneck কিনা দেখুন
- Load balancer কি সত্যিই নতুন server-এ পাঠাচ্ছে?
- Amdahl দিয়ে ব্যাখ্যা: serial অংশই ছাদ; app server বাড়ালে DB connection বাড়ে, অবস্থা খারাপও হতে পারে
- সমাধান bottleneck অনুযায়ী: index, cache, replica, critical section ছোট করা, queue`,
    },
    {
      question:
        "Read-heavy আর write-heavy system কিভাবে আলাদাভাবে scale করবেন?",
      answerOutline: `- Read-heavy: cache (hit ratio), CDN, read replica; দাম stale data/replication lag
- Write-heavy: index কম আর ঠিক, batch করা, queue দিয়ে spike সমান, write-optimized storage; শেষে sharding
- কেন write কঠিন: প্রতিটা কপিতে লিখতে হয়, single source of truth, shard জুড়ে transaction
- Partition key বাছাই আর hot key-র ঝুঁকি উল্লেখ করুন`,
    },
    {
      question: "Amdahl's law কী, আর system design-এ এর ব্যবহারিক মানে কী?",
      answerOutline: `- সূত্র: Speed-up = 1 / ((1 − p) + p/N)
- উদাহরণ: p = 0.95 হলে N = 10-এ ~৬.৯ গুণ, সর্বোচ্চ ২০ গুণ
- মানে: serial অংশ (lock, single DB, shared counter) সর্বোচ্চ লাভ ঠিক করে
- আরও খারাপ: contention আর coherency খরচে (USL) throughput কমতেও পারে
- কাজ: serial অংশ খুঁজে ছোট করা, shared state কমানো`,
    },
  ],

  summary: {
    points: [
      "Scalability = load বাড়লে resource যোগ করে performance ধরে রাখা, যুক্তিসঙ্গত খরচে; performance হলো এক user-এর জন্য কত দ্রুত।",
      "Load বলুন সংখ্যায়: peak QPS, read:write ratio, concurrent user, data size। Design সবসময় peak-এর জন্য।",
      "DAU × request ÷ ৮৬,৪০০ = গড় QPS; × peak factor = peak QPS। Storage আর bandwidth-ও একইভাবে, byte বনাম bit খেয়াল করে।",
      "আগে মাপুন bottleneck কোথায় (CPU, memory, disk, network, DB, lock), তারপর শুধু তার হাতিয়ার আনুন।",
      "Vertical = বড় machine (সহজ, ছাদ আছে); horizontal = বেশি machine (stateless লাগে)। গভীরে Day 13-এ।",
      "Amdahl: serial অংশই সর্বোচ্চ লাভ ঠিক করে; contention আর coordination-এ throughput কমতেও পারে।",
      "Database সাধারণত প্রথম bottleneck; read কপি দিয়ে সহজে scale হয়, write কঠিন, শেষ উপায় sharding।",
    ],
    diagram: {
      id: "day-005-summary",
      caption: "এক নজরে Scalability",
      alt: "Users থেকে Load Balancer, সেখান থেকে দুটো App ×N server; একটা থেকে Cache-এ read, আরেকটা থেকে হাইলাইট করা DB-তে write, লেখা প্রথম bottleneck।",
    },
  },
};
