// Day 13 · Vertical vs Horizontal Scaling — Phase 2 deep dive of Day 5's introduction
// (Day 14 goes deeper into stateless servers, Day 28/29 into replication and sharding,
// Day 87 into autoscaling, Day 97 into NUMA).

import { topicHrefForDay } from "@/lib/data/courses/system-design-a-z";
import type { SdLesson } from "@/lib/system-design/lesson.types";

const day = topicHrefForDay;

export const day013Lesson: SdLesson = {
  topicId: "sd-day-013",
  day: 13,
  title: "Vertical vs Horizontal Scaling",
  definition:
    "Vertical scaling মানে একটা machine-কে বড় করা, horizontal scaling মানে একই রকম আরও machine যোগ করা; আসল দক্ষতা হলো কোন tier-এ, কখন, কোনটা।",

  objectives: [
    "Scale up আর scale out-এর প্রতিটার সীমা (hardware-এর ছাদ, বড় machine-এর বাঁকা খরচ, single point of failure, resize-এর downtime বনাম state, network আর coordination-এর দাম) উদাহরণ দিয়ে ব্যাখ্যা করতে পারবেন।",
    "Tier অনুযায়ী সিদ্ধান্ত নিতে পারবেন: stateless app আর worker কেন scale out, database কেন আগে scale up, তারপর replica আর sharding, আর diagonal scaling কী।",
    "প্রতি req/s-এর খরচ, N+1/N+2 সহ কয়টা server লাগবে আর utilization কত রাখবেন, নিজে হিসাব করে দুটো design-এর blast radius তুলনা করতে পারবেন।",
    "বড় machine কেন linear বাড়ে না (single thread, lock, NUMA) আর অসমান server-এর fleet-এ weight কিভাবে ঠিক করবেন, যুক্তি দিয়ে বলতে পারবেন।",
    "Docker-এ --cpus/--memory দিয়ে একটা container scale up আর docker compose --scale দিয়ে scale out করে, throughput আর failure-এর ফল মেপে তুলনা করতে পারবেন।",
  ],

  prerequisites: [
    { day: 5, title: "Scalability", href: day(5) },
    { day: 6, title: "Availability", href: day(6) },
    { day: 9, title: "Load Balancers", href: day(9) },
  ],

  problem: {
    markdown: `"ক্লাসঘর" একটা online coaching platform, ভর্তি পরীক্ষার প্রস্তুতির জন্য। প্রতি শুক্রবার রাত ৯টায় live mock test। পুরো system একটা cloud VM-এ: Node.js app আর PostgreSQL, একই machine-এ।

গত এক বছরে student বেড়েছে, আর team প্রতিবার একই কাজ করেছে: **machine বড় করা**। 2 vCPU থেকে 4, তারপর 8। প্রতিবার রাত ৩টায় VM stop, size বদল, আবার start, পাঁচ মিনিটের downtime। Code-এ হাত দিতে হয়নি, তাই সবাই খুশি।

এই শুক্রবার, মেডিকেল ভর্তি পরীক্ষার আগের শেষ mock test, একসাথে ২০,০০০ student।

1. **৯:০২:** Page খুলতে ১৫ সেকেন্ড। CTO dashboard দেখে বললেন, "machine আবার বড় করো, 32 vCPU।"
2. **৯:০৫:** Resize শুরু। VM stop মানে পুরো site বন্ধ, পরীক্ষার মাঝখানে। ছয় মিনিট পরে ফিরল। হাজার হাজার student-এর উত্তর submit হয়নি।
3. **৯:১২:** Site ফিরল, কিন্তু আগের মতোই ধীর! \`top\` খুলে দেখা গেল: **একটা core 100%, বাকি ৩১টা প্রায় অলস।** Node.js app একটা process-এ চলছে, আর একটা process-এর JavaScript একটাই core ব্যবহার করে। দ্বিগুণ দাম দিয়ে কেনা core-গুলো বসে আছে।

পরের সপ্তাহে একজন junior বলল, "বড় machine না, অনেকগুলো ছোট machine নাও।" চারটা copy চালু হলো, সামনে একটা load balancer। এবার নতুন বিপদ:
- পরীক্ষার timer আর আধা-লেখা উত্তর রাখা ছিল **process-এর memory-তে**। Load balancer পরের request অন্য copy-তে পাঠালে student-এর timer আবার শুরু, উত্তর গায়েব।
- চার copy-ই একই machine-এর database-এ যাচ্ছে, যেটা এখন আরও বেশি connection-এর চাপে।

দুটো সিদ্ধান্তই আধা-সঠিক ছিল। প্রশ্নটা আসলে "বড় না বেশি?" না। প্রশ্ন হলো: **কোন অংশ বড় করব, কোন অংশ বেশি করব, আর প্রতিটার দাম কী?**`,
    diagrams: [
      {
        id: "day-013-before",
        caption:
          "আগে: একটা বিশাল VM-এ app আর database; ৩২টা core-এর মাত্র একটা ব্যস্ত, আর resize মানে পুরো site বন্ধ।",
        alt: "বামে Students, তীর একটা বড় box-এ যার নাম 1 VM · 32 vCPU। Box-এর ভেতরে ৩২টা ছোট ঘর (core), শুধু একটা লাল আর লেখা 100%, বাকিগুলো ধূসর। Box-এর ভেতরে নিচে Node.js (১টা process) আর PostgreSQL। নিচে লাল লেখা: resize = stop → size বদল → start, প্রায় ৬ মিনিট site বন্ধ।",
      },
    ],
  },

  analogy: {
    markdown: `একটা দূরপাল্লার বাস কোম্পানির কথা ভাবুন। ঢাকা-রাজশাহী route-এ যাত্রী বাড়ছে। মালিকের সামনে দুটো পথ।

**পথ ১: আরও বড় বাস (scale up)।** ৪০ সিটের বাস বদলে ৮০ সিটের দোতলা বাস।
- Counter, টিকিট, নিয়ম কিছুই বদলাতে হয় না। সহজ।
- কিন্তু **ছাদ আছে**: রাস্তার ব্রিজ আর টোল gate-এর উচ্চতার চেয়ে বড় বাস চলবে না। ১৬০ সিটের বাস কেউ বানায়ই না।
- **দাম লাফিয়ে বাড়ে**: দোতলা বাসের দাম দুটো সাধারণ বাসের চেয়ে বেশি, আর তার যন্ত্রাংশও বিশেষ।
- **বাস বদলাতে হলে route বন্ধ**: পুরনোটা garage-এ ঢুকিয়ে নতুনটা নামানো পর্যন্ত যাত্রী দাঁড়িয়ে।
- আর বাসটা পথে বিকল হলে **৮০ জনই আটকা**।

**পথ ২: আরও বাস (scale out)।** একই রকম চারটা ৪০ সিটের বাস।
- একটা বিকল হলে বাকি তিনটা চলে। Depot-এ একটা **বাড়তি বাস** রাখলে কেউ টেরই পায় না।
- কিন্তু এখন লাগে একটা **counter** (load balancer), যে যাত্রীদের ফাঁকা বাসে পাঠায়।
- শর্ত: টিকিট **যেকোনো বাসে** চলতে হবে। "শুধু ৩ নম্বর বাসের কন্ডাক্টর আমাকে চেনে" হলে চলবে না (stateless)।
- বাসগুলোর মধ্যে সময়সূচি মেলাতে হয়, ফোনে খবর দিতে হয় (coordination)। বাস যত বেশি, এই কাজও তত বেশি।
- নতুন AC বাস ৪০ সিটের আর পুরনো minibus ২০ সিটের হলে, counter-কে বুঝে পাঠাতে হয়: AC-তে দ্বিগুণ যাত্রী (weighted)।

আর একটা জিনিস ভাগ করা কঠিন: **টিকিট বিক্রির একটাই খাতা**, যেখানে লেখা কোন সিট বিক্রি হয়ে গেছে। চারটা counter চারটা আলাদা খাতা রাখলে একই সিট দুবার বিক্রি হবে। তাই খাতাটা একজন দক্ষ মানুষের হাতেই থাকে, আর তাকে সবচেয়ে ভালো টেবিল-চেয়ার দেওয়া হয়। Software-এ এই খাতাই **database**, আর এ কারণেই database সাধারণত আগে scale up হয়।

বাস্তবে বুদ্ধিমান মালিক দুটোই করেন: প্রথমে বাসগুলো একটু বড় করেন যতক্ষণ সস্তা থাকে, তারপর সংখ্যা বাড়ান। একেই বলে **diagonal scaling**।`,
    diagrams: [
      {
        id: "day-013-analogy",
        caption:
          "বাস কোম্পানি: একটা বিশাল দোতলা বাস (scale up) বনাম counter আর চারটা সাধারণ বাস, depot-এ একটা বাড়তি (scale out); নিচে সবার একটাই টিকিটের খাতা।",
        alt: "বামে একটা বড় দোতলা বাস, উপরে ব্রিজের দাগ, লেখা ছাদ আছে, বিকল হলে ৮০ জন আটকা। ডানে একজন counter-এর মানুষ চারটা সাধারণ বাসে যাত্রী পাঠাচ্ছেন, পাশে ড্যাশ দেওয়া একটা বাড়তি বাস লেখা N+1। নিচে মাঝখানে একটা খাতা, লেখা একটাই টিকিটের খাতা = Database।",
      },
    ],
  },

  coreConcept: {
    markdown: `**এক নজরে recap ([Day 5](${day(5)}) থেকে):** Vertical scaling (scale up) মানে একটা machine-কে বড় করা, horizontal scaling (scale out) মানে আরও machine যোগ করা। প্রথমটা সহজ কিন্তু ছাদ আছে, দ্বিতীয়টার সীমা অনেক দূরে কিন্তু server-কে stateless হতে হয়। Capacity-র হিসাব, Amdahl's law আর ১০০ থেকে ১০ লাখ user-এর গল্প Day 5-এ আছে। আজ যাব আরও গভীরে: কোনটার আসল দাম কী, আর কোন tier-এ কোনটা।

**"বড় করা" মানে আসলে কী বড় করা?** একটা machine-এর চারটা আলাদা resource, আর প্রতিটা আলাদা সমস্যার সমাধান:
- **CPU (core আর clock speed):** হিসাব, JSON, encryption, compression। CPU 90%+ হলে।
- **RAM:** Database-এর বেশিরভাগ data memory-তে রাখা, বড় cache, বেশি connection। RAM কম হলে disk-এ যেতে হয়, আর latency লাফ দেয়।
- **Disk (IOPS আর throughput):** Database-এর read/write, log। সেকেন্ডে কয়টা operation (**IOPS**, input/output operations per second) পারে, তার সীমা আছে।
- **Network (NIC bandwidth):** অনেক data পাঠানো, যেমন video বা বড় file।

তাই "machine বড় করো" বলার আগে জানুন **কোন resource ফুরাচ্ছে।** CPU ভরা অথচ বেশি RAM কিনলেন, টাকা নষ্ট। Cloud provider-রা এজন্যই আলাদা **instance family** রাখে: general purpose (CPU আর RAM সমান অনুপাতে), compute-optimized (প্রতি GB RAM-এ বেশি CPU), memory-optimized (প্রতি core-এ বেশি RAM, database আর cache-এর জন্য), storage-optimized (দ্রুত local disk)। ঠিক family বাছাও এক ধরনের vertical scaling।

**Cloud-এ scale up দেখতে কেমন?** বেশিরভাগ cloud-এ চলন্ত VM-এর size বদলানো যায় না। AWS EC2-তে EBS-backed instance-এর type বদলাতে আগে **stop** করতে হয়, তারপর type বদলে আবার **start**। অর্থাৎ কয়েক মিনিটের downtime। Stop করলে instance-এর local (instance store) disk-এর data মুছে যায়, আর Elastic IP না থাকলে public IP-ও বদলে যায়। "ক্লাসঘর"-এর ছয় মিনিট এখান থেকেই।

**Cloud-এ scale out দেখতে কেমন?** একটা **Auto Scaling group** (বা Kubernetes-এ একটা Deployment-এর replica সংখ্যা): একটা template থেকে একই রকম অনেকগুলো machine, সাথে min, max আর desired সংখ্যা। কোনোটা health check-এ fail করলে group নিজেই সেটা বদলে নতুন চালায়, আর load অনুযায়ী সংখ্যা বাড়াতে-কমাতে পারে। চলন্ত অবস্থায়, কোনো downtime ছাড়া। Autoscaling-এর policy আর warm-up নিয়ে এখন এটুকু জানলেই চলবে, [Day 87](${day(87)})-এ গভীরে যাব।

**কোন tier-এ কোনটা?** মূল diagram-এ দেখুন। নিয়মটা সহজ: **যে অংশ state রাখে না, সেটা scale out; যে অংশ state রাখে, সেটা আগে scale up।**
- **Stateless app/API server → scale out।** কোনো copy কিছু মনে রাখে না, তাই নতুন copy মানেই নতুন ক্ষমতা। Load balancer সামনে ([Day 9](${day(9)}))।
- **Background worker → scale out।** Queue থেকে কাজ টেনে নেয়, worker বাড়ালেই throughput বাড়ে ([Day 12](${day(12)}))।
- **Cache → আগে বড় memory, তারপর cluster।** একটা Redis-এ যতক্ষণ ধরে, ততক্ষণ সহজ; না ধরলে key ভাগ করে কয়েকটা node-এ।
- **Database → আগে scale up, তারপর read replica, শেষে sharding।** কারণ data ভাগ করা মানে join, transaction আর consistency-র দাম ([Day 28](${day(28)})-এ Replication, [Day 29](${day(29)})-এ Sharding)।
- **Load balancer নিজে → জোড়ায়** (active-passive বা active-active), যাতে নিজেই single point of failure না হয় (Day 9)।

**Diagonal scaling:** বাস্তবে প্রায় সবাই দুটো মেশায়। প্রথমে প্রতিটা machine-কে একটা "মিষ্টি জায়গা" পর্যন্ত বড় করুন (যেখানে দাম আর কার্যক্ষমতা দুটোই ভালো), তারপর সেই size-এর machine সংখ্যায় বাড়ান। ১০০টা 1 vCPU-র machine-এর চেয়ে ১২টা 8 vCPU-র machine সাধারণত সস্তা আর সামলানো সহজ, কেন সেটা নিচে হিসাব করে দেখব।

"ক্লাসঘর"-এর ঠিক সমাধান তাই: Node.js-কে প্রতি core-এ একটা process করে চালানো (box-এর ভেতরেই scale out), timer আর উত্তর database বা Redis-এ সরিয়ে app-কে stateless করা ([Day 14](${day(14)})), app-কে মাঝারি আকারের কয়েকটা machine-এ scale out, আর database-কে নিজের আলাদা, memory-ভারী machine-এ scale up।`,
    diagrams: [
      {
        id: "day-013-main",
        caption:
          "পরে: tier অনুযায়ী scaling; stateless app server সংখ্যায় বাড়ে, database বড় machine-এ, read যায় replica-তে।",
        alt: "Students থেকে Load Balancer, সেখান থেকে তিনটা App server (App 1, App 2, App N, লেখা scale out)। App 1 আর App 2 থেকে হাইলাইট করা Primary DB-তে write (লেখা বড় box, scale up), App N থেকে Read Replica-তে read; Primary থেকে Replica-তে ড্যাশ দেওয়া copy তীর।",
        downloadable: true,
      },
      {
        id: "day-013-before-after",
        caption:
          "পাশাপাশি: একটা বিশাল VM-এ সব বনাম tier অনুযায়ী scale; একটা app server পড়লে এখন শুধু তার ভাগটুকু যায়।",
        alt: "উপরে আগের design: একটা 32 vCPU VM-এ app আর database, একটা core লাল। নিচে পরের design: Load Balancer, তিনটা App server, Primary DB আর Read Replica।",
      },
    ],
  },

  deepDive: [
    {
      title: "খরচের বাঁক: প্রতি req/s-এর দাম কোথায় সবচেয়ে কম",
      markdown: `"বড় machine-এর দাম লাফিয়ে বাড়ে", Day 5-এর এই কথাটা একটু সূক্ষ্মভাবে বুঝতে হবে। Cloud-এ একই family-র ভেতরে size দ্বিগুণ করলে **দাম সাধারণত মোটামুটি দ্বিগুণ**, প্রতি vCPU-র দাম প্রায় একই। তাহলে বড় machine দামি কোথায়? তিনটা জায়গায়:

1. **যত vCPU কিনলেন, তত কাজ পান না।** বড় box-এ lock contention, memory bandwidth, single-threaded অংশ (পরের অংশে)। 64 vCPU সাধারণত 8 vCPU-র ৮ গুণ কাজ দেয় না।
2. **সবচেয়ে উপরের দিকের machine আলাদা জাত।** বিশাল memory-র instance, বহু-socket server, on-premise-এ ৪-socket machine: এদের দাম প্রতি core-এ বেশি, আর পাওয়াও কঠিন।
3. **Software license প্রতি core-এ।** কিছু commercial database আর software core গুনে license নেয় (যেমন Microsoft SQL Server-এর core-based licensing, Oracle Database-এর processor licensing)। তখন hardware-এর চেয়ে license-এর খরচ বড়, আর অলস core-এর জন্যও টাকা দিতে হয়।

অন্যদিকে খুব ছোট machine-ও দামি, একটু অন্যভাবে: প্রতিটা machine-এ কিছু **স্থির খরচ** আছে, যা কাজে লাগে না। OS, monitoring agent, log shipper, sidecar, runtime-এর নিজের memory। ধরুন এটা প্রতি machine-এ আধা vCPU। 2 vCPU-র machine-এ সেটা ২৫%, 16 vCPU-তে মাত্র ৩%।

**হিসাব করি (উদাহরণের সংখ্যা, কোনো আসল price list না):** প্রতি vCPU মাসে $40। প্রতি machine-এ ০.৫ vCPU স্থির খরচে যায়। বাকি প্রতি vCPU সেকেন্ডে ২৫০ request সামলায়, কিন্তু বড় box-এ কার্যক্ষমতা (efficiency) কমে।

\`\`\`
size      দাম/মাস   কাজের vCPU × 250 × efficiency   = req/s    $ প্রতি 1,000 req/s
2 vCPU      $80     1.5 × 250 × 1.00              =    375    $213
8 vCPU     $320     7.5 × 250 × 0.97              =  1,819    $176   ← মিষ্টি জায়গা
16 vCPU    $640    15.5 × 250 × 0.92              =  3,565    $180
64 vCPU  $2,560    63.5 × 250 × 0.72              = 11,430    $224
96 vCPU  $3,840    95.5 × 250 × 0.62              = 14,803    $259
\`\`\`

একটা **U-আকারের বাঁক**: খুব ছোট machine-এ স্থির খরচ খায়, খুব বড়তে efficiency। মাঝখানে কোথাও সবচেয়ে সস্তা। আপনার app-এর জন্য সেই জায়গাটা কোথায়, সেটা load test করেই বের করতে হয়।

**এবার redundancy যোগ করুন।** লক্ষ্য 12,000 req/s, আর একটা machine মরলেও চলতে হবে:
- **Scale out (8 vCPU):** 12,000 ÷ 1,819 = ৬.৬, মানে ৭টা। একটা বাড়তি (N+1) = ৮টা × $320 = **$2,560/মাস।**
- **Scale up (96 vCPU):** একটাতেই 14,803 req/s। কিন্তু সেটা মরলে সব শেষ, তাই একটা সমান বড় standby লাগবে: ২ × $3,840 = **$7,680/মাস**, প্রায় তিন গুণ।

তবে ছোট scale-এ হিসাব উল্টো দিকে যেতে পারে। লক্ষ্য 1,500 req/s হলে একটা 8 vCPU আর একটা standby, মোট দুটো machine; scale out-এও প্রায় একই। তখন সরলতাই জেতে: কম অংশ, কম ভাঙার জায়গা।`,
      diagrams: [
        {
          id: "day-013-cost-curve",
          caption:
            "প্রতি 1,000 req/s-এর মাসিক খরচ বনাম machine-এর আকার (উদাহরণের সংখ্যা): ছোটতে স্থির খরচ, বড়তে efficiency হারায়, মাঝে সবচেয়ে সস্তা।",
          alt: "Line chart। X অক্ষে machine-এর আকার 2, 8, 16, 64, 96 vCPU; Y অক্ষে প্রতি 1,000 req/s-এ ডলার। রেখা 2 vCPU-তে 213, 8-এ নেমে 176 (সবচেয়ে নিচে, লেখা মিষ্টি জায়গা), 16-এ 180, 64-এ 224, 96-এ 259; U আকার।",
        },
      ],
    },
    {
      title: "Blast radius আর N+1/N+2: কতটা বাড়তি রাখবেন",
      markdown: `একটা machine মরলে কতটা ক্ষমতা হারায়, সেটাই তার **blast radius** (Day 6-এ এর মূল ধারণা আছে)। এখানে vertical আর horizontal-এর পার্থক্য অঙ্কে ধরা পড়ে।

**N-টা সমান machine-এ একটা মরলে ক্ষমতা কমে 1/N।** ২টায় ৫০%, ৪টায় ২৫%, ১০টায় ১০%। তাই বাকিদের সেই ভার নেওয়ার জায়গা আগে থেকে রাখতে হয়। k-টা failure সহ্য করতে বাড়তি ক্ষমতা লাগে:

\`\`\`
বাড়তি = k ÷ (N − k)

N = 2,  k = 1  →  100% বাড়তি  (প্রতিটা ৫০%-এর নিচে চালাতে হবে)
N = 4,  k = 1  →   33% বাড়তি
N = 10, k = 1  →   11% বাড়তি
\`\`\`

অর্থাৎ machine যত বেশি আর ছোট, redundancy-র দাম তত কম। দুটো বিশাল machine-এ redundancy মানে অর্ধেক hardware সবসময় অলস।

**একটা পুরো হিসাব।** Peak 6,000 req/s। Load test-এ একটা machine 1,000 req/s পর্যন্ত যায়, কিন্তু latency-র knee-এর আগে থাকতে (Day 5) আমরা ৭০%, মানে 700 req/s-এর বেশি দেব না।
- শুধু peak সামলাতে: 6,000 ÷ 700 = ৮.৬ → **৯টা (N)**
- একটা মরলেও: **১০টা (N+1)**। স্বাভাবিক দিনে প্রতিটা 600 req/s, ৬০%।
- Deploy চলার সময়ও একটা মরতে পারে: rolling deploy একটা machine সরিয়ে নেয়, ঠিক তখন আরেকটা crash করলে? তাই অনেক team **N+2**: ১১টা।

**বড় failure domain।** Machine একা মরে না, পুরো availability zone (AZ) বা rack-ও যায়। তিনটা AZ-এ ছড়ানো থাকলে আর একটা AZ পুরো হারালেও চলতে হলে, বাকি দুটো AZ-কে পুরো peak নিতে হবে: প্রতিটা AZ-এ peak-এর ৫০%, মোট ১৫০%। দুটো AZ-এ হলে প্রতিটায় ১০০%, মোট ২০০%। এজন্যই বড় system তিনটা AZ পছন্দ করে।

**Vertical-এর লুকানো blast radius:** একটা বড় database machine-এ শুধু hardware না, একটা ভুল query, একটা disk ভরে যাওয়া, একটা OS update, সবই পুরো system থামায়। আর তাকে restart করলে cache ঠান্ডা (cold): memory-তে আবার data ভরতে কয়েক মিনিট, ততক্ষণ সব ধীর।

**নিচের simulator-এ নিজে চালিয়ে দেখুন:** Servers tab-এ দুটো **Large** server রাখুন (মোট ১৬টা request একসাথে), Traffic tab-এ RPS 100 আর "ভারী (500ms) request" ১০%। Play চাপুন, CPU দেখুন। এবার একটার "বন্ধ করো" চাপুন: অর্ধেক ক্ষমতা গেল, বাকিটা লাল, fail শুরু। তারপর একই মোট ক্ষমতা ৮টা **Small** দিয়ে সাজান (২ × ৮ = ১৬), আবার একটা বন্ধ করুন: মাত্র ১২.৫% কমল, metrics প্রায় স্থির।`,
      diagrams: [
        {
          id: "day-013-blast-radius",
          caption:
            "একই মোট ক্ষমতা, একটা machine মরলে: ২টা বড়তে অর্ধেক ক্ষমতা যায়, load আর ধরে না; ৮টা ছোটতে মাত্র ১২.৫%।",
          alt: "দুটো অনুভূমিক bar। উপরেরটা ২টা বড় ভাগে, একটা লাল কাটা, বাকি ৫০%; নিচেরটা ৮টা ছোট ভাগে, একটা লাল কাটা, বাকি ৮৭.৫%। দুটো bar-এর উপর দিয়ে ৬০%-এ একটা ড্যাশ দেওয়া উল্লম্ব রেখা, লেখা peak load। উপরের bar রেখার আগেই শেষ (লেখা ভার ধরে না), নিচেরটা রেখা পার হয়ে যায় (লেখা ঠিক আছে)।",
        },
      ],
    },
    {
      title:
        "Coordination-এর দাম, box-এর বাইরে আর ভেতরে: network, state, single thread আর NUMA",
      markdown: `Scale out-এর দাম সবাই জানে: machine-গুলোকে একে অপরের সাথে কথা বলতে হয়। কিন্তু একটা বড় box-এর **ভেতরেও** একই সমস্যা আছে, শুধু ছোট আকারে। দুটো পাশাপাশি দেখি।

**Box-এর বাইরে (scale out-এর দাম):**
- **Network hop:** একই process-এর ভেতরে function call nanosecond-এর ব্যাপার; একই data center-এ আরেক machine-এ যেতে প্রায় আধা millisecond ([Day 7](${day(7)})-এর latency-র সিঁড়ি)। প্রতিটা hop-এ serialize, পাঠানো, deserialize।
- **State বাইরে রাখা:** Session, timer, upload, local cache, সব বের করে Redis বা database-এ নিতে হয়, যাতে যেকোনো copy যেকোনো request নিতে পারে। এর মানে প্রতিটা request-এ একটা বাড়তি network call ([Day 14](${day(14)})-এ গভীরে)।
- **Partial failure:** এক machine-এ হয় সব চলে, নয় কিছুই না। দশটায় "৯টা চলছে, একটা আধা-মরা, ধীর" অবস্থা আসে, যেটা ধরাই সবচেয়ে কঠিন।
- **Consistency:** প্রতিটা copy-র নিজের local cache থাকলে তারা আলাদা উত্তর দিতে পারে। "ক্লাসঘর"-এর leaderboard copy ১-এ একরকম, copy ২-এ আরেক রকম।

**Box-এর ভেতরে (scale up-এর দাম):**
- **Single-thread-এর ছাদ:** Node.js-এর JavaScript একটা event loop-এ চলে, CPython-এ GIL একবারে একটা thread-কেই Python bytecode চালাতে দেয়, Redis command চালায় একটা thread-এ। এরা ৬৪ core-এর machine-এও মোটামুটি এক core-এর কাজ পায়। সমাধান **box-এর ভেতরেই scale out**: প্রতি core-এ একটা process (Node-এর \`cluster\` module বা PM2, Python-এ gunicorn worker), অথবা অনেকগুলো ছোট instance। Lab-এ ঠিক এটাই মাপবেন।
- **Clock speed প্রায় থেমে আছে:** গত বহু বছরে একটা core-এর গতি খুব ধীরে বেড়েছে, বেড়েছে core-এর সংখ্যা। তাই আজকের "বড় machine" মানে মূলত বেশি core, দ্রুত core না। যে কাজ parallel করা যায় না, সেটা বড় machine-এ দ্রুত হয় না।
- **Lock আর cache coherency:** ৬৪টা core একই lock বা একই memory-র জায়গা নিয়ে কাড়াকাড়ি করলে, তারা একে অপরের CPU cache বাতিল করতে থাকে। ঠিক যেন এক box-এর ভেতরে অনেকগুলো machine।
- **NUMA:** বড় server-এ একাধিক CPU socket থাকে, আর প্রতিটা socket-এর নিজের "কাছের" memory। নিজের memory পড়া দ্রুত, অন্য socket-এর memory পড়তে interconnect পার হতে হয়, ধীর। Database-এর thread এক socket-এ আর তার data আরেক socket-এর memory-তে থাকলে, machine বড় হয়েও ধীর। নিচের diagram দেখুন। Linux-এ \`numactl --hardware\` দিয়ে দেখা যায় কয়টা NUMA node। এখন এটুকু জানলেই চলবে, [Day 97](${day(97)})-এ গভীরে যাব।
- **বিশাল heap-এর GC:** Garbage-collected runtime-এ (যেমন JVM) heap অনেক বড় হলে GC-র কাজও বাড়ে; পুরনো ধাঁচের collector-এ pause লম্বা হতে পারে। তাই অনেকে একটা ২৫৬GB-এর process-এর চেয়ে কয়েকটা ছোট process পছন্দ করে।

**দুই জায়গাতেই একই অঙ্ক।** Day 5-এর **Universal Scalability Law (USL)** মনে আছে? সেখানে N ছিল server; একই সূত্র core-এর জন্যও খাটে:

\`\`\`
C(N) = N ÷ (1 + σ(N − 1) + κN(N − 1))

σ = contention (lock-এর লাইন),  κ = coherency (একে অপরের সাথে মেলানো)
\`\`\`

একটা database-এ ধরুন σ = 0.03, κ = 0.0005:
- 16 core: 16 ÷ (1 + 0.45 + 0.12) ≈ **১০.২ গুণ**
- 32 core: 32 ÷ (1 + 0.93 + 0.496) ≈ **১৩.২ গুণ**
- 64 core: 64 ÷ (1 + 1.89 + 2.016) ≈ **১৩.০ গুণ**

32 থেকে 64 core: দাম দ্বিগুণ, কাজ একটুও বাড়ল না, সামান্য কমল। চূড়া N ≈ √((1 − σ) ÷ κ) ≈ ৪৪ core-এ। তাই "আরও বড় machine" কেনার আগে বর্তমান machine-এ load test করে দেখুন throughput core-এর সাথে সত্যিই বাড়ছে কিনা।`,
      diagrams: [
        {
          id: "day-013-numa",
          caption:
            "বড় server-এর ভেতরে: দুটো socket, প্রতিটার কাছের memory দ্রুত, অন্য socket-এর memory interconnect পার হয়ে ধীর।",
          alt: "দুটো বড় box, Socket 0 আর Socket 1, প্রতিটায় চারটা core আর নিচে Local RAM। দুটো socket-এর মাঝে interconnect লেখা একটা মোটা রেখা। Socket 0-এর একটা core থেকে নিজের RAM-এ সবুজ তীর (local · দ্রুত), আর Socket 1-এর RAM-এ interconnect হয়ে লাল ড্যাশ দেওয়া তীর (remote · ধীর)।",
        },
      ],
    },
    {
      title: "অসমান server-এর fleet: weight, slow start আর মিশ্র generation",
      markdown: `Scale out মানে সবসময় "একই রকম machine" না। বাস্তবে fleet প্রায়ই মিশ্র: পুরনো generation-এর 8 vCPU আর নতুন 16 vCPU, বা migration-এর মাঝামাঝি দুই ধরনের machine একসাথে। তখন load balancer সমান ভাগ দিলে ছোটগুলো আগে ডোবে। Weight-এর মূল কৌশল [Day 9](${day(9)})-এ দেখেছি; এখানে কয়েকটা সূক্ষ্ম দিক।

**Weight ঠিক করুন মেপে, vCPU গুনে না।** ধরুন:
- পুরনো machine: 8 vCPU, load test-এ 900 req/s
- নতুন machine: 16 vCPU, নতুন CPU generation, load test-এ 2,000 req/s

vCPU দেখে weight দিলে ১:২। কিন্তু আসল ক্ষমতা ৯০০:২০০০ = ৯:২০, প্রায় ১:২.২। ১:২ দিলে নতুনটা সামান্য অলস থাকবে, পুরনোটা আগে knee-তে পৌঁছাবে। আবার app single-threaded হলে ১৬ vCPU-ও ৮-এর মতোই কাজ দিতে পারে; তখন vCPU দেখে দেওয়া weight পুরো ভুল।

**Least connections নিজে নিজে মানিয়ে নেয়।** যে machine দ্রুত শেষ করে, তার connection কম থাকে, সে বেশি কাজ পায়। তাই মিশ্র fleet-এ সমান weight-এর round robin-এর চেয়ে least connections বা least response time সাধারণত নিরাপদ। তবু weight দিয়ে রাখা ভালো, যাতে শুরু থেকেই ভাগ যুক্তিসঙ্গত হয়।

**মিশ্র fleet-এ metric ভুল বলে।** Fleet-এর গড় CPU ৫৫%, অথচ ছোট machine-গুলো ৯০%-এ আর তাদের user-রা ধীর। Autoscaling গড় CPU দেখে সিদ্ধান্ত নিলে কিছুই করবে না। আর p99 latency প্রায়ই ঠিক করে দেয় সবচেয়ে দুর্বল machine। তাই per-machine বা per-group metric দেখুন।

**Slow start।** নতুন machine সবে চালু, তার cache ঠান্ডা, JIT এখনো গরম হয়নি, connection pool খালি। Least connections তাকে "সবচেয়ে কম ব্যস্ত" দেখে একসাথে এক ঝাঁক request পাঠায়, আর সে ডুবে যায়। সমাধান **slow start**: কয়েক সেকেন্ড থেকে মিনিট ধরে ধীরে ধীরে weight বাড়ানো। HAProxy-তে server-এর \`slowstart\` option আছে, AWS-এর Application Load Balancer-এর target group-এ slow start duration দেওয়া যায়।

**নিচের simulator-এ নিজে চালিয়ে দেখুন:** "অসমান server" challenge-এ "সাজান" চাপুন: একটা **Large** আর দুটো **Small**, 100 RPS। Round Robin দিয়ে চালান, দেখুন Small দুটো লাল। Weighted Round Robin-এ যান (Large-এর weight ৪, Small-এর ১), তারপর Least Connections। তিনটার p99 আর প্রতিটা server-এর CPU তুলনা করুন।`,
    },
    {
      title:
        "Database-এর vertical scaling: memory, IOPS, আর downtime ছাড়া resize",
      markdown: `Database কেন সাধারণত আগে scale up হয়, তার মূল কারণ Day 5-এ দেখেছি: write ভাগ করা কঠিন। এখানে দেখি **বড় করলে ঠিক কী লাভ হয়**, আর কোথায় সেটা থামে।

**১. Memory: working set ধরে কিনা।** Database সবচেয়ে বেশি ব্যবহৃত data আর index memory-তে রাখে (PostgreSQL-এ \`shared_buffers\` আর OS-এর page cache, MySQL InnoDB-তে buffer pool)। যে অংশ নিয়মিত ছোঁয়া হয়, তাকে বলে **working set**। Working set RAM-এ ধরলে বেশিরভাগ read memory থেকে, microsecond-এ। না ধরলে disk থেকে, অনেক ধীর, আর হঠাৎ করে।

উদাহরণ: database ৫০০GB, কিন্তু গত ৩০ দিনের order আর তাদের index মিলিয়ে working set ~১৮০GB। Machine-এ ৬৪GB RAM, তাই cache hit ratio পড়ে গেছে, disk-এর read আকাশে। ২৫৬GB RAM-এর machine-এ গেলে working set পুরোটা ধরে, আর latency এক লাফে নেমে আসে। এখানে vertical scaling সবচেয়ে সস্তা আর সবচেয়ে কার্যকর ওষুধ। কিন্তু working set যদি ২TB হয় আর প্রতি মাসে বাড়ে, তাহলে কোনো এক machine-এ আর ধরবে না।

**২. Disk: IOPS আর throughput।** Write-heavy database-এ প্রতিটা commit-এ log (WAL) disk-এ লেখা হয়। Cloud-এর network disk-এ IOPS আর throughput অনেক সময় **আলাদা করে** কিনতে হয়, আর instance type-এরও নিজের storage bandwidth-এর একটা সীমা থাকে। তাই "বড় instance নিলাম, তবু disk ধীর" খুব সাধারণ ঘটনা: disk-এর provisioned IOPS-ই আসল ছাদ ছিল। আগে মাপুন কোনটা ভরা: CPU, memory, IOPS, নাকি throughput।

**৩. CPU আর connection।** বেশি core মানে একসাথে বেশি query। কিন্তু PostgreSQL প্রতিটা connection-এ একটা আলাদা process চালায়, আর হাজার হাজার connection নিজেই memory আর context switch খায়। তাই বড় machine-এর সাথে connection pooler (যেমন PgBouncer) লাগে, নইলে বাড়তি core-এর সুবিধা connection-এর ভিড়ে হারায়।

**কখন থামবেন?** যখন (ক) সবচেয়ে বড় সাশ্রয়ী machine-এও working set বা write ধরে না, (খ) পরের size-এর দাম লাভের তুলনায় অনেক বেশি (USL-এর বাঁক), বা (গ) একটা machine-এর blast radius আর মেনে নেওয়া যায় না। তখন read সরান replica-তে ([Day 28](${day(28)})), আর write ভাগ করুন sharding দিয়ে ([Day 29](${day(29)}))।

**Resize-এ downtime কমানো।** Production database-এ stop → resize → start মানে কয়েক মিনিট সব write বন্ধ, তারপর ঠান্ডা cache। ভালো উপায়: **replica-কে আগে বড় করুন, তারপর failover।** নিচের ধাপগুলো এক এক করে দেখুন। এতে downtime নামে failover-এর কয়েক সেকেন্ডে। Managed database-গুলোও (যেমন Amazon RDS-এর Multi-AZ) instance class বদলানোর সময় মোটামুটি এই কৌশলই ব্যবহার করে: আগে standby বদলায়, তারপর failover। Stateless app tier-এ কাজ আরও সহজ: নতুন size-এর machine যোগ করুন, পুরনোগুলো load balancer থেকে drain করে বাদ দিন (Day 9)।`,
      diagrams: [
        {
          id: "day-013-db-resize",
          caption:
            "ধাপে ধাপে: আগে replica বড় করা, সে ধরে ফেললে failover, তারপর পুরনো primary বড় করে replica হিসেবে ফেরত।",
          alt: "পাঁচ ধাপের step-through। প্রতিটা ধাপে App, Primary আর Replica database। ধাপ ১: App থেকে 16 vCPU Primary, Primary থেকে Replica-তে copy। ধাপ ২: Replica ঝাপসা, লেখা resize চলছে। ধাপ ৩: Replica 32 vCPU, copy করে ধরে ফেলছে। ধাপ ৪: failover, App এখন 32 vCPU-র নতুন Primary-তে, পুরনোটা ঝাপসা। ধাপ ৫: পুরনোটাও 32 vCPU, নতুন replica।",
        },
      ],
    },
    {
      title:
        '"Scale up first" বনাম "cattle, not pets": দুই দর্শন, একটা বাস্তবতা',
      markdown: `Industry-তে দুটো জোরালো মত আছে, আর দুটোরই যুক্তি আছে।

**"আগে scale up" দর্শন।** কিছু বড় traffic-এর site প্রকাশ্যে বলেছে, তারা অল্প কয়েকটা শক্তিশালী machine আর দক্ষ code দিয়ে চলে (Stack Overflow-এর উদাহরণ Day 5-এ আছে)। যুক্তি:
- একটা বড় machine-এ সব data এক জায়গায়, তাই join আর transaction সহজ, network hop নেই
- কম machine মানে কম অংশ, কম ভাঙার জায়গা, ছোট team-এ সামলানো সহজ
- আজকের একটা server-এ শত শত core আর কয়েক TB RAM ধরে; বেশিরভাগ company কখনো এর ছাদেই পৌঁছায় না

এর দাম: প্রতিটা machine "পোষা প্রাণী" হয়ে যায়। তার নাম আছে, তাকে হাতে যত্ন করে update করা হয়, সে অসুস্থ হলে সবাই রাত জাগে। আর failover-এর জন্য সমান বড় standby লাগে।

**"Cattle, not pets" দর্শন।** উপমাটা Microsoft-এর Bill Baker-এর, cloud জগতে জনপ্রিয় করেন Randy Bias। পোষা বিড়াল অসুস্থ হলে আপনি ডাক্তারের কাছে নেন; খামারের গরুর পাল-এ (cattle) একটা অসুস্থ হলে পালটা চলতে থাকে, বদলে নতুন আসে। Server-কে এভাবে দেখলে:
- কোনো machine-এর নাম বা হাতে করা setting নেই; সব একই image বা template থেকে
- একটা machine-এ সমস্যা? ঠিক না করে মেরে ফেলুন, Auto Scaling group নতুন চালাবে
- Netflix এই চিন্তাকে চরমে নিয়েছিল **Chaos Monkey** দিয়ে: production-এ ইচ্ছা করে এলোমেলো instance মেরে ফেলা, যাতে প্রতিটা service যেকোনো একটা machine হারানো সহ্য করতে বাধ্য হয় ([Day 92](${day(92)})-এ Chaos Engineering)

এর দাম: সবকিছু stateless আর automated হতে হবে, আর distributed system-এর সব জটিলতা (partial failure, consistency, network) মেনে নিতে হবে।

**বাস্তব উত্তর: দুটো এক system-এর আলাদা tier-এ।** App tier হয় cattle: ছোট-মাঝারি, একই রকম, autoscaled, যেকোনোটা মরলে কিছু যায় আসে না। Database tier প্রায়ই "যত্নে রাখা পোষা প্রাণী"র কাছাকাছি: বড়, কম সংখ্যক, replica আর failover সহ, পরিকল্পিত resize। আর মাঝে diagonal scaling: প্রতিটা tier-এ machine-এর "মিষ্টি" size বাছুন, তারপর সংখ্যা বাড়ান।

একটা ভালো নিয়ম: **যেটা সহজে scale up হয়, আগে সেটা করুন, কিন্তু scale out-এর দরজা বন্ধ করবেন না।** অর্থাৎ শুরু থেকেই app stateless লিখুন, config আর setup automate করুন। তাহলে দিন এলে scale out একটা সিদ্ধান্ত মাত্র, পুনর্লিখন না।`,
    },
  ],

  simulator: "load-balancer-lab",

  tradeOffs: {
    markdown: `**কখন scale up বাছবেন:** Bottleneck একটা নির্দিষ্ট resource (RAM-এ working set ধরছে না, CPU ভরা) আর software সেটা কাজে লাগাতে পারে; component-টা stateful আর ভাগ করা কঠিন (database, কিছু cache); team ছোট আর সরলতা মূল্যবান; ছাদ এখনো অনেক দূরে, আর পরের size-এ দাম প্রায় linear।

**কখন scale out বাছবেন:** Component stateless (web/API, worker); traffic ওঠানামা করে আর চলন্ত অবস্থায় বাড়ানো-কমানো দরকার; একটা machine মরলেও চলতেই হবে; আপনি ইতিমধ্যে বড় machine-এর বাঁকা খরচ বা ছাদের কাছে; বা software নিজেই single-threaded, বড় box-এ লাভ নেই।

**কখন কোনোটাই আগে না:** Bottleneck একটা ধীর query, missing index, N+1 query বা একটা lock। তখন বড় বা বেশি machine শুধু খরচ বাড়ায়। আগে মাপুন, ঠিক করুন, তারপর scale।

তিনটা পথ পাশাপাশি:`,
    table: {
      headers: [
        "বিষয়",
        "Scale up (vertical)",
        "Scale out (horizontal)",
        "Diagonal (আগে up, তারপর out)",
      ],
      rows: [
        [
          "ক্ষমতার ছাদ",
          "সবচেয়ে বড় পাওয়া যায় এমন machine; তার আগেই USL-এর বাঁক",
          "অনেক দূরে, কিন্তু shared database আর coordination-এ আটকায়",
          "প্রতিটা machine মিষ্টি size-এ, তারপর সংখ্যায় দূর পর্যন্ত",
        ],
        [
          "প্রতি req/s-এর খরচ",
          "ছোট থেকে মাঝারিতে ভালো; উপরে efficiency আর license-এ বাড়ে",
          "প্রায় linear, কিন্তু খুব ছোট machine-এ স্থির খরচ খায়",
          "সাধারণত সবচেয়ে কম (U-বাঁকের তলায়)",
        ],
        [
          "একটা machine মরলে (blast radius)",
          "সব বন্ধ; বাঁচতে সমান বড় standby লাগে (১০০% বাড়তি)",
          "1/N ক্ষমতা যায়; N+1-এ বাড়তি মাত্র 1/(N−1)",
          "মাঝারি: কম machine, কিন্তু একাধিক",
        ],
        [
          "বাড়াতে-কমাতে",
          "প্রায়ই stop/start, কয়েক মিনিট downtime; replica দিয়ে কমানো যায়",
          "চলন্ত অবস্থায় যোগ-বাদ, autoscaling সম্ভব",
          "সংখ্যা চলন্ত অবস্থায়; size বদলানো কালেভদ্রে, rolling করে",
        ],
        [
          "Code আর state",
          "সাধারণত বদলাতে হয় না (তবে single-threaded হলে লাভ নেই)",
          "Stateless হতে হবে; session, file, lock বাইরে",
          "Stateless লাগবেই; process-per-core-ও লাগতে পারে",
        ],
        [
          "Consistency আর network",
          "এক জায়গায় data, transaction সহজ, network hop নেই",
          "Network hop, partial failure, local cache-এর অমিল",
          "Scale out-এর মতোই, কিন্তু কম machine তাই কম জটিল",
        ],
        [
          "কোথায় মানায়",
          "Database primary, বড় working set-এর cache, শুরুর দিকের app",
          "Web/API server, worker, stateless microservice",
          "প্রায় সব production app tier",
        ],
      ],
    },
  },

  industry: {
    markdown: `- **AWS EC2 instance family আর resize:** EC2 আলাদা আলাদা family দেয়: general purpose, compute optimized, memory optimized, storage optimized, accelerated computing। EBS-backed instance-এর type বদলাতে আগে stop করতে হয়, এটা AWS-এর documentation-এই বলা; তাই EC2-তে vertical scaling মানে পরিকল্পিত downtime বা failover।
- **AWS Auto Scaling groups:** একটা launch template থেকে একই রকম instance, minimum/maximum/desired capacity সহ। Health check-এ fail করা instance group নিজেই বদলে দেয়, আর target tracking policy দিয়ে (যেমন গড় CPU একটা লক্ষ্যে রাখা) সংখ্যা বাড়ায়-কমায়। এটাই cloud-এ scale out-এর সবচেয়ে প্রচলিত রূপ।
- **Kubernetes:** Horizontal Pod Autoscaler pod-এর সংখ্যা বাড়ায়-কমায় (scale out); Vertical Pod Autoscaler pod-এর CPU/memory request বদলায় (scale up), সাধারণত pod নতুন করে তৈরি করে। একই platform-এ দুটো হাতিয়ার পাশাপাশি।
- **Netflix:** Chaos Monkey তৈরি করে, যেটা production-এ এলোমেলো instance বন্ধ করে দেয়, আর ২০১২ সালে open source করে। উদ্দেশ্য ছিল প্রতিটা service যেন যেকোনো একটা instance হারানো সহ্য করতে পারে, অর্থাৎ "cattle"-এর মতো চলে।
- **Redis:** Command execution একটা thread-এ হয়, তাই একটা Redis instance একটা core-এর বেশি command-এর কাজ পায় না। Memory বা throughput একটা node-এ না ধরলে **Redis Cluster** key-গুলোকে 16384টা hash slot-এ ভাগ করে কয়েকটা node-এ ছড়ায়: box-এর ভেতরে scale up-এর সীমা, তাই scale out।
- **Node.js:** JavaScript একটা event loop-এ চলে; একাধিক core কাজে লাগাতে built-in \`cluster\` module বা PM2-এর মতো process manager দিয়ে প্রতি core-এ একটা process চালানো হয়।
- **Stack Overflow:** প্রকাশ্য লেখায় দেখা যায় তারা দীর্ঘদিন তুলনামূলক অল্প সংখ্যক শক্তিশালী server আর বড় SQL Server machine দিয়ে চলেছে, "আগে scale up" দর্শনের পরিচিত উদাহরণ (বিস্তারিত Day 5-এ)।

জনপ্রিয় tool:
- **Scale out:** AWS Auto Scaling groups, Azure Virtual Machine Scale Sets, Google Cloud managed instance groups, Kubernetes HPA
- **Scale up / right-sizing:** Kubernetes VPA, cloud provider-দের right-sizing সুপারিশ
- **Process-per-core:** Node \`cluster\`/PM2, gunicorn/uvicorn worker, NGINX-এর \`worker_processes auto\`
- **মাপা:** hey, wrk, k6; \`docker stats\`, \`top\`/\`htop\` (প্রতি core দেখতে), \`numactl --hardware\`

*উৎস: AWS documentation (Amazon EC2 instance types, "Change the instance type", Amazon EC2 Auto Scaling User Guide); Kubernetes documentation (Horizontal Pod Autoscaling, Vertical Pod Autoscaler); Netflix Technology Blog (Chaos Monkey, Simian Army); Redis documentation (Redis Cluster specification, Redis-এর threading model); Node.js documentation (cluster module); Randy Bias-এর "pets vs cattle" লেখা; Nick Craver, "Stack Overflow: The Architecture - 2016 Edition"।*`,
  },

  mistakes: [
    {
      mistake:
        "Single-threaded app (একটা Node.js process, একটা Redis, GIL-এ আটকানো Python) বড় machine-এ সরানো। ৩২ core কিনে একটাই ব্যবহার হয়।",
      fix: "আগে `top`/`htop`-এ প্রতি core দেখুন। প্রতি core-এ একটা process চালান (cluster, PM2, gunicorn worker), অথবা ছোট কয়েকটা instance-এ scale out করুন।",
    },
    {
      mistake:
        "Session, timer, upload বা in-memory lock app-এর memory-তে রেখেই load balancer-এর পেছনে copy বাড়ানো। User-এর data হারায়, একই সিট দুবার বিক্রি হয়।",
      fix: `Scale out-এর আগে app stateless করুন: session আর lock Redis/database-এ, file object storage-এ ([Day 14](${day(14)})-এ গভীরে)।`,
    },
    {
      mistake:
        "দুটো server প্রত্যেকে ৭০% CPU-তে চালিয়ে ভাবা 'redundancy আছে'। একটা পড়লেই অন্যটার ঘাড়ে ১৪০%।",
      fix: "N+1 (বা N+2) হিসাব করুন: k-টা failure সহ্য করতে বাড়তি = k ÷ (N − k)। দুটো machine-এ প্রতিটা ৫০%-এর নিচে, বা আরও machine-এ ভাগ করুন।",
    },
    {
      mistake:
        "Peak সময়ে production database stop/start করে resize করা। কয়েক মিনিট সব write বন্ধ, তারপর ঠান্ডা cache-এ আরও ধীর।",
      fix: "আগে replica বড় করুন, সে ধরে ফেললে failover, তারপর পুরনোটা। আর resize করুন কম traffic-এর সময়ে, পরিকল্পনা করে।",
    },
    {
      mistake:
        "মিশ্র fleet-এ সব server-কে সমান weight দেওয়া, বা vCPU গুনে weight দেওয়া। ছোট বা পুরনো machine আগে ডোবে, p99 খারাপ হয়।",
      fix: "প্রতিটা ধরনের machine আলাদা load test করে মাপা ক্ষমতা অনুযায়ী weight দিন, least connections ব্যবহার করুন, আর per-machine metric দেখুন।",
    },
    {
      mistake:
        "Database-এর write চাপ কমাতে app server বা read replica বাড়ানো, অথবা উল্টোভাবে ছোট database-এ খুব আগে sharding শুরু করা।",
      fix: "ক্রম মানুন: query/index ঠিক, তারপর বড় machine (working set RAM-এ), read replica, আর সত্যিই না ধরলে তবেই sharding।",
    },
    {
      mistake:
        "খুব ছোট machine-এ scale out: ৫০টা 1 vCPU instance, যার প্রতিটায় agent, sidecar আর runtime মিলে অনেকটা খেয়ে ফেলে।",
      fix: "Diagonal scaling: load test করে প্রতি req/s-এর খরচ যেখানে সবচেয়ে কম সেই size বাছুন, তারপর সেই size সংখ্যায় বাড়ান।",
    },
  ],

  lab: [
    {
      title: "প্রস্তুতি: একটা app, একটা network, তিনটা file",
      markdown: `এই lab-এ একই app দুই ভাবে বড় করবেন: একটা container-কে বেশি CPU আর memory দিয়ে (**scale up**), আর অনেকগুলো copy NGINX-এর পেছনে রেখে (**scale out**)। তারপর মাপবেন throughput, আর একটা machine মরলে কী হয়। Docker ছাড়া আর কিছু লাগবে না। (Day 5-এর lab-এ shared database-এর ছাদ দেখেছিলেন; এখানে নজর box-এর ভেতরে আর blast radius-এ।)

একটা ফাঁকা folder-এ \`app.py\` বানান। প্রতিটা request-এ একটু CPU-র কাজ করে। \`WORKERS\` env দিয়ে বলা যায় কয়টা process চলবে। আর \`/hog\` path প্রতিবার 100MB memory দখল করে রাখে, memory-র ছাদ দেখার জন্য:

\`\`\`python
import os
import socket
from http.server import BaseHTTPRequestHandler, HTTPServer

WORKERS = int(os.environ.get("WORKERS", "1"))
hog = []  # /hog এখানে memory জমায়


def busy_work():
    # প্রতিটা request-এ একটু CPU-র কাজ, যেমন JSON বানানো বা template render
    total = 0
    for i in range(300_000):
        total += i * i
    return total


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/hog"):
            hog.append(bytearray(100 * 1024 * 1024))  # প্রতিবার 100MB
            body = f"holding {len(hog) * 100} MB\\n".encode()
        else:
            busy_work()
            body = f"served by {socket.gethostname()} pid {os.getpid()}\\n".encode()
        self.send_response(200)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass


class Server(HTTPServer):
    request_queue_size = 256


server = Server(("0.0.0.0", 8000), Handler)
# একই listening socket-এ WORKERS-টা process (prefork), যাতে একাধিক core কাজে লাগে
for _ in range(WORKERS - 1):
    if os.fork() == 0:
        break
print(f"pid {os.getpid()} listening on :8000", flush=True)
server.serve_forever()
\`\`\`

\`HTTPServer\` একবারে একটাই request সামলায়, আর CPython-এর GIL-এর কারণে thread দিলেও এক process একটা core-এর বেশি Python কাজ পায় না। তাই এই app ঠিক "ক্লাসঘর"-এর single-process Node.js-এর মতো আচরণ করবে।

\`nginx.conf\` (scale out-এর load balancer):

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
      # মরা server-এ ১ সেকেন্ডের বেশি অপেক্ষা না করে পরের server-এ যাও
      proxy_connect_timeout 1s;
    }
  }
}
\`\`\`

\`compose.yaml\`। প্রতিটা copy পাবে ঠিক ১টা CPU আর 256MB memory:

\`\`\`yaml
name: sdlab-day013

services:
  app:
    image: python:3.12-alpine
    command: python /app.py
    volumes:
      - ./app.py:/app.py:ro
    cpus: 1
    mem_limit: 256m

  lb:
    image: nginx:1.27-alpine
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    ports:
      - "8086:80"
    depends_on:
      - app

networks:
  default:
    name: sdlab-day013-net
    external: true
\`\`\`

সব container একটা network-এ থাকবে, যাতে load generator সবাইকে নাম দিয়ে ডাকতে পারে:

\`\`\`bash
docker network create sdlab-day013-net
\`\`\`

এই lab-এর জন্য Docker-এর অন্তত ৪টা CPU লাগবে (\`docker info | grep CPUs\` দিয়ে দেখুন; Docker Desktop-এ Settings → Resources থেকে বাড়ানো যায়)।`,
    },
    {
      title: "পরীক্ষা ১: ছোট box, আধা core",
      markdown: `একটা container চালান, CPU-র সীমা আধা core (\`--cpus 0.5\`), memory 256MB:

\`\`\`bash
docker run -d --name sdlab-day013-big --network sdlab-day013-net \\
  -p 8087:8000 --cpus 0.5 --memory 256m --memory-swap 256m \\
  -v "$PWD/app.py:/app.py:ro" python:3.12-alpine python /app.py
curl localhost:8087/
\`\`\`

\`served by <id> pid 1\` দেখবেন। এবার **hey** দিয়ে ১০ সেকেন্ড ধরে একসাথে ২০টা request:

\`\`\`bash
docker run --rm --platform linux/amd64 --network sdlab-day013-net \\
  williamyeh/hey -z 10s -c 20 http://sdlab-day013-big:8000/
\`\`\`

(\`williamyeh/hey\` image শুধু amd64-এর জন্য, তাই \`--platform\`। Apple Silicon Mac-এ emulation-এ চলে।)

Output-এ **Requests/sec** দেখুন। আমাদের ৮ core-এর machine-এ এসেছিল প্রায় **৪০-৪৫ req/s**, গড় latency প্রায় ৪৫০ms। আপনার সংখ্যা আলাদা হবে; তুলনাটাই আসল।`,
    },
    {
      title: "পরীক্ষা ২: চলন্ত অবস্থায় scale up, আর single thread-এর ছাদ",
      markdown: `Docker চলন্ত container-এর CPU সীমা বদলাতে পারে, restart ছাড়াই। দুই core দিন:

\`\`\`bash
docker update --cpus 2 sdlab-day013-big
docker run --rm --platform linux/amd64 --network sdlab-day013-net \\
  williamyeh/hey -z 10s -c 20 http://sdlab-day013-big:8000/
\`\`\`

প্রায় **দ্বিগুণ, ~৮৫-৯০ req/s।** Scale up কাজ করছে! আরও বড় করি, চার core:

\`\`\`bash
docker update --cpus 4 sdlab-day013-big
docker run --rm --platform linux/amd64 --network sdlab-day013-net \\
  williamyeh/hey -z 10s -c 20 http://sdlab-day013-big:8000/
\`\`\`

আবার **~৮০-৯০ req/s।** এক চুলও বাড়েনি। Test চলার সময় আরেক terminal-এ:

\`\`\`bash
docker stats --no-stream sdlab-day013-big
\`\`\`

**CPU %** প্রায় **১০০%**, অথচ সীমা ৪০০%। একটা process একটাই core ব্যবহার করতে পারে, তাই বাকি তিনটা core অলস। এটাই "ক্লাসঘর"-এর ৩২ vCPU-র ঘটনা।

খেয়াল করুন: Docker-এ resize চলন্ত অবস্থায় হলো। Cloud VM-এ এই একই কাজে সাধারণত stop/start লাগে, মানে downtime।`,
    },
    {
      title: "পরীক্ষা ৩: software-কে core ব্যবহার করতে দিন",
      markdown: `এবার একই ৪ core, কিন্তু ৪টা process (\`WORKERS=4\`)। Process সংখ্যা বদলাতে container নতুন করে চালাতে হবে; বাস্তবেও এটা একটা restart:

\`\`\`bash
docker rm -f sdlab-day013-big
docker run -d --name sdlab-day013-big --network sdlab-day013-net \\
  -p 8087:8000 --cpus 4 --memory 256m --memory-swap 256m -e WORKERS=4 \\
  -v "$PWD/app.py:/app.py:ro" python:3.12-alpine python /app.py
docker logs sdlab-day013-big
\`\`\`

Log-এ চারটা আলাদা pid দেখবেন। আবার load দিন:

\`\`\`bash
docker run --rm --platform linux/amd64 --network sdlab-day013-net \\
  williamyeh/hey -z 10s -c 20 http://sdlab-day013-big:8000/
\`\`\`

আমাদের ক্ষেত্রে **~২৭০-৩১০ req/s**, আর \`docker stats\`-এ CPU প্রায় **৪০০%**। ৪ গুণ core, কিন্তু ৯০-এর ৪ গুণ (৩৬০) না, ৩ থেকে সাড়ে ৩ গুণ: চারটা process একই listening socket, kernel আর memory bandwidth ভাগ করে, আর load generator নিজেও কিছু CPU খায়। ছোট আকারে USL-এর σ। শিক্ষা: **vertical scaling কাজ করে তখনই, যখন software নিজে core-গুলো ব্যবহার করতে পারে।**`,
    },
    {
      title: "পরীক্ষা ৪: scale out, চারটা ১-core copy NGINX-এর পেছনে",
      markdown: `এবার একই মোট ৪ core, কিন্তু চারটা আলাদা container, প্রতিটায় ১ core আর ১টা process:

\`\`\`bash
docker compose up -d --scale app=4
for i in 1 2 3 4 5 6 7 8; do curl -s localhost:8086/; done
\`\`\`

চারটা আলাদা container id পালা করে আসবে। (একটাই id দেখলে \`docker compose restart lb\` দিয়ে আবার চেষ্টা করুন; NGINX চালু হওয়ার সময়ই \`app\` নামটা DNS থেকে খোঁজে।) Load দিন:

\`\`\`bash
docker run --rm --platform linux/amd64 --network sdlab-day013-net \\
  williamyeh/hey -z 10s -c 20 http://sdlab-day013-lb-1/
\`\`\`

আমাদের ক্ষেত্রে **~২৫০-৩১০ req/s**, পরীক্ষা ৩-এর প্রায় সমান। \`docker stats --no-stream\`-এ চারটা app-ই প্রায় ১০০%-এর কাছে। একই মোট core-এ throughput প্রায় একই; মাঝে NGINX-এর একটা বাড়তি hop থাকায় কখনো সামান্য কম। তাহলে পার্থক্য কোথায়? পরের পরীক্ষায়।`,
    },
    {
      title: "পরীক্ষা ৫: একটা machine মরল (blast radius)",
      markdown: `প্রথমে বড় container-টা, load চলার মাঝে মেরে দিন। দুটো terminal লাগবে। প্রথম terminal-এ:

\`\`\`bash
docker run --rm --platform linux/amd64 --network sdlab-day013-net \\
  williamyeh/hey -z 10s -c 20 http://sdlab-day013-big:8000/
\`\`\`

চালু করেই দ্বিতীয় terminal-এ:

\`\`\`bash
docker kill sdlab-day013-big
\`\`\`

hey-এর output-এর শেষে **Error distribution**-এ শত শত \`connection refused\` (আমাদের ক্ষেত্রে ~৫০০)। একটাই machine, সে মরলে বাকি সব request fail। এটাই scale up-এর blast radius: ১০০%।

এবার scale out-এর একটা copy মারুন, একইভাবে। প্রথম terminal-এ:

\`\`\`bash
docker run --rm --platform linux/amd64 --network sdlab-day013-net \\
  williamyeh/hey -z 10s -c 20 http://sdlab-day013-lb-1/
\`\`\`

দ্বিতীয় terminal-এ:

\`\`\`bash
docker kill sdlab-day013-app-3
\`\`\`

এবার **Error distribution নেই**, সব \`[200]\`। NGINX মরা copy-তে connect করতে না পেরে request-টা পরের copy-তে পাঠিয়েছে (GET request, তাই আবার পাঠানো নিরাপদ)। এখন প্রথম terminal-এ hey আরেকবার চালান: তিনটা copy-তে আমাদের এসেছিল **~২৩০ req/s**। হারাল ক্ষমতার 1/N = এক-চতুর্থাংশ, সব না। (Laptop-এ load generator নিজেও CPU খায়, তাই মাপা পার্থক্য পুরো ২৫%-এর চেয়ে কম দেখাতে পারে।)

ভাবুন: এই ২৫% হারানোর পরেও peak সামলাতে হলে আগে থেকে কতটা বাড়তি রাখতে হতো? (উত্তর: k ÷ (N − k) = ১ ÷ ৩ ≈ ৩৩%।)`,
    },
    {
      title: "পরীক্ষা ৬: memory-র ছাদ, আর RAM বাড়ানো",
      markdown: `Memory-ও box-এর একটা ছাদ। বড় container আবার চালু করুন, এবার ১টা process আর 256MB:

\`\`\`bash
docker rm -f sdlab-day013-big
docker run -d --name sdlab-day013-big --network sdlab-day013-net \\
  -p 8087:8000 --cpus 1 --memory 256m --memory-swap 256m \\
  -v "$PWD/app.py:/app.py:ro" python:3.12-alpine python /app.py
for i in 1 2 3; do curl -s localhost:8087/hog || echo "curl failed"; done
docker inspect -f '{{.State.Status}} exit={{.State.ExitCode}} oom={{.State.OOMKilled}}' sdlab-day013-big
\`\`\`

\`holding 100 MB\`, \`holding 200 MB\`, তারপর \`curl failed\`। আর inspect বলছে: \`exited exit=137 oom=true\`। Kernel-এর OOM killer process মেরে দিয়েছে। Database-এর working set RAM ছাড়িয়ে গেলে ঠিক এমন না মরলেও, disk-এ যাওয়ার কারণে latency একইরকম হঠাৎ লাফ দেয়।

Scale up করুন, memory দ্বিগুণ:

\`\`\`bash
docker start sdlab-day013-big
docker update --memory 512m --memory-swap 512m sdlab-day013-big
for i in 1 2 3; do curl -s localhost:8087/hog || echo "curl failed"; done
docker stats --no-stream --format '{{.Name}} {{.MemUsage}}' sdlab-day013-big
\`\`\`

এবার \`holding 300 MB\`, আর memory দেখাবে প্রায় \`310MiB / 512MiB\`। ছাদ সরল, কিন্তু রইল।`,
    },
    {
      title: "পরিষ্কার করুন",
      markdown: `\`\`\`bash
docker rm -f sdlab-day013-big
docker compose down
docker network rm sdlab-day013-net
\`\`\`

Image-গুলোও মুছতে চাইলে:

\`\`\`bash
docker rmi williamyeh/hey python:3.12-alpine nginx:1.27-alpine
\`\`\`

চাইলে আরও খেলুন: \`docker compose up -d --scale app=2\` করে প্রতিটা copy-কে ২ core দিন (\`cpus: 2\`, \`WORKERS: 2\` env), অর্থাৎ diagonal। Throughput আর একটা copy মরলে কতটা হারায়, দুটোই আগে হিসাব করে তারপর মেপে দেখুন।`,
    },
  ],

  connections: {
    markdown: `- **[Day 5](${day(5)}) · Scalability**: সেখানে vertical আর horizontal-এর পরিচিতি, capacity-র হিসাব, Amdahl আর USL-এর মূল কথা। আজ সেই USL দিয়েই দেখলাম বড় box-এর ভেতরে core-ও একইভাবে বাঁকে, আর খরচের U-বাঁক হিসাব করলাম।
- **[Day 6](${day(6)}) · Availability**: Blast radius আর N+1-এর ধারণা সেখান থেকে। আজ সেটাকে সূত্রে আনলাম: k-টা failure-এ বাড়তি = k ÷ (N − k), আর কেন বড় দুটো machine-এ redundancy সবচেয়ে দামি।
- **[Day 7](${day(7)}) · Latency vs Throughput**: Scale out-এর প্রতিটা network hop latency যোগ করে; box-এর ভেতরে থাকলে সেই খরচ নেই। আর lab-এ throughput মাপলাম Requests/sec দিয়ে।
- **[Day 9](${day(9)}) · Load Balancers**: Scale out-এর সামনের দরজা। আজ মিশ্র fleet-এ weight মেপে ঠিক করা, slow start, আর connect timeout দিয়ে মরা copy এড়ানো দেখলাম।
- **[Day 12](${day(12)}) · Message Queues**: Worker tier হলো সবচেয়ে সহজে scale out হওয়া অংশ, কারণ worker-রা নিজেরাই কাজ টেনে নেয়।

সামনে যা আসছে: [Day 14](${day(14)})-এ Stateful vs Stateless (scale out-এর পূর্বশর্ত), [Day 17](${day(17)})-এ Caching, [Day 19](${day(19)})-এ Capacity Estimation, [Day 28](${day(28)})-এ Database Replication, [Day 29](${day(29)})-এ Database Sharding, [Day 36](${day(36)})-এ Process, Thread ও Concurrency, [Day 87](${day(87)})-এ Autoscaling, আর [Day 97](${day(97)})-এ Memory, Cache line ও NUMA।`,
  },

  explainYourself: [
    {
      question:
        'Manager বলছেন, "app ধীর, machine 16 থেকে 64 vCPU করে দাও, code-এ হাত দিতে হবে না।" কেনার আগে আপনি কী কী দেখবেন?',
      idealAnswer:
        "প্রথমে দেখব কোন resource আসলে ফুরাচ্ছে: CPU, RAM (working set ধরছে কিনা), disk IOPS, নাকি network; ভুল resource বড় করলে টাকা নষ্ট। CPU হলে প্রতি core-এ দেখব, কারণ app single-threaded হলে (একটা Node.js process, GIL-এ আটকানো Python) একটা core 100% আর বাকিরা অলস, তখন বড় machine কিছুই দেবে না, আগে প্রতি core-এ process চালাতে হবে। তারপর load test-এ দেখব core বাড়ালে throughput সত্যিই বাড়ে কিনা, কারণ lock contention আর coherency-র কারণে (USL) একটা জায়গার পরে বাড়ে না। আর ভাবব resize-এ stop/start-এর downtime, একটা machine-এর blast radius, আর সমান বড় standby-র খরচ; অনেক সময় মাঝারি কয়েকটা machine-এ scale out সস্তা আর নিরাপদ।",
    },
    {
      question:
        "কেন stateless app tier সাধারণত scale out হয়, আর database সাধারণত আগে scale up? দুটো কারণ বলুন।",
      idealAnswer:
        "Stateless app-এর কোনো copy কিছু মনে রাখে না, তাই নতুন copy চালু করলেই নতুন ক্ষমতা, load balancer যেকোনো copy-তে পাঠাতে পারে, আর একটা মরলে শুধু 1/N ক্ষমতা যায়। Database state রাখে: data ভাগ করলে join আর transaction কয়েকটা machine জুড়ে কঠিন হয়, আর stock বা unique email-এর মতো সিদ্ধান্তের জন্য একটা সত্যের উৎস লাগে। তাই database-এ প্রথমে বড় machine (working set RAM-এ ধরানো, বেশি IOPS) সবচেয়ে সস্তা আর সহজ লাভ; তারপর read replica দিয়ে read সরানো, আর শেষে sharding দিয়ে write ভাগ করা।",
    },
    {
      question:
        "৪টা server প্রত্যেকে ৭০% CPU-তে চলছে। একটা মরলে কী হবে? N+1 রাখতে হলে কী বদলাবেন?",
      idealAnswer:
        "মোট load = ৪ × ৭০% = ২৮০% (এক server-এর হিসাবে)। একটা মরলে বাকি তিনটায় ২৮০ ÷ ৩ ≈ ৯৩% করে, knee-এর অনেক উপরে, latency লাফ দেবে আর হয়তো আরেকটা পড়বে (cascading)। N+1-এ k = ১ failure-এর পরেও প্রতিটা ধরা যাক ৭০%-এর নিচে থাকতে হলে লাগবে ২৮০ ÷ ৭০ = ৪টা চালু অবস্থায়, অর্থাৎ মোট ৫টা server; তখন স্বাভাবিক দিনে প্রতিটা ২৮০ ÷ ৫ = ৫৬%। অথবা ৪টাই রাখতে চাইলে প্রতিটাকে বড় করে (scale up) utilization ৫২%-এর নিচে নামাতে হবে, যাতে একটা মরলেও বাকি তিনটা ৭০%-এর নিচে থাকে।",
    },
  ],

  interviewQuestions: [
    {
      question:
        "Vertical আর horizontal scaling-এর মধ্যে কিভাবে সিদ্ধান্ত নেবেন? একটা e-commerce system-এর উদাহরণ দিন।",
      answerOutline: `- প্রথমে bottleneck আর resource চিহ্নিত করুন (CPU, RAM/working set, IOPS, network, lock)
- Tier অনুযায়ী: stateless web/API আর worker → scale out (LB/queue); cache → বড় memory, তারপর cluster; database → আগে scale up, তারপর replica, শেষে sharding
- Vertical-এর সীমা: ছাদ, উপরে বাঁকা খরচ আর license, SPOF, resize-এ downtime, single-thread/NUMA
- Horizontal-এর দাম: stateless হতে হবে, network hop, partial failure, consistency, operational জটিলতা
- Diagonal: মিষ্টি size বাছুন (load test), তারপর সংখ্যা; N+1 headroom উল্লেখ করুন`,
    },
    {
      question:
        "Peak 6,000 req/s। একটা server 1,000 req/s পর্যন্ত যায়। Availability-সহ কয়টা server লাগবে?",
      answerOutline: `- Knee-এর আগে থাকতে target utilization বলুন, যেমন ৭০% → 700 req/s প্রতি server
- 6,000 ÷ 700 = ৮.৬ → ৯টা (N)
- একটা failure সহ্য: ১০টা (N+1); deploy-এর সময় failure-ও ধরলে ১১টা (N+2)
- AZ-স্তরে: ৩টা AZ-এ একটা AZ হারালেও চলতে হলে প্রতিটা AZ-এ peak-এর ৫০% → মোট ১৫০%
- তুলনা: ২টা বড় machine হলে প্রতিটাকে একা পুরো 6,000 নিতে হবে, অর্ধেক hardware অলস`,
    },
    {
      question:
        "আপনি database-এর machine 32 থেকে 64 core করলেন, কিন্তু throughput প্রায় বাড়ল না। কেন হতে পারে?",
      answerOutline: `- Bottleneck CPU ছিল না: disk IOPS/throughput, working set RAM-এ না ধরা, network
- Lock contention: hot row, একটা global lock, WAL লেখা serialize হয় (USL-এর σ)
- Coherency খরচ: অনেক core একই memory-তে, cache line নিয়ে কাড়াকাড়ি (κ); NUMA-তে remote memory access
- Connection-এর ভিড়: হাজার connection, context switch; pooler দরকার
- Single-threaded অংশ: replication apply, কিছু background কাজ
- কী করবেন: load test-এ core অনুযায়ী throughput মাপুন, wait event দেখুন; তারপর read replica বা sharding`,
    },
    {
      question:
        "Production database downtime ছাড়া (বা খুব কম downtime-এ) কিভাবে বড় করবেন?",
      answerOutline: `- Stop/start resize-এ কয়েক মিনিট write বন্ধ + ঠান্ডা cache, তাই সরাসরি না
- Replica আগে বড় করুন, replication lag শূন্যে আসা পর্যন্ত অপেক্ষা
- Failover: replica-কে primary, app-এর connection নতুন primary-তে (কয়েক সেকেন্ড write বন্ধ)
- পুরনো primary বড় করে replica হিসেবে ফেরত
- Cache warm-up, connection pool, monitoring, rollback পরিকল্পনা; managed DB-র Multi-AZ এই কৌশলই কাজে লাগায়`,
    },
    {
      question:
        "Load balancer-এর পেছনে কিছু server 8 vCPU আর কিছু 16 vCPU। কিভাবে traffic ভাগ করবেন?",
      answerOutline: `- সমান ভাগে ছোটগুলো আগে knee-তে পৌঁছায়
- Weight দিন মাপা ক্ষমতা অনুযায়ী (load test), vCPU গুনে না; CPU generation আর single-thread-এর প্রভাব
- Least connections / least response time নিজে মানিয়ে নেয়, weight-এর সাথে মেশানো যায়
- নতুন server-এ slow start, যাতে ঠান্ডা cache-এ ডুবে না যায়
- Metric per-group দেখুন; গড় CPU-তে autoscaling ভুল সিদ্ধান্ত নেয়`,
    },
  ],

  summary: {
    points: [
      "Scale up = একটা machine-এ বেশি CPU, RAM, IOPS, network; scale out = একই রকম আরও machine, সামনে LB বা queue।",
      "আগে মাপুন কোন resource ফুরাচ্ছে; ঠিক instance family বাছাও vertical scaling।",
      "বড় box linear বাড়ে না: single thread, lock, NUMA, GC; USL core-এর জন্যও খাটে।",
      "প্রতি req/s-এর খরচ U-আকারের: খুব ছোটতে স্থির খরচ, খুব বড়তে efficiency হারায়; মাঝের size বেছে সংখ্যা বাড়ান (diagonal)।",
      "k-টা failure সহ্য করতে বাড়তি = k ÷ (N − k); দুটো বড় machine-এ redundancy সবচেয়ে দামি।",
      "Stateless app → scale out; database → আগে scale up (working set RAM-এ), তারপর replica, শেষে sharding।",
      "Cloud-এ resize সাধারণত stop/start; database-এ replica আগে বড় করে failover করলে downtime কয়েক সেকেন্ডে নামে।",
    ],
    diagram: {
      id: "day-013-summary",
      caption: "এক নজরে Vertical vs Horizontal Scaling",
      alt: "বামে একটা হাইলাইট করা বড় Server, লেখা Scale up; ডানে Load Balancer থেকে তিনটা একই রকম Server, লেখা Scale out; নিচে Database, লেখা আগে up।",
    },
  },
};
