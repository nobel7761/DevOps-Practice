// Day 12 · Message Queues — sample lesson for milestone M5 (Plan doc Section 13).

import type { SdLesson } from "@/lib/system-design/lesson.types";

export const day012Lesson: SdLesson = {
  topicId: "sd-day-012",
  day: 12,
  title: "Message Queues",
  definition:
    "Message Queue হলো মাঝের একটা বাক্স: এক service কাজটা সেখানে রেখে চলে যায়, আরেক service নিজের গতিতে তুলে নিয়ে শেষ করে।",

  objectives: [
    "কেন সব কাজ request-এর ভেতরেই সেরে ফেলা বিপজ্জনক, আর queue কিভাবে সেটা আলাদা করে, ব্যাখ্যা করতে পারবেন।",
    "Producer, Broker, Consumer, Acknowledgement আর Dead Letter Queue দিয়ে একটা message-এর পুরো জীবনচক্র আঁকতে পারবেন।",
    "Message হারিয়ে যাওয়া আর দুবার process হওয়ার কারণ খুঁজে, ack আর idempotency দিয়ে সমাধান করতে পারবেন।",
    "কোন পরিস্থিতিতে RabbitMQ, Kafka বা SQS বাছবেন, আর কখন queue একেবারেই লাগবে না, যুক্তি দিয়ে বলতে পারবেন।",
  ],

  prerequisites: [
    {
      day: 2,
      title: "Client, Server ও Internet",
      href: "/course/system-design-a-z?milestone=sd-phase-01&module=sd-day-002",
    },
    {
      day: 6,
      title: "Availability",
      href: "/course/system-design-a-z?milestone=sd-phase-01&module=sd-day-006",
    },
    {
      day: 7,
      title: "Latency vs Throughput",
      href: "/course/system-design-a-z?milestone=sd-phase-01&module=sd-day-007",
    },
  ],

  problem: {
    markdown: `ধরুন আপনি একটা online shop চালান। User "Order করুন" চাপলে আপনার **Order Service** একে একে চারটা কাজ করে:

1. Email Service-কে বলে confirmation email পাঠাতে (~800ms)
2. Invoice Service-কে বলে PDF বানাতে (~1.2s)
3. Warehouse-কে জানায় মাল প্যাক করতে (~400ms)
4. SMS Gateway দিয়ে SMS পাঠায় (~800ms)

সবগুলো শেষ হলে তবেই user "Order সফল" দেখে। অর্থাৎ user প্রায় **৩ সেকেন্ড** বসে থাকে, অথচ এর বেশিরভাগ কাজই তার এই মুহূর্তে দেখার দরকার নেই।

আরও খারাপ দিন আসে যখন SMS Gateway down। তখন Order Service-এর call timeout হয়, পুরো request fail করে, আর user ভাবে order হয়নি। আসলে টাকা কাটা হয়ে গেছে, শুধু একটা SMS যায়নি। একটা ছোট, কম গুরুত্বপূর্ণ service পুরো checkout ভেঙে দিল।

ঈদের sale-এ হঠাৎ ১০ গুণ order এলে আরেক সমস্যা। Invoice Service ওই গতিতে PDF বানাতে পারে না, তাই সব request আটকে যায়। ধীর অংশটা পুরো system-কে ধীর করে দেয়।`,
    diagrams: [
      {
        id: "day-012-before",
        caption:
          "আগে: Order Service সব কাজ নিজে, একের পর এক করছে; একটা service আটকালে পুরো order আটকায়।",
        alt: "User Order Service-কে request পাঠায়; Order Service ক্রমানুসারে Email, Invoice, Warehouse আর SMS Gateway-কে call করে, SMS Gateway লাল চিহ্নে বন্ধ দেখানো।",
      },
    ],
  },

  analogy: {
    markdown: `একটা ব্যস্ত রেস্টুরেন্টের কথা ভাবুন। Cashier যদি প্রতিটা order নিয়ে নিজেই রান্নাঘরে গিয়ে রান্না শেষ হওয়া পর্যন্ত দাঁড়িয়ে থাকত, তাহলে লাইনের পেছনের মানুষগুলো আধা ঘণ্টা দাঁড়িয়ে থাকত।

আসলে যা হয়: cashier টাকা নেয়, একটা **order slip** লিখে **order board**-এ ঝুলিয়ে দেয়, আর আপনাকে একটা নম্বর দিয়ে বলে "একটু বসুন"। পরের customer সাথে সাথে order দিতে পারে। রান্নাঘরে chef-রা board থেকে একটা একটা slip তুলে নেয়, যার হাত খালি সে পরেরটা নেয়।

- **Cashier = Producer**: কাজটা তৈরি করে, কিন্তু নিজে করে না
- **Order board = Queue (Broker)**: কাজগুলো লাইনে ধরে রাখে
- **Chef-রা = Consumer**: নিজের গতিতে তুলে নিয়ে কাজ শেষ করে

একজন chef অসুস্থ হলে cashier থামে না, slip-গুলো board-এ জমতে থাকে। ভিড় বেশি হলে মালিক আরেকজন chef বসিয়ে দেয়। Message Queue ঠিক এই কাজটাই করে software-এ।`,
    diagrams: [
      {
        id: "day-012-analogy",
        caption:
          "রেস্টুরেন্ট: cashier slip ঝোলায়, chef-রা board থেকে নিজের গতিতে তুলে নেয়।",
        alt: "Customer cashier-কে order দেয়, cashier order board-এ তিনটা slip ঝোলায়, তিনজন chef board থেকে slip তুলে নিচ্ছে।",
      },
    ],
  },

  coreConcept: {
    markdown: `**Message Queue** দুটো service-এর মাঝে একটা মধ্যস্থতাকারী (broker), যেটা message ধরে রাখে যতক্ষণ না কেউ সেটা process করে।

তিনটা চরিত্র:
- **Producer**: যে message পাঠায়। আমাদের উদাহরণে Order Service, যে বলে "order #42 হয়েছে, email পাঠাও"।
- **Broker (Queue)**: যে message জমা রাখে। যেমন RabbitMQ, Amazon SQS, Apache Kafka।
- **Consumer (Worker)**: যে message তুলে নিয়ে আসল কাজটা করে। যেমন Email Worker।

এখন Order Service শুধু payment নিশ্চিত করে, তারপর queue-তে তিনটা message রেখে সাথে সাথে user-কে "Order সফল" বলে দেয়, ~১২০ms-এ। Email, PDF, SMS পরে হয়।

এতে তিনটা বড় লাভ:
1. **Asynchronous processing**: user ধীর কাজের জন্য অপেক্ষা করে না। (Day 7-এর latency-র কথা মনে আছে? User যে latency অনুভব করে, সেটা কমে যায়।)
2. **Decoupling**: Order Service জানেই না SMS Gateway down। Message-টা queue-তে অপেক্ষা করবে, Gateway ফিরলে চলে যাবে। একটা অংশ ভাঙলে বাকিটা চলে (Day 6-এর availability)।
3. **Traffic buffering**: sale-এর spike-এ message-গুলো queue-তে জমে, worker-রা নিজের গতিতে শেষ করে। আর দরকার হলে শুধু worker বাড়ালেই হয়।

কেন এটা বিনামূল্যে না? কারণ এখন "order সফল" মানে "কাজগুলো হবে", "হয়ে গেছে" না। Email কয়েক সেকেন্ড দেরিতে যেতে পারে, আর system-এ একটা নতুন অংশ (broker) এলো, যেটাকেও চালু রাখতে আর monitor করতে হবে।`,
    diagrams: [
      {
        id: "day-012-main",
        caption:
          "পরে: Order Service শুধু queue-তে message রাখে; worker-রা নিজের গতিতে তুলে নিয়ে কাজ করে।",
        alt: "Client Order Service-কে order দেয়, Order Service একটা queue-তে message publish করে, তিনটা worker (Email, Invoice, Warehouse) queue থেকে message নেয়।",
        downloadable: true,
      },
      {
        id: "day-012-before-after",
        caption:
          "পাশাপাশি: synchronous call-এ user ~৩.২s অপেক্ষা করে, queue দিয়ে ~১২০ms। (সংখ্যাগুলো উদাহরণ)",
        alt: "বামে আগের synchronous design, ডানে queue-ভিত্তিক design, নিচে latency-র পার্থক্য।",
      },
    ],
  },

  deepDive: [
    {
      title: "একটা message-এর জীবনচক্র: publish থেকে delete",
      markdown: `Message queue-তে রাখা মানেই কাজ শেষ না। একটা message কয়েকটা অবস্থার মধ্য দিয়ে যায়:

1. **Publish**: Producer message পাঠায়। ভালো broker message disk-এ লিখে তবে "পেয়েছি" (confirm) বলে, যাতে broker restart হলেও না হারায়।
2. **Deliver**: একটা consumer message নেয়। এখন message **in-flight**: queue থেকে সরানো হয়নি, কিন্তু অন্য কেউ নিতেও পারবে না।
3. **Process**: Consumer আসল কাজটা করে (email পাঠায়)।
4. **Acknowledge (ack)**: কাজ শেষ হলে consumer broker-কে বলে "শেষ"। তখনই broker message মুছে দেয়।

ack না এলে কী হবে? Broker ধরে নেয় consumer মারা গেছে, তাই message আবার দৃশ্যমান করে দেয়, যাতে অন্য কেউ নিতে পারে। Amazon SQS এই অপেক্ষার সময়কে বলে **visibility timeout** (default ৩০ সেকেন্ড, সর্বোচ্চ ১২ ঘণ্টা)। RabbitMQ-তে consumer-এর connection কেটে গেলে তার unacked message আবার queue-তে ফিরে যায়।

**Auto-ack-এর ফাঁদ:** অনেক library-তে "auto-ack" থাকে, মানে message হাতে পাওয়ার সাথে সাথেই ack চলে যায়। তখন কাজের মাঝখানে consumer crash করলে message চিরতরে হারিয়ে যায়। নিয়ম: **ack দিন কাজ শেষ হওয়ার পরে, আগে না।**

**Visibility timeout কত দেবেন?** কাজ যত সময় নেয়, তার চেয়ে বেশি। কাজ ২ মিনিট নিলে আর timeout ৩০ সেকেন্ড হলে, কাজ চলার মধ্যেই message আবার দৃশ্যমান হবে, অন্য worker-ও একই order process শুরু করবে।`,
      diagrams: [
        {
          id: "day-012-lifecycle",
          caption:
            "ধাপে ধাপে: publish → deliver → ack → delete; ack না এলে আবার deliver, বারবার fail করলে DLQ।",
          alt: "Producer, Queue, Consumer আর DLQ-এর মধ্যে message-এর আদান-প্রদানের sequence diagram।",
        },
      ],
    },
    {
      title:
        "Delivery guarantee: at-most-once, at-least-once আর 'exactly-once'",
      markdown: `Network আর machine যেকোনো সময় fail করতে পারে, তাই broker তিন রকম প্রতিশ্রুতি দিতে পারে:

- **At-most-once**: message একবার বা একবারও না। Auto-ack এরকম। দ্রুত, কিন্তু message হারাতে পারে। Metrics বা log-এর মতো জিনিস, যেখানে দু-একটা হারালে ক্ষতি নেই, সেখানে চলে।
- **At-least-once**: message অন্তত একবার পৌঁছাবে, কিন্তু **একাধিকবারও** পৌঁছাতে পারে। Manual ack এরকম। বেশিরভাগ system এটাই ব্যবহার করে।
- **Exactly-once**: শুনতে আদর্শ, কিন্তু সাধারণ অর্থে প্রায় অসম্ভব। ভাবুন consumer email পাঠাল, তারপর ack পাঠানোর আগেই crash করল। Broker জানে না email গেছে কিনা, তাই আবার পাঠাবে। দুই আলাদা system-এর (broker আর email) মধ্যে "একবারই" নিশ্চিত করার উপায় নেই।

তাই বাস্তবে যা করা হয়: **at-least-once + idempotent consumer = effectively-once।** Consumer আগে দেখে নেয় এই order-এর email আগেই গেছে কিনা (যেমন database-এ processed order id রাখা)। গেলে আবার পাঠায় না, শুধু ack দেয়।

Idempotent মানে একই কাজ দশবার করলেও ফল একবার করার মতোই হবে। "Balance = 500 set করো" idempotent, "Balance-এ 500 যোগ করো" না। এই বিষয়ে Day 57-এ আরও গভীরে যাব।`,
    },
    {
      title: "Retry, poison message আর Dead Letter Queue (DLQ)",
      markdown: `কিছু message process করতে গিয়ে fail হয়। কারণ দুই রকম:

- **সাময়িক (transient)**: Email server ১০ সেকেন্ড down ছিল। একটু পরে **retry** করলেই হবে। প্রতিবার অপেক্ষা বাড়ানো ভালো (১s, ২s, ৪s... একে বলে **exponential backoff**), যাতে ভাঙা service-এর উপর চাপ না বাড়ে।
- **স্থায়ী**: Message-এর data-ই ভুল, যেমন email address ফাঁকা। এটা হাজারবার retry করলেও fail করবে। একে বলে **poison message**।

Poison message-এর বিপদ: সীমাহীন retry দিলে সেটা বারবার queue-এর সামনে ফিরে আসে, worker-এর সময় খেয়ে ফেলে, আর একজন worker থাকলে পেছনের সব ভালো message আটকে যায়।

সমাধান: **সর্বোচ্চ retry সংখ্যা** ঠিক করুন, তারপর message-টা **Dead Letter Queue (DLQ)**-এ সরিয়ে দিন। DLQ হলো আলাদা একটা queue, যেখানে "বারবার fail করা" message-গুলো জমা থাকে। মুছে ফেলা হয় না, কারণ:
- পরে কেউ দেখে বুঝতে পারে কেন fail করেছে
- Bug ঠিক করার পর DLQ থেকে আবার মূল queue-তে পাঠানো (redrive) যায়

SQS-এ এটা **redrive policy**: একটা message **maxReceiveCount** বার নেওয়া হলেও শেষ না হলে DLQ-তে চলে যায়। RabbitMQ-তে **dead-letter exchange** দিয়ে একই কাজ হয়।

একটা জরুরি অভ্যাস: **DLQ-তে alert রাখুন।** DLQ চুপচাপ ভরে যাচ্ছে মানে আপনার customer-রা email পাচ্ছে না, অথচ কেউ জানে না।`,
    },
    {
      title: "Ordering: queue কি সবসময় ক্রম রাখে?",
      markdown: `"Queue মানে তো FIFO, ক্রম তো ঠিক থাকবেই", এটা সবচেয়ে প্রচলিত ভুল ধারণা।

একটা queue আর **একজন** consumer থাকলে ক্রম ঠিক থাকে। কিন্তু throughput বাড়াতে আমরা একাধিক consumer রাখি (**competing consumers**)। তখন:
- Message ১ নিল worker A (ধীর), message ২ নিল worker B (দ্রুত), তাই ২ আগে শেষ হলো
- Message ১ fail করে retry হলো, ততক্ষণে ২, ৩ শেষ

অর্থাৎ **একাধিক consumer আর পুরো queue-জুড়ে কঠোর ক্রম একসাথে পাওয়া যায় না।** এটা একটা মৌলিক trade-off।

বাস্তব সমাধান: সব message-এর ক্রম লাগে না, লাগে **একই জিনিসের** message-গুলোর। যেমন order #42-এর "created → paid → shipped" ক্রমে আসা দরকার, কিন্তু order #42 আর #43-এর মধ্যে ক্রম কোনো ব্যাপার না। তাই message-কে একটা **key** (order id) দিয়ে ভাগ করা হয়:
- SQS FIFO queue-তে **message group id**: একই group-এর message ক্রমে, আলাদা group parallel-এ
- Kafka-তে **partition key**: একই key সবসময় একই partition-এ যায়, আর partition-এর ভেতরে ক্রম ঠিক থাকে

এভাবে "প্রতিটা order-এর ভেতরে ক্রম" ঠিক থাকে, অথচ হাজারটা order একসাথে চলে।`,
    },
    {
      title: "Queue বনাম Pub/Sub, আর Kafka কেন আলাদা",
      markdown: `দুই ধরনের message বিতরণ আছে:

- **Point-to-point (Queue)**: প্রতিটা message **একজন** consumer পায়। কাজ ভাগ করে দেওয়ার জন্য (email worker-রা নিজেদের মধ্যে কাজ ভাগ করে)।
- **Publish/Subscribe (Topic)**: প্রতিটা message **প্রতিটা** subscriber-এর কাছে একটা কপি যায়। "Order হয়েছে" event-টা Email, Analytics আর Fraud check, তিনজনই আলাদাভাবে পাবে (fan-out)।

**Apache Kafka** একটু আলাদাভাবে ভাবে। এটা message-কে একটা **log**-এ লিখে রাখে, consume করলেও মোছে না (retention সময় পর্যন্ত থাকে)। প্রতিটা topic কয়েকটা **partition**-এ ভাগ, আর প্রতিটা message-এর একটা ক্রমিক নম্বর, **offset**।

Consumer-রা **consumer group**-এ থাকে। একটা group-এর ভেতরে প্রতিটা partition একজন consumer পড়ে (তাই group-এর ভেতরে কাজ ভাগ হয়), আর প্রতিটা group নিজের offset নিজে মনে রাখে (তাই আলাদা group-গুলো pub/sub-এর মতো সবাই সব পায়)।

এর বড় সুবিধা **replay**: offset পিছিয়ে দিলে পুরনো event আবার পড়া যায়, যেমন নতুন analytics service গত সাত দিনের সব order থেকে হিসাব শুরু করতে পারে। Kafka নিয়ে Day 56-এ বিস্তারিত হবে।`,
      diagrams: [
        {
          id: "day-012-partitions",
          caption:
            "Kafka-র ভেতরে: partition-এ offset দেওয়া message, আর প্রতিটা consumer group নিজের অবস্থান মনে রাখে।",
          alt: "orders topic-এর দুটো partition, প্রতিটায় offset 0 থেকে 7; Email group আর Analytics group আলাদা offset-এ পড়ছে।",
        },
      ],
    },
    {
      title: "কী মাপবেন: queue depth, consumer lag আর backpressure",
      markdown: `Queue ভালো চলছে কিনা বোঝার সবচেয়ে গুরুত্বপূর্ণ সংখ্যা **queue depth** (কয়টা message অপেক্ষায়) আর **age of oldest message** (সবচেয়ে পুরনোটা কতক্ষণ অপেক্ষা করছে)। Kafka-তে একে বলে **consumer lag**।

একটা সহজ হিসাব: ৩ জন worker, প্রতিটা message-এ ২০০ms লাগে। তাহলে প্রতি worker সেকেন্ডে ৫টা, মোট **১৫ message/s**। Sale-এ আসছে ২৫/s। প্রতি সেকেন্ডে ১০টা করে জমছে, ৫ মিনিটে ৩,০০০টা backlog।

Depth ক্রমাগত বাড়তে থাকলে মানে consumer-রা পেরে উঠছে না। তখন:
- **Consumer বাড়ান**: queue depth দেখে autoscale করা খুব প্রচলিত (Day 87)
- **Producer-কে ধীর করুন (backpressure)**: queue প্রায় ভর্তি হলে নতুন কাজ নেওয়া কমান বা বাতিল করুন, যাতে memory/disk শেষ না হয় (Day 58)

মনে রাখবেন, queue সমস্যা লুকিয়ে রাখতে পারে। User খুশি (দ্রুত উত্তর পেয়েছে), কিন্তু পেছনে ২ ঘণ্টার backlog, email ২ ঘণ্টা দেরিতে যাচ্ছে। তাই depth আর oldest message-এর বয়সে alert রাখুন।`,
    },
  ],

  simulator: "message-queue-lab",

  tradeOffs: {
    markdown: `**কখন queue ব্যবহার করবেন:** কাজটা পরে হলেও চলে (email, PDF, thumbnail, report); ধীর বা অনির্ভরযোগ্য বাইরের service-কে call করতে হয়; traffic হঠাৎ বাড়ে-কমে; এক event অনেক জায়গায় পাঠাতে হয়।

**কখন করবেন না:** User-কে এখনই ফলাফল দেখাতে হবে (payment authorize হলো কিনা, login ঠিক কিনা), কারণ queue-তে দিয়ে উত্তরের জন্য অপেক্ষা করা মানে জটিলতা বাড়িয়ে সেই synchronous call-ই করা। খুব ছোট app-এ, যেখানে একটা background thread-ই যথেষ্ট, broker চালানোর খরচ লাভের চেয়ে বেশি।

তিনটা জনপ্রিয় tool পাশাপাশি:`,
    table: {
      headers: ["বিষয়", "RabbitMQ", "Apache Kafka", "Amazon SQS"],
      rows: [
        [
          "মূল ধারণা",
          "Message broker (AMQP)",
          "Distributed log",
          "AWS-এর managed queue",
        ],
        [
          "Consume করার পর message",
          "Ack হলে মুছে যায়",
          "থেকে যায় retention পর্যন্ত; consumer offset রাখে",
          "Delete করলে মুছে যায় (retention সর্বোচ্চ ১৪ দিন)",
        ],
        [
          "Ordering",
          "Queue-তে FIFO, কিন্তু একাধিক consumer বা requeue-তে ভাঙতে পারে",
          "শুধু partition-এর ভেতরে",
          "Standard: best-effort; FIFO: message group-এর ভেতরে",
        ],
        [
          "পুরনো message আবার পড়া (replay)",
          "সাধারণত না (Streams feature ছাড়া)",
          "হ্যাঁ, offset পিছিয়ে",
          "না",
        ],
        [
          "Routing",
          "Exchange দিয়ে নমনীয় routing",
          "Topic আর partition key",
          "সহজ: queue প্রতি এক ধারা",
        ],
        [
          "উপযুক্ত",
          "Background job, task queue, জটিল routing",
          "Event streaming, অনেক consumer, analytics, replay",
          "AWS-এ, নিজে server না চালিয়ে সহজ queue",
        ],
        [
          "চালানোর ঝামেলা",
          "নিজে চালাতে হয় (managed option আছে)",
          "Cluster চালানো সবচেয়ে জটিল (managed option আছে)",
          "AWS চালায়",
        ],
      ],
    },
  },

  industry: {
    markdown: `- **Apache Kafka** তৈরি হয়েছিল LinkedIn-এ, তাদের বিশাল activity data (page view, click) এক জায়গা থেকে অনেক system-এ পৌঁছানোর জন্য। ২০১১ সালে open source হয়, পরে Apache Software Foundation-এর project হয়।
- **Amazon SQS** AWS-এর একদম শুরুর দিকের service-গুলোর একটা। এটা দেখায়, বড় distributed system বানাতে queue কতটা মৌলিক।
- **RabbitMQ** AMQP 0-9-1 protocol implement করে, আর exchange দিয়ে message কোন queue-তে যাবে তা নমনীয়ভাবে ঠিক করা যায়।

সাধারণ ব্যবহার, প্রায় সব বড় backend-এ:
- Order-এর পরে email/SMS/invoice (আমাদের উদাহরণ)
- ছবি বা video upload-এর পরে resize ও encode
- Report বা export তৈরি, যেটা কয়েক মিনিট নেয়
- Event ছড়িয়ে দেওয়া: এক "order created" থেকে inventory, analytics, recommendation সবাই নিজের মতো কাজ করে (Day 65: Event-Driven Architecture)

*উৎস: Apache Kafka documentation (kafka.apache.org); Amazon SQS Developer Guide (visibility timeout, retention, redrive policy); RabbitMQ documentation (AMQP 0-9-1, dead letter exchanges)।*`,
  },

  mistakes: [
    {
      mistake:
        "Auto-ack চালু রেখে কাজ করা। Worker কাজের মাঝখানে crash করলে message নিঃশব্দে হারিয়ে যায়।",
      fix: "Manual ack ব্যবহার করুন, আর ack দিন কাজ শেষ হওয়ার পরে।",
    },
    {
      mistake:
        "ধরে নেওয়া যে message ঠিক একবারই আসবে। At-least-once-এ duplicate আসবেই, তখন email দুবার যায়, টাকা দুবার কাটে।",
      fix: "Consumer-কে idempotent বানান: message id বা order id দিয়ে আগে দেখুন কাজটা আগেই হয়েছে কিনা।",
    },
    {
      mistake:
        "সীমাহীন retry। একটা poison message বারবার ফিরে এসে worker আটকে রাখে।",
      fix: "সর্বোচ্চ retry সংখ্যা আর backoff ঠিক করুন, তারপর DLQ। DLQ-তে alert রাখুন।",
    },
    {
      mistake:
        "Visibility timeout কাজের সময়ের চেয়ে কম রাখা, ফলে একই message দুজন worker একসাথে process করে।",
      fix: "Timeout কাজের সবচেয়ে বেশি সময়ের চেয়ে বেশি রাখুন, অথবা লম্বা কাজে মাঝে মাঝে timeout বাড়িয়ে নিন।",
    },
    {
      mistake: "একাধিক consumer রেখেও পুরো queue-জুড়ে কঠোর ক্রম আশা করা।",
      fix: "যাদের ক্রম লাগে তাদের একই key (message group / partition key) দিন; বাকিদের ক্রম নিয়ে চিন্তা বাদ দিন।",
    },
    {
      mistake:
        "Queue depth আর DLQ monitor না করা। User দ্রুত উত্তর পায়, কিন্তু পেছনে ঘণ্টার পর ঘণ্টার backlog।",
      fix: "Queue depth, সবচেয়ে পুরনো message-এর বয়স আর DLQ size-এ alert রাখুন।",
    },
  ],

  lab: [
    {
      title: "RabbitMQ চালু করুন",
      markdown: `Docker দিয়ে management UI সহ RabbitMQ চালান:

\`\`\`bash
docker run -d --name rabbit -p 5672:5672 -p 15672:15672 rabbitmq:3.13-management
pip install pika
\`\`\`

Browser-এ \`http://localhost:15672\` খুলুন (user: \`guest\`, password: \`guest\`)। Queues tab-এ আমরা message জমা হওয়া দেখব।`,
    },
    {
      title: "Producer: ৫টা order পাঠান",
      markdown: `\`producer.py\` নামে রাখুন। Order 999 ইচ্ছা করে "poison"।

\`\`\`python
import json
import pika

conn = pika.BlockingConnection(pika.ConnectionParameters("localhost"))
ch = conn.channel()

# Fail করা message এই DLQ-তে যাবে
ch.queue_declare(queue="orders.dlq", durable=True)
ch.queue_declare(
    queue="orders",
    durable=True,
    arguments={"x-dead-letter-exchange": "", "x-dead-letter-routing-key": "orders.dlq"},
)

for order_id in [101, 102, 103, 104, 999]:
    ch.basic_publish(
        exchange="",
        routing_key="orders",
        body=json.dumps({"order_id": order_id}),
        properties=pika.BasicProperties(delivery_mode=2),  # disk-এ রাখো
    )
    print("published", order_id)

conn.close()
\`\`\`

\`python producer.py\` চালান। UI-তে \`orders\` queue-তে **Ready: 5** দেখবেন। এখনো কেউ নেয়নি, তাই message অপেক্ষা করছে।`,
    },
    {
      title: "Consumer: manual ack দিয়ে কাজ করুন",
      markdown: `\`worker.py\`:

\`\`\`python
import json
import time
import pika

conn = pika.BlockingConnection(pika.ConnectionParameters("localhost"))
ch = conn.channel()
ch.queue_declare(queue="orders.dlq", durable=True)
ch.queue_declare(
    queue="orders",
    durable=True,
    arguments={"x-dead-letter-exchange": "", "x-dead-letter-routing-key": "orders.dlq"},
)
ch.basic_qos(prefetch_count=1)  # একবারে একটাই message নাও


def handle(ch, method, properties, body):
    order = json.loads(body)
    print("processing", order["order_id"])
    time.sleep(3)  # ধীর কাজের ভান
    if order["order_id"] == 999:
        print("  ✕ fail → DLQ")
        ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        return
    print("  ✓ email sent")
    ch.basic_ack(delivery_tag=method.delivery_tag)  # কাজ শেষে ack


ch.basic_consume(queue="orders", on_message_callback=handle)
print("waiting for orders...")
ch.start_consuming()
\`\`\`

\`python worker.py\` চালান। একটা একটা করে order process হবে, আর 999 \`orders.dlq\`-তে চলে যাবে।

দুটো জায়গায় একই \`arguments\` দিয়ে queue declare করা হয়েছে। ভিন্ন হলে RabbitMQ \`PRECONDITION_FAILED\` error দেয়।`,
    },
    {
      title: "পরীক্ষা ১: ack-এর আগে worker মেরে দিন",
      markdown: `আবার \`python producer.py\` চালান, তারপর worker চালু করে "processing ..." দেখার সাথে সাথে **Ctrl+C** দিন (৩ সেকেন্ডের ঘুম শেষ হওয়ার আগে)।

UI-তে দেখুন: message হারায়নি, **Unacked** থেকে আবার **Ready**-তে ফিরে এসেছে। Worker আবার চালালে সেটাই প্রথমে process হবে। এটাই manual ack-এর সুরক্ষা।`,
    },
    {
      title: "পরীক্ষা ২: দুজন worker (competing consumers)",
      markdown: `দুটো আলাদা terminal-এ \`python worker.py\` চালান, তারপর producer চালান। দেখবেন order-গুলো দুজনের মধ্যে ভাগ হয়ে যাচ্ছে, আর মোট সময় প্রায় অর্ধেক। খেয়াল করুন, শেষ হওয়ার ক্রম আর পাঠানোর ক্রম সবসময় এক না।

শেষে পরিষ্কার করুন:

\`\`\`bash
docker rm -f rabbit
\`\`\``,
    },
  ],

  connections: {
    markdown: `- **Day 2 · Client-Server**: সেখানে client সরাসরি server-কে call করে উত্তরের জন্য অপেক্ষা করত। Queue সেই সরাসরি সম্পর্ক ভেঙে মাঝে একটা বাফার বসায়।
- **Day 6 · Availability**: Decoupling-এর কারণে একটা ছোট service down হলে পুরো system পড়ে না। Message অপেক্ষা করে।
- **Day 7 · Latency vs Throughput**: User-এর latency কমে, কারণ ধীর কাজ পেছনে চলে যায়। আর worker বাড়িয়ে throughput বাড়ানো যায়।
- **Day 9 · Load Balancers**: Load balancer request *ঠেলে* server-এ পাঠায়; queue-তে worker-রা নিজেরাই কাজ *টেনে* নেয়। ব্যস্ত worker নতুন কাজ নেয় না, তাই load আপনা আপনি ভাগ হয়।

সামনে যা আসছে: Day 56-এ Kafka গভীরে, Day 57-এ Idempotency ও Retry, Day 58-এ Backpressure, Day 65-এ Event-Driven Architecture, আর Day 66-এ Outbox Pattern (database-এ লেখা আর message পাঠানো একসাথে নিশ্চিত করা)।`,
  },

  explainYourself: [
    {
      question:
        'আপনার teammate বলছে, "queue দিলে system দ্রুত হয়ে যাবে।" কথাটা কতটা ঠিক?',
      idealAnswer:
        "আংশিক ঠিক। User যে latency দেখে সেটা কমে, কারণ ধীর কাজ request-এর বাইরে চলে যায়। কিন্তু কাজটা নিজে দ্রুত হয় না, বরং মাঝে broker-এর একটা ধাপ যোগ হয়। মোট throughput বাড়ে শুধু তখনই, যখন আমরা consumer বাড়াই। Queue আসলে কাজকে 'এখন'-এর বদলে 'পরে' করে, আর spike শোষণ করে।",
    },
    {
      question:
        "Consumer email পাঠানোর পর কিন্তু ack দেওয়ার আগে crash করল। কী ঘটবে, আর কিভাবে সামলাবেন?",
      idealAnswer:
        "Broker ack পায়নি, তাই visibility timeout শেষে (বা connection কেটে যাওয়ায়) message আবার দৃশ্যমান হবে, আর অন্য consumer সেটা আবার process করবে। ফলে email দুবার যাবে। এটা at-least-once delivery-র স্বাভাবিক ফল। সমাধান হলো consumer-কে idempotent বানানো: email পাঠানোর আগে order id দিয়ে দেখা আগেই পাঠানো হয়েছে কিনা, হয়ে থাকলে শুধু ack দেওয়া।",
    },
    {
      question:
        "DLQ-তে পাঠানো মানে কি message মুছে ফেলা? DLQ না থাকলে কী সমস্যা হতো?",
      idealAnswer:
        "না, DLQ একটা আলাদা queue, যেখানে বারবার fail করা message জমা থাকে, পরে দেখা বা ঠিক করে আবার পাঠানোর জন্য। DLQ না থাকলে poison message সীমাহীনভাবে retry হতো, worker-এর সময় নষ্ট করত, আর পেছনের ভালো message-গুলো আটকে যেত; অথবা কয়েকবার পরে মুছে ফেললে আমরা জানতেই পারতাম না কোন order-এর কাজ হয়নি।",
    },
  ],

  interviewQuestions: [
    {
      question:
        "আপনার system-এ কেন একটা message queue যোগ করবেন? কী trade-off আছে?",
      answerOutline: `- সমস্যা দিয়ে শুরু: synchronous chain-এ latency যোগ হয়, আর এক service fail করলে পুরোটা fail
- লাভ: async processing (কম user latency), decoupling (failure isolation), traffic buffering (spike শোষণ), consumer বাড়িয়ে scale
- খরচ: eventual completion (কাজ পরে হয়), নতুন component চালানো ও monitor করা, duplicate/ordering সামলানো
- কখন না: যেখানে ফলাফল তখনই লাগে`,
    },
    {
      question: "At-least-once delivery-তে duplicate message কিভাবে সামলাবেন?",
      answerOutline: `- কেন duplicate: ack-এর আগে crash, visibility timeout শেষ, network-এ ack হারানো
- Exactly-once সাধারণভাবে অসম্ভব; লক্ষ্য effectively-once
- Idempotent consumer: idempotency key / message id, processed-id table (unique constraint), অথবা স্বভাবতই idempotent operation (set, upsert)
- Side effect আর "processed" চিহ্ন একই transaction-এ লেখা গেলে সবচেয়ে ভালো`,
    },
    {
      question: "Queue-তে একাধিক consumer থাকলে message-এর ক্রম কিভাবে রাখবেন?",
      answerOutline: `- Competing consumers + retry মানে global ordering ভাঙে
- প্রশ্ন করুন: কার ক্রম লাগে? সাধারণত একটা entity-র (order, user)
- Key দিয়ে ভাগ: SQS FIFO message group, Kafka partition key, প্রতিটা key একজন consumer-এর হাতে
- Trade-off: একটা ব্যস্ত key (hot key) একটা partition-কে ধীর করতে পারে`,
    },
    {
      question: "একটা message বারবার fail করছে আর queue আটকে যাচ্ছে। কী করবেন?",
      answerOutline: `- Transient বনাম poison message আলাদা করুন
- Retry with exponential backoff (এবং jitter)
- Max retries / maxReceiveCount, তারপর DLQ
- DLQ-তে alert, কারণ খুঁজে fix করে redrive
- Metrics: retry count, DLQ size, oldest message age`,
    },
    {
      question: "Kafka আর RabbitMQ-এর মধ্যে কখন কোনটা বাছবেন?",
      answerOutline: `- RabbitMQ: task queue, background job, জটিল routing, message consume হলে মুছে যাওয়াই ঠিক
- Kafka: high-volume event stream, অনেক আলাদা consumer group, replay লাগবে, partition-এ ক্রম
- Operational খরচ: Kafka cluster বেশি জটিল; managed service (যেমন SQS) ছোট দলের জন্য সহজ
- উত্তর সবসময় use case দিয়ে শেষ করুন, "সবচেয়ে ভালো tool" বলে না`,
    },
  ],

  summary: {
    points: [
      "Message Queue producer আর consumer-এর মাঝে message ধরে রাখে, তাই ধীর কাজ request-এর বাইরে চলে যায়।",
      "তিন লাভ: কম user latency (async), একটা অংশ ভাঙলেও বাকিটা চলে (decoupling), আর spike শোষণ (buffering)।",
      "Ack দিন কাজ শেষে; ack না এলে visibility timeout-এর পরে message আবার আসে।",
      "At-least-once-এ duplicate আসবেই, তাই consumer-কে idempotent বানান।",
      "Max retries-এর পরে poison message DLQ-তে যাক, আর DLQ-তে alert রাখুন।",
      "একাধিক consumer-এ global ক্রম থাকে না; দরকারে key দিয়ে ক্রম রাখুন।",
      "Queue depth আর সবচেয়ে পুরনো message-এর বয়সই সবচেয়ে জরুরি metric।",
    ],
    diagram: {
      id: "day-012-summary",
      caption: "এক নজরে Message Queues",
      alt: "Producer থেকে queue হয়ে worker-দের কাছে message, পাশে DLQ।",
    },
  },
};
