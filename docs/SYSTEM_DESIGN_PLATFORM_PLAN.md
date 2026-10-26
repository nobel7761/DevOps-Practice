# System Design শেখার Interactive Platform — Content ও Feature Plan

> **এই document কার জন্য:** এটা একটা AI coding assistant (Claude in VS Code)-এর জন্য লেখা plan। আমাদের platform **আগে থেকেই আছে**, তাই এখানে নতুন project setup বা tech stack নিয়ে কিছু নেই। এখানে বলা আছে কী কী content আর feature যোগ করতে হবে, topic-গুলো কোন ক্রমে সাজাতে হবে, প্রতিটা lesson আর case study-র কাঠামো কেমন হবে, আর কোন ক্রমে কাজ করতে হবে।
>
> **Builder-এর প্রতি নির্দেশ:**
>
> 1. পুরো document আগে পড়ো।
> 2. তারপর existing codebase ভালো করে দেখো: কোন framework, content কিভাবে রাখা হয়েছে, component কিভাবে লেখা, progress কোথায় save হয়, diagram কিভাবে বানানো হয়। **নতুন সব কিছু existing pattern আর stack মেনে বানাবে।** নতুন library শুধু খুব দরকার হলে, আর আমাকে জিজ্ঞেস করে।
> 3. Section 13-এর milestone অনুযায়ী এক একটা milestone করে কাজ করো। প্রতিটা milestone শেষে থেমে আমাকে দেখাও, আমার OK পেলে পরেরটায় যাও।
> 4. কোনো জায়গায় এই document অস্পষ্ট মনে হলে, বা existing codebase-এর সাথে মিলছে না, নিজে অনুমান করে এগিয়ে যাবে না। আমাকে জিজ্ঞেস করবে।

### সূচিপত্র

1. লক্ষ্য (Vision)
2. Content-এর উৎস ও মৌলিকতা
3. ভাষা ও লেখার নিয়ম
4. Topic-এর ক্রম (117টা, ১৫টা Phase) · 4.1 ক্রম নিয়ে কিছু নিয়ম
5. প্রতিটা Topic Lesson-এর Template · 5.1 Recall Map
6. Visual ও Diagram নির্দেশিকা
7. Quiz System
8. LinkedIn Post
9. Interactive Components (Simulator) · 9.1 Simulator Standard · 9.2 Load Balancer Lab · 9.3 Message Queue Lab
10. Case Studies (34টা)
11. Progress ও অন্যান্য Feature
12. Platform-এ বর্তমান content থাকলে
13. Build Milestone
14. Quality Checklist

### এক নজরে: প্রতিটা Topic-এ যা থাকবে

| অংশ                          | পরিমাণ                                           | কোথায় বিস্তারিত |
| ---------------------------- | ------------------------------------------------ | ---------------- |
| Lesson (beginner → advanced) | ১৮টা section-এর template                         | Section 5        |
| Visual                       | ন্যূনতম ৬-৮টা diagram, সারাংশ card               | Section 6        |
| Simulator                    | যেখানে প্রযোজ্য, challenge সহ                    | Section 9        |
| Recall Map                   | ৬-১০টা core point, spaced repetition             | Section 5.1      |
| Quiz                         | 60টা প্রশ্নের bank, প্রতিবার 20টা, pass 95%      | Section 7        |
| LinkedIn Post                | ১টা post + প্রথম comment + download করার মতো ছবি | Section 8        |

---

## 1. লক্ষ্য (Vision)

একটা platform, যেখানে একজন beginner শূন্য থেকে শুরু করে **industry-level system design** শিখতে পারবে, **পুরোপুরি বাংলায়**।

- শুধু পড়ার জিনিস না, **interactive এবং visual**: diagram, animation, simulator, quiz, নিজে চেষ্টা করার অনুশীলন।
- **117টা topic**, ১৫টা phase-এ, নির্দিষ্ট ক্রমে (Section 4)। প্রতিদিন একটা topic।
- **Simulator শুধু দেখার জন্য না, খেলার মতো:** traffic পাঠানো, server বন্ধ করা, আর challenge পূরণ করা (Section 9)।
- **Recall Map:** প্রতিটা topic-এর core point দেখে নিজে মনে করে ব্যাখ্যা করা, আর কয়েক দিন পর পর আবার যাচাই, যাতে শেখা জিনিস মাথায় থেকে যায় (Section 5.1)।
- প্রতিটা topic-এ **60টা প্রশ্নের quiz bank**, যাতে মুখস্থ না করে সত্যিই বোঝা যাচাই হয় (Section 7)।
- প্রতিটা topic-এর সাথে একটা **LinkedIn post** আর তার জন্য **visual**, যেগুলো copy/download করে সরাসরি post করা যাবে (Section 8)।
- সব topic শেষ হলে **34টা real-world case study** (Section 10)।

## 2. Content-এর উৎস ও মৌলিকতা

- 117টা topic-এর মধ্যে **100টার নাম** নেওয়া হয়েছে https://learningsystemdesign.netlify.app/learn/ থেকে। বাকি **17টা নতুন যোগ করা** (Section 4-এ 🆕 চিহ্নিত), কারণ industry-level আর interview-এর জন্য এগুলো দরকার কিন্তু ওই তালিকায় নেই।
- **ক্রম ইচ্ছাকৃতভাবে website থেকে আলাদা।** শেখার যুক্তি অনুযায়ী সাজানো হয়েছে: আগের topic পরের topic-এর ভিত্তি তৈরি করে। শুধু Day 1-12 website-এর ক্রমেই আছে, কারণ ওগুলো ইতিমধ্যে LinkedIn-এ প্রকাশিত।
- **সব content Claude নিজে নতুন করে লিখবে**, beginner থেকে advanced level পর্যন্ত। ওই site বা অন্য কোনো article/বই থেকে লেখা কপি বা অনুবাদ করবে না।
- Technical তথ্যে সন্দেহ থাকলে official documentation দেখে যাচাই করবে। Real company-র উদাহরণ শুধু public engineering blog বা প্রমাণিত তথ্য থেকে নেবে, কিছু বানিয়ে লিখবে না।

## 3. ভাষা ও লেখার নিয়ম (Bangla Style Guide)

সব content এই নিয়ম মেনে লিখতে হবে।

1. **ব্যাখ্যা বাংলায়, technical term English-এ।** যেমন: "Load Balancer request-গুলোকে একাধিক server-এর মধ্যে ভাগ করে দেয়।" "ভার-সমতাকারী" জাতীয় জোর করে বানানো অনুবাদ ব্যবহার করবে না।
2. **প্রথমবার কোনো term এলে** তার পাশে এক লাইনে সহজ বাংলা অর্থ দাও, আর glossary-তে link করো।
3. **Analogy হবে বাংলাদেশের দৈনন্দিন জীবন থেকে।** যেমন: রেস্টুরেন্টের cashier আর kitchen, চায়ের দোকান, বাজার, ঢাকার ট্রাফিক, রিকশা স্ট্যান্ড, bKash, কুরিয়ার সার্ভিস, ব্যাংকের টোকেন সিস্টেম, বিয়ে বাড়ির খাবার পরিবেশন।
4. **ভাষা হবে বন্ধুর মতো, textbook-এর মতো না।** ছোট বাক্য, সরাসরি কথা।
5. **প্রতিটা concept-এর পেছনে "কেন" বলতে হবে।** কোন সমস্যা সমাধানের জন্য এটা এসেছে, আর এর trade-off কী।

## 4. Topic-এর ক্রম (117টা, ১৫টা Phase)

- **Day নম্বর = এই global নম্বর।**
- 🆕 = নতুন যোগ করা topic (website-এ নেই)।
- 🔒 = ইতিমধ্যে LinkedIn-এ প্রকাশিত। ক্রম বদলানো যাবে না।
- (ঐচ্ছিক) = সাধারণ backend role বা interview-এ কম আসে। Platform-এ "ঐচ্ছিক" badge দেখাবে, তবে content পুরোটাই থাকবে।

### Phase 1 · শুরু ও প্রথম ধারণা 🔒

1. সিস্টেম ডিজাইন আসলে কী?
2. Client, Server ও Internet
3. DNS, HTTP ও একটি URL-এর গল্প
4. API কী? REST-এর বেসিক
5. Scalability
6. Availability
7. Latency vs Throughput
8. CAP Theorem
9. Load Balancers
10. Databases
11. CDN
12. Message Queues

### Phase 2 · Scaling-এর মূল উপাদান

13. Vertical vs Horizontal Scaling
14. Stateful vs Stateless
15. Proxy Servers
16. API Gateway
17. Caching
18. Rate Limiting
19. Capacity Estimation (Napkin Math)

### Phase 3 · Database ও Storage গভীরে

20. SQL vs NoSQL
21. Data Modeling
22. Database Indexes
23. Storage Engines (LSM vs B-tree)
24. Bloom Filters
25. ACID vs BASE
26. 🆕 Transactions ও Isolation Levels (dirty read, phantom read, serializable)
27. 🆕 Optimistic vs Pessimistic Locking
28. Database Replication
29. Database Sharding
30. Data Partitioning Strategies
31. Consistent Hashing
32. 🆕 Unique ID Generation (UUID, Snowflake)
33. 🆕 Object Storage ও File Upload (S3, pre-signed URL, multipart/chunked upload)
34. 🆕 Search ও Inverted Index (Elasticsearch-এর মূল ধারণা)
35. 🆕 Geo-spatial Indexing (Geohash, Quadtree)

### Phase 4 · Computer ও Network-এর ভেতরে

36. 🆕 Process, Thread ও Concurrency
37. OSI ও TCP/IP Model
38. IP, Port ও Subnet
39. TCP vs UDP
40. DNS গভীরে
41. TLS/SSL Handshake
42. HTTP/1.1 vs HTTP/2 vs HTTP/3
43. WebSockets, SSE ও Long Polling
44. REST vs RPC vs GraphQL
45. gRPC ও Protocol Buffers
46. 🆕 API Design গভীরে (pagination, versioning, idempotency key, error format)

### Phase 5 · Distributed Systems Theory

47. Strong vs Eventual Consistency
48. Consistency Models
49. Quorum ও R+W>N
50. Time, Lamport ও Vector Clocks
51. Consensus Algorithms
52. Leader Election
53. 🆕 Distributed Locking (Redis lock, fencing token)
54. 2PC vs 3PC
55. CRDTs

### Phase 6 · Messaging ও Reliability

56. 🆕 Event Streaming গভীরে (Kafka: partition, consumer group, offset)
57. 🆕 Idempotency, Retry ও Exactly-once
58. Backpressure ও Batching
59. Circuit Breaker & Bulkhead

### Phase 7 · Architecture Patterns

60. Client-Server Architecture
61. Monolith vs Microservices
62. Microservices Architecture
63. 🆕 Service Discovery ও Service Mesh
64. Serverless Architecture
65. Event-Driven Architecture
66. 🆕 Outbox Pattern
67. Saga & Distributed Transactions
68. CQRS
69. 🆕 Fan-out ও News Feed Pattern

### Phase 8 · Data Engineering

70. OLTP vs OLAP
71. Warehouse, Lake ও Lakehouse
72. ETL vs ELT
73. Change Data Capture (CDC)
74. Batch vs Stream Processing

### Phase 9 · Security ও Privacy

75. Authentication vs Authorization
76. OAuth 2.0 ও OpenID Connect
77. JWT ও Session Management
78. Encryption ও TLS
79. Password Hashing (bcrypt, salt)
80. API Security ও OWASP Top 10
81. DDoS Mitigation

### Phase 10 · Deployment ও Infrastructure

82. Containers ও Docker
83. Kubernetes
84. CI/CD Pipeline
85. Blue-Green ও Canary Deploy
86. Infrastructure as Code
87. Autoscaling
88. Multi-region ও Edge

### Phase 11 · Observability ও SRE

89. Logging, Metrics, Tracing
90. SLI, SLO, SLA ও Error Budget
91. Alerting ও On-call
92. Chaos Engineering
93. Incident Response ও Postmortem
94. Disaster Recovery (RPO/RTO)

### Phase 12 · Low-Latency Engineering

95. Latency Budget ও Tail Latency
96. Lock-free ও Concurrency
97. Memory, Cache line ও NUMA (ঐচ্ছিক)
98. Kernel Bypass ও Zero-copy (ঐচ্ছিক)

### Phase 13 · ML / AI System Design

99. ML System Lifecycle
100. Feature Store
101. Model Serving (batch vs real-time)
102. Recommendation Systems
103. Ranking ও Embeddings
104. Vector Database ও ANN Search
105. RAG ও LLM Serving
106. A/B Testing ও Experimentation
107. Model Monitoring ও Drift

### Phase 14 · Blockchain ও Decentralized (ঐচ্ছিক)

108. Byzantine Fault Tolerance
109. Blockchain কীভাবে কাজ করে
110. Consensus: PoW vs PoS
111. Merkle Tree ও Hashing
112. Wallet ও Key Management
113. Smart Contracts (পরিচিতি)
114. P2P ও Decentralization Trade-off

### Phase 15 · Interview Prep

115. 🆕 Low-Level Design (LLD) পরিচিতি (OOP, SOLID, state machine, design pattern)
116. 🆕 System Design Interview-এর ৭ ধাপ (requirement → estimation → API → data model → HLD → deep dive → trade-off)
117. 🆕 Trade-off নিয়ে কথা বলা ও সাধারণ ভুল (interviewer আসলে কী দেখতে চায়, red flag)

### 4.1 ক্রম নিয়ে কিছু নিয়ম

**আগের দিকে আসা "আগাম" topic:** Day 8 (CAP Theorem) এসেছে Replication (28) আর Consistency (47-48)-এর আগে, কারণ এটা ইতিমধ্যে প্রকাশিত। এমন ক্ষেত্রে lesson-এ beginner level-এ যতটুকু দরকার ততটুকু বলবে, তারপর লিখবে "এখন এটুকু জানলেই চলবে, Day X-এ গভীরে যাব" (link সহ)। পরের topic-এ পৌঁছে আগের topic-এর দিকে ফিরে link দেবে।

**একই বিষয় দুইবার আসলে:** নিচের জোড়াগুলোতে প্রথমটা পরিচিতি, দ্বিতীয়টা গভীর আলোচনা। দ্বিতীয় lesson-এ আগেরটার ২-৩ লাইনের recap আর link দেবে, তারপর নতুন গভীরতায় যাবে। একই কথা আবার লিখবে না।

| পরিচিতি                            | গভীর আলোচনা                                        |
| ---------------------------------- | -------------------------------------------------- |
| 2 · Client, Server ও Internet      | 60 · Client-Server Architecture                    |
| 3 · DNS, HTTP ও URL-এর গল্প        | 40 · DNS গভীরে, 42 · HTTP versions                 |
| 4 · API কী? REST-এর বেসিক          | 44 · REST vs RPC vs GraphQL, 46 · API Design গভীরে |
| 5 · Scalability                    | 13 · Vertical vs Horizontal                        |
| 8 · CAP Theorem                    | 47 · Strong vs Eventual, 48 · Consistency Models   |
| 12 · Message Queues                | 56 · Event Streaming গভীরে                         |
| 29 · Database Sharding             | 30 · Data Partitioning Strategies                  |
| 36 · Process, Thread ও Concurrency | 96 · Lock-free ও Concurrency                       |
| 41 · TLS/SSL Handshake             | 78 · Encryption ও TLS                              |
| 51 · Consensus Algorithms          | 52 · Leader Election, 110 · PoW vs PoS             |
| 54 · 2PC vs 3PC                    | 67 · Saga & Distributed Transactions               |

## 5. প্রতিটা Topic Lesson-এর Template

প্রতিটা lesson এই ক্রমে সাজানো থাকবে। প্রতিটা section একটা reusable component হবে, existing codebase-এর pattern মেনে। প্রতিটা section-এ কোন visual লাগবে তা Section 6-এ বলা আছে।

1. **🎯 এই lesson শেষে আপনি পারবেন:** ৩-৫টা learning objective
2. **📋 আগে যা জানা দরকার:** prerequisite topic-এর link
3. **🤔 সমস্যাটা কী?:** একটা ছোট গল্প বা scenario, যেখানে এই concept ছাড়া system ভেঙে পড়ে
4. **🍵 সহজ উদাহরণে বুঝি (Analogy):** বাংলাদেশি জীবনের analogy
5. **📖 মূল ধারণা (Beginner):** সহজ ব্যাখ্যা + মূল diagram
6. **🔬 গভীরে যাই (Intermediate → Advanced):** ভেতরের mechanism, variant, algorithm। Collapsible section-এ, যাতে beginner চাপে না পড়ে
7. **🎮 নিজে চালিয়ে দেখুন:** topic-এর simulator, যদি থাকে (Section 9)
8. **⚖️ Trade-offs:** কখন ব্যবহার করবেন, কখন করবেন না। একটা comparison table
9. **🏢 Industry-তে কিভাবে ব্যবহার হয়:** real company-র উদাহরণ + জনপ্রিয় tool (Redis, Kafka, Nginx ইত্যাদি)
10. **⚠️ সাধারণ ভুল:** নতুনরা যেসব ভুল করে
11. **🛠️ Hands-on Lab:** Docker বা CLI দিয়ে নিজের computer-এ করার মতো ছোট experiment, ধাপে ধাপে
12. **🔗 আগের topic-এর সাথে সম্পর্ক:** এই topic আগের কোন topic-এর সাথে কিভাবে জোড়া লাগে
13. **✍️ নিজে ব্যাখ্যা করুন:** ২-৩টা খোলা প্রশ্ন। Learner textbox-এ উত্তর লিখবে, তারপর "আদর্শ উত্তর দেখুন" button
14. **💼 Interview প্রশ্ন:** এই topic নিয়ে interview-তে যা জিজ্ঞেস করা হয়, উত্তরের outline সহ
15. **📝 সারাংশ:** ৫-৭ লাইনের key takeaway, একটা সারাংশ visual সহ
16. **🧠 মনে আছে তো? (Recall Map):** Section 5.1 অনুযায়ী
17. **❓ Quiz:** Section 7 অনুযায়ী
18. **📣 LinkedIn Post:** Section 8 অনুযায়ী

### Content-এর গভীরতা

- **Beginner অংশ:** একজন CS student যেন প্রথমবার পড়েই বোঝে।
- **Advanced অংশ:** ৩-৫ বছরের অভিজ্ঞ engineer-ও যেন নতুন কিছু পায়। যেমন: Caching lesson-এ শুধু LRU না, cache stampede আর probabilistic early expiration পর্যন্ত। Message Queue lesson-এ visibility timeout, poison message আর ordering-এর সীমাবদ্ধতা পর্যন্ত।
- **মানদণ্ড:** _Designing Data-Intensive Applications_ বইয়ের গভীরতা, কিন্তু অনেক সহজ ভাষায়।

### 5.1 🧠 মনে আছে তো? (Recall Map)

**উদ্দেশ্য:** পড়ে বোঝা আর নিজে থেকে মনে করে বুঝিয়ে বলতে পারা দুটো আলাদা জিনিস। এই section দিয়ে learner যাচাই করবে topic-টা সত্যিই মাথায় আছে কিনা, আজ এবং কয়েক দিন পরেও। Quiz যাচাই করে চিনতে পারা (option দেখে সঠিকটা বাছা)। Recall Map যাচাই করে নিজে থেকে মনে করা আর ব্যাখ্যা করা, যেটা interview-তে আসলে লাগে।

**গঠন:** উপরে topic-এর নাম, তার নিচে ৬-১০টা **core point**। প্রতিটা core point শুধু একটা keyword বা ছোট phrase। উদাহরণ, Day 12 · Message Queues:

```
Message Queues
├── Producer
├── Broker
├── Consumer
├── Asynchronous Processing
├── Decoupling
├── Traffic Buffering
├── Acknowledgement
├── Retry
├── Dead Letter Queue (DLQ)
└── Idempotency
```

**Core point বাছাইয়ের নিয়ম:**

- Lesson-এর মূল ধারণাগুলো, যেগুলো না জানলে topic বোঝা হয়নি।
- Interview-তে জিজ্ঞেস করা হতে পারে এমন জিনিস।
- Advanced অংশ থেকেও ২-৩টা।
- প্রতিটা point lesson-এর কোনো না কোনো section-এ ব্যাখ্যা করা থাকতে হবে।

**প্রতিটা core point-এর data:**

```
term          keyword (যেমন "Dead Letter Queue")
prompt        কী ব্যাখ্যা করতে পারা উচিত, একটা প্রশ্ন আকারে
              (যেমন "DLQ কী, আর কোন message সেখানে যায়? না থাকলে কী সমস্যা হতো?")
answer        আদর্শ ব্যাখ্যা, ২-৩ বাক্যে
lessonLink    lesson-এর যে অংশে এটা ব্যাখ্যা করা আছে
```

**তিনটা mode:**

1. **Keyword Recall (মূল mode):** Topic মাঝখানে, core point-গুলো চারপাশে, **mind map** আকারে (চাইলে list view)। Learner প্রতিটা keyword দেখে মনে মনে বা জোরে ব্যাখ্যা করবে। উপরে একটা টিপ থাকবে: "এমনভাবে বলুন যেন একজন junior-কে বোঝাচ্ছেন।" তারপর keyword-এ click করলে `prompt` আর `answer` দেখাবে, যাতে learner মিলিয়ে নিতে পারে তার ব্যাখ্যা ঠিক ছিল কিনা।
2. **Free Recall (কঠিন mode):** শুধু topic-এর নাম দেখাবে, core point লুকানো। Learner একটা textbox-এ যত point মনে পড়ে লিখবে। তারপর "মিলিয়ে দেখুন" চাপলে পুরো তালিকা আসবে, আর learner নিজে tick দেবে কোনগুলো মনে পড়েছিল। (স্বয়ংক্রিয়ভাবে মেলানোর দরকার নেই।)
3. **Review mode:** Dashboard থেকে, শুধু যে point-গুলোর আজ review করার কথা (নিচে দেখুন)।

**Self-rating:** প্রতিটা point-এ answer দেখার **পরে** learner নিজেকে rate করবে:

- 🟢 **পারছি:** নিজে থেকে ঠিকমতো বুঝিয়ে বলতে পেরেছি
- 🟡 **আংশিক:** কিছুটা মনে ছিল, পুরোটা না
- 🔴 **পারছি না:** মনে পড়েনি বা ভুল বলেছি। পাশে lesson-এর ওই অংশের link দেখাবে: "এই অংশটা আবার পড়ুন"

Answer দেখার আগে rate করার সুযোগ থাকবে না, কারণ মিলিয়ে না দেখলে "মনে হয় পারি" আর "আসলেই পারি"-এর পার্থক্য ধরা পড়ে না।

**Spaced repetition (কবে আবার দেখাবে):** প্রতিটা core point-এর আলাদা schedule।

- Lesson শেষ করার পরের দিন প্রথম review।
- 🟢 হলে পরের ধাপে যাবে: **১ → ৩ → ৭ → ১৪ → ৩০ দিন**।
- 🟡 হলে একই ব্যবধানে আবার আসবে।
- 🔴 হলে আবার ১ দিনে ফিরে যাবে।
- একটা topic-এর সব point ৭ দিন বা তার বেশি ধাপে 🟢 হলে topic-টা **"মজবুত 💪"** চিহ্নিত হবে।

**"আজকের Recall" dashboard:** Home page-এ বা আলাদা page-এ:

- আজ কয়টা point review করার কথা, topic অনুযায়ী সাজানো, আর একটা "শুরু করুন" button।
- কোন topic-এ সবচেয়ে বেশি 🔴, সেগুলোর তালিকা।
- Recall-এর ধারাবাহিকতা (streak)।

**Mind map-এর রং:** প্রতিটা point-এর শেষ rating অনুযায়ী (🟢/🟡/🔴/এখনো দেখা হয়নি ধূসর)। এক নজরে বোঝা যাবে topic-এর কোন অংশ দুর্বল।

**Test:** Review schedule, কোন point আজ due, আর "মজবুত" অবস্থা হিসাবের logic pure function-এ হবে, আগে test লিখে।

## 6. Visual ও Diagram নির্দেশিকা

System design মূলত visual বিষয়। **লেখার চেয়ে ছবিতে বেশি বোঝাতে হবে।** একটা বড় paragraph-এর জায়গায় একটা ভালো diagram সবসময় ভালো।

### 6.1 প্রতিটা lesson-এ ন্যূনতম যা থাকবে

| কোথায়       | কোন visual                                                                | উদাহরণ (Message Queues)                                                             |
| ------------ | ------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| সমস্যাটা কী? | **Before diagram:** সমস্যাটা কোথায় হচ্ছে                                 | Order service সরাসরি email, invoice, warehouse service call করছে, user অপেক্ষা করছে |
| Analogy      | **Analogy illustration:** গল্পের দৃশ্যটা ছবিতে                            | Cashier → order board → kitchen-এর chef-রা                                          |
| মূল ধারণা    | **মূল architecture diagram** (After)                                      | Producer → Queue → Worker-রা                                                        |
| মূল ধারণা    | **Before/After পাশাপাশি তুলনা**                                           | উপরের দুটো পাশাপাশি, latency-র পার্থক্য সহ                                          |
| গভীরে যাই    | **Step-by-step flow বা sequence diagram:** যেকোনো process, যেখানে ধাপ আছে | Message publish → deliver → process → ack → delete; ack না এলে retry → DLQ          |
| গভীরে যাই    | **ভেতরের গঠন:** data structure বা internal mechanism (প্রযোজ্য হলে)       | Partition-এর ভেতরে offset                                                           |
| Trade-offs   | **Comparison table**, প্রয়োজনে chart                                     | RabbitMQ vs Kafka vs SQS                                                            |
| সারাংশ       | **এক নজরে সারাংশ card:** এক ছবিতে পুরো topic (cheat sheet)                | Topic নাম, এক লাইনের সংজ্ঞা, মূল diagram ছোট করে, ৩টা key point                     |

### 6.2 কোন ধরনের তথ্যের জন্য কোন visual

| বোঝাতে চাইছি                  | Visual-এর ধরন                      | উদাহরণ topic                                            |
| ----------------------------- | ---------------------------------- | ------------------------------------------------------- |
| কোন component কার সাথে যুক্ত  | Architecture diagram (box ও arrow) | Load Balancer, API Gateway                              |
| সময়ের সাথে কে কাকে কী পাঠায় | Sequence diagram                   | TLS Handshake, OAuth flow, 2PC                          |
| সিদ্ধান্ত বা শর্ত             | Flowchart                          | SQL vs NoSQL কখন কোনটা                                  |
| অবস্থা বদলানো                 | State diagram                      | Circuit Breaker, TCP connection                         |
| Data কিভাবে সাজানো            | Data structure diagram             | B-tree, Consistent Hashing ring, Bloom filter bit array |
| সংখ্যা বা প্রবণতা             | Chart (line/bar)                   | Latency percentile, throughput vs latency curve         |
| ঘটনার ক্রম                    | Timeline                           | Lamport/Vector clock, incident timeline                 |
| চলমান প্রক্রিয়া              | Animated flow                      | Request কিভাবে load balancer হয়ে server-এ যায়         |

### 6.3 Visual বানানোর নিয়ম

1. **Code দিয়ে বানানো diagram ব্যবহার করবে** (SVG বা existing platform-এর diagram system), raster ছবি না। এতে dark mode-এ রং বদলায়, পরে সহজে edit করা যায়, আর লেখা ঝাপসা হয় না।
2. **একটা স্থির visual ভাষা থাকবে, পুরো platform-জুড়ে।** প্রতিটা component-এর জন্য একটা নির্দিষ্ট icon আর রং ঠিক করে একটা shared component library বানাও। যেমন: Client, Server, Database, Cache, Queue, Load Balancer, CDN, Gateway, User, External Service। Day 9-এর Load Balancer আর Day 88-এর Load Balancer দেখতে একই হবে।
3. **Label:** বাংলা ব্যাখ্যা, component-এর নাম English-এ। লেখা কম রাখবে, শুধু যা না হলেই না।
4. **Animation:** request বা data কিভাবে চলাচল করে, সেটা animate করবে। তবে নিজে থেকে চলতে থাকবে না। **"পরের ধাপ ▶" button** দিয়ে learner নিজে এগোবে, আর প্রতিটা ধাপের পাশে এক লাইনের ব্যাখ্যা থাকবে।
5. **Caption ও alt text:** প্রতিটা diagram-এর নিচে বাংলায় এক লাইনের caption, আর screen reader-এর জন্য alt text।
6. **Mobile:** ছোট screen-এ diagram ঝাপসা বা কাটা পড়বে না। প্রয়োজনে বাম-ডান layout উপর-নিচে হয়ে যাবে, বা zoom/scroll করা যাবে। ন্যূনতম font size ঠিক রাখবে।
7. **Dark mode ও light mode** দুটোতেই ঠিকমতো পড়া যাবে।
8. **কোম্পানির logo বা বাইরের ছবি ব্যবহার করবে না।** কোম্পানির নাম লেখা দিয়েই কাজ চালাবে।
9. **Analogy illustration:** সহজ SVG illustration বানাবে। যেখানে বাস্তব ছবির মতো কিছু দরকার, যেটা code দিয়ে বানানো সম্ভব না, সেখানে একটা placeholder রাখবে, আর ছবির বিস্তারিত বর্ণনা (image prompt) সহ `IMAGES_TODO.md` file-এ তালিকা করবে। আমি পরে ছবিগুলো বানিয়ে দেব।

### 6.4 Visual Download (LinkedIn-এর জন্য)

- প্রতিটা lesson-এর **মূল diagram** আর **সারাংশ card**-এর পাশে **"⬇️ LinkedIn-এর জন্য ডাউনলোড"** button থাকবে।
- Download হবে **PNG, 1080×1350 (portrait)**, কারণ LinkedIn feed-এ portrait ছবি বেশি জায়গা পায়। ছবিতে থাকবে: উপরে `Day {নম্বর}` আর topic-এর নাম, মাঝে diagram, নিচে এক লাইনের সংজ্ঞা।
- Download-এর সময় সবসময় light theme ব্যবহার হবে, যাতে LinkedIn-এ পরিষ্কার দেখায়।
- **Weekly recap carousel:** প্রতি ৭ দিন পর, ওই সপ্তাহের ৭টা topic-এর সারাংশ card দিয়ে একটা **PDF carousel** (প্রতি topic-এ এক slide + প্রথমে cover slide + শেষে "পরের সপ্তাহে কী আসছে" slide) download করা যাবে।

## 7. Quiz System

### 7.1 Question Bank

- **প্রতিটা topic-এ ঠিক 60টা প্রশ্ন।** Difficulty অনুযায়ী ভাগ: **20টা easy, 20টা medium, 20টা hard**।
- প্রশ্নের ধরন মিশিয়ে দিতে হবে:
  - Concept বোঝা ("কেন..." ধরনের প্রশ্ন, শুধু সংজ্ঞা মুখস্থ না)
  - **Scenario-based** ("আপনার system-এ X হচ্ছে, কী করবেন?"); medium আর hard-এর বেশিরভাগ এই ধরনের
  - Trade-off তুলনা
  - Calculation (যেখানে প্রযোজ্য, যেমন Capacity Estimation, Quorum)
  - Diagram-ভিত্তিক প্রশ্ন (যেখানে প্রযোজ্য): একটা ছোট diagram দেখিয়ে প্রশ্ন, যেমন "এই architecture-এ bottleneck কোথায়?"
- প্রতিটা প্রশ্নে ৪টা option। **ভুল option-গুলো বিশ্বাসযোগ্য হতে হবে** (সাধারণ ভুল ধারণা থেকে বানানো), যাতে আন্দাজে উত্তর দেওয়া না যায়।
- "উপরের সবগুলো" বা "কোনোটিই নয়" ধরনের option ব্যবহার করবে না, কারণ option shuffle হলে এগুলো অর্থহীন হয়ে যায়।
- একই topic-এর 60টা প্রশ্নের মধ্যে কোনো দুটো প্রশ্ন প্রায় একই হবে না।

প্রতিটা প্রশ্নের data-তে থাকবে:

```
id              (topic-এর ভেতরে unique, স্থায়ী)
difficulty      easy | medium | hard
question        প্রশ্ন (বাংলায়)
diagram         (ঐচ্ছিক) প্রশ্নের সাথে দেখানোর diagram
options         ৪টা option
correctIndex    সঠিক উত্তরের index
explanation     সঠিক উত্তর কেন সঠিক (২-৪ বাক্য)
whyWrong        প্রতিটা ভুল option কেন ভুল (প্রতিটার জন্য এক বাক্য)
```

### 7.2 Quiz কিভাবে চলবে

1. **প্রতি attempt-এ 60টা থেকে 20টা প্রশ্ন** দেখাবে।
2. **প্রশ্ন বাছাইয়ের নিয়ম:**
   - আগে যেসব প্রশ্ন learner এখনো দেখেনি, সেগুলো থেকে বাছাই করবে। তাই প্রথম ৩টা attempt মিলিয়ে 60টা প্রশ্নই একবার করে আসবে, কোনো repeat ছাড়া।
   - 60টাই দেখা হয়ে গেলে নতুন চক্র শুরু হবে, আবার random ভাবে।
   - প্রতি attempt-এ easy/medium/hard যতটা সম্ভব সমানভাবে মেশানো থাকবে।
   - **প্রশ্নের ক্রম আর option-এর ক্রম প্রতিবার shuffle হবে**, যাতে "দ্বিতীয় option-টা সঠিক" এভাবে মুখস্থ করা না যায়।
3. **Pass করার শর্ত: 95% বা তার বেশি** (অর্থাৎ 20-এ অন্তত 19)।
4. **95%-এর নিচে পেলে:**
   - Result page-এ প্রতিটা **ভুল উত্তরের জন্য** দেখাবে: learner কী বেছেছিল, সঠিক উত্তর কোনটা, `explanation` (সঠিকটা কেন সঠিক), আর `whyWrong` থেকে learner-এর বেছে নেওয়া option কেন ভুল।
   - "আবার চেষ্টা করুন" button চাপলে **অন্য 20টা প্রশ্ন** আসবে (উপরের বাছাইয়ের নিয়ম মেনে)।
5. **95% বা তার বেশি পেলে:** topic-টা "Quiz Passed ✅" হিসেবে চিহ্নিত হবে। তখনও কোনো ভুল থাকলে সেটার ব্যাখ্যা দেখাবে।
6. **সংরক্ষণ:** প্রতিটা topic-এর জন্য কোন প্রশ্নগুলো দেখা হয়েছে, প্রতিটা attempt-এর score, আর pass করেছে কিনা, existing progress system-এ save হবে।

### 7.3 Test

প্রশ্ন বাছাই, shuffle, score হিসাব আর pass/fail-এর logic UI থেকে আলাদা pure function-এ লিখবে, এবং এগুলোর জন্য আগে unit test লিখবে (TDD)। অন্তত এই কেসগুলো test-এ থাকবে:

- প্রতি attempt-এ ঠিক 20টা প্রশ্ন, কোনোটা দুবার না
- প্রথম ৩টা attempt-এ কোনো প্রশ্ন repeat হয় না
- 60টা দেখা শেষ হলে নতুন চক্র শুরু হয়
- 19/20 = pass, 18/20 = fail
- Option shuffle-এর পরেও সঠিক উত্তর ঠিকভাবে চেনা যায়

## 8. LinkedIn Post (প্রতিটা Topic-এ)

প্রতিটা lesson-এর শেষে একটা **"📣 LinkedIn Post"** section থাকবে। Learner এটা copy করে LinkedIn-এ post করবে, public engagement-এর জন্য। লক্ষ্য শুধু like না, **comment আর save**। LinkedIn-এ এগুলোই reach সবচেয়ে বেশি বাড়ায়।

### 8.1 সব post-এর জন্য মূল নিয়ম

1. **প্রথম দুই লাইনই সবচেয়ে গুরুত্বপূর্ণ (Hook)।** "...see more"-এর আগে মানুষ শুধু প্রথম ২-৩ লাইন দেখে, তাই প্রথম লাইনটা হবে একটা কৌতূহল জাগানো প্রশ্ন, দাবি বা পরিচিত সমস্যা। **প্রথম দুই লাইন মিলিয়ে 150 character-এর মধ্যে।** Topic-এর নাম বা Day নম্বর দিয়ে শুরু করবে না।
2. **Day নম্বর দ্বিতীয় লাইনে, ছোট করে:** `Day 12/100 · Message Queues`। Day 101-117-এর জন্য: `Bonus Day 101 · Feature Store`।
3. **নিজের অভিজ্ঞতার জায়গা (Personal Touch):** প্রতিটা post-এ এক জায়গায় একটা placeholder থাকবে, যেখানে আমি নিজের কাজের অভিজ্ঞতা থেকে ১-২ লাইন লিখব:
   ```
   [✍️ আপনার অভিজ্ঞতা: আপনার project-এ কোন কাজ synchronous ছিল, আর সেটা কী সমস্যা তৈরি করেছিল?]
   ```
   Placeholder-এর ভেতরে একটা নির্দিষ্ট প্রশ্ন থাকবে, যাতে কী লিখতে হবে বুঝতে সুবিধা হয়। Post-এর বাকি অংশ এমনভাবে লেখা থাকবে যে এই লাইনটা স্বাভাবিকভাবে বসে যায়।
4. **শেষে একটা প্রশ্ন (Call to Action):** প্রতিটা post শেষ হবে পাঠককে একটা সহজ, উত্তর দেওয়ার মতো প্রশ্ন দিয়ে, যাতে মানুষ comment করে। যেমন:

   > আপনার project-এ কোন কাজটা আপনি queue-তে পাঠান? Comment-এ লিখুন 👇

   প্রশ্নটা হবে অভিজ্ঞতা বা মতামত জানতে চাওয়ার মতো ("আপনি কোনটা বেছে নিতেন?"), হ্যাঁ/না ধরনের না।

5. **Hashtag:** 3-5টা। প্রথম দুটো সবসময় `#100DaysOfSystemDesign #SystemDesign`, তারপর topic-এর ১-৩টা।
6. **Link post-এর ভেতরে না।** Platform-এর link দেওয়ার জন্য একটা আলাদা **"প্রথম comment"** text বানাবে, যেটা post করার পরে নিজের post-এ প্রথম comment হিসেবে দেওয়া হবে।
7. **দৈর্ঘ্য:** গল্প post 1200-2000 character। অন্য ধরনের post আরও ছোট। **কোনোভাবেই 3000 character-এর বেশি না** (LinkedIn-এর সীমা)।
8. **ভাষা:** প্রথম পুরুষে, একজন শিক্ষার্থী হিসেবে ("আজ শিখলাম", "বুঝলাম")। সহজ বাংলা, technical term English-এ। ছোট paragraph, মাঝে একটা খালি লাইন, যাতে mobile-এ পড়তে সহজ হয়। Emoji খুব কম।
9. **Bold:** LinkedIn markdown বোঝে না। তাই source-এ English term-গুলো `**Term**` হিসেবে চিহ্নিত থাকবে, আর copy করার সময় Unicode bold অক্ষরে রূপান্তর হবে (যেমন `𝗠𝗲𝘀𝘀𝗮𝗴𝗲 𝗤𝘂𝗲𝘂𝗲`)। Unicode bold শুধু English অক্ষরে কাজ করে, তাই বাংলা শব্দ bold করবে না।
10. **তথ্য ভুল হবে না।** Post সহজ হবে, কিন্তু সরল করতে গিয়ে ভুল কিছু বলবে না।
11. **Analogy বারবার না:** lesson-এর analogy থেকে আলাদা হলে ভালো। একই analogy একাধিক post-এ ব্যবহার করবে না।

### 8.2 পাঁচ ধরনের Post (পালা করে)

সব দিন একই template হলে ২-৩ সপ্তাহ পর পাঠক format চিনে ফেলে আর scroll করে চলে যায়। তাই ৫ ধরনের post পালা করে ব্যবহার হবে।

**বণ্টনের নিয়ম:**

- প্রতিটা topic-এ **একটা প্রধান post**। কোন topic-এ কোন ধরন, সেটা topic-এর সাথে মিলিয়ে builder ঠিক করবে।
- মোটামুটি অনুপাত: **গল্প ৪০%, ভুল ২০%, Poll ২০%, Real company ২০%।**
- পরপর ২ দিনের বেশি একই ধরনের post হবে না।
- এর বাইরে **প্রতি ৭ দিন পর একটা অতিরিক্ত Weekly Recap post**।

#### ধরন ১: গল্প Post 📖

সবচেয়ে বেশি ব্যবহার হবে। নতুন concept পরিচয় করানোর জন্য ভালো।

```
{Hook: পরিচিত একটা সমস্যা বা প্রশ্ন, এক লাইনে}
Day {নম্বর}/100 · {Topic}

{একটা দৈনন্দিন গল্প, "ধরুন..." দিয়ে শুরু। একটা সমস্যা তৈরি হয়।}

{সমস্যার ফল, এক লাইনে।}

{গল্পে একটা ছোট পরিবর্তন, যেটা সমস্যার সমাধান করে।}

আজ {Topic} শিখতে গিয়ে বুঝলাম, software system-এও প্রায় একই idea কাজ করে।
{একটা software উদাহরণ, প্রয়োজনে "- " দিয়ে ছোট list}

{সমস্যাটা software-এ কেমন দেখায়।} এখানেই আসে {Topic}।

{৩টা মূল ধারণা, নম্বর দিয়ে:}
1. {English term}: {এক বাক্যে ব্যাখ্যা}
2. ...
3. ...

[✍️ আপনার অভিজ্ঞতা: ...]

তবে একটা গুরুত্বপূর্ণ বিষয় শিখলাম, {একটা advanced বা কম-জানা দিক, ১-২টা প্রশ্ন-উত্তরে}।

{Topic} = {এক লাইনের সহজ সংজ্ঞা}।

{CTA প্রশ্ন} 👇

#100DaysOfSystemDesign #SystemDesign #...
```

**Visual:** মূল diagram (Section 6.4)।

#### ধরন ২: ভুল Post ⚠️

যেসব topic-এ নতুনরা সাধারণত ভুল করে, সেখানে ভালো কাজ করে (Caching, Indexes, Microservices, JWT)।

```
{Hook: "{Topic} ব্যবহারে নতুনরা যে ৩টা ভুল করে (আমিও করেছি)"}
Day {নম্বর}/100 · {Topic}

{১-২ লাইনে topic-টা কী}

❌ ভুল ১: {ভুলটা}
✅ ঠিক উপায়: {এক-দুই বাক্যে}

❌ ভুল ২: ...
✅ ঠিক উপায়: ...

❌ ভুল ৩: ...
✅ ঠিক উপায়: ...

[✍️ আপনার অভিজ্ঞতা: এর মধ্যে কোন ভুলটা আপনি বাস্তবে দেখেছেন?]

{CTA: "আর কোন ভুল এই list-এ থাকা উচিত?"} 👇

#100DaysOfSystemDesign #SystemDesign #...
```

**Visual:** ভুল বনাম ঠিক, পাশাপাশি দুটো diagram।

#### ধরন ৩: Poll Post 📊

Engagement সবচেয়ে বেশি আনে। Trade-off বা scenario আছে এমন topic-এ ভালো (SQL vs NoSQL, CAP, Consistency)। প্রশ্ন নেওয়া হবে ওই topic-এর quiz bank থেকে।

```
{Scenario: ২-৪ লাইনে একটা বাস্তব পরিস্থিতি}
Day {নম্বর}/100 · {Topic}

আপনি হলে কী করতেন? Poll-এ vote দিন, আর কেন বেছে নিলেন comment-এ লিখুন 👇

উত্তর আর ব্যাখ্যা দেব কাল।

#100DaysOfSystemDesign #SystemDesign #...
```

সাথে LinkedIn poll-এর জন্য আলাদা field:

- **Poll প্রশ্ন:** সর্বোচ্চ 140 character
- **৪টা option:** প্রতিটা সর্বোচ্চ 30 character (LinkedIn-এর সীমা)

আর একটা **"পরের দিনের উত্তর" comment**: সঠিক উত্তর, ব্যাখ্যা, আর কেন অন্যগুলো ভুল। এটা পরের দিন poll post-এ comment হিসেবে দেওয়া হবে।

**Visual:** Poll post-এ ছবি দেওয়া যায় না, তাই লাগবে না।

#### ধরন ৪: Real Company Post 🏢

Industry-র উদাহরণ যেখানে বিখ্যাত (Kafka → LinkedIn, Caching → Facebook, Consistent Hashing → Discord/DynamoDB, Chaos Engineering → Netflix)।

```
{Hook: "{Company} প্রতিদিন {বিশাল সংখ্যা} {কাজ} কিভাবে সামলায়?"}
Day {নম্বর}/100 · {Topic}

{সমস্যাটা কী ছিল, ২-৩ লাইনে}

{তারা কী করল: {Topic} কিভাবে কাজে লাগাল, ৩-৪টা ধাপে}

{ফলাফল}

আমার জন্য শিক্ষা: {এক-দুই লাইন}

[✍️ আপনার অভিজ্ঞতা: আপনার কাজে এমন কিছু দেখেছেন?]

{CTA প্রশ্ন} 👇

#100DaysOfSystemDesign #SystemDesign #...
```

**শর্ত:** সংখ্যা আর তথ্য শুধু company-র public engineering blog বা talk থেকে, আর lesson data-তে উৎসের নাম সহ রাখবে, যাতে আমি যাচাই করতে পারি। প্রমাণিত তথ্য না পেলে এই ধরনের post বানাবে না।

**Visual:** ওই company-র architecture-এর সরল diagram।

#### ধরন ৫: Weekly Recap Post 🗂️

প্রতি ৭ দিন পর (Day 7, 14, 21...), সেদিনের প্রধান post-এর **অতিরিক্ত** হিসেবে।

```
{Hook: "এই সপ্তাহে System Design-এর ৭টা জিনিস শিখলাম। এক carousel-এ সব।"}
Week {নম্বর} · Day {শুরু}-{শেষ}

{প্রতিটা topic-এর এক লাইন:}
1️⃣ {Topic}: {এক লাইনের সংজ্ঞা}
...
7️⃣ ...

পরের সপ্তাহে আসছে: {পরের ৩টা topic}

Save করে রাখুন, interview-এর আগে কাজে লাগবে 🔖

{CTA: "এর মধ্যে কোনটা আপনার কাছে সবচেয়ে কঠিন লেগেছে?"} 👇

#100DaysOfSystemDesign #SystemDesign
```

**Visual:** Section 6.4-এর PDF carousel।

### 8.3 প্রতিটা post-এর data

```
type              story | mistakes | poll | company | recap
text              post-এর পুরো লেখা (Bold-এর জন্য **Term** চিহ্ন সহ)
personalPrompt    অভিজ্ঞতার placeholder-এর প্রশ্ন
firstComment      প্রথম comment (platform link-এর placeholder সহ)
hashtags          3-5টা
visual            কোন diagram download হবে (poll-এ নেই)
poll              (শুধু poll-এ) question, options[4], answerComment
sources           (শুধু company-তে) তথ্যের উৎস
```

### 8.4 UI

- Post একটা card-এ দেখাবে, LinkedIn-এ যেমন দেখাবে প্রায় তেমন (line break সহ)। প্রথম দুই লাইনের পরে একটা হালকা দাগ দিয়ে দেখাবে কোথায় "...see more" পড়বে।
- উপরে post-এর ধরন badge (📖 গল্প / ⚠️ ভুল / 📊 Poll / 🏢 Company / 🗂️ Recap)।
- **অভিজ্ঞতার placeholder** card-এর ভেতরে একটা textbox হিসেবে দেখাবে। আমি সেখানে লিখলে post-এ বসে যাবে, আর লেখাটা save থাকবে।
- **"📋 Post copy করুন" button:** plain text copy হবে (Unicode bold সহ)।
  - Placeholder খালি থাকলে একটা সতর্কবার্তা দেখাবে: "আপনার অভিজ্ঞতার লাইনটা এখনো লেখা হয়নি। তবুও copy করবেন?" হ্যাঁ বললে placeholder লাইনটা বাদ দিয়ে copy করবে।
- **"📋 প্রথম comment copy করুন"** আলাদা button।
- Poll post-এ poll প্রশ্ন আর প্রতিটা option-এর আলাদা copy button, character count সহ।
- **"⬇️ ছবি ডাউনলোড"** button (Section 6.4)।
- Character count: `1,840 / 3,000`। Hook-এর character count আলাদাভাবে: `Hook: 112 / 150`।
- **Posting tips** (ছোট, collapsible): প্রতিদিন একই সময়ে post করুন; post-এর পর প্রথম এক ঘণ্টা comment-এর উত্তর দিন; link প্রথম comment-এ দিন।
- Bold রূপান্তর, character count, placeholder সামলানো আর copy text বানানোর logic pure function-এ হবে, test সহ।

## 9. Interactive Components (Simulator)

Existing platform-এ আগে থেকেই কিছু interactive tool আছে। আগে দেখে নাও কোনগুলো আছে। Section 9.1-এর standard পূরণ করলে reuse করো, না করলে সেই standard অনুযায়ী উন্নত করো। যেগুলো নেই, সেগুলো নতুন বানাবে। প্রতিটা simulator-এর **logic অংশ UI থেকে আলাদা pure function-এ** লিখবে, test সহ। সব simulator Section 6.3-এর visual ভাষা আর Section 9.1-এর standard মেনে চলবে।

| Component                                     | কোন Topic-এ       | Learner কী করবে                                                                                                         |
| --------------------------------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Request Journey Animator                      | 2, 3, 40, 41      | URL লিখলে DNS → TCP → TLS → HTTP ধাপগুলো animate হয়ে দেখাবে                                                            |
| Latency Visualizer                            | 7, 95             | L1 cache থেকে cross-continent পর্যন্ত latency মানুষের সময়ে (সেকেন্ড/দিন) রূপান্তর করে দেখাবে                           |
| CAP Explorer                                  | 8, 47             | Network partition ঘটানো, CP বনাম AP আচরণ দেখা                                                                           |
| **Load Balancer Lab** (বিস্তারিত Section 9.2) | 9, 13, 14, 87     | Traffic পাঠানো, algorithm বদলানো, server ধীর/বন্ধ করা, health check, sticky session, L7 routing, LB failover, চ্যালেঞ্জ |
| **Message Queue Lab** (বিস্তারিত Section 9.3) | 12, 56, 57        | Producer/consumer যোগ করা, consumer crash করানো, ack/retry/DLQ, traffic spike, duplicate message                        |
| Cache Simulator                               | 17                | Cache size ও eviction policy বেছে নিয়ে hit/miss ratio দেখা                                                             |
| Rate Limiter Simulator                        | 18                | Algorithm বেছে নিয়ে burst traffic পাঠানো, কোন request block হয় দেখা                                                   |
| Estimation Calculator                         | 19, সব case study | DAU, read/write ratio, object size দিলে QPS, storage, bandwidth হিসাব, ধাপ সহ                                           |
| Bloom Filter Demo                             | 24                | Item যোগ, false positive কিভাবে হয় দেখা                                                                                |
| Isolation Level Demo                          | 26, 27            | দুটো transaction পাশাপাশি চালানো, isolation level বদলে dirty read বা lost update দেখা                                   |
| Replication Lag Demo                          | 28, 47            | Leader-এ write, follower থেকে read; lag বাড়ালে stale read                                                              |
| Sharding Visualizer                           | 29, 30            | Range vs hash sharding, hot partition দেখা                                                                              |
| Consistent Hashing Ring                       | 31                | Node ও key যোগ/বাদ, কতগুলো key সরে যায়; virtual node চালু/বন্ধ                                                         |
| Geohash Map                                   | 35                | Map-এ জায়গা বেছে নিলে geohash cell আর আশেপাশের cell দেখা                                                               |
| Quorum Calculator                             | 49                | N, R, W বদলে consistency guarantee দেখা                                                                                 |
| Vector Clock Demo                             | 50                | Process-গুলোর মধ্যে message পাঠিয়ে clock কিভাবে বদলায় দেখা                                                            |
| Raft / Leader Election Visualizer             | 51, 52            | Leader-কে kill করে নতুন election দেখা                                                                                   |
| Circuit Breaker Demo                          | 59                | Downstream fail করালে closed → open → half-open                                                                         |
| Architecture Diagram Builder                  | সব case study     | Component drag করে নিজের design আঁকা                                                                                    |

### 9.1 সব Simulator-এর Standard

**Reference হিসেবে website-এর tool:** https://learningsystemdesign.netlify.app/learn/fundamentals/load-balancers/ পাতার "Load Balancer ভিজ্যুয়ালাইজার"। সেখানে আছে: ৩টা algorithm (Round Robin, Least Connections, Random), প্রতি click-এ একটা request, server "down" করার button, আর প্রতিটা server কয়টা request পেল তার counter। শুরু হিসেবে ভালো, কিন্তু সীমাবদ্ধতা আছে:

- এক click-এ মাত্র একটা request, তাই বাস্তব traffic-এর অনুভূতি আসে না
- Request কিভাবে চলাচল করে তা দেখা যায় না, শুধু সংখ্যা বাড়ে
- Request-এর কোনো সময়কাল নেই, তাই Least Connections আর Round Robin প্রায় একই ফল দেয়। দুটোর আসল পার্থক্য বোঝা যায় না
- Server down করলে সঙ্গে সঙ্গে বাদ পড়ে। বাস্তবে health check ধরতে সময় লাগে, আর সেই ফাঁকে কিছু request fail হয়
- Latency বা error-এর কোনো metric নেই, কোনো চ্যালেঞ্জ নেই

**আমাদের প্রতিটা simulator-এ যা থাকবে:**

1. **একই layout:** উপরে নাম, ℹ️ (কিভাবে ব্যবহার করবেন), 🔄 reset। তারপর controls, মাঝে visualization, পাশে বা নিচে live metrics, "কী ঘটছে" log, আর শেষে "শিক্ষা" box।
2. **চলমান animation:** request বা data চলাচল চোখে দেখা যাবে। ▶️ Play, ⏸ Pause, ⏭ এক ধাপ, আর speed (0.5x থেকে 4x)। যাদের system-এ "reduce motion" চালু, তাদের জন্য animation সরল হবে।
3. **Traffic generator** (যেখানে প্রযোজ্য): একটা পাঠানো, একসাথে অনেক (burst), আর slider দিয়ে প্রতি সেকেন্ডে কতগুলো (continuous)। Traffic-এর ধরন: স্থির, ধীরে বাড়া, হঠাৎ spike।
4. **বাস্তব সময়:** কাজে সময় লাগে। Request process হতে সময় লাগে, failure ধরতে সময় লাগে, replication-এ lag থাকে।
5. **Failure ঘটানো:** component বন্ধ করা, ধীর করা, আবার চালু করা।
6. **Live metrics:** সংখ্যা আর ছোট line chart, সময়ের সাথে কিভাবে বদলাচ্ছে।
7. **"কী ঘটছে" log (বাংলায়):** প্রতিটা সিদ্ধান্তের কারণ। যেমন: "Request #14 → Server 3, কারণ Least Connections: Server 3-এ এখন মাত্র ২টা connection।"
8. **Challenge mode:** ৩-৬টা mission। প্রতিটায় একটা লক্ষ্য, প্রয়োজনে hint, আর simulator নিজেই যাচাই করবে লক্ষ্য পূরণ হলো কিনা। Mission শেষ হলে progress-এ save হবে।
9. **প্রস্তাবিত পরীক্ষা (Preset):** এক click-এ একটা আকর্ষণীয় পরিস্থিতি সাজিয়ে দেওয়ার button। যেমন "একটা server ধীর হয়ে গেলে কী হয়?"
10. **Deterministic random:** random-এর জন্য seed ব্যবহার করবে, যাতে একই পরিস্থিতি আবার চালানো যায় আর test করা যায়।
11. **Mobile, keyboard আর dark mode-এ** ঠিকমতো কাজ করবে।
12. **Simulation engine আলাদা:** একটা pure function প্রতি "tick"-এ পরের অবস্থা হিসাব করবে। UI শুধু সেই অবস্থা দেখাবে। Engine-এর test থাকবে।
13. Simulator lesson-এর ভেতরে থাকবে, আবার আলাদা **Playground/Tools page**-এও পাওয়া যাবে।

### 9.2 Load Balancer Lab (বিস্তারিত)

Website-এর visualizer-এর চেয়ে অনেক বেশি কিছু দেখাবে। এটা **সব simulator-এর reference** হিসেবে আগে বানাতে হবে।

**Visualization:**

- বামে **Users**: প্রতিটা user একটা আলাদা রঙের বিন্দু, যাতে sticky session চোখে পড়ে।
- মাঝে **Load Balancer** (redundancy চালু করলে দুটো)।
- ডানে **Server pool**: প্রতিটা server-এর ভেতরে চলমান request-এর সারি, CPU bar (সবুজ/হলুদ/লাল), আর অবস্থা (সুস্থ / ধীর / বন্ধ / health check-এ বাদ)।
- Request বিন্দু হয়ে User → LB → Server-এ যাবে, তারপর response হয়ে ফিরবে। Fail হলে লাল ❌।

**Controls:**

- **Traffic:** "১টা request", "Burst ১০০", continuous RPS slider (1-200), traffic-এর ধরন (স্থির / ধীরে বাড়া / হঠাৎ spike)।
- **Request-এর ধরন:** হালকা (50ms) আর ভারী (500ms) request-এর অনুপাত slider। এতেই Least Connections আর Round Robin-এর আসল পার্থক্য দেখা যাবে।
- **Users:** কতজন user (1-20)।
- **Servers:** যোগ/বাদ (2-8টা)। প্রতিটার আকার Small/Medium/Large (capacity আর weight 1/2/4)। প্রতিটা server-এ তিনটা button: বন্ধ করো, ধীর করো (latency ×5), আবার চালু করো।
- **Algorithm:** Round Robin, Weighted Round Robin, Least Connections, Least Response Time, IP Hash, Random, Power of Two Choices (advanced)। প্রতিটার পাশে ℹ️-তে এক লাইনের বাংলা ব্যাখ্যা।
- **Health check:** interval (1-10 সেকেন্ড), কয়বার fail করলে বাদ দেবে (1-5)। পুরোপুরি বন্ধ করার option, যাতে দেখা যায় health check না থাকলে কী হয়।
- **Retry:** fail হলে অন্য server-এ আবার চেষ্টা, চালু/বন্ধ।
- **Sticky session:** চালু করলে একই user একই server-এ যায়। তারপর ওই server বন্ধ করলে session হারিয়ে যাওয়া দেখা যাবে, যেটা Day 14 (Stateful vs Stateless)-এর সাথে যোগ করে।
- **L4 / L7 mode:** L7-এ request-এর path থাকবে (`/api`, `/images`, `/video`), আর path অনুযায়ী আলাদা server pool-এ পাঠানোর নিয়ম বানানো যাবে।
- **LB redundancy:** "দ্বিতীয় Load Balancer (active-passive)" চালু/বন্ধ। Primary LB বন্ধ করলে redundancy না থাকলে পুরো site বন্ধ (single point of failure), থাকলে অল্প সময় পর failover।

**Metrics:** মোট request, সফল, fail, success %, throughput (RPS), p50/p95/p99 latency, প্রতিটা server-এর ভাগ (bar), প্রতিটা server-এর বর্তমান connection, আর সময়ের সাথে latency-র line chart।

**Challenges:**

1. একটা Large আর দুটো Small server। 100 RPS-এ কোনো server-এর CPU যেন 90% না ছাড়ায়। (সমাধান: Weighted Round Robin বা Least Connections)
2. User-দের shopping cart হারিয়ে যাচ্ছে, কারণ একই user বারবার ভিন্ন server-এ যাচ্ছে। ঠিক করো। (IP Hash বা sticky session) তারপর পরের ধাপ: এবার ওই server মারা গেল। কী হলো? শিক্ষা: কেন stateless server ভালো।
3. Server 2 ধীর হয়ে গেছে। p99 latency 300ms-এর নিচে আনো। (Least Response Time, Power of Two Choices, বা ধীর server বাদ দেওয়া)
4. একটা server crash করলেও fail হওয়া request যেন 1%-এর কম থাকে। (health check interval কমানো, threshold, retry)
5. Load Balancer নিজেই মারা গেল, পুরো site বন্ধ! ঠিক করো। (দ্বিতীয় LB)
6. L7 mode: `/video` request-গুলো আলাদা শক্তিশালী server pool-এ পাঠাও।

**পরে আবার ব্যবহার:** Day 87 (Autoscaling)-এ এই Lab-এ একটা "Autoscaling" toggle যোগ হবে: CPU একটা সীমা ছাড়ালে নিজে থেকে নতুন server যোগ হবে, আর নতুন server চালু হতে কিছুটা সময় লাগবে।

### 9.3 Message Queue Lab (বিস্তারিত)

এটা M5-এর নমুনা lesson-এর অংশ, তাই আগে বানাতে হবে।

**Visualization:** বামে Producer(s), মাঝে Queue (ভেতরে message-এর সারি, সংখ্যা সহ), ডানে Consumer/Worker-রা, আর নিচে আলাদা **Dead Letter Queue**। প্রতিটা message-এর অবস্থা রঙে: অপেক্ষায় / process হচ্ছে (in-flight) / সফল / retry হচ্ছে / DLQ-তে।

**Controls:**

- Producer-এর গতি (message/সেকেন্ড), হঠাৎ spike button।
- Consumer সংখ্যা (1-8), প্রতিটা message process করতে কত সময় লাগে।
- Consumer-কে process-এর মাঝখানে crash করানো।
- Ack চালু/বন্ধ; visibility timeout (ack না এলে কতক্ষণ পর message আবার দৃশ্যমান হবে)।
- সর্বোচ্চ retry সংখ্যা, তারপর DLQ।
- "বিষাক্ত message" (poison message) পাঠানো: যেটা সবসময় fail করে।
- Idempotency চালু/বন্ধ: বন্ধ থাকলে duplicate message-এ কাজ দুবার হবে (যেমন "email দুবার গেল")।

**Metrics:** Queue depth (সময়ের সাথে chart), throughput, গড় অপেক্ষার সময়, সফল, retry, DLQ-তে কয়টা, duplicate কাজ কয়টা।

**Challenges:**

1. Spike-এর সময় queue depth যেন একটা সীমার বেশি না বাড়ে। (consumer বাড়ানো)
2. Consumer crash করলেও কোনো message যেন হারিয়ে না যায়। (ack চালু রাখা)
3. একটা poison message পুরো queue আটকে দিচ্ছে। ঠিক করো। (max retry + DLQ)
4. Consumer crash-এর পর একই order-এর email দুবার যাচ্ছে। ঠিক করো। (idempotency)

## 10. Case Studies (34টা)

**সব 117টা topic শেষ হওয়ার পরে** case study যোগ হবে।

### 10.1 ক্রম: Difficulty Tier অনুযায়ী

সহজ থেকে কঠিন ক্রমে সাজানো। বন্ধনীতে মূল prerequisite topic-এর Day নম্বর (Section 4 অনুযায়ী)।

কিছু খুব নির্দিষ্ট concept কোনো topic-এ নেই, শুধু একটা case study-তে লাগে। এগুলো **⭐ চিহ্নিত**। ওই case study-র ভেতরেই একটা ছোট **"নতুন concept"** explainer box থাকবে।

**Tier 1: Warm-up**

1. Vending Machine: [115] (এটা LLD problem: class design, state machine)
2. Pastebin: [10, 17, 32, 33]
3. Rate Limiter: [16, 17, 18]
4. Leaderboard: [17, 29] ⭐ Redis sorted set
5. Distributed Counter: [24, 29, 47]
6. Authentication System: [75, 76, 77, 79]
7. Search Autocomplete: [17, 74] ⭐ Trie

**Tier 2: Infrastructure Components** 8. Notification Service: [12, 57, 59, 65] 9. Distributed Cache: [17, 28, 31] 10. Distributed Key-Value Store: [23, 28, 31, 49, 50] 11. Distributed Job Scheduler: [12, 52, 53, 57] 12. Distributed Locking Service: [51, 53] 13. CDN: [11, 40, 88] 14. Online Code Editor: [43, 64, 82] ⭐ Code execution sandbox 15. Live Comments: [43, 56, 65]

**Tier 3: Social ও Media System** 16. Twitter: [17, 29, 69] 17. Instagram: [11, 17, 33, 69] 18. Facebook (News Feed): [69, 102, 103] 19. WhatsApp: [28, 43, 56] ⭐ Message delivery state (sent/delivered/read) 20. Slack: [34, 43, 56] 21. Spotify: [11, 74, 102] 22. Dropbox (File Sharing): [33, 55] ⭐ Sync conflict 23. TikTok: [11, 102, 103, 104] 24. Netflix: [11, 88, 102] ⭐ Video encoding, adaptive bitrate streaming

**Tier 4: Complex/Critical System** 25. Uber: [29, 35, 43] ⭐ Driver-rider matching 26. Food Delivery (DoorDash): [35, 65, 67] 27. Google Maps: [11, 35] ⭐ Graph routing, map tiles 28. E-commerce (Amazon): [17, 26, 62, 67] ⭐ Inventory reservation 29. Flight Booking System: [26, 27, 53, 67] ⭐ Overbooking 30. Payment System: [26, 57, 66, 67] ⭐ Reconciliation 31. Digital Wallet: [25, 26, 57, 68] ⭐ Double-entry ledger 32. Google Docs: [43, 55] ⭐ Operational Transformation (OT) 33. Google Search: [34, 74, 103] ⭐ Web crawler, PageRank-এর ধারণা 34. Distributed Message Queue (Kafka): [12, 28, 52, 56]

### 10.2 প্রতিটা Case Study-র Template

প্রতিটা case study **ধাপে ধাপে খোলে** ("আগে নিজে চেষ্টা করুন" mode): প্রতিটা ধাপে learner আগে নিজে ভাববে বা লিখবে, তারপর "সমাধান দেখুন" চাপবে।

1. **📌 সমস্যার পরিচয়:** system-টা কী, কেন কঠিন, interview-তে কতটা আসে
2. **📋 Prerequisite:** কোন topic আগে শেষ করা দরকার (link সহ)
3. **❓ Requirement স্পষ্ট করা:** কোন প্রশ্ন জিজ্ঞেস করা উচিত, functional ও non-functional requirement, কোনগুলো scope-এর বাইরে
4. **🧮 Estimation:** Estimation Calculator embed করা, আগে থেকে value বসানো
5. **🔌 API Design:** মূল endpoint-গুলো
6. **🗄️ Data Model:** table/collection, কোন database কেন; ER diagram সহ
7. **🏗️ High-Level Design (v1):** সবচেয়ে সহজ design যেটা কাজ করে, architecture diagram সহ
8. **📈 Scale করা (v1 → v2 → v3):** traffic বাড়লে কী ভাঙে, আর কিভাবে ঠিক করা হয়। **এই বিবর্তন দেখানোই সবচেয়ে গুরুত্বপূর্ণ অংশ।** Diagram-এ step slider থাকবে; প্রতিটা ধাপে নতুন যোগ হওয়া component highlight হবে
9. **🔬 Deep Dive:** ২-৩টা সবচেয়ে কঠিন অংশ বিস্তারিত, sequence diagram সহ (যেমন Uber-এ nearby driver খোঁজা, WhatsApp-এ message ordering)
10. **💥 Failure Scenario:** "যদি X server মারা যায়?" ধরনের ৩-৪টা প্রশ্ন ও উত্তর। Diagram-এ ওই component লাল করে দেখাবে কী ঘটে
11. **⚖️ Trade-offs ও বিকল্প:** অন্য কী পদ্ধতি নেওয়া যেত, কেন নেওয়া হয়নি
12. **🏢 বাস্তবে কিভাবে করা হয়েছে:** শুধু public engineering blog বা talk থেকে প্রমাণিত তথ্য, উৎসের নাম সহ
13. **🎤 Interview Follow-up প্রশ্ন:** interviewer যা জিজ্ঞেস করতে পারে
14. **✏️ নিজে আঁকুন:** Diagram Builder-এ পুরো design নিজে আঁকার অনুশীলন
15. **📝 সারাংশ:** এক পাতার cheat sheet, final architecture diagram সহ
16. **🧠 Recall Map:** Section 5.1-এর মতোই, তবে core point হবে এই design-এর মূল সিদ্ধান্তগুলো। যেমন Twitter: Fan-out on write, Timeline cache, Celebrity problem, Tweet ID (Snowflake), Media storage, Search index
17. **📣 LinkedIn Post:** Section 8-এর নিয়মে, সাধারণত গল্প বা Company ধরন। দ্বিতীয় লাইন হবে `System Design Case Study {নম্বর}/34 · Design {System}`। Visual হবে v1 → v3-এর বিবর্তন, carousel আকারে।

## 11. Progress ও অন্যান্য Feature

Existing platform-এ যেগুলো আগে থেকে আছে সেগুলো reuse করবে, শুধু যা নেই তা যোগ করবে।

- **Progress tracking:** প্রতিটা topic/case study-র অবস্থা (শুরু হয়নি / পড়া শেষ / Quiz Passed ✅ / LinkedIn-এ post করা হয়েছে 📣); roadmap page-এ phase অনুযায়ী progress bar আর "Day X/117"
- **"Post করা হয়েছে" চিহ্ন:** LinkedIn post copy করার পর "Post করেছি" checkbox, যাতে কোন Day পর্যন্ত post হয়েছে বোঝা যায়। Day 1-12 শুরু থেকেই "post করা হয়েছে" হিসেবে থাকবে
- **Recall অবস্থা:** প্রতিটা topic-এর পাশে Recall Map-এর অবস্থা (শুরু হয়নি / চলছে / মজবুত 💪), আর "আজকের Recall" dashboard (Section 5.1)
- **Glossary:** সব term, বাংলা ব্যাখ্যা, কোন lesson-এ আছে তার link; lesson-এর ভেতরে term-এর উপর hover করলে tooltip
- **Badge:** 🆕 নতুন topic, "ঐচ্ছিক" topic
- **"পরবর্তী lesson"** button প্রতিটা lesson-এর শেষে
- **Mobile-friendly** ও **dark mode**-এ সব নতুন component ঠিকমতো দেখাবে

## 12. Platform-এ বর্তমান content থাকলে

যদি existing platform-এ আগে থেকে কিছু topic-এর content থাকে:

- Topic-গুলো Section 4-এর ক্রমে নতুন করে সাজাবে।
- পুরনো content মুছে ফেলবে না। আগে আমাকে দেখাবে কোন topic-এ কী আছে, তারপর আমি বলব সেটা নতুন template-এ রূপান্তর করবে নাকি নতুন করে লিখবে।
- পুরনো URL থাকলে, নতুন URL-এ redirect রাখবে, যাতে পুরনো link ভেঙে না যায়।

## 13. Build Milestone (এই ক্রমে কাজ করবে)

প্রতিটা milestone শেষে থেমে আমাকে দেখাবে।

**M1: Codebase বোঝা ও কাঠামো**

- Existing codebase পড়ে আমাকে সংক্ষেপে বলো: stack, content কোথায় থাকে, কোন tool আগে থেকে আছে, diagram কিভাবে বানানো হয়, progress কিভাবে save হয়
- Section 4-এর ক্রমে 117টা topic, ১৫টা phase-এ platform-এ বসাও (এখনো content ছাড়া), badge সহ
- Section 5-এর lesson template component-গুলো
- প্রতিটা topic-এর content কিভাবে রাখা হবে তার কাঠামো ঠিক করা, existing pattern মেনে। প্রস্তাব: lesson-এর লেখা, quiz (60টা প্রশ্ন), Recall Map আর LinkedIn post আলাদা আলাদা structured file-এ, যাতে 117টা topic-এ 7000-এর বেশি প্রশ্ন সহজে সামলানো আর যাচাই করা যায়। কাঠামোটা আমাকে দেখিয়ে অনুমোদন নেবে
- একটা content validation script: প্রতিটা topic-এ ঠিক 60টা প্রশ্ন (20/20/20), প্রতিটায় explanation আর whyWrong, Recall Map-এ ৬-১০টা point, LinkedIn post 3000 character-এর কম, hook 150 character-এর কম। Section 14-এর checklist-এর যা কিছু স্বয়ংক্রিয়ভাবে যাচাই করা যায়, সব এখানে

**M2: Visual System**

- Section 6.3-এর shared diagram component library: প্রতিটা component-এর icon আর রং, architecture diagram, sequence diagram, state diagram, before/after তুলনা, step-by-step animation
- সারাংশ card component
- PNG (1080×1350) ও PDF carousel download
- Section 9.1-এর simulator shell: layout, play/pause/step/speed, metrics panel, "কী ঘটছে" log, challenge mode-এর কাঠামো
- **Load Balancer Lab** (Section 9.2), সব simulator-এর reference হিসেবে। Engine-এর test আগে

**M3: Quiz ও Recall Engine**

- Section 7-এর quiz logic: আগে test, তারপর implementation
- Quiz UI: attempt, result, ভুল উত্তরের ব্যাখ্যা, "আবার চেষ্টা করুন"
- Section 5.1-এর Recall Map: review schedule-এর logic (আগে test), mind map ও list view, তিনটা mode, self-rating, "আজকের Recall" dashboard

**M4: LinkedIn Post Component**

- Section 8.4-এর post card: ৫ ধরন, অভিজ্ঞতার placeholder, Unicode bold, character count, প্রথম comment, poll field, copy button
- Logic-এর test আগে

**M5: নমুনা lesson**

- **Day 12: Message Queues**, সম্পূর্ণ: template-এর সব section, সব visual (Section 6.1), Message Queue Lab (Section 9.3), Recall Map (Section 5.1-এর উদাহরণের core point সহ), 60টা quiz প্রশ্ন, LinkedIn post (গল্প ধরন)
- সাথে Day 7-এর জন্য একটা **Weekly Recap** post আর carousel-এর নমুনা
- এটা দেখে আমি style, গভীরতা, visual, quiz-এর মান আর post-এর tone অনুমোদন করব। তারপর বাকি content শুরু হবে

**M6–M20: Phase ধরে content** (প্রতি phase একটা milestone; Phase 3 বড়, তাই চাইলে দুই ভাগে)

- প্রতিটা topic-এর জন্য: lesson content + visual + প্রাসঙ্গিক simulator + 60টা quiz প্রশ্ন + LinkedIn post
- প্রতি ৭ দিনে একটা Weekly Recap
- প্রতিটা phase শেষে `IMAGES_TODO.md` আপডেট

**M21: Case study কাঠামো**

- Case study template component, ধাপে ধাপে খোলার mode
- Architecture Diagram Builder, v1→v2→v3 diagram slider, failure scenario highlight
- **নমুনা case study: Pastebin।** অনুমোদনের পর বাকিগুলো

**M22: Case Study Tier 1 ও 2** (১-১৫)

**M23: Case Study Tier 3 ও 4** (১৬-৩৪)

**M24: শেষ ধাপ**

- Glossary পূর্ণ করা, সব link ঠিক আছে কিনা দেখা
- Mobile, dark mode, performance check

## 14. Quality Checklist (প্রতিটা topic/case study-র জন্য)

- [ ] Template-এর সব অংশ আছে (Section 5 বা 10.2)
- [ ] ব্যাখ্যা বাংলায়, technical term English-এ, জোর করে বানানো অনুবাদ নেই
- [ ] অন্তত একটা বাংলাদেশি জীবনের analogy আছে
- [ ] প্রতিটা concept-এর "কেন" ও trade-off বলা আছে
- [ ] আগের topic-এর সাথে overlap থাকলে recap + link, একই কথা আবার লেখা হয়নি (Section 4.1)
- [ ] **Visual:** Section 6.1-এর সব ন্যূনতম visual আছে; shared visual ভাষা মানা হয়েছে; caption ও alt text আছে; mobile ও dark mode-এ ঠিক দেখায়
- [ ] Technical তথ্য সঠিক; real company-র উদাহরণ শুধু প্রমাণিত তথ্য থেকে
- [ ] কোনো লেখা কোথাও থেকে কপি করা হয়নি
- [ ] **Recall Map:** ৬-১০টা core point, প্রতিটায় `prompt`, `answer` আর lesson-এর link; প্রতিটা point lesson-এ সত্যিই ব্যাখ্যা করা আছে
- [ ] **Simulator** (থাকলে): Section 9.1-এর ১৩টা শর্ত পূরণ করে, অন্তত ৩টা challenge আছে
- [ ] **Quiz:** ঠিক 60টা প্রশ্ন (20 easy / 20 medium / 20 hard), প্রতিটায় `explanation` আর প্রতিটা ভুল option-এর `whyWrong`
- [ ] **LinkedIn post:** hook প্রথম দুই লাইনে 150 character-এর মধ্যে; Day নম্বর ঠিক; অভিজ্ঞতার placeholder আছে; শেষে CTA প্রশ্ন; 3-5 hashtag; 3000 character-এর কম; প্রথম comment আছে; post-এর ধরন বণ্টনের নিয়ম মানা হয়েছে
- [ ] নতুন logic-এর test আছে এবং pass করে
