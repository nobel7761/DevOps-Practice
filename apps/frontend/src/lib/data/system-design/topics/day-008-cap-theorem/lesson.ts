// Day 8 · CAP Theorem — introductory lesson. Replication (Day 28), Strong vs
// Eventual Consistency (Day 47), Consistency Models (Day 48) and Quorum (Day 49)
// go deeper; this lesson teaches what a beginner needs and links forward.

import { topicHrefForDay } from "@/lib/data/courses/system-design-a-z";
import type { SdLesson } from "@/lib/system-design/lesson.types";

export const day008Lesson: SdLesson = {
  topicId: "sd-day-008",
  day: 8,
  title: "CAP Theorem",
  definition:
    "CAP Theorem বলে: data একাধিক node-এ কপি থাকলে আর তাদের মাঝের network ভাগ (partition) হলে, প্রতিটা request-এ হয় সর্বশেষ data দেবেন (Consistency), নয়তো সবসময় উত্তর দেবেন (Availability), দুটো একসাথে না।",

  objectives: [
    "CAP-এর C, A আর P ঠিক কী বোঝায় তা theorem-এর সংজ্ঞা অনুযায়ী বলতে পারবেন, আর কেন CAP-এর C মানে ACID-এর C না, আর CAP-এর A মানে 99.9% uptime না, সেটা ব্যাখ্যা করতে পারবেন।",
    "Network partition-এর সময় একটা operation CP আচরণ করবে (error/অপেক্ষা) নাকি AP আচরণ করবে (পুরনো হতে পারে এমন উত্তর), business-এর ক্ষতি দেখে যুক্তি দিয়ে বেছে নিতে পারবেন।",
    "কেন distributed system-এ 'CA' আসল কোনো বিকল্প না, আর কেন CAP পুরো product-এর label না বরং প্রতিটা operation-এর সিদ্ধান্ত, বোঝাতে পারবেন।",
    "PACELC দিয়ে partition না থাকা সময়ের latency বনাম consistency trade-off বুঝতে পারবেন, আর N, R, W দেখে R + W > N হিসাব করতে পারবেন।",
    "Docker-এ ৩-node etcd cluster ভাগ করে নিজের চোখে দেখতে পারবেন: minority node linearizable read/write দিতে পারে না, কিন্তু majority চলতে থাকে।",
  ],

  prerequisites: [
    { day: 2, title: "Client, Server ও Internet", href: topicHrefForDay(2) },
    { day: 5, title: "Scalability", href: topicHrefForDay(5) },
    { day: 6, title: "Availability", href: topicHrefForDay(6) },
  ],

  problem: {
    markdown: `ধরুন আপনি "যাত্রী" নামে একটা online bus ticket app চালান। ঈদের আগে ভিড় সামলাতে আর একটা data center পুড়ে গেলেও যেন চলে ([Day 6](${topicHrefForDay(6)})-এর redundancy মনে আছে?), আপনি database-এর দুটো কপি রেখেছেন: একটা ঢাকায়, একটা চট্টগ্রামে। ঢাকার user-রা ঢাকার node-এ যায়, চট্টগ্রামের user-রা চট্টগ্রামেরটায়। কোনো node-এ seat বিক্রি হলে সে অন্য node-কে network দিয়ে জানিয়ে দেয়, যাতে দুটো কপি একই থাকে। Data-র এভাবে একাধিক কপি রাখাকে বলে **replication**।

চাঁদরাতের আগের রাত। হঠাৎ দুই শহরের মাঝের fiber কেটে গেল। দুটো node-ই চালু, দুটোই user-এর request নিচ্ছে, শুধু **একে অপরের সাথে কথা বলতে পারছে না**।

রাত ১০:০১-এ ঢাকার রহিম "সৌদিয়া, seat A1" কিনলেন। ঢাকার node লিখে রাখল "A1: বিক্রি", চট্টগ্রামকে জানাতে চাইল, পারল না।

রাত ১০:০২-এ চট্টগ্রামের করিম একই bus-এর seat A1 খুঁজলেন। চট্টগ্রামের node-এর কাছে খবর নেই, তাই সে দেখাল "A1: খালি"। এখন চট্টগ্রামের node-এর সামনে দুটো পথ:

1. **"বিক্রি করে দিই"**: করিম খুশি, app চালু আছে। কিন্তু fiber জোড়া লাগলে দেখা যাবে একই seat দুজনকে বিক্রি হয়েছে। ঈদের রাতে bus counter-এ মারামারি।
2. **"এখন বলতে পারছি না, একটু পরে চেষ্টা করুন"**: ভুল বিক্রি হলো না। কিন্তু করিম error দেখলেন, চট্টগ্রামের সব user-এর কাছে app কার্যত বন্ধ।

তৃতীয় কোনো পথ নেই। চট্টগ্রামের node জানেই না ঢাকায় কী হয়েছে, আর জানার উপায়ও বন্ধ। এই অস্বস্তিকর বাছাইটাই **CAP Theorem**-এর মূল কথা। আর মজার ব্যাপার, একই app-এর "এই bus-এ কতজন like দিয়েছে" counter-এর জন্য উত্তরটা উল্টো হতে পারে।`,
    diagrams: [
      {
        id: "day-008-before",
        caption:
          "আগে: দুই শহরের মাঝের link কাটা; ঢাকা জানে A1 বিক্রি, চট্টগ্রাম এখনো ভাবছে A1 খালি।",
        alt: "রহিম ঢাকার node-এ seat A1 কেনে, ঢাকার node চট্টগ্রামের node-কে replicate করতে চায় কিন্তু লাল ✕ চিহ্নিত link কাটা; করিম চট্টগ্রামের node-এ A1 খুঁজে 'খালি' দেখে।",
      },
    ],
  },

  analogy: {
    markdown: `একটা ব্যাংকের দুটো শাখা ভাবুন: ঢাকার মতিঝিল আর চট্টগ্রামের আগ্রাবাদ। রহিম আর তার ভাই করিমের একটা **joint account**, balance ৳৫,০০০। দুই শাখার কাছেই account-এর হিসাবের খাতা আছে, আর প্রতিটা লেনদেনের পর ফোন করে অন্য শাখাকে জানিয়ে দেয়।

একদিন ঝড়ে দুই শাখার মাঝের ফোন আর internet লাইন বন্ধ। ঠিক তখন মতিঝিলে রহিম তুললেন ৳৪,০০০। আর আগ্রাবাদে করিম এসে বললেন, "৳৪,০০০ তুলব।"

আগ্রাবাদের ম্যানেজারের খাতায় এখনো ৳৫,০০০। তিনি কী করবেন?

- **"লাইন ঠিক হলে আসুন"** (এটা **CP**): হিসাব ভুল হবে না, কিন্তু করিম খালি হাতে ফিরলেন। শাখা খোলা, তবু এই কাজটা হলো না।
- **"দিয়ে দিই, পরে মিলিয়ে নেব"** (এটা **AP**): করিম টাকা পেলেন, কিন্তু লাইন ফিরলে দেখা গেল account-এ এখন −৳৩,০০০। ব্যাংককে এখন পরে ঝামেলা মেটাতে হবে (overdraft চার্জ, ফোন, চিঠি)।

খেয়াল করুন:
- **দুই শাখা = দুই node (replica)**, **খাতা = data-র কপি**
- **ফোন লাইন কাটা = network partition**: দুই শাখাই খোলা, শুধু একে অপরের খবর পাচ্ছে না
- ম্যানেজার যেটাই বাছুন, একটা দাম দিতেই হবে। **লাইন কাটা থাকলে "সঠিক হিসাব" আর "সবাইকে সাথে সাথে সেবা", দুটো একসাথে দেওয়া যায় না।**

আর লাইন যখন ঠিক থাকে? তখন ম্যানেজার ফোন করে নিশ্চিত হয়ে টাকা দেন: সঠিক হিসাব আর সেবা দুটোই মেলে, শুধু একটু বেশি সময় লাগে। এই "একটু বেশি সময়"-এর কথায় আমরা deep dive-এ PACELC-এ ফিরব।`,
    diagrams: [
      {
        id: "day-008-analogy",
        caption:
          "দুই শাখা, একটা joint account, মাঝের লাইন কাটা: আগ্রাবাদ হয় 'পরে আসুন' বলবে (CP), নয়তো পুরনো খাতা দেখে টাকা দেবে (AP)।",
        alt: "বামে মতিঝিল শাখা, খাতায় ৳১,০০০ (রহিম ৳৪,০০০ তুলেছেন); ডানে আগ্রাবাদ শাখা, খাতায় এখনো ৳৫,০০০; মাঝে লাল ✕ চিহ্নিত কাটা ফোন লাইন; আগ্রাবাদের নিচে দুটো বিকল্প: 'পরে আসুন' আর 'দিয়ে দিই'।",
      },
    ],
  },

  coreConcept: {
    markdown: `### প্রশ্নটা আসে কোথা থেকে?

একটা মাত্র database server থাকলে CAP নিয়ে ভাবার কিছু নেই: সব read আর write একই জায়গায়, তাই সবাই সর্বশেষ data দেখে। কিন্তু [Day 5](${topicHrefForDay(5)})-এ দেখেছি ভার বাড়লে machine বাড়াতে হয়, আর [Day 6](${topicHrefForDay(6)})-এ দেখেছি একটা machine মানেই single point of failure। তাই আমরা data-র **একাধিক কপি (replica)** একাধিক node-এ রাখি। কপিগুলোকে একই রাখতে node-গুলো network দিয়ে একে অপরকে update পাঠায়। আর [Day 2](${topicHrefForDay(2)})-এ দেখেছি, network-এ message হারায়, দেরি করে, link কাটে।

Replication কিভাবে কাজ করে (leader-follower, sync বনাম async), সেটা [Day 28](${topicHrefForDay(28)})-এ বিস্তারিত। আজ শুধু এটুকু ধরে নিন: **data কয়েকটা node-এ কপি আছে, আর তাদের মাঝে network আছে।**

### তিনটা অক্ষর, সঠিক অর্থে

CAP-এর তিনটা শব্দ দৈনন্দিন ভাষায় অনেক ঢিলেঢালা অর্থে ব্যবহার হয়। Theorem-এ এদের অর্থ খুব নির্দিষ্ট:

- **C = Consistency (এখানে মানে linearizability)**: প্রতিটা read সর্বশেষ সফল write-এর মান দেখবে, যেন পুরো system-এ data-র একটাই কপি আছে। রহিম A1 কেনার পর যে-ই যেখান থেকে A1 দেখুক, "বিক্রি" দেখবে। **এটা ACID-এর C না।** ACID-এর C মানে database-এর নিয়ম (যেমন balance ঋণাত্মক হবে না) সবসময় ঠিক থাকা, যেটা একটা machine-এও প্রযোজ্য ([Day 25](${topicHrefForDay(25)})-এ আসবে)।
- **A = Availability**: **সচল (non-failing) প্রতিটা node**, তার কাছে আসা প্রতিটা request-এ শেষমেশ একটা **non-error উত্তর** দেবে। "দুঃখিত, পরে চেষ্টা করুন" বা চিরকাল ঝুলে থাকা, দুটোই A ভাঙে। **এটা Day 6-এর "99.9% uptime" না।** সেটা একটা মাপ (কত ভাগ সময় বা request সফল), আর CAP-এর A একটা হ্যাঁ/না শর্ত: partition চলাকালীনও প্রতিটা সচল node উত্তর দেয় কি না।
- **P = Partition tolerance**: Node-দের মাঝের network message হারালে বা দেরি করালেও (network partition) system কাজ চালিয়ে যায়, ভেঙে পড়ে না।

### Network partition আসলে কী?

**Network partition** মানে node-গুলো দুই বা বেশি দলে ভাগ হয়ে গেছে: দলের ভেতরে কথা চলছে, দলের বাইরে না। কারণ হতে পারে কাটা fiber, ভুল firewall rule, নষ্ট switch, ভুল route, এমনকি এত বেশি দেরি যে timeout হয়ে যায়। মজার ব্যাপার, ভেতর থেকে "ওপাশের node মারা গেছে" আর "ওপাশের node বেঁচে আছে কিন্তু রাস্তা বন্ধ", এই দুটোর পার্থক্য করা যায় না ([Day 6](${topicHrefForDay(6)})-এর heartbeat আর split-brain-এর কথা মনে করুন)। দুই ক্ষেত্রেই আপনি শুধু জানেন: **উত্তর আসছে না।**

### Theorem আসলে কী বলে

> Network partition হলে, partition-এর যে পাশে সর্বশেষ data নেই সেখানে আসা request-এর জন্য আপনাকে বাছতে হবে: **C** (সর্বশেষ data নিশ্চিত না হলে উত্তর দেব না) অথবা **A** (যা আছে তা দিয়েই উত্তর দেব)।

দুটো জিনিস খেয়াল করুন:
1. **বাছাইটা শুধু partition চলাকালীন।** Network ঠিক থাকলে C আর A দুটোই পাওয়া যায়।
2. **P আসলে বাছাইয়ের জিনিস না।** Network-এর উপর দিয়ে চলা যেকোনো system-এ partition একদিন হবেই, আপনি চান বা না চান। তাই প্রশ্নটা "C, A, P থেকে যেকোনো দুটো" না, প্রশ্নটা **"partition হলে C না A?"**

### তাহলে "CA" কী?

"CA system" মানে যেটা partition-এর সময় C আর A দুটোই রাখে। কিন্তু উপরের চট্টগ্রামের node-এর অবস্থা দেখুন: সে ঢাকার খবর পাচ্ছে না। উত্তর দিলে সর্বশেষ data-র নিশ্চয়তা নেই (C গেল), উত্তর না দিলে A গেল। তৃতীয় পথ নেই। তাই network দিয়ে যুক্ত distributed system-এর জন্য "CA" আসলে বলে "আমরা ধরে নিচ্ছি partition হবে না", আর partition হলে কী হবে সেটা আর design-এ থাকে না। CA সত্যি অর্থে খাটে শুধু একটা machine-এর database-এ, যেটা distributed-ই না।

### CP আচরণ বনাম AP আচরণ

একটা ছোট উদাহরণ ধরি: একটা mobile wallet (bKash-এর মতো), balance-এর ৩টা কপি তিনটা node-এ। Network ভেঙে একটা node একা পড়ে গেল।

**CP আচরণ (consistency আগে):** একা পড়া node বলে "সর্বশেষ balance নিশ্চিত করতে পারছি না", তাই error দেয় বা অপেক্ষা করায়। Majority-র দিকটা (যেখানে ৩টার ২টা node) কাজ চালিয়ে যায়।
- **কোথায় মানায়:** টাকা পাঠানো, balance, শেষ seat বা শেষ stock বিক্রি, username নেওয়া, lock নেওয়া। যেখানে পুরনো data দিয়ে ভুল সিদ্ধান্ত নিলে পরে আর সহজে ফেরানো যায় না।
- **দাম:** Partition চলাকালীন কিছু user error বা লম্বা অপেক্ষা দেখবে।

**AP আচরণ (availability আগে):** একা পড়া node নিজের কাছে যা আছে তা দিয়েই উত্তর দেয়, write-ও নিয়ে রাখে। Network ফিরলে কপিগুলো মিলিয়ে নেয় (reconcile)।
- **কোথায় মানায়:** like/view counter, shopping cart-এ item রাখা, "last seen" status, product review, news feed। কিছুক্ষণ পুরনো দেখালে বা পরে মেলালে ক্ষতি সামান্য।
- **দাম:** User কিছুক্ষণ পুরনো data দেখতে পারে, আর একই data-য় দুই পাশে আলাদা write হলে পরে conflict মেটাতে হয়।

### একটা product-এর label না, প্রতিটা operation-এর সিদ্ধান্ত

"আমাদের system CP" বা "এই database AP", এভাবে বলা খুব প্রচলিত, কিন্তু প্রায়ই বিভ্রান্তিকর। একই app-এ:
- Ticket বিক্রি → CP (দুজনকে একই seat না)
- Seat-এর পাশে "৫২ জন দেখছে" → AP (একটু ভুল সংখ্যায় কারও ক্ষতি নেই)

আর অনেক database-এ এই বাছাই আপনি **প্রতিটা query-তে** করতে পারেন (deep dive-এ Cassandra-র consistency level আর etcd-র read option দেখব)। তাই সঠিক প্রশ্ন: **"এই operation-এর জন্য partition-এর সময় ভুল উত্তর বেশি ক্ষতিকর, নাকি কোনো উত্তর না দেওয়া?"**

এখন এটুকু জানলেই চলবে। Strong আর eventual consistency-র পার্থক্য [Day 47](${topicHrefForDay(47)})-এ, আর linearizability ছাড়াও আরও যত consistency model আছে সেগুলো [Day 48](${topicHrefForDay(48)})-এ গভীরে যাব।`,
    diagrams: [
      {
        id: "day-008-main",
        caption:
          "মূল ছবি: partition-এ node ৩ একা পড়েছে; client B তার কাছে balance চাইলে CP উত্তর দেয় না, AP পুরনো মান দেয়। Majority (node ১, ২) কাজ চালিয়ে যায়।",
        alt: "বামে Client A node ১-এ balance = 300 লেখে, node ১ থেকে node ২-এ replicate সফল; মাঝে লাল dashed রেখা 'network partition'; ডানে node ৩-এ replicate ব্যর্থ; client B node ৩-এর কাছে balance চায়; node ৩-এর নিচে দুটো বাক্স: CP 'error বা অপেক্ষা' আর AP '500 (পুরনো হতে পারে)'।",
        downloadable: true,
      },
      {
        id: "day-008-before-after",
        caption:
          "একই partition, একই টাকা পাঠানোর request: AP আচরণে টাকা দুবার খরচ হয়, CP আচরণে minority node error দেয় আর হিসাব ঠিক থাকে। (Like counter-এর জন্য উল্টোটা ঠিক।)",
        alt: "উপরে AP আচরণ: দুই পাশের node-ই ৳৪,০০০ পাঠানোর request গ্রহণ করে, ফলে balance ঋণাত্মক; নিচে CP আচরণ: majority পাশে request সফল, minority node error দেয়।",
      },
    ],
  },

  deepDive: [
    {
      title: "ধাপে ধাপে: write → partition → read → CP বা AP → heal",
      markdown: `পুরো ঘটনাটা সময়ের ক্রমে দেখা যাক। Node ১ আর Node ২ একই data-র কপি রাখে।

1. **Write:** Client A, Node ১-এ balance = 300 লেখে। Node ১ সেটা Node ২-কে পাঠায়, Node ২ নিশ্চিত করে। দুই কপিই এখন 300।
2. **Partition:** Network ভাঙল। Client A আবার লিখল balance = 100। Node ১ পাঠাতে চাইল, পৌঁছাল না। Node ১-এ 100, Node ২-এ 300।
3. **অন্য পাশে read:** Client B, Node ২-এর কাছে balance চায়। Node ২ জানে না যে তার কপি পুরনো, শুধু জানে Node ১-এর সাথে যোগাযোগ নেই।
4. **CP পথ:** Node ২ বলে "এখন নিশ্চিত না", error দেয় (বা timeout পর্যন্ত অপেক্ষা করায়)। ভুল তথ্য গেল না, কিন্তু Client B কাজ শেষ করতে পারল না।
5. **AP পথ:** Node ২ নিজের কপি থেকে 300 ফেরত দেয়। Client B উত্তর পেল, কিন্তু সেটা পুরনো। AP-তে Node ২ নতুন write-ও নিতে পারে, তখন দুই পাশে দুই রকম ইতিহাস তৈরি হয়।
6. **Heal:** Network ফিরল। Node ১ জমে থাকা update পাঠায়, Node ২ ধরে ফেলে। AP পথে দুই পাশে আলাদা write হয়ে থাকলে এখন **reconcile** করতে হয়: কোনটা টিকবে, নাকি দুটো মেলানো হবে?

খেয়াল করুন, ধাপ ১ আর ৬-এর পরে, মানে partition না থাকা সময়ে, consistent আর available দুটোই একসাথে আছে। CAP-এর বাছাই শুধু ধাপ ২-৫-এর জানালায়।`,
      diagrams: [
        {
          id: "day-008-steps",
          caption:
            "ধাপে ধাপে: স্বাভাবিক replication, তারপর partition, অন্য পাশে read, CP আর AP-এর দুই রকম উত্তর, আর শেষে network জোড়া লাগলে মিলিয়ে নেওয়া।",
          alt: "Client A, Node 1, Node 2 আর Client B-এর মধ্যে sequence diagram: write ও replicate, partition-এ replicate ব্যর্থ, Client B-এর read, CP হলে error, AP হলে পুরনো 300, heal-এর পরে sync আর নতুন মান 100।",
        },
      ],
    },
    {
      title:
        "Majority, quorum আর R + W > N: বাস্তবে C আর A-র মাঝে কোথায় দাঁড়াবেন",
      markdown: `বাস্তবের বেশিরভাগ system "পুরো CP" বা "পুরো AP" না। তারা একটা মাঝামাঝি নিয়ম মানে: **majority (quorum)**।

**Consensus-ভিত্তিক system (etcd, ZooKeeper):** ৩ বা ৫টা node, যারা Raft (etcd) বা ZAB (ZooKeeper) নামের **consensus protocol** দিয়ে একমত হয়। একটা write তখনই commit হয়, যখন **majority** node সেটা লিখেছে। ৩টা node-এ majority ২, ৫টায় ৩। তাই:
- Partition-এ যে পাশে majority আছে, সেটা কাজ চালায় (দরকারে নতুন leader বেছে নেয়)।
- Minority পাশ linearizable write বা read সম্পূর্ণ করতে পারে না: error বা timeout। এটাই CP আচরণ।
- দুই পাশে কখনো একসাথে majority থাকতে পারে না, তাই split-brain হয় না।
- ৩ node মানে ১টা, ৫ node মানে ২টা node হারালেও চলে। জোড় সংখ্যায় (৪টা) লাভ কম: majority লাগে ৩, তাই ৩-এর মতোই মাত্র ১টা হারানো সয়।

ZooKeeper-এ একটা সূক্ষ্ম বিষয়: write majority দিয়ে হয়, কিন্তু read সাধারণত client যে server-এর সাথে যুক্ত সেটাই নিজের কপি থেকে দেয়, তাই একটু পুরনো হতে পারে। একদম সর্বশেষ চাইলে read-এর আগে \`sync\` দিতে হয়। আর quorum থেকে বিচ্ছিন্ন server default-ভাবে client-দের সেবা দেওয়া বন্ধ করে।

**Dynamo-ধাঁচের system (Cassandra, Amazon-এর Dynamo):** এখানে leader নেই, যেকোনো replica read/write নিতে পারে। তিনটা সংখ্যা দিয়ে নিয়ন্ত্রণ:
- **N** = প্রতিটা data-র কয়টা কপি (replication factor)
- **W** = কয়টা replica "লিখেছি" বললে write সফল
- **R** = কয়টা replica থেকে উত্তর এলে read সফল

**R + W > N** হলে read-এর দল আর write-এর দল অন্তত একটা replica-তে মিলবেই, তাই read অন্তত একটা সর্বশেষ কপি দেখে। উদাহরণ N = 3:
- W = 2, R = 2 → 4 > 3 ✓। একটা node পড়লেও read আর write দুটোই চলে।
- W = 1, R = 1 → 2 > 3 না ✗। খুব দ্রুত, খুব available, কিন্তু পুরনো data পড়তে পারেন।
- W = 3, R = 1 → 4 > 3 ✓। Read দ্রুত, কিন্তু একটা node পড়লেই write বন্ধ।

Partition-এ যে পাশে W বা R সংখ্যক replica নেই, সেখানে ওই consistency level-এর request fail করে। মানে **R আর W বাড়ানো = CP-র দিকে সরা, কমানো = AP-র দিকে সরা**, আর এটা আপনি প্রতিটা query-তে ঠিক করতে পারেন। Cassandra-তে একে বলে **consistency level** (ONE, QUORUM, ALL, LOCAL_QUORUM ইত্যাদি); QUORUM মানে replication factor-এর অর্ধেকের বেশি (RF = 3 হলে 2)।

সতর্কতা: R + W > N মানেই পুরোপুরি linearizable না। একই key-তে একসাথে দুটো write, বা অর্ধেক সফল হওয়া write থাকলে নানা কোণার ঘটনা ঘটে। এখন এটুকু জানলেই চলবে; Quorum [Day 49](${topicHrefForDay(49)})-এ, আর consensus (Raft) [Day 51](${topicHrefForDay(51)})-এ গভীরে যাব।`,
      diagrams: [
        {
          id: "day-008-quorum",
          caption:
            "N = 3, W = 2, R = 2: write-এর দল (Replica ১, ২) আর read-এর দল (Replica ২, ৩) Replica ২-তে মেলে, তাই read সর্বশেষ v2 দেখে।",
          alt: "Writer client Replica 1 আর Replica 2-তে v2 লেখে; Reader client Replica 2 আর Replica 3 থেকে পড়ে; Replica 3-এ এখনো v1, কিন্তু Replica 2-তে v2 থাকায় reader সর্বশেষ মান পায়।",
        },
      ],
    },
    {
      title: "PACELC: partition না থাকলেও একটা trade-off থাকে",
      markdown: `CAP শুধু partition-এর সময়ের কথা বলে। কিন্তু partition কদাচিৎ হয়, আর বাকি ৯৯.৯৯% সময়? Daniel Abadi ২০১২ সালে IEEE Computer-এ একটা প্রবন্ধে বললেন, ওই "স্বাভাবিক" সময়েও একটা trade-off আছে, আর বাস্তবে সেটাই design-কে বেশি প্রভাবিত করে। তিনি এর নাম দিলেন **PACELC**:

> **if P**artition → **A** or **C**; **E**lse → **L**atency or **C**onsistency

মানে partition হলে availability আর consistency-র মধ্যে বাছুন (CAP-এর অংশ)। **আর না হলে (Else)**, latency আর consistency-র মধ্যে বাছুন।

Else অংশটা কেন? কারণ সর্বশেষ data নিশ্চিত করতে হলে অন্য replica-দের সাথে কথা বলতে হয়: write-এ majority-র নিশ্চয়তা, read-এ leader বা quorum-কে জিজ্ঞেস করা। প্রতিটা অতিরিক্ত network round trip মানে বেশি latency, বিশেষ করে replica-গুলো যদি দূরের data center-এ থাকে ([Day 7](${topicHrefForDay(7)})-এর latency মনে আছে?)। আর কাছের একটা replica থেকে সাথে সাথে উত্তর দিলে দ্রুত, কিন্তু পুরনো হতে পারে।

একই system-এর ভেতরেই এই knob দেখা যায়:
- **etcd**: default read linearizable (leader-এর সাথে নিশ্চিত করে, তাই একটু ধীর); \`--consistency=s\` (serializable) দিলে যে node-এ আছেন সেটা নিজের কপি থেকেই দেয়, দ্রুত কিন্তু পুরনো হতে পারে। Lab-এ নিজে দেখবেন।
- **Cassandra**: consistency level ONE (একটা replica-র উত্তরই যথেষ্ট, দ্রুত) বনাম QUORUM (বেশি replica-র অপেক্ষা, ধীর কিন্তু সর্বশেষ দেখার নিশ্চয়তা বেশি)।
- **Amazon DynamoDB**: default read eventually consistent; request-এ strongly consistent read চাইতে পারেন, যেটার latency আর খরচ বেশি।

Abadi নিজে Dynamo, Cassandra আর Riak-এর মতো system-কে default setting-এ **PA/EL** বলেছেন (partition-এ available, স্বাভাবিক সময়ে দ্রুত), আর পুরোপুরি ACID replicated system-গুলোকে **PC/EC** (সবসময় consistency আগে)। তবে মনে রাখবেন, অনেক system-এ setting বদলালে এই অবস্থানও বদলায়।

শিক্ষাটা: "partition তো কালেভদ্রে হয়" বলে consistency-র দাম এড়ানো যায় না। দাম প্রতিদিন latency হিসেবে দিতে হয়।`,
      diagrams: [
        {
          id: "day-008-pacelc",
          caption:
            "PACELC decision tree: partition থাকলে A না C, না থাকলে (Else) latency না consistency।",
          alt: "উপরে প্রশ্ন 'network partition আছে?'; হ্যাঁ হলে 'A না C?' থেকে PA আর PC; না হলে 'Latency না C?' থেকে EL আর EC; প্রতিটা পাতায় এক লাইনের আচরণ।",
        },
      ],
    },
    {
      title: "Partition-এর সময় client কী দেখে: timeout, retry আর conflict",
      markdown: `Server-এর দিক থেকে CP/AP বলা সহজ। কিন্তু client-এর দিক থেকে partition দেখতে অনেক বেশি বিভ্রান্তিকর।

**১. Timeout মানে "জানি না", "হয়নি" না।** CP system-এর minority node-এ write পাঠালে প্রায়ই সাথে সাথে error আসে না, আসে **timeout** (lab-এ etcd ৫ সেকেন্ড পরে \`context deadline exceeded\` দেয়)। আর timeout-এর পর client জানে না write হয়েছে কিনা: হয়তো request পৌঁছায়ইনি, হয়তো commit হয়ে গেছে কিন্তু উত্তরটা হারিয়েছে। টাকা পাঠানোর ক্ষেত্রে এটা ভয়ংকর প্রশ্ন।

**২. Retry বিপজ্জনক হতে পারে।** "Timeout হলো, আবার পাঠাই" করলে একই transfer দুবার হতে পারে। তাই retry-যোগ্য operation হতে হবে **idempotent**, সাধারণত একটা **idempotency key** দিয়ে ([Day 4](${topicHrefForDay(4)})-এ পরিচয় হয়েছে; [Day 57](${topicHrefForDay(57)})-এ গভীরে)। আর retry-তে exponential backoff দিন, নইলে partition-এর পরে হাজার client একসাথে retry করে সেরে ওঠা node-কে আবার ফেলে দেয়।

**৩. AP-তে conflicting write।** দুই পাশেই write নেওয়া হলে network ফেরার পর একই key-র দুটো আলাদা মান। কে জিতবে?
- **Last-write-wins (LWW):** যার timestamp বড়, সেটা থাকে। সহজ, কিন্তু অন্যটা **নীরবে হারিয়ে যায়**। আর আলাদা machine-এর ঘড়ি কখনো পুরোপুরি মেলে না, তাই "পরে" লেখাটা হারতেও পারে। Cassandra সাধারণ write-এ এভাবেই প্রতিটা column-এর timestamp দেখে মেলায়।
- **Version vector:** প্রতিটা replica-র জন্য আলাদা counter রাখা, যাতে বোঝা যায় দুটো write একটা আরেকটার পরে, নাকি একে অপরকে না জেনে একসাথে (concurrent)। Concurrent হলে দুটোই রাখা হয় (sibling), আর application মিলিয়ে নেয়। Amazon-এর Dynamo paper এই পথে গিয়েছিল, shopping cart-এ দুই version-এর item মিলিয়ে।
- **নিজে মিলে যায় এমন data type (CRDT):** যেমন counter, যেখানে প্রতিটা replica নিজের অংশ গোনে আর শেষে যোগ হয়।

এগুলোর ভেতরে ঢুকব পরে: ঘড়ি আর version vector [Day 50](${topicHrefForDay(50)})-এ, CRDT [Day 55](${topicHrefForDay(55)})-এ।

**৪. নিজের লেখা নিজে না দেখা।** AP system-এ user profile বদলে refresh করলে পুরনোটা দেখা যেতে পারে, কারণ পরের request অন্য replica-তে গেছে। User ভাবে save হয়নি, আবার বদলায়। এর সমাধান (read-your-writes) [Day 48](${topicHrefForDay(48)})-এর consistency model-এ।`,
    },
    {
      title: "প্রচলিত ভুল ধারণা: triangle, label আর 'partition তো হয়ই না'",
      markdown: `CAP সম্ভবত system design-এর সবচেয়ে ভুল-উদ্ধৃত ধারণা। কয়েকটা বড় ভুল:

**"তিনটা থেকে যেকোনো দুটো বেছে নিন" (triangle ছবি):** তিন কোণায় C, A, P আর মাঝে লেখা "pick any two"। সমস্যা হলো P বেছে নেওয়ার জিনিস না, network থাকলে partition আসবেই। Eric Brewer নিজে ২০১২ সালের প্রবন্ধে বলেছেন "2 of 3" ধারণাটা বিভ্রান্তিকর। আসল বাছাই partition-এর সময় C আর A-র মধ্যে, তাও প্রতিটা operation-এর জন্য আলাদাভাবে।

**"X database CP, Y database AP":** একই database-এ setting, consistency level বা query option বদলালে আচরণ বদলায়। আর অনেক system আসলে কোনোটাই পুরোপুরি না: theorem-এর কঠোর অর্থে linearizable-ও না, আবার partition-এ প্রতিটা node উত্তরও দেয় না। Martin Kleppmann-এর "Please stop calling databases CP or AP" লেখাটা এই নিয়েই। ভালো অভ্যাস: label না খুঁজে প্রশ্ন করুন, "partition হলে এই নির্দিষ্ট read বা write-এর কী হয়?" আর vendor-এর documentation-এ ঠিক সেটাই খুঁজুন।

**"CAP-এর A মানে আমাদের 99.99% uptime":** Day 6-এর availability একটা পরিসংখ্যান, CAP-এর A একটা কঠোর শর্ত। একটা CP system (যেমন ৫-node etcd cluster) বাস্তবে খুব উঁচু uptime দিতে পারে, কারণ বেশিরভাগ client majority-র সাথে যুক্ত থাকে। আবার একটা "AP" system-ও নিজের bug-এ সারাদিন down থাকতে পারে। দুটো আলাদা প্রশ্ন।

**"CAP-এর C আর ACID-এর C একই":** না। ACID-এর C হলো application-এর নিয়ম ঠিক থাকা (একটা machine-এও প্রযোজ্য); CAP-এর C হলো সব replica মিলে একটা কপির মতো আচরণ করা।

**"Partition তো খুব কম হয়, ভাবার দরকার নেই":** কম হয়, কিন্তু হয়। আর "partition" শুধু তার কাটা না: একটা লম্বা GC pause, ভরা network queue, ভুল config, যেকোনো কারণে message নির্দিষ্ট সময়ে না পৌঁছালে node-এর কাছে সেটা partition-এর মতোই। যে design এর উত্তর ঠিক করে রাখেনি, সে partition-এর দিন ঘটনাক্রমে একটা আচরণ করে, প্রায়ই সবচেয়ে খারাপটা।

উল্টো দিকে একটা সূক্ষ্ম কথা: Brewer ২০১৭ সালে Google Spanner নিয়ে লিখেছেন, Spanner প্রযুক্তিগতভাবে CP (partition-এ consistency বাছে), কিন্তু Google-এর নিজস্ব network এত নির্ভরযোগ্য যে বাস্তবে user-রা একে প্রায় সবসময় available পায়। অর্থাৎ partition-এর সম্ভাবনা কমানো (ভালো network) আর partition হলে কী করবেন (CAP-এর বাছাই), দুটো আলাদা কাজ।`,
    },
    {
      title: "ইতিহাস: Brewer-এর ধারণা থেকে প্রমাণ, তারপর পুনর্বিবেচনা",
      markdown: `- **২০০০, Brewer-এর conjecture:** UC Berkeley-র Eric Brewer PODC 2000 conference-এর keynote ("Towards Robust Distributed Systems")-এ বললেন, web-scale system-এ consistency, availability আর partition tolerance তিনটা একসাথে পাওয়া যায় না। তখন এটা ছিল অনুমান (conjecture), আর তার উদ্দেশ্য ছিল engineer-দের দেখানো যে সবসময় strong consistency-র পেছনে ছুটলে availability হারাতে হয়।
- **২০০২, Gilbert ও Lynch-এর প্রমাণ:** MIT-র Seth Gilbert আর Nancy Lynch ধারণাটাকে গাণিতিকভাবে নির্দিষ্ট করে প্রমাণ করলেন। তাদের model-এ consistency মানে atomic/linearizable, availability মানে সচল node-এ আসা প্রতিটা request-এর উত্তর, আর network যত খুশি message হারাতে পারে। এই নির্দিষ্ট সংজ্ঞাগুলোই আজকের lesson-এ ব্যবহার করেছি। খেয়াল করুন, theorem-টা ঠিক এই সংজ্ঞাগুলোর জন্য প্রমাণিত; "consistency"-র ঢিলেঢালা অর্থে টেনে আনলে সেটা আর theorem থাকে না।
- **২০১২, "CAP Twelve Years Later":** Brewer IEEE Computer-এ লিখলেন "How the 'Rules' Have Changed"। মূল কথা: partition কদাচিৎ হয়, তাই স্বাভাবিক সময়ে C আর A দুটোই রাখুন; partition হলে সেটা ধরুন, কিছু operation সীমিত করুন, আর partition শেষে মেলানোর (recovery) পরিকল্পনা আগে থেকে করুন। একই বছর একই পত্রিকায় Abadi-র PACELC প্রবন্ধ।

শিক্ষা: CAP কোনো database বাছাইয়ের checklist না। এটা একটা সীমা, যেটা মনে করিয়ে দেয় distributed system-এ "সবসময় সর্বশেষ আর সবসময় উত্তর" একসাথে প্রতিশ্রুতি দেওয়া যায় না।`,
    },
  ],

  tradeOffs: {
    markdown: `**কখন CP আচরণ বাছবেন:** পুরনো data দিয়ে সিদ্ধান্ত নিলে ক্ষতি বড় আর ফেরানো কঠিন: টাকা সরানো, balance, শেষ stock/seat বিক্রি, unique username বা email, distributed lock, leader বাছাই, configuration। এখানে কিছুক্ষণের error, ভুল উত্তরের চেয়ে সস্তা।

**কখন AP আচরণ বাছবেন:** উত্তর না দেওয়া বেশি ক্ষতিকর, আর একটু পুরনো data বা পরে মেলানো সহজ: like/view counter, cart-এ item যোগ, feed, "online" status, analytics event, product catalog দেখা। এখানে conflict-এর নিয়ম (LWW, merge) আগে থেকে ঠিক করে রাখুন।

**মাঝামাঝি:** অনেক সময় একই flow-এর ভেতরে দুটোই থাকে। Cart-এ item রাখা AP, কিন্তু checkout-এ stock কমানো আর payment CP।

পাশাপাশি তুলনা:`,
    table: {
      headers: ["বিষয়", "CP আচরণ", "AP আচরণ"],
      rows: [
        [
          "Partition-এ minority/বিচ্ছিন্ন পাশ",
          "Error দেয় বা timeout পর্যন্ত অপেক্ষা করায়",
          "নিজের কপি থেকে উত্তর দেয়, write-ও নিতে পারে",
        ],
        [
          "User কী দেখে",
          '"পরে চেষ্টা করুন" বা ঘুরতে থাকা loading',
          "উত্তর পায়, কিন্তু কিছুক্ষণ পুরনো হতে পারে",
        ],
        [
          "Data-র অবস্থা",
          "সবাই একই সর্বশেষ মান দেখে (linearizable)",
          "Replica-গুলো সাময়িক আলাদা; পরে মিলে যায় (eventual)",
        ],
        [
          "Partition শেষে কাজ",
          "পিছিয়ে পড়া node ধরে ফেলে, মেলানোর কিছু নেই",
          "Conflict মেটাতে হয় (LWW, version vector, CRDT, application merge)",
        ],
        [
          "স্বাভাবিক সময়ের দাম (PACELC)",
          "বেশি latency: majority/leader-এর নিশ্চয়তা লাগে",
          "কম latency: কাছের replica-ই উত্তর দেয়",
        ],
        [
          "উপযুক্ত operation",
          "Payment, balance, seat/stock, lock, unique নাম",
          "Like, view, cart-এ যোগ, feed, presence",
        ],
        [
          "উদাহরণ (documented আচরণ)",
          "etcd linearizable read/write; Cassandra QUORUM/ALL (আংশিক)",
          "Dynamo-র shopping cart; Cassandra ONE; etcd serializable read",
        ],
      ],
    },
  },

  industry: {
    markdown: `- **etcd (Kubernetes-এর নিজের data store)** Raft consensus ব্যবহার করে। etcd documentation অনুযায়ী write আর default (linearizable) read-এ cluster-এর majority লাগে; ৩-member cluster ১টা আর ৫-member cluster ২টা member হারানো সহ্য করে। Serializable read যে member-এ যাবে সে নিজের কপি থেকেই দেয়, তাই দ্রুত কিন্তু পুরনো হতে পারে। এজন্য Kubernetes-এর control plane-এর সত্যিকারের তথ্য একটা CP ধাঁচের store-এ রাখা হয়।
- **Apache ZooKeeper** (HBase, আর KRaft আসার আগে Apache Kafka, coordination-এর জন্য এটা ব্যবহার করে/করত) ZAB protocol দিয়ে write-এ quorum নেয়। ZooKeeper documentation-এ স্পষ্ট বলা আছে read যুক্ত server-এর local কপি থেকে আসে, তাই একদম সর্বশেষ চাইলে আগে \`sync\` দিতে হয়।
- **Apache Cassandra** প্রতিটা query-তে **tunable consistency** দেয়: ONE, QUORUM, ALL, LOCAL_QUORUM ইত্যাদি। Documentation-এর পরামর্শ: read আর write-এর replica সংখ্যার যোগফল replication factor-এর বেশি হলে read সর্বশেষ write দেখবে, অর্থাৎ R + W > N।
- **Amazon Dynamo (২০০৭, SOSP paper)**: Amazon-এর shopping cart-এর মতো service-এর জন্য বানানো, লক্ষ্য ছিল "always writeable", মানে partition বা node নষ্ট হলেও cart-এ item যোগ করা যেন কখনো fail না করে। দাম হিসেবে একই cart-এর আলাদা version তৈরি হতে পারত; version (vector clock) দিয়ে সেগুলো ধরা হতো আর merge করা হতো। Paper-এ স্বীকার করা আছে, এই merge-এ মুছে ফেলা item আবার ফিরে আসতে পারে। (এটা পরের Amazon DynamoDB service-এর সাথে এক না।)
- **Amazon DynamoDB** documentation অনুযায়ী read default-ভাবে eventually consistent, আর request-এ strongly consistent read চাওয়া যায়: একই system-এ PACELC-এর EL আর EC দুটোই, query অনুযায়ী।
- **Google Spanner**: Brewer-এর ২০১৭ সালের লেখা "Spanner, TrueTime and the CAP Theorem" অনুযায়ী Spanner partition-এ consistency বাছে (CP), কিন্তু Google-এর network-এর কারণে বাস্তবে availability খুব উঁচু।

বাংলাদেশের context-এ চিন্তা করুন: mobile wallet-এর transfer আর balance CP ধাঁচের হওয়াই যুক্তিসঙ্গত, কিন্তু একই app-এর offer banner বা notification count AP হলেও সমস্যা নেই।

*উৎস: E. Brewer, "Towards Robust Distributed Systems", PODC 2000 keynote; S. Gilbert & N. Lynch, "Brewer's Conjecture and the Feasibility of Consistent, Available, Partition-Tolerant Web Services", ACM SIGACT News, 2002; E. Brewer, "CAP Twelve Years Later: How the 'Rules' Have Changed", IEEE Computer, 2012; D. Abadi, "Consistency Tradeoffs in Modern Distributed Database System Design", IEEE Computer, 2012; G. DeCandia et al., "Dynamo: Amazon's Highly Available Key-value Store", SOSP 2007; E. Brewer, "Spanner, TrueTime and the CAP Theorem", Google, 2017; etcd documentation (FAQ, API guarantees, etcdctl); Apache ZooKeeper Programmer's Guide; Apache Cassandra documentation (consistency levels); Amazon DynamoDB Developer Guide (read consistency); M. Kleppmann, "Please stop calling databases CP or AP", 2015।*`,
  },

  mistakes: [
    {
      mistake:
        "CAP-কে 'C, A, P থেকে যেকোনো দুটো বেছে নিন' হিসেবে পড়া, আর design document-এ লেখা 'আমাদের system CA'।",
      fix: "Network-এ চলা system-এ P বাধ্যতামূলক। লিখুন: 'partition হলে এই operation error দেবে / পুরনো data দেবে', আর কেন।",
    },
    {
      mistake:
        "CAP-এর Availability-কে Day 6-এর uptime percentage ভাবা: 'আমাদের 99.99% SLA, তাই আমরা AP।'",
      fix: "CAP-এর A মানে partition-এর সময়ও প্রতিটা সচল node-এর non-error উত্তর। Uptime আলাদা মাপ; দুটো আলাদা করে বিচার করুন।",
    },
    {
      mistake:
        "CAP-এর C আর ACID-এর C গুলিয়ে ফেলা, ফলে 'transaction আছে, তাই replica-রা consistent' ধরে নেওয়া।",
      fix: "ACID-এর C মানে নিয়ম ঠিক থাকা; CAP-এর C মানে সব replica মিলে একটা কপির মতো আচরণ। Replication async হলে transaction থাকলেও replica পুরনো থাকতে পারে।",
    },
    {
      mistake:
        "পুরো product-এর জন্য একটাই সিদ্ধান্ত: 'আমরা AP database নিয়েছি', তারপর payment-ও সেখানে eventual consistency-তে।",
      fix: "প্রতিটা operation আলাদা করে দেখুন। Payment/stock-এর মতো জায়গায় quorum বা consensus-ভিত্তিক path, counter/feed-এ AP।",
    },
    {
      mistake: "Timeout হলেই ধরে নেওয়া write হয়নি, আর অন্ধভাবে retry করা।",
      fix: "Timeout মানে 'অজানা ফল'। Idempotency key দিন, retry-তে backoff রাখুন, আর দরকারে আগে অবস্থা পড়ে নিশ্চিত হোন।",
    },
    {
      mistake:
        "AP design নিয়ে conflict মেটানোর নিয়ম না ভাবা, ফলে default last-write-wins নীরবে data হারায়।",
      fix: "Design-এর সময়ই ঠিক করুন conflict-এ কী হবে: LWW চলবে কিনা, নাকি merge/version vector/CRDT লাগবে।",
    },
    {
      mistake:
        "২ বা ৪ node দিয়ে consensus cluster বানানো, 'বেশি node মানে বেশি নিরাপদ' ভেবে।",
      fix: "বিজোড় সংখ্যা (৩ বা ৫) রাখুন। ৪ node-এ majority ৩, তাই ৩-এর মতোই ১টা হারানো সয়, অথচ খরচ আর latency বেশি।",
    },
  ],

  lab: [
    {
      title: "৩-node etcd cluster চালু করুন",
      markdown: `আমরা etcd-র official image ব্যবহার করব (Apple Silicon আর Intel দুটোতেই চলে)। প্রথমে একটা আলাদা Docker network, তারপর তিনটা node। কোনো host port খোলার দরকার নেই, সব command container-এর ভেতরে চালাব।

\`\`\`bash
docker network create sdlab-day008-net

for i in 1 2 3; do
  docker run -d --name sdlab-day008-etcd$i --network sdlab-day008-net \\
    gcr.io/etcd-development/etcd:v3.5.17 /usr/local/bin/etcd \\
    --name etcd$i \\
    --listen-client-urls http://0.0.0.0:2379 \\
    --advertise-client-urls http://sdlab-day008-etcd$i:2379 \\
    --listen-peer-urls http://0.0.0.0:2380 \\
    --initial-advertise-peer-urls http://sdlab-day008-etcd$i:2380 \\
    --initial-cluster etcd1=http://sdlab-day008-etcd1:2380,etcd2=http://sdlab-day008-etcd2:2380,etcd3=http://sdlab-day008-etcd3:2380 \\
    --initial-cluster-state new --initial-cluster-token sdlab-day008
done
\`\`\`

(Windows-এ WSL বা Git Bash-এ চালান, কারণ \`for\` loop আর লাইনের শেষের \`\\\` চিহ্ন bash-এর নিয়ম।)

কয়েক সেকেন্ড পরে cluster-এর অবস্থা দেখুন:

\`\`\`bash
docker exec sdlab-day008-etcd1 etcdctl \\
  --endpoints=sdlab-day008-etcd1:2379,sdlab-day008-etcd2:2379,sdlab-day008-etcd3:2379 \\
  endpoint status -w table
\`\`\`

তিনটা সারি আসবে, একটার **IS LEADER** \`true\`। কোনটা leader সেটা প্রতিবার আলাদা হতে পারে। **লিখে রাখুন কোনটা leader।**`,
    },
    {
      title: "একটা মান লিখুন, অন্য node থেকে পড়ুন",
      markdown: `\`\`\`bash
docker exec sdlab-day008-etcd1 etcdctl put balance 500
docker exec sdlab-day008-etcd3 etcdctl get balance
\`\`\`

প্রথমটা \`OK\` দেবে, দ্বিতীয়টা:

\`\`\`text
balance
500
\`\`\`

Container-এর ভেতরে \`etcdctl\` default-ভাবে নিজের node-এ (\`127.0.0.1:2379\`) কথা বলে। তাই \`docker exec sdlab-day008-etcd3 ...\` মানে "node ৩-এর কাছে জিজ্ঞেস করো"। Node ১-এ লেখা মান node ৩-এ পৌঁছে গেছে: স্বাভাবিক অবস্থায় consistent আর available দুটোই।`,
    },
    {
      title: "Partition বানান: একটা follower-কে আলাদা করুন",
      markdown: `এমন একটা node বাছুন যেটা leader **না**। নিচে ধরে নিচ্ছি সেটা \`etcd3\`; যদি etcd3-ই leader হয়, সবখানে \`etcd3\`-এর জায়গায় \`etcd1\` লিখুন।

\`\`\`bash
docker network disconnect sdlab-day008-net sdlab-day008-etcd3
\`\`\`

এখন node ৩ চালু আছে, কিন্তু অন্য দুজনের সাথে কোনো যোগাযোগ নেই। এটাই network partition: একপাশে majority (node ১, ২), অন্যপাশে minority (node ৩)।

Majority পাশে নতুন মান লিখুন আর পড়ুন:

\`\`\`bash
docker exec sdlab-day008-etcd1 etcdctl put balance 300
docker exec sdlab-day008-etcd2 etcdctl get balance
\`\`\`

\`OK\` আর \`300\`: majority পাশ স্বাভাবিকভাবে চলছে।`,
    },
    {
      title: "Minority node-এর আচরণ দেখুন (CP)",
      markdown: `এবার বিচ্ছিন্ন node ৩-এর কাছে সাধারণ (linearizable) read আর write চাই। ৫ সেকেন্ডের timeout দিচ্ছি:

\`\`\`bash
docker exec sdlab-day008-etcd3 etcdctl --command-timeout=5s get balance
docker exec sdlab-day008-etcd3 etcdctl --command-timeout=5s put balance 999
\`\`\`

দুটোই প্রায় ৫ সেকেন্ড ঝুলে থেকে একটা warning log আর শেষে এই error দেবে:

\`\`\`text
Error: context deadline exceeded
\`\`\`

Node ৩ নিজে কী ভাবছে দেখুন:

\`\`\`bash
docker exec sdlab-day008-etcd3 etcdctl endpoint status -w table
\`\`\`

**ERRORS** column-এ থাকবে \`etcdserver: no leader\`। অর্থাৎ node ৩ জানে সে majority-র সাথে যুক্ত না, তাই সর্বশেষ মানের নিশ্চয়তা দিতে পারছে না, আর ভুল উত্তর দেওয়ার চেয়ে উত্তর না দেওয়া বেছে নিচ্ছে। এটাই **CP আচরণ**: consistency রইল, এই node-এর availability গেল। আর খেয়াল করুন, client error-টা পেল timeout হিসেবে, "partition হয়েছে" বলে স্পষ্ট বার্তা না।`,
    },
    {
      title: "একই node থেকে serializable read: দ্রুত, কিন্তু পুরনো",
      markdown: `এবার node ৩-কে বলি "নিজের কপি থেকেই দাও, নিশ্চিত হওয়ার দরকার নেই":

\`\`\`bash
docker exec sdlab-day008-etcd3 etcdctl get balance --consistency=s
\`\`\`

সাথে সাথে উত্তর আসবে:

\`\`\`text
balance
500
\`\`\`

অথচ আসল সর্বশেষ মান 300! এটা ছিল **AP ধাঁচের read**: উত্তর পেলেন, কিন্তু পুরনো। একই system, একই data, শুধু query-র option বদলে C থেকে A-র দিকে সরে গেলাম। (Partition না থাকলেও serializable read দ্রুত হয়, কারণ leader-এর সাথে নিশ্চিত হওয়ার round trip লাগে না: PACELC-এর EL।)`,
    },
    {
      title: "Partition সারান, node ধরে ফেলবে",
      markdown: `\`\`\`bash
docker network connect sdlab-day008-net sdlab-day008-etcd3
\`\`\`

কয়েক সেকেন্ড অপেক্ষা করে:

\`\`\`bash
docker exec sdlab-day008-etcd3 etcdctl get balance
\`\`\`

এখন \`300\`। Node ৩ leader-এর কাছ থেকে যা মিস করেছিল তা নিয়ে নিয়েছে। CP system-এ মেলানোর কোনো conflict নেই, কারণ minority পাশে কোনো write গ্রহণই হয়নি (\`999\` কোথাও লেখা হয়নি, চাইলে দেখে নিন)।`,
    },
    {
      title: "ঐচ্ছিক: এবার leader-কেই আলাদা করুন",
      markdown: `আবার \`endpoint status\` দিয়ে দেখুন কে leader, তারপর সেটাকে আলাদা করুন (নিচে ধরে নিচ্ছি etcd2):

\`\`\`bash
docker network disconnect sdlab-day008-net sdlab-day008-etcd2
\`\`\`

৫ সেকেন্ড পরে বাকি দুজনের অবস্থা:

\`\`\`bash
docker exec sdlab-day008-etcd1 etcdctl put balance 250
docker exec sdlab-day008-etcd1 etcdctl \\
  --endpoints=sdlab-day008-etcd1:2379,sdlab-day008-etcd3:2379 \\
  endpoint status -w table
\`\`\`

Write সফল, বাকি দুজনের একজন নতুন leader, আর **RAFT TERM** এক বেড়েছে (নতুন নির্বাচন হয়েছে)। Majority পাশ নিজে থেকেই সেরে উঠল। পুরনো leader এখন minority-তে, তাই সে আর write নিতে পারবে না: split-brain হলো না। Network জোড়া দিলে (\`docker network connect ...\`) সে follower হিসেবে ফিরে \`250\` দেখবে; প্রথম command-এ "leader changed" ধরনের একটা retry warning দেখতে পারেন, সেটা স্বাভাবিক।`,
    },
    {
      title: "পরিষ্কার করুন",
      markdown: `\`\`\`bash
docker rm -f sdlab-day008-etcd1 sdlab-day008-etcd2 sdlab-day008-etcd3
docker network rm sdlab-day008-net
\`\`\`

ভেবে দেখুন: ৩টার মধ্যে ২টা node আলাদা হয়ে গেলে কী হতো? কোনো পাশেই majority থাকত না, তাই পুরো cluster linearizable write নেওয়া বন্ধ করত। CP-র দামটা এখানেই সবচেয়ে স্পষ্ট।`,
    },
  ],

  connections: {
    markdown: `- **[Day 2 · Client, Server ও Internet](${topicHrefForDay(2)})**: সেখানে দেখেছি request অনেক hop পার হয়ে যায়, আর পথে যেকোনো জায়গায় আটকাতে পারে। আজ সেই অনির্ভরযোগ্য network-ই partition হয়ে ফিরে এলো।
- **[Day 5 · Scalability](${topicHrefForDay(5)})**: Scale করতে machine বাড়ালাম; data-কে একাধিক machine-এ রাখতেই CAP-এর প্রশ্ন জন্মায়।
- **[Day 6 · Availability](${topicHrefForDay(6)})**: সেখানকার availability একটা মাপ (কত nines), আর CAP-এর A একটা কঠোর শর্ত। Day 6-এর split-brain আর quorum-এর কথাই আজ CP আচরণের ভিত্তি।
- **[Day 7 · Latency vs Throughput](${topicHrefForDay(7)})**: PACELC-এর L ঠিক সেই latency। সর্বশেষ data নিশ্চিত করতে প্রতিটা বাড়তি round trip latency বাড়ায়।

সামনে যা আসছে (এখন এটুকু জানলেই চলবে, এসব দিনে গভীরে যাব):
- [Day 10 · Databases](${topicHrefForDay(10)}) আর [Day 25 · ACID vs BASE](${topicHrefForDay(25)}): ACID-এর C আর BASE-এর eventual consistency।
- [Day 28 · Database Replication](${topicHrefForDay(28)}): leader-follower, sync বনাম async replication, replication lag।
- [Day 47 · Strong vs Eventual Consistency](${topicHrefForDay(47)}) আর [Day 48 · Consistency Models](${topicHrefForDay(48)}): linearizability থেকে read-your-writes পর্যন্ত পুরো সিঁড়ি।
- [Day 49 · Quorum ও R+W>N](${topicHrefForDay(49)}), [Day 50 · Lamport ও Vector Clocks](${topicHrefForDay(50)}), [Day 51 · Consensus](${topicHrefForDay(51)}), [Day 55 · CRDTs](${topicHrefForDay(55)})।`,
  },

  explainYourself: [
    {
      question:
        'একজন teammate বলছে, "আমাদের database CA, কারণ আমরা একটাই data center-এ চালাই।" আপনি কী বলবেন?',
      idealAnswer:
        "একটা data center-এর ভেতরেও node-গুলো network দিয়েই যুক্ত, আর switch নষ্ট, ভুল config বা লম্বা pause-এ partition সেখানেও হয়; শুধু কম হয়। 'CA' মানে আসলে 'partition হবে না ধরে নিয়েছি', তাই partition হলে system কী করবে তা অনির্ধারিত থাকে। সঠিক প্রশ্ন: partition হলে প্রতিটা operation কি error দেবে (CP), নাকি পুরনো data দেবে (AP)? সত্যিকারের CA শুধু একটা machine-এর database, যেটা distributed না।",
    },
    {
      question:
        "একটা e-commerce app-এ cart-এ item যোগ করা, checkout-এ stock কমানো আর product-এর view count, এই তিনটা operation partition-এর সময় কিভাবে আচরণ করা উচিত?",
      idealAnswer:
        "Cart-এ item যোগ AP: user-কে error দেখানো বেশি ক্ষতিকর, আর পরে দুই version merge করা যায় (Dynamo-র shopping cart ঠিক এই পথে গিয়েছিল)। Stock কমানো CP: শেষ item দুজনকে বিক্রি করা অনেক বড় ক্ষতি, তাই সর্বশেষ stock নিশ্চিত না হলে checkout সাময়িক আটকানো ভালো। View count AP: কিছুক্ষণ ভুল সংখ্যায় ক্ষতি নেই, পরে যোগ করে নেওয়া যায়। অর্থাৎ CAP পুরো app-এর না, প্রতিটা operation-এর সিদ্ধান্ত।",
    },
    {
      question:
        "Partition তো বছরে কয়েকবার হয়। তাহলে বাকি সময় consistency-র জন্য আমরা কি কোনো দাম দিই?",
      idealAnswer:
        "হ্যাঁ, এটাই PACELC-এর 'Else' অংশ। Partition না থাকলেও সর্বশেষ data নিশ্চিত করতে অন্য replica বা leader-এর সাথে কথা বলতে হয়: write-এ majority-র নিশ্চয়তা, read-এ quorum বা leader-কে জিজ্ঞেস করা। প্রতিটা round trip latency বাড়ায়, বিশেষ করে দূরের data center-এ। তাই partition-এ C বনাম A, আর স্বাভাবিক সময়ে latency বনাম C, দুটো trade-off-ই design-এ ভাবতে হয়।",
    },
  ],

  interviewQuestions: [
    {
      question:
        "CAP Theorem ব্যাখ্যা করুন। কেন বলা হয় এটা আসলে 'C আর A-র মধ্যে বাছাই'?",
      answerOutline: `- প্রসঙ্গ: data একাধিক node-এ replicate করা, মাঝে network
- C = linearizability (প্রতিটা read সর্বশেষ write দেখে), A = প্রতিটা সচল node-এর non-error উত্তর, P = network message হারালেও চলা
- Partition হলে পিছিয়ে থাকা পাশে: উত্তর দিলে C যায়, না দিলে A যায়
- Network-এ partition এড়ানো যায় না, তাই P বাধ্যতামূলক; বাছাই partition-এর সময় C বনাম A
- Partition না থাকলে দুটোই সম্ভব; আর বাছাই প্রতিটা operation-এর জন্য আলাদা হতে পারে`,
    },
    {
      question:
        "একটা payment system আর একটা social media like counter design করছেন। Partition-এর সময় প্রত্যেকটা কী করবে?",
      answerOutline: `- Payment: CP; minority পাশে transfer reject বা অপেক্ষা; consensus/quorum-ভিত্তিক store; idempotency key দিয়ে নিরাপদ retry
- ভুলের দাম: দুবার খরচ বা ঋণাত্মক balance, ফেরানো কঠিন ও ব্যয়বহুল
- Like counter: AP; প্রতিটা পাশ নিজের গোনা চালিয়ে যায়, পরে যোগ (counter CRDT)
- ভুলের দাম: কিছুক্ষণ ভুল সংখ্যা, কারও ক্ষতি নেই
- উপসংহার: একই company-তে দুটো আলাদা সিদ্ধান্ত, product-এর একক label না`,
    },
    {
      question:
        "N = 3 replica-র একটা Cassandra-ধাঁচের store-এ R আর W কিভাবে বাছবেন?",
      answerOutline: `- R + W > N হলে read আর write-এর replica দল মেলে, read সর্বশেষ write দেখে
- W = 2, R = 2 (QUORUM/QUORUM): ১টা node পড়লেও দুটোই চলে; সাধারণ পছন্দ
- W = 1, R = 1: দ্রুত, বেশি available, কিন্তু পুরনো read সম্ভব (2 ≤ 3)
- W = 3, R = 1: দ্রুত read, কিন্তু একটা node পড়লেই write বন্ধ
- বড় R/W = CP-র দিকে ও বেশি latency; ছোট = AP-র দিকে ও কম latency (PACELC)
- সতর্কতা: R + W > N একা পুরো linearizability দেয় না (concurrent write, LWW)`,
    },
    {
      question: "PACELC কী, আর CAP-এর সাথে এটা কী যোগ করে?",
      answerOutline: `- Abadi, IEEE Computer 2012: if Partition then A or C, Else Latency or Consistency
- CAP শুধু partition-এর সময়ের কথা বলে, যা কদাচিৎ
- স্বাভাবিক সময়ে সর্বশেষ data নিশ্চিত করতে round trip লাগে → latency
- উদাহরণ: etcd linearizable বনাম serializable read; Cassandra ONE বনাম QUORUM; DynamoDB eventually বনাম strongly consistent read
- Default setting-এ Dynamo-ধাঁচের system PA/EL, পুরো ACID replicated system PC/EC`,
    },
    {
      question:
        "আপনার service একটা CP store-এ write করতে গিয়ে timeout পেল। এখন কী করবেন?",
      answerOutline: `- Timeout মানে অজানা ফল: write commit হতেও পারে, না-ও পারে
- অন্ধ retry বিপজ্জনক (দুবার transfer)
- Idempotency key দিয়ে retry, যাতে দ্বিতীয়বার একই ফল
- Exponential backoff + jitter, যাতে সেরে ওঠা cluster-এ retry-র ঢেউ না আসে
- দরকারে আগে অবস্থা পড়ে নিশ্চিত হওয়া, আর user-কে "processing" অবস্থা দেখানো`,
    },
  ],

  summary: {
    points: [
      "CAP-এর প্রশ্ন আসে যখন data একাধিক node-এ কপি থাকে আর তাদের মাঝের network ভাগ (partition) হয়।",
      "C = প্রতিটা read সর্বশেষ write দেখে (linearizability, ACID-এর C না); A = প্রতিটা সচল node non-error উত্তর দেয় (uptime percentage না)।",
      "Partition এড়ানো যায় না, তাই আসল বাছাই: partition-এর সময় C না A। Partition না থাকলে দুটোই পাওয়া যায়।",
      "CP: পুরনো data দেওয়ার চেয়ে error/অপেক্ষা (payment, stock, lock)। AP: উত্তর দাও, পরে মেলাও (like, cart, feed)।",
      "CAP product-এর label না, প্রতিটা operation-এর সিদ্ধান্ত; অনেক system query অনুযায়ী বদলাতে দেয় (R, W, consistency level)।",
      "R + W > N হলে read আর write-এর replica দল মেলে; majority/quorum দিয়েই etcd-র মতো CP system split-brain ঠেকায়।",
      "PACELC: partition না থাকলেও latency বনাম consistency-র দাম দিতে হয়, প্রতিদিন।",
    ],
    diagram: {
      id: "day-008-summary",
      caption: "এক নজরে CAP Theorem",
      alt: "Client node B-কে জিজ্ঞেস করে, node A আর node B-এর মাঝে partition; node B থেকে দুটো পথ: CP 'error দাও' আর AP 'পুরনো data দাও'।",
    },
  },
};
