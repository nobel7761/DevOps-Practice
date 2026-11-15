// Day 10 · Databases — Phase 1 introduction to the whole database part of the course.

import { topicHrefForDay } from "@/lib/data/courses/system-design-a-z";
import type { SdLesson } from "@/lib/system-design/lesson.types";

export const day010Lesson: SdLesson = {
  topicId: "sd-day-010",
  day: 10,
  title: "Databases",
  definition:
    "Database হলো এমন একটা system, যেটা data স্থায়ীভাবে রাখে, অনেকজন একসাথে পড়া-লেখা করলেও সেটা ঠিক রাখে, crash-এর পরেও কিছু হারায় না, আর প্রশ্ন (query) করলে দ্রুত উত্তর দেয়।",

  objectives: [
    "Data সরাসরি file-এ (JSON/CSV) রাখলে কোথায় কোথায় ভাঙে (একসাথে লেখা, crash, query, ভুল data), আর database প্রতিটা কিভাবে সামলায়, উদাহরণ দিয়ে বলতে পারবেন।",
    "Table, row, primary key, foreign key আর constraint দিয়ে একটা ছোট online shop-এর schema বানিয়ে SELECT, JOIN আর GROUP BY দিয়ে প্রশ্নের উত্তর বের করতে পারবেন।",
    "একটা bKash-ধাঁচের টাকা পাঠানোর উদাহরণে transaction আর ACID-এর প্রতিটা অক্ষর কোন বিপদ ঠেকায়, আর Write-Ahead Log কিভাবে crash-এর পরেও committed data ফিরিয়ে আনে, ধাপে ধাপে ব্যাখ্যা করতে পারবেন।",
    "Key-value, document, wide-column আর graph database কোন ধরনের সমস্যার জন্য, আর OLTP বনাম OLAP-এর পার্থক্য চিনে, brand না দেখে প্রশ্ন করে database বাছতে পারবেন।",
    "Connection pool কেন লাগে, Little's Law দিয়ে pool-এর আকার আন্দাজ করা, আর N+1 query সমস্যা ধরে ঠিক করা, এগুলো করতে পারবেন।",
  ],

  prerequisites: [
    { day: 2, title: "Client, Server ও Internet", href: topicHrefForDay(2) },
    { day: 4, title: "API কী? REST-এর বেসিক", href: topicHrefForDay(4) },
    { day: 5, title: "Scalability", href: topicHrefForDay(5) },
  ],

  problem: {
    markdown: `সুমন "হাটবাজার" নামে একটা ছোট online মুদি দোকান খুলল। Node.js-এ একটা server, আর database? "এত ঝামেলা কেন, একটা \`orders.json\` file-এই তো হয়।" প্রতিটা order এলে server:

1. পুরো \`orders.json\` পড়ে
2. JSON parse করে, নতুন order array-তে যোগ করে
3. পুরো file আবার disk-এ লিখে ফেলে

প্রথম মাসে দিনে বিশটা order, সব ঠিক। তারপর ঈদের আগের সপ্তাহে সমস্যাগুলো একে একে এলো।

**১. Order হারিয়ে যাচ্ছে।** রহিম আর করিম প্রায় একই মুহূর্তে order দিল। দুটো request-ই file পড়ল, দুটোতেই ৪১টা order। রহিমের request ৪১ + রহিম লিখল। কয়েক millisecond পরে করিমের request ৪১ + করিম লিখল, রহিমের লেখার উপর দিয়ে। File-এ ৪২টা order, রহিমেরটা নেই। রহিম টাকা দিয়েছে, অথচ দোকানের কাছে তার কোনো রেকর্ড নেই। একে বলে **lost update**।

**২. লোডশেডিং-এ পুরো দোকান বন্ধ।** File লেখার মাঝপথে server-এর বিদ্যুৎ চলে গেল। Disk-এ রইল অর্ধেক লেখা file: শেষে একটা ভাঙা \`{"id": 42, "cust\`। পরের দিন server চালু হলো, কিন্তু JSON parse error, কোনো order-ই আর পড়া যাচ্ছে না। একটা crash পুরো ইতিহাস নষ্ট করে দিল।

**৩. সহজ প্রশ্নের উত্তর দিতে ঘাম ছুটছে।** "গত মাসে ঢাকার customer-রা মোট কত টাকার কিনেছে?" এর জন্য প্রতিবার পুরো file (এখন ৮০০MB) memory-তে তুলে loop চালাতে হয়। একজন admin report খুললে বাকি সব customer-এর page ধীর হয়ে যায়।

**৪. ভুল data ঢুকে বসে আছে।** একটা bug-এ order-এ \`customer_id: 999\` লেখা, অথচ ৯৯৯ নামে কোনো customer নেই। কোথাও quantity \`-2\`। চা পাতার stock \`-3\`। File কোনো নিয়ম জানে না, যা দেওয়া হয় তাই রাখে।

**৫. অর্ধেক কাজ।** Order-এর সময় server আগে stock কমায়, তারপর order লেখে। মাঝখানে crash হলে stock কমে গেল, কিন্তু order নেই। আবার উল্টোটা হলে order আছে, stock কমেনি, ফলে যা নেই তাও বিক্রি হচ্ছে।

সুমন প্রতিটার জন্য আলাদা জোড়াতালি দিতে পারত: file lock, temp file লিখে rename, নিজের index, নিজের validation। কিন্তু তাহলে সে আসলে নিজেই একটা (খারাপ) database বানাচ্ছে। এই পাঁচটা সমস্যা প্রায় প্রতিটা app-এ আসে, আর এগুলোর সমাধান কয়েক দশক ধরে পরীক্ষিত হয়ে **database**-এর ভেতরে বসানো আছে।`,
    diagrams: [
      {
        id: "day-010-before",
        caption:
          "আগে: দুটো request একই JSON file পড়ে-লেখে, পরের লেখা আগেরটা মুছে দেয়; আর লেখার মাঝে crash হলে file-টাই ভেঙে যায়।",
        alt: "একটা সময়-ছক: t1-এ Request A file পড়ে ৪১টা order পায়, t2-তে Request B-ও ৪১টা পায়, t3-এ A ৪১ যোগ রহিম লেখে, t4-এ B ৪১ যোগ করিম লেখে, ফলে file-এ রহিমের order নেই। নিচে একটা বাক্সে লেখার মাঝে বিদ্যুৎ যাওয়ায় অর্ধেক লেখা ভাঙা JSON দেখানো।",
      },
    ],
  },

  analogy: {
    markdown: `পাড়ার মুদি দোকানের বাকির খাতা আর ব্যাংকের শাখার হিসাব, দুটোই "হিসাব রাখা"। কিন্তু দুটোর ভরসা এক না।

**মুদি দোকানের খাতা (= file):** কাউন্টারে খোলা পড়ে থাকে। দোকানদার আর তার ছেলে একসাথে একই পাতায় লিখলে একজনের লেখা আরেকজনের উপর পড়ে। চায়ের কাপ উল্টে পাতা ভিজলে সেই পাতার হিসাব শেষ। "রহিম চাচার মোট বাকি কত?" জানতে সব পাতা উল্টাতে হয়। আর কেউ ভুল করে এমন লোকের নামে বাকি লিখলে যে কখনো দোকানে আসেনি, খাতা কিছু বলে না।

**ব্যাংকের শাখা (= database):**
- **Cashier আগে register-এ লেখে, তারপর টাকা দেয়।** টাকা দেওয়ার মাঝখানে বিদ্যুৎ গেলেও register-এ লেখা আছে কী হয়েছিল, পরে মিলিয়ে নেওয়া যায়। এটাই database-এর **Write-Ahead Log (WAL)**।
- **নিয়ম আছে।** Account নম্বর না থাকলে জমা নেবে না, balance-এর বেশি তুলতে দেবে না। এটা **constraint**।
- **Transfer মানে দুটো voucher, একসাথে।** এক account থেকে debit আর আরেকটায় credit, হয় দুটোই, নয় কোনোটাই না। এটা **transaction**।
- **কাউন্টার অনেক, কিন্তু এক account-এ একসাথে দুজন হাত দেয় না।** দুই কাউন্টার একই account থেকে একসাথে টাকা তুলতে গেলে একজনকে অপেক্ষা করতে হয়। এটা **isolation**।
- **দিন শেষে মূল ledger হালনাগাদ হয়।** প্রতিটা লেনদেনে মোটা ledger বই খুলে লেখা ধীর, তাই আগে register-এ, পরে একসাথে ledger-এ। Database-ও আগে log-এ লেখে, data file পরে হালনাগাদ করে।

Database হলো সেই ব্যাংকের শাখা, যেটা আপনার app-এর data-র জন্য দিনরাত চলে।`,
    diagrams: [
      {
        id: "day-010-analogy",
        caption:
          "মুদি দোকানের খোলা খাতা বনাম ব্যাংকের শাখা: cashier আগে register-এ লেখে, তারপর টাকা দেয়; নিয়ম আর জোড়া voucher হিসাব ঠিক রাখে।",
        alt: "বামে মুদি দোকানের খোলা খাতা, তিনটা সমস্যা লেখা: দুজন একই পাতায় লেখে, পাতা ভিজলে হিসাব শেষ, মোট বাকি জানতে সব পাতা উল্টাতে হয়। ডানে ব্যাংক: গ্রাহক থেকে cashier, cashier প্রথমে register-এ লেখে (WAL), তারপর টাকা দেয় (COMMIT-এর OK); নিচে নিয়ম আর জোড়া voucher-এর কথা।",
      },
    ],
  },

  coreConcept: {
    markdown: `### Database আর DBMS

কথায় আমরা দুটোকেই "database" বলি, কিন্তু আলাদা জিনিস:
- **DBMS (Database Management System)**: software-টা, যেটা data রাখে আর সামলায়। যেমন PostgreSQL, MySQL, SQLite, MongoDB।
- **Database**: সেই software-এর ভেতরে রাখা আপনার data-র সংগ্রহ। যেমন PostgreSQL server-এর ভেতরে \`hatbazar\` নামের database।

একটা PostgreSQL server-এ অনেকগুলো database থাকতে পারে, প্রতিটায় অনেকগুলো table।

### File-এর বদলে কেন database

সমস্যার পাঁচটা ভাগের প্রতিটার জন্য database একটা করে জিনিস দেয়:

| File-এ সমস্যা | Database যা দেয় |
| --- | --- |
| দুজন একসাথে লিখলে একজনের লেখা হারায় | **Concurrency control**: lock আর isolation, যাতে একসাথে চললেও ফল ঠিক থাকে |
| লেখার মাঝে crash হলে file ভাঙে | **Crash safety ও durability**: log আগে, তাই restart-এ নিজে থেকে ঠিক হয় |
| প্রতিটা প্রশ্নে পুরো file পড়া | **Query language ও index**: শুধু দরকারি অংশ পড়া ([Day 22](${topicHrefForDay(22)})) |
| ভুল data চুপচাপ ঢুকে যায় | **Integrity**: type, NOT NULL, UNIQUE, CHECK, foreign key |
| অর্ধেক কাজ হয়ে থেমে যায় | **Transaction**: হয় সব, নয় কিছুই না |

এর সাথে বোনাস: কে কোন data দেখতে পারবে (permission), backup, আর replication-এর tool।

### Relational model: table, row, column

সবচেয়ে প্রচলিত ধরন **relational database**। Data থাকে **table**-এ, অনেকটা Excel sheet-এর মতো:
- **Column**: একটা বৈশিষ্ট্য, নির্দিষ্ট type সহ। যেমন \`name TEXT\`, \`price NUMERIC(10,2)\`।
- **Row**: একটা জিনিসের পুরো রেকর্ড। যেমন একজন customer।
- **Schema**: কোন table-এ কোন column, কোন type, কোন নিয়ম, তার আগে থেকে ঠিক করা নকশা।

হাটবাজারের জন্য চারটা table:

\`\`\`sql
CREATE TABLE customers (
  id    SERIAL PRIMARY KEY,
  name  TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  city  TEXT NOT NULL
);

CREATE TABLE products (
  id    SERIAL PRIMARY KEY,
  name  TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL CHECK (price > 0),   -- টাকায়
  stock INT NOT NULL CHECK (stock >= 0)
);

CREATE TABLE orders (
  id          SERIAL PRIMARY KEY,
  customer_id INT NOT NULL REFERENCES customers(id),
  status      TEXT NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE order_items (
  order_id   INT NOT NULL REFERENCES orders(id),
  product_id INT NOT NULL REFERENCES products(id),
  quantity   INT NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(10,2) NOT NULL,
  PRIMARY KEY (order_id, product_id)
);
\`\`\`

এখানে কয়েকটা জরুরি ধারণা:
- **Primary Key (PK)**: প্রতিটা row-এর অনন্য পরিচয়। দুটো customer-এর \`id\` কখনো এক হবে না, ফাঁকাও থাকবে না। \`order_items\`-এ PK দুই column মিলিয়ে (composite key): এক order-এ একটা product একবারই আসবে।
- **Foreign Key (FK)**: অন্য table-এর PK-র দিকে ইশারা। \`orders.customer_id REFERENCES customers(id)\` মানে database নিশ্চিত করবে, ওই customer সত্যিই আছে। ৯৯৯ নম্বর customer-এর order আর ঢুকবে না, আর যে customer-এর order আছে তাকে মুছতেও দেবে না।
- **Constraint**: database-এর নিজের পাহারা। \`NOT NULL\` (ফাঁকা না), \`UNIQUE\` (একই phone দুবার না), \`CHECK\` (stock ঋণাত্মক না)। App-এর code-এ bug থাকলেও ভুল data ঢুকতে পারে না।

**Price কেন \`NUMERIC\`, \`FLOAT\` না?** Float-এ ০.১ + ০.২ ঠিক ০.৩ হয় না। টাকার হিসাবে এক পয়সার ভুলও ভুল। তাই টাকা রাখুন \`NUMERIC\`-এ, অথবা পয়সায় integer হিসেবে।

**\`order_items\`-এ আবার \`unit_price\` কেন?** কারণ চালের দাম কাল বদলাবে, কিন্তু আজকের order-এ যে দামে বিক্রি হয়েছে সেটা বদলানো উচিত না। এটা ইচ্ছাকৃত, ইতিহাস ধরে রাখার জন্য।

### Normalization: একটা তথ্য, একটা জায়গায়

ধরুন প্রতিটা order-এর row-তে customer-এর নাম, phone আর ঠিকানাও লিখে রাখলেন। রহিম ঠিকানা বদলালে তার ৫০টা order-এর row বদলাতে হবে। একটা বাদ পড়লে দুই জায়গায় দুই ঠিকানা, কোনটা ঠিক কেউ জানে না।

**Normalization** মানে data এমনভাবে ভাগ করা, যাতে প্রতিটা তথ্য একবারই থাকে, আর বাকিরা id দিয়ে সেটার দিকে ইশারা করে। Customer-এর তথ্য \`customers\`-এ, order শুধু \`customer_id\` রাখে। এর দাম: পড়ার সময় table জোড়া লাগাতে হয় (JOIN)। কখন ইচ্ছা করে কিছু তথ্য দুই জায়গায় রাখা (denormalization) লাভজনক, সেটা data modeling-এর প্রশ্ন। এখন এটুকু জানলেই চলবে, [Day 21](${topicHrefForDay(21)})-এ গভীরে যাব।

### SQL: কী চাই বলুন, কিভাবে আনবে database ঠিক করবে

**SQL** declarative ভাষা: আপনি বলেন কোন data চাই, database-এর **query planner** ঠিক করে কোন index, কোন ক্রমে, কিভাবে আনবে।

\`\`\`sql
-- নতুন data
INSERT INTO customers (name, phone, city) VALUES ('Rahim', '01711000001', 'Dhaka');

-- পড়া, শর্ত দিয়ে
SELECT name, city FROM customers WHERE city = 'Dhaka';

-- বদলানো (WHERE ভুলে গেলে সব row বদলে যাবে!)
UPDATE products SET price = 430 WHERE id = 1;

-- মোছা
DELETE FROM orders WHERE id = 3;

-- JOIN: কয়েকটা table জোড়া লাগিয়ে প্রতিটা order-এর মোট টাকা
SELECT o.id, c.name, SUM(oi.quantity * oi.unit_price) AS total_taka
FROM orders o
JOIN customers   c  ON c.id = o.customer_id
JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, c.name;

-- GROUP BY: শহর অনুযায়ী মোট বিক্রি
SELECT c.city, SUM(oi.quantity * oi.unit_price) AS revenue_taka
FROM customers c
JOIN orders o       ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
GROUP BY c.city;
\`\`\`

সুমনের "ঢাকার মোট বিক্রি" প্রশ্ন এখন এক query। পুরো data memory-তে আনতে হয় না; database নিজেই হিসাব করে শুধু ফল পাঠায়।

**JOIN-এর ধরন এক লাইনে:** \`JOIN\` (INNER) শুধু যেসব row-এর দুই পাশে মিল আছে; \`LEFT JOIN\` বাম table-এর সব row রাখে, মিল না থাকলে ডান পাশ NULL। "কোন customer এখনো কিছু কেনেনি?" জানতে LEFT JOIN লাগে।

### Transaction আর ACID: bKash-এ টাকা পাঠানো

রহিম করিমকে ৫০০ টাকা পাঠাবে। Database-এ দুটো কাজ:

\`\`\`sql
BEGIN;
UPDATE wallets SET balance = balance - 500 WHERE phone = '01711000001';  -- রহিম
UPDATE wallets SET balance = balance + 500 WHERE phone = '01811000002';  -- করিম
COMMIT;
\`\`\`

\`BEGIN\` থেকে \`COMMIT\` পর্যন্ত সব মিলে একটা **transaction**: database-এর কাছে এটা একটা অবিভাজ্য কাজ। Transaction চারটা প্রতিশ্রুতি দেয়, একসাথে **ACID**:

- **A = Atomicity (হয় সব, নয় কিছুই না)**: debit হয়ে credit-এর আগে crash হলে? Transaction বাতিল, রহিমের টাকা ফেরত। **ঠেকায়:** অর্ধেক কাজ, "টাকা কাটল কিন্তু পৌঁছাল না"।
- **C = Consistency (নিয়ম ভাঙে না)**: Transaction-এর আগে আর পরে database-এর সব নিয়ম ঠিক থাকে: balance ঋণাত্মক না, মোট টাকা এক। রহিমের balance ৩০০ হলে ৫০০ পাঠানোর চেষ্টায় \`CHECK (balance >= 0)\` ভাঙবে, পুরো transaction বাতিল। **ঠেকায়:** নিয়মবিরুদ্ধ অবস্থা।
- **I = Isolation (একসাথে চললেও আলাদা)**: একই সময়ে রহিমের আরেকটা payment চললেও দুটো transaction একে অপরের অর্ধেক-করা কাজ দেখে না, আর একজনের লেখা আরেকজন মুছে দেয় না। **ঠেকায়:** concurrency-র গোলমাল (lost update ইত্যাদি)।
- **D = Durability (COMMIT মানে স্থায়ী)**: Database "COMMIT OK" বলার পরে বিদ্যুৎ গেলেও transfer হারাবে না। **ঠেকায়:** crash-এ committed data হারানো।

এই চারটা ছাড়া একটা payment app বানানো প্রায় অসম্ভব। ACID-কে BASE-এর পাশে রেখে তুলনা হবে [Day 25](${topicHrefForDay(25)})-এ, আর isolation-এর স্তরগুলো [Day 26](${topicHrefForDay(26)})-এ। এখন এটুকু জানলেই চলবে।

### NoSQL: relational-এর বাইরের চার পরিবার

সব data table-এ সুন্দর বসে না, আর সব কাজে JOIN আর কঠোর schema লাগে না। তাই এসেছে **NoSQL** database-গুলো। চারটা বড় পরিবার:

- **Key-value**: একটা key দিলে একটা value। সবচেয়ে সরল, খুব দ্রুত। উদাহরণ **Redis** (data memory-তে রাখে)। ব্যবহার: login session, cache, rate limit counter।
- **Document**: প্রতিটা রেকর্ড একটা JSON-এর মতো document, ভেতরে nested field। উদাহরণ **MongoDB**। ব্যবহার: product catalog, যেখানে মোবাইলের field (RAM, camera) আর চালের field (ওজন, ধরন) আলাদা।
- **Wide-column**: row-গুলো একটা partition key দিয়ে ভাগ হয়ে অনেক machine-এ ছড়ায়, প্রতিটা partition-এর ভেতরে row-গুলো sorted থাকে। উদাহরণ **Apache Cassandra**। ব্যবহার: বিশাল পরিমাণ write, যেমন chat message, sensor reading, activity log।
- **Graph**: data হলো node আর তাদের সম্পর্ক (edge)। উদাহরণ **Neo4j**। ব্যবহার: "বন্ধুর বন্ধু কে", fraud ring খোঁজা, যেখানে সম্পর্ক ধরে অনেক ধাপ হাঁটতে হয়।

NoSQL মানে "SQL নেই" না, মানে "শুধু relational না"। অনেক NoSQL database এখন transaction-ও দেয়, আর PostgreSQL-ও JSON রাখতে পারে। কখন কোনটা, সেটা [Day 20](${topicHrefForDay(20)})-এ গভীরে যাব।

### OLTP বনাম OLAP

- **OLTP (Online Transaction Processing)**: app-এর দৈনন্দিন কাজ। অনেক ছোট ছোট query, প্রতিটা কয়েকটা row ছোঁয়: order দাও, balance দেখাও। দ্রুত উত্তর জরুরি।
- **OLAP (Online Analytical Processing)**: বিশ্লেষণ। অল্প কিছু বড় query, প্রতিটা লাখ লাখ row ঘাঁটে: "গত বছর মাসভিত্তিক, জেলাভিত্তিক বিক্রি"।

দুটো একই database-এ চালালে বড় report-টা disk আর CPU খেয়ে checkout ধীর করে দেয় (ঠিক সুমনের ৩ নম্বর সমস্যা)। তাই বড় হলে analytics আলাদা জায়গায় (data warehouse) যায়, প্রায়ই column আকারে সাজানো storage-এ। [Day 70](${topicHrefForDay(70)})-এ গভীরে যাব।

### App কিভাবে database-এর সাথে কথা বলে

App আর database আলাদা process, প্রায়ই আলাদা machine ([Day 2](${topicHrefForDay(2)})-এর client-server)। App একটা **driver** (যেমন Node.js-এ \`pg\`, Java-তে JDBC driver) দিয়ে network-এ **connection** খোলে, তারপর সেই connection দিয়ে SQL পাঠায় আর ফল পায়।

Connection খোলা সস্তা না: TCP handshake, প্রায়ই TLS, password যাচাই, আর PostgreSQL-এ প্রতিটা connection-এর জন্য server-এ একটা আলাদা process চালু হয়। প্রতিটা request-এ নতুন connection খুললে প্রতিবার এই খরচ, আর ভিড়ের সময় database-এর connection-এর সীমা (PostgreSQL-এ default \`max_connections\` = 100) পার হয়ে যায়।

সমাধান **connection pool**: app চালুর সময় কয়েকটা connection খুলে রাখে। Request এলে pool থেকে একটা ধার নেয়, query শেষে ফেরত দেয়। Connection বন্ধ হয় না, পরের request আবার ব্যবহার করে। সব connection ব্যস্ত থাকলে নতুন request app-এর ভেতরেই একটু অপেক্ষা করে। Pool কত বড় হবে, সেটা Deep dive-এ হিসাব করব।

### Database বাছাই: brand না, প্রশ্ন

"MongoDB তো scale করে" বা "আমাদের team সবসময় MySQL চালায়", এভাবে বাছলে পরে কষ্ট। বরং এই প্রশ্নগুলো করুন:
1. **Data-র আকার কেমন?** সম্পর্কে ভরা (customer → order → item)? নাকি স্বাধীন document? নাকি সম্পর্কই আসল (social graph)?
2. **Query কেমন হবে?** Key দিয়ে একটা জিনিস? নানা শর্তে filter আর JOIN? বড় aggregate?
3. **Consistency কতটা জরুরি?** টাকা আর stock-এ transaction লাগবেই; like count কয়েক সেকেন্ড পিছিয়ে থাকলেও চলে।
4. **Scale কত?** দিনে কত write, কত read, কত GB। (হিসাবের উপায় [Day 19](${topicHrefForDay(19)})-এ।)
5. **Team চালাতে পারবে তো?** Backup, monitoring, upgrade কে করবে।

বেশিরভাগ নতুন product-এর জন্য উত্তর আসে: একটা relational database (PostgreSQL বা MySQL) দিয়ে শুরু, দরকার হলে পাশে Redis। বিশেষ চাহিদা এলে তবে বিশেষ database।`,
    diagrams: [
      {
        id: "day-010-main",
        caption:
          "মূল ছবি: app server-রা pool থেকে connection ধার নিয়ে SQL পাঠায়; database engine আগে WAL-এ লেখে, memory-র page বদলায়, আর data file পরে হালনাগাদ করে।",
        alt: "বামে তিনটা App Server, প্রতিটা থেকে তীর একটা Connection Pool বাক্সে, যেখানে পাঁচটা connection (তিনটা ব্যস্ত, দুটো খালি)। Pool থেকে SQL যায় Database Engine-এর Query Processor-এ (Parser, Planner, Executor)। Query Processor থেকে ১ নম্বর তীর WAL-এ (disk, append-only, COMMIT-এ fsync), ২ নম্বর তীর Buffer Cache-এ (RAM), আর Buffer Cache থেকে ৩ নম্বর তীর Data Files-এ (disk, পরে checkpoint-এ)। WAL থেকে Data Files-এ ড্যাশ দেওয়া তীর: crash-এর পরে replay।",
        downloadable: true,
      },
      {
        id: "day-010-schema",
        caption:
          "ভেতরের গঠন: হাটবাজারের চার table, primary key (PK) আর foreign key (FK) দিয়ে জোড়া; প্রতিটা FK database নিজে পাহারা দেয়।",
        alt: "চারটা table-এর বাক্স: customers (id PK, name, phone UNIQUE, city), orders (id PK, customer_id FK, status, created_at), order_items (order_id PK FK, product_id PK FK, quantity CHECK > 0, unit_price), products (id PK, name, price CHECK > 0, stock CHECK ≥ 0)। orders.customer_id থেকে customers.id-তে, order_items.order_id থেকে orders.id-তে, আর order_items.product_id থেকে products.id-তে তীর, প্রতিটায় লেখা এক থেকে অনেক।",
      },
      {
        id: "day-010-before-after",
        caption:
          "Transfer-এর মাঝে crash: transaction ছাড়া ৫০০ টাকা উধাও; transaction থাকলে COMMIT-এর আগে crash মানে কিছুই হয়নি, পরে crash মানে দুটোই হয়েছে।",
        alt: "উপরে transaction ছাড়া: রহিম থেকে ৫০০ কাটা হলো, তারপর crash, করিমের credit হয়নি; restart-এর পরে রহিম ৫০০, করিম ২০০, মোট ৭০০, ৫০০ টাকা উধাও। নিচে transaction সহ: BEGIN, রহিম থেকে ৫০০, crash, COMMIT হয়নি; restart-এর পরে রহিম ১০০০, করিম ২০০, মোট ১২০০ ঠিক।",
      },
      {
        id: "day-010-nosql-map",
        caption:
          "NoSQL-এর চার পরিবার: key-value, document, wide-column আর graph, প্রতিটার একটা প্রতিনিধি আর একটা বাস্তব ব্যবহার।",
        alt: "চারটা কার্ড। Key-Value (যেমন Redis): session:42 থেকে একটা value, ব্যবহার session, cache, counter। Document (যেমন MongoDB): nested field সহ একটা product document, ব্যবহার আলাদা আলাদা field-এর product catalog। Wide-Column (যেমন Cassandra): chat_id partition-এর ভেতরে সময় অনুযায়ী sorted message, ব্যবহার বিশাল write। Graph (যেমন Neo4j): মানুষ node আর বন্ধুত্বের edge, ব্যবহার বন্ধুর বন্ধু আর fraud ring।",
      },
    ],
  },

  deepDive: [
    {
      title: "একটা write-এর ভেতরের যাত্রা: WAL → buffer cache → data file",
      markdown: `"COMMIT OK" পাওয়ার মুহূর্তে আপনার data আসলে কোথায়? উত্তরটা অনেককে অবাক করে: সাধারণত **data file-এ না**।

**কেন সরাসরি data file-এ লেখে না?** একটা transfer দুটো ভিন্ন জায়গার page বদলায় (রহিমের row এক page-এ, করিমের আরেকটায়), সাথে index-এর page। Disk-এর নানা জায়গায় ছড়ানো এই random write ধীর। আর মাঝপথে crash হলে কিছু page নতুন, কিছু পুরনো, অর্থাৎ ভাঙা অবস্থা।

তাই প্রায় সব গুরুতর database একটা নিয়ম মানে, PostgreSQL-এ যার নাম **Write-Ahead Logging (WAL)**:

1. **Buffer cache-এ বদল**: যে page বদলাবে, সেটা disk থেকে memory-র **buffer cache**-এ (PostgreSQL-এ shared buffers) আনা হয়, আর memory-তেই বদলানো হয়। এখন এটা একটা **dirty page**: memory-তে নতুন, disk-এ পুরনো।
2. **Log record**: প্রতিটা বদলের একটা ছোট বর্ণনা ("এই page-এ এই বদল") WAL-এ যোগ হয়। WAL শুধু শেষে যোগ হয় (**append-only**), তাই disk-এ লেখা sequential আর দ্রুত।
3. **COMMIT = WAL flush**: COMMIT-এ একটা commit record যোগ হয়, আর WAL disk-এ **fsync** করা হয়। fsync মানে OS-কে বলা "শুধু নিজের cache-এ রেখো না, সত্যিই disk-এ বসাও, তারপর জানাও"। এর পরেই client "COMMIT OK" পায়।
4. **পরে data file**: Dirty page-গুলো পরে ধীরে-সুস্থে data file-এ যায়, background writer আর **checkpoint**-এর মাধ্যমে। একটা page-এ ১০০ বার বদল হলে disk-এ একবার লিখলেই চলে।

মূল নিয়ম: **কোনো dirty page disk-এ যাওয়ার আগে তার বর্ণনা WAL-এ disk-এ পৌঁছাতে হবে।** তাই crash যখনই হোক, WAL-এ সবসময় যথেষ্ট তথ্য থাকে।

**Crash-এর পরে (crash recovery):** Restart-এ database শেষ checkpoint থেকে WAL পড়ে প্রতিটা বদল আবার প্রয়োগ করে (**redo/replay**)। যে transaction-এর commit record আছে, তার ফল ফিরে আসে। যার নেই, সেটা কখনো হয়নি বলে ধরা হয়। নিচের lab-এ \`docker kill\` করে PostgreSQL-এর log-এ ঠিক এটা দেখবেন: "database system was not properly shut down; automatic recovery in progress", তারপর "redo starts at ..."।

**দুটো engine-এর পার্থক্য:** PostgreSQL-এ uncommitted transaction-এর নতুন row version disk-এ থেকে গেলেও MVCC-র নিয়মে অদৃশ্য থাকে, তাই আলাদা "undo" লাগে না। MySQL-এর InnoDB-তে **redo log** দিয়ে replay হয়, আর **undo log** দিয়ে অসম্পূর্ণ transaction পিছিয়ে নেওয়া হয়। SQLite default-এ উল্টো পথে চলে: বদলের আগে পুরনো page-গুলো একটা **rollback journal**-এ কপি করে, crash হলে সেখান থেকে ফিরিয়ে আনে; চাইলে WAL mode-ও চালু করা যায়।

**Torn page:** Database-এর page সাধারণত ৮KB (PostgreSQL) বা ১৬KB (InnoDB), কিন্তু disk হয়তো একবারে ৪KB লেখে। Page লেখার মাঝে বিদ্যুৎ গেলে অর্ধেক নতুন, অর্ধেক পুরনো page। PostgreSQL এজন্য checkpoint-এর পরে কোনো page প্রথমবার বদলালে পুরো page-এর ছবি WAL-এ রাখে (\`full_page_writes\`), আর InnoDB রাখে **doublewrite buffer**।

**Durability-র দাম আর knob:** প্রতিটা COMMIT-এ fsync মানে প্রতিটা commit অন্তত একটা disk flush-এর সময় নেয়। তাই database-গুলো **group commit** করে: একই মুহূর্তের অনেক transaction এক fsync-এ। কিছু knob durability কমিয়ে গতি বাড়ায়:
- PostgreSQL \`synchronous_commit = off\`: fsync-এর আগেই OK। Crash-এ শেষ কয়েকশো millisecond-এর commit হারাতে পারে, কিন্তু database ভাঙে না।
- InnoDB \`innodb_flush_log_at_trx_commit\` = 0 বা 2: প্রতি commit-এ flush না করে মোটামুটি প্রতি সেকেন্ডে। Crash-এ শেষ প্রায় এক সেকেন্ড হারাতে পারে। Default 1 পুরো ACID।
- PostgreSQL \`fsync = off\`: এটা অন্য জিনিস। Crash-এ database অপূরণীয়ভাবে নষ্ট হতে পারে। Production-এ কখনো না।

Storage engine-এর ভেতরে (B-tree বনাম LSM-tree) data কিভাবে সাজানো থাকে, সেটা [Day 23](${topicHrefForDay(23)})-এ গভীরে যাব।`,
      diagrams: [
        {
          id: "day-010-wal-steps",
          caption:
            "ধাপে ধাপে: BEGIN → debit → credit → COMMIT (WAL fsync) → checkpoint; তারপর দুটো crash: COMMIT-এর আগে আর পরে।",
          alt: "চারটা কলাম: Session, Buffer Cache (RAM), WAL (disk), Data File (disk)। প্রতিটা ধাপে কোন কলামে কী বদলাল তা দেখানো: debit আর credit memory-তে আর WAL record-এ, COMMIT-এ WAL disk-এ fsync, data file তখনো পুরনো; checkpoint-এ data file নতুন। Crash-এর দুই ক্ষেত্র: COMMIT-এর আগে হলে পুরনো balance, পরে হলে WAL replay করে নতুন balance।",
        },
      ],
    },
    {
      title: "ACID-এর C বনাম CAP-এর C, আর C-র দায় আসলে কার",
      markdown: `[Day 8](${topicHrefForDay(8)})-এ দেখেছিলাম CAP-এর **C** মানে linearizability: সব replica মিলে যেন একটা কপি, প্রতিটা read সর্বশেষ write দেখে। ACID-এর **C** একদম আলাদা: **database-এর নিয়ম (invariant) transaction-এর আগে-পরে ঠিক থাকা।** একই অক্ষর, দুই অর্থ।

একটা উদাহরণে পার্থক্য: একটা মাত্র machine-এ চলা PostgreSQL-এ CAP-এর প্রশ্নই ওঠে না (replica নেই), কিন্তু ACID-এর C পুরোপুরি প্রযোজ্য: balance ঋণাত্মক হবে না। উল্টো দিকে, async replication-এ primary-তে transaction ACID মেনে commit হলো, কিন্তু replica কয়েক millisecond পিছিয়ে, তাই replica থেকে পড়লে পুরনো balance। এটা CAP অর্থে inconsistent, অথচ ACID ভাঙেনি।

**C-র দায়ে একটা সূক্ষ্ম কথা:** A, I আর D সত্যিই database-এর বৈশিষ্ট্য। C অনেকটা application-এর। Database শুধু সেই নিয়মগুলো পাহারা দিতে পারে, যেগুলো আপনি তাকে বলেছেন: \`CHECK (balance >= 0)\`, \`UNIQUE\`, foreign key। কিন্তু "transfer-এ মোট টাকা একই থাকবে" নিয়মটা database জানে না। App যদি debit ৫০০ আর credit ৫৫০ লেখে, database খুশিমনে commit করবে। Database-এর কাজ হলো atomicity, isolation আর durability দিয়ে এমন পরিবেশ দেওয়া, যেখানে সঠিক transaction লিখলে নিয়ম ঠিক থাকে।

তাই ব্যবহারিক নিয়ম: **যে নিয়ম database-এ লেখা যায়, সেটা database-এ লিখুন।** App-এর code-এ "আগে দেখি phone আছে কিনা, না থাকলে insert" লিখলে দুটো request একসাথে এলে দুজনেই "নেই" দেখবে আর দুজনেই insert করবে। \`UNIQUE\` constraint থাকলে দ্বিতীয়টা error পাবে, যত একসাথেই আসুক।`,
    },
    {
      title: "Isolation-এর প্রথম পাঠ: lost update আর SELECT ... FOR UPDATE",
      markdown: `চা পাতার stock ১০। দুজন customer প্রায় একসাথে কিনছে। App-এর code:

\`\`\`sql
-- দুটো request-এই একই code
BEGIN;
SELECT stock FROM products WHERE id = 4;        -- 10 পেল
-- app হিসাব করল: 10 - 1 = 9
UPDATE products SET stock = 9 WHERE id = 4;
COMMIT;
\`\`\`

A পড়ল ১০, B পড়ল ১০। A লিখল ৯, commit। B লিখল ৯, commit। দুটো বিক্রি, stock কমল একটা। ঠিক সুমনের file-এর সমস্যা, এবার database-এর ভেতরে। Transaction আছে, তবুও।

কেন? PostgreSQL-এর default isolation level **Read Committed**: প্রতিটা statement শুধু তখন পর্যন্ত commit হওয়া data দেখে। এটা dirty read (অন্যের uncommitted data দেখা) ঠেকায়, কিন্তু "পড়ো, app-এ হিসাব করো, তারপর লেখো" (read-modify-write) ধরনের lost update ঠেকায় না।

তিনটা প্রচলিত সমাধান:
1. **হিসাব database-কে করতে দিন (atomic update)**: \`UPDATE products SET stock = stock - 1 WHERE id = 4 AND stock > 0;\` এখানে পড়া আর লেখা একই statement-এ, row lock নিয়ে, তাই দুটো একসাথে এলে দ্বিতীয়টা প্রথমটার ফলের উপর কাজ করে। সবচেয়ে সহজ আর দ্রুত।
2. **পড়ার সময়েই lock (pessimistic)**: \`SELECT stock FROM products WHERE id = 4 FOR UPDATE;\` প্রথম transaction row-টা lock করে; দ্বিতীয়টার SELECT অপেক্ষা করে, প্রথমটা commit করলে নতুন মান (৯) দেখে। Lab-এ নিজে দেখবেন B প্রায় ৩ সেকেন্ড আটকে থাকে।
3. **Version মিলিয়ে লেখা (optimistic)**: row-এ একটা \`version\` column; \`UPDATE ... SET stock = 9, version = 8 WHERE id = 4 AND version = 7\`। অন্য কেউ আগে বদলালে ০ row update হবে, তখন আবার চেষ্টা।

**MVCC এক লাইনে:** PostgreSQL update-এ row-এর নতুন version লেখে, পুরনোটা কিছুক্ষণ রাখে। তাই PostgreSQL-এর docs-এর ভাষায়, read কখনো write-কে আটকায় না, write-ও read-কে আটকায় না। শুধু দুটো write একই row-এ এলে একজনকে অপেক্ষা করতে হয়।

**Deadlock-এর ঝলক:** রহিম → করিম আর করিম → রহিম transfer একসাথে চললে, একটা রহিমের row lock করে করিমেরটার অপেক্ষায়, আরেকটা উল্টো। দুজনেই চিরকাল অপেক্ষায়। PostgreSQL এটা ধরে একটাকে "deadlock detected" error দিয়ে বাতিল করে। প্রতিরোধ: সবসময় একই ক্রমে lock নিন (যেমন ছোট id আগে)।

Dirty read, non-repeatable read, phantom, আর Read Committed থেকে Serializable পর্যন্ত স্তরগুলো [Day 26](${topicHrefForDay(26)})-এ, আর optimistic বনাম pessimistic locking [Day 27](${topicHrefForDay(27)})-এ গভীরে যাব। এখন এটুকু জানলেই চলবে।`,
      diagrams: [
        {
          id: "day-010-lost-update",
          caption:
            "Lost update: দুটো session একই stock (১০) পড়ে, দুজনেই ৯ লেখে; দুটো বিক্রি, কিন্তু stock কমল একটা।",
          alt: "Session A, Database আর Session B-র sequence diagram: A stock পড়ে ১০, B stock পড়ে ১০, A ৯ লিখে commit, B ৯ লিখে commit, শেষে stock ৯ অথচ হওয়ার কথা ৮।",
        },
      ],
    },
    {
      title: "N+1 query: ORM-এর লুকানো ফাঁদ",
      markdown: `আজকের ২০০টা order-এর তালিকা, প্রতিটার পাশে customer-এর নাম দেখাতে হবে। ORM দিয়ে লেখা সহজ code:

\`\`\`js
const orders = await Order.findAll({ where: { date: today } });   // 1টা query
for (const order of orders) {
  order.customer = await Customer.findByPk(order.customerId);     // প্রতিটা order-এ 1টা
}
\`\`\`

দেখতে নিরীহ। কিন্তু database-এ যাচ্ছে **১ + ২০০ = ২০১টা query**। এটাই **N+1 query problem**: ১টা query তালিকার জন্য, তারপর তালিকার প্রতিটা (N) জিনিসের জন্য আরও একটা করে।

কেন খারাপ? প্রতিটা query-তে network-এ যাওয়া-আসা (round trip) আছে। একই data center-এ ধরুন ১ms। ২০১টা query একটার পর একটা = শুধু অপেক্ষাতেই ~২০০ms, যদিও প্রতিটা query নিজে ০.১ms-এর কাজ। আর এই পুরো সময় একটা connection আটকে থাকে। Development-এ ১০টা order-এ টের পাওয়া যায় না; production-এ ২০০০টা হলে page কয়েক সেকেন্ড।

সমাধান: database-কে একবারে পুরো কাজ দিন।
- **JOIN**: \`SELECT o.*, c.name FROM orders o JOIN customers c ON c.id = o.customer_id WHERE ...\` → ১টা query।
- **Batch (IN / ANY)**: আগে order-গুলো, তারপর সব customer একবারে: \`SELECT * FROM customers WHERE id = ANY($1)\` → ২টা query, N যত বড়ই হোক।
- ORM-এ এর নাম **eager loading**: Django-তে \`select_related\` / \`prefetch_related\`, Rails-এ \`includes\`, Prisma-তে \`include\`।

ধরার উপায়: development-এ query log চালু রাখুন, একটা page-এ কয়টা query যাচ্ছে গুনুন। Page-এর query সংখ্যা data-র সাথে বাড়লে, সেখানে N+1 আছে।`,
    },
    {
      title: "Connection pool-এর আকার: বড় সবসময় ভালো না",
      markdown: `Pool-এ কয়টা connection লাগবে? [Day 7](${topicHrefForDay(7)})-এর **Little's Law** এখানে সরাসরি কাজে লাগে:

**একসাথে ব্যস্ত connection (L) = প্রতি সেকেন্ডে query (λ) × প্রতিটা query connection কতক্ষণ ধরে রাখে (W)**

হাটবাজারে peak-এ ২,০০০ query/s, প্রতিটা গড়ে ৫ms: L = ২০০০ × ০.০০৫ = **১০টা connection** গড়ে ব্যস্ত। Spike আর p99-এর জন্য কিছুটা বাড়তি রেখে হয়তো ১৫-২০। হাজারটা না।

খেয়াল করুন W-তে query-র সময় শুধু না, connection যতক্ষণ ধার নেওয়া থাকে পুরোটা। Transaction-এর ভেতরে কেউ payment gateway-কে HTTP call করলে (২ সেকেন্ড), সেই connection ২ সেকেন্ড আটকে, W বিশাল, pool শেষ। নিয়ম: **transaction ছোট রাখুন, ভেতরে বাইরের network call না।**

**বড় pool কেন উল্টো ফল দেয়?** Database server-এর CPU core আর disk সীমিত। ৮ core-এ ২০০টা query একসাথে চালালে সেগুলো আসলে একসাথে চলে না; OS ভাগাভাগি করে চালায় (context switch), একই row-এ lock-এর লাইন লম্বা হয়, প্রতিটা connection-এর memory লাগে। মোট throughput বাড়ে না, উল্টো প্রতিটা query-র latency বাড়ে। অপেক্ষা যদি করতেই হয়, app-এর pool-এর লাইনে অপেক্ষা সস্তা, database-এর ভেতরে না। HikariCP (একটা জনপ্রিয় Java pool)-এর wiki শুরুর আন্দাজ হিসেবে দেয় **connections ≈ (core × ২) + effective disk সংখ্যা**; তারপর load test করে ঠিক করুন।

**মোট হিসাব ভুলবেন না** ([Day 5](${topicHrefForDay(5)})-এর সতর্কতা): ২০টা app instance × প্রতিটায় ২০-এর pool = ৪০০ connection, অথচ \`max_connections\` ১০০। Autoscaling-এ instance বাড়লে এটা হঠাৎ ঘটে। তখন **PgBouncer**-এর মতো আলাদা pooler বসানো হয়: সব app তার সাথে কথা বলে, আর সে database-এর অল্প কয়েকটা connection ভাগ করে দেয় (transaction pooling mode-এ একটা server connection শুধু একটা transaction চলাকালীন একজন client-এর হাতে থাকে)।`,
    },
    {
      title: "Database বড় হলে: scaling-এর পথ এক নজরে",
      markdown: `একটা database কিভাবে বাড়ে, তার সাধারণ ক্রম। প্রতিটা ধাপের নিজের দিন আছে, এখানে শুধু মানচিত্র:

1. **Query আর index ঠিক করা**: প্রথম ধীরতার বেশিরভাগই index ছাড়া query বা N+1। সবচেয়ে সস্তা সমাধান। [Day 22](${topicHrefForDay(22)})।
2. **বড় machine (vertical scaling)**: বেশি RAM মানে বড় buffer cache, বেশি data memory-তে। সহজ, কিন্তু সীমা আছে। [Day 13](${topicHrefForDay(13)})।
3. **Cache**: বারবার পড়া data Redis-এর মতো জায়গায়, database পর্যন্ত যেতেই হয় না। [Day 17](${topicHrefForDay(17)})।
4. **Read replica**: database-এর কপি, যারা primary-র WAL পেয়ে নিজেদের হালনাগাদ রাখে, শুধু read সামলায়। দাম: **replication lag**, replica একটু পিছিয়ে থাকতে পারে। async হলে primary commit করে মরে গেলে শেষ কয়েকটা commit replica-তে না-ও থাকতে পারে। [Day 28](${topicHrefForDay(28)})।
5. **Sharding**: data ভাগ করে কয়েকটা database-এ (যেমন customer id অনুযায়ী)। Write-ও ভাগ হয়, কিন্তু দুই shard জুড়ে JOIN আর transaction কঠিন। [Day 29](${topicHrefForDay(29)}), আর ভাগ করার কৌশল [Day 30](${topicHrefForDay(30)})।
6. **কাজ আলাদা করা**: analytics আলাদা warehouse-এ (OLAP), search আলাদা search engine-এ ([Day 34](${topicHrefForDay(34)}))।

শেষ কথা: **durability মানে backup না।** COMMIT হওয়া \`DROP TABLE\`-ও পুরোপুরি durable! ভুল করে মোছা, ransomware বা পুরো data center হারানো থেকে বাঁচায় backup আর অন্য জায়গায় কপি। [Day 94](${topicHrefForDay(94)})-এ RPO/RTO দিয়ে গভীরে যাব।`,
    },
  ],

  tradeOffs: {
    markdown: `**Relational database (PostgreSQL, MySQL) দিয়ে শুরু করুন যখন:** data-র মধ্যে সম্পর্ক আছে (customer, order, product), টাকা বা stock-এর মতো জিনিসে transaction লাগবে, আর query-গুলো আগে থেকে পুরোপুরি জানা নেই (JOIN আর নানা filter দিয়ে নতুন প্রশ্ন করা যায়)। বেশিরভাগ app-এর জন্য এটাই নিরাপদ default।

**বিশেষ database বিবেচনা করুন যখন:** একটা নির্দিষ্ট access pattern বিশাল আকারে লাগে, আর relational database সেখানে সত্যিই কষ্ট পাচ্ছে (মেপে দেখা, অনুমান না): microsecond-এ key lookup (Redis), প্রতিটা রেকর্ডের আলাদা গঠন (MongoDB), সেকেন্ডে লাখো write অনেক machine-এ (Cassandra), অনেক ধাপের সম্পর্ক খোঁজা (Neo4j)।

**File কখন যথেষ্ট:** একজনই লেখে, data ছোট, আর হারালে সমস্যা নেই, যেমন config বা একবারের export। একাধিক writer বা গুরুত্বপূর্ণ data এলেই database (ছোট হলে SQLite-ও চলে)।

পাশাপাশি তুলনা:`,
    table: {
      headers: ["ধরন", "Data-র গঠন", "শক্তি", "দুর্বলতা", "উপযুক্ত উদাহরণ"],
      rows: [
        [
          "Plain file (JSON/CSV)",
          "যা খুশি, কোনো নিয়ম নেই",
          "সবচেয়ে সহজ, কোনো server লাগে না",
          "একসাথে লেখা, crash, query, integrity কিছুই সামলায় না",
          "Config, একবারের export",
        ],
        [
          "Relational (PostgreSQL, MySQL, SQLite)",
          "Table, row, schema; PK/FK দিয়ে সম্পর্ক",
          "ACID transaction, JOIN, constraint, নমনীয় query",
          "Schema বদলাতে migration; write অনেক machine-এ ভাগ করা কঠিন",
          "Order, payment, inventory, বেশিরভাগ app",
        ],
        [
          "Key-value (Redis)",
          "Key → value (string, hash, list, set)",
          "অত্যন্ত দ্রুত, সরল",
          "Key ছাড়া খোঁজা কঠিন; memory-র দাম",
          "Session, cache, counter, leaderboard",
        ],
        [
          "Document (MongoDB)",
          "JSON-এর মতো nested document",
          "নমনীয় গঠন; একসাথে পড়া data এক document-এ",
          "অনেক document জুড়ে JOIN আর সম্পর্ক কম স্বাভাবিক",
          "Product catalog, CMS, user profile",
        ],
        [
          "Wide-column (Cassandra)",
          "Partition key → sorted row-এর সারি",
          "বিশাল write throughput, অনেক machine-এ সহজে ছড়ায়",
          "Query pattern আগে ঠিক করে table বানাতে হয়; ad-hoc query দুর্বল",
          "Chat message, IoT, activity log",
        ],
        [
          "Graph (Neo4j)",
          "Node আর edge (সম্পর্ক)",
          "অনেক ধাপের সম্পর্ক খোঁজা স্বাভাবিক আর দ্রুত",
          "সাধারণ table-ধাঁচের কাজ বা বিশাল aggregate-এ সুবিধা কম",
          "Social graph, fraud ring, recommendation",
        ],
      ],
    },
  },

  industry: {
    markdown: `- **PostgreSQL**: WAL-এর নিয়ম docs-এ স্পষ্ট লেখা: data file-এর বদল disk-এ যাওয়ার আগে সেই বদলের log record স্থায়ী storage-এ flush হতে হবে, আর crash-এর পরে log replay করে database ফিরিয়ে আনা যায়। Concurrency সামলায় **MVCC** দিয়ে; default isolation **Read Committed**, এছাড়া Repeatable Read আর Serializable। প্রতিটা client connection-এর জন্য server একটা আলাদা process চালায় ("process per user" model), এজন্যই PostgreSQL-এ connection pool এত জরুরি।
- **MySQL (InnoDB)**: InnoDB-র docs ACID-এর প্রতিটা অক্ষরকে নির্দিষ্ট feature-এর সাথে মেলায়: **redo log** (crash-এর পরে replay), **undo log** (rollback আর MVCC), **doublewrite buffer** (torn page থেকে রক্ষা)। \`innodb_flush_log_at_trx_commit\`-এর default 1 পুরো durability দেয়; 0 বা 2 দিলে দ্রুত, কিন্তু crash-এ প্রায় শেষ এক সেকেন্ডের transaction হারাতে পারে। InnoDB-র default isolation **Repeatable Read**।
- **SQLite**: একটা file-এর ভেতরে পুরো relational database, আলাদা server নেই, app-এর ভেতরেই library হিসেবে চলে। Mobile app আর browser-এর মতো জায়গায় ব্যাপকভাবে ব্যবহৃত। "Atomic Commit In SQLite" document-এ ধাপে ধাপে লেখা আছে কিভাবে rollback journal দিয়ে বিদ্যুৎ চলে গেলেও transaction হয় পুরো, নয় কিছুই না; WAL mode-ও আছে।
- **NoSQL পরিবারের প্রতিনিধি**: **Redis** নিজেকে in-memory data structure store বলে (cache, database, message broker হিসেবে ব্যবহার), disk-এ রাখার জন্য RDB snapshot আর AOF log। **MongoDB** document রাখে BSON (binary JSON) আকারে, আর version 4.0 থেকে একাধিক document জুড়ে ACID transaction দেয়। **Apache Cassandra** wide-column database, শুরুতে Facebook-এ inbox search-এর জন্য তৈরি হয়েছিল, পরে open source হয়ে Apache project হয়। **Neo4j** property graph database, query ভাষা **Cypher**।
- **Connection pooling**: **PgBouncer** PostgreSQL-এর সামনে বসা হালকা pooler (session, transaction আর statement pooling mode)। Java-তে **HikariCP**-র wiki-র "About Pool Sizing" লেখাটা ব্যাখ্যা করে কেন ছোট pool প্রায়ই বড় pool-এর চেয়ে ভালো throughput দেয়।

সাধারণ ব্যবহার, প্রায় সব backend-এ:
- Order, payment, wallet, inventory: relational database, transaction সহ
- Session আর cache: Redis
- Report আর dashboard: আলাদা analytics database বা warehouse ([Day 70](${topicHrefForDay(70)}))
- একই product-এ একাধিক database একসাথে (polyglot persistence): প্রতিটা কাজ তার উপযুক্ত জায়গায়

*উৎস: PostgreSQL documentation (Write-Ahead Logging (WAL), Reliability, Asynchronous Commit, Concurrency Control: Introduction ও Transaction Isolation, Architectural Fundamentals, Sequence Manipulation Functions); MySQL Reference Manual (InnoDB and the ACID Model, Redo Log, Undo Logs, Doublewrite Buffer, innodb_flush_log_at_trx_commit, Transaction Isolation Levels); SQLite documentation (Atomic Commit In SQLite, Write-Ahead Logging); Redis documentation (Redis persistence); MongoDB Manual (Transactions, BSON); Lakshman & Malik, "Cassandra: A Decentralized Structured Storage System" (2009) ও Apache Cassandra documentation; Neo4j Cypher Manual; PgBouncer documentation; HikariCP wiki "About Pool Sizing"।*`,
  },

  mistakes: [
    {
      mistake:
        "প্রতিটা request-এ নতুন database connection খোলা আর বন্ধ করা। প্রতিবার TCP, TLS আর authentication-এর খরচ, আর ভিড়ে max_connections শেষ হয়ে নতুন request সরাসরি error।",
      fix: "App চালুর সময় একটা connection pool বানান আর সেটাই সব request-এ ব্যবহার করুন; অনেক instance হলে মোট connection গুনুন, দরকারে PgBouncer।",
    },
    {
      mistake:
        "ORM-এ loop-এর ভেতরে query (N+1)। ১০টা row-এর test data-য় টের পাওয়া যায় না, production-এ একটা page ২০০০টা query পাঠায়।",
      fix: "JOIN বা IN/ANY দিয়ে batch করুন (ORM-এর eager loading), আর development-এ প্রতি page-এর query সংখ্যা দেখুন।",
    },
    {
      mistake:
        "টাকা FLOAT বা DOUBLE-এ রাখা। ০.১ + ০.২ ঠিক ০.৩ হয় না, হাজার লেনদেনে পয়সার হিসাব মেলে না।",
      fix: "টাকা NUMERIC/DECIMAL-এ রাখুন, অথবা পয়সায় integer হিসেবে।",
    },
    {
      mistake:
        "App-এ পড়ে, হিসাব করে, তারপর লেখা (SELECT stock, তারপর UPDATE stock = 9), ভেবে যে transaction থাকলেই নিরাপদ। একসাথে দুটো request এলে lost update।",
      fix: "হিসাব database-কে দিন (stock = stock - 1), অথবা SELECT ... FOR UPDATE, অথবা version column দিয়ে optimistic check।",
    },
    {
      mistake:
        "নিয়ম শুধু app-এর code-এ রাখা ('আগে দেখি phone আছে কিনা')। একসাথে দুটো request দুজনেই 'নেই' দেখে duplicate বানায়; আর অন্য কোনো script সরাসরি database-এ লিখলে নিয়মই থাকে না।",
      fix: "UNIQUE, NOT NULL, CHECK আর FOREIGN KEY database-এ ঘোষণা করুন; app-এর validation শুধু সুন্দর error message-এর জন্য।",
    },
    {
      mistake:
        "Transaction-এর ভেতরে বাইরের HTTP call (payment gateway, email)। Call ধীর হলে row lock আর connection সেকেন্ডের পর সেকেন্ড আটকে থাকে।",
      fix: "Transaction ছোট আর শুধু database-এর কাজে রাখুন; বাইরের call transaction-এর বাইরে, দরকারে queue দিয়ে (Day 12, আর Day 66-এর Outbox pattern)।",
    },
    {
      mistake:
        "'MongoDB scale করে' বা 'আমরা সবসময় X চালাই' বলে database বাছা, data-র আকার আর query না দেখে।",
      fix: "Data shape, query pattern, consistency-র চাহিদা আর scale, এই প্রশ্নগুলোর উত্তর লিখে তারপর বাছুন; সন্দেহ থাকলে relational দিয়ে শুরু।",
    },
    {
      mistake:
        "Durability-কে backup ভাবা, অথবা গতির জন্য production-এ fsync বন্ধ করা।",
      fix: "Durability শুধু crash থেকে বাঁচায়, ভুল DELETE থেকে না; নিয়মিত backup আর restore-এর মহড়া রাখুন। fsync কখনো বন্ধ না; গতি লাগলে synchronous_commit-এর মতো নিরাপদ knob বুঝে ব্যবহার করুন।",
    },
  ],

  lab: [
    {
      title: "PostgreSQL 16 চালু করুন",
      markdown: `একটা named volume সহ PostgreSQL চালান, যাতে data container-এর বাইরে আলাদা থাকে। কোনো host port খোলার দরকার নেই, আমরা container-এর ভেতরের \`psql\` ব্যবহার করব:

\`\`\`bash
docker run -d --name sdlab-day010-pg \\
  -e POSTGRES_PASSWORD=secret \\
  -v sdlab-day010-pgdata:/var/lib/postgresql/data \\
  postgres:16

# কয়েক সেকেন্ড পরে
docker exec sdlab-day010-pg pg_isready -U postgres
# /var/run/postgresql:5432 - accepting connections

docker exec -it sdlab-day010-pg psql -U postgres
\`\`\`

এখন আপনি \`postgres=#\` prompt-এ। এই terminal-কে বলব **Terminal 1**।`,
    },
    {
      title: "হাটবাজারের schema বানান",
      markdown: `Core Concept-এর চারটা \`CREATE TABLE\` (customers, products, orders, order_items) psql-এ paste করুন। প্রতিটার জন্য \`CREATE TABLE\` দেখবেন। তারপর একটা table-এর গঠন দেখুন:

\`\`\`sql
\\d orders
\`\`\`

\`\`\`
Indexes:
    "orders_pkey" PRIMARY KEY, btree (id)
Foreign-key constraints:
    "orders_customer_id_fkey" FOREIGN KEY (customer_id) REFERENCES customers(id)
Referenced by:
    TABLE "order_items" CONSTRAINT "order_items_order_id_fkey" FOREIGN KEY (order_id) REFERENCES orders(id)
\`\`\`

খেয়াল করুন, primary key দিলেই PostgreSQL নিজে থেকে একটা index বানিয়েছে (\`orders_pkey\`)।`,
    },
    {
      title: "নমুনা data ঢোকান",
      markdown: `\`\`\`sql
INSERT INTO customers (name, phone, city) VALUES
  ('Rahim',  '01711000001', 'Dhaka'),
  ('Karim',  '01811000002', 'Chattogram'),
  ('Salma',  '01911000003', 'Dhaka'),
  ('Nusrat', '01611000004', 'Sylhet');

INSERT INTO products (name, price, stock) VALUES
  ('Miniket Rice 5kg', 420, 50),
  ('Soybean Oil 1L',   190, 80),
  ('Masoor Dal 1kg',   140, 60),
  ('Tea 400g',         230, 10);

INSERT INTO orders (customer_id, status) VALUES
  (1, 'delivered'), (2, 'delivered'), (1, 'pending'), (3, 'delivered');

INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
  (1, 1, 2, 420), (1, 2, 1, 190),
  (2, 3, 3, 140),
  (3, 4, 1, 230), (3, 2, 2, 190),
  (4, 1, 1, 420);
\`\`\`

শেষে \`INSERT 0 4\`, \`INSERT 0 4\`, \`INSERT 0 4\`, \`INSERT 0 6\` দেখবেন। (দাম শুধু উদাহরণ।)`,
    },
    {
      title: "JOIN আর GROUP BY দিয়ে প্রশ্ন করুন",
      markdown: `প্রতিটা order-এর মোট টাকা:

\`\`\`sql
SELECT o.id AS order_id, c.name, o.status,
       SUM(oi.quantity * oi.unit_price) AS total_taka
FROM orders o
JOIN customers   c  ON c.id = o.customer_id
JOIN order_items oi ON oi.order_id = o.id
GROUP BY o.id, c.name, o.status
ORDER BY o.id;
\`\`\`

\`\`\`
 order_id | name  |  status   | total_taka
----------+-------+-----------+------------
        1 | Rahim | delivered |    1030.00
        2 | Karim | delivered |     420.00
        3 | Rahim | pending   |     610.00
        4 | Salma | delivered |     420.00
\`\`\`

সুমনের প্রশ্ন, শহর অনুযায়ী delivered বিক্রি:

\`\`\`sql
SELECT c.city, COUNT(DISTINCT o.id) AS orders,
       SUM(oi.quantity * oi.unit_price) AS revenue_taka
FROM customers c
JOIN orders o       ON o.customer_id = c.id
JOIN order_items oi ON oi.order_id = o.id
WHERE o.status = 'delivered'
GROUP BY c.city
ORDER BY revenue_taka DESC;
\`\`\`

\`\`\`
    city    | orders | revenue_taka
------------+--------+--------------
 Dhaka      |      2 |      1450.00
 Chattogram |      1 |       420.00
\`\`\`

\`COUNT(DISTINCT o.id)\` কেন? JOIN-এর পরে প্রতিটা order item-এর জন্য একটা row, তাই order ১ দুবার আসে। শুধু \`COUNT(*)\` দিলে ঢাকার order ৩ দেখাত। JOIN row বাড়ায়, এটা মনে রাখার মতো।

এবার LEFT JOIN: কে এখনো কিছু কেনেনি?

\`\`\`sql
SELECT c.name, COUNT(o.id) AS orders
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.name
ORDER BY orders DESC, c.name;
\`\`\`

Nusrat-এর পাশে \`0\`। সাধারণ JOIN দিলে Nusrat তালিকাতেই আসত না।`,
    },
    {
      title: "Constraint ভুল data আটকায়",
      markdown: `সুমনের file-এ যে ভুলগুলো ঢুকে গিয়েছিল, এবার চেষ্টা করুন:

\`\`\`sql
INSERT INTO orders (customer_id) VALUES (999);
\`\`\`

\`\`\`
ERROR:  insert or update on table "orders" violates foreign key constraint "orders_customer_id_fkey"
DETAIL:  Key (customer_id)=(999) is not present in table "customers".
\`\`\`

\`\`\`sql
DELETE FROM customers WHERE name = 'Rahim';
\`\`\`

\`\`\`
ERROR:  update or delete on table "customers" violates foreign key constraint "orders_customer_id_fkey" on table "orders"
DETAIL:  Key (id)=(1) is still referenced from table "orders".
\`\`\`

\`\`\`sql
INSERT INTO order_items VALUES (2, 1, 0, 420);
\`\`\`

\`\`\`
ERROR:  new row for relation "order_items" violates check constraint "order_items_quantity_check"
\`\`\`

App-এর code যতই bug-ওয়ালা হোক, এই data আর ঢুকবে না।`,
    },
    {
      title: "Transaction: ROLLBACK আর 'হয় সব, নয় কিছুই না'",
      markdown: `একটা wallet table বানান:

\`\`\`sql
CREATE TABLE wallets (
  phone   TEXT PRIMARY KEY,
  owner   TEXT NOT NULL,
  balance NUMERIC(12,2) NOT NULL CHECK (balance >= 0)
);
INSERT INTO wallets VALUES ('01711000001', 'Rahim', 1000), ('01811000002', 'Karim', 200);
\`\`\`

**ক) নিজে ROLLBACK:**

\`\`\`sql
BEGIN;
UPDATE wallets SET balance = balance - 500 WHERE phone = '01711000001';
UPDATE wallets SET balance = balance + 500 WHERE phone = '01811000002';
SELECT owner, balance FROM wallets ORDER BY owner;   -- Karim 700, Rahim 500
ROLLBACK;
SELECT owner, balance FROM wallets ORDER BY owner;   -- Karim 200, Rahim 1000
\`\`\`

Transaction-এর ভেতরে বদল দেখা যাচ্ছিল, ROLLBACK-এ সব আগের মতো।

**খ) মাঝপথে নিয়ম ভাঙলে:** এবার ক্রম উল্টো, আগে credit, তারপর এমন debit যেটা balance ঋণাত্মক করবে:

\`\`\`sql
BEGIN;
UPDATE wallets SET balance = balance + 5000 WHERE phone = '01811000002';
UPDATE wallets SET balance = balance - 5000 WHERE phone = '01711000001';
SELECT owner, balance FROM wallets;
COMMIT;
\`\`\`

\`\`\`
UPDATE 1
ERROR:  new row for relation "wallets" violates check constraint "wallets_balance_check"
DETAIL:  Failing row contains (01711000001, Rahim, -4000.00).
ERROR:  current transaction is aborted, commands ignored until end of transaction block
ROLLBACK
\`\`\`

খেয়াল করুন: COMMIT লিখলেও PostgreSQL উত্তর দিল \`ROLLBACK\`। করিমের +৫০০০ (যেটা সফল হয়েছিল) সেটাও বাতিল। \`SELECT owner, balance FROM wallets ORDER BY owner;\` চালালে Karim ২০০, Rahim ১০০০। এটাই Atomicity আর Consistency একসাথে।

**গ) সঠিক transfer:** ক-এর মতোই, শুধু শেষে \`COMMIT\`। এখন Karim ৭০০, Rahim ৫০০।`,
    },
    {
      title: "Durability: docker kill-এর পরেও committed data থাকে",
      markdown: `প্রথমে WAL-এর বর্তমান অবস্থান দেখুন, একটা row commit করুন, আবার দেখুন:

\`\`\`sql
SELECT pg_current_wal_lsn();
INSERT INTO orders (customer_id, status) VALUES (4, 'committed-before-crash');
SELECT pg_current_wal_lsn();
\`\`\`

দুটো LSN (WAL-এ অবস্থান, যেমন \`0/1540068\` থেকে \`0/1540168\`) আলাদা: insert WAL-এ লেখা হয়েছে। আপনার সংখ্যা আলাদা হবে।

এবার নতুন একটা terminal খুলুন (**Terminal 2**), আরেকটা psql session-এ একটা transaction শুরু করুন কিন্তু **COMMIT করবেন না**:

\`\`\`bash
docker exec -it sdlab-day010-pg psql -U postgres
\`\`\`

\`\`\`sql
BEGIN;
INSERT INTO orders (customer_id, status) VALUES (4, 'never-committed');
\`\`\`

এখন আরেকটা terminal থেকে (বা Terminal 1-এ \`\\q\` দিয়ে বের হয়ে) container-কে হঠাৎ মেরে ফেলুন। \`docker stop\` না, যেটা PostgreSQL-কে গুছিয়ে বন্ধ হতে দেয়; \`docker kill\` SIGKILL পাঠায়, বিদ্যুৎ চলে যাওয়ার মতো:

\`\`\`bash
docker kill sdlab-day010-pg
docker ps -a --filter name=sdlab-day010-pg --format '{{.Names}} {{.Status}}'
# sdlab-day010-pg Exited (137) ...
\`\`\`

Terminal 2-এর psql-ও কেটে যাবে। এবার চালু করে log দেখুন:

\`\`\`bash
docker start sdlab-day010-pg
docker logs sdlab-day010-pg 2>&1 | tail -12
\`\`\`

নিচে শুধু জরুরি লাইনগুলো (timestamp বাদে, LSN আপনার ক্ষেত্রে আলাদা হবে):

\`\`\`
LOG:  database system was interrupted; last known up at ...
LOG:  database system was not properly shut down; automatic recovery in progress
LOG:  redo starts at 0/14F2B48
LOG:  invalid record length at 0/157E038: expected at least 24, got 0
LOG:  redo done at 0/157DF78 ...
LOG:  checkpoint starting: end-of-recovery immediate wait
LOG:  database system is ready to accept connections
\`\`\`

এটাই crash recovery: শেষ checkpoint থেকে WAL replay ("redo")। "invalid record length" ভয়ের কিছু না, মানে WAL-এর শেষে পৌঁছে গেছে।

\`\`\`bash
docker exec -it sdlab-day010-pg psql -U postgres -c "SELECT id, customer_id, status FROM orders ORDER BY id;"
\`\`\`

\`\`\`
 id | customer_id |         status
----+-------------+------------------------
  1 |           1 | delivered
  2 |           2 | delivered
  3 |           1 | pending
  4 |           3 | delivered
  6 |           4 | committed-before-crash
\`\`\`

\`committed-before-crash\` আছে, \`never-committed\` নেই। Durability আর atomicity, দুটোই নিজের চোখে।

**id 5 কোথায়?** আগের ধাপে customer 999-এর ব্যর্থ insert sequence থেকে ৫ নম্বর নিয়ে ফেলেছিল। PostgreSQL-এ sequence-এর নম্বর rollback হলেও ফেরত যায় না, তাই id-তে ফাঁক থাকা স্বাভাবিক। ID-কে "গণনা" হিসেবে ধরবেন না।`,
    },
    {
      title: "ঐচ্ছিক: দুই session-এ lost update, তারপর FOR UPDATE",
      markdown: `দুটো terminal-এ দুটো psql খুলুন (\`docker exec -it sdlab-day010-pg psql -U postgres\`)। প্রথমে stock ১০ করুন: \`UPDATE products SET stock = 10 WHERE id = 4;\`

**Lost update** (নিচের ক্রমে, A আর B পালা করে):

\`\`\`sql
-- A
BEGIN; SELECT stock FROM products WHERE id = 4;   -- 10
-- B
BEGIN; SELECT stock FROM products WHERE id = 4;   -- 10
-- A
UPDATE products SET stock = 9 WHERE id = 4; COMMIT;
-- B
UPDATE products SET stock = 9 WHERE id = 4; COMMIT;
\`\`\`

\`SELECT stock FROM products WHERE id = 4;\` → **9**। দুটো বিক্রি, stock কমল একটা।

**FOR UPDATE দিয়ে** (আবার stock ১০ করে নিন):

\`\`\`sql
-- A
BEGIN; SELECT stock FROM products WHERE id = 4 FOR UPDATE;   -- 10
-- B
BEGIN; SELECT stock FROM products WHERE id = 4 FOR UPDATE;   -- আটকে আছে...
-- A
UPDATE products SET stock = 9 WHERE id = 4; COMMIT;
-- B-র SELECT এখন ছাড়া পেল, দেখাল 9
-- B
UPDATE products SET stock = 8 WHERE id = 4; COMMIT;
\`\`\`

এবার শেষ মান **8**। B-র SELECT ঠিক ততক্ষণ অপেক্ষা করল, যতক্ষণ A commit করেনি (B-তে আগে \`\\timing on\` দিলে সময়টা দেখবেন)। আরও সহজ পথ: \`UPDATE products SET stock = stock - 1 WHERE id = 4 AND stock > 0;\` দুই session থেকে চালিয়ে দেখুন, কোনো lock-এর কথা না ভেবেই ঠিক ফল।

একটা ছোট তথ্য দেখে নিন: \`SHOW max_connections;\` → 100, আর \`SHOW default_transaction_isolation;\` → read committed।`,
    },
    {
      title: "পরিষ্কার করুন",
      markdown: `সব psql থেকে \`\\q\` দিয়ে বের হয়ে:

\`\`\`bash
docker rm -f sdlab-day010-pg
docker volume rm sdlab-day010-pgdata
\`\`\``,
    },
  ],

  connections: {
    markdown: `- **[Day 2 · Client, Server ও Internet](${topicHrefForDay(2)})**: Server-এর পেছনে আসল "স্মৃতি" database। App server আর database-ও আসলে client-server: app হলো client, network-এ connection খুলে প্রশ্ন পাঠায়।
- **[Day 4 · REST API](${topicHrefForDay(4)})**: \`POST /orders\` সাধারণত একটা INSERT (প্রায়ই transaction-এর ভেতরে), \`GET /orders/42\` একটা SELECT। Retry-তে duplicate ঠেকাতে idempotency key রাখার সবচেয়ে ভরসার জায়গা database-এর UNIQUE constraint।
- **[Day 5 · Scalability](${topicHrefForDay(5)})**: সেখানে দেখেছিলাম database প্রায়ই প্রথম bottleneck। আজ বুঝলাম কেন: সে stateful, সব app server-এর shared, আর connection, lock, disk flush সব তার কাছে।
- **[Day 6 · Availability](${topicHrefForDay(6)})**: একটা database মানে একটা single point of failure। Durability crash-এর পরে data রাখে, কিন্তু machine ফিরে আসা পর্যন্ত service বন্ধ। Replica সেই ফাঁক ভরায়।
- **[Day 7 · Latency vs Throughput](${topicHrefForDay(7)})**: Little's Law দিয়ে pool-এর আকার; N+1-এ round trip-এর latency জমে যাওয়া; fsync আর group commit-এ latency বনাম throughput-এর trade-off।
- **[Day 8 · CAP Theorem](${topicHrefForDay(8)})**: ACID-এর C (নিয়ম ঠিক থাকা) আর CAP-এর C (সব replica এক কপির মতো) আলাদা।
- **[Day 9 · Load Balancers](${topicHrefForDay(9)})**: Load balancer app server-দের মাঝে ভাগ করে, কিন্তু পেছনে সবাই একই database-এ যায়; app server বাড়ালে database-এর connection-ও বাড়ে।

সামনে যা আসছে (প্রতিটায়, এখন এটুকু জানলেই চলবে, সেদিন গভীরে যাব): [Day 17](${topicHrefForDay(17)}) Caching, [Day 20](${topicHrefForDay(20)}) SQL vs NoSQL, [Day 21](${topicHrefForDay(21)}) Data Modeling, [Day 22](${topicHrefForDay(22)}) Database Indexes, [Day 23](${topicHrefForDay(23)}) Storage Engines (B-tree বনাম LSM), [Day 25](${topicHrefForDay(25)}) ACID vs BASE, [Day 26](${topicHrefForDay(26)}) Transactions ও Isolation Levels, [Day 27](${topicHrefForDay(27)}) Optimistic vs Pessimistic Locking, [Day 28](${topicHrefForDay(28)}) Replication, [Day 29](${topicHrefForDay(29)}) Sharding, [Day 70](${topicHrefForDay(70)}) OLTP vs OLAP, আর [Day 94](${topicHrefForDay(94)}) Disaster Recovery।`,
  },

  explainYourself: [
    {
      question:
        'একজন junior বলছে, "আমাদের app ছোট, তাই JSON file-এই data রাখব, database পরে দেখা যাবে।" কোন পরিস্থিতিতে সে ঠিক, আর কোন মুহূর্তে বিপদ শুরু?',
      idealAnswer:
        "একজনই লেখে, data ছোট, আর হারালে ক্ষতি নেই (config, একবারের export), তাহলে file যথেষ্ট। বিপদ শুরু হয় যখনই একাধিক request একসাথে লেখে (read-modify-write-এ একজনের লেখা হারায়), লেখার মাঝে crash হতে পারে (ভাঙা file, সব data অপাঠ্য), filter বা aggregate প্রশ্ন আসে (প্রতিবার পুরো file পড়া), আর ভুল data আটকানোর নিয়ম লাগে। এগুলোর সমাধান নিজে বানালে আসলে একটা খারাপ database বানানো হয়। ছোট app-এর জন্যও SQLite বা একটা ছোট PostgreSQL প্রায় বিনা খরচে এসব দেয়।",
    },
    {
      question:
        'Client "COMMIT OK" পেল, তার ঠিক পরেই server-এর বিদ্যুৎ চলে গেল। Data file-এ তখনো পুরনো মান। Restart-এর পরে কী দেখবেন, আর কেন?',
      idealAnswer:
        "নতুন মান। COMMIT OK দেওয়ার আগে database commit record সহ WAL disk-এ fsync করেছে। Data file পরে checkpoint-এ হালনাগাদ হওয়ার কথা ছিল, হয়নি; কিন্তু restart-এ database শেষ checkpoint থেকে WAL replay (redo) করে, ফলে বদলগুলো আবার প্রয়োগ হয় আর data file committed অবস্থায় পৌঁছায়। এটাই durability। উল্টো দিকে commit record WAL-এ না পৌঁছালে transaction কখনো হয়নি বলে ধরা হতো। ব্যতিক্রম শুধু যদি durability-র knob (synchronous_commit off, fsync off, InnoDB-তে flush setting 0/2) বদলানো থাকে।",
    },
    {
      question:
        "Pool-এ ২০টা connection, peak-এ কিছু request অপেক্ষা করছে। কেউ বলছে pool ২০০ করে দাও। আপনি কী জিজ্ঞেস করবেন আর কী করবেন?",
      idealAnswer:
        "প্রথমে Little's Law: কত query/s আর প্রতিটা connection কতক্ষণ ধরে রাখা হচ্ছে। যদি W বড় হয় কারণ ধীর query, N+1, বা transaction-এর ভেতরে বাইরের HTTP call, তাহলে pool বাড়ালে শুধু database-এর ভেতরে আরও বেশি কাজ একসাথে ঢুকবে; core আর disk একই, তাই context switch আর lock contention বেড়ে প্রতিটা query আরও ধীর হবে। আর instance সংখ্যা × ২০০ হয়তো max_connections পার করবে। তাই আগে W কমানো (index, JOIN দিয়ে N+1 ঠিক, transaction ছোট), তারপর load test করে pool-এর আকার ঠিক, আর অনেক instance হলে PgBouncer।",
    },
  ],

  interviewQuestions: [
    {
      question:
        "ACID কী? প্রতিটা অক্ষর কোন বিপদ থেকে রক্ষা করে, একটা উদাহরণ দিয়ে বলুন।",
      answerOutline: `- উদাহরণ ঠিক করুন: wallet transfer (debit + credit)
- Atomicity: মাঝে fail হলে সব বাতিল, অর্ধেক কাজ না
- Consistency: CHECK/UNIQUE/FK-এর মতো নিয়ম ঠিক থাকে; কিছুটা app-এর দায় (মোট টাকা একই রাখা)
- Isolation: একসাথে চলা transaction একে অপরের অর্ধেক কাজ দেখে না; level অনুযায়ী কতটা (default Read Committed-এ lost update সম্ভব)
- Durability: COMMIT OK মানে crash-এও থাকবে; WAL + fsync দিয়ে
- বোনাস: ACID-এর C ≠ CAP-এর C`,
    },
    {
      question: "Database crash-এর পরে committed data কিভাবে ফিরে পায়?",
      answerOutline: `- Write-ahead logging: বদল আগে log-এ, data page পরে
- COMMIT-এ WAL fsync, তারপর client-কে OK
- Dirty page পরে checkpoint/background writer দিয়ে data file-এ
- Recovery: শেষ checkpoint থেকে WAL replay (redo); commit record নেই এমন transaction অদৃশ্য/undo
- Torn page: full_page_writes (PostgreSQL), doublewrite buffer (InnoDB)
- Knob: synchronous_commit, innodb_flush_log_at_trx_commit; durability বনাম latency`,
    },
    {
      question:
        "SQL না NoSQL, নতুন একটা e-commerce app-এর জন্য কিভাবে ঠিক করবেন?",
      answerOutline: `- Brand না, প্রশ্ন: data shape, query pattern, consistency, scale, team-এর দক্ষতা
- Order/payment/inventory: সম্পর্ক আর transaction → relational
- Session/cache/cart: key-value (Redis)
- ভিন্ন ভিন্ন attribute-এর catalog: document, বা PostgreSQL-এর JSONB
- Analytics: আলাদা OLAP/warehouse
- উপসংহার: relational দিয়ে শুরু, মেপে দেখে যেখানে দরকার সেখানে বিশেষ database (polyglot)`,
    },
    {
      question: "Connection pool কেন দরকার, আর তার আকার কিভাবে ঠিক করবেন?",
      answerOutline: `- Connection খোলার খরচ: TCP, TLS, auth, PostgreSQL-এ process; max_connections সীমা
- Pool: আগে খোলা connection ধার দেওয়া-ফেরত নেওয়া
- আকার: Little's Law, L = λ × W; spike-এর জন্য কিছু বাড়তি
- বড় pool-এর ক্ষতি: context switch, lock contention, memory; অপেক্ষা app-এ সস্তা
- মোট = instance × pool ≤ max_connections; বেশি instance হলে PgBouncer
- W কমান: ছোট transaction, বাইরের call বাইরে`,
    },
    {
      question:
        "একটা page খুব ধীর, log-এ দেখছেন এক page load-এ ৫০০টা প্রায় একই রকম query। সমস্যা কী আর সমাধান কী?",
      answerOutline: `- N+1: একটা তালিকা, তারপর প্রতিটার জন্য আলাদা query (সাধারণত ORM-এর lazy loading)
- খরচ: N × round trip, connection ধরে রাখা, database-এ অপ্রয়োজনীয় parse/plan
- সমাধান: JOIN, বা IN/ANY দিয়ে batch (২টা query), ORM-এ eager loading
- প্রতিরোধ: development-এ query count log/test, APM-এ per-request query সংখ্যা`,
    },
  ],

  summary: {
    points: [
      "Database file-এর পাঁচ সমস্যা সামলায়: একসাথে লেখা, crash, query, ভুল data আর অর্ধেক কাজ।",
      "Relational model: table, row, schema; primary key পরিচয়, foreign key সম্পর্ক, constraint পাহারা; SQL-এ JOIN আর GROUP BY।",
      "Transaction মানে হয় সব, নয় কিছুই না; ACID: Atomicity, Consistency (নিয়ম), Isolation, Durability।",
      "COMMIT-এর আগে WAL disk-এ fsync হয়, data file পরে; crash-এর পরে WAL replay করে committed data ফেরে।",
      "Read Committed-এ read-modify-write lost update ঘটায়; atomic UPDATE বা SELECT ... FOR UPDATE দিয়ে ঠেকান।",
      "NoSQL-এর চার পরিবার: key-value, document, wide-column, graph; বাছাই হবে data shape আর query দেখে, brand দেখে না।",
      "Connection pool ছোট আর ঠিক মাপের (Little's Law); N+1 query JOIN বা batch দিয়ে ঠিক করুন।",
    ],
    diagram: {
      id: "day-010-summary",
      caption: "এক নজরে Databases",
      alt: "App থেকে Connection Pool হয়ে Database-এ query; Database আগে WAL-এ লেখে (COMMIT-এ fsync), পরে Data Files-এ (checkpoint)।",
    },
  },
};
