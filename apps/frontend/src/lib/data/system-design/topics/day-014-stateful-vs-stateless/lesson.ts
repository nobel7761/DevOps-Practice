// Day 14 · Stateful vs Stateless — Phase 2. Builds on Day 9's sticky-session
// section (the "real fix" promised there). Day 17 goes deeper into caching,
// Day 33 into object storage, Day 43 into WebSockets, Day 77 into JWT/sessions.

import { topicHrefForDay } from "@/lib/data/courses/system-design-a-z";
import type { SdLesson } from "@/lib/system-design/lesson.types";

const day = topicHrefForDay;

export const day014Lesson: SdLesson = {
  topicId: "sd-day-014",
  day: 14,
  title: "Stateful vs Stateless",
  definition:
    "Stateless server এক request থেকে পরের request পর্যন্ত নিজের ভেতরে কিছু মনে রাখে না; session, cart, file সব বাইরে (Redis, database, object storage বা client-এর token-এ) থাকে, তাই যেকোনো server যেকোনো request নিতে পারে।",

  objectives: [
    "State কী (login session, cart, upload করা file, in-memory cache, WebSocket connection), আর সেটা server-এর ভেতরে থাকলে load balancer-এর পেছনে কোন তিনটা জিনিস ভাঙে, উদাহরণ দিয়ে ব্যাখ্যা করতে পারবেন।",
    "State বাইরে নেওয়ার তিন পথ (shared store, object storage, client-এর signed token) তুলনা করে বাছতে পারবেন, আর কেন sticky session শুধু সাময়িক জোড়াতালি, যুক্তি দিয়ে বলতে পারবেন।",
    "Redis-এ session store (key, TTL, eviction, replication) সাজাতে পারবেন, আর JWT-এর logout, size আর key rotation-এর সমস্যা হিসাব করে চিনতে পারবেন।",
    "যেসব service-কে stateful থাকতেই হয় (database, queue, WebSocket gateway) সেগুলো কেন আলাদাভাবে scale হয়, আর graceful shutdown কিভাবে stateless server-কে নির্ভয়ে deploy করতে দেয়, বলতে পারবেন।",
    "Docker-এ NGINX-এর পেছনে দুটো app-এ memory-র cart ভাঙতে দেখবেন, ip_hash দিয়ে ঢাকবেন, তারপর Redis-এ সরিয়ে সত্যিই ঠিক করবেন।",
  ],

  prerequisites: [
    { day: 4, title: "API কী? REST-এর বেসিক", href: day(4) },
    { day: 9, title: "Load Balancers", href: day(9) },
    { day: 10, title: "Databases", href: day(10) },
    { day: 13, title: "Vertical vs Horizontal Scaling", href: day(13) },
  ],

  problem: {
    markdown: `"সদাইপাতি" একটা online grocery। শুরুতে পুরো app একটাই server-এ চলত, আর developer সবকিছু সবচেয়ে সহজ জায়গায় রেখেছিল:

- Login করলে user-এর তথ্য server-এর memory-তে একটা dictionary-তে (\`sessions[sid] = user\`)
- Cart-ও memory-তে (\`carts[sid] = ["চাল", "ডাল"]\`)
- Profile ছবি server-এর disk-এ, \`/uploads\` folder-এ
- Product-এর দাম ১০ মিনিটের জন্য memory-তে cache

এক server-এ এটা একদম ঠিকঠাক চলে। রমজানের আগে traffic তিন গুণ হলো, তাই team [Day 13](${day(13)})-এর horizontal scaling করল: আরও দুটো server, সামনে [Day 9](${day(9)})-এর load balancer, round robin।

পরদিন সকালে support-এর phone বাজতেই থাকল:
1. "Cart-এ পাঁচটা জিনিস রাখলাম, page refresh করতেই cart খালি! আবার refresh করলে ফিরে আসে!"
2. "একটু পরপর logout হয়ে যাচ্ছি।"
3. "Profile ছবি কখনো দেখা যায়, কখনো ভাঙা।"
4. "দাম বদলানোর পরেও কিছু customer পুরনো দাম দেখছে।"

Team তাড়াতাড়ি load balancer-এ **sticky session** চালু করল: একই user সবসময় একই server-এ। অভিযোগ কমল। কিন্তু তিনটা নতুন সমস্যা এলো:
- রাতে নতুন version deploy করতে server restart হলো, ওই server-এর সব user-এর cart আর login উধাও।
- ইফতারের আগের ভিড়ে Server 1-এর CPU ৯০%, অথচ নতুন যোগ করা Server 3 প্রায় বসে আছে, কারণ পুরনো user-রা আগের server-এই আটকে।
- Traffic কমলে খরচ বাঁচাতে একটা server বন্ধ করা যায় না, বন্ধ করলেই তার user-রা logout।

সমস্যাটা load balancer-এ না। সমস্যা হলো server-গুলো **নিজের ভেতরে জিনিস মনে রাখছে**।`,
    diagrams: [
      {
        id: "day-014-before",
        caption:
          "আগে: একই user-এর তিনটা request তিন server-এ গেল; cart আছে শুধু App 1-এর memory-তে।",
        alt: "User Load Balancer-কে GET /cart পাঠায়। Load Balancer request ১ App 1-এ পাঠায় (cart আছে, সফল), request ২ App 2-তে (cart খালি, লাল), request ৩ App 3-এ (login নেই, লাল)।",
      },
    ],
  },

  analogy: {
    markdown: `ঈদের আগে পাড়ার বড় দর্জির দোকানের কথা ভাবুন। চারজন কারিগর।

**পুরনো নিয়ম:** আপনার মাপ নিয়েছিলেন করিম ভাই, আর মাপটা আছে শুধু তার মাথায় (বা তার নিজের ছোট খাতায়)। তাই প্রতিবার আপনাকে করিম ভাইয়ের কাছেই যেতে হয়।
- করিম ভাই ছুটিতে গেলে আপনার মাপ শেষ, আবার প্রথম থেকে মাপ দিন।
- ঈদের ভিড়ে করিম ভাইয়ের সামনে বিশাল লাইন, অথচ পাশের কারিগর বসে আছেন। তিনি সাহায্য করতে পারেন না, কারণ মাপ জানেন না।
- মালিক নতুন কারিগর রাখলেন, কিন্তু পুরনো customer-রা তো তাদের কারিগরকেই খোঁজে। নতুন জন ফাঁকা।

**নতুন নিয়ম:** দোকানে একটা **মাপের খাতা**। মাপ নিয়েই খাতায় লেখা হয়। এখন যে কারিগর ফাঁকা, তিনিই খাতা দেখে আপনার কাজ ধরেন। কেউ ছুটিতে গেলে কারও কিছু হারায় না, আর নতুন কারিগর প্রথম দিন থেকেই পুরো কাজ করতে পারেন।

আরেকটা উপায়ও আছে: দোকান আপনাকে একটা **সিল দেওয়া মাপের কার্ড** দেয়। আপনি কার্ড নিয়ে যেকোনো শাখায় যান, কারিগর সিল দেখে বিশ্বাস করেন, খাতা খুলতেও হয় না। কিন্তু কার্ড হারালে যে পায় সে-ও ওটা দেখাতে পারে, আর দোকান কার্ডটা ফেরত নিতে পারে না যতক্ষণ না মেয়াদ শেষ হয়।

- **কারিগর = app server**
- **মাথায় রাখা মাপ = server-এর memory-তে session (stateful)**
- **"শুধু করিম ভাইয়ের কাছে যাও" = sticky session**
- **মাপের খাতা = shared session store (Redis/database)**
- **সিল দেওয়া কার্ড = signed token (JWT/signed cookie)**

আর একটা জিনিস খেয়াল করুন: মাপ কিন্তু উধাও হয়নি। শুধু কারিগরের মাথা থেকে খাতায় গেছে। এখন খাতাটা সাবধানে রাখতে হবে। Software-এও তাই: stateless মানে state নেই না, state অন্য জায়গায়।`,
    diagrams: [
      {
        id: "day-014-analogy",
        caption:
          "দর্জির দোকান: মাপ এক কারিগরের মাথায় থাকলে শুধু তিনিই পারেন; দোকানের খাতায় থাকলে যেকোনো কারিগর।",
        alt: "বামে customer, নিচে সিল দেওয়া মাপের কার্ড (signed token)। মাঝে তিনজন কারিগর: কারিগর ১ ছুটিতে (লাল দাগ, মাথায় রাখা মাপ), কারিগর ২ আর ৩ খাতা দেখে কাজ করছেন। ডানে দোকানের মাপের খাতা (shared session store)।",
      },
    ],
  },

  coreConcept: {
    markdown: `### State কী?

**State** মানে এমন data, যেটা এক request শেষ হওয়ার পরেও টিকে থাকতে হয়, যাতে পরের request সেটা ব্যবহার করতে পারে। একটা web app-এ সাধারণ state:

| State | উদাহরণ | কোথায় রাখলে বিপদ |
| --- | --- | --- |
| Login session | কোন user login করা আছে | Server-এর memory |
| Cart, form-এর অর্ধেক পূরণ | ৫টা জিনিস cart-এ | Server-এর memory |
| Upload করা file | Profile ছবি, invoice PDF | Server-এর local disk |
| In-memory cache | দাম, product list | প্রতিটা server-এর আলাদা কপি |
| চলমান connection | WebSocket-এ chat | Connection নিজেই একটা server-এ বাঁধা |
| Background কাজ | "৫ মিনিট পরে email পাঠাও" timer | Process-এর ভেতরে |

একটা request চলার সময় local variable-এ যা থাকে (request-এর ভেতরের state), সেটা নিয়ে চিন্তা নেই। সমস্যা হয় যখন কিছু **request-এর পরেও** server-এর ভেতরে থেকে যায়।

### Stateful বনাম stateless server

- **Stateful server:** আগের request-এর কথা নিজের ভেতরে (memory বা local disk) মনে রাখে। তাই একই user-এর পরের request **ওই server-এই** আসতে হয়।
- **Stateless server:** কিছুই মনে রাখে না। দরকারি সবকিছু হয় request-এর সাথেই আসে (token, cookie, body), নয়তো server বাইরের কোনো shared জায়গা থেকে পড়ে নেয়। তাই **যেকোনো server যেকোনো request** নিতে পারে।

সবচেয়ে জরুরি কথা: **stateless মানে state নেই না। State আছে, শুধু app server-এর ভেতরে না।** আমরা state-কে কয়েকটা বিশেষ জায়গায় সরিয়ে নিই, যেগুলো এই কাজের জন্যই বানানো।

### কেন এটা এত জরুরি

[Day 4](${day(4)})-এ দেখেছিলাম REST request stateless হয়, আর [Day 9](${day(9)})-এ দেখেছিলাম load balancer কিভাবে server বাছে। দুটো মিলিয়ে, stateless server পেলে:
1. **Load balancer স্বাধীন:** least connections, round robin, যেকোনো algorithm সবচেয়ে ভালো server বাছতে পারে; "এই user-কে ওখানেই পাঠাতে হবে" জাতীয় বাধা নেই।
2. **Server মরা মানে শুধু capacity কমা:** কারও cart বা login হারায় না।
3. **Deploy আর autoscale নির্ভয়ে:** যেকোনো সময় নতুন server যোগ করুন বা পুরনোটা বন্ধ করুন। নতুন server প্রথম request থেকেই পুরো কাজ করে। [Day 13](${day(13)})-এর horizontal scaling-এর এটাই পূর্বশর্ত।

### State কোথায় সরাবেন: তিনটা পথ

1. **Shared store:** Session আর cart এমন জায়গায়, যেটা সব server দেখে। দ্রুত, অল্প সময়ের data (session) সাধারণত **Redis**-এ; টেকসই data (logged-in user-এর cart, order) **database**-এ ([Day 10](${day(10)}))।
2. **Object storage:** ছবি আর file local disk-এ না রেখে S3-এর মতো object storage-এ। Server শুধু file-এর key (যেমন \`avatars/42.jpg\`) database-এ রাখে।
3. **Client-এর কাছে, signed token-এ:** State-টাই একটা **signed cookie** বা **JWT**-তে ভরে client-কে দেওয়া। প্রতি request-এ client সেটা ফেরত পাঠায়, server signature মিলিয়ে বিশ্বাস করে। Server-কে কোথাও খুঁজতে হয় না। তবে logout আর size নিয়ে দাম দিতে হয় (গভীরে যাই অংশে)।

### Sticky session: জোড়াতালি, সমাধান না

[Day 9](${day(9)})-এ sticky session দেখেছি: load balancer একই user-কে (cookie বা IP hash দিয়ে) একই server-এ পাঠায়। এতে cart দেখা যায় ঠিকই, কিন্তু state তখনো একটা server-এর memory-তে। সেই server crash, restart বা scale-in হলে session শেষ; আর ব্যস্ত user-রা একটা server-এ আটকে থেকে ভার অসমান করে। তাই sticky session কাজে লাগে **সাময়িকভাবে**, যতদিন না state বাইরে সরাচ্ছেন, অথবা শুধু performance-এর জন্য (cache hit বাড়াতে), correctness-এর জন্য কখনো না।

**নিচের simulator-এ নিজে চালিয়ে দেখুন:** Load Balancer Lab-এর **"Shopping cart হারিয়ে যাচ্ছে"** challenge খুলুন। Reliability tab-এ Sticky session (বা Algorithm tab-এ IP Hash) চালু করে challenge পার হোন। তারপর ওই user-দের server বন্ধ করুন, আর metrics-এ **"Session হারাল"** সংখ্যা বাড়তে দেখুন। আজকের lesson ঠিক ওই সংখ্যাটাকে শূন্য রাখার উপায়।

### Stateless HTTP, কিন্তু stateful protocol-ও আছে

HTTP নিজে stateless protocol: প্রতিটা request আলাদা, server আগেরটা মনে রাখতে বাধ্য না। Login-এর মতো "মনে রাখা" আমরা ওপরে বসাই cookie বা token দিয়ে।

কিন্তু **WebSocket**-এর মতো protocol-এ একটা connection ঘণ্টার পর ঘণ্টা খোলা থাকে, আর সেটা একটা নির্দিষ্ট server process-এর সাথে বাঁধা। Connection নিজেই state, অন্য server-এ "সরানো" যায় না। Chat বা live score-এর মতো জিনিসে তাই কিছু অংশ stateful থাকতেই হয়; সেটা কিভাবে সামলানো হয় গভীরে যাই অংশে ছুঁয়ে যাব। এখন এটুকু জানলেই চলবে, WebSocket নিয়ে [Day 43](${day(43)})-এ গভীরে যাব।

### Statelessness আর idempotency

Stateless server-এর একটা বড় সুবিধা: কোনো request-এর মাঝখানে server মরলে client বা load balancer **অন্য server-এ আবার পাঠাতে পারে**, কারণ সব server সমান। কিন্তু আবার পাঠানো নিরাপদ কিনা, সেটা ঠিক করে [Day 4](${day(4)})-এর **idempotency**: \`GET\` বা \`PUT\` আবার পাঠালে ক্ষতি নেই, \`POST /orders\` আবার গেলে দুটো order হতে পারে। তাই stateless server আর idempotent API একসাথে চলে: প্রথমটা "যেকোনো server-এ পাঠাও" সম্ভব করে, দ্বিতীয়টা "আবার পাঠাও" নিরাপদ করে।

### এটা বিনামূল্যে না

- প্রতি request-এ session পড়তে Redis-এ একটা বাড়তি network call। একই data center-এ এটা সাধারণত এক millisecond-এর কম, কিন্তু শূন্য না।
- Redis বা database এখন সবার নির্ভরতা। সেটা down মানে কেউ login থাকে না। State উধাও হয়নি, শুধু কয়েকটা জায়গায় জড়ো হয়েছে, আর সেগুলোকে ভালোভাবে চালাতে হবে।`,
    diagrams: [
      {
        id: "day-014-main",
        caption:
          "পরে: app server-গুলো কিছু মনে রাখে না; session Redis-এ, cart আর order database-এ, ছবি object storage-এ।",
        alt: "User cookie sid=ab12 নিয়ে Load Balancer-এ যায়; Load Balancer তিনটা stateless App server-এর যেকোনোটায় পাঠায়। তিনটা App-ই Session Store (Redis) আর Database-এ যুক্ত। User ছবি সরাসরি Object Storage-এ upload করে।",
        downloadable: true,
      },
      {
        id: "day-014-before-after",
        caption:
          "পাশাপাশি: stateful server-এ request কোথায় গেল তার উপর ফল নির্ভর করে; stateless-এ যেকোনো server একই উত্তর দেয়।",
        alt: "উপরে আগের design: তিনটা server-এর memory-তে আলাদা আলাদা session, দুটো request লাল। নিচে পরের design: তিনটা stateless server, সবাই একই Redis আর Database ব্যবহার করে।",
      },
    ],
  },

  deepDive: [
    {
      title: "Session store design: Redis-এ key, TTL, eviction আর replication",
      markdown: `Session Redis-এ সরানো এক লাইনের কাজ মনে হয়। কিন্তু production-এ কয়েকটা সিদ্ধান্ত ঠিক করতে হয়।

**১. Session id কেমন হবে:** Cryptographically secure random, অন্তত ১২৮ bit (যেমন \`secrets.token_urlsafe(32)\`)। ক্রমিক নম্বর (\`sess:1001\`, \`sess:1002\`) দিলে কেউ পরের নম্বর আন্দাজ করে অন্যের session চুরি করবে। Cookie-তে \`HttpOnly\` (JavaScript পড়তে পারবে না), \`Secure\` (শুধু HTTPS) আর \`SameSite=Lax\` দিন। Login-এর পরে নতুন id দিন (session fixation আটকাতে)।

**২. Key আর value:** \`sess:<id>\` → ছোট একটা hash বা JSON: user id, CSRF token, ভাষা। পুরো user profile বা ৫০০ item-এর cart session-এ ঠুসবেন না। Logged-in user-এর cart আসলে database-এর জিনিস (device বদলালেও থাকা উচিত); session-এ শুধু cart-এর id।

**৩. TTL:** প্রতিটা session-এর মেয়াদ, যেমন ৩০ মিনিট (\`SET sess:ab12 ... EX 1800\`)। দুই ধরনের মেয়াদ একসাথে রাখা ভালো:
- **Idle (sliding) timeout:** প্রতি request-এ \`EXPIRE\` দিয়ে ঘড়ি আবার ৩০ মিনিটে। কিছু না করলে ৩০ মিনিটে শেষ।
- **Absolute timeout:** যত ব্যস্তই থাকুক, যেমন ১২ ঘণ্টা পরে আবার login। চুরি যাওয়া session যেন চিরকাল না চলে।

TTL দিলে মেয়াদ শেষ হওয়া session Redis নিজেই মুছে দেয়, কোনো cleanup job লাগে না। TTL ভুলে গেলে? প্রতিটা session চিরকাল থেকে যায়, memory ধীরে ধীরে ভরে।

**৪. Memory-র হিসাব:** ধরুন একসাথে ২ লাখ active session, প্রতিটা গড়ে ১ KB। তাহলে data-ই ২০০ MB, Redis-এর নিজের overhead মিলিয়ে আরও কিছু বেশি। একটা ছোট Redis-এই ধরে যায়। Session store সাধারণত বড় হয় না, ভুল করে বড় জিনিস ঢোকালেই বড় হয়।

**৫. Eviction policy, একটা নিঃশব্দ ফাঁদ:** Memory ভরে গেলে Redis কী করবে, সেটা \`maxmemory-policy\`। Default \`noeviction\`: নতুন write-এ error দেয়, কিছু মোছে না। Cache-এর জন্য মানুষ \`allkeys-lru\` দেয় (সবচেয়ে কম ব্যবহৃত key মুছে জায়গা করো)। এখন একই Redis-এ cache আর session দুটোই রাখলে, cache ভরে গেলে Redis চুপচাপ **session মুছে দেবে**: user হঠাৎ logout, কোনো error log নেই। নিয়ম: session আর cache আলাদা Redis-এ (বা অন্তত session-এর জন্য eviction ছাড়া policy), আর memory ব্যবহারের alert।

**৬. Replication আর failover:** একটা Redis মানে নতুন single point of failure। তাই primary-র সাথে **replica**, আর primary মরলে replica-কে primary বানানো (Redis Sentinel, Redis Cluster বা managed service)। [Day 6](${day(6)})-এর availability-র কথা মনে আছে? Redis replication সাধারণত **asynchronous**: primary write নিয়ে সাথে সাথে "ঠিক আছে" বলে, replica কয়েক millisecond পরে পায়। তাই failover-এর মুহূর্তে শেষ কয়েকটা write হারাতে পারে। Session-এর জন্য এটা সাধারণত মেনে নেওয়া যায়: খারাপ ক্ষেত্রে কয়েকজনকে আবার login করতে হয়। টাকা বা order এভাবে রাখা চলবে না, সেগুলো database-এ। Replication-এর পুরো গল্প [Day 28](${day(28)})-এ।

**৭. Redis down হলে কী করবেন:** আগে থেকে ঠিক করুন। সাধারণত **fail closed**: session পড়া না গেলে user-কে logged-out ধরা, ভুল করে অন্যের পরিচয় দেওয়ার চেয়ে নিরাপদ। আর timeout ছোট রাখুন (যেমন ১০০ms), নইলে Redis ধীর হলে সব request আটকে থাকবে।`,
      diagrams: [
        {
          id: "day-014-session-flow",
          caption:
            "ধাপে ধাপে: Redis-এ রাখা session server crash আর deploy-তে টিকে থাকে, শেষ হয় TTL বা logout-এ।",
          alt: "User, Load Balancer, App 1, App 2 আর Redis-এর architecture। ধাপগুলো: login-এ App 1 Redis-এ session লেখে আর cookie দেয়; পরের request App 2 Redis থেকে পড়ে; App 1 crash করলেও App 2 চলে; deploy-এ নতুন App 1 একই session পড়ে; ৩০ মিনিট পরে TTL শেষে 401; logout-এ DEL।",
        },
        {
          id: "day-014-session-store",
          caption:
            "ভেতরের গঠন: প্রতিটা session একটা key, প্রতিটার নিজের TTL; replica async-ভাবে কপি পায়।",
          alt: "Redis primary বাক্সে তিনটা key: sess:9f2c41 (user 42, TTL 1742s), sess:a71b0e (user 108, TTL 95s), sess:03de5a (মেয়াদ শেষ, মুছে গেছে)। Policy noeviction। ডানে একটা Replica, async তীর দিয়ে যুক্ত, নিচে লেখা failover-এ শেষ কয়েকটা write হারাতে পারে।",
        },
      ],
    },
    {
      title: "Client-side state: signed cookie, JWT আর তাদের ফাঁদ",
      markdown: `Session store-এর বিকল্প হলো state-টাই client-কে দিয়ে দেওয়া, কিন্তু এমনভাবে যাতে সে বদলাতে না পারে।

**কিভাবে কাজ করে:** Server data (যেমন \`{"sub": "42", "role": "user", "exp": ...}\`) নিয়ে একটা গোপন key দিয়ে **signature** বানায়, আর data + signature দুটোই client-কে দেয়। পরের request-এ server আবার signature মেলায়। কেউ \`role\`-কে \`admin\` করলে signature আর মিলবে না। **JWT (JSON Web Token)** এই কাজের একটা standard format: \`header.payload.signature\`, প্রতিটা অংশ Base64url-এ। Rails-এর default session store (CookieStore) আর Django-র \`signed_cookies\` backend একই ধারণা, cookie-র ভেতরে।

**লাভ:** Server-কে কিছু খুঁজতে হয় না, শুধু হিসাব করে verify। কোনো shared store নেই, তাই সেটার down হওয়ার ভয়ও নেই। আলাদা service-গুলো (বা আলাদা company) শুধু public key জেনেই token যাচাই করতে পারে।

এবার ফাঁদগুলো, যেগুলো নতুনরা প্রায়ই দেরিতে টের পায়:

**১. Logout নেই (revocation):** Token-এর ভেতরেই লেখা "exp পর্যন্ত বৈধ"। User logout করল, বা admin তাকে ban করল, কিন্তু token তো client-এর কাছে (বা চোরের কাছে)। Server-এর কাছে কোনো তালিকা নেই যেখান থেকে মুছবে। Access token ২৪ ঘণ্টার হলে, চুরি হওয়া token ২৪ ঘণ্টা কাজ করবে। সাধারণ সমাধান:
- **ছোট মেয়াদের access token** (যেমন ১০-১৫ মিনিট) + **refresh token**, যেটা server-এর store-এ থাকে আর মুছে ফেলা যায়। Ban হলে বড়জোর ১৫ মিনিট।
- **Deny-list:** বাতিল token-এর id (\`jti\`) Redis-এ রাখা, token-এর বাকি মেয়াদ পর্যন্ত TTL দিয়ে। খেয়াল করুন, দুটো সমাধানেই state ফিরে এলো। পুরোপুরি stateless আর তাৎক্ষণিক logout একসাথে পাওয়া যায় না, এটাই মূল trade-off।

**২. পুরনো তথ্য (stale claims):** Token-এ \`role: admin\` লেখা। আজ সকালে তাকে admin থেকে সরানো হলো, কিন্তু token-এর মেয়াদ শেষ না হওয়া পর্যন্ত সে admin। দ্রুত বদলায় এমন জিনিস (permission, balance) token-এ রাখবেন না।

**৩. Size:** Session id ~৩২ character। JWT-তে claim বাড়ালে কয়েকশো byte থেকে কয়েক KB, আর সেটা **প্রতিটা** request-এ যায়, ছবি আর CSS-এর request-সহ। Browser সাধারণত একটা cookie-তে প্রায় ৪ KB পর্যন্ত রাখে, তার বেশি হলে cookie নিঃশব্দে বাদ পড়তে পারে। অনেক server-এর header size-এর সীমাও আছে; পেরোলে \`431\` বা \`400\` error।

**৪. Payload গোপন না:** Signed মানে বদলানো যায় না, **পড়া যায় না এমন না**। যে কেউ Base64 decode করে ভেতরে কী আছে দেখতে পারে। Email, phone বা গোপন কিছু payload-এ রাখবেন না (দরকার হলে encrypted token, JWE)।

**৫. Key rotation:** Signing key একদিন বদলাতে হবে (নিয়মিত, বা ফাঁস হলে)। সব key একসাথে বদলালে সব user একসাথে logout। ঠিক উপায়: token-এর header-এ **\`kid\`** (key id) রাখুন, আর verify করার সময় একটা key-set (যেমন JWKS) থেকে \`kid\` মিলিয়ে key বাছুন। Rotation-এর ধাপ: আগে নতুন public key key-set-এ যোগ করুন, তারপর নতুন key দিয়ে sign শুরু করুন, আর পুরনো key ততদিন রাখুন যতদিন পুরনো token-এর মেয়াদ বাকি। Key ফাঁস হলে অপেক্ষার সুযোগ নেই: পুরনো key সাথে সাথে বাদ, মানে সবাইকে আবার login।

**৬. Algorithm-এর ফাঁদ:** Token-এর header-এ যা \`alg\` লেখা, সেটা অন্ধভাবে মানলে কেউ \`"alg": "none"\` দিয়ে signature ছাড়াই token পাঠাতে পারে, বা RS256 আর HS256 গুলিয়ে দিতে পারে। Verify করার সময় নিজে ঠিক করে দিন কোন algorithm চলবে।

**কখন কোনটা:** একটা web app, একটা backend? Server-side session (Redis) সাধারণত সরল আর নিরাপদ, logout সহজ। অনেক service, mobile app বা অন্য company-কে পরিচয় দিতে হলে ছোট মেয়াদের JWT + revocable refresh token। এখন এটুকু জানলেই চলবে, JWT আর session management নিয়ে [Day 77](${day(77)})-এ গভীরে যাব।`,
      diagrams: [
        {
          id: "day-014-token-anatomy",
          caption:
            "Opaque session id বনাম JWT: একটা store-এ খুঁজতে হয় কিন্তু সাথে সাথে বাতিল করা যায়; অন্যটা নিজেই সব বলে কিন্তু exp পর্যন্ত বৈধ।",
          alt: "বামে opaque session id cookie: random string, প্রতি request-এ store lookup, ছোট, logout মানে DEL, store down হলে কেউ login থাকে না। ডানে JWT-এর তিন অংশ: header (alg RS256, kid), payload (sub, role, exp), signature। নিচে: payload যে কেউ পড়তে পারে, local-এ verify, প্রতি request-এ কয়েকশো byte, exp-এর আগে logout টের পায় না, kid দিয়ে key rotation।",
        },
      ],
    },
    {
      title: "File upload: local disk থেকে object storage",
      markdown: `Session-এর চেয়েও বেশি ধরা পড়ে না এমন state হলো **local disk**। User profile ছবি upload করল, app সেটা \`/uploads/42.jpg\`-এ রাখল। পরের request অন্য server-এ গেলে \`404\`। আর container-এর ক্ষেত্রে আরও খারাপ: container নতুন করে বানালে (প্রতিটা deploy-এ) তার filesystem মুছে যায়। Heroku-র dyno-গুলোর filesystem ঠিক এই কারণে ephemeral: restart-এ লেখা file হারায়, আর dyno দিনে অন্তত একবার restart হয়।

তিনটা বিকল্প:
1. **Shared network disk (NFS/EFS):** সব server একই folder mount করে। পুরনো app না বদলে কাজ চালানোর জন্য ঠিক আছে, কিন্তু network disk ধীর হতে পারে, file lock-এর জটিলতা আসে, আর disk-টাই একটা নির্ভরতা।
2. **Object storage (S3, Google Cloud Storage, নিজে চালালে MinIO):** File রাখা হয় একটা key দিয়ে, যেকোনো server যেকোনো সময় পড়তে পারে, আর storage নিজেই কয়েকটা কপি রাখে। Database-এ শুধু key: \`avatar_key = "avatars/42.jpg"\`। এটাই সাধারণ উত্তর।
3. **সরাসরি client থেকে upload (pre-signed URL):** App server একটা ছোট মেয়াদের signed URL বানিয়ে client-কে দেয়, client ২০০ MB-র video সরাসরি object storage-এ তোলে। App server-এর CPU, memory আর bandwidth বাঁচে, আর upload চলাকালীন server restart হলেও কিছু যায় আসে না।

Request-এর ভেতরে temporary file (ছবি resize করতে \`/tmp\`-এ লিখে কাজ শেষে মুছে ফেলা) ঠিক আছে, কারণ সেটা request শেষ হলে আর দরকার নেই। নিয়ম একটাই: request-এর পরে যে file লাগবে, সেটা local disk-এ না। এখন এটুকু জানলেই চলবে, pre-signed URL আর multipart upload নিয়ে [Day 33](${day(33)})-এ গভীরে যাব।`,
    },
    {
      title: "In-memory cache: soft state, আর cache coherence-এর মাথাব্যথা",
      markdown: `সব in-memory data সমান খারাপ না। একটা ভালো পার্থক্য:
- **Hard state:** হারালে **ভুল** হয়। Session, cart, upload, "এই payment হয়েছে"। এটা server-এ রাখা চলবে না।
- **Soft state:** হারালে শুধু **ধীর** হয়, কারণ আবার আসল উৎস থেকে বানানো যায়। Product list-এর local cache, compiled template, DB connection pool।

প্রতিটা server-এ soft state রাখা ঠিক আছে, stateless-এর নিয়ম ভাঙে না: server মরলে নতুনটা ঠান্ডা cache নিয়ে শুরু করে, একটু ধীর, কিন্তু সঠিক।

তবে একাধিক server-এ আলাদা local cache মানে একটা নতুন সমস্যা: **cache coherence** (সব কপি একই কথা বলছে কিনা)। Admin চালের দাম ৮০ থেকে ৭৫ করল। Request গেল App 1-এ, সে database বদলাল আর নিজের cache মুছল। কিন্তু App 2 আর App 3-এর cache-এ এখনো ৮০, TTL ১০ মিনিট। পরের ১০ মিনিট customer refresh করলে কখনো ৭৫, কখনো ৮০। "সদাইপাতি"-র চতুর্থ অভিযোগ এটাই।

উপায়গুলো, সহজ থেকে কঠিন:
1. **ছোট TTL:** ১০ মিনিটের বদলে ৩০ সেকেন্ড। সবচেয়ে সরল; পুরনো দাম বড়জোর ৩০ সেকেন্ড। কিন্তু database-এ চাপ বাড়ে।
2. **Shared cache (Redis):** সব server একটাই cache দেখে, তাই একবার মুছলেই সবার জন্য মুছে যায়। খরচ: প্রতি read-এ একটা network call।
3. **Invalidation broadcast:** দাম বদলালে একটা message (Redis pub/sub বা message queue) সব server-কে বলে "price:৭ মুছে ফেলো"। দ্রুত, কিন্তু কোনো server message miss করলে সে পুরনো দাম ধরে রাখে, তাই TTL-ও রাখুন।
4. **দুই স্তর:** খুব গরম কয়েকটা key খুব ছোট TTL-এ local cache-এ, বাকি Redis-এ।

আরেকটা লুকানো উদাহরণ: **rate limit counter** প্রতিটা server-এর memory-তে। নিয়ম "প্রতি user মিনিটে ১০০ request", আর ৪টা server round robin-এ। প্রতিটা server আলাদা গোনে, তাই user আসলে মিনিটে ৪ × ১০০ = **৪০০** পর্যন্ত পাঠাতে পারে। Counter shared store-এ না রাখলে limit আসলে server সংখ্যার সাথে বাড়ে ([Day 18](${day(18)})-এ Redis দিয়ে এটাই করা হয়েছিল)।

Cache invalidation, stampede আর eviction নিয়ে [Day 17](${day(17)})-এ গভীরে যাব।`,
    },
    {
      title: "যাদের stateful থাকতেই হয়: database, queue, WebSocket",
      markdown: `সব state-কে "বাইরে" সরালে শেষে কোথাও না কোথাও তো সেটা থাকতে হবে। Database ([Day 10](${day(10)})), message queue ([Day 12](${day(12)})), Redis, search index: এগুলোর **কাজই** state রাখা। এদের stateless বানানো যায় না। Architecture-এর সাধারণ নকশা তাই:

> **অনেক stateless compute + অল্প কয়েকটা ভালোভাবে চালানো stateful store।**

App server-গুলো সস্তা আর বদলযোগ্য, ১০টা থেকে ৫০টা করা এক মিনিটের কাজ। Stateful অংশগুলো দামি, ধীরে বদলায়, আর সেখানেই আমাদের সবচেয়ে বেশি যত্ন (backup, replication, monitoring)। অনেক team এজন্য এগুলো managed service হিসেবে নেয়।

**Stateful service কেন আলাদাভাবে scale হয়:**
- **নতুন কপি মানে data কপি:** নতুন app server এক মিনিটে চালু। নতুন database replica-কে আগে কয়েকশো GB data কপি করে নিতে হয়।
- **কোন data কোথায়, সেটা জানতে হয়:** Data ভাগ করা হলে (sharding, [Day 29](${day(29)})) প্রতিটা request ঠিক সেই node-এ যেতে হবে যেখানে ওই data আছে। "যেকোনো node" চলে না। নতুন node যোগ করলে data সরাতে হয়, consistent hashing ([Day 31](${day(31)})) সেটা কমায়।
- **পরিচয় স্থির রাখতে হয়:** Kubernetes-এ stateless app চলে **Deployment** দিয়ে (pod-গুলো বদলযোগ্য, নাম random)। Database-এর মতো জিনিস চলে **StatefulSet** দিয়ে: প্রতিটা pod-এর স্থির নাম (\`db-0\`, \`db-1\`), নিজের স্থায়ী disk, আর ক্রম মেনে চালু/বন্ধ।
- **বন্ধ করা ঝুঁকির:** Primary database হুট করে বন্ধ করলে failover, leader election, হয়তো কয়েক সেকেন্ডের write বন্ধ। App server বন্ধ করা কোনো ঘটনাই না।

**WebSocket: compute, কিন্তু stateful:** Chat server-এ ১ লাখ user-এর connection খোলা, প্রতিটা connection একটা নির্দিষ্ট server-এ। App 1-এ থাকা রহিম App 3-এ থাকা সালমাকে message পাঠালে App 1 সরাসরি পাঠাতে পারে না। সাধারণ সমাধান:
- **Connection registry:** "সালমা → App 3" এই তথ্য Redis-এ।
- **Pub/sub দিয়ে পৌঁছানো:** App 1 message-টা একটা channel-এ (Redis pub/sub বা broker) দেয়, App 3 সেটা পেয়ে সালমার connection-এ পাঠায়।
- এভাবে connection stateful থাকে, কিন্তু **business state** (message history, কে কোন group-এ) database-এ। Server মরলে client reconnect করে অন্য server-এ যায়, আর কিছু হারায় না। Load balancer-এর দিক থেকে deploy মানে connection-গুলোকে ধীরে ধীরে reconnect করতে বলা, এক ঝটকায় সবাইকে না (নইলে reconnect storm)।`,
    },
    {
      title: "Graceful shutdown, draining আর 12-factor-এর 'disposable' process",
      markdown: `Stateless server-এর আসল পুরস্কার হলো তাকে যেকোনো সময় বন্ধ করা যায়। কিন্তু "যেকোনো সময় বন্ধ" মানে "হুট করে মেরে ফেলা" না। [Day 9](${day(9)})-এ load balancer-এর দিক থেকে connection draining দেখেছি; এখানে app-এর দিকটা।

**Graceful shutdown-এর ধাপ:**
1. **SIGTERM পেলে সাথে সাথে মরবেন না।** Readiness endpoint (\`/ready\`) \`503\` দেওয়া শুরু করুন।
2. **কয়েক সেকেন্ড অপেক্ষা, তখনো request নিন।** Kubernetes-এ SIGTERM পাঠানো আর load balancer-এর তালিকা থেকে pod সরানো একসাথে, আলাদা আলাদা পথে ঘটে। তাই SIGTERM-এর পরেও কয়েক সেকেন্ড নতুন request আসতে পারে। এজন্য অনেকে \`preStop\` hook-এ ৫-১০ সেকেন্ড \`sleep\` রাখে।
3. **নতুন connection বন্ধ, চলমান request শেষ হতে দিন।** Keep-alive connection-এ \`Connection: close\`।
4. **Resource ছাড়ুন:** DB pool, broker connection। তারপর exit 0।
5. **সব grace period-এর ভেতরে।** Kubernetes-এ default ৩০ সেকেন্ড (\`terminationGracePeriodSeconds\`), \`docker stop\`-এ ১০ সেকেন্ড। তার পরে SIGKILL, তখন যা চলছিল সব কাটা।

একটা সাধারণ ভুল: Docker-এ app যদি shell script দিয়ে চালু হয় আর script SIGTERM app-কে পৌঁছে না দেয়, তাহলে app সংকেতই পায় না। প্রতিটা \`docker stop\` তখন পুরো ১০ সেকেন্ড অপেক্ষা করে SIGKILL দেয়। Deploy ধীর, আর প্রতিবার চলমান request কাটা।

**"Process-এর ভেতরে টাইমার" আরেক ধরনের state।** "Order-এর ১০ মিনিট পরে reminder SMS" যদি process-এর ভেতরে একটা timer হয়, deploy-তে process বন্ধ হলেই সেটা হারায়। এমন কাজ queue বা scheduler-এ দিন (Day 12), যাতে process মরলেও কাজ থাকে। যে request মাঝপথে কাটা পড়ে, client সেটা অন্য server-এ retry করবে, তাই সেটা idempotent হওয়া দরকার।

**12-factor app:** Heroku-র engineer-দের লেখা "The Twelve-Factor App" নীতিমালায় দুটো factor ঠিক এই lesson:
- **VI. Processes:** App চলবে এক বা একাধিক **stateless, share-nothing** process হিসেবে। যা টিকে থাকা দরকার, তা যাবে backing service-এ (database, Redis)। Memory বা local disk শুধু একটা request-এর ভেতরের কাজের জন্য। সেখানে স্পষ্ট লেখা: sticky session এই নীতি ভাঙে, তার উপর কখনো নির্ভর করা যাবে না; session-এর জন্য Redis বা Memcached-এর মতো মেয়াদ-সহ store ভালো।
- **IX. Disposability:** Process দ্রুত চালু হবে আর SIGTERM পেলে সুন্দরভাবে বন্ধ হবে, যাতে যেকোনো সময় শুরু বা থামানো যায়।

দুটো মিলিয়ে: state বাইরে, আর process "ফেলে দেওয়ার মতো"। তখনই autoscaling ([Day 87](${day(87)})) আর rolling/canary deploy ([Day 85](${day(85)})) সত্যিই কাজ করে।`,
      diagrams: [
        {
          id: "day-014-shutdown",
          caption:
            "ধাপে ধাপে: SIGTERM থেকে draining, চলমান কাজ শেষ, তারপর exit; grace period পেরোলে SIGKILL।",
          alt: "State diagram: Running থেকে SIGTERM-এ Draining, LB সরালে Finishing, কাজ শেষ হলে Exited, grace period শেষ হলে SIGKILL। প্রতিটা ধাপে active অবস্থা আলাদা রঙে।",
        },
      ],
    },
  ],

  simulator: "load-balancer-lab",

  tradeOffs: {
    markdown: `**কখন stateful রাখা ঠিক:** একটাই server, আর বাড়ানোর পরিকল্পনা নেই (ছোট internal tool); অথবা যেটার কাজই state রাখা (database, queue, cache)। আর WebSocket-এর মতো connection, যেটা সরানো যায় না।

**কখন stateless দরকার:** একাধিক server, autoscaling, প্রতিদিন deploy, বা server মরলেও user যেন টের না পায়। অর্থাৎ বেশিরভাগ web/API server।

State কোথায় রাখবেন, চারটা পথ পাশাপাশি:`,
    table: {
      headers: [
        "বিষয়",
        "Server-এর memory (stateful)",
        "Sticky session",
        "Shared store (Redis/DB)",
        "Client token (JWT/signed cookie)",
      ],
      rows: [
        [
          "State কোথায়",
          "প্রতিটা server-এ আলাদা",
          "প্রতিটা server-এ আলাদা, LB user-কে বেঁধে রাখে",
          "সব server-এর জন্য একটা store",
          "Client-এর কাছে, signature সহ",
        ],
        [
          "Server crash হলে",
          "ওই server-এর সব session শেষ",
          "ওই server-এর সব session শেষ",
          "কিছু হারায় না",
          "কিছু হারায় না",
        ],
        [
          "LB-র স্বাধীনতা",
          "নেই (ভুল server = ভুল ফল)",
          "নেই, ভার অসমান হয়",
          "পুরো (যেকোনো algorithm)",
          "পুরো",
        ],
        [
          "Deploy / autoscale",
          "Session হারায়",
          "Session শেষ হওয়ার অপেক্ষা, নতুন server ফাঁকা",
          "নির্ভয়ে",
          "নির্ভয়ে",
        ],
        [
          "প্রতি request-এর খরচ",
          "শূন্য",
          "শূন্য",
          "একটা network call (সাধারণত <1ms)",
          "Signature verify + বড় header",
        ],
        [
          "তাৎক্ষণিক logout/ban",
          "সহজ",
          "সহজ",
          "সহজ (DEL)",
          "কঠিন: exp পর্যন্ত বৈধ, deny-list লাগে",
        ],
        [
          "নতুন নির্ভরতা",
          "নেই",
          "LB-র stickiness setting",
          "Store-কে HA রাখতে হয়",
          "Signing key সামলানো, rotation",
        ],
        [
          "উপযুক্ত",
          "এক server-এর ছোট app",
          "পুরনো app সরানোর সময়ের জোড়াতালি; cache hit বাড়ানো",
          "বেশিরভাগ web app-এর session",
          "অনেক service/mobile, ছোট মেয়াদের access token",
        ],
      ],
    },
  },

  industry: {
    markdown: `- **The Twelve-Factor App:** Heroku-র engineer-দের লেখা এই নীতিমালার Factor VI বলে process হবে stateless আর share-nothing, আর স্পষ্ট বলে sticky session এর লঙ্ঘন; session data-র জন্য Redis বা Memcached-এর মতো মেয়াদ-সহ store। Factor IX (Disposability) বলে দ্রুত চালু আর SIGTERM-এ সুন্দরভাবে বন্ধ।
- **Heroku:** Dyno-র filesystem ephemeral, আর dyno নিয়মিত (দিনে অন্তত একবার) restart হয়। তাই সেখানে local disk-এ file রাখা app সহজেই ভাঙে; documentation file-এর জন্য S3-এর মতো storage ব্যবহার করতে বলে।
- **Kubernetes:** Stateless app-এর জন্য **Deployment**, আর স্থির পরিচয় ও নিজস্ব disk লাগে এমন জিনিসের জন্য **StatefulSet**। Pod বন্ধের সময় SIGTERM, তারপর \`terminationGracePeriodSeconds\` (default ৩০ সেকেন্ড) শেষে SIGKILL; \`preStop\` hook দিয়ে মাঝখানে অপেক্ষা যোগ করা যায়।
- **AWS Application Load Balancer:** Target group-এ sticky session দুই রকম: load balancer-এর নিজের cookie (duration-based) আর app-এর cookie (application-based)। অর্থাৎ stopgap-টা সহজেই পাওয়া যায়, কিন্তু stateless হওয়ার দায়িত্ব app-এর।
- **Web framework-এর session store:** Express-এর \`express-session\`-এর default MemoryStore-এর documentation নিজেই সতর্ক করে যে এটা production-এর জন্য না (memory leak করে, একটা process ছাড়িয়ে scale করে না); Redis-এর জন্য \`connect-redis\`-এর মতো store আছে। Spring Session HTTP session Redis বা JDBC-তে রাখে। Django-তে database, cache আর \`signed_cookies\` backend; Rails-এর default CookieStore session-টা signed ও encrypted cookie-তেই রাখে।
- **Standard:** JWT হলো RFC 7519, আর key-set (JWK/JWKS) RFC 7517। WebSocket protocol RFC 6455।

সাধারণ নকশা, প্রায় সব বড় backend-এ: load balancer-এর পেছনে stateless app server (container-এ), session Redis-এ, স্থায়ী data database-এ, file object storage-এ, আর লম্বা কাজ queue-তে।

*উৎস: The Twelve-Factor App (12factor.net, factor VI Processes ও IX Disposability); Heroku Dev Center (Dynos and the Dyno Manager: ephemeral filesystem, restart); Kubernetes documentation (Deployments, StatefulSets, Pod lifecycle: termination of Pods); AWS Elastic Load Balancing documentation (sticky sessions for Application Load Balancer target groups); express-session README; Spring Session reference; Django ও Rails session documentation; Redis documentation (EXPIRE, key eviction, replication); RFC 7519, RFC 7517, RFC 6455।*`,
  },

  mistakes: [
    {
      mistake:
        "Framework-এর default in-memory session store (যেমন express-session-এর MemoryStore) রেখেই দ্বিতীয় server যোগ করা। User এলোমেলোভাবে logout হয়।",
      fix: "দ্বিতীয় server যোগ করার আগেই session Redis বা database-এ সরান; নয়তো ছোট মেয়াদের signed token।",
    },
    {
      mistake:
        "Sticky session দিয়ে cart হারানো 'ঠিক' করে ভাবা কাজ শেষ। পরের deploy বা crash-এ ওই server-এর সব user-এর session যায়, আর নতুন server ফাঁকা থাকে।",
      fix: "Sticky session-কে সাময়িক ধরুন। Correctness কখনো stickiness-এর উপর নির্ভর করবে না; state shared store-এ নিন।",
    },
    {
      mistake:
        "Upload করা file app server বা container-এর local disk-এ রাখা। অন্য server-এ গেলে 404, container নতুন হলে file উধাও।",
      fix: "File object storage-এ, database-এ শুধু key। বড় file client থেকে pre-signed URL দিয়ে সরাসরি upload।",
    },
    {
      mistake:
        "Cache আর session একই Redis-এ রাখা, eviction policy allkeys-lru। Memory ভরলে Redis নিঃশব্দে session মুছে user-দের logout করে দেয়।",
      fix: "Session আর cache আলাদা Redis-এ, session-এর store-এ eviction ছাড়া policy আর memory alert। প্রতিটা session-এ TTL।",
    },
    {
      mistake:
        "২৪ ঘণ্টার JWT দিয়ে 'logout' বানানো শুধু client থেকে token মুছে। চুরি যাওয়া বা ban হওয়া user-এর token পুরো দিন কাজ করে।",
      fix: "ছোট মেয়াদের access token + server-এ রাখা, বাতিলযোগ্য refresh token; জরুরি ক্ষেত্রে jti deny-list। Permission-এর মতো দ্রুত বদলানো তথ্য token-এ না।",
    },
    {
      mistake:
        "প্রতিটা server-এর memory-তে rate limit counter বা দামের cache রেখে ধরে নেওয়া সব server একই সংখ্যা দেখছে।",
      fix: "যেটা হারালে ভুল হয় (counter) সেটা shared store-এ। Local cache শুধু soft state হিসেবে, ছোট TTL বা invalidation broadcast সহ।",
    },
    {
      mistake:
        "SIGTERM সামলানো হয় না, বা shell script সংকেত app-কে পৌঁছায় না। প্রতিটা deploy-এ চলমান request কাটে আর container পুরো grace period ধরে ঝুলে থাকে।",
      fix: "App-এ SIGTERM handler: readiness fail, অল্প অপেক্ষা, চলমান কাজ শেষ, তারপর exit। Dockerfile-এ exec form বা exec দিয়ে app চালান।",
    },
  ],

  lab: [
    {
      title: "প্রস্তুতি: দুটো app, একটা NGINX, একটা Redis",
      markdown: `এই lab-এ একটা ছোট "cart" app দুটো container-এ চালাবেন, সামনে NGINX load balancer, পাশে Redis। App-টা একটা environment variable দেখে ঠিক করে cart কোথায় রাখবে: নিজের memory-তে (\`STORE=memory\`) নাকি Redis-এ (\`STORE=redis\`)। Docker ছাড়া কিছু লাগবে না।

([Day 9](${day(9)})-এর lab-এ NGINX-এর algorithm দেখেছিলেন। আজ মনোযোগ state-এ।)

\`\`\`bash
mkdir -p state-lab/lb && cd state-lab
\`\`\`

\`app.py\`: প্রতিটা browser-কে (এখানে curl-এর cookie file) একটা \`sid\` cookie দেয়। \`/add?item=...\` cart-এ জিনিস যোগ করে, আর প্রতিটা উত্তরে বলে কোন server উত্তর দিল আর cart-এ কী আছে। SIGTERM পেলে সুন্দরভাবে বন্ধ হয়।

\`\`\`bash
cat > app.py <<'EOF'
import os
import signal
import sys
import threading
import uuid
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import parse_qs, urlparse

NAME = os.environ["NAME"]
STORE = os.environ.get("STORE", "memory")
CART_TTL = 1800  # ৩০ মিনিট কিছু না করলে cart মুছে যাবে

if STORE == "redis":
    import redis

    r = redis.Redis(host="redis", port=6379, decode_responses=True)

    def add_item(sid, item):
        key = f"cart:{sid}"
        r.rpush(key, item)
        r.expire(key, CART_TTL)  # প্রতিটা কাজে মেয়াদ নতুন করে শুরু

    def get_cart(sid):
        return r.lrange(f"cart:{sid}", 0, -1)

else:
    carts = {}  # এই process-এর নিজের memory, অন্য server দেখতে পায় না

    def add_item(sid, item):
        carts.setdefault(sid, []).append(item)

    def get_cart(sid):
        return carts.get(sid, [])


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        url = urlparse(self.path)
        cookie = SimpleCookie(self.headers.get("Cookie", ""))
        sid = cookie["sid"].value if "sid" in cookie else uuid.uuid4().hex[:6]
        if url.path == "/add":
            add_item(sid, parse_qs(url.query)["item"][0])
        cart = get_cart(sid)
        body = f"{NAME} ({STORE}) sid={sid} cart={cart}\\n".encode()
        self.send_response(200)
        self.send_header("Set-Cookie", f"sid={sid}; Path=/; HttpOnly")
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass


server = ThreadingHTTPServer(("0.0.0.0", 8000), Handler)


def on_sigterm(*_):
    # Graceful shutdown: নতুন request নেওয়া বন্ধ, তারপর বের হওয়া
    print(f"{NAME}: SIGTERM পেলাম, বন্ধ হচ্ছি", flush=True)
    threading.Thread(target=server.shutdown).start()


signal.signal(signal.SIGTERM, on_sigterm)
print(f"{NAME} ready, store={STORE}", flush=True)
server.serve_forever()
sys.exit(0)
EOF
\`\`\`

(Lab-এর জন্য session id ছোট রাখা হয়েছে, ৬ character। Production-এ অন্তত ১২৮ bit-এর random id দিন, গভীরে যাই অংশ দেখুন।)

\`compose.yaml\`। দুটো app একই image আর একই code, শুধু নাম আলাদা। \`STORE\` না দিলে \`memory\`। App চালু হওয়ার সময় Redis-এর Python client install করে নেয়, তাই প্রথমবার কয়েক সেকেন্ড লাগে (internet লাগবে)।

\`\`\`bash
cat > compose.yaml <<'EOF'
name: sdlab-day014

x-app: &app
  image: python:3.12-alpine
  command: sh -c "pip install -q --root-user-action=ignore --disable-pip-version-check redis==5.0.8 && exec python /app.py"
  volumes:
    - ./app.py:/app.py:ro
  depends_on:
    - redis

services:
  redis:
    image: redis:7-alpine
    container_name: sdlab-day014-redis

  app-1:
    <<: *app
    container_name: sdlab-day014-app-1
    environment:
      NAME: app-1
      STORE: \${STORE:-memory}

  app-2:
    <<: *app
    container_name: sdlab-day014-app-2
    environment:
      NAME: app-2
      STORE: \${STORE:-memory}

  lb:
    image: nginx:1.27-alpine
    container_name: sdlab-day014-lb
    ports:
      - "8094:80"
    volumes:
      - ./lb:/etc/nginx/conf.d:ro
    depends_on:
      - app-1
      - app-2

networks:
  default:
    name: sdlab-day014-net
EOF
\`\`\`

খেয়াল করুন \`exec python /app.py\`: \`exec\` না দিলে \`sh\` process-টাই মূল process থাকত, আর \`docker stop\`-এর SIGTERM app পর্যন্ত পৌঁছাত না (সাধারণ ভুলের তালিকা দেখুন)।

NGINX-এর config, সাধারণ round robin:

\`\`\`bash
cat > lb/default.conf <<'EOF'
upstream app {
    zone app 64k;
    server app-1:8000;
    server app-2:8000;
}

server {
    listen 80;

    location / {
        proxy_pass http://app;
        proxy_connect_timeout 1s;
    }
}
EOF
\`\`\`

একজন user-এর মতো আচরণ করা একটা script: নতুন cookie file দিয়ে শুরু, তিনটা জিনিস cart-এ, তারপর cart দেখা।

\`\`\`bash
cat > shop.sh <<'EOF'
#!/bin/sh
# একজন user (একটা cookie jar) পরপর ৩টা জিনিস cart-এ যোগ করে, তারপর cart দেখে
rm -f jar.txt
for item in chal dal tel; do
  curl -s -b jar.txt -c jar.txt "localhost:8094/add?item=$item"
done
curl -s -b jar.txt -c jar.txt localhost:8094/
EOF
chmod +x shop.sh
docker compose up -d && sleep 8
docker logs sdlab-day014-app-1
\`\`\`

\`\`\`text
app-1 ready, store=memory
\`\`\`

দেখলে সব তৈরি। Port 8094 অন্য কিছু ব্যবহার করলে \`compose.yaml\`-এ বদলে নিন।`,
    },
    {
      title: "পরীক্ষা ১: Memory-তে cart, round robin-এ ভাঙা",
      markdown: `\`\`\`bash
./shop.sh
\`\`\`

\`\`\`text
app-1 (memory) sid=1e57c6 cart=['chal']
app-2 (memory) sid=1e57c6 cart=['dal']
app-1 (memory) sid=1e57c6 cart=['chal', 'tel']
app-2 (memory) sid=1e57c6 cart=['dal']
\`\`\`

(আপনার \`sid\` আলাদা হবে, আর শুরুটা app-2 থেকেও হতে পারে।) Cookie একই, user একই, অথচ একই user-এর দুটো আলাদা cart! Round robin request পালা করে পাঠাচ্ছে, আর প্রতিটা app শুধু নিজের memory-র \`carts\` dictionary দেখে। শেষ লাইনে user তিনটা জিনিস রেখেও দেখছে শুধু \`dal\`। "সদাইপাতি"-র প্রথম অভিযোগ, হুবহু।`,
    },
    {
      title: "পরীক্ষা ২: ip_hash দিয়ে জোড়াতালি, তারপর server মরল",
      markdown: `Load balancer-কে বলি একই IP-কে একই server-এ পাঠাতে:

\`\`\`bash
cat > lb/default.conf <<'EOF'
upstream app {
    zone app 64k;
    ip_hash;
    server app-1:8000;
    server app-2:8000;
}

server {
    listen 80;

    location / {
        proxy_pass http://app;
        proxy_connect_timeout 1s;
    }
}
EOF
docker exec sdlab-day014-lb nginx -t && docker exec sdlab-day014-lb nginx -s reload && sleep 2
./shop.sh
\`\`\`

\`\`\`text
app-1 (memory) sid=2fe09a cart=['chal']
app-1 (memory) sid=2fe09a cart=['chal', 'dal']
app-1 (memory) sid=2fe09a cart=['chal', 'dal', 'tel']
app-1 (memory) sid=2fe09a cart=['chal', 'dal', 'tel']
\`\`\`

(আপনার ক্ষেত্রে সব app-2-তেও যেতে পারে।) Cart এখন ঠিক! সমস্যা মিটে গেল? এবার যে server-এ user আটকে আছে, সেটা crash করাই (\`docker kill\` হঠাৎ মেরে ফেলে, graceful না)। নিচে \`app-1\`-এর জায়গায় আপনার output-এ যে নাম এসেছে সেটা দিন:

\`\`\`bash
docker kill sdlab-day014-app-1
curl -s -b jar.txt -c jar.txt localhost:8094/
\`\`\`

\`\`\`text
app-2 (memory) sid=2fe09a cart=[]
\`\`\`

NGINX app-1-এ connect করতে না পেরে request app-2-তে পাঠাল (Day 9-এর passive health check), site চালু আছে। কিন্তু cart খালি। Server-এর সাথে state-ও মরেছে। এবার server ফিরিয়ে আনুন:

\`\`\`bash
docker start sdlab-day014-app-1
sleep 12
curl -s -b jar.txt localhost:8094/
\`\`\`

\`\`\`text
app-1 (memory) sid=2fe09a cart=[]
\`\`\`

NGINX-এর \`fail_timeout\` (১০ সেকেন্ড) শেষে user আবার app-1-এ ফিরল, কিন্তু cart তবুও খালি: process নতুন করে চালু হয়েছে, memory শূন্য। প্রতিটা deploy-ও ঠিক এটাই করে। আর আরেকটা জিনিস: lab-এ সব request একই IP থেকে আসছে, তাই \`ip_hash\` সবাইকে এক server-এ পাঠাচ্ছে; Day 9-এ দেখা CGNAT-এর hot spot এখানেও আছে।`,
    },
    {
      title: "পরীক্ষা ৩: Cart Redis-এ, server-গুলো stateless",
      markdown: `আবার সাধারণ round robin-এ ফিরি (stickiness ছাড়া), আর app-গুলোকে \`STORE=redis\` দিয়ে নতুন করে চালাই:

\`\`\`bash
cat > lb/default.conf <<'EOF'
upstream app {
    zone app 64k;
    server app-1:8000;
    server app-2:8000;
}

server {
    listen 80;

    location / {
        proxy_pass http://app;
        proxy_connect_timeout 1s;
    }
}
EOF
export STORE=redis
docker compose up -d && sleep 8
docker compose restart lb && sleep 1
./shop.sh
\`\`\`

(\`export\` দিলাম যাতে এই terminal-এর পরের সব \`docker compose\` command-ও \`STORE=redis\` দেখে। নতুন terminal খুললে আবার \`export STORE=redis\` দিন, নইলে container আবার memory mode-এ তৈরি হবে।)

\`\`\`text
app-1 (redis) sid=864b46 cart=['chal']
app-2 (redis) sid=864b46 cart=['chal', 'dal']
app-1 (redis) sid=864b46 cart=['chal', 'dal', 'tel']
app-2 (redis) sid=864b46 cart=['chal', 'dal', 'tel']
\`\`\`

Request এখনো পালা করে দুই server-এ যাচ্ছে, কিন্তু cart এখন সবসময় ঠিক। কোনো server কিছু মনে রাখছে না, দুজনেই Redis থেকে পড়ছে। (\`docker compose restart lb\` দেওয়া হলো কারণ app container নতুন হলে তাদের IP বদলাতে পারে, আর NGINX চালু হওয়ার সময়ের IP ধরে রাখে।)

এবার আবার crash:

\`\`\`bash
docker kill sdlab-day014-app-1
for i in 1 2 3; do curl -s -b jar.txt localhost:8094/; done
\`\`\`

\`\`\`text
app-2 (redis) sid=864b46 cart=['chal', 'dal', 'tel']
app-2 (redis) sid=864b46 cart=['chal', 'dal', 'tel']
app-2 (redis) sid=864b46 cart=['chal', 'dal', 'tel']
\`\`\`

Server মরল, cart টিকে থাকল। হারাল শুধু capacity। এবার একটা "deploy" করি, দুটো app-ই restart:

\`\`\`bash
time docker compose restart app-1 app-2
sleep 12
for i in 1 2 3 4; do curl -s -b jar.txt localhost:8094/; done
docker logs sdlab-day014-app-2 | tail -2
\`\`\`

\`\`\`text
app-2 (redis) sid=864b46 cart=['chal', 'dal', 'tel']
app-1 (redis) sid=864b46 cart=['chal', 'dal', 'tel']
app-2 (redis) sid=864b46 cart=['chal', 'dal', 'tel']
app-1 (redis) sid=864b46 cart=['chal', 'dal', 'tel']
app-2: SIGTERM পেলাম, বন্ধ হচ্ছি
app-2 ready, store=redis
\`\`\`

দুটো server-ই নতুন process, তবু cart অক্ষত। Log-এ দেখুন app SIGTERM পেয়ে নিজে বন্ধ হয়েছে, আর \`time\` দেখাবে restart এক সেকেন্ডের মতো নিয়েছে। Handler না থাকলে Docker ১০ সেকেন্ড অপেক্ষা করে SIGKILL দিত। (প্রথমে দু-একটা request শুধু একটা app-এ গেলে আরও কয়েক সেকেন্ড অপেক্ষা করে আবার চালান; NGINX সদ্য restart হওয়া server-কে \`fail_timeout\` পর্যন্ত বাদ রাখে।)`,
    },
    {
      title: "পরীক্ষা ৪: Redis-এর ভেতরে দেখুন, TTL সহ",
      markdown: `State এখন কোথায়, নিজের চোখে দেখুন:

\`\`\`bash
SID=$(grep sid jar.txt | awk '{print $7}')
docker exec sdlab-day014-redis redis-cli KEYS 'cart:*'
docker exec sdlab-day014-redis redis-cli LRANGE cart:$SID 0 -1
docker exec sdlab-day014-redis redis-cli TTL cart:$SID
\`\`\`

\`\`\`text
cart:864b46
chal
dal
tel
1785
\`\`\`

শেষ সংখ্যাটা বাকি মেয়াদ, সেকেন্ডে (১৮০০ থেকে কমছে)। (\`KEYS\` এখানে ছোট lab-এর জন্য ঠিক আছে; production-এ লাখো key-র উপর এটা Redis আটকে দেয়, তখন \`SCAN\`।) এবার মেয়াদ কমিয়ে ৫ সেকেন্ড করি, যেন user অনেকক্ষণ কিছু করেনি:

\`\`\`bash
docker exec sdlab-day014-redis redis-cli EXPIRE cart:$SID 5
sleep 6
curl -s -b jar.txt localhost:8094/
\`\`\`

\`\`\`text
1
app-1 (redis) sid=864b46 cart=[]
\`\`\`

(\`1\` মানে Redis মেয়াদ বসিয়েছে। উত্তরে app-2-ও আসতে পারে।) মেয়াদ শেষে Redis নিজেই key মুছে দিয়েছে। কোনো cleanup job লেখা লাগেনি। Session store-এ ঠিক এভাবেই idle timeout কাজ করে।`,
    },
    {
      title: "পরীক্ষা ৫: State উধাও হয়নি, সরেছে মাত্র",
      markdown: `আবার cart ভরুন, তারপর এবার Redis-কেই হঠাৎ মেরে ফেলুন:

\`\`\`bash
./shop.sh
docker kill sdlab-day014-redis
curl -s -o /dev/null -w "%{http_code}\\n" -b jar.txt localhost:8094/
\`\`\`

\`\`\`text
app-1 (redis) sid=5b0f7e cart=['chal']
app-2 (redis) sid=5b0f7e cart=['chal', 'dal']
app-1 (redis) sid=5b0f7e cart=['chal', 'dal', 'tel']
app-2 (redis) sid=5b0f7e cart=['chal', 'dal', 'tel']
502
\`\`\`

দুটো app সুস্থ, তবু site বন্ধ (\`502 Bad Gateway\`), কারণ দুজনেই Redis-এর উপর নির্ভর করে। এবার Redis ফিরিয়ে আনুন:

\`\`\`bash
docker start sdlab-day014-redis
sleep 12
curl -s -b jar.txt localhost:8094/
\`\`\`

\`\`\`text
app-2 (redis) sid=5b0f7e cart=[]
\`\`\`

Cart হারিয়েছে! এই Redis-এ কোনো replica নেই, আর হঠাৎ মারা যাওয়ার আগে data disk-এ snapshot হয়নি। শিক্ষা: app server stateless করলে state গিয়ে জমা হয় store-এ, আর তখন সেই store-টাকে replication, persistence আর monitoring দিয়ে ভালোভাবে চালাতে হয় (Day 6, Day 28)। Login session-এর মতো জিনিসে কয়েকজনকে আবার login করানো চলে; order বা টাকা এভাবে রাখা চলবে না, সেগুলো database-এ।`,
    },
    {
      title: "পরিষ্কার করুন",
      markdown: `\`\`\`bash
docker compose down -v
cd .. && rm -rf state-lab
\`\`\`

\`docker compose down -v\` চারটা container, \`sdlab-day014-net\` network আর Redis-এর volume সরিয়ে দেয়।`,
    },
  ],

  connections: {
    markdown: `- **[Day 4](${day(4)}) · API ও REST:** সেখানে বলেছিলাম REST request stateless, প্রতিটা request নিজের পরিচয় সাথে আনে। আজ দেখলাম server-কেও stateless হতে হয়, নইলে request stateless হলেও লাভ নেই। আর idempotency ঠিক করে, মরা server-এর request অন্য server-এ আবার পাঠানো নিরাপদ কিনা।
- **[Day 5](${day(5)}) · Scalability:** সেখানে "stateless app server" ছিল horizontal scaling-এর একটা হাতিয়ারের নাম। আজ তার ভেতরটা: কোন state, কোথায়, কী দামে।
- **[Day 6](${day(6)}) · Availability:** Stateless server-এ active-active সহজ। কিন্তু state এখন Redis আর database-এ, তাই সেগুলোর replication আর failover-ই availability ঠিক করে।
- **[Day 9](${day(9)}) · Load Balancers:** সেখানে sticky session-কে "সমস্যা ঢাকা" বলেছিলাম, আর connection draining দেখেছিলাম। আজ তার আসল সমাধান: state বাইরে, আর app-এর দিক থেকে graceful shutdown।
- **[Day 10](${day(10)}) · Databases:** Database-ই সবচেয়ে বড় stateful অংশ। Cart, order আর user-এর স্থায়ী তথ্য সেখানে; Redis-এর মতো key-value store session-এর জন্য।
- **[Day 12](${day(12)}) · Message Queues:** "পরে করব" ধরনের কাজ process-এর ভেতরে timer না রেখে queue-তে দিলে process মরলেও কাজ থাকে। Queue নিজে stateful, worker-রা stateless।
- **[Day 13](${day(13)}) · Vertical vs Horizontal Scaling:** Horizontal scaling-এর পূর্বশর্ত এটাই। Server state ধরে রাখলে নতুন server যোগ করলেও কাজে আসে না।

সামনে যা আসছে: [Day 17](${day(17)})-এ Caching (invalidation আর stampede), [Day 28](${day(28)})-এ Database Replication, [Day 29](${day(29)})-এ Sharding, [Day 33](${day(33)})-এ Object Storage ও File Upload, [Day 43](${day(43)})-এ WebSockets, [Day 77](${day(77)})-এ JWT ও Session Management, [Day 85](${day(85)})-এ Blue-Green ও Canary Deploy, আর [Day 87](${day(87)})-এ Autoscaling।`,
  },

  explainYourself: [
    {
      question:
        'আপনার teammate বলছে, "আমাদের app stateless, কারণ আমরা Redis ব্যবহার করি, তাই state নিয়ে আর ভাবার কিছু নেই।" কথাটার কোথায় ঠিক, কোথায় ভুল?',
      idealAnswer:
        "ঠিক এটুকু: session Redis-এ থাকলে app server stateless, যেকোনো server যেকোনো request নিতে পারে, crash বা deploy-তে কারও কিছু হারায় না। ভুল হলো 'ভাবার কিছু নেই' অংশে। State উধাও হয়নি, Redis-এ জড়ো হয়েছে। এখন Redis down মানে কেউ login থাকে না, তাই replication আর failover লাগবে; async replication-এ failover-এ শেষ কয়েকটা write হারাতে পারে; TTL না দিলে memory ভরে; cache-এর সাথে একই Redis-এ allkeys-lru থাকলে session নিঃশব্দে মুছবে। আর local disk-এ file বা memory-তে counter থাকলে app এখনো আংশিক stateful।",
    },
    {
      question:
        "Server-side session (Redis) আর JWT-এর মধ্যে তাৎক্ষণিক logout নিয়ে পার্থক্য কী? JWT-তে সেটা পেতে হলে কী দাম দিতে হয়?",
      idealAnswer:
        "Server-side session-এ logout মানে Redis থেকে key মুছে দেওয়া, পরের request থেকেই কাজ করে। JWT নিজের মেয়াদ নিজের ভেতরে বয়ে বেড়ায়, server-এর কাছে মোছার মতো কিছু নেই, তাই exp পর্যন্ত বৈধ থাকে। তাৎক্ষণিক বাতিল করতে হলে হয় ছোট মেয়াদের access token আর server-এ রাখা বাতিলযোগ্য refresh token (বড়জোর কয়েক মিনিট দেরি), নয়তো বাতিল token-এর jti একটা deny-list-এ রেখে প্রতি request-এ দেখা। দুটোতেই server-এ আবার state ফিরে আসে; পুরো stateless আর তাৎক্ষণিক revocation একসাথে পাওয়া যায় না।",
    },
    {
      question:
        "Sticky session চালু করে cart-এর সমস্যা মিটে গেছে। তবুও কেন team-কে state বাইরে সরাতে বলবেন? অন্তত তিনটা কারণ দিন।",
      idealAnswer:
        "প্রথমত, state তখনো একটা server-এর memory-তে, তাই crash, restart বা প্রতিটা deploy-এ ওই server-এর সব user-এর cart আর login হারায়। দ্বিতীয়ত, ভার অসমান হয়: ব্যস্ত user-রা পুরনো server-এ আটকে থাকে, নতুন যোগ করা server প্রায় ফাঁকা, তাই autoscaling-এর লাভ কমে। তৃতীয়ত, scale-in বা deploy করতে session শেষ হওয়ার অপেক্ষা করতে হয়। IP hash দিয়ে stickiness হলে CGNAT-এর পেছনের হাজার user এক server-এ জমে, আর mobile-এ IP বদলালে stickiness ভাঙে। State shared store-এ থাকলে এসবের কোনোটাই থাকে না।",
    },
  ],

  interviewQuestions: [
    {
      question:
        "আপনার app একটা server-এ চলে, session memory-তে। এখন ১০টা server-এ নিতে হবে। কী কী বদলাবেন?",
      answerOutline: `- প্রথমে state-এর তালিকা: session, cart, upload করা file, local cache, in-process timer/job, rate limit counter, WebSocket
- Session → Redis (TTL, HttpOnly/Secure cookie) বা ছোট মেয়াদের signed token; cart/order → database
- File → object storage, DB-তে key; বড় upload pre-signed URL
- Cache → soft state হিসেবে রাখা যায়, নইলে shared Redis; counter → shared store
- Background কাজ → queue
- Graceful shutdown, readiness endpoint, health check; তারপর load balancer যেকোনো algorithm
- Sticky session শুধু transition-এর সময়, পরে বন্ধ`,
    },
    {
      question:
        "Session-এর জন্য server-side store আর JWT-এর মধ্যে কিভাবে বাছবেন?",
      answerOutline: `- Server-side (Redis): ছোট opaque id, তাৎক্ষণিক logout/ban, data বদলানো সহজ; খরচ: প্রতি request-এ lookup, store-এর HA
- JWT: lookup নেই, অনেক service/অন্য পক্ষ public key দিয়ে verify করতে পারে; খরচ: revocation কঠিন, stale claims, size, key rotation, payload পড়া যায়
- মাঝামাঝি: ছোট মেয়াদের access JWT + server-এ রাখা refresh token; দরকারে jti deny-list
- একটা web app + একটা backend হলে server-side session সাধারণত সরল ও নিরাপদ`,
    },
    {
      question:
        "Session store হিসেবে Redis ব্যবহার করছেন। Production-এ কী কী নিশ্চিত করবেন?",
      answerOutline: `- Random, ≥128-bit session id; login-এর পরে নতুন id
- প্রতিটা key-তে TTL: idle (sliding) + absolute timeout
- Value ছোট; বড় data database-এ
- Eviction: cache-এর সাথে মিশিয়ে allkeys-lru না; আলাদা instance বা noeviction + memory alert
- Replica + automatic failover; async replication-এ শেষ কয়েকটা write হারাতে পারে, session-এ মেনে নেওয়া যায়
- Client-এ ছোট timeout; Redis down হলে fail closed
- Memory sizing: active session × গড় size`,
    },
    {
      question:
        "Chat app-এ WebSocket ব্যবহার করছেন, ১০টা server। একজন user-এর message আরেক server-এ থাকা user-এর কাছে কিভাবে পৌঁছাবে, আর deploy কিভাবে করবেন?",
      answerOutline: `- Connection stateful, একটা server-এ বাঁধা; সরানো যায় না
- Connection registry (user → server) Redis-এ; message pub/sub বা broker দিয়ে সঠিক server-এ
- Business state (message history, group) database-এ, যাতে server মরলে client reconnect করে অন্য server-এ গেলেও কিছু না হারায়
- Load balancer: least connections ভালো; deploy-এ connection ধীরে ধীরে বন্ধ করে reconnect, jitter সহ, reconnect storm এড়াতে
- Client-এর reconnect আর missed message ধরার logic (শেষ দেখা message id)`,
    },
    {
      question:
        "Deploy-এর সময় কিছু user error পায়, যদিও server-গুলো stateless। কোথায় দেখবেন?",
      answerOutline: `- App SIGTERM সামলায় কিনা; shell wrapper সংকেত আটকায় কিনা (exec form)
- Readiness fail → অপেক্ষা → নতুন connection বন্ধ → চলমান শেষ: এই ক্রম আছে কিনা; Kubernetes-এ endpoint সরানো আর SIGTERM একসাথে ঘটে, তাই preStop-এ ছোট sleep
- Grace period যথেষ্ট কিনা (K8s default ৩০s, docker stop ১০s)
- LB-র draining/deregistration delay
- লুকানো state: process-এর ভেতরে timer/job, local disk-এ file, memory-তে counter
- কাটা পড়া request-এর retry idempotent কিনা`,
    },
  ],

  summary: {
    points: [
      "State মানে যা এক request-এর পরেও টিকে থাকতে হয়: session, cart, file, cache, connection।",
      "Stateless server কিছু মনে রাখে না, তাই যেকোনো server যেকোনো request নিতে পারে; crash মানে শুধু capacity কমা।",
      "Stateless মানে state নেই না: session Redis-এ, স্থায়ী data database-এ, file object storage-এ, বা signed token-এ client-এর কাছে।",
      "Sticky session জোড়াতালি: crash, deploy আর scale-in-এ session যায়, ভার অসমান হয়।",
      "JWT lookup বাঁচায়, কিন্তু exp-এর আগে logout কঠিন; ছোট মেয়াদ + refresh token, আর kid দিয়ে key rotation।",
      "Session store-এ TTL, আলাদা eviction policy আর replication; store এখন সবার নির্ভরতা।",
      "Database, queue, WebSocket stateful থাকে আর আলাদাভাবে scale হয়; app server stateless + graceful shutdown = নির্ভয়ে deploy আর autoscale।",
    ],
    diagram: {
      id: "day-014-summary",
      caption: "এক নজরে Stateful vs Stateless",
      alt: "User token বা cookie নিয়ে Load Balancer-এ, Load Balancer যেকোনো একটা Stateless App-এ, App Redis (session) আর DB/Storage-এ যুক্ত।",
    },
  },
};
