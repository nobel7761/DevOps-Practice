// Day 17 · Caching — Phase 2 lesson. Application/data caching; HTTP and edge
// caching were Day 11 (CDN) and proxy caching Day 15, so they're only recapped.

import { topicHrefForDay } from "@/lib/data/courses/system-design-a-z";
import type { SdLesson } from "@/lib/system-design/lesson.types";

export const day017Lesson: SdLesson = {
  topicId: "sd-day-017",
  day: 17,
  title: "Caching",
  definition:
    "Caching হলো বারবার লাগে এমন data-র একটা কপি দ্রুত আর কাছের জায়গায় (সাধারণত memory-তে) রেখে দেওয়া, যাতে প্রতিবার ধীর আসল উৎস (database, অন্য service) পর্যন্ত যেতে না হয়।",

  objectives: [
    "Cache কেন latency আর database load দুটোই কমায়, hit ratio দিয়ে গড় latency আর database-এ কত query যাবে হিসাব করে দেখাতে পারবেন।",
    "Cache-aside, read-through, write-through, write-behind আর write-around কিভাবে কাজ করে আর cache বা database fail করলে প্রতিটা কেমন আচরণ করে, তুলনা করতে পারবেন।",
    "LRU, LFU, FIFO আর TTL-ভিত্তিক eviction, আর Redis-এর maxmemory policy থেকে কাজের সাথে মিলিয়ে সঠিকটা বাছতে পারবেন।",
    "Write-এর পরে cache-এ পুরনো data কিভাবে থেকে যায় (update race) ব্যাখ্যা করে, delete-on-write, delayed double delete, lease আর TTL দিয়ে সেটা সামলাতে পারবেন।",
    "Cache stampede, hot key, cache penetration আর cache avalanche চিনে প্রতিটার প্রতিকার (lock, early expiration, negative caching, TTL jitter) ডিজাইন করতে পারবেন।",
  ],

  prerequisites: [
    { day: 5, title: "Scalability", href: topicHrefForDay(5) },
    { day: 10, title: "Databases", href: topicHrefForDay(10) },
    { day: 11, title: "CDN", href: topicHrefForDay(11) },
  ],

  problem: {
    markdown: `[Day 10](${topicHrefForDay(10)})-এর "হাটবাজার" এখন বড় হয়েছে। ৫০,০০০ product, আর প্রতিটা product page বানাতে একটা ভারী query চলে: product-এর তথ্য, দাম, stock, seller, আর review-এর গড় rating, কয়েকটা table JOIN করে। Index ঠিক থাকার পরেও query-টা নেয় **~৩০০ms**।

শুক্রবার সকালের "সাপ্তাহিক বাজার" sale শুরু হলো। Traffic সেকেন্ডে ১,০০০ page view।

- প্রতিটা page view মানে database-এ একটা ভারী query। Database CPU 100%, query-গুলো লাইনে দাঁড়ায়, ৩০০ms হয়ে যায় ৩ সেকেন্ড।
- App server বাড়ানো হলো ([Day 5](${topicHrefForDay(5)})-এর horizontal scaling)। লাভ হলো না, উল্টো ক্ষতি: বেশি app server মানে database-এ একসাথে আরও বেশি query। Bottleneck app না, database।
- Log দেখে টিম অবাক: ১,০০০ request-এর প্রায় ৯০০টাই **মাত্র ২০০টা** জনপ্রিয় product-এর (চাল, ডাল, তেল, ডিম)। আর এগুলোর দাম দিনে বড়জোর একবার-দুবার বদলায়।

অর্থাৎ database প্রতি সেকেন্ডে একই ২০০টা প্রশ্নের উত্তর নতুন করে হিসাব করছে, অথচ উত্তর প্রায় কখনো বদলায় না। এটা কাজ না, অপচয়।

আরও database server কেনা যায়, কিন্তু সেটা দামি, আর read replica ([Day 28](${topicHrefForDay(28)})) দিলেও প্রতিটা replica-কে সেই ৩০০ms-এর query-ই চালাতে হয়। দরকার এমন কিছু, যেটা একবার হিসাব করা উত্তর মনে রাখবে আর পরের ৯৯৯ জনকে সেটাই দিয়ে দেবে।`,
    diagrams: [
      {
        id: "day-017-before",
        caption:
          "আগে: প্রতিটা page view-এ একই ভারী query database-এ যায়; app server বাড়ালে database-এ চাপ আরও বাড়ে।",
        alt: "User-রা আর mobile app Load Balancer-এ request পাঠায়, Load Balancer দুটো App server-এ পাঠায়, দুটো App-ই একই query নিয়ে PostgreSQL-এ যায়; PostgreSQL লাল চিহ্নে CPU 100% লেখা।",
      },
    ],
  },

  analogy: {
    markdown: `পাড়ার মুদি দোকানের কথা ভাবুন। দোকানের পেছনে একটা বড় **গুদাম**, সেখানে শত রকমের জিনিস। কিন্তু দোকানদার প্রতিবার "আধা কেজি চাল দিন" শুনে গুদামে দৌড়ান না। Counter-এর ঠিক পেছনে একটা ছোট **তাক** আছে, সেখানে সবচেয়ে বেশি বিক্রি হওয়া জিনিসগুলো: চাল, ডাল, তেল, লবণ।

- Customer চাইল, তাকে আছে: হাত বাড়িয়ে দিলেন, ৫ সেকেন্ড (**cache hit**)।
- তাকে নেই, যেমন কেউ চাইল দারুচিনি: গুদামে যেতে হলো, ৫ মিনিট (**cache miss**)। ফেরার সময় ভাবলেন, আজ অনেকে দারুচিনি চাইছে, এক প্যাকেট তাকেও রেখে দিই (**cache-এ ভরা**)।
- তাকে জায়গা মাত্র কয়েকটা জিনিসের। নতুন কিছু রাখতে হলে যেটা অনেকদিন কেউ চায়নি, সেটা গুদামে ফেরত (**eviction**)।
- সবচেয়ে বিপজ্জনক মুহূর্ত: সরকার তেলের দাম কমাল। খাতায় (database) নতুন দাম লেখা হলো, কিন্তু তাকের বোতলে পুরনো দামের ট্যাগ রয়ে গেল। Customer পুরনো দামই দেখল (**stale data**)। তাই দাম বদলালে তাকের ট্যাগও বদলাতে বা সরাতে হয় (**invalidation**)।
- কিছু জিনিস তাকে রাখাই যায় না, যেমন দুধ: কয়েক ঘণ্টায় নষ্ট। তাই প্রতিটা জিনিসের একটা মেয়াদ (**TTL**)।

তাক গুদামের বিকল্প না। তাক ছোট, শুধু কপি রাখে; আসল হিসাব সবসময় খাতায় আর গুদামে। Cache ঠিক এরকম: আসল উৎসের (database) সামনে একটা ছোট, দ্রুত, অস্থায়ী কপি।`,
    diagrams: [
      {
        id: "day-017-analogy",
        caption:
          "মুদি দোকান: counter-এর ছোট তাক (cache) থেকে সাথে সাথে, না থাকলে পেছনের গুদাম (database) থেকে ধীরে; তাকের দামের ট্যাগ পুরনো হতে পারে।",
        alt: "বামে customer আর দোকানদার। মাঝে counter-এর তাক, চারটা জায়গায় চাল ৮০ টাকা, ডাল ১৪০ টাকা, তেল ১৯০ টাকা (পুরনো দাম, হলুদ দাগ), লবণ ৪০ টাকা। ডানে পেছনের গুদাম, অনেক বাক্স। দোকানদার থেকে তাকের দিকে hit তীর, তাক থেকে গুদামে dashed miss তীর।",
      },
    ],
  },

  coreConcept: {
    markdown: `**Cache** হলো আসল data-র একটা অস্থায়ী কপি, এমন জায়গায় রাখা যেখান থেকে পড়া অনেক দ্রুত আর সস্তা। দুটো শব্দ সারা lesson-এ আসবে:
- **Cache hit**: চাওয়া জিনিস cache-এ পাওয়া গেল। দ্রুত।
- **Cache miss**: পাওয়া গেল না, আসল উৎসে যেতে হলো। ধীর।

**কেন cache এত কাজের, দুই কারণে:**
1. **Latency**: [Day 7](${topicHrefForDay(7)})-এর latency-র সিঁড়ি মনে করুন। RAM থেকে পড়া ~১০০ns, একই datacenter-এ network round trip ~০.৫ms, আর একটা ভারী query কয়েকশো ms। Cache আপনাকে সিঁড়ির কয়েক ধাপ নিচে নামিয়ে আনে।
2. **Database load**: [Day 10](${topicHrefForDay(10)})-এ দেখেছি database scale করা কঠিন আর দামি। Cache একই প্রশ্নের উত্তর মনে রেখে database-কে বাঁচায়। হাটবাজারে ১,০০০ req/s-এর ৯৫% cache থেকে গেলে database পায় মাত্র ৫০ query/s।

### সবচেয়ে প্রচলিত pattern: Cache-aside (lazy loading)

App নিজেই cache আর database দুটোর সাথে কথা বলে:
1. **পড়া**: আগে cache-এ খোঁজো (\`GET product:1\`)। পেলে সেটাই ফেরত (hit)।
2. না পেলে (miss) database থেকে পড়ো।
3. ফলটা cache-এ রেখে দাও, একটা মেয়াদ সহ (\`SET product:1 <json> EX 300\`), তারপর ফেরত দাও।
4. **লেখা**: database-এ লেখো, তারপর cache থেকে ওই key **মুছে দাও** (\`DEL product:1\`)। পরের read নতুন data এনে আবার ভরবে।

"Lazy" কারণ cache-এ শুধু সেটাই ঢোকে যেটা কেউ সত্যিই চেয়েছে। ২০০টা জনপ্রিয় product নিজে থেকেই cache-এ থাকে, বাকি ৪৯,৮০০টা জায়গা নষ্ট করে না।

### TTL: প্রতিটা কপির মেয়াদ

**TTL (Time To Live)** মানে কপিটা কতক্ষণ বৈধ। মেয়াদ শেষ হলে cache নিজেই মুছে দেয়, পরের request database থেকে নতুন আনে। TTL দুটো কাজ করে: পুরনো data কতক্ষণ থাকতে পারে তার একটা উপরের সীমা দেয়, আর কেউ আর না চাইলে memory খালি করে। ছোট TTL = তাজা data কিন্তু বেশি miss; বড় TTL = বেশি hit কিন্তু বেশিক্ষণ পুরনো থাকার ঝুঁকি।

### Hit ratio: cache কতটা কাজ করছে

**Hit ratio** = hit ÷ (hit + miss)। ধরুন cache থেকে পড়তে ১ms, database-এ ৩০ms। Miss হলে দুটোই লাগে (আগে cache দেখা, তারপর database):

গড় latency = ১ + (১ − hit ratio) × ৩০ ms
- ৮০% hit: ১ + ০.২ × ৩০ = **৭ms**
- ৯৫% hit: ১ + ০.০৫ × ৩০ = **২.৫ms**
- ৯৯% hit: ১ + ০.০১ × ৩০ = **১.৩ms**

Database-এ যায় শুধু miss-গুলো। ১০,০০০ read/s-এ ৮০% hit মানে database-এ ২,০০০ query/s, আর ৯৯% hit মানে মাত্র ১০০। খেয়াল করুন: **৯০% থেকে ৯৯%-এ যাওয়া শুনতে ছোট, কিন্তু database load দশ ভাগের এক ভাগ হয়ে যায়।** তাই hit ratio-র শেষ কয়েক শতাংশই সবচেয়ে মূল্যবান।

### Cache কোথায় কোথায় থাকে

একটা request user-এর phone থেকে disk পর্যন্ত যেতে কয়েকটা স্তর পেরোয়, আর প্রায় প্রতিটা স্তরে একটা cache থাকতে পারে। আগের কয়েকটা দিনে আমরা কয়েকটা দেখে এসেছি, সংক্ষেপে:
- **Browser আর CDN** ([Day 11](${topicHrefForDay(11)})): \`Cache-Control\`, \`ETag\` দিয়ে HTTP response cache, edge-এ কপি, origin shield আর request collapsing। ওগুলো আবার বলছি না।
- **Reverse proxy / API gateway** ([Day 15](${topicHrefForDay(15)}), [Day 16](${topicHrefForDay(16)})): পুরো HTTP response, micro-caching।
- **Session store** ([Day 14](${topicHrefForDay(14)})): Redis-এ session, TTL সহ। ওটা আসলে cache না, state; হারালে user logout হয়।

আজকের মনোযোগ বাকি তিনটায়, **application/data cache**:
- **App in-memory (local) cache**: App process-এর নিজের RAM-এ একটা map। সবচেয়ে দ্রুত, কিন্তু প্রতিটা server-এর আলাদা কপি।
- **Distributed cache (Redis, Memcached)**: আলাদা server, সব app server একই cache দেখে। একটা network hop লাগে, কিন্তু একবার মুছলে সবার জন্য মুছে যায়।
- **Database-এর নিজের buffer cache**: [Day 10](${topicHrefForDay(10)})-এ দেখা shared buffers, যেখানে disk-এর page RAM-এ থাকে। এটা database নিজেই চালায়। কিন্তু খেয়াল করুন, এটা **page** cache করে, **query-র ফল** না। Page RAM-এ থাকলেও ৩০০ms-এর JOIN আর হিসাব প্রতিবার চলে। তাই application cache আলাদা লাগে।

### কী cache করবেন, কী করবেন না

ভালো প্রার্থী: বারবার পড়া হয়, কম বদলায়, বানাতে দামি (product page, category list, user profile, হিসাব করা rating, বাইরের API-র উত্তর)।

খারাপ প্রার্থী: প্রায় প্রতিবার বদলায় (live stock count যেখানে ভুল চলবে না), একবারই পড়া হয় (একটা report), বা ভুল হলে ক্ষতি বড় (account balance, payment status)। এসব জায়গায় cache দিলে hit ratio কম, কিন্তু stale data-র ঝুঁকি পুরো।

মনে রাখুন, cache একটা **কপি**। আসল সত্য (source of truth) সবসময় database-এ। Cache মুছে গেলে system ধীর হবে, কিন্তু ভুল হবে না, এই নিশ্চয়তা রাখা আপনার দায়িত্ব।`,
    diagrams: [
      {
        id: "day-017-main",
        caption:
          "Cache-aside: app আগে Redis দেখে; miss হলে database থেকে পড়ে, ফল TTL সহ Redis-এ রাখে।",
        alt: "Client App Server-কে GET /product/1 পাঠায়। App Server থেকে Redis-এ প্রথম তীর: GET key, hit। App থেকে Database-এ dashed তীর: miss হলে SELECT। Database থেকে Redis-এ dashed তীর: SET key EX ttl।",
        downloadable: true,
      },
      {
        id: "day-017-before-after",
        caption:
          "পাশাপাশি: cache ছাড়া প্রতিটা page-এ ~৩০০ms-এর query; cache-aside-এ hit হলে কয়েক ms, database-এ যায় শুধু miss। (সংখ্যাগুলো উদাহরণ)",
        alt: "উপরে আগের design: user থেকে load balancer হয়ে দুটো app, দুটোই database-এ, database লাল। নিচে cache-aside: client থেকে app, app থেকে Redis আর miss-এ database। নিচে latency আর database load-এর পার্থক্য লেখা।",
      },
      {
        id: "day-017-layers",
        caption:
          "Cache-এর স্তর: browser থেকে database-এর buffer cache পর্যন্ত; উপরের স্তর যত আগে উত্তর দেয়, নিচের স্তরে তত কম চাপ।",
        alt: "ছয়টা সারির তালিকা, প্রতিটায় স্তর, কোথায়, কী রাখে আর খরচ: Browser/app cache (user-এর device, network লাগে না), CDN edge (কাছের শহর, ১০-৩০ms), Reverse proxy/gateway (datacenter-এর দরজা, পুরো HTTP response), App in-memory (process-এর RAM, ১০০ns থেকে µs), Distributed cache Redis/Memcached (আলাদা server, ০.৫-১ms), DB buffer cache (database-এর RAM, disk-এর page, query তবুও চলে)।",
      },
    ],
  },

  deepDive: [
    {
      title: "পাঁচটা cache pattern, আর cache বা database fail করলে কে কী করে",
      markdown: `Cache-aside একমাত্র উপায় না। মূল প্রশ্ন দুটো: **read-এ miss হলে কে database থেকে আনে**, আর **write-এ কোথায় আগে লেখা হয়**।

**১. Cache-aside (lazy loading)**: উপরে দেখেছি। App নিজে cache দেখে, miss-এ database থেকে এনে ভরে; write-এ database-এ লিখে cache মোছে।
- Cache down হলে: সব read database-এ যায়। System ধীর, কিন্তু সঠিক। (তবে database কি পুরো load নিতে পারবে? না পারলে এটাই outage, নিচে "avalanche" দেখুন।)
- দুর্বলতা: প্রতিটা miss-এ তিনটা ধাপ (cache, database, আবার cache), আর read আর write-এর মাঝে race (পরের অংশে)।

**২. Read-through**: App শুধু cache-কে চেনে। Miss হলে cache (বা cache library) নিজেই database থেকে এনে ভরে দেয়। Java-র Caffeine বা Guava-র \`LoadingCache\`-এ একটা loader function দিলে ঠিক এটা হয়। Code পরিষ্কার, আর একই key-র একসাথে আসা miss-গুলো library এক load-এ মেটাতে পারে। কিন্তু cache layer-কে database চিনতে হয়।

**৩. Write-through**: প্রতিটা write cache-এ যায়, আর cache (বা app) **সাথে সাথে** database-এও লেখে; দুটো শেষ হলে তবে "OK"।
- লাভ: cache সবসময় তাজা, write-এর ঠিক পরের read-ও hit।
- খরচ: প্রতিটা write একটু ধীর (দুই জায়গায় লেখা), আর এমন data-ও cache-এ ঢোকে যা হয়তো কেউ পড়বেই না। দুই লেখার মাঝে একটা fail করলে দুটো অমিল হতে পারে, তাই cache-এ TTL তবুও রাখুন।

**৪. Write-behind (write-back)**: Write শুধু cache-এ যায়, "OK" সাথে সাথে। Database-এ লেখা হয় **পরে**, প্রায়ই batch করে।
- লাভ: write খুব দ্রুত; একই key-তে ১০০ বার লিখলে database-এ হয়তো একবার। View counter, like count-এর মতো জিনিসে কাজের।
- ঝুঁকি: database-এ পৌঁছানোর আগে cache node মরলে ওই write-গুলো **হারিয়ে যায়**। তাই টাকা বা order-এর মতো data-তে এটা চলবে না, যদি না cache নিজে durable হয় (persistence, replication)। [Day 10](${topicHrefForDay(10)})-এর buffer cache আসলে write-back-ই করে, কিন্তু আগে WAL-এ লিখে নিরাপদ থাকে, এই পার্থক্যটা খেয়াল করুন।

**৫. Write-around**: Write সরাসরি database-এ, cache-কে ছোঁয় না (বা শুধু মুছে দেয়)। পরের read-এ miss হয়ে cache ভরে।
- লাভ: একবার লেখা কিন্তু কম পড়া data (log, পুরনো order) দিয়ে cache ভরে না।
- খরচ: সদ্য লেখা data-র প্রথম read সবসময় miss।

বাস্তবে সবচেয়ে প্রচলিত জুটি: **cache-aside read + write-এ database তারপর cache delete** (অর্থাৎ write-around + invalidate)। কারণ এটা সরল, cache down হলেও সঠিক থাকে, আর কোনো বিশেষ cache feature লাগে না।`,
      diagrams: [
        {
          id: "day-017-write-patterns",
          caption:
            "চারটা pattern পাশাপাশি: read-through-এ cache নিজে আনে; write-through-এ দুটোতেই লিখে তবে OK; write-behind-এ database পরে; write-around-এ cache এড়িয়ে database।",
          alt: "চারটা সারি, প্রতিটায় App, Cache আর DB বাক্স। Read-through: App থেকে Cache-এ read, Cache থেকে DB-তে miss হলে load। Write-through: App থেকে Cache-এ write, Cache থেকে DB-তে সাথে সাথে write। Write-behind: App থেকে Cache-এ write আর OK, Cache থেকে DB-তে dashed তীর, পরে batch-এ। Write-around: App থেকে DB-তে বাঁকা তীর, write সরাসরি DB-তে, আর App থেকে Cache-এ dashed DEL।",
        },
      ],
    },
    {
      title:
        "Invalidation আর consistency: update race, delete বনাম update, delayed double delete",
      markdown: `Phil Karlton-এর নামে প্রচলিত একটা বিখ্যাত কথা আছে: **"There are only two hard things in Computer Science: cache invalidation and naming things."** মজা করে বলা, কিন্তু প্রথম অংশটা সত্যি। কারণ cache আর database দুটো আলাদা system, আর দুটোকে একসাথে, atomically বদলানোর কোনো উপায় নেই।

**Invalidation-এর তিনটা উপায়:**
1. **শুধু TTL**: কিছু করবেন না, মেয়াদ শেষে নিজে থেকেই তাজা হবে। সরল, কিন্তু পুরো TTL পর্যন্ত পুরনো data থাকতে পারে। Category list, "জনপ্রিয় product"-এর মতো জিনিসে যথেষ্ট।
2. **Write-এ explicit delete**: Database-এ লেখার পরে \`DEL key\`। প্রায় সাথে সাথে তাজা।
3. **Event দিয়ে**: Database-এর change stream পড়ে আলাদা একটা process cache মোছে। App-কে মনে রাখতে হয় না, আর অন্য service-এর write-ও ধরা পড়ে। (Change Data Capture নিয়ে [Day 73](${topicHrefForDay(73)})-এ গভীরে যাব।)

তিনটাতেই **TTL রাখুন**। Delete কখনো fail করবে, event কখনো হারাবে; TTL হলো শেষ রক্ষাকবচ, যেটা বলে "যত খারাপই হোক, এর বেশি পুরনো না"।

**Write-এ cache update করবেন, নাকি delete?** নতুন দাম তো হাতেই আছে, cache-এ বসিয়ে দিলেই তো হয়? সমস্যা হলো দুটো concurrent write:
- Request X দাম ৭৫ লিখল database-এ, Request Y লিখল ৭০ (Y পরে, তাই database-এ ৭০)।
- কিন্তু cache-এ পৌঁছানোর ক্রম উল্টে গেল: Y আগে \`SET 70\`, X পরে \`SET 75\`।
- এখন database ৭০, cache ৭৫, আর এটা TTL পর্যন্ত থাকবে।

Delete-এ এই সমস্যা নেই: দুটো \`DEL\`-এর ক্রম যাই হোক, ফল একই, key নেই। Delete **idempotent** আর ক্রমের উপর নির্ভর করে না। আর cache-এ ঠিক কোন রূপে data থাকে (হয়তো কয়েকটা table মিলিয়ে বানানো JSON), write path-কে সেটা জানতেও হয় না। তাই সাধারণ নিয়ম: **database-এ লেখো, তারপর cache delete করো।**

**ক্রম কেন "আগে database, পরে delete"?** উল্টোটা ভাবুন: আগে delete, তারপর database update। এই দুইয়ের ফাঁকে একটা read এসে miss পেল, database থেকে **পুরনো** দাম পড়ে cache-এ বসিয়ে দিল। তারপর database-এ নতুন দাম লেখা হলো। Cache-এ পুরনো দাম, পুরো TTL। এই ফাঁকটা বেশ বড় (একটা database write-এর সময়), তাই এটা প্রায়ই ঘটে।

**তবুও একটা race বাকি থাকে** (নিচের ধাপে ধাপে diagram):
1. Request A-র miss, database থেকে পড়ল দাম ৮০।
2. A cache-এ লেখার আগেই আটকে গেল (GC pause, ধীর network)।
3. Request B database-এ ৭৫ লিখল, তারপর \`DEL\` করল (key তো নেই, কিছুই হলো না)।
4. A জেগে উঠে পুরনো ৮০ cache-এ \`SET\` করল।

এখন database ৭৫, cache ৮০। এটা ঘটার জন্য একটা read-কে একটা পুরো write (database write + delete)-এর চেয়েও বেশি সময় আটকে থাকতে হয়, তাই বিরল। কিন্তু যথেষ্ট traffic-এ বিরল জিনিসও রোজ ঘটে। প্রতিকার:
- **ছোট TTL**: ক্ষতির সর্বোচ্চ সময় সীমিত।
- **Delayed double delete**: B delete-এর পরে কিছুক্ষণ অপেক্ষা করে (একটা ধীর read যতক্ষণ নিতে পারে, যেমন কয়েকশো ms থেকে এক সেকেন্ড) **আবার** delete করে, প্রায়ই একটা background job বা delay queue দিয়ে। A-র বসানো পুরনো কপিটা দ্বিতীয় delete-এ মুছে যায়। এটা সম্ভাবনা কমায়, পুরো নিশ্চয়তা দেয় না (A দ্বিতীয় delete-এর চেয়েও বেশি দেরি করলে?)।
- **Lease / version check**: Miss-এর সময় cache একটা token দেয়; মাঝে delete হলে token বাতিল হয়ে যায়, তাই A-র দেরিতে আসা \`SET\` প্রত্যাখ্যাত হয়। Facebook-এর memcache ঠিক এটা করে (শেষ অংশে)। একই ধারণা: data-তে version নম্বর রেখে শুধু নতুনতর version লিখতে দেওয়া।

শেষ কথা: cache-aside দিয়ে আপনি **eventual consistency** পান, strong না। "কয়েক সেকেন্ড পুরনো দাম দেখালে কি চলবে?" এই প্রশ্নের উত্তর product-এর সিদ্ধান্ত, শুধু engineering-এর না। Checkout-এর মুহূর্তে দাম আর stock সবসময় database থেকে যাচাই করুন, cache থেকে না। Consistency-র ধরন নিয়ে [Day 47](${topicHrefForDay(47)})-এ গভীরে যাব।`,
      diagrams: [
        {
          id: "day-017-race",
          caption:
            "ধাপে ধাপে: cache-aside read আর write, তারপর যে race-এ পুরনো দাম cache-এ বসে যায়, আর delayed double delete কিভাবে সেটা মোছে।",
          alt: "চারটা কলাম: Request A (পড়া), Redis, Database, Request B (লেখা)। ধাপগুলো: A GET product:1, miss; A database থেকে price 80 পড়ে; B database-এ price 75 লেখে; B DEL product:1; A পুরনো 80 SET করে; পরের সবাই 80 পায়; প্রায় এক সেকেন্ড পরে B আবার DEL product:1।",
        },
      ],
    },
    {
      title:
        "Eviction: LRU, LFU, FIFO, TTL, Redis-এর maxmemory policy, আর cache-এর মাপ",
      markdown: `Cache-এর memory সীমিত। ভরে গেলে নতুন কিছু রাখতে কাউকে সরাতে হবে। কাকে, সেটা **eviction policy**।

- **LRU (Least Recently Used)**: যেটা সবচেয়ে বেশি সময় কেউ ছোঁয়নি, সেটা যাবে। ধারণা: সম্প্রতি ব্যবহৃত জিনিস আবার ব্যবহৃত হবে। বেশিরভাগ ক্ষেত্রে ভালো default।
- **LFU (Least Frequently Used)**: যেটা সবচেয়ে কম বার ব্যবহৃত, সেটা যাবে। স্থায়ীভাবে জনপ্রিয় জিনিস (চাল, ডাল) বাঁচে, এমনকি কয়েক মিনিট কেউ না চাইলেও। কিন্তু পুরনো জনপ্রিয়তা ধীরে কমাতে হয় (decay), নইলে গত মাসের ভাইরাল জিনিস চিরকাল জায়গা দখল করে।
- **FIFO**: যে আগে ঢুকেছে, সে আগে বের হয়, ব্যবহার যাই হোক। সরল, কিন্তু সবচেয়ে গরম key-ও পুরনো হলে মুছে যায়। খুব কম ব্যবহার হয়।
- **TTL-ভিত্তিক**: যার মেয়াদ সবচেয়ে কাছে, সে আগে।

**LRU-র ভেতরে:** নিখুঁত LRU বানাতে লাগে একটা **hash map** (key → node, O(1)-এ খোঁজা) আর একটা **doubly linked list** (ব্যবহারের ক্রমে সাজানো)। GET হলে node-টা list-এর মাথায় সরে, নতুন key মাথায় ঢোকে, আর জায়গা না থাকলে লেজের node মোছে। তিনটাই O(1)। Interview-তে "LRU cache implement করুন" এই কারণেই এত জনপ্রিয়।

**LRU-র একটা দুর্বলতা, scan:** কেউ একবার পুরো catalogue পড়ল (একটা report, একটা crawler)। লাখ লাখ key একবার করে ঢুকল আর আসল গরম key-গুলো লেজে ঠেলে মুছে দিল। তাই আধুনিক cache-গুলো মিশ্র কৌশল নেয়: যেমন Java-র **Caffeine** library **W-TinyLFU** ব্যবহার করে, যেটা নতুন key-কে ঢোকার আগে "এর কি আসলেই বেশি চাহিদা?" যাচাই করে।

**Redis কিভাবে করে:** Redis প্রতিটা key-র জন্য linked list রাখে না, memory বাঁচাতে। Eviction-এর সময় কয়েকটা key এলোমেলোভাবে **নমুনা** নিয়ে (\`maxmemory-samples\`, default 5) তাদের মধ্যে সবচেয়ে পুরনোটা মোছে। এটা **approximate LRU**: নিখুঁত না, কিন্তু খুব কাছাকাছি, আর খরচ প্রায় শূন্য। LFU-র জন্য Redis প্রতিটা key-তে একটা ছোট logarithmic counter রাখে, যেটা সময়ের সাথে কমে।

**Redis-এর \`maxmemory-policy\`:** \`maxmemory\` সীমা ছুঁলে কী হবে:
| Policy | কী করে |
|---|---|
| \`noeviction\` (default) | কিছু মোছে না; নতুন write-এ OOM error দেয় |
| \`allkeys-lru\` / \`allkeys-lfu\` | যেকোনো key থেকে LRU/LFU অনুযায়ী মোছে |
| \`volatile-lru\` / \`volatile-lfu\` | শুধু যেসব key-তে TTL আছে, তাদের থেকে |
| \`allkeys-random\` / \`volatile-random\` | এলোমেলো |
| \`volatile-ttl\` | TTL-ওয়ালা key-দের মধ্যে যার মেয়াদ সবচেয়ে কাছে |

খাঁটি cache-এর জন্য সাধারণত \`allkeys-lru\` বা \`allkeys-lfu\`। Default \`noeviction\` cache-এর জন্য বিপজ্জনক: memory ভরে গেলে app-এর প্রতিটা \`SET\` fail করবে (lab-এ দেখবেন)। আর [Day 14](${topicHrefForDay(14)})-এর সতর্কতা মনে রাখুন: একই Redis-এ cache আর session রাখলে \`allkeys-lru\` চুপচাপ session-ও মুছে দেবে।

**Cache কত বড় হবে: working set**

পুরো database cache-এ রাখার দরকার নেই। দরকার **working set**: একটা নির্দিষ্ট সময়ে (ধরুন এক ঘণ্টায়) আসলে যে data চাওয়া হয়। বেশিরভাগ system-এ চাহিদা অসমান (**Pareto, ৮০/২০**-এর কাছাকাছি): অল্প কিছু key বেশিরভাগ request পায়।

হাটবাজারের হিসাব: ৫০,০০০ product, প্রতিটার cache করা JSON ~৪KB। সব রাখলে ২০০MB, যা আজকের দিনে কিছুই না। কিন্তু ধরুন user-ভিত্তিক data, ১ কোটি user × ২KB = ২০GB। এখানে সব রাখা দামি। যদি দেখা যায় সক্রিয় user ১০% আর তারাই ৯০% request করে, তাহলে ~২GB cache-এ প্রায় ৯০% hit ratio। এর পরে cache দ্বিগুণ করলে hit ratio হয়তো বাড়বে মাত্র কয়েক শতাংশ: **diminishing returns**। সঠিক মাপ ঠিক করার উপায় হলো hit ratio মাপা আর memory বাড়িয়ে-কমিয়ে দেখা কোথায় লাভ থেমে যায়। এছাড়া Redis-এ প্রতিটা key-র নিজস্ব overhead (key-র নাম, metadata) আছে, তাই data-র মাপের চেয়ে কিছু বেশি memory ধরুন। এই ধরনের হিসাব নিয়ে [Day 19](${topicHrefForDay(19)})-এ বিস্তারিত।`,
      diagrams: [
        {
          id: "day-017-lru",
          caption:
            "ভেতরের গঠন: LRU cache = hash map (key কোথায়) + doubly linked list (কে কতটা পুরনো); get, put আর evict তিনটাই O(1)।",
          alt: "বামে একটা Hash map বাক্স, চারটা entry: product:1, product:3, product:7, user:42, প্রতিটা থেকে dashed তীর নিচের list-এর node-এ। নিচে doubly linked list: product:7 (HEAD, সবশেষে ব্যবহৃত) ⇄ user:42 ⇄ product:1 ⇄ product:3 (TAIL, লাল দাগ, পরের eviction)। নিচে লেখা GET হলে node HEAD-এ সরে, জায়গা না থাকলে TAIL মোছে। উপরে নোট: Redis নিখুঁত list রাখে না, নমুনা নিয়ে সবচেয়ে পুরনোটা মোছে।",
        },
      ],
    },
    {
      title:
        "যখন cache নিজেই বিপদ: stampede, hot key, penetration আর avalanche",
      markdown: `Cache database-কে বাঁচায়, তাই cache-এর ব্যর্থতা মানে database-এর উপর হঠাৎ সব চাপ। চারটা পরিচিত রূপ:

**১. Cache stampede (thundering herd)**

[Day 11](${topicHrefForDay(11)})-এ CDN-এর edge-এ এটা দেখেছি: জনপ্রিয় key-র মেয়াদ শেষ, ঠিক সেই মুহূর্তে শত শত request, সবাই miss, সবাই database-এ একই ভারী query চালায়। সেখানে request collapsing আর stale-while-revalidate দেখেছিলাম। Application cache-এ উপায়গুলো:
- **Per-key lock (single flight)**: Miss হলে আগে একটা lock নাও, যেমন Redis-এ \`SET lock:product:1 1 NX PX 2000\` (NX = না থাকলে তবেই, PX = ২ সেকেন্ডে মেয়াদ, যাতে lock-ধারী মরলে lock চিরকাল না থাকে)। যে lock পায় সে database-এ যায়; বাকিরা একটু অপেক্ষা করে আবার cache দেখে। Lab-এ দেখবেন ২০টা একসাথে miss-এ database query ১৫-২০টা থেকে নেমে ১টা। একই process-এর ভেতরে Go-র \`singleflight\`-এর মতো library দিয়ে একই কাজ, Redis ছাড়াই। (Redis lock-এর সূক্ষ্মতা, যেমন fencing token, [Day 53](${topicHrefForDay(53)})-এ।)
- **Stale-while-revalidate**: মেয়াদ শেষ হলেও কিছুক্ষণ পুরনো কপি দিতে থাকো, আর পেছনে একজন নতুনটা আনুক। এজন্য cache-এ দুটো সময় রাখা হয়: "নরম মেয়াদ" (এর পরে refresh শুরু) আর "শক্ত মেয়াদ" (এর পরে আর দেওয়া যাবে না)।
- **Probabilistic early expiration**: মেয়াদ শেষ হওয়ার **আগেই**, এলোমেলোভাবে কোনো একটা request নিজে থেকে refresh করে, যাতে সবাই একই মুহূর্তে miss না পায়। জনপ্রিয় একটা রূপ (Vattani ও সহকর্মীদের, VLDB 2015-এর paper, "XFetch" নামে পরিচিত): প্রতিটা read-এ হিসাব করুন \`now − Δ × β × ln(rand())\`; এটা মেয়াদের সময় পেরোলে এখনই refresh করুন। এখানে Δ = গতবার refresh করতে কত সময় লেগেছিল, β ≥ ১ (সাধারণত ১), আর rand() ০ থেকে ১-এর মধ্যে এলোমেলো সংখ্যা। ln(rand()) ঋণাত্মক, তাই এটা "এখন"-এর চেয়ে একটু সামনের সময়। মেয়াদের অনেক আগে সম্ভাবনা প্রায় শূন্য, মেয়াদ যত কাছে আসে তত বাড়ে; আর যে key বানাতে বেশি সময় লাগে (Δ বড়), সে আরও আগে refresh হয়। কোনো lock বা সমন্বয় লাগে না, শুধু একটা হিসাব।
- **Background refresh**: খুব জনপ্রিয় কয়েকটা key একটা job নিয়মিত refresh করে, user-এর request কখনো miss-ই পায় না।

**২. Hot key**

একটা key এত জনপ্রিয় যে **একটা cache node**-ই আর সামলাতে পারে না। ঈদের দিন "সাপ্তাহিক বাজার offer" key-তে সেকেন্ডে লাখ request; cluster-এ ১০টা Redis node, কিন্তু key-টা থাকে একটায় (key থেকে node ঠিক হয় hash দিয়ে, [Day 31](${topicHrefForDay(31)})-এ consistent hashing)। ওই node-এর CPU বা network শেষ, বাকি ৯টা অলস। প্রতিকার:
- **Local cache-এ রাখা**: খুব গরম key প্রতিটা app server-এর memory-তেও রাখুন, কয়েক সেকেন্ডের TTL দিয়ে। Redis-এ যায় সেকেন্ডে প্রতি server থেকে একবার।
- **Key ভাগ করা (replication)**: \`offer:eid#0\` থেকে \`offer:eid#9\`, দশটা কপি, যেগুলো আলাদা node-এ পড়ে; read এলোমেলো একটা কপি থেকে। দাম: write-এ দশটাই বদলাতে বা মুছতে হয়।
- আগে মাপুন: Redis-এ \`redis-cli --hotkeys\` (LFU policy চালু থাকলে) বা প্রতিটা node-এর load দেখা।

**৩. Cache penetration**

যে key **database-এও নেই**, সেটা কখনো cache-এ ঢোকে না, তাই প্রতিটা request database-এ যায়। Bug-এ বা ইচ্ছা করে কেউ \`/product/99999999\`, \`/product/-1\` লাখবার চাইলে cache একদম কাজে আসে না। প্রতিকার:
- **Negative caching**: "নেই" উত্তরটাও cache করুন, ছোট TTL দিয়ে (যেমন ৩০ সেকেন্ড), যেমন \`product:99999999 → NULL\`। ছোট TTL কারণ পরে সত্যিই ওই id-তে product তৈরি হতে পারে।
- **Bloom filter**: সব বৈধ id-র একটা ছোট, memory-সাশ্রয়ী সংক্ষিপ্তসার। এটা নিশ্চিতভাবে বলতে পারে "এই id অবশ্যই নেই" (তাহলে database-এ যাওয়াই লাগে না), আর "হয়তো আছে" বললে তবেই খুঁজুন। এখন এটুকু জানলেই চলবে, [Day 24](${topicHrefForDay(24)})-এ Bloom filter গভীরে যাব।
- Input যাচাই আর rate limiting ([Day 18](${topicHrefForDay(18)})): \`-1\`-এর মতো অসম্ভব id request-এর দরজাতেই আটকান।

**৪. Cache avalanche**

অনেক key **একসাথে** হারানো। দুই কারণে:
- **একই TTL**: রাত ২টায় একটা job ৫০,০০০ product cache-এ ভরল, সবার TTL ঠিক ১ ঘণ্টা। রাত ৩টায় সবার মেয়াদ একসাথে শেষ, database-এ একসাথে ৫০,০০০ miss। প্রতিকার **TTL jitter**: TTL-এ একটু এলোমেলো যোগ করুন, যেমন ৩,৬০০ সেকেন্ডের বদলে ৩,৬০০ থেকে ৪,০০০-এর মধ্যে কিছু। মেয়াদ এক ঘণ্টা জুড়ে ছড়িয়ে যায়। (Lab-এর app-এ TTL ৩০ + ০-১০ সেকেন্ড।)
- **Cache cluster down বা restart**: সব key একসাথে উধাও। এখন বোঝা যায় cache আসলে কতটা load বইছিল: ৯৯% hit ratio মানে database অভ্যস্ত ছিল ১% load-এ, হঠাৎ ১০০ গুণ। প্রতিকার: cache-এর replication আর failover; database-এর সামনে concurrency limit বা circuit breaker ([Day 59](${topicHrefForDay(59)})), যাতে database একেবারে না পড়ে; আর ধীরে ধীরে traffic ফেরানো, cache গরম হওয়ার সময় দিয়ে।

**কঠিন সত্যটা:** cache যত ভালো কাজ করে, database তত কম capacity রাখে, আর cache ছাড়া চলার ক্ষমতা তত কমে যায়। Cache তখন আর "ঐচ্ছিক optimization" না, **critical dependency**। তাই "cache পুরো খালি হলে কী হবে?" প্রশ্নটা আগে থেকে পরীক্ষা করে রাখুন।`,
      diagrams: [
        {
          id: "day-017-stampede",
          caption:
            "Cache stampede: protection ছাড়া ২০টা miss = database-এ ২০টা একই query; per-key lock দিয়ে ১টা, বাকিরা cache থেকে পায়।",
          alt: "উপরে: Request ১, ২ থেকে ২০ মেয়াদোত্তীর্ণ cache key-তে miss পায়, সব database-এ যায়, database লাল, ×২০। নিচে: Request ১ SET NX দিয়ে lock:product:3 পায়, বাকিরা dashed তীরে অপেক্ষা করে, database-এ শুধু ×১।",
        },
      ],
    },
    {
      title:
        "Local বনাম distributed, multi-level cache, warming আর Redis বনাম Memcached",
      markdown: `**Local (in-process) cache**: App-এর নিজের memory-তে একটা map (Java-তে Caffeine, Python-এ \`functools.lru_cache\` বা \`cachetools\`, Node-এ \`lru-cache\`)।
- লাভ: সবচেয়ে দ্রুত (network নেই, serialization নেই), আলাদা কিছু চালাতে হয় না।
- সমস্যা: ১০টা server মানে ১০টা আলাদা কপি। একটা server-এ invalidate করলে বাকিদের পুরনোটা থাকে ([Day 14](${topicHrefForDay(14)})-এর cache coherence সমস্যা)। প্রতিটা server-কে আলাদাভাবে গরম হতে হয়, deploy-এ সব হারায়। আর memory app-এর heap থেকে কাটে।

**Distributed cache**: Redis বা Memcached, আলাদা server-এ।
- লাভ: সবার একটাই কপি, একবার delete-এ সবার জন্য মোছে; app deploy-এ cache থাকে; আলাদা করে বড় করা যায়।
- সমস্যা: প্রতিটা read-এ network hop (~০.৫-১ms) আর serialization; নতুন একটা জিনিস চালাতে আর monitor করতে হয়; আর সেটা নিজেই fail করতে পারে।

**Multi-level (L1 + L2)**: দুটো একসাথে। L1 = local, খুব ছোট TTL (কয়েক সেকেন্ড), শুধু সবচেয়ে গরম key; L2 = Redis, বড় TTL। Read: L1 → L2 → database। Hot key সমস্যা প্রায় মিটে যায়, কারণ বেশিরভাগ read L1-এই শেষ। দাম: invalidation এখন দুই স্তরে। L1-এর TTL ছোট রাখলে কাজ চলে; আরও তাজা চাইলে Redis pub/sub দিয়ে সব server-কে "এই key মোছো" বার্তা পাঠানো যায়। Redis-এর **client-side caching** feature (Redis 6 থেকে) এই ধারণাটাই server থেকে সমর্থন করে: client কোন key রেখেছে Redis মনে রাখে, বদলালে জানিয়ে দেয়।

**Cache warming**: নতুন cache (বা নতুন region, বা restart-এর পরে) একদম খালি, hit ratio শূন্য, আর সব load database-এ। উপায়:
- আগে থেকে জনপ্রিয় key ভরে রাখা (গতকালের top ১,০০০ product), traffic আনার আগে।
- ধীরে ধীরে traffic বাড়ানো, যাতে cache গরম হওয়ার সময় পায়।
- নতুন cache cluster miss হলে আগে পুরনো, গরম cluster-কে জিজ্ঞেস করবে, তারপর database (Facebook-এর "cold cluster warmup", নিচে)।

**Redis বনাম Memcached, ধারণার স্তরে:**
| বিষয় | Memcached | Redis |
|---|---|---|
| Data | শুধু key → bytes (string) | String, hash, list, set, sorted set, stream ইত্যাদি |
| Threading | Multi-threaded, এক machine-এ অনেক core কাজে লাগায় | Command মূলত একটা main thread-এ চলে (network I/O-র জন্য thread চালু করা যায়) |
| Persistence | নেই, restart-এ সব খালি | ঐচ্ছিক (RDB snapshot, AOF log) |
| Replication / cluster | নিজে নেই, client বা proxy ভাগ করে | Replica, Sentinel, Redis Cluster |
| বাড়তি | সরল, অনুমানযোগ্য memory (slab allocator) | TTL-ওয়ালা data structure, pub/sub, Lua script, atomic counter |
| উপযুক্ত | বড়, সরল, খাঁটি cache | Cache + counter, leaderboard, rate limit, lock, session |

সরল নিয়ম: শুধু বড় একটা key-value cache লাগলে দুটোই চলে; data structure, persistence বা একই জিনিস দিয়ে আরও কাজ (rate limit, lock) লাগলে Redis। Redis-এর একটা fork **Valkey**, Linux Foundation-এর অধীনে, প্রায় একই command চালায়।`,
    },
    {
      title: 'বাস্তবের উদাহরণ: "Scaling Memcache at Facebook" (NSDI 2013)',
      markdown: `Facebook-এর engineer-রা NSDI 2013 conference-এ একটা paper প্রকাশ করেন, যেখানে তারা বলেছেন কিভাবে memcached দিয়ে পৃথিবীর অন্যতম বড় cache চালান। আজকের প্রায় সব ধারণা সেখানে বাস্তবে আছে:

**Look-aside cache, delete দিয়ে invalidation:** Web server আগে memcache দেখে, miss-এ database (MySQL) থেকে এনে ভরে, অর্থাৎ cache-aside। Write-এ database update, তারপর cache-এ **delete**, set না। কারণ ঠিক আমাদের যুক্তি: delete idempotent।

**Lease: stale set আর thundering herd দুটোর একটা উত্তর।** Miss হলে memcache client-কে একটা **lease token** দেয়। Client database থেকে এনে \`SET\` করার সময় token দেখায়। মাঝে ওই key delete হলে token বাতিল, তাই দেরিতে আসা পুরনো \`SET\` প্রত্যাখ্যাত। এটাই update race-এর সমাধান। আর একই key-তে token দেওয়ার হার সীমিত (paper-এ উদাহরণ হিসেবে প্রতি key-তে ১০ সেকেন্ডে একবার): এর মধ্যে অন্য কেউ miss পেলে তাকে বলা হয় একটু অপেক্ষা করে আবার চেষ্টা করতে, ততক্ষণে প্রথমজন ভরে দেয়। এটাই stampede-এর বিরুদ্ধে per-key lock।

**Database থেকে invalidation:** Delete শুধু app-এর ভরসায় রাখা হয়নি। MySQL-এর commit log পড়ে একটা daemon (paper-এ নাম **mcsqueal**) কোন key মুছতে হবে বের করে, আর সব cluster-এ delete পাঠায়। অর্থাৎ event-ভিত্তিক invalidation, যেটা অন্য region-এর cache-কেও তাজা রাখে।

**Regional pool:** একটা region-এ কয়েকটা frontend cluster, প্রতিটার নিজের memcache। জনপ্রিয় data সব cluster-এ কপি থাকুক, ঠিক আছে। কিন্তু কম ব্যবহৃত, বড় data সবখানে কপি রাখলে memory নষ্ট। তাই সেগুলো একটা **regional pool**-এ, যেটা region-এর সব cluster ভাগ করে নেয়।

**Gutter pool:** একটা memcache server মরলে তার key-গুলোর সব request database-এ চলে যেত (ছোট আকারের avalanche)। তাই অল্প কয়েকটা অলস server রাখা হয়, **gutter**: মৃত server-এর বদলে সেখানে যায়, ছোট মেয়াদে data রাখে। Database বাঁচে।

**Cold cluster warmup:** নতুন cluster-এর miss আগে একটা গরম cluster থেকে পড়ে, database থেকে না। কয়েক ঘণ্টার কাজ, database-এ বাড়তি চাপ ছাড়াই।

শিক্ষা: বড় scale-এ caching মানে শুধু "Redis বসাও" না। Invalidation, stampede, failure আর warmup প্রতিটার আলাদা নকশা লাগে, আর সেই নকশা ছোট system-এও একই আকারে কাজে লাগে।`,
    },
  ],

  tradeOffs: {
    markdown: `**কখন cache দেবেন:** read অনেক বেশি, write কম; একই data বারবার চাওয়া হয়; data বানাতে দামি (ভারী query, বাইরের API); কয়েক সেকেন্ড বা মিনিট পুরনো data চলে।

**কখন দেবেন না (বা আগে অন্য কিছু):**
- Query ধীর কারণ index নেই? আগে index ([Day 22](${topicHrefForDay(22)}))। Cache একটা ভুল query-কে লুকায়, ঠিক করে না; প্রতিটা miss তবুও ধীর।
- Data প্রায় প্রতিবার বদলায় বা প্রতিটা request আলাদা: hit ratio কম, জটিলতা পুরো।
- ভুল একবারও চলবে না (balance, শেষ মুহূর্তের stock): database থেকেই পড়ুন।
- Load এত কম যে database আরামে চলছে: cache মানে আরেকটা জিনিস চালানো, আরেকটা bug-এর জায়গা।

Pattern-গুলো পাশাপাশি:`,
    table: {
      headers: [
        "Pattern",
        "Read",
        "Write",
        "তাজা থাকা",
        "Cache down হলে",
        "উপযুক্ত",
      ],
      rows: [
        [
          "Cache-aside",
          "App cache দেখে; miss-এ DB থেকে এনে ভরে",
          "DB-তে লেখে, তারপর cache delete",
          "Eventual; ছোট race থাকে, TTL সীমা দেয়",
          "সব read DB-তে; ধীর কিন্তু সঠিক",
          "সাধারণ default, read-heavy app",
        ],
        [
          "Read-through",
          "Cache নিজেই miss-এ DB থেকে আনে",
          "সাধারণত write-through বা write-around-এর সাথে",
          "Cache-aside-এর মতো",
          "Library-র উপর নির্ভর; প্রায়ই DB-তে সরাসরি পড়া যায় না",
          "পরিষ্কার code, library-তে loader",
        ],
        [
          "Write-through",
          "প্রায় সবসময় hit",
          "Cache আর DB দুটোতেই, তারপর OK",
          "সবচেয়ে তাজা",
          "Write fail বা DB-তে সরাসরি",
          "লেখার পরেই পড়া হয় এমন data",
        ],
        [
          "Write-behind",
          "Hit",
          "শুধু cache-এ; DB-তে পরে, batch-এ",
          "DB পিছিয়ে থাকে",
          "DB-তে না পৌঁছানো write হারায়",
          "Counter, view count, ক্ষতি মেনে নেওয়া যায় এমন data",
        ],
        [
          "Write-around",
          "সদ্য লেখা data-র প্রথম read miss",
          "শুধু DB-তে (cache মোছা বা না ছোঁয়া)",
          "Delete দিলে প্রায় সাথে সাথে",
          "সব read DB-তে",
          "একবার লেখা, কম পড়া data",
        ],
      ],
    },
  },

  industry: {
    markdown: `- **Facebook (Meta)**: memcached দিয়ে বিশাল look-aside cache, lease, regional pool, gutter pool আর commit log থেকে invalidation। বিস্তারিত উপরের গভীরে যাই অংশে, "Scaling Memcache at Facebook" paper থেকে।
- **Netflix EVCache**: memcached-এর উপর বানানো Netflix-এর distributed cache, একাধিক AWS availability zone-এ data কপি করে রাখে, যাতে একটা zone হারালেও cache থাকে। Open source (GitHub-এ Netflix/EVCache)।
- **Twitter (X)**: **twemproxy** (nutcracker) নামে একটা হালকা proxy open source করেছিল, যেটা memcached আর Redis-এর সামনে বসে অনেক server-এ key ভাগ করে আর connection কমায়।
- **Redis** আর **Memcached**: সবচেয়ে প্রচলিত distributed cache। Managed রূপে AWS ElastiCache, Google Cloud Memorystore, Azure Cache for Redis। Redis-এর fork **Valkey** Linux Foundation-এর project।
- **Local cache library**: Java-তে **Caffeine** (W-TinyLFU eviction) আর Guava Cache, Python-এ \`functools.lru_cache\`, Node-এ \`lru-cache\`।
- **Database-এর ভেতরে**: PostgreSQL-এর \`shared_buffers\` (default মাত্র 128MB, production-এ সাধারণত বাড়ানো হয়) আর MySQL InnoDB-র buffer pool, দুটোই disk page cache করে, LRU-র রূপভেদ দিয়ে।

সাধারণ ব্যবহার: product/catalogue page, user profile, feed-এর তৈরি অংশ, বাইরের API-র (exchange rate, weather) ফল, হিসাব করা জিনিস (rating, leaderboard), আর "নেই" উত্তর (negative cache)।

*উৎস: Nishtala et al., "Scaling Memcache at Facebook", USENIX NSDI 2013; Vattani, Chierichetti, Lowenstein, "Optimal Probabilistic Cache Stampede Prevention", VLDB 2015; Redis documentation (key eviction, maxmemory-policy, client-side caching); Memcached documentation; Netflix EVCache ও twemproxy-র GitHub repository; Caffeine project documentation; PostgreSQL documentation (shared_buffers)।*`,
  },

  mistakes: [
    {
      mistake:
        "TTL ছাড়া cache-এ লেখা। Delete একবার fail করলে বা event হারালে পুরনো data চিরকাল থেকে যায়, আর memory-ও ভরতে থাকে।",
      fix: "প্রতিটা cache entry-তে TTL দিন, explicit invalidation থাকলেও। TTL হলো শেষ রক্ষাকবচ।",
    },
    {
      mistake:
        "Write-এ cache update (SET) করা, বা আগে cache delete করে তারপর database update করা। দুটোতেই পুরনো data cache-এ বসে যেতে পারে।",
      fix: "আগে database-এ লিখুন, তারপর cache থেকে key delete করুন। জরুরি data-তে delayed double delete বা version/lease যোগ করুন।",
    },
    {
      mistake:
        "Cache-এর জন্য Redis-এর default noeviction রেখে দেওয়া। Memory ভরলে app-এর প্রতিটা SET OOM error দেয়।",
      fix: "খাঁটি cache-এ maxmemory ঠিক করে allkeys-lru বা allkeys-lfu দিন; session বা queue একই Redis-এ রাখবেন না।",
    },
    {
      mistake:
        "সব key-তে হুবহু একই TTL, বা bulk load-এ একসাথে সব ভরা। এক মুহূর্তে সবার মেয়াদ শেষ হয়ে database-এ ঢেউ (avalanche)।",
      fix: "TTL-এ jitter যোগ করুন (যেমন ±১০%), আর খুব জনপ্রিয় key-তে lock বা early expiration দিয়ে stampede আটকান।",
    },
    {
      mistake:
        "Cache key-তে user বা ভাষার মতো দরকারি অংশ না রাখা। একজনের personalised data আরেকজন দেখে ফেলে।",
      fix: "Response যা যা দিয়ে বদলায়, সব key-তে রাখুন (যেমন product:1:lang:bn), আর personalised data shared key-তে কখনো না।",
    },
    {
      mistake:
        "Cache-কে source of truth বানিয়ে ফেলা, যেমন write-behind-এ order বা টাকা রাখা, অথবা checkout-এ cache-এর দাম দিয়ে হিসাব।",
      fix: "জরুরি data আগে database-এ; cache শুধু কপি। চূড়ান্ত সিদ্ধান্তের মুহূর্তে database থেকে যাচাই করুন।",
    },
    {
      mistake:
        "Hit ratio, eviction আর memory না মাপা। Cache আছে কিন্তু hit ratio ৩০%, কেউ জানে না।",
      fix: "keyspace_hits/misses থেকে hit ratio, evicted_keys, memory আর cache latency-তে dashboard আর alert রাখুন।",
    },
    {
      mistake:
        "ধীর query-র সমাধান হিসেবে প্রথমেই cache। প্রতিটা miss তবুও ধীর, আর cache খালি হলেই সমস্যা ফিরে আসে।",
      fix: "আগে query আর index ঠিক করুন; তারপর পুনরাবৃত্তি কমাতে cache।",
    },
  ],

  lab: [
    {
      title: "প্রস্তুতি: PostgreSQL, Redis আর একটা ছোট app",
      markdown: `এই lab-এ একটা ছোট product API চালাবেন: PostgreSQL-এ product, সামনে Redis cache, মাঝে একটা Python app যেটা cache-aside করে। Database query-তে ইচ্ছা করে \`pg_sleep(0.3)\` দেওয়া আছে, যাতে একটা ভারী query-র মতো ~৩০০ms লাগে। শুধু Docker লাগবে (প্রথমবার image আর Python package নামাতে internet লাগবে)।

App-এর তিনটা \`MODE\`:
- \`naive\`: cache-aside read, কিন্তু write-এ cache-এ হাত দেয় না (ভুল)
- \`delete\`: write-এর পরে cache delete করে
- \`lock\`: delete + miss-এ per-key lock (stampede protection) + TTL jitter

\`\`\`bash
mkdir cache-lab && cd cache-lab
\`\`\`

\`app.py\`:

\`\`\`bash
cat > app.py <<'EOF'
import json
import os
import random
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

import psycopg
import redis

MODE = os.environ.get("MODE", "naive")  # naive | delete | lock
TTL = 30  # সেকেন্ড

r = redis.Redis(host="redis", port=6379, decode_responses=True)
db_queries = 0
counter_lock = threading.Lock()


def db():
    return psycopg.connect("host=db user=postgres password=pass dbname=shop", autocommit=True)


def load_from_db(pid):
    global db_queries
    with counter_lock:
        db_queries += 1
    with db() as conn:
        # pg_sleep(0.3) = একটা ভারী query-র ভান
        row = conn.execute(
            "SELECT name, price, pg_sleep(0.3) FROM products WHERE id = %s", (pid,)
        ).fetchone()
    return {"id": pid, "name": row[0], "price": row[1]}


def get_product(pid):
    key = f"product:{pid}"
    cached = r.get(key)
    if cached:
        return json.loads(cached), "cache"
    if MODE == "lock":
        # শুধু একজন DB-তে যাবে; বাকিরা একটু অপেক্ষা করে cache আবার দেখবে
        while not r.set(f"lock:{key}", "1", nx=True, px=2000):
            time.sleep(0.05)
            cached = r.get(key)
            if cached:
                return json.loads(cached), "cache (waited)"
        try:
            cached = r.get(key)  # lock পাওয়ার ফাঁকে অন্য কেউ ভরে দিয়েছে কিনা
            if cached:
                return json.loads(cached), "cache"
            product = load_from_db(pid)
            r.set(key, json.dumps(product, ensure_ascii=False), ex=TTL + random.randint(0, 10))
            return product, "db"
        finally:
            r.delete(f"lock:{key}")
    product = load_from_db(pid)
    r.set(key, json.dumps(product, ensure_ascii=False), ex=TTL)
    return product, "db"


def update_price(pid, price):
    with db() as conn:
        conn.execute("UPDATE products SET price = %s WHERE id = %s", (price, pid))
    if MODE in ("delete", "lock"):
        r.delete(f"product:{pid}")  # DB-তে লেখার পরে cache মুছে দাও


class Handler(BaseHTTPRequestHandler):
    def reply(self, data):
        body = (json.dumps(data, ensure_ascii=False) + "\\n").encode()
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        url = urlparse(self.path)
        if url.path == "/stats":
            return self.reply({"mode": MODE, "db_queries": db_queries})
        pid = int(url.path.rsplit("/", 1)[1])
        start = time.perf_counter()
        product, source = get_product(pid)
        ms = round((time.perf_counter() - start) * 1000, 1)
        self.reply({**product, "source": source, "ms": ms})

    def do_POST(self):
        url = urlparse(self.path)
        pid = int(url.path.rsplit("/", 1)[1])
        price = int(parse_qs(url.query)["price"][0])
        update_price(pid, price)
        self.reply({"updated": pid, "price": price, "mode": MODE})

    def log_message(self, *args):
        pass


print(f"app ready, mode={MODE}", flush=True)
ThreadingHTTPServer(("0.0.0.0", 8000), Handler).serve_forever()
EOF
\`\`\`

(Lab-এর সরলতার জন্য প্রতিটা query-তে নতুন database connection খোলা হয়েছে আর lock-এর মালিকানা যাচাই করা হয়নি। Production-এ connection pool ব্যবহার করুন, আর lock মোছার আগে দেখুন সেটা এখনো আপনার কিনা।)

\`seed.sql\`, তিনটা product:

\`\`\`bash
cat > seed.sql <<'EOF'
CREATE TABLE products (id int PRIMARY KEY, name text NOT NULL, price int NOT NULL);
INSERT INTO products VALUES (1, 'মিনিকেট চাল ৫ কেজি', 80), (2, 'মসুর ডাল ১ কেজি', 140), (3, 'সয়াবিন তেল ১ লিটার', 190);
EOF
\`\`\`

\`compose.yaml\`:

\`\`\`bash
cat > compose.yaml <<'EOF'
name: sdlab-day017

services:
  db:
    image: postgres:16-alpine
    container_name: sdlab-day017-db
    environment:
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: shop
    volumes:
      - ./seed.sql:/docker-entrypoint-initdb.d/seed.sql:ro

  redis:
    image: redis:7-alpine
    container_name: sdlab-day017-redis

  app:
    image: python:3.12-slim
    container_name: sdlab-day017-app
    command: sh -c "pip install -q --root-user-action=ignore --disable-pip-version-check redis==5.0.8 'psycopg[binary]==3.2.3' && exec python -u /app.py"
    environment:
      MODE: \${MODE:-naive}
    volumes:
      - ./app.py:/app.py:ro
    ports:
      - "8097:8000"
    depends_on:
      - db
      - redis

networks:
  default:
    name: sdlab-day017-net
EOF
docker compose up -d
\`\`\`

App চালু হওয়ার সময় package install করে, তাই ২০-৪০ সেকেন্ড অপেক্ষা করে log দেখুন:

\`\`\`bash
docker logs sdlab-day017-app
\`\`\`

\`\`\`text
app ready, mode=naive
\`\`\`

Port 8097 ব্যস্ত থাকলে \`compose.yaml\`-এ বদলে নিন।`,
    },
    {
      title: "পরীক্ষা ১: Miss বনাম hit, সময় মেপে দেখুন",
      markdown: `একই product পাঁচবার চান, প্রতিবার মোট সময় দেখুন:

\`\`\`bash
for i in 1 2 3 4 5; do curl -s -o /dev/null -w "%{time_total}s\\n" localhost:8097/product/1; done
\`\`\`

\`\`\`text
0.385655s
0.005113s
0.003063s
0.004434s
0.003018s
\`\`\`

প্রথমটা miss: database-এর ৩০০ms + connection। বাকিগুলো hit: ৩-৫ms, প্রায় **১০০ গুণ** দ্রুত। (আপনার সংখ্যা একটু আলাদা হবে।) উত্তরের ভেতরে দেখুন কোথা থেকে এলো:

\`\`\`bash
curl -s localhost:8097/product/1
\`\`\`

\`\`\`text
{"id": 1, "name": "মিনিকেট চাল ৫ কেজি", "price": 80, "source": "cache", "ms": 0.5}
\`\`\`

\`ms\` হলো app-এর ভেতরের সময়, network ছাড়া: cache থেকে আধা millisecond। Redis-এর নিজের হিসাবও দেখুন:

\`\`\`bash
docker exec sdlab-day017-redis redis-cli INFO stats | grep -E "keyspace_(hits|misses)"
\`\`\`

\`keyspace_hits ÷ (keyspace_hits + keyspace_misses)\` = hit ratio। এখানে ৫টা read-এ ১টা miss, তাই প্রায় ৮০%।`,
    },
    {
      title: "পরীক্ষা ২: TTL চোখের সামনে শেষ হওয়া",
      markdown: `Cache-এ কী আছে আর কতক্ষণ থাকবে:

\`\`\`bash
docker exec sdlab-day017-redis redis-cli GET product:1
docker exec sdlab-day017-redis redis-cli TTL product:1
\`\`\`

\`\`\`text
{"id": 1, "name": "মিনিকেট চাল ৫ কেজি", "price": 80}
22
\`\`\`

\`TTL\` বলছে আর কত সেকেন্ড বাকি (৩০ থেকে কমছে)। ৩০ সেকেন্ড অপেক্ষা করে আবার দেখুন:

\`\`\`bash
sleep 30
docker exec sdlab-day017-redis redis-cli TTL product:1
curl -s localhost:8097/product/1
docker exec sdlab-day017-redis redis-cli TTL product:1
\`\`\`

\`\`\`text
-2
{"id": 1, "name": "মিনিকেট চাল ৫ কেজি", "price": 80, "source": "db", "ms": 314.5}
30
\`\`\`

\`-2\` মানে key আর নেই, Redis নিজেই মুছে দিয়েছে। (\`-1\` হলে key আছে কিন্তু কোনো TTL নেই, যেটা cache-এ সাধারণত একটা bug।) পরের request আবার database-এ গেল (~৩০০ms) আর নতুন ৩০ সেকেন্ডের মেয়াদে cache ভরল।`,
    },
    {
      title: "পরীক্ষা ৩: Update-এর পরে পুরনো দাম (naive mode)",
      markdown: `চালের দাম ৮০ থেকে ৭৫ করুন, তারপর আবার পড়ুন:

\`\`\`bash
curl -s localhost:8097/product/1
curl -s -X POST "localhost:8097/product/1?price=75"
curl -s localhost:8097/product/1
docker exec sdlab-day017-db psql -U postgres -d shop -c "SELECT id, price FROM products WHERE id = 1;"
\`\`\`

\`\`\`text
{"id": 1, "name": "মিনিকেট চাল ৫ কেজি", "price": 80, "source": "cache", "ms": 0.3}
{"updated": 1, "price": 75, "mode": "naive"}
{"id": 1, "name": "মিনিকেট চাল ৫ কেজি", "price": 80, "source": "cache", "ms": 0.1}
 id | price
----+-------
  1 |    75
(1 row)
\`\`\`

Database বলছে ৭৫, user দেখছে ৮০। কোনো error নেই, log-এ কিছু নেই, শুধু চুপচাপ ভুল দাম, যতক্ষণ না TTL শেষ হয়। (প্রথম লাইনে \`"source": "db"\` এলে মানে আগের key-র মেয়াদ শেষ হয়ে গিয়েছিল; তাহলে update-এর আগে আরেকবার GET করে cache ভরে নিন।)`,
    },
    {
      title: "পরীক্ষা ৪: Delete-on-write দিয়ে ঠিক করুন",
      markdown: `App-কে \`delete\` mode-এ আবার চালু করুন (শুধু app container নতুন হবে, Redis আর database যেমন ছিল):

\`\`\`bash
MODE=delete docker compose up -d app
sleep 30
docker logs sdlab-day017-app
\`\`\`

\`\`\`text
app ready, mode=delete
\`\`\`

আবার একই পরীক্ষা, এবার দাম ৭০:

\`\`\`bash
curl -s localhost:8097/product/1
curl -s -X POST "localhost:8097/product/1?price=70"
docker exec sdlab-day017-redis redis-cli EXISTS product:1
curl -s localhost:8097/product/1
curl -s localhost:8097/product/1
\`\`\`

\`\`\`text
{"id": 1, "name": "মিনিকেট চাল ৫ কেজি", "price": 75, "source": "db", "ms": 321.6}
{"updated": 1, "price": 70, "mode": "delete"}
0
{"id": 1, "name": "মিনিকেট চাল ৫ কেজি", "price": 70, "source": "db", "ms": 315.1}
{"id": 1, "name": "মিনিকেট চাল ৫ কেজি", "price": 70, "source": "cache", "ms": 2.3}
\`\`\`

(প্রথম লাইন \`cache\` থেকেও আসতে পারে, আগের key-র মেয়াদ বাকি থাকলে।) Write-এর পরে key নেই (\`EXISTS\` = 0), তাই পরের read database থেকে নতুন ৭০ আনল আর cache আবার ভরল। এটাই cache-aside-এর "database-এ লেখো, cache মোছো"। গভীরে যাই অংশের race-টা এখানে চোখে পড়বে না, কারণ সেটার জন্য একটা read-কে ঠিক ভুল মুহূর্তে আটকে থাকতে হয়।`,
    },
    {
      title: "পরীক্ষা ৫: Cache stampede, তারপর lock",
      markdown: `সয়াবিন তেলের key মুছে দিন (মেয়াদ শেষের মতো), তারপর একসাথে ২০টা request পাঠান। আগে আর পরে database query-র সংখ্যা দেখুন:

\`\`\`bash
curl -s localhost:8097/stats
docker exec sdlab-day017-redis redis-cli DEL product:3
seq 20 | xargs -P 20 -I{} curl -s -o /dev/null localhost:8097/product/3
curl -s localhost:8097/stats
\`\`\`

\`\`\`text
{"mode": "delete", "db_queries": 2}
1
{"mode": "delete", "db_queries": 18}
\`\`\`

একটা key-র জন্য database-এ **১৬টা** একই query (আপনার সংখ্যা ১৫-২০-এর মধ্যে কিছু হবে; যারা একটু পরে এসেছে তারা ততক্ষণে ভরা cache পেয়েছে)। এবার \`lock\` mode:

\`\`\`bash
MODE=lock docker compose up -d app
sleep 30
docker exec sdlab-day017-redis redis-cli DEL product:3
seq 20 | xargs -P 20 -I{} curl -s localhost:8097/product/3 | grep -o '"source": "[^"]*"' | sort | uniq -c
curl -s localhost:8097/stats
docker exec sdlab-day017-redis redis-cli TTL product:3
\`\`\`

\`\`\`text
  15 "source": "cache (waited)"
   4 "source": "cache"
   1 "source": "db"
{"mode": "lock", "db_queries": 1}
37
\`\`\`

২০টার মধ্যে মাত্র **১টা** database-এ গেল; বাকিরা কয়েকশো millisecond অপেক্ষা করে cache থেকে পেল। আর \`TTL\` এবার ৩০-এর বেশি হতে পারে, কারণ lock mode-এ TTL-এ ০-১০ সেকেন্ডের jitter যোগ হয় (avalanche-এর প্রতিকার)। (Container restart-এ \`db_queries\` গোনা শূন্য থেকে শুরু হয়।)`,
    },
    {
      title: "পরীক্ষা ৬: Memory ভরলে কী হয়: noeviction বনাম allkeys-lru",
      markdown: `Redis-কে মাত্র 4MB memory দিন, default policy রেখে:

\`\`\`bash
docker exec sdlab-day017-redis redis-cli CONFIG SET maxmemory 4mb
docker exec sdlab-day017-redis redis-cli CONFIG GET maxmemory-policy
\`\`\`

\`\`\`text
OK
maxmemory-policy
noeviction
\`\`\`

এবার ২০,০০০টা key লিখুন, প্রতিটায় ২০০ byte (একটা connection-এ pipeline করে):

\`\`\`bash
seq 1 20000 | awk '{printf "SET fill:%d %0200d\\n", $1, 0}' | docker exec -i sdlab-day017-redis redis-cli --pipe | tail -1
docker exec sdlab-day017-redis redis-cli DBSIZE
\`\`\`

\`\`\`text
errors: 11380, replies: 20000
8620
\`\`\`

হাজার হাজার write \`OOM command not allowed when used memory > 'maxmemory'\` error পেল। Cache হিসেবে এটা ভয়ানক: app-এর প্রতিটা \`SET\` fail করছে। এবার policy বদলান আর আবার লিখুন:

\`\`\`bash
docker exec sdlab-day017-redis redis-cli CONFIG SET maxmemory-policy allkeys-lru
seq 1 20000 | awk '{printf "SET more:%d %0200d\\n", $1, 0}' | docker exec -i sdlab-day017-redis redis-cli --pipe | tail -1
docker exec sdlab-day017-redis redis-cli INFO stats | grep evicted_keys
docker exec sdlab-day017-redis redis-cli INFO memory | grep -E "^used_memory_human|^maxmemory_human"
docker exec sdlab-day017-redis redis-cli EXISTS fill:1 more:20000
\`\`\`

\`\`\`text
errors: 0, replies: 20000
evicted_keys:19870
used_memory_human:4.00M
maxmemory_human:4.00M
1
\`\`\`

একটাও error নেই। Memory 4MB-তেই আটকে আছে, আর পুরনো key-গুলো (\`fill:1\`-সহ) মুছে নতুনদের (\`more:20000\`) জায়গা দেওয়া হয়েছে; \`EXISTS\` দুটোর মধ্যে ১টা পেল। আপনার সংখ্যা একটু আলাদা হবে। খেয়াল করুন, এখানে আমাদের \`product:*\` key-গুলোও হয়তো মুছে গেছে। Cache-এ এটা ঠিক আছে (পরের read database থেকে আনবে), কিন্তু এখানে session থাকলে user-রা logout হয়ে যেত।

Production-এ এগুলো \`CONFIG SET\`-এ না, config file বা command line-এ দিন (যেমন \`redis-server --maxmemory 2gb --maxmemory-policy allkeys-lru\`), নইলে restart-এ হারাবে।`,
    },
    {
      title: "পরিষ্কার করুন",
      markdown: `\`\`\`bash
docker compose down -v
cd .. && rm -rf cache-lab
\`\`\`

এতে তিনটা container আর \`sdlab-day017-net\` network মুছে যাবে।`,
    },
  ],

  connections: {
    markdown: `- **[Day 5 · Scalability](${topicHrefForDay(5)})**: সেখানে cache-কে scale করার একটা হাতিয়ার হিসেবে নাম শুনেছিলাম। আজ দেখলাম কেন: database-এর মতো কঠিনে-scale-হয় অংশ থেকে পুনরাবৃত্ত read সরিয়ে নেয়।
- **[Day 7 · Latency vs Throughput](${topicHrefForDay(7)})**: Latency-র সিঁড়িতে cache আমাদের network+disk থেকে memory-র ধাপে নামায়; আর hit ratio-র হিসাব আসলে গড় latency-র হিসাব।
- **[Day 10 · Databases](${topicHrefForDay(10)})**: Database-এর buffer cache page রাখে, query-র ফল না; আর write-behind-এর ঝুঁকি বুঝতে WAL-এর কথা মনে রাখুন।
- **[Day 11 · CDN](${topicHrefForDay(11)})**: HTTP cache header, edge cache, origin shield আর request collapsing সেখানে। আজকের stampede, TTL আর eviction-এর ধারণা একই, শুধু data-র স্তরে।
- **[Day 14 · Stateful vs Stateless](${topicHrefForDay(14)})**: Session store (Redis-এ, কিন্তু cache না) আর local cache-এর coherence সমস্যা। আজ সেই সমস্যার পুরো সমাধান-তালিকা দেখলাম।
- **[Day 15 · Proxy Servers](${topicHrefForDay(15)}) ও [Day 16 · API Gateway](${topicHrefForDay(16)})**: পুরো HTTP response-এর cache; আজকেরটা তার পেছনে, app-এর ভেতরে।
- **[Day 18 · Rate Limiting](${topicHrefForDay(18)})**: একই Redis, অন্য কাজে; আর cache penetration-এর আক্রমণ দরজাতেই আটকানোর একটা উপায়।

সামনে যা আসছে (এখন এটুকু জানলেই চলবে, সেদিন গভীরে যাব): [Day 19](${topicHrefForDay(19)})-এ Capacity Estimation (cache-এর মাপ আর hit ratio-র হিসাব), [Day 22](${topicHrefForDay(22)})-এ Database Indexes (cache-এর আগে যা ঠিক করবেন), [Day 24](${topicHrefForDay(24)})-এ Bloom Filters (penetration আটকানো), [Day 28](${topicHrefForDay(28)})-এ Database Replication (read replica, আর replica lag-ও এক ধরনের stale read), [Day 31](${topicHrefForDay(31)})-এ Consistent Hashing (cache cluster-এ key ভাগ), [Day 47](${topicHrefForDay(47)})-এ Strong vs Eventual Consistency, [Day 53](${topicHrefForDay(53)})-এ Distributed Locking, [Day 59](${topicHrefForDay(59)})-এ Circuit Breaker, [Day 73](${topicHrefForDay(73)})-এ CDC (change stream থেকে invalidation), আর [Day 97](${topicHrefForDay(97)})-এ CPU-র cache line, যেখানে একই ধারণা hardware-এর ভেতরে।`,
  },

  explainYourself: [
    {
      question:
        'Teammate বলছে, "Product update-এর সময় নতুন data দিয়ে cache-এ SET করে দিই, তাহলে পরের read-ও hit হবে, delete করার চেয়ে ভালো।" আপনি কী বলবেন?',
      idealAnswer:
        "শুনতে ভালো, কিন্তু দুটো concurrent write-এ cache-এ পৌঁছানোর ক্রম উল্টে গেলে database-এ নতুন মান আর cache-এ পুরনো মান থেকে যায়, TTL পর্যন্ত। Delete idempotent আর ক্রমের উপর নির্ভর করে না: যত ক্রমেই হোক, ফল একই, key নেই, আর পরের read database থেকে তাজা মান আনবে। দাম শুধু একটা miss। তাছাড়া cache-এর মান প্রায়ই কয়েকটা table মিলিয়ে বানানো, write path-কে সেটা বানানোর দায় নিতে হয় না। তাই নিয়ম: আগে database-এ লেখো, তারপর cache delete, আর TTL সবসময় রাখো।",
    },
    {
      question:
        "আপনার Redis cache-এর hit ratio ৯৯%। একদিন Redis cluster restart হলো আর সাথে সাথে database-ও পড়ে গেল। কেন, আর কী করলে এটা এড়ানো যেত?",
      idealAnswer:
        "৯৯% hit ratio মানে database অভ্যস্ত ছিল মোট read-এর মাত্র ১%-এ। Cache খালি হতেই সব read database-এ গেল, হঠাৎ প্রায় ১০০ গুণ load, আর জনপ্রিয় key-গুলোয় একসাথে stampede। এটা cache avalanche। এড়াতে: cache-এ replication আর failover যাতে সব একসাথে না হারায়; miss-এ per-key lock বা request coalescing; database-এর সামনে concurrency limit বা circuit breaker যাতে database অন্তত বেঁচে থাকে; cache আগে থেকে warm করা বা ধীরে ধীরে traffic ফেরানো; আর TTL-এ jitter যাতে স্বাভাবিক সময়েও মেয়াদ একসাথে শেষ না হয়।",
    },
    {
      question:
        "Local in-memory cache আর Redis-এর মধ্যে কখন কোনটা বাছবেন? দুটো একসাথে রাখলে কী লাভ, কী ঝামেলা?",
      idealAnswer:
        "Local cache সবচেয়ে দ্রুত (network নেই), কিন্তু প্রতিটা server-এর আলাদা কপি, invalidate করা কঠিন, আর deploy-এ হারায়; তাই কম বদলায় এমন ছোট data (config, category list) বা খুব ছোট TTL-এ ঠিক। Redis-এ সবার একটাই কপি, একবার delete-এ সবার জন্য মোছে, বড় data রাখা যায়, কিন্তু প্রতি read-এ network hop আর একটা বাড়তি জিনিস চালানো। দুটো একসাথে (L1 local, L2 Redis) রাখলে hot key-র চাপ Redis থেকে সরে যায় আর latency কমে, কিন্তু invalidation এখন দুই স্তরে, তাই L1-এর TTL কয়েক সেকেন্ডে রাখতে হয় বা pub/sub দিয়ে সব server-কে মোছার বার্তা পাঠাতে হয়।",
    },
  ],

  interviewQuestions: [
    {
      question:
        "একটা read-heavy product catalogue-এ caching layer ডিজাইন করুন।",
      answerOutline: `- আগে প্রশ্ন: read/write অনুপাত, কতটা পুরনো data চলবে, working set কত বড়, traffic কত
- Pattern: cache-aside, Redis (বা Memcached); key নকশা (\`product:{id}:v{schema}\`), TTL + jitter
- Write: DB-তে লেখা তারপর delete; জরুরি হলে CDC থেকে invalidation
- Eviction: \`allkeys-lru\`/\`lfu\`, maxmemory working set অনুযায়ী
- Failure: stampede-এ lock/early expiration, penetration-এ negative cache, cache down হলে DB-র সামনে limit
- মাপা: hit ratio, latency, eviction, memory; checkout-এ DB থেকে যাচাই`,
    },
    {
      question:
        "Cache আর database-এর মধ্যে consistency কিভাবে রাখবেন? কোন race condition জানেন?",
      answerOutline: `- Atomic না: দুটো আলাদা system; লক্ষ্য eventual consistency, সীমিত পুরনো
- Update বনাম delete: concurrent SET-এর ক্রম উল্টালে stale; delete idempotent
- ক্রম: আগে DB, পরে delete (উল্টোটায় বড় ফাঁক)
- বাকি race: ধীর reader miss-এ পুরনো মান পড়ে writer-এর delete-এর পরে SET করে
- প্রতিকার: ছোট TTL, delayed double delete, lease/version (Facebook memcache), CDC-ভিত্তিক invalidation
- যেখানে ভুল চলবে না, সেখানে cache থেকে সিদ্ধান্ত নয়`,
    },
    {
      question: "Cache stampede কী, আর কিভাবে আটকাবেন?",
      answerOutline: `- জনপ্রিয় key-র মেয়াদ শেষ বা মোছা, একসাথে অনেক miss, সবাই একই দামি কাজ
- Per-key lock / single flight (\`SET NX PX\`), বাকিরা অপেক্ষা বা পুরনো মান
- Stale-while-revalidate: soft/hard TTL
- Probabilistic early expiration (XFetch): মেয়াদের আগেই এলোমেলোভাবে একজন refresh
- Background refresh খুব গরম key-তে
- সংশ্লিষ্ট: avalanche-এ TTL jitter, hot key-তে local cache বা key replication`,
    },
    {
      question: "LRU cache implement করুন, O(1) get আর put সহ।",
      answerOutline: `- Hash map: key → list node
- Doubly linked list: head = সবশেষে ব্যবহৃত, tail = সবচেয়ে পুরনো
- get: map-এ খোঁজো, node head-এ সরাও
- put: থাকলে মান বদলে head-এ; না থাকলে নতুন node head-এ, capacity পেরোলে tail মুছে map থেকেও মোছো
- Sentinel head/tail node দিলে edge case কমে
- আলোচনা: thread safety (lock), Redis-এর approximate LRU (sampling), scan-এর বিরুদ্ধে LFU/W-TinyLFU`,
    },
    {
      question: "Redis আর Memcached-এর মধ্যে কোনটা কখন বাছবেন?",
      answerOutline: `- দুটোই in-memory key-value, cache হিসেবে দুটোই চলে
- Memcached: সরল string, multi-threaded, persistence নেই, client-side sharding
- Redis: data structure, persistence, replication/cluster, Lua, pub/sub
- Redis বাছবেন যখন counter, sorted set, lock, rate limit একই জায়গায় লাগে
- Memcached বাছবেন বড়, সরল, খাঁটি cache-এ যেখানে অনেক core কাজে লাগাতে চান
- Operational দিক: managed service, team-এর পরিচিতি`,
    },
  ],

  summary: {
    points: [
      "Cache হলো আসল data-র দ্রুত, অস্থায়ী কপি; latency কমায় আর database-কে পুনরাবৃত্ত read থেকে বাঁচায়।",
      "Hit ratio-র শেষ কয়েক শতাংশ সবচেয়ে দামি: ৯০% থেকে ৯৯% মানে database load দশ ভাগের এক ভাগ।",
      "Cache-aside সবচেয়ে প্রচলিত: miss-এ database থেকে এনে TTL সহ ভরো; write-এ আগে database, তারপর cache delete।",
      "Write-through তাজা রাখে কিন্তু write ধীর; write-behind দ্রুত কিন্তু data হারানোর ঝুঁকি।",
      "Eviction: সাধারণত LRU বা LFU; Redis-এর default noeviction cache-এর জন্য ভুল।",
      "Stale data-র শেষ রক্ষাকবচ TTL; race-এর জন্য delayed double delete বা lease।",
      "Stampede-এ lock বা early expiration, penetration-এ negative cache বা Bloom filter, avalanche-এ TTL jitter।",
    ],
    diagram: {
      id: "day-017-summary",
      caption: "এক নজরে Caching",
      alt: "App থেকে আগে Cache-এ (hit প্রায় ১ms), miss হলে Database-এ (২০ms-এর বেশি), তারপর Database থেকে Cache-এ ভরা আর TTL।",
    },
  },
};
