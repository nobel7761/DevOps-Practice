// Day 1 · সিস্টেম ডিজাইন আসলে কী? — the course's first lesson (Phase 1, no prerequisites).

import { topicHrefForDay } from "@/lib/data/courses/system-design-a-z";
import type { SdLesson } from "@/lib/system-design/lesson.types";

const day = topicHrefForDay;

export const day001Lesson: SdLesson = {
  topicId: "sd-day-001",
  day: 1,
  title: "সিস্টেম ডিজাইন আসলে কী?",
  definition:
    "System Design হলো আগে থেকে ঠিক করা, কোন কোন অংশ দিয়ে একটা software বানাবেন, অংশগুলো কিভাবে যুক্ত থাকবে, আর অনেক মানুষ একসাথে ব্যবহার করলে বা কিছু ভাঙলে system কেমন আচরণ করবে।",

  objectives: [
    "একটা ছোট app আর লাখো user-এর system-এর পার্থক্য কোথায়, আর কেন শুধু 'code ঠিক থাকা' যথেষ্ট না, ব্যাখ্যা করতে পারবেন।",
    "Functional আর non-functional requirement আলাদা করে লিখতে পারবেন, আর scalability, availability, latency, consistency, reliability, maintainability, cost কী বোঝায় এক লাইনে বলতে পারবেন।",
    "Client, server, database, cache, load balancer, queue আর CDN দিয়ে একটা system-এর প্রথম মানচিত্র আঁকতে পারবেন, আর প্রতিটা অংশ কোন সমস্যার সমাধান করে বলতে পারবেন।",
    "User ১ থেকে ১০ লাখে গেলে design কিভাবে ধাপে ধাপে বদলায়, আর প্রতিটা ধাপে কী trade-off নেওয়া হয়, যুক্তি দিয়ে বলতে পারবেন।",
  ],

  prerequisites: [],

  problem: {
    markdown: `ধরুন আপনি আর আপনার বন্ধু মিলে একটা ঈদ-কেনাকাটার website বানালেন। মাসে কয়েকশো টাকার একটা ছোট cloud server। তার ভেতরেই চলছে আপনার app-এর code, MySQL database, আর product-এর সব ছবি।

প্রথম মাসে ৫০-৬০ জন বন্ধু-আত্মীয় ব্যবহার করল। সব ঠিকঠাক। Page খোলে এক সেকেন্ডে, order যায়, কেউ কোনো অভিযোগ করে না।

তারপর চাঁদ রাতের আগে একজন জনপ্রিয় Facebook page আপনার একটা offer share করল। এক ঘণ্টায় এলো **৫০,০০০** মানুষ। যা ঘটল:

1. Server-এর CPU ১০০%। Page খুলতে ৩০ সেকেন্ড, তারপর error।
2. Database-এর connection শেষ। নতুন কেউ login-ই করতে পারছে না।
3. প্রতিটা page-এ ৫টা বড় ছবি, সব একই server থেকে যাচ্ছে। Bandwidth শেষ।
4. বিরক্ত হয়ে আপনি server restart দিলেন। ২ মিনিট পুরো site বন্ধ, আর মাঝপথে থাকা কয়েকটা order-এর টাকা কাটা হয়েছে কিন্তু order save হয়নি।

মজার ব্যাপার হলো, **আপনার code-এ কোনো bug ছিল না।** "Cart-এ যোগ করুন" ঠিক কাজ করে, "Order করুন" ঠিক কাজ করে। ৫০ জনের জন্য যা নিখুঁত ছিল, ৫০,০০০ জনের জন্য সেটাই ভেঙে পড়ল।

সমস্যাটা ছিল **design**-এ: সবকিছু একটা machine-এ, কোনো backup নেই, ছবি আর data একই জায়গা থেকে, আর কেউ আগে প্রশ্নই করেনি "হঠাৎ ১০০০ গুণ মানুষ এলে কী হবে?" এই প্রশ্নগুলো আগে থেকে করা আর তার উত্তর দিয়ে system সাজানোর নামই **System Design**।`,
    diagrams: [
      {
        id: "day-001-before",
        caption:
          "আগে: একটাই server-এ app, database আর ছবি; হাজার হাজার user একসাথে এলে পুরোটা একসাথে বসে যায়।",
        alt: "অনেকগুলো user একটা মাত্র server-এ request পাঠাচ্ছে; server লাল চিহ্নে overloaded, তার সাথে লাগানো database-ও চাপে।",
      },
    ],
  },

  analogy: {
    markdown: `বাসায় চারজনের জন্য বিরিয়ানি রান্নার কথা ভাবুন। একজন রাঁধেন, একটা হাঁড়ি, একটা চুলা। কেউ একটু দেরিতে খেলেও সমস্যা নেই।

এবার একই বিরিয়ানি একটা বিয়ে বাড়িতে, **৫০০ জন** অতিথির জন্য। রেসিপি কিন্তু একই। তবু সব বদলে যায়:

- একজন না, কয়েকজন **বাবুর্চি**, প্রত্যেকে নিজের ডেকচিতে। একজন অসুস্থ হলেও রান্না থামে না।
- একজন **পরিবেশনের সর্দার**, যিনি ঠিক করেন কোন টেবিলে কোন পরিবেশনকারী যাবে, যাতে কেউ বসে না থাকে আর কোনো টেবিল খালি না থাকে।
- বোরহানি আর সালাদ আগে থেকেই গ্লাসে-প্লেটে সাজিয়ে রাখা, যাতে প্রতিবার বানাতে না হয়।
- **ভাঁড়ার ঘর**-এ চাল, মাংস, মশলার হিসাব, যেটা হারালে পুরো অনুষ্ঠান বিপদে।
- একটা বাড়তি গ্যাস সিলিন্ডার, যদি একটা শেষ হয়ে যায়।
- আর বাজেট। ১০ জন বাবুর্চি রাখলে খাবার দ্রুত আসবে, কিন্তু খরচ বাড়বে।

খেয়াল করুন, "বিরিয়ানি কিভাবে রাঁধতে হয়" (**কী করবে**) বদলায়নি। বদলেছে "কত জনকে, কত দ্রুত, কতটা নিশ্চিন্তে, কত খরচে" (**কতটা ভালোভাবে করবে**)। Software-এও ঠিক তাই:

- **বাবুর্চিরা = Server**: আসল কাজটা করে
- **পরিবেশনের সর্দার = Load Balancer**: কাজ ভাগ করে দেয়
- **আগে সাজানো বোরহানি = Cache**: বারবার লাগে এমন জিনিস হাতের কাছে
- **ভাঁড়ার ঘর = Database**: আসল হিসাব, যেটা হারানো চলবে না
- **বাড়তি সিলিন্ডার = Redundancy**: একটা ভাঙলেও চলবে

বিয়ে বাড়ির কর্তা যেমন অনুষ্ঠানের আগেই এগুলো ঠিক করেন, system designer-ও তেমনি user আসার আগেই ঠিক করেন।`,
    diagrams: [
      {
        id: "day-001-analogy",
        caption:
          "বাসার রান্না বনাম বিয়ে বাড়ির রান্না: রেসিপি একই, কিন্তু মানুষ বাড়লে ব্যবস্থাটাই বদলে যায়।",
        alt: "বামে একজন রাঁধুনি একটা হাঁড়ি থেকে চারজনকে খাওয়াচ্ছেন। ডানে তিনজন বাবুর্চি, একজন পরিবেশনের সর্দার, ভাঁড়ার ঘর আর আগে সাজানো বোরহানির ট্রে, যেগুলো server, load balancer, database আর cache-এর সাথে মেলানো।",
      },
    ],
  },

  coreConcept: {
    markdown: `**System Design** হলো একটা software-এর বড় ছবিটা আঁকা: কোন কোন অংশ (component) লাগবে, অংশগুলো একে অপরের সাথে কিভাবে কথা বলবে, data কোথায় থাকবে আর কোন পথে যাবে, যাতে system তার **requirement** পূরণ করে, যত user আসার কথা তত user নিয়েও, আর বাজেটের ভেতরে।

Code লেখা প্রশ্নের উত্তর দেয় "এই কাজটা কিভাবে করব?"। System design প্রশ্নের উত্তর দেয় "এই কাজটা লাখো মানুষের জন্য, দিনরাত, কিছু ভাঙলেও কিভাবে চালু রাখব?"।

### Requirement: দুই ধরনের

যেকোনো design শুরু হয় requirement দিয়ে। এগুলো দুই রকম:

- **Functional requirement** (system **কী করবে**): "User product খুঁজতে পারবে", "Cart-এ যোগ করতে পারবে", "bKash দিয়ে টাকা দিতে পারবে"। এগুলো feature।
- **Non-functional requirement** (system **কতটা ভালোভাবে করবে**): "৯৫% page ৩০০ms-এর মধ্যে খুলবে", "বছরে ৯ ঘণ্টার বেশি বন্ধ থাকবে না", "একসাথে ১ লাখ user সামলাবে", "একবার নেওয়া order কখনো হারাবে না"। এগুলো quality।

আমাদের ঈদ-website-এর functional requirement ঠিক ছিল। ভেঙেছিল non-functional দিকগুলো, যেগুলো কেউ লিখেই রাখেনি। **System design-এর বেশিরভাগ কঠিন সিদ্ধান্ত আসে non-functional requirement থেকে।**

### যে quality-গুলোর কথা পুরো course-এ বারবার আসবে

এখন শুধু নামগুলো চিনে রাখুন। প্রতিটার জন্য আলাদা দিন আছে।

- **Scalability**: load বাড়লে resource যোগ করে system-কে বাড়ানো যায় কিনা, পুরোটা নতুন করে না লিখে। বড় machine কেনা (vertical) নাকি বেশি machine (horizontal)? [Day 5](${day(5)})-এ শুরু, [Day 13](${day(13)})-এ গভীরে যাব।
- **Availability**: user যখন চাইবে তখন system সাড়া দেয় কিনা, সাধারণত % দিয়ে মাপা ("99.9% uptime")। [Day 6](${day(6)})-এ গভীরে যাব।
- **Latency ও Throughput**: Latency মানে একটা request-এ কত সময় লাগে; throughput মানে প্রতি সেকেন্ডে কতগুলো request শেষ হয়। দুটো এক জিনিস না। [Day 7](${day(7)})।
- **Consistency**: সবাই একই, সর্বশেষ data দেখছে কিনা। আপনি profile ছবি বদলালেন, বন্ধু কি সাথে সাথে নতুনটা দেখবে? [Day 8](${day(8)})-এ শুরু, [Day 47](${day(47)})-এ গভীরে।
- **Reliability**: system **ঠিকভাবে** কাজ করে কিনা, দীর্ঘ সময় ধরে, কিছু ভাঙলেও, data না হারিয়ে। Availability বলে "চালু আছে কিনা"; reliability বলে "চালু থেকে সঠিক কাজ করছে কিনা"। Phase 6-এ এর কৌশলগুলো শিখব।
- **Maintainability**: অন্য engineer (বা ৬ মাস পরের আপনি) code বুঝে, বদলে, চালিয়ে নিতে পারে কিনা। Design এমন জটিল হলে যে কেউ ছুঁতে ভয় পায়, সেটা খারাপ design। [Day 61](${day(61)}) আর [Day 89](${day(89)})-এ এর দিকগুলো আসবে।
- **Cost**: সব quality-র একটা দাম আছে: server, bandwidth, আর engineer-এর সময়। [Day 19](${day(19)})-এ হিসাব করা শিখব।

### প্রথম মানচিত্র: মূল building block

বেশিরভাগ বড় system আসলে কয়েকটা পরিচিত অংশ জোড়া দিয়ে বানানো। Lego-র মতো:

- **Client**: user-এর browser বা mobile app, যেখান থেকে request শুরু। ([Day 2](${day(2)}))
- **Server (App Server)**: আপনার code যেখানে চলে, request নিয়ে উত্তর বানায়। ([Day 2](${day(2)}))
- **Database**: data স্থায়ীভাবে রাখার জায়গা, "আসল হিসাব"। ([Day 10](${day(10)}))
- **Cache**: বারবার লাগে এমন data দ্রুত memory-তে রাখা, যাতে database-এ প্রতিবার যেতে না হয়। ([Day 17](${day(17)}))
- **Load Balancer**: অনেক server-এর সামনে বসে request-গুলো ভাগ করে দেয়, আর মরা server-কে বাদ দেয়। ([Day 9](${day(9)}))
- **Queue**: যে কাজ এখনই না করলেও চলে (email, SMS), সেটা লাইনে রেখে পরে করানো। ([Day 12](${day(12)}))
- **CDN**: ছবি, video, CSS-এর মতো জিনিস user-এর কাছাকাছি কোনো server থেকে দেওয়া। ([Day 11](${day(11)}))

নিচের diagram-এ এগুলো একসাথে। প্রতিটা অংশ একটা নির্দিষ্ট সমস্যার উত্তর, আর প্রতিটা অংশ নিজের সাথে নতুন জটিলতাও আনে।

### Trade-off: এই বিষয়ের আসল প্রাণ

System design-এ প্রায় কোনো সিদ্ধান্তই "শুধু ভালো" না। প্রতিটা সিদ্ধান্ত কিছু দেয়, কিছু নেয়:

- Cache দিলে page দ্রুত হয়, কিন্তু user কখনো কখনো একটু পুরনো data দেখতে পারে।
- দুটো server রাখলে একটা মরলেও site চলে, কিন্তু খরচ দ্বিগুণ, আর দুটোকে একই অবস্থায় রাখার ঝামেলা আসে।
- Queue দিলে user দ্রুত উত্তর পায়, কিন্তু কাজটা "হয়ে গেছে" না, "হবে"।

তাই একজন ভালো designer "সবচেয়ে ভালো design" খোঁজেন না। তিনি খোঁজেন **এই requirement-এর জন্য সবচেয়ে ঠিক design**, আর পরিষ্কার করে বলতে পারেন কী ছেড়ে দিয়ে কী পেলেন।

### HLD বনাম LLD

System design শব্দটা দুই স্তরে ব্যবহার হয়:

- **High-Level Design (HLD)**: বড় ছবি। কোন কোন component, কে কার সাথে কথা বলে, data কোথায়। উপরের মানচিত্রটা HLD। এই course-এর বেশিরভাগ এই স্তরে।
- **Low-Level Design (LLD)**: একটা box-এর ভেতরে। Class আর module কিভাবে ভাগ হবে, database table-এর column, একটা order-এর state কিভাবে বদলায়, কোন design pattern। [Day 115](${day(115)})-এ LLD-র পরিচিতি হবে।

দুটো আলাদা দক্ষতা, কিন্তু একে অপরের পরিপূরক। HLD ঠিক না হলে সুন্দর class দিয়েও system বাঁচানো যায় না; আর LLD এলোমেলো হলে ভালো HLD-ও maintain করা কঠিন।`,
    diagrams: [
      {
        id: "day-001-qualities",
        caption:
          "যে সাতটা quality নিয়ে পুরো course: প্রতিটার পাশে কোন দিনে গভীরে যাব।",
        alt: "মাঝখানে System Design লেখা বৃত্ত, চারপাশে সাতটা box: Scalability (Day 5), Availability (Day 6), Latency ও Throughput (Day 7), Consistency (Day 8), Reliability (Phase 6), Maintainability (Day 61), Cost (Day 19)।",
      },
      {
        id: "day-001-main",
        caption:
          "মূল building block-এর প্রথম মানচিত্র: client থেকে CDN আর load balancer, তারপর server, cache, database আর queue।",
        alt: "Client CDN থেকে ছবি নেয় আর Load Balancer-এ request পাঠায়; Load Balancer দুটো App Server-এ ভাগ করে; App Server-রা Cache আর Database ব্যবহার করে, আর ধীর কাজ Queue-তে পাঠায়, যেখান থেকে Worker তুলে নেয়।",
        downloadable: true,
      },
      {
        id: "day-001-before-after",
        caption:
          "পাশাপাশি: একটা server-এ সব বনাম building block দিয়ে সাজানো system।",
        alt: "উপরে একটাই overloaded server-এর design, নিচে load balancer, একাধিক server, cache, database, queue আর CDN সহ design, সাথে প্রতিটার ফলাফল।",
      },
    ],
  },

  deepDive: [
    {
      title: "১ জন থেকে ১০ লাখ user: design কিভাবে ধাপে ধাপে বড় হয়",
      markdown: `কোনো বড় system প্রথম দিন থেকে বড় ছিল না। সাধারণ গল্পটা এরকম, আর প্রতিটা ধাপ আসে **একটা নির্দিষ্ট bottleneck** (যেখানে আটকে যাচ্ছে) থেকে:

1. **শুরু (কয়েকশো user)**: একটা server-এ app আর database দুটোই। এটা ভুল না, বরং এই অবস্থায় এটাই সবচেয়ে ভালো: সস্তা, সহজ, debug করা সোজা।
2. **হাজার খানেক user**: App আর database একই machine-এর CPU আর RAM নিয়ে টানাটানি করে। Database-কে আলাদা machine-এ সরানো হয়। এখন দুটোকে আলাদাভাবে বড় করা যায়, আর backup নেওয়াও সহজ। প্রথমে সাধারণত **বড় machine** কেনা হয় (vertical scaling), কারণ code বদলাতে হয় না। কিন্তু এর একটা সীমা আছে, আর machine একটাই, তাই সেটা মরলে সব বন্ধ।
3. **দশ হাজার থেকে লাখ user**: একটা app server আর পারে না। সামনে **load balancer**, পেছনে দুই বা তার বেশি app server (horizontal scaling)। এর জন্য server-দের **stateless** হতে হয়, মানে user-এর session server-এর memory-তে রাখা যাবে না ([Day 14](${day(14)}))। আর বারবার পড়া data-র জন্য **cache**, যাতে database-এর চাপ কমে।
4. **দশ লাখ user**: ছবি আর video সরে যায় **CDN**-এ। Database-এ read অনেক বেশি হলে **read replica** (database-এর কপি, শুধু পড়ার জন্য; [Day 28](${day(28)}))। Email, SMS, invoice-এর মতো ধীর কাজ **queue** আর worker-এ।
5. **তার পরে**: একটা database-এ আর data ধরে না, তখন **sharding** ([Day 29](${day(29)})); পৃথিবীর নানা প্রান্তের user-এর জন্য একাধিক region ([Day 88](${day(88)}))।

দুটো জরুরি কথা:

- **এখানে user সংখ্যাগুলো শুধু আন্দাজ।** একটা chat app ১০ হাজার user-এই যে চাপ পায়, একটা blog ১০ লাখেও তা পায় না। আসল প্রশ্ন "কত user" না, "**কোথায় আটকাচ্ছে**", আর সেটা জানতে মাপতে হয় (metrics, [Day 89](${day(89)}))।
- **প্রতিটা ধাপ জটিলতা বাড়ায়।** তাই ধাপ এগোবেন তখনই, যখন আগের ধাপ সত্যিই আটকে যাচ্ছে। আগে থেকে "Facebook-এর মতো" design বানালে টাকা আর সময় দুটোই নষ্ট।`,
      diagrams: [
        {
          id: "day-001-evolution",
          caption:
            "ধাপে ধাপে: user বাড়ার সাথে সাথে একটা একটা করে component যোগ হয়, প্রতিটা একটা নির্দিষ্ট bottleneck-এর উত্তর।",
          alt: "পাঁচ ধাপের diagram: এক server-এ সব; database আলাদা; load balancer আর দুটো app server সহ cache; CDN, read replica আর queue যোগ; শেষে পুরো বড় design।",
        },
      ],
    },
    {
      title: "খাতা-কলমের হিসাব: back-of-the-envelope estimation",
      markdown: `ভালো designer আগে একটু হিসাব করে নেন, কারণ সংখ্যা ছাড়া "অনেক user" শুনে কেউ বলতে পারে না একটা server লাগবে নাকি একশোটা। একে বলে **back-of-the-envelope estimation** (খামের পেছনে করা মোটা দাগের হিসাব)। লক্ষ্য নিখুঁত উত্তর না, **সঠিক মাত্রা** (১০ নাকি ১০০ নাকি ১০,০০০)।

একটা উদাহরণ। ধরুন প্রতিদিন **১০ লাখ** user app খোলে (Daily Active Users, DAU), প্রত্যেকে দিনে গড়ে **২০টা** request পাঠায়:

- দিনে মোট: ১০ লাখ × ২০ = **২ কোটি request**
- একদিনে সেকেন্ড: ৮৬,৪০০, হিসাবের সুবিধায় ধরি প্রায় ১ লাখ (10⁵)
- গড়ে: ২ কোটি ÷ ৮৬,৪০০ ≈ **২৩০ request/সেকেন্ড**
- কিন্তু traffic সারাদিন সমান না। সন্ধ্যায় বা ঈদের আগে কয়েক গুণ বেশি। Peak ধরি গড়ের ৩ গুণ: **প্রায় ৭০০ request/সেকেন্ড**

এখন যদি মেপে দেখেন একটা app server আপনার কাঙ্ক্ষিত latency রেখে ~২০০ request/সেকেন্ড সামলায়, তাহলে peak-এর জন্য লাগবে ৪টা, আর একটা মরলেও চলার জন্য অন্তত ৫টা।

Storage-এর হিসাবও একইভাবে: দিনে ১ লাখ order, প্রতিটা ~২KB হলে দিনে ~২০০MB, বছরে ~৭৩GB। মানে কয়েক বছর একটা database-এই চলবে, এখনই sharding নিয়ে ভাবার দরকার নেই। এই একটা লাইনের হিসাব অনেক অপ্রয়োজনীয় জটিলতা বাঁচায়।

কিছু সংখ্যা মোটা দাগে মনে রাখা কাজের (মাত্রাটাই আসল, ঠিক সংখ্যা hardware অনুযায়ী বদলায়):
- Memory (RAM) থেকে পড়া: ~১০০ **nanosecond**
- SSD থেকে random পড়া: দশ থেকে কয়েকশো **microsecond**
- একই data center-এর ভেতরে এক server থেকে আরেক server-এ যাওয়া-আসা: ~০.৫ **millisecond**
- এক মহাদেশ থেকে আরেক মহাদেশে যাওয়া-আসা: ~১০০-২০০ **millisecond** বা তার বেশি

শেষ লাইনটাই বলে দেয় কেন CDN লাগে: ঢাকার user-কে আমেরিকার server থেকে প্রতিটা ছবি দিলে শুধু আলোর গতির সীমার কারণেই দেরি হবে, server যত দ্রুতই হোক। এই হিসাবের পুরো কৌশল [Day 19](${day(19)})-এ।`,
    },
    {
      title: "বড় scale-এ failure স্বাভাবিক ঘটনা",
      markdown: `একটা server হয়তো গড়ে ৩ বছরে (প্রায় ১০০০ দিনে) একবার নষ্ট হয়। আপনার যদি একটা server থাকে, এটা খুব বিরল ঘটনা। কিন্তু **১০০০টা** server থাকলে গড়ে **প্রায় প্রতিদিন একটা** নষ্ট হবে। বড় system-এ failure "যদি হয়" না, "**কখন হবে**"। Amazon-এর CTO Werner Vogels-এর একটা বিখ্যাত কথা আছে: "Everything fails, all the time."

তাই design-এর প্রশ্ন হলো, কিছু ভাঙলে কী হবে?

**Single Point of Failure (SPOF):** যে অংশ একা মরলে পুরো system মরে। আমাদের ঈদ-website-এর একমাত্র server ছিল SPOF। Design review-তে প্রতিটা box দেখিয়ে জিজ্ঞেস করুন, "এটা মরলে কী হবে?"

**একের পর এক থাকা অংশে availability গুণ হয়:** Request load balancer → app server → database হয়ে যায়, প্রতিটা 99.9% available। পুরো পথের availability ≈ 0.999 × 0.999 × 0.999 ≈ **99.7%**। মানে অংশ যত বাড়ে, কোনো একটা ভাঙার সম্ভাবনাও বাড়ে।

**পাশাপাশি কপি রাখলে availability অনেক বাড়ে (redundancy):** দুটো app server, প্রতিটা 99% available আর একে অপরের থেকে স্বাধীনভাবে fail করে। দুটো একসাথে মরার সম্ভাবনা ০.০১ × ০.০১ = ০.০০০১, তাই অন্তত একটা চালু থাকে **99.99%** সময়।

তবে "স্বাধীনভাবে" শব্দটা খুব গুরুত্বপূর্ণ। দুটো server যদি একই rack-এ, একই বিদ্যুৎ লাইনে থাকে, বা দুটোতেই একই ভুল code deploy হয়, তাহলে দুটো একসাথে মরবে, আর গুণের হিসাব খাটবে না। তাই বড় system আলাদা data center বা zone-এ কপি রাখে।

"Nine"-এর হিসাব, বছরে কতক্ষণ বন্ধ থাকা যায়:
| Availability | বছরে মোট downtime |
|---|---|
| 99% | ~৩.৬৫ দিন |
| 99.9% | ~৮.৮ ঘণ্টা |
| 99.99% | ~৫২.৬ মিনিট |
| 99.999% | ~৫.৩ মিনিট |

প্রতিটা বাড়তি "9" আগেরটার চেয়ে অনেক বেশি দামী। তাই আগে ঠিক করুন আপনার আসলে কতটা লাগে।

Failure-কে মেনে নিয়ে design করার কয়েকটা কৌশল, যেগুলো পরে বিস্তারিত শিখব: **timeout** (চিরকাল অপেক্ষা না করা), **retry with backoff** ([Day 57](${day(57)})), **circuit breaker** ([Day 59](${day(59)})), আর **graceful degradation**: recommendation service মরলে home page বন্ধ না করে "জনপ্রিয় product" দেখানো। Netflix এমনকি ইচ্ছা করে production-এ server মেরে দেখে system টেকে কিনা ([Day 92](${day(92)}): Chaos Engineering)।`,
    },
    {
      title: "নিখুঁত design বলে কিছু নেই",
      markdown: `নতুনরা প্রায়ই জিজ্ঞেস করে, "WhatsApp-এর আসল design কোনটা? ওটাই শিখে নিই।" কিন্তু WhatsApp-এর design WhatsApp-এর requirement, team, বাজেট আর সময়ের ফল। আপনার requirement আলাদা হলে একই design আপনার জন্য ভুল হতে পারে।

কয়েকটা উদাহরণ, যেখানে "ঠিক" উত্তর requirement-এর উপর নির্ভর করে:

- **bKash-এর মতো balance বনাম Facebook-এর like count।** Balance-এ দুই জায়গায় দুই রকম সংখ্যা দেখানো চলবে না, তাই strong consistency লাগে, একটু ধীর হলেও। Like count কয়েক সেকেন্ড পুরনো থাকলে কারো ক্ষতি নেই, তাই দ্রুততা আর availability বেছে নেওয়া যায়।
- **Network ভাগ হয়ে গেলে** (দুই data center একে অপরের সাথে কথা বলতে পারছে না) ভুল উত্তর দেওয়ার ঝুঁকি নেবেন, নাকি উত্তর দেওয়াই বন্ধ রাখবেন? এটাই CAP-এর মূল প্রশ্ন ([Day 8](${day(8)}))।
- **Microservices বনাম একটা বড় app (monolith)।** ২০০ জন engineer-এর company-তে আলাদা team আলাদা service চালালে সুবিধা। দুজনের startup-এ একই কাজ শুধু ঝামেলা বাড়ায় ([Day 61](${day(61)}))।

তাহলে "it depends" বলেই কি থেমে যাবেন? না। ভালো উত্তর হলো "**it depends on X**, আর X এরকম হলে আমি এটা বাছব, কারণ..."। নির্ভরতাটা নাম ধরে বলতে পারাই দক্ষতা।

আরেকটা কাজের চিন্তা: **কোন সিদ্ধান্ত পরে বদলানো সহজ, কোনটা কঠিন।** Cache কতক্ষণ data রাখবে, সেটা কাল বদলানো যায়। কিন্তু কোন database-এ data রাখবেন, বা data কিভাবে ভাগ করবেন, সেটা বদলাতে মাসের পর মাস লাগতে পারে। তাই কঠিন-বদলানো সিদ্ধান্তে বেশি সময় দিন, সহজগুলোতে দ্রুত এগোন।

আর মনে রাখবেন: **সবচেয়ে সাধারণ design যেটা requirement পূরণ করে, সেটাই সাধারণত সবচেয়ে ভালো।** প্রতিটা নতুন component মানে নতুন কিছু যা ভাঙতে পারে, monitor করতে হয়, আর নতুন engineer-কে শেখাতে হয়।`,
      diagrams: [
        {
          id: "day-001-tradeoff",
          caption:
            "Trade-off-এর দাঁড়িপাল্লা: এক দিকে কিছু পেলে অন্য দিকে কিছু দিতে হয়; কোন দিকে ঝুঁকবেন, ঠিক করে requirement।",
          alt: "একটা দাঁড়িপাল্লা; বাম পাল্লায় দ্রুততা ও availability, ডান পাল্লায় consistency ও সরলতা; নিচে তিনটা উদাহরণ: cache, replica আর queue, প্রতিটায় কী পাই আর কী দিই।",
        },
      ],
    },
    {
      title: "Interview-তে system design কিভাবে আসে",
      markdown: `Software engineer-এর interview-তে, বিশেষ করে মাঝারি আর senior পদে, প্রায়ই একটা system design round থাকে। প্রশ্নটা খোলা: "একটা URL shortener design করুন", "WhatsApp-এর মতো chat বানাতে হলে?"। সাধারণত ৪৫-৬০ মিনিট, আর কোনো একটা "সঠিক উত্তর" নেই।

Interviewer আসলে দেখেন আপনি কিভাবে ভাবেন:
1. **প্রশ্ন করে requirement পরিষ্কার করেন কিনা**: কত user? কোন feature সবচেয়ে জরুরি? Read বেশি নাকি write?
2. **মোটা দাগের হিসাব করতে পারেন কিনা**: কত request/সেকেন্ড, কত storage।
3. **একটা সহজ HLD আঁকতে পারেন কিনা**, তারপর bottleneck খুঁজে সেটার গভীরে যেতে পারেন কিনা।
4. **Trade-off নিজে থেকে বলেন কিনা**: "এখানে cache দিলে data একটু পুরনো হতে পারে, এই feature-এ সেটা চলবে কারণ..."।

সবচেয়ে বড় red flag: কোনো প্রশ্ন না করেই "Kafka, Cassandra, Kubernetes দিয়ে বানাব" বলে box আঁকা শুরু করা। Tool-এর নাম জানা আর design করা এক জিনিস না।

এই course-এর প্রতিটা দিন আপনাকে এই চার দক্ষতার কোনো না কোনোটা দেবে। শেষে [Day 116](${day(116)})-এ interview-এর ৭টা ধাপ (requirement → estimation → API → data model → HLD → deep dive → trade-off) আর [Day 117](${day(117)})-এ trade-off নিয়ে কথা বলার কৌশল একসাথে অনুশীলন করব।`,
    },
  ],

  tradeOffs: {
    markdown: `**কখন সরল design-এ থাকবেন:** user কম, team ছোট, product এখনো বদলাচ্ছে, কিছুক্ষণ বন্ধ থাকলে বড় ক্ষতি নেই। একটা server আর একটা database দিয়ে শুরু করে দ্রুত feature বানানোই তখন সবচেয়ে বড় কাজ।

**কখন জটিলতা যোগ করবেন:** মেপে দেখছেন কোথাও আটকাচ্ছে (CPU, database, bandwidth), downtime-এ সত্যিকারের টাকা বা আস্থা হারাচ্ছেন, অথবা হিসাব বলছে শিগগিরই বর্তমান design পারবে না। তখনও যেখানে আটকাচ্ছে শুধু সেখানেই যোগ করুন।

তিনটা স্তর পাশাপাশি (সংখ্যাগুলো মোটা দাগের, workload অনুযায়ী অনেক বদলায়):`,
    table: {
      headers: [
        "বিষয়",
        "এক server-এ সব",
        "Load balancer + কয়েকটা server + cache",
        "পুরো distributed (CDN, queue, replica, একাধিক region)",
      ],
      rows: [
        [
          "কত load সামলায়",
          "কম থেকে মাঝারি; machine-এর সীমা পর্যন্ত",
          "অনেক বেশি; server যোগ করে বাড়ানো যায়",
          "সবচেয়ে বেশি; প্রায় যেকোনো অংশ আলাদাভাবে বাড়ানো যায়",
        ],
        [
          "Availability",
          "Server মরলে সব বন্ধ (SPOF)",
          "একটা app server মরলেও চলে; database তখনো SPOF হতে পারে",
          "Zone বা region মরলেও চলতে পারে",
        ],
        [
          "খরচ",
          "সবচেয়ে কম",
          "মাঝারি",
          "সবচেয়ে বেশি: machine, bandwidth আর engineer-এর সময়",
        ],
        [
          "Feature বানানোর গতি",
          "সবচেয়ে দ্রুত",
          "একটু ধীর (stateless হতে হয়, cache সামলাতে হয়)",
          "সবচেয়ে ধীর; প্রতিটা বদলে অনেক অংশ ভাবতে হয়",
        ],
        [
          "Debug ও চালানো",
          "সহজ: এক জায়গায় log",
          "মাঝারি: কোন server-এ কী হলো খুঁজতে হয়",
          "কঠিন: tracing, monitoring, on-call লাগে",
        ],
        [
          "Data consistency",
          "সহজ: একটাই database",
          "Cache-এ পুরনো data-র ঝুঁকি",
          "Replica lag, region-এর মধ্যে sync, কঠিন সিদ্ধান্ত",
        ],
        [
          "কখন উপযুক্ত",
          "নতুন product, MVP, ছোট internal tool",
          "বাড়ন্ত product, যার downtime-এ ক্ষতি আছে",
          "লাখো user, বিশ্বজুড়ে user, কঠোর uptime চুক্তি",
        ],
      ],
    },
  },

  industry: {
    markdown: `কয়েকটা সুপরিচিত, publicly documented ঘটনা, যেগুলো দেখায় system design কেন জরুরি:

- **Netflix**: ২০০৮ সালে তাদের একটা বড় database corruption-এর কারণে তিন দিন DVD পাঠানো বন্ধ ছিল। সেখান থেকে তারা বুঝল একটা জায়গায় সব রাখা (vertical scaling, single point of failure) চলবে না, আর ধীরে ধীরে পুরো system AWS cloud-এ, অনেক ছোট ছোট service-এ সরিয়ে নিল। পরে তারা **Chaos Monkey** বানায়, যেটা ইচ্ছা করে production-এ server বন্ধ করে দেখে system টিকে থাকে কিনা।
- **Twitter**: প্রথম দিকে Ruby on Rails-এর একটা বড় app ছিল, আর বড় ঘটনার সময় প্রায়ই down হয়ে "Fail Whale" ছবি দেখাত। পরে তারা ধাপে ধাপে JVM-ভিত্তিক আলাদা service-এ সরে যায়, আর তাদের engineering blog-এ লিখেছে কিভাবে এর ফলে tweet-এর বড় spike সামলানো সম্ভব হয়েছে।
- **Instagram**: Facebook ২০১২ সালে কেনার সময় মাত্র এক ডজনের মতো কর্মী কয়েক কোটি user-এর app চালাচ্ছিল। তাদের engineering blog-এ ("What Powers Instagram") লেখা আছে, তারা পরিচিত, সাধারণ tool (Django, PostgreSQL, Redis, Memcached) দিয়ে কাজ চালিয়েছে, নতুন কিছু আবিষ্কার না করে। সরল design-এর শক্তির ভালো উদাহরণ।
- **Stack Overflow**: বিশাল traffic সত্ত্বেও তারা বহু বছর একটা monolith app আর হাতে গোনা কয়েকটা শক্তিশালী server-এ চলেছে (Nick Craver-এর "Stack Overflow: The Architecture" লেখা)। প্রমাণ যে "বড় হলে microservices লাগবেই" কথাটা সত্যি না; requirement অনুযায়ী design।
- **Google SRE**: Google-এর *Site Reliability Engineering* বই availability-কে "যত বেশি তত ভালো" না দেখে একটা লক্ষ্য (SLO) আর error budget হিসেবে দেখতে শেখায়, কারণ প্রতিটা বাড়তি "9"-এর খরচ আছে ([Day 90](${day(90)}))।

জনপ্রিয় tool, যেগুলো এই course-এ বারবার আসবে: **Nginx** ও **HAProxy** (load balancer), **Redis** ও **Memcached** (cache), **PostgreSQL** ও **MySQL** (database), **Kafka** ও **RabbitMQ** (queue), **Cloudflare** ও **Amazon CloudFront** (CDN)।

*উৎস: Netflix Technology Blog ("Completing the Netflix Cloud Migration", ২০১৬; Chaos Monkey ও Simian Army নিয়ে লেখা, ২০১০-২০১১); Twitter Engineering Blog ("New Tweets per second record, and how!", ২০১৩); Instagram Engineering ("What Powers Instagram: Hundreds of Instances, Dozens of Technologies", ২০১১); Nick Craver, "Stack Overflow: The Architecture – 2016 Edition"; Google, Site Reliability Engineering (O'Reilly, ২০১৬); Werner Vogels-এর উক্তি "Everything fails, all the time"।*`,
  },

  mistakes: [
    {
      mistake:
        'Requirement না জেনেই tool দিয়ে শুরু করা: "Kafka লাগবে, Kubernetes লাগবে।" কোন সমস্যার সমাধান হচ্ছে, কেউ জানে না।',
      fix: "আগে functional আর non-functional requirement লিখুন: কত user, কোন feature জরুরি, কতটা দ্রুত, কতটা uptime। তারপর প্রতিটা component-এর পাশে লিখুন সেটা কোন requirement-এর জন্য।",
    },
    {
      mistake:
        "যে scale এখনো আসেনি তার জন্য design করা (over-engineering)। ২০০ user-এর app-এ ১০টা microservice, ৩টা database।",
      fix: "সবচেয়ে সরল design দিয়ে শুরু করুন যেটা আজকের requirement পূরণ করে। মাপুন, আর যেখানে সত্যিই আটকাচ্ছে শুধু সেখানে জটিলতা যোগ করুন।",
    },
    {
      mistake:
        "শুধু feature নিয়ে ভাবা, non-functional দিক ভুলে যাওয়া। App চলে, কিন্তু ভিড়ে ভাঙে, বা data হারায়।",
      fix: "প্রতিটা feature-এর সাথে জিজ্ঞেস করুন: এটা কত দ্রুত হতে হবে? এটা down হলে কী ক্ষতি? এর data হারানো চলবে কি?",
    },
    {
      mistake: 'বড় company-র architecture হুবহু কপি করা, কারণ "Netflix করে"।',
      fix: "Netflix-এর design Netflix-এর সমস্যার উত্তর। তাদের থেকে কারণটা শিখুন (কোন সমস্যা, কোন trade-off), design-টা না।",
    },
    {
      mistake:
        "ধরে নেওয়া যে কিছু ভাঙবে না। একটা database, কোনো backup নেই, কোনো timeout নেই।",
      fix: 'প্রতিটা box দেখিয়ে জিজ্ঞেস করুন "এটা মরলে কী হবে?"। Single point of failure খুঁজুন, timeout দিন, backup নিন, আর backup থেকে ফেরত আনা পরীক্ষা করে দেখুন।',
    },
    {
      mistake:
        'সংখ্যা ছাড়া design করা: "অনেক traffic আসবে" বলে আন্দাজে server কেনা।',
      fix: "মোটা দাগের হিসাব করুন: DAU × প্রতি user-এর request ÷ ৮৬,৪০০ = গড় request/সেকেন্ড, তারপর peak-এর জন্য কয়েক গুণ।",
    },
  ],

  lab: [
    {
      title: "প্রস্তুতি: একটা ধীর server বানান",
      markdown: `এই lab-এ নিজের চোখে দেখবেন, একটা server-এর একটা সীমা আছে, ভিড় বাড়লে latency কিভাবে বাড়ে, আর server যোগ করলে কী হয়। শুধু Docker লাগবে।

একটা ফাঁকা folder-এ \`app.py\` নামে রাখুন। প্রতিটা request-এ এটা ১০০ms "কাজ" করে, আর একবারে একটাই request সামলায়:

\`\`\`python
import socket
import time
from http.server import BaseHTTPRequestHandler, HTTPServer


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        time.sleep(0.1)  # প্রতিটা request-এ ১০০ms-এর "কাজ"
        body = f"hello from {socket.gethostname()}\\n".encode()
        self.send_response(200)
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, *args):
        pass  # প্রতিটা request-এর log বন্ধ


class Server(HTTPServer):
    request_queue_size = 128  # অপেক্ষমাণ connection-এর লাইন


print("listening on :8000", flush=True)
Server(("0.0.0.0", 8000), Handler).serve_forever()
\`\`\`

একটা Docker network বানিয়ে server চালান:

\`\`\`bash
docker network create sd-lab
docker run -d --name app1 --hostname app1 --network sd-lab \\
  -v "$PWD/app.py:/app.py:ro" python:3.12-alpine python /app.py
\`\`\``,
    },
    {
      title: "পরীক্ষা ১: একজন user",
      markdown: `Load দেওয়ার জন্য ApacheBench (\`ab\`) ব্যবহার করব, যেটা official \`httpd\` image-এর ভেতরেই আছে। ২০টা request, একবারে একটা (\`-c 1\`):

\`\`\`bash
docker run --rm --network sd-lab httpd:2.4-alpine ab -n 20 -c 1 http://app1:8000/
\`\`\`

Output-এ দুটো লাইন খুঁজুন:
- **Requests per second**: প্রায় ৯-১০ (এটা throughput)
- **Time per request** (প্রথমটা, mean): প্রায় ১০০-১১০ms (এটা latency)

একজন user খুশি। প্রতিটা request ১০০ms-এর একটু বেশি।`,
    },
    {
      title: "পরীক্ষা ২: ২০ জন user একসাথে",
      markdown: `এবার একই server, কিন্তু একসাথে ২০টা request (\`-c 20\`):

\`\`\`bash
docker run --rm --network sd-lab httpd:2.4-alpine ab -n 200 -c 20 http://app1:8000/
\`\`\`

দেখবেন:
- **Requests per second**: এখনো প্রায় ৯-১০। Server-এর ক্ষমতা বাড়েনি।
- **Time per request** (mean): প্রায় **২,০০০ms**। কারণ প্রতিটা request-কে আগের ১৯টা শেষ হওয়ার জন্য লাইনে দাঁড়াতে হচ্ছে।

এটাই আমাদের ঈদ-website-এর গল্প ছোট আকারে। Code বদলায়নি, শুধু মানুষ বেড়েছে, আর প্রতিটা user ২০ গুণ বেশি অপেক্ষা করছে। একই সাথে দেখলেন **latency আর throughput আলাদা জিনিস** (Day 7-এ বিস্তারিত)।`,
    },
    {
      title: "পরীক্ষা ৩: দ্বিতীয় server আর একটা load balancer",
      markdown: `দ্বিতীয় একটা server চালান, আর সামনে Nginx-কে load balancer হিসেবে বসান। একই folder-এ \`nginx.conf\`:

\`\`\`nginx
events {}

http {
  upstream app {
    server app1:8000;
    server app2:8000;
  }

  server {
    listen 80;
    location / {
      proxy_pass http://app;
      proxy_connect_timeout 1s;
    }
  }
}
\`\`\`

\`\`\`bash
docker run -d --name app2 --hostname app2 --network sd-lab \\
  -v "$PWD/app.py:/app.py:ro" python:3.12-alpine python /app.py
docker run -d --name lb --network sd-lab \\
  -v "$PWD/nginx.conf:/etc/nginx/nginx.conf:ro" nginx:1.27-alpine
\`\`\`

কয়েকবার request পাঠিয়ে দেখুন কে উত্তর দিচ্ছে:

\`\`\`bash
docker run --rm --network sd-lab alpine:3.20 \\
  sh -c 'for i in 1 2 3 4; do wget -qO- http://lb/; done'
\`\`\`

\`app1\` আর \`app2\` পালা করে আসবে। এবার আবার ২০ জন user, কিন্তু load balancer-এর দিকে:

\`\`\`bash
docker run --rm --network sd-lab httpd:2.4-alpine ab -n 200 -c 20 http://lb/
\`\`\`

Throughput প্রায় **দ্বিগুণ** (~১৮-২০/সেকেন্ড), আর mean latency প্রায় **অর্ধেক** (~১,০০০ms)। Code একটুও না বদলে, শুধু design বদলে। (Load balancer-এর ভেতরের কৌশল Day 9-এ।)`,
    },
    {
      title: "পরীক্ষা ৪: একটা server মেরে দিন, আর একটু হিসাব",
      markdown: `\`\`\`bash
docker stop app1
docker run --rm --network sd-lab httpd:2.4-alpine ab -n 100 -c 10 http://lb/
\`\`\`

**Failed requests** দেখুন: সাধারণত ০ (প্রথম দু-একটা request একটু ধীর হতে পারে)। Nginx দেখল app1 সাড়া দিচ্ছে না, তাই request app2-তে পাঠিয়ে দিল। Throughput আবার ~১০-এ নেমেছে, কিন্তু site চালু আছে। এটাই **redundancy** আর **availability**: একটা অংশ মরলেও system বাঁচে।

এবার খাতা-কলমে: এই server একটা সেকেন্ডে ~১০টা request সামলায়। Peak-এ যদি ১,০০০ request/সেকেন্ড আসে, তাহলে লাগবে ~১০০টা এরকম server, অথবা প্রতিটা request-এর কাজ দ্রুত করতে হবে, অথবা একবারে অনেক request সামলায় এমন server লাগবে। কোনটা বাছবেন? সেটাই system design-এর প্রশ্ন।

শেষে পরিষ্কার করুন:

\`\`\`bash
docker rm -f app1 app2 lb
docker network rm sd-lab
\`\`\``,
    },
  ],

  connections: {
    markdown: `এটা course-এর প্রথম দিন, তাই আগের কোনো topic নেই। বরং আজকের lesson পুরো course-এর মানচিত্র। আজ যে শব্দগুলো শুধু নাম হিসেবে এলো, সামনে প্রতিটার নিজের দিন আছে।

**এই course কিভাবে সাজানো:** মোট ১১৭টা দিন, ১৫টা phase-এ। প্রতিটা phase আগেরটার উপর দাঁড়ায়:

1. **শুরু ও প্রথম ধারণা (Day 1-12)**: আজকের প্রতিটা building block আর quality-র পরিচিতি। যেমন [Day 2 · Client, Server ও Internet](${day(2)}), [Day 5 · Scalability](${day(5)}), [Day 6 · Availability](${day(6)}), [Day 9 · Load Balancers](${day(9)}), [Day 12 · Message Queues](${day(12)})।
2. **Scaling-এর মূল উপাদান (Day 13-19)**: Vertical vs horizontal, stateless, caching, rate limiting, আর [Day 19 · Capacity Estimation](${day(19)})।
3. **Database ও Storage গভীরে (Day 20-35)**: SQL vs NoSQL, index, replication, sharding।
4. **Computer ও Network-এর ভেতরে (Day 36-46)**, তারপর **Distributed Systems Theory (Day 47-55)**, **Messaging ও Reliability (Day 56-59)**।
5. এরপর architecture pattern, data engineering, security, deployment, observability, low-latency, ML system, blockchain (ঐচ্ছিক)।
6. শেষে **Interview Prep (Day 115-117)**: [LLD পরিচিতি](${day(115)}), [Interview-এর ৭ ধাপ](${day(116)}), [Trade-off নিয়ে কথা বলা](${day(117)})।

**প্রতিটা দিনের গঠন একই:** একটা সমস্যার গল্প → বাংলাদেশি জীবনের উদাহরণ → মূল ধারণা → গভীরে (চাইলে পড়বেন) → trade-off → industry → নিজে হাতে lab → quiz (২০টা প্রশ্ন, pass করতে ৯৫%) → "মনে আছে তো?" দিয়ে কয়েক দিন পরপর ঝালিয়ে নেওয়া।

কিছু জোড়া topic আছে, যেখানে প্রথমটা পরিচিতি আর পরেরটা গভীর আলোচনা। যেমন Scalability (Day 5) এখন এটুকু জানলেই চলবে, Day 13-এ গভীরে যাব; CAP Theorem (Day 8) থেকে Day 47-48-এ consistency-র গভীরে।`,
  },

  explainYourself: [
    {
      question:
        'আপনার এক বন্ধু বলছে, "আমার code-এ কোনো bug নেই, তাহলে system design শিখে কী লাভ?" তাকে কী বলবেন?',
      idealAnswer:
        "Bug-মুক্ত code মানে functional requirement ঠিক আছে, অর্থাৎ feature কাজ করে। কিন্তু অনেক user একসাথে এলে, কোনো machine নষ্ট হলে, বা data অনেক বড় হলে কী হবে, সেটা code-এর একটা function ঠিক করে না, ঠিক করে পুরো system-এর গঠন। একটা server-এ সব রাখলে ৫০ জনে নিখুঁত app ৫০,০০০ জনে ভেঙে পড়ে, কোনো bug ছাড়াই। System design এই non-functional দিকগুলো (scalability, availability, latency, reliability, cost) আগে থেকে ভেবে রাখার কাজ।",
    },
    {
      question:
        "Availability আর reliability-র পার্থক্য একটা উদাহরণ দিয়ে বোঝান।",
      idealAnswer:
        "Availability মানে user চাইলে system সাড়া দেয় কিনা, যেমন বছরে 99.9% সময় চালু। Reliability মানে সাড়া দিয়ে সঠিক কাজ করে কিনা, দীর্ঘ সময় ধরে, data না হারিয়ে। একটা bank app যদি সবসময় খোলে কিন্তু মাঝে মাঝে ভুল balance দেখায় বা transaction হারায়, সেটা available কিন্তু reliable না। আবার একটা system কখনো ভুল না করলেও প্রায়ই বন্ধ থাকলে reliable হতে পারে কিন্তু available না।",
    },
    {
      question:
        'একটা নতুন startup-এর CTO প্রথম দিন থেকেই microservices, Kafka আর তিনটা region চান, "যাতে পরে বড় হলে ঝামেলা না হয়"। আপনি কী বলবেন?',
      idealAnswer:
        "প্রতিটা component জটিলতা, খরচ আর ভাঙার নতুন জায়গা যোগ করে, আর ছোট team-এর feature বানানোর গতি কমিয়ে দেয়, অথচ সেই scale এখনো আসেনি, হয়তো কখনো আসবেও না। ভালো পথ হলো সরল design দিয়ে শুরু করা (একটা app, একটা database, backup), মোটা দাগের হিসাব করে দেখা কবে সীমায় পৌঁছাবে, আর metrics দেখে যেখানে সত্যিই আটকাচ্ছে শুধু সেখানে component যোগ করা। তবে যে সিদ্ধান্ত পরে বদলানো কঠিন (যেমন data model), সেগুলোতে শুরুতেই একটু বেশি ভাবা উচিত।",
    },
  ],

  interviewQuestions: [
    {
      question:
        "System design বলতে আপনি কী বোঝেন? এটা code লেখা থেকে কিভাবে আলাদা?",
      answerOutline: `- সংজ্ঞা: component, তাদের সংযোগ আর data flow ঠিক করা, যাতে requirement পূরণ হয় নির্দিষ্ট scale আর বাজেটে
- Code উত্তর দেয় "কাজটা কিভাবে"; design উত্তর দেয় "লাখো user, failure আর বাড়ন্ত data নিয়ে কিভাবে"
- Functional বনাম non-functional requirement-এর কথা বলুন, আর বলুন কঠিন সিদ্ধান্তগুলো non-functional থেকে আসে
- HLD বনাম LLD আলাদা করে দেখান`,
    },
    {
      question: "একটা নতুন system design করতে বললে আপনি কোথা থেকে শুরু করবেন?",
      answerOutline: `- আগে প্রশ্ন: কোন feature সবচেয়ে জরুরি, কত user, read বেশি নাকি write, latency আর availability-র লক্ষ্য কী
- মোটা দাগের হিসাব: request/সেকেন্ড (গড় ও peak), storage, bandwidth
- সরল HLD: client → load balancer → app server → database, তারপর দরকার অনুযায়ী cache, queue, CDN
- Bottleneck আর single point of failure খুঁজে deep dive
- প্রতিটা সিদ্ধান্তের trade-off নিজে থেকে বলা`,
    },
    {
      question:
        "একটা web app হঠাৎ ১০০ গুণ traffic পাচ্ছে। Design কিভাবে বদলাবেন?",
      answerOutline: `- আগে মাপুন কোথায় আটকাচ্ছে: CPU, database, bandwidth, নাকি কোনো ধীর বাইরের call
- App server: stateless করে load balancer-এর পেছনে একাধিক server (horizontal scaling)
- Database: বারবার পড়া data-র জন্য cache, read replica; write বেশি হলে পরে sharding
- Static ছবি/file CDN-এ; ধীর কাজ queue-তে
- প্রতিটা ধাপের trade-off: খরচ, consistency (cache/replica-তে পুরনো data), চালানোর জটিলতা`,
    },
    {
      question:
        "আপনার system-এর availability 99.9% থেকে 99.99%-এ নিতে চাইলে কী করতে হবে, আর সেটা কি সবসময় করা উচিত?",
      answerOutline: `- হিসাব: 99.9% ≈ বছরে ~৮.৮ ঘণ্টা downtime; 99.99% ≈ ~৫২.৬ মিনিট
- Single point of failure সরানো: প্রতিটা স্তরে redundancy, আলাদা zone-এ কপি, automatic failover
- Series-এ availability গুণ হয়, তাই প্রতিটা dependency-রও availability বাড়াতে হয়
- Deploy নিরাপদ করা (canary, দ্রুত rollback), কারণ অনেক outage আসে নিজেদের বদল থেকে
- সবসময় না: খরচ অনেক বাড়ে; একটা internal tool-এর জন্য হয়তো দরকার নেই। Business-এর ক্ষতির সাথে তুলনা করে SLO ঠিক করুন`,
    },
  ],

  summary: {
    points: [
      "System design মানে কোন অংশ লাগবে, কিভাবে যুক্ত থাকবে আর data কোথায় যাবে, তা ঠিক করা, যাতে অনেক user আর failure-এর মধ্যেও system চলে।",
      "Functional requirement বলে system কী করবে; non-functional বলে কতটা ভালোভাবে। কঠিন সিদ্ধান্তগুলো আসে non-functional থেকে।",
      "সাতটা মূল quality: scalability, availability, latency ও throughput, consistency, reliability, maintainability, cost।",
      "মূল building block: client, server, database, cache, load balancer, queue, CDN; প্রতিটা একটা সমস্যার উত্তর, আর প্রতিটা নতুন জটিলতা আনে।",
      "নিখুঁত design নেই; আছে requirement অনুযায়ী ঠিক design আর পরিষ্কারভাবে বলা trade-off।",
      "সরল design দিয়ে শুরু করুন; মেপে bottleneck খুঁজে ধাপে ধাপে বাড়ান, আর মোটা দাগের হিসাব দিয়ে সিদ্ধান্ত নিন।",
      "বড় scale-এ failure স্বাভাবিক; single point of failure সরান, redundancy রাখুন, আর ভাঙলেও যতটা পারা যায় চালু রাখুন।",
    ],
    diagram: {
      id: "day-001-summary",
      caption: "এক নজরে System Design",
      alt: "Requirement থেকে design: client, load balancer, server, cache, database আর queue-এর ছোট মানচিত্র।",
    },
  },
};
