// Day 22 · Database Indexes — Phase 3 (Database ও Storage গভীরে).

import { topicHrefForDay } from "@/lib/data/courses/system-design-a-z";
import type { SdLesson } from "@/lib/system-design/lesson.types";

export const day022Lesson: SdLesson = {
  topicId: "sd-day-022",
  day: 22,
  title: "Database Indexes",
  definition:
    "Database Index হলো table-এর পাশে রাখা একটা আলাদা, sorted গঠন (সাধারণত B+tree), যেটা দিয়ে পুরো table না পড়েই দরকারি row-এর ঠিকানা সরাসরি পাওয়া যায়।",

  objectives: [
    "Index ছাড়া কেন একটা row খুঁজতেও পুরো table পড়তে হয় (O(n)), আর B+tree index কিভাবে সেটা O(log n)-এ নামায়, fan-out দিয়ে হিসাব করে দেখাতে পারবেন।",
    "B+tree, hash, clustered আর secondary index-এর পার্থক্য, আর MySQL InnoDB ও PostgreSQL-এ row আসলে কোথায় থাকে, ব্যাখ্যা করতে পারবেন।",
    "Leftmost-prefix rule, covering index আর selectivity মাথায় রেখে একটা নির্দিষ্ট query-র জন্য সঠিক composite index design করতে পারবেন।",
    "EXPLAIN ANALYZE পড়ে Seq Scan, Index Scan, Index Only Scan আর Bitmap Scan চিনতে পারবেন, আর index থাকা সত্ত্বেও কেন ব্যবহার হচ্ছে না, তার কারণ খুঁজে বের করতে পারবেন।",
    "প্রতিটা index-এর write আর storage খরচ হিসাব করে ঠিক করতে পারবেন কখন index যোগ করবেন, আর কখন সরিয়ে ফেলবেন।",
  ],

  prerequisites: [
    { day: 10, title: "Databases", href: topicHrefForDay(10) },
    { day: 20, title: "SQL vs NoSQL", href: topicHrefForDay(20) },
    { day: 21, title: "Data Modeling", href: topicHrefForDay(21) },
  ],

  problem: {
    markdown: `SSC-র ফলাফল প্রকাশের দিন। একটা (কাল্পনিক) শিক্ষা বোর্ডের result portal-এর \`results\` table-এ **২০ লাখ** পরীক্ষার্থীর row। Portal-এর কাজ খুব সহজ: roll দিলে result দেখাও।

\`\`\`sql
SELECT * FROM results WHERE roll = 482913;
\`\`\`

এক সপ্তাহ আগে team test করেছিল ৫০০টা নমুনা row দিয়ে। প্রতিটা query ১-২ms, সবাই খুশি।

দুপুর ২টায় result খুলল। কয়েক মিনিটের মধ্যে:

1. প্রতিটা query নিচ্ছে কয়েকশো millisecond, কারণ \`roll\` column-এ কোনো **index** নেই। Database-কে প্রতিবার ২০ লাখ row-এর প্রতিটা পড়ে মিলিয়ে দেখতে হচ্ছে। একে বলে **Full Table Scan** (PostgreSQL-এর ভাষায় **Seq Scan**)।
2. প্রতি সেকেন্ডে হাজার হাজার student। ১০০০ query/s × ২০ লাখ row = **সেকেন্ডে ২০০ কোটি row মেলানো**। Database server-এর CPU ১০০%।
3. Query ধীর, তাই connection pool ভরে গেল। নতুন request timeout। Student-রা refresh চাপছে, load আরও বাড়ছে।

Team প্রথমে বড় server নিল। একটু ভালো হলো, কিন্তু সমস্যা মিটল না। কারণ সমস্যাটা hardware-এর না, **algorithm**-এর। প্রতিটা query-র উত্তর মাত্র **একটা** row, অথচ সেটা খুঁজতে পড়া হচ্ছে সব row। কাজের পরিমাণ row-সংখ্যার সাথে সমানুপাতিক, অর্থাৎ **O(n)**।

শেষে একজন senior একটা লাইন চালালেন:

\`\`\`sql
CREATE INDEX idx_results_roll ON results (roll);
\`\`\`

এরপর প্রতিটা query পড়ে মাত্র ৩-৪টা index page আর ১টা table page। Query time ১ms-এরও নিচে।

আর test-এ সমস্যাটা ধরা পড়েনি কেন? কারণ ৫০০ row-এ পুরো table পড়া আর index দিয়ে পড়ার পার্থক্য চোখেই পড়ে না। **O(n) সমস্যা লুকিয়ে থাকে, data বড় হলে তবেই দেখা দেয়।**`,
    diagrams: [
      {
        id: "day-022-before",
        caption:
          "আগে: index নেই, তাই একটা roll খুঁজতে database ২০ লাখ row-এর প্রতিটা পড়ে মিলিয়ে দেখে, মিলে গেলেও থামে না।",
        alt: "বামে SELECT * FROM results WHERE roll = 482913 query; ডানে results table-এর row-গুলো, প্রতিটার পাশে ভুল চিহ্ন, শুধু 482913-এর পাশে ঠিক চিহ্ন; পাশে লেখা প্রতিটা row পড়ে মেলানো।",
      },
    ],
  },

  analogy: {
    markdown: `পাড়ার মুদি দোকানের **বাকির খাতা**র কথা ভাবুন। ৫০০ পাতার মোটা খাতা। দোকানদার তারিখ অনুযায়ী লেখেন: "৩ তারিখ, রহিম চাচা, চাল ১২০৳", "৩ তারিখ, সালমা আপা, তেল ২০০৳"। নামগুলো এলোমেলো, যে যেদিন এসেছে।

মাসের শেষে রহিম চাচা জিজ্ঞেস করলেন, "আমার মোট বাকি কত?" দোকানদারকে এখন ৫০০ পাতার **প্রতিটা লাইন** পড়তে হবে, কারণ রহিম চাচার নাম যেকোনো পাতায় থাকতে পারে। প্রথম entry পেয়েও থামা যাবে না, আরও থাকতে পারে। এটাই **Full Table Scan**।

চালাক দোকানদার খাতার শেষে কয়েকটা পাতা রাখেন: **নাম অনুযায়ী বর্ণানুক্রমে সূচি**।

- করিম → পাতা ১২, ৮৮
- রহিম চাচা → পাতা ৭, ১৩১, ৪০২
- সালমা আপা → পাতা ২০৯

এখন রহিম চাচার হিসাব মানে: সূচিতে "র" খুঁজে নাম বের করা (বর্ণানুক্রমে সাজানো, তাই কয়েক সেকেন্ডে), তারপর সরাসরি তিনটা পাতায় যাওয়া।

- **বাকির খাতা = Table**: আসল data, যে ক্রমে এসেছে সেভাবে লেখা
- **শেষের সূচি = Index**: শুধু নাম (key) আর পাতা নম্বর (row-এর ঠিকানা), sorted
- **পাতা নম্বর = Row pointer**: আসল data কোথায় আছে তার ঠিকানা

খাতা বড় হলে সূচিও ৩০ পাতার হয়ে যায়। তখন সূচির শুরুতে আরেকটা ছোট পাতা: "ক-ঘ: সূচির পাতা ১, চ-ন: পাতা ৯, প-স: পাতা ২০"। **সূচির সূচি।** এই কয়েক স্তরের সূচিই B-tree-র মূল idea।

কিন্তু সূচি বিনামূল্যে না। প্রতিবার নতুন বাকি লিখলে দোকানদারকে **সূচিতেও** নাম আর পাতা নম্বর তুলতে হয়, তাই লেখা একটু ধীর হয়। সূচির পাতাও জায়গা নেয়। আর কেউ যদি জিজ্ঞেস করে "কে কে ৫০০৳-এর বেশি বাকি রেখেছে?", নাম-সূচি কোনো কাজে আসে না। সেজন্য আলাদা সূচি লাগবে। Database index-এর সব trade-off এই খাতাতেই আছে।`,
    diagrams: [
      {
        id: "day-022-analogy",
        caption:
          "বাকির খাতা: দোকানদার আগে নাম-সূচিতে খোঁজেন, তারপর সরাসরি সেই পাতাগুলোয় যান।",
        alt: "বামে দোকানদার জিজ্ঞেস করছেন রহিম চাচার বাকি কত; মাঝে নাম অনুযায়ী সাজানো সূচি, যেখানে রহিম চাচা → পাতা ৭, ১৩১, ৪০২ চিহ্নিত; ডানে বাকির খাতার তিনটা পাতা, তীর দিয়ে সূচি থেকে জোড়া।",
      },
    ],
  },

  coreConcept: {
    markdown: `**Index** হলো table-এর এক বা একাধিক column-এর উপর বানানো একটা **আলাদা data structure**। এতে থাকে দুটো জিনিস: column-এর মান (**key**), আর সেই মানের row table-এর কোথায় আছে তার ঠিকানা (**row pointer**)। আর সবচেয়ে জরুরি কথা: index **sorted**।

**Sorted হলে কেন দ্রুত?** একটা sorted list-এ binary search করলে প্রতি ধাপে অর্ধেক বাদ যায়। ২০ লাখ entry-তে মাত্র ~২১টা তুলনায় যেকোনো মান পাওয়া যায় (2²¹ ≈ ২১ লাখ)। এলোমেলো table-এ লাগে ২০ লাখ তুলনা।

| Row সংখ্যা (n) | Full Table Scan, O(n) | Index lookup, O(log n) |
|---|---|---|
| ১,০০০ | ১,০০০ row পড়া | ~৩ page |
| ১০ লাখ | ১০ লাখ row পড়া | ~৩-৪ page |
| ১০০ কোটি | ১০০ কোটি row পড়া | ~৪-৫ page |

Data হাজার গুণ বাড়লে scan হাজার গুণ ধীর হয়, কিন্তু index lookup-এ মাত্র এক-দুটো page বাড়ে। (Page-এর হিসাব কেন এত ছোট, Deep dive-এ fan-out দিয়ে দেখব।)

**বাস্তবে index কেমন দেখতে?** Database data রাখে disk-এ **page** (block) আকারে: PostgreSQL-এ ৮KB, MySQL InnoDB-তে default ১৬KB। তাই সাধারণ sorted array না, বেশিরভাগ database index বানায় **B+tree** দিয়ে: কয়েক স্তরের একটা tree, যার প্রতিটা node একটা page। PostgreSQL, MySQL আর MongoDB তিনটারই default index B-tree পরিবার থেকে।

\`\`\`sql
-- একটা column-এ index
CREATE INDEX idx_results_roll ON results (roll);

-- একই মান দুবার ঢুকতে দেবে না
CREATE UNIQUE INDEX idx_users_email ON users (email);
\`\`\`

Primary key আর UNIQUE constraint দিলে database নিজেই index বানিয়ে নেয়, কারণ duplicate আটকাতে প্রতিটা insert-এ দ্রুত খুঁজতে হয়।

**Index কোথায় কাজে লাগে?**
- \`WHERE roll = 482913\`: সমান (equality) খোঁজা
- \`WHERE created_at > '2026-01-01'\`: range, কারণ index sorted
- \`ORDER BY created_at LIMIT 20\`: আগে থেকেই sorted, আলাদা sort লাগে না
- \`JOIN orders ON orders.user_id = users.id\`: join-এর column খোঁজা
- UNIQUE নিশ্চিত করা

**কেন সব column-এ index দিই না?** কারণ index বিনামূল্যে না:
1. **Write খরচ**: প্রতিটা INSERT, DELETE, আর indexed column বদলানো UPDATE-এ table-এর সাথে **প্রতিটা** index-ও update করতে হয়। ৫টা index মানে একটা insert-এ ৬টা structure-এ লেখা।
2. **Storage খরচ**: Index আলাদা জায়গা নেয়, আর memory-তেও জায়গা চায়। আমাদের Lab-এ ১০ লাখ row-এর table ৮৩MB, অথচ পাঁচটা index মিলিয়ে ১৪৫MB, table-এর চেয়েও বেশি!
3. **সব query-তে কাজে আসে না**: যে column-এর মান বেশিরভাগ row-এ একই (যেমন \`is_active\`, ৯০% true), সেখানে index প্রায়ই বেকার।

**Database কোনটা ব্যবহার করবে, কে ঠিক করে?** আপনি না, **query optimizer (planner)**। সে table-এর statistics দেখে হিসাব করে, index দিয়ে যাওয়া সস্তা নাকি পুরো table পড়া। কী বেছে নিল দেখতে query-র আগে লিখুন \`EXPLAIN\` (পরিকল্পনা দেখায়) বা \`EXPLAIN ANALYZE\` (আসলে চালিয়ে সময়সহ দেখায়)। Output-এ \`Seq Scan\` মানে পুরো table পড়া, \`Index Scan\` মানে index ব্যবহার হয়েছে। Deep dive আর Lab-এ এটা ভালো করে পড়া শিখব।`,
    diagrams: [
      {
        id: "day-022-main",
        caption:
          "Index একটা আলাদা sorted গঠন: roll আর row-এর ঠিকানা (page, slot) রাখে; খুঁজে পেলে সরাসরি table-এর সেই page-এ যায়।",
        alt: "বামে roll অনুযায়ী sorted index-এর ছয়টা entry, প্রতিটায় roll আর (page, slot) ঠিকানা; ডানে results table-এর row-গুলো এলোমেলো ক্রমে; তীর দিয়ে প্রতিটা index entry তার row-এর সাথে জোড়া, 482913-এর তীর চিহ্নিত।",
        downloadable: true,
      },
      {
        id: "day-022-before-after",
        caption:
          "পাশাপাশি: index ছাড়া প্রতি query-তে সব row পড়া; index দিয়ে কয়েকটা page পড়েই row পাওয়া। (সংখ্যাগুলো উদাহরণ)",
        alt: "উপরে index ছাড়া Seq Scan, যেখানে সব row মেলানো হচ্ছে; নিচে sorted index থেকে সরাসরি একটা row-এ যাওয়া; নিচে দুই ক্ষেত্রের খরচের পার্থক্য লেখা।",
      },
    ],
  },

  deepDive: [
    {
      title: "B+tree-র ভেতরে: page, fan-out, আর কেন মাত্র ৩-৪ ধাপ",
      markdown: `B+tree-র তিন রকম node, প্রতিটা একটা disk page:

- **Root**: সবার উপরে একটা page
- **Internal (branch) node**: শুধু পথ দেখায়। কিছু **separator key** আর child page-এর pointer রাখে, যেমন "50-এর কম হলে বামে যাও"
- **Leaf node**: আসল index entry, অর্থাৎ (key, row pointer), sorted। আর প্রতিটা leaf পাশের leaf-এর সাথে **link** দিয়ে জোড়া

**Fan-out** মানে একটা node-এর কয়টা child। এটাই B+tree-র জাদু। একটা ৮KB page-এ ছোট key আর pointer কয়েকশোটা ধরে। ধরুন fan-out ১০০ (হিসাব সহজ রাখতে):

- ১ level: ১০০ leaf entry
- ২ level: ১০০ × ১০০ = ১০,০০০
- ৩ level: ১০০³ = **১০ লাখ**
- ৪ level: ১০০⁴ = **১০ কোটি**

অর্থাৎ height ≈ log(n), যেখানে log-এর ভিত্তি fan-out। Binary tree-তে (fan-out ২) ১০ লাখ row-এ লাগত ~২০ level, মানে ~২০টা disk read। B+tree-তে ৩-৪টা। Disk-এ প্রতিটা read দামি, তাই "চওড়া আর বেঁটে" tree-ই জেতে। তার উপর root আর internal node-গুলো সংখ্যায় অল্প আর সবচেয়ে বেশি ব্যবহার হয়, তাই প্রায় সবসময় memory-তে (buffer cache) থাকে। বাস্তবে disk-এ যেতে হয় হয়তো শুধু leaf আর table page-এর জন্য। (Day 17-এর caching-এর কথা মনে আছে? একই নীতি।)

**একটা key খোঁজা (Index Scan):** root থেকে শুরু, প্রতিটা node-এ separator key দেখে ঠিক child-এ নামা, leaf-এ পৌঁছে page-এর ভেতরে binary search। নিচের ধাপে ধাপে diagram-টা চালিয়ে দেখুন।

**Range scan কেন সস্তা:** \`WHERE id BETWEEN 42 AND 71\` হলে একবার 42 পর্যন্ত নামি, তারপর আর উপরে উঠি না, leaf-এর link ধরে পাশের leaf-এ হাঁটতে থাকি যতক্ষণ না range শেষ হয়। এজন্যই "B+tree" (শুধু leaf-এ data, leaf-গুলো linked) range query-র জন্য এত ভালো।

**Insert আর page split:** নতুন key সবসময় ঠিক leaf-এ, sorted জায়গায় বসে। Leaf ভর্তি থাকলে সেটা **দুই ভাগ (page split)** হয়: অর্ধেক entry নতুন page-এ যায়, আর parent-এ একটা নতুন separator key ওঠে। Parent-ও ভর্তি হলে সেটাও ভাগ হয়, এভাবে উপরে। Root ভাগ হলে tree-র height এক বাড়ে। Tree নিচ থেকে না, **উপর দিকে বাড়ে**, তাই সব leaf সবসময় একই গভীরতায় থাকে (balanced)।

এর একটা বাস্তব ফল আছে। Auto-increment id-র মতো **ক্রমবর্ধমান** key সবসময় সবচেয়ে ডানের leaf-এ যোগ হয়, split কম আর ঠিক জায়গায়। কিন্তু **random key** (যেমন UUID v4) tree-র যেকোনো জায়গায় ঢোকে: সব জায়গায় split, অর্ধেক-খালি page, আর প্রতিটা insert-এ আলাদা page memory-তে আনতে হয়। বড় table-এ এটা write-কে চোখে পড়ার মতো ধীর করে। (Day 32-এ time-ordered ID নিয়ে আবার আসব।) PostgreSQL B-tree page-এ default **fillfactor ৯০**, অর্থাৎ index বানানোর সময় page-এ ১০% জায়গা খালি রাখে, যাতে পরের insert-এ সাথে সাথে split না হয়।

**অন্য ধরনের index (এক নজরে):**
- **Hash index**: key-কে hash করে bucket-এ রাখে। শুধু \`=\` খোঁজা, range বা sort পারে না। PostgreSQL-এ আছে, কিন্তু বেশিরভাগ ক্ষেত্রে B-tree-ই যথেষ্ট আর বেশি নমনীয়।
- **GIN**: একটা row-এ অনেক মান থাকলে (array, JSONB, full-text)। "কোন row-এ এই শব্দ আছে" ধরনের প্রশ্নে। (Day 34-এ inverted index গভীরে।)
- **GiST / SP-GiST**: geometric data, range type, nearest-neighbour। (Day 35-এ geo-spatial index।)
- **BRIN**: বিশাল table, যেখানে data প্রাকৃতিকভাবে ক্রমে আছে (যেমন log-এর \`created_at\`)। প্রতিটা block-range-এর শুধু min/max রাখে, তাই খুব ছোট, কিন্তু কম নিখুঁত।

আর **LSM-tree**? সেটা index না, পুরো storage engine-এর আলাদা design (Cassandra, RocksDB)। B-tree বনাম LSM-এর লড়াই আগামীকাল, Day 23-এ।`,
      diagrams: [
        {
          id: "day-022-btree",
          caption:
            "B+tree-র ভেতরের গঠন: root আর internal node পথ দেখায়, leaf-এ sorted key আর row pointer, আর leaf-গুলো পাশাপাশি linked।",
          alt: "তিন স্তরের B+tree: root-এ key 50; internal node-এ 20, 35 আর 65, 80; ছয়টা leaf-এ 5,12 / 20,27 / 35,42 / 50,58 / 65,71 / 80,93; leaf-গুলো তীর দিয়ে পাশাপাশি জোড়া; প্রতিটা leaf key থেকে নিচে table rows-এর দিকে দাগ।",
        },
        {
          id: "day-022-lookup",
          caption:
            "ধাপে ধাপে: id = 42 খুঁজতে root → internal → leaf → row, আর range query-তে leaf link ধরে হাঁটা।",
          alt: "B+tree-তে key 42 খোঁজার ছয়টা ধাপ: root-এ 42 < 50 তাই বামে, internal node-এ 42 ≥ 35 তাই তৃতীয় child, leaf-এ 42 পাওয়া, row pointer ধরে table-এর row আনা, তারপর range query-তে পাশের leaf-গুলোয় যাওয়া।",
        },
      ],
    },
    {
      title: "Clustered বনাম secondary index: row আসলে কোথায় থাকে?",
      markdown: `Index-এর leaf-এ "row pointer" থাকে বললাম। কিন্তু pointer-টা কী, আর row কোথায় থাকে, সেটা database ভেদে আলাদা। এই পার্থক্য performance-এ বড় প্রভাব ফেলে।

**MySQL InnoDB: table নিজেই একটা B+tree (clustered index)।**
- InnoDB-তে প্রতিটা table **primary key দিয়ে সাজানো একটা B+tree**। এর leaf-এ পুরো row থাকে। একে বলে **clustered index**: data নিজেই index-এর ক্রমে রাখা।
- Primary key না দিলে InnoDB প্রথম UNIQUE আর NOT NULL index-টা নেয়; সেটাও না থাকলে নিজে একটা লুকানো row ID বানিয়ে তার উপর cluster করে।
- **Secondary index** (primary key ছাড়া বাকি সব index)-এর leaf-এ থাকে key আর সেই row-এর **primary key-র মান**। তাই \`WHERE email = ?\` হলে দুই ধাপ: secondary index-এ email খুঁজে PK পাওয়া, তারপর PK দিয়ে clustered index-এ আবার নেমে row আনা।

এর ফল:
- PK দিয়ে খোঁজা খুব দ্রুত, আর PK range (\`WHERE id BETWEEN ...\`) পাশাপাশি page-এ থাকে।
- **লম্বা primary key = সব secondary index মোটা**, কারণ প্রতিটা secondary entry-তে PK-র কপি থাকে। ৩৬-character-এর UUID string PK দিলে প্রতিটা index-এ প্রতি row-এ সেই ৩৬ byte।
- Random PK দিলে পুরো table-টাই (শুধু index না) এলোমেলো জায়গায় insert হয়, page split হয়।

**PostgreSQL: table একটা heap, সব index সমান।**
- Row থাকে **heap**-এ, মোটামুটি যে ক্রমে ঢুকেছে, কোনো key-র ক্রমে না।
- Primary key-র index সহ **প্রতিটা** index-এর leaf-এ থাকে row-এর physical ঠিকানা, **TID** (page নম্বর, page-এর ভেতরে slot)। কোনো "দুই ধাপ" নেই, যেকোনো index থেকে সরাসরি heap-এ।
- কিন্তু PostgreSQL-এ UPDATE আসলে row-এর নতুন version লেখে (MVCC, Day 26-এ বিস্তারিত), নতুন TID সহ। তাই সাধারণভাবে সব index-এ নতুন entry লাগে। ব্যতিক্রম **HOT update** (Heap-Only Tuple): যদি কোনো indexed column না বদলায় আর একই page-এ জায়গা থাকে, তাহলে index ছোঁয়া লাগে না। এজন্যই "অপ্রয়োজনীয় column-এ index" PostgreSQL-এ update-কেও ধীর করে: ওই column-এ index থাকলে HOT update আর সম্ভব না।
- \`CLUSTER\` command দিয়ে একবারের জন্য table-কে কোনো index-এর ক্রমে সাজানো যায়, কিন্তু পরের insert-এ সেই ক্রম আর রক্ষা হয় না।

**তাহলে "non-clustered index" মানে?** যেকোনো index, যার ক্রমে data physically রাখা নেই। একটা table-এ clustered index থাকতে পারে বড়জোর একটা (data তো একভাবেই সাজানো যায়), non-clustered যতগুলো খুশি।`,
      diagrams: [
        {
          id: "day-022-clustered",
          caption:
            "বামে InnoDB: secondary index থেকে PK, তারপর clustered index-এর leaf-এ পুরো row। ডানে PostgreSQL: সব index থেকে সরাসরি heap-এর TID।",
          alt: "দুই প্যানেল। বামে MySQL InnoDB: secondary index (email → PK 42) থেকে তীর clustered index-এ, যার leaf-এ পুরো row। ডানে PostgreSQL: users_pkey আর idx_email দুটো index থেকেই তীর একটা heap table-এর (17,3) ঠিকানায়।",
        },
      ],
    },
    {
      title: "Composite index আর leftmost-prefix rule",
      markdown: `**Composite (multi-column) index** একাধিক column-এর উপর একটা index। \`CREATE INDEX ON users (city, age)\` মানে entry-গুলো আগে \`city\` দিয়ে sorted, একই city-র ভেতরে \`age\` দিয়ে। ঠিক phone book-এর মতো: আগে পদবি, একই পদবির ভেতরে নাম।

এখান থেকেই **leftmost-prefix rule**: composite index কাজে লাগে যখন query বাম দিক থেকে টানা column-গুলো ব্যবহার করে। Phone book দিয়ে "সব 'রহমান' পদবি" খোঁজা সহজ, কিন্তু "সবার নাম 'করিম'" খুঁজতে পুরো বই উল্টাতে হয়, কারণ 'করিম'-রা সব পদবির ভেতরে ছড়িয়ে আছে।

Index \`(city, age, created_at)\` হলে:

| Query-র শর্ত | Index কাজে লাগে? |
|---|---|
| \`city = 'Dhaka'\` | ✅ প্রথম column |
| \`city = 'Dhaka' AND age = 30\` | ✅ প্রথম দুটো |
| \`city = 'Dhaka' AND age = 30 AND created_at > '2026-01-01'\` | ✅ তিনটাই |
| \`age = 30\` | ❌ সাধারণত না, প্রথম column বাদ |
| \`age = 30 AND created_at > ...\` | ❌ সাধারণত না |
| \`city = 'Dhaka' AND created_at > ...\` | ⚠️ আংশিক: city দিয়ে block পাওয়া যায়, কিন্তু age বাদ যাওয়ায় created_at দিয়ে আর সরাসরি জায়গায় পৌঁছানো যায় না, block-এর ভেতরে filter হয় |
| \`city = 'Dhaka' AND age > 30 AND created_at = ...\` | ⚠️ আংশিক: age-এ range-এর পরে created_at আর খোঁজার সীমা ছোট করে না |

শেষ লাইনটা গুরুত্বপূর্ণ: **range শর্ত যে column-এ, তার ডানের column আর খোঁজার পরিধি ছোট করতে পারে না।** তাই column-এর ক্রম ঠিক করার একটা কাজের নিয়ম (MongoDB-র docs একে বলে **ESR rule**):
1. **E**quality: \`=\` শর্তের column আগে
2. **S**ort: যে column-এ ORDER BY
3. **R**ange: \`>\`, \`<\`, BETWEEN-এর column শেষে

**ORDER BY-ও index দিয়ে।** Feed বা order list-এ সবচেয়ে প্রচলিত query:

\`\`\`sql
SELECT * FROM orders WHERE user_id = 42 ORDER BY created_at DESC LIMIT 20;
\`\`\`

Index \`(user_id, created_at)\` থাকলে database user 42-এর block-এ গিয়ে আগে থেকেই sorted entry থেকে শেষের ২০টা পড়ে থেমে যায়। কোনো sort নেই, user-এর ১০ হাজার order থাকলেও পড়া ২০টা। Index শুধু \`(user_id)\`-এ হলে ১০ হাজার row এনে sort করতে হতো। B-tree দুই দিকেই হাঁটতে পারে, তাই DESC-এর জন্য আলাদা index লাগে না (তবে একটা column ASC আর আরেকটা DESC মেশালে index-ও সেভাবে বানাতে হয়)।

**Column-এর ক্রম নিয়ে আরেকটা ভাবনা:** \`(a, b)\` index থাকলে শুধু \`(a)\`-এর index প্রায় অপ্রয়োজনীয়, কারণ \`(a, b)\` নিজেই \`a\`-এর query সামলায়। কিন্তু \`(b)\`-এর query সামলায় না।

**একটা ব্যতিক্রম (জেনে রাখুন, ভরসা করবেন না):** নতুন কিছু version-এ **skip scan** আছে: প্রথম column-এ যদি অল্প কয়েকটা আলাদা মান থাকে (যেমন ৮টা city), optimizer প্রতিটা মানের জন্য আলাদা করে লাফিয়ে খুঁজতে পারে। MySQL 8.0.13 থেকে আর PostgreSQL 18 থেকে এটা আছে। কিন্তু প্রথম column-এ লাখো আলাদা মান থাকলে এটা কাজে আসে না, তাই design করার সময় leftmost-prefix ধরেই চলুন।`,
      diagrams: [
        {
          id: "day-022-composite",
          caption:
            "একই (city, age) index: city দিয়ে খুঁজলে মিল একটানা এক জায়গায়, শুধু age দিয়ে খুঁজলে মিল পুরো index-জুড়ে ছড়ানো।",
          alt: "দুটো কলামে একই sorted index entry: (Barishal,25), (Barishal,30), (Dhaka,22), (Dhaka,30), (Dhaka,41), (Khulna,30), (Khulna,52), (Sylhet,19), (Sylhet,30)। বামে city = Dhaka-র তিনটা entry পাশাপাশি সবুজ; ডানে age = 30-এর চারটা entry বিভিন্ন জায়গায় লাল।",
        },
      ],
    },
    {
      title: "Covering index, selectivity, আর কখন index বেকার",
      markdown: `**Covering index ও Index Only Scan।** সাধারণ Index Scan-এ দুই ধাপ: index থেকে ঠিকানা, তারপর table থেকে row। কিন্তু query-র দরকারি **সব** column যদি index-এই থাকে, table-এ যাওয়ারই দরকার নেই।

\`\`\`sql
-- index (city, age) থাকলে
SELECT city, age FROM users WHERE city = 'Sylhet' AND age = 30;
-- → Index Only Scan, Heap Fetches: 0
\`\`\`

শুধু filter-এর জন্য না, শুধু বাড়তি column বয়ে বেড়ানোর জন্য PostgreSQL (11 থেকে) \`INCLUDE\` দেয়:

\`\`\`sql
CREATE INDEX idx_orders_user ON orders (user_id) INCLUDE (status, total);
\`\`\`

এখানে \`status\`, \`total\` leaf-এ থাকে কিন্তু sort-এর অংশ না। PostgreSQL-এ একটা শর্ত: row-টা সবার কাছে দৃশ্যমান কিনা জানতে **visibility map** দেখে; সাম্প্রতিক বদলানো page হলে তবুও heap-এ যায় (EXPLAIN-এ \`Heap Fetches\` গোনা)। নিয়মিত VACUUM হলে এটা কম থাকে। খরচ: index মোটা হয়, তাই শুধু সত্যিই গরম query-র জন্য।

**Selectivity আর cardinality।**
- **Cardinality**: column-এ কয়টা আলাদা মান। \`email\`: ১০ লাখ row-এ ১০ লাখ (খুব বেশি)। \`is_active\`: ২টা। \`gender\`: হাতে গোনা কয়েকটা।
- **Selectivity**: একটা শর্তে মোট row-এর কত অংশ মেলে। যত কম মেলে, selectivity তত "ভালো"।

\`WHERE is_active = true\` যদি ৯০% row মেলায়, index দিয়ে যাওয়া মানে ৯ লাখ বার index থেকে table-এর **এলোমেলো** page-এ লাফানো। তার চেয়ে পুরো table একটানা (sequential) পড়া সস্তা, কারণ disk আর OS ক্রমানুসারে পড়াকে অনেক দ্রুত করে। তাই optimizer index থাকলেও Seq Scan বেছে নেয়, আর সেটাই ঠিক। Lab-এ নিজে দেখবেন: \`is_active = true\` (৯০%) → Seq Scan, \`is_active = false\` (১০%) → index।

কোন সীমার পরে index লাভজনক না, তার নির্দিষ্ট কোনো সংখ্যা নেই: row-এর আকার, data-র physical ক্রম, cache, storage (SSD না HDD) সব মিলিয়ে optimizer cost হিসাব করে। সাধারণ ধারণা: শর্তে যত বেশি row মেলে, index-এর লাভ তত কমে।

**Low-cardinality column-এর বুদ্ধিমান সমাধান: partial index।** ধরুন \`orders\`-এর ৯৯% \`status = 'delivered'\`, আর worker বারবার খোঁজে \`'pending'\`-গুলো। পুরো status-এ index না দিয়ে:

\`\`\`sql
CREATE INDEX idx_orders_pending ON orders (created_at) WHERE status = 'pending';
\`\`\`

শুধু pending row-গুলো index-এ, তাই ছোট আর দ্রুত, আর delivered order-এর insert-এ এই index-এর কোনো খরচ নেই। Lab-এ ১০ লাখ row-এ এরকম একটা partial index মাত্র ~৭০০KB, অথচ পুরো email index ৩৯MB।

**Bitmap scan: মাঝামাঝি উপায়।** মাঝারি সংখ্যক row মিললে (যেমন ১০%) PostgreSQL প্রায়ই **Bitmap Index Scan → Bitmap Heap Scan** করে: আগে index থেকে কোন কোন page-এ মিল আছে তার একটা bitmap বানায়, তারপর সেই page-গুলো **physical ক্রমে** একবার করে পড়ে। এলোমেলো লাফ কমে। দুটো index-এর bitmap AND/OR করে মেলানোও যায়। Plan-এ \`Recheck Cond\` দেখলে বুঝবেন এটা।`,
    },
    {
      title: "EXPLAIN পড়া, আর index থাকা সত্ত্বেও কেন ব্যবহার হচ্ছে না",
      markdown: `\`EXPLAIN\` দেখায় optimizer কী করবে বলে **ঠিক করেছে** (অনুমান)। \`EXPLAIN ANALYZE\` query **আসলে চালায়** আর অনুমানের পাশে আসল সংখ্যা দেখায়। (সাবধান: UPDATE/DELETE-এ EXPLAIN ANALYZE সত্যিই data বদলায়, তাই transaction-এর ভেতরে চালিয়ে ROLLBACK করুন।)

PostgreSQL-এর চারটা প্রধান scan:

| Plan node | মানে | কখন |
|---|---|---|
| **Seq Scan** | পুরো table শুরু থেকে শেষ | index নেই, ছোট table, বা অনেক row মেলে |
| **Index Scan** | index-এ খুঁজে প্রতিটা মিলের জন্য table থেকে row | অল্প row মেলে |
| **Index Only Scan** | শুধু index থেকেই উত্তর | দরকারি সব column index-এ আছে |
| **Bitmap Heap Scan** | index থেকে page-এর তালিকা, তারপর page ক্রমে পড়া | মাঝারি সংখ্যক row, বা একাধিক index মেলানো |

একটা লাইন পড়তে শিখুন:

\`\`\`
Index Scan using idx_users_email on users  (cost=0.42..8.44 rows=1 width=51)
                                           (actual time=0.032..0.032 rows=1 loops=1)
\`\`\`

\`cost\` optimizer-এর নিজস্ব একক (millisecond না), \`rows=1\` হলো অনুমান, \`actual ... rows=1\` আসল। **অনুমান আর আসলের মধ্যে বিশাল ফারাক** (যেমন অনুমান ১০, আসল ৫ লাখ) মানে statistics পুরনো, আর optimizer ভুল plan বাছতে পারে। সমাধান \`ANALYZE table_name\`। PostgreSQL-এর autovacuum নিজেও মাঝে মাঝে ANALYZE করে, কিন্তু বড় bulk load-এর ঠিক পরে নিজে চালানো ভালো। MySQL-এ \`EXPLAIN\`-এর \`type: ALL\` মানে full table scan; MongoDB-র \`explain()\`-এ \`COLLSCAN\` বনাম \`IXSCAN\`।

**Index থাকা সত্ত্বেও কেন ব্যবহার হচ্ছে না? সবচেয়ে সাধারণ কারণ:**

1. **Column-এর উপর function বা হিসাব।** Index আছে \`email\`-এর উপর, কিন্তু query \`WHERE LOWER(email) = 'rahim@x.com'\`। Index-এ sorted আছে \`email\`, \`LOWER(email)\` না। একইভাবে \`WHERE DATE(created_at) = '2026-10-01'\` বা \`WHERE price * 1.15 > 1000\`। সমাধান দুটো: query-কে বদলান (\`created_at >= '2026-10-01' AND created_at < '2026-10-02'\`), নয়তো **expression index** বানান: \`CREATE INDEX ON users (LOWER(email));\` (MySQL 8.0.13 থেকে একে বলে functional key part।)
2. **LIKE-এর শুরুতে wildcard।** \`LIKE 'rah%'\` হলো prefix, sorted index-এ একটা range, তাই কাজ করে। \`LIKE '%rah'\` বা \`'%rah%'\`-এ শুরু জানা নেই, sorted ক্রম কোনো কাজে আসে না। (PostgreSQL-এ একটা ফাঁদ: database-এর collation "C" না হলে, যেমন \`en_US.utf8\`, সাধারণ B-tree index LIKE prefix-এও কাজ করে না; \`text_pattern_ops\` দিয়ে index বানাতে হয়। Lab-এ দেখবেন।) মাঝখানের লেখা খুঁজতে trigram (pg_trgm) GIN index বা full-text search লাগে, Day 34।
3. **Type mismatch।** Column \`VARCHAR\`, কিন্তু query-তে সংখ্যা: MySQL-এ \`WHERE phone = 1712345678\` (quote ছাড়া) দিলে প্রতিটা row-এর মান সংখ্যায় রূপান্তর করে তুলনা হয়, index বাদ।
4. **Leftmost column বাদ** (আগের অংশ)।
5. **Selectivity কম**: অনেক row মেলে, তাই Seq Scan আসলেই সস্তা।
6. **ছোট table**: কয়েকশো row-এর table কয়েকটা page-এই ধরে; পুরো পড়াই index-এর চেয়ে সস্তা। Test database-এ "index ব্যবহার হচ্ছে না" দেখে ঘাবড়াবেন না, production-আকারের data দিয়ে দেখুন।
7. **পুরনো statistics**: উপরে বললাম, \`ANALYZE\`।
8. **OR শর্ত আলাদা column-এ**: \`WHERE email = ? OR phone = ?\`, দুটো আলাদা index লাগে (PostgreSQL bitmap OR দিয়ে মেলাতে পারে), নয়তো Seq Scan।`,
    },
    {
      title:
        "Index-এর দাম: write amplification, অতিরিক্ত index, foreign key আর lock ছাড়া index বানানো",
      markdown: `**Write amplification।** Table-এ ৫টা secondary index থাকলে একটা INSERT মানে: heap/clustered-এ ১টা লেখা + ৫টা B+tree-তে ৫টা insert (প্রতিটায় সঠিক leaf খোঁজা, কখনো page split), আর এই সবকিছুর WAL/redo log। হিসাবটা দেখুন:

- ২,০০০ insert/s, ৫টা secondary index → সেকেন্ডে ২,০০০ × (১ + ৫) = **১২,০০০টা structure-এ লেখা**
- প্রতিটা index entry গড়ে ৪০ byte হলে, শুধু index-এ দিনে ২,০০০ × ৫ × ৪০ × ৮৬,৪০০ ≈ **৩৫ GB** নতুন data (WAL বাদেই)

DELETE-ও প্রতিটা index থেকে entry সরায় (বা মৃত চিহ্নিত করে), আর indexed column বদলানো UPDATE মানে পুরনো জায়গা থেকে সরিয়ে নতুন জায়গায় বসানো।

**অতিরিক্ত index-এর লক্ষণ ও চিকিৎসা:**
- **অব্যবহৃত index**: PostgreSQL-এ \`pg_stat_user_indexes\`-এ \`idx_scan = 0\` (অনেক দিন ধরে) মানে কেউ ব্যবহার করে না, কিন্তু প্রতিটা write-এ খরচ দিচ্ছে। (Replica-তে ব্যবহার হচ্ছে কিনা দেখে নিয়ে) সরিয়ে দিন।
- **Duplicate/redundant**: \`(a)\` আর \`(a, b)\` দুটোই থাকলে সাধারণত \`(a)\` বাড়তি।
- **"প্রতিটা column-এ একটা করে" index**: এক column-এর index সাধারণত multi-column query-কে ভালো সামলায় না। Query দেখে composite index design করুন, column দেখে না।

**Foreign key-তে index।** PostgreSQL primary key আর UNIQUE-এ নিজে index বানায়, কিন্তু **foreign key-র column-এ (referencing side) নিজে থেকে index বানায় না।** ফল:
- \`JOIN orders ON orders.user_id = users.id\` বা \`WHERE user_id = ?\` ধীর
- আরও খারাপ: \`users\` থেকে একটা row DELETE করলে database-কে দেখতে হয় কোনো order সেই user-কে refer করছে কিনা। Index না থাকলে প্রতিটা delete-এ পুরো \`orders\` table scan।

MySQL InnoDB এখানে আলাদা: foreign key-র column-এ index বাধ্যতামূলক, না থাকলে নিজেই বানিয়ে নেয়।

**Production-এ index বানানো: lock-এর ফাঁদ।** বড় table-এ PostgreSQL-এর সাধারণ \`CREATE INDEX\` চলার পুরো সময় table-এ **write আটকে রাখে** (read চলে)। ৫০ কোটি row-এ সেটা হয়তো আধা ঘণ্টা: আধা ঘণ্টা কোনো order নেওয়া যাবে না। সমাধান:

\`\`\`sql
CREATE INDEX CONCURRENTLY idx_orders_user ON orders (user_id);
\`\`\`

এটা write না আটকে index বানায়, কিন্তু দাম আছে: সময় বেশি লাগে (table দুবার scan করে), transaction block-এর ভেতরে চালানো যায় না, আর মাঝপথে fail করলে একটা **INVALID** index রয়ে যায়, যেটা write-এর খরচ নেয় কিন্তু query-তে কাজে আসে না। তখন \`DROP INDEX CONCURRENTLY\` করে আবার চেষ্টা করতে হয়। MySQL InnoDB-তে secondary index যোগ করা সাধারণত "online DDL", অর্থাৎ চলার সময় insert/update চলতে থাকে।

**কোন query-তে index লাগবে, বুঝবেন কিভাবে?** অনুমানে না, data দেখে: PostgreSQL-এর \`pg_stat_statements\` বা MySQL-এর slow query log থেকে সবচেয়ে বেশি মোট সময় নেওয়া query বের করুন, \`EXPLAIN ANALYZE\` চালান, তারপর index দিন। Day 21-এর মতো, access pattern আগে, design পরে।`,
    },
  ],

  tradeOffs: {
    markdown: `**কখন index দেবেন:** যে column দিয়ে বারবার WHERE, JOIN বা ORDER BY হয়; শর্তে অল্প অংশ row মেলে (high selectivity); table বড় আর read বেশি; uniqueness নিশ্চিত করতে হবে; foreign key column, যেখানে join বা parent delete হয়।

**কখন দেবেন না (বা ভাববেন):** খুব ছোট table; column-এর মান বেশিরভাগ row-এ একই (তখন partial index ভাবুন); write-heavy table, যেখানে খুব কম পড়া হয় (যেমন raw event log, শুধু লেখা হয়, মাঝে মাঝে batch-এ পড়া); যে query দিনে একবার চলে আর কয়েক সেকেন্ড নিলেও ক্ষতি নেই; যে index-এর কাজ আরেকটা composite index ইতিমধ্যে করছে।

প্রধান index ধরনগুলো পাশাপাশি:`,
    table: {
      headers: [
        "Index-এর ধরন",
        "কোন query-তে ভালো",
        "কী পারে না / সতর্কতা",
        "উদাহরণ",
      ],
      rows: [
        [
          "B-tree (default)",
          "=, <, >, BETWEEN, prefix LIKE, ORDER BY",
          "প্রায় সব কাজের; শুধু '%মাঝে%' খোঁজা বা খুব কম selectivity-তে বেকার",
          "CREATE INDEX ON users (email)",
        ],
        [
          "Hash",
          "শুধু =",
          "Range, sort, prefix পারে না; বেশিরভাগ ক্ষেত্রে B-tree-র চেয়ে বড় সুবিধা নেই",
          "CREATE INDEX ON sessions USING hash (token)",
        ],
        [
          "Composite",
          "একসাথে কয়েকটা column-এ শর্ত + ORDER BY",
          "Leftmost-prefix rule; column-এর ক্রম ভুল হলে বেকার",
          "(user_id, created_at)",
        ],
        [
          "Covering / INCLUDE",
          "Table-এ না গিয়ে Index Only Scan",
          "Index মোটা হয়; শুধু খুব গরম query-র জন্য",
          "(user_id) INCLUDE (status, total)",
        ],
        [
          "Partial",
          "ছোট একটা subset (pending order, active user)",
          "Query-র শর্ত index-এর WHERE-এর সাথে মিলতে হবে",
          "... WHERE status = 'pending'",
        ],
        [
          "Expression",
          "Function দিয়ে খোঁজা (LOWER, DATE)",
          "Query-তে ঠিক একই expression লিখতে হবে",
          "(LOWER(email))",
        ],
        [
          "GIN",
          "Array, JSONB, full-text: 'এই মান আছে কোন row-এ'",
          "Write ধীর, বড়; সাধারণ = / range-এর জন্য না",
          "USING gin (tags)",
        ],
        [
          "BRIN",
          "বিশাল, প্রাকৃতিক ক্রমের table (time-series)",
          "Data এলোমেলো হলে প্রায় বেকার; নিখুঁত না, তবে খুব ছোট",
          "USING brin (created_at)",
        ],
      ],
    },
  },

  industry: {
    markdown: `- **PostgreSQL** ছয় ধরনের built-in index দেয়: B-tree (default), Hash, GiST, SP-GiST, GIN আর BRIN। এর সাথে multicolumn, partial, expression index, INCLUDE দিয়ে covering index, আর Index Only Scan। Production-এ lock ছাড়া index বানানোর জন্য \`CREATE INDEX CONCURRENTLY\`, আর query plan দেখার জন্য \`EXPLAIN (ANALYZE, BUFFERS)\`। কোন index কতবার ব্যবহার হয়েছে তা দেখা যায় \`pg_stat_user_indexes\`-এ।
- **MySQL InnoDB**-তে প্রতিটা table primary key দিয়ে সাজানো একটা **clustered index**; PK না থাকলে প্রথম UNIQUE NOT NULL index, তাও না থাকলে একটা লুকানো row ID। প্রতিটা secondary index record-এ PK column-গুলো থাকে, তাই MySQL-এর docs নিজেই ছোট primary key রাখার পরামর্শ দেয়। Foreign key column-এ index লাগে, না থাকলে InnoDB নিজে বানায়।
- **MongoDB**-র index-ও B-tree। প্রতিটা collection-এ \`_id\`-এর উপর unique index নিজে থেকেই থাকে। Compound index-এ prefix rule আছে (index \`{a, b, c}\` দিয়ে \`{a}\` আর \`{a, b}\`-এর query চলে), আর column-এর ক্রমের জন্য docs **ESR (Equality, Sort, Range)** guideline দেয়। \`explain()\`-এ \`COLLSCAN\` মানে পুরো collection পড়া, \`IXSCAN\` মানে index।

সাধারণ ব্যবহার, প্রায় সব backend-এ:
- Login: \`users.email\`-এ UNIQUE index (প্রায়ই \`LOWER(email)\`-এর উপর)
- "আমার order": \`orders (user_id, created_at)\`, যাতে filter আর sort একসাথে index থেকে হয়
- Background worker-এর কাজ খোঁজা: \`WHERE status = 'pending'\`-এ partial index
- Search box: সাধারণ index না, full-text বা search engine (Day 34)
- Map-এ "কাছের দোকান": geo-spatial index (Day 35)

Tool: PostgreSQL-এর \`pg_stat_statements\` আর MySQL-এর slow query log দিয়ে ধীর query খুঁজে বের করা হয়, তারপর EXPLAIN দিয়ে কারণ।

*উৎস: PostgreSQL documentation (Chapter "Indexes": Index Types, Multicolumn Indexes, Indexes on Expressions, Partial Indexes, Index-Only Scans and Covering Indexes; "Using EXPLAIN"; CREATE INDEX, Building Indexes Concurrently); MySQL Reference Manual (InnoDB "Clustered and Secondary Indexes", FOREIGN KEY Constraints, Online DDL, EXPLAIN Output Format); MongoDB Manual (Indexes, Compound Indexes, The ESR Guideline, Explain Results)।*`,
  },

  mistakes: [
    {
      mistake:
        "প্রতিটা column-এ আলাদা আলাদা single-column index দেওয়া, ভেবে যে 'যত বেশি index তত দ্রুত'। Write ধীর হয়, storage দ্বিগুণ হয়, আর multi-column query-তে তবুও ভালো plan আসে না।",
      fix: "Column দেখে না, query দেখে index design করুন: সবচেয়ে বেশি চলা query-গুলোর জন্য ঠিক ক্রমের composite index, আর অব্যবহৃত index (idx_scan = 0) সরিয়ে ফেলুন।",
    },
    {
      mistake:
        "Composite index-এ column-এর ক্রম যেমন-তেমন দেওয়া, যেমন (created_at, user_id), অথচ query হলো WHERE user_id = ? ORDER BY created_at।",
      fix: "Leftmost-prefix আর ESR মেনে ক্রম দিন: equality column আগে, তারপর sort, শেষে range। এখানে (user_id, created_at)।",
    },
    {
      mistake:
        "Indexed column-কে function-এ মুড়ে দেওয়া: WHERE LOWER(email) = ?, WHERE DATE(created_at) = ?। Index চুপচাপ বাদ পড়ে, Seq Scan হয়।",
      fix: "Query-কে range-এ লিখুন (created_at >= দিন AND < পরের দিন), অথবা ঠিক সেই expression-এর উপর expression index বানান।",
    },
    {
      mistake:
        "Boolean বা অল্প কয়েকটা মানের column-এ (is_active, gender) index দিয়ে আশা করা query দ্রুত হবে।",
      fix: "যে মান অল্প row-এ আছে শুধু সেটার জন্য partial index দিন, অথবা সেই column-কে composite index-এর অংশ বানান।",
    },
    {
      mistake:
        "PostgreSQL-এ foreign key column-এ index না দেওয়া, ধরে নেওয়া যে FK দিলে নিজে থেকেই index হয়। Join ধীর, আর parent row delete করলে child table পুরোটা scan হয়।",
      fix: "Join বা parent delete হয় এমন প্রতিটা FK column-এ (orders.user_id) index দিন।",
    },
    {
      mistake:
        "Production-এর বড় table-এ সরাসরি CREATE INDEX চালানো। পুরো সময় write আটকে থাকে, checkout বন্ধ।",
      fix: "PostgreSQL-এ CREATE INDEX CONCURRENTLY ব্যবহার করুন, শেষে index VALID কিনা দেখুন; কম traffic-এর সময় চালান।",
    },
    {
      mistake:
        "ছোট test database-এ EXPLAIN দেখে সিদ্ধান্ত নেওয়া, অথবা বড় data load-এর পরে ANALYZE না চালানো।",
      fix: "Production-আকারের data-তে EXPLAIN ANALYZE দেখুন, আর estimated rows বনাম actual rows-এ বিশাল ফারাক থাকলে ANALYZE চালান।",
    },
  ],

  lab: [
    {
      title: "PostgreSQL চালু করুন",
      markdown: `Docker দিয়ে PostgreSQL 16 চালান, তারপর psql খুলুন:

\`\`\`bash
docker run -d --name pg-index -e POSTGRES_PASSWORD=secret postgres:16
# কয়েক সেকেন্ড অপেক্ষা করুন, তারপর দেখুন তৈরি কিনা
docker exec pg-index pg_isready -U postgres
docker exec -it pg-index psql -U postgres
\`\`\`

psql-এর ভেতরে প্রথমে timing চালু করুন, যাতে প্রতিটা command-এর সময় দেখা যায়:

\`\`\`sql
\\timing on
\`\`\`

আপনার machine-এ সময়ের সংখ্যা নিচের উদাহরণ থেকে আলাদা হবে; plan-এর ধরন (Seq Scan, Index Scan ইত্যাদি) একই আসা উচিত।`,
    },
    {
      title: "১০ লাখ row-এর একটা table বানান",
      markdown: `\`generate_series\` দিয়ে এক command-এ ১০ লাখ user ঢোকান (laptop-এ কয়েক সেকেন্ড লাগবে):

\`\`\`sql
CREATE TABLE users (
  id         BIGSERIAL PRIMARY KEY,
  email      TEXT        NOT NULL,
  city       TEXT        NOT NULL,
  age        INT         NOT NULL,
  is_active  BOOLEAN     NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

INSERT INTO users (email, city, age, is_active, created_at)
SELECT
  'User' || g || '@example.com',
  (ARRAY['Dhaka','Chattogram','Khulna','Rajshahi','Sylhet','Barishal','Rangpur','Mymensingh'])[1 + g % 8],
  18 + g % 50,
  g % 10 <> 0,
  now() - (g % 1000) * interval '1 hour'
FROM generate_series(1, 1000000) AS g;

VACUUM ANALYZE users;
SELECT pg_size_pretty(pg_relation_size('users')) AS table_size;
\`\`\`

খেয়াল করুন: email-এ ইচ্ছা করে বড় হাতের \`U\` (User1@example.com), পরে কাজে লাগবে। ৯০% user active। Table-এর আকার আসবে ~৮৩MB।`,
    },
    {
      title: "Index-এর আগে আর পরে: EXPLAIN ANALYZE",
      markdown: `আগে index ছাড়া একজন user খুঁজুন:

\`\`\`sql
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'User500000@example.com';
\`\`\`

এরকম কিছু দেখবেন:

\`\`\`
Gather  (... rows=1 ...)
  Workers Planned: 2
  ->  Parallel Seq Scan on users  (... rows=0 loops=3)
        Filter: (email = 'User500000@example.com'::text)
        Rows Removed by Filter: 333333
Execution Time: 16.366 ms
\`\`\`

তিনটা process (\`loops=3\`) মিলে প্রত্যেকে ~৩.৩ লাখ row বাদ দিয়েছে, অর্থাৎ **১টা row-এর জন্য ১০ লাখ row পড়া।** এবার index বানান আর আবার চালান:

\`\`\`sql
CREATE INDEX idx_users_email ON users (email);
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'User500000@example.com';
\`\`\`

\`\`\`
Index Scan using idx_users_email on users  (cost=0.42..8.44 rows=1 ...) (actual time=0.032..0.032 rows=1 loops=1)
  Index Cond: (email = 'User500000@example.com'::text)
Execution Time: 0.041 ms
\`\`\`

\`Filter\`-এর বদলে এখন \`Index Cond\`, আর সময় কয়েকশো গুণ কম। খেয়াল করুন, \`CREATE INDEX\` নিজে কয়েক সেকেন্ড নিয়েছে: index বানানোও একটা খরচ।`,
    },
    {
      title: "Function দিলে index বাদ: LOWER(email) আর expression index",
      markdown: `Login-এ case-insensitive খোঁজা খুব সাধারণ:

\`\`\`sql
EXPLAIN ANALYZE SELECT * FROM users WHERE LOWER(email) = 'user500000@example.com';
\`\`\`

\`email\`-এ index থাকা সত্ত্বেও আবার **Parallel Seq Scan**, কারণ index-এ sorted আছে \`email\`, \`LOWER(email)\` না। সমাধান, ঠিক সেই expression-এর উপর index:

\`\`\`sql
CREATE INDEX idx_users_email_lower ON users (LOWER(email));
ANALYZE users;
EXPLAIN ANALYZE SELECT * FROM users WHERE LOWER(email) = 'user500000@example.com';
\`\`\`

এবার \`Index Scan using idx_users_email_lower\`, \`Index Cond: (lower(email) = ...)\`। Expression index-এ ANALYZE দরকার, যাতে optimizer ওই expression-এর statistics পায়।`,
    },
    {
      title: "Composite index: leftmost-prefix আর Index Only Scan",
      markdown: `\`(city, age)\`-এর উপর একটা composite index:

\`\`\`sql
CREATE INDEX idx_users_city_age ON users (city, age);
VACUUM ANALYZE users;

-- ১. দুটো column-ই আছে
EXPLAIN ANALYZE SELECT * FROM users WHERE city = 'Sylhet' AND age = 30;
-- ২. শুধু প্রথম column
EXPLAIN ANALYZE SELECT * FROM users WHERE city = 'Sylhet';
-- ৩. শুধু দ্বিতীয় column
EXPLAIN ANALYZE SELECT * FROM users WHERE age = 30;
-- ৪. দরকারি সব column index-এই আছে
EXPLAIN ANALYZE SELECT city, age FROM users WHERE city = 'Sylhet' AND age = 30;
\`\`\`

যা দেখার কথা:
1. \`Bitmap Index Scan on idx_users_city_age\`: index ব্যবহার হয়েছে (৫,০০০ row মেলে, তাই bitmap)
2. আবার \`idx_users_city_age\` দিয়ে bitmap scan: প্রথম column, তাই leftmost-prefix মেনে চলে
3. **\`Parallel Seq Scan\`**: \`age\` দ্বিতীয় column, প্রথমটা বাদ, তাই index বেকার
4. **\`Index Only Scan\`** আর \`Heap Fetches: 0\`: table-এ যাওয়াই লাগেনি

(৩ নম্বরে PostgreSQL 18 বা তার পরের version-এ skip scan-এর কারণে plan আলাদা হতে পারে; এই lab-এ আমরা 16 ব্যবহার করছি।)`,
    },
    {
      title: "Selectivity, LIKE আর index-এর আকার",
      markdown: `**অল্প মানের column:**

\`\`\`sql
CREATE INDEX idx_users_active ON users (is_active);
ANALYZE users;
EXPLAIN ANALYZE SELECT * FROM users WHERE is_active = true;   -- ৯০% row
EXPLAIN ANALYZE SELECT * FROM users WHERE is_active = false;  -- ১০% row
\`\`\`

\`true\`-তে index থাকা সত্ত্বেও **\`Seq Scan\`** (৯ লাখ row-এর জন্য index দিয়ে লাফানোর চেয়ে পুরোটা পড়া সস্তা), \`false\`-এ \`Bitmap Index Scan on idx_users_active\`। Optimizer ঠিক কাজটাই করছে।

**LIKE prefix বনাম শুরুতে %:**

\`\`\`sql
EXPLAIN ANALYZE SELECT * FROM users WHERE email LIKE 'User5000%';
\`\`\`

\`idx_users_email\` থাকা সত্ত্বেও Seq Scan! কারণ Docker image-এর database collation \`C\` না (দেখুন: \`SELECT datcollate FROM pg_database WHERE datname = current_database();\`), আর তখন সাধারণ B-tree LIKE-এ কাজ করে না। Pattern-এর জন্য বিশেষ index, এবার production-এর মতো lock ছাড়া:

\`\`\`sql
CREATE INDEX CONCURRENTLY idx_users_email_pattern ON users (email text_pattern_ops);
EXPLAIN ANALYZE SELECT * FROM users WHERE email LIKE 'User5000%';
EXPLAIN ANALYZE SELECT * FROM users WHERE email LIKE '%5000@example.com';
\`\`\`

Prefix-এ \`Index Scan using idx_users_email_pattern\` (\`Index Cond: email ~>=~ 'User5000' AND email ~<~ 'User5001'\`, অর্থাৎ একটা range), কিন্তু শুরুতে \`%\` দিলে আবার Seq Scan।

**প্রতিটা index-এর আকার:**

\`\`\`sql
SELECT indexrelname AS index_name,
       pg_size_pretty(pg_relation_size(indexrelid)) AS size,
       idx_scan
FROM pg_stat_user_indexes
WHERE relname = 'users'
ORDER BY pg_relation_size(indexrelid) DESC;

SELECT pg_size_pretty(pg_relation_size('users')) AS table_size,
       pg_size_pretty(pg_indexes_size('users'))  AS all_indexes;
\`\`\`

\`idx_users_email\` ~৩৯MB, আর সব index মিলিয়ে table-এর (~৮৩MB) চেয়েও বড়। \`idx_scan\` column বলে কোন index কতবার ব্যবহার হয়েছে, production-এ অব্যবহৃত index খোঁজার এটাই উপায়।

শেষে পরিষ্কার করুন (psql থেকে \`\\q\` দিয়ে বের হয়ে):

\`\`\`bash
docker rm -f pg-index
\`\`\``,
    },
  ],

  connections: {
    markdown: `- **Day 7 · Latency vs Throughput**: Index একটা query-র latency কমায় (কম page পড়া), আর database-এর CPU/disk বাঁচিয়ে একই hardware-এ বেশি query (throughput) চালাতে দেয়। উল্টো দিকে write-এর latency একটু বাড়ায়।
- **Day 10 · Databases**: সেখানে database কী আর কেন, তা দেখেছিলাম। আজ দেখলাম ভেতরে query কিভাবে row খুঁজে পায়।
- **Day 17 · Caching**: B+tree-র root আর internal page প্রায় সবসময় buffer cache-এ থাকে, তাই lookup-এ disk read আরও কমে। Index আর cache একসাথে কাজ করে।
- **Day 19 · Capacity Estimation**: Index-এর আকার আর write amplification-এর হিসাব একই napkin math।
- **Day 20 · SQL vs NoSQL**: Index-এর ধারণা দুই জগতেই একই। MongoDB-তেও B-tree index আর compound index-এর prefix rule।
- **Day 21 · Data Modeling**: সেখানে বলেছিলাম access pattern আগে ঠিক করতে। Index হলো সেই access pattern-কে দ্রুত করার হাতিয়ার: কোন query বারবার চলবে, সেটাই ঠিক করে কোন index লাগবে।

সামনে যা আসছে: Day 23-এ B-tree বনাম LSM-tree storage engine (write-heavy workload-এর জন্য ভিন্ন পথ), Day 24-এ Bloom Filter (LSM-এ অপ্রয়োজনীয় disk read এড়ানো), Day 26-এ Transactions ও MVCC (কেন PostgreSQL-এ update নতুন row version লেখে), Day 29-এ Sharding (shard key ছাড়া query আর global secondary index-এর সমস্যা), Day 32-এ Unique ID Generation (random বনাম time-ordered ID, B-tree-র insert-এ তার প্রভাব), Day 34-এ Inverted Index (search), আর Day 35-এ Geo-spatial Indexing।`,
  },

  explainYourself: [
    {
      question:
        'আপনার teammate বলছে, "ধীর query? সব WHERE-এর column-এ index দিয়ে দাও, সমস্যা শেষ।" আপনি কী বলবেন?',
      idealAnswer:
        "আংশিক ঠিক, কিন্তু বিপজ্জনক সরলীকরণ। Index read দ্রুত করে, কিন্তু প্রতিটা index প্রতিটা insert/delete আর indexed column-এর update-এ বাড়তি লেখা আর storage খরচ আনে। তার উপর আলাদা আলাদা single-column index সাধারণত multi-column শর্ত ভালো সামলায় না; query দেখে ঠিক ক্রমের composite index লাগে (leftmost-prefix, ESR)। কম selectivity-র column (is_active)-এ index প্রায়ই optimizer ব্যবহারই করে না। আর function দিয়ে মোড়া column-এ index বাদ পড়ে। তাই আগে EXPLAIN ANALYZE দিয়ে দেখা, তারপর সবচেয়ে গরম query-র জন্য অল্প কয়েকটা সঠিক index।",
    },
    {
      question:
        "১০ কোটি row-এর table, তবু একটা index lookup মাত্র ৩-৪টা page পড়ে। কিভাবে সম্ভব?",
      idealAnswer:
        "B+tree-র প্রতিটা node একটা disk page, আর একটা page-এ কয়েকশো key ও child pointer ধরে, অর্থাৎ fan-out কয়েকশো। Fan-out ১০০ হলেও ৪ level-এ ১০০⁴ = ১০ কোটি entry ধরা যায়, তাই root থেকে leaf পর্যন্ত ৪টা page। Root আর internal page সংখ্যায় অল্প আর সবচেয়ে বেশি ব্যবহৃত, তাই সাধারণত memory-তে থাকে; বাস্তবে disk-এ যেতে হয় হয়তো শুধু leaf আর table page-এর জন্য। Binary tree হলে একই data-য় ~২৭ level লাগত।",
    },
    {
      question:
        "email column-এ index আছে, কিন্তু WHERE LOWER(email) = ? query Seq Scan করছে। কেন, আর দুটো সমাধান কী?",
      idealAnswer:
        "Index-এ sorted আছে email-এর আসল মান, LOWER(email)-এর মান না। Database প্রতিটা row-এ LOWER() হিসাব না করে জানতে পারে না কোনটা মেলে, তাই পুরো table পড়ে। সমাধান এক: ঠিক সেই expression-এর উপর expression index, CREATE INDEX ON users (LOWER(email)), তারপর ANALYZE। সমাধান দুই: লেখার সময়ই email lowercase করে রাখা, যাতে query-তে function লাগেই না (বা PostgreSQL-এ citext type)। একই নিয়ম DATE(created_at)-এর মতো যেকোনো function-এ; সেখানে query-কে range-এ লিখে ফেলাই সবচেয়ে সহজ।",
    },
  ],

  interviewQuestions: [
    {
      question:
        "Database index কী, আর কেন এটা query দ্রুত করে কিন্তু write ধীর করে?",
      answerOutline: `- Index = আলাদা sorted structure (সাধারণত B+tree): key → row pointer
- Index ছাড়া: full table scan, O(n); index দিয়ে: O(log n), বাস্তবে ৩-৪ page (fan-out কয়েকশো)
- Range ও ORDER BY-ও কাজ করে, কারণ sorted আর leaf linked
- Write খরচ: প্রতিটা insert/delete/indexed update-এ প্রতিটা index update, page split, WAL; storage ও memory খরচ
- উপসংহার: read-heavy, selective query-র জন্য; সংখ্যা মেপে (EXPLAIN ANALYZE, pg_stat_statements) সিদ্ধান্ত`,
    },
    {
      question: "B-tree আর hash index-এর পার্থক্য কী? কখন কোনটা?",
      answerOutline: `- B-tree: sorted, =, range, prefix LIKE, ORDER BY, MIN/MAX সব পারে; default
- Hash: key hash করে bucket; শুধু =; range/sort পারে না
- বাস্তবে B-tree-ই প্রায় সবসময় যথেষ্ট, O(log n) আর ৩-৪ page পার্থক্য সামান্য
- In-memory hash (যেমন Redis-এর key lookup) আলাদা জিনিস; disk-এর database index-এ B-tree রাজত্ব করে
- বোনাস: B+tree বনাম LSM-tree আলাদা প্রশ্ন (storage engine), write-heavy হলে LSM`,
    },
    {
      question:
        "orders table-এ এই query ধীর: WHERE user_id = ? AND status = 'paid' ORDER BY created_at DESC LIMIT 20। কোন index দেবেন, কেন?",
      answerOutline: `- আগে EXPLAIN ANALYZE: Seq Scan? sort হচ্ছে? rows estimate ঠিক?
- ESR: equality column আগে (user_id, status), তারপর sort column (created_at)
- Index: (user_id, status, created_at) → user আর status-এর block-এ গিয়ে sorted ক্রমে শেষ ২০টা, কোনো sort নেই
- বিকল্প: status-এ selectivity খুব কম হলে (user_id, created_at) দিয়ে filter; বা paid-এর জন্য partial index
- দরকারি column কম হলে INCLUDE দিয়ে Index Only Scan
- Trade-off: orders write-heavy, তাই অপ্রয়োজনীয় বা redundant index সরানো`,
    },
    {
      question:
        "Clustered আর non-clustered index-এর পার্থক্য কী? MySQL আর PostgreSQL-এ কিভাবে কাজ করে?",
      answerOutline: `- Clustered: data নিজেই index-এর ক্রমে রাখা; table-এ বড়জোর একটা
- InnoDB: table = PK-র B+tree, leaf-এ পুরো row; secondary index-এ PK থাকে → দুই ধাপের lookup
- ফল: ছোট, ক্রমবর্ধমান PK ভালো; লম্বা/random PK সব index মোটা করে আর split বাড়ায়
- PostgreSQL: heap table, সব index (PK সহ) TID রাখে; CLUSTER একবারের
- PostgreSQL-এ update নতুন TID → index update, ব্যতিক্রম HOT update
- Covering index দিয়ে দুই ধাপ এড়ানো যায় (Index Only Scan)`,
    },
    {
      question:
        "Index বানালেন, কিন্তু query plan এখনো Seq Scan দেখাচ্ছে। কী কী কারণ হতে পারে, আর কিভাবে খুঁজবেন?",
      answerOutline: `- Column-এ function/expression বা type mismatch → expression index বা query বদলানো
- LIKE '%...' (আর PostgreSQL-এ non-C collation-এ prefix LIKE-এর জন্য text_pattern_ops)
- Composite index-এর leftmost column বাদ
- কম selectivity: অনেক row মেলে, seq scan আসলেই সস্তা (এটা bug না)
- ছোট table, বা test data-য় দেখা
- পুরনো statistics: estimated বনাম actual rows মিলিয়ে দেখা → ANALYZE
- Index INVALID (CONCURRENTLY fail করেছিল)
- যাচাই: EXPLAIN ANALYZE, pg_stat_user_indexes-এর idx_scan`,
    },
  ],

  summary: {
    points: [
      "Index হলো আলাদা sorted structure (সাধারণত B+tree): key আর row-এর ঠিকানা; এটা না থাকলে একটা row খুঁজতেও পুরো table পড়তে হয় (O(n))।",
      "B+tree-র fan-out কয়েকশো, তাই কোটি row-এও ৩-৪ ধাপে row পাওয়া যায়; leaf linked, তাই range আর ORDER BY-ও সস্তা।",
      "InnoDB-তে table নিজেই PK-র clustered index আর secondary index-এ PK থাকে; PostgreSQL-এ table heap, সব index TID রাখে।",
      "Composite index বাম দিক থেকে কাজ করে (leftmost-prefix); ক্রম: equality → sort → range।",
      "দরকারি সব column index-এ থাকলে Index Only Scan; কম selectivity-র column-এ index প্রায় বেকার, partial index ভাবুন।",
      "Column-এ function, শুরুতে % দেওয়া LIKE, type mismatch আর পুরনো statistics index বাদ দেওয়ায়; EXPLAIN ANALYZE দিয়ে যাচাই করুন।",
      "প্রতিটা index প্রতিটা write-এর খরচ বাড়ায়; অব্যবহৃত index সরান, FK-তে index দিন, production-এ CREATE INDEX CONCURRENTLY।",
    ],
    diagram: {
      id: "day-022-summary",
      caption: "এক নজরে Database Indexes",
      alt: "একটা query সরাসরি B+tree index-এ গিয়ে O(log n)-এ row-এর ঠিকানা পায়, তারপর table-এর row; পাশে ভাঙা লাল দাগে index ছাড়া Seq Scan O(n)।",
    },
  },
};
