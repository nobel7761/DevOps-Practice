// Outline-only snapshot of "SYSTEM DESIGN AND BACKEND ENGINEERING WITH AWS SEASON 3" pulled from poridhi.io's course
// roadmap API. The account used to fetch this is not enrolled in this course,
// so poridhi.io only exposes the syllabus structure (milestones/modules/
// content titles) — lab ids, video urls, and durations are gated behind
// enrollment and are therefore left unset below (see CourseSummary.notEnrolled).

import type { CourseSummary } from "@/lib/data/course-modules";

export const systemDesignSeason3Course: CourseSummary = {
  courseTitle: "SYSTEM DESIGN AND BACKEND ENGINEERING WITH AWS SEASON 3",
  notEnrolled: true,
  milestones: [
    {
      id: "e8fe064c-2530-4644-a481-067fb7afb0fd",
      title: "System Design Foundations & Distributed-Systems Thinking",
      modules: [
        {
          id: "0c122ceb-24d6-4b8f-9ca4-66a1bac75217",
          title: "Introduction to System Design & Interview Strategy",
          contentCounts: {
            pre_class: 7,
            lab: 4,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 12, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title:
                "Introduction to Modern System Design and why every developer should learn it",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "System analysis vs. system design; API design interview vs. system design interview",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Anatomy of a system design interview: scoping, requirements, drivers, deep dives",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "The Do's and Don'ts; why engineers fail and how they succeed",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "How to structure 45 minutes; signals interviewers look for",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Course structure, prerequisites, and the all-in-one master template",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Functional vs. non-functional requirements",
              completed: false,
            },
            {
              type: "lab",
              title: "M1-L1 — Requirement Teardown",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M1-L2 — Hello, Distributed System",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M1-L3 — Whiteboard to Spec",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M1-L4 — Integration: System Brief",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Foundations of System Design Interviews",
              completed: false,
            },
          ],
        },
        {
          id: "e21b9e3c-0f04-40a3-b954-b9cbe32dd329",
          title:
            "Distributed Systems Abstractions, Consistency & Failure Models",
          contentCounts: {
            pre_class: 6,
            lab: 4,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 11, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title:
                'Abstractions in distributed systems; "painting a software system" — connecting the dots',
              completed: false,
            },
            {
              type: "pre_class",
              title: "Network abstractions: Remote Procedure Calls (RPC)",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "The spectrum of consistency models: strict, sequential, causal, eventual",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "The spectrum of failure models: fail-stop, crash, omission, temporal, Byzantine",
              completed: false,
            },
            {
              type: "pre_class",
              title: "CAP theorem and the PACELC extension",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Trade-offs: when each consistency/failure assumption is appropriate",
              completed: false,
            },
            {
              type: "lab",
              title: "M2-L1 — RPC vs. REST in Practice",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M2-L2 — Simulating Failure Models",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M2-L3 — Consistency Trade-off Explorer",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M2-L4 — Integration: Failure & Consistency Summary",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Consistency, Failure Models & Trade-offs",
              completed: false,
            },
          ],
        },
        {
          id: "95d1c2d3-3b97-431b-8759-9c6e9708449f",
          title: "Non-Functional System Characteristics",
          contentCounts: {
            pre_class: 6,
            lab: 4,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 11, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "Availability (nines), and how to measure it",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Reliability and MTBF/MTTR",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Scalability (vertical vs. horizontal) and maintainability",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Fault tolerance and graceful degradation",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Defining and budgeting SLIs, SLOs, and error budgets",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Non-functional requirements as the driver of architecture",
              completed: false,
            },
            {
              type: "lab",
              title: "M3-L1 — Availability Math",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M3-L2 — SLO & Error Budget Definition",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M3-L3 — Topology-Driven Reliability Modeling",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M3-L4 — Integration: Reliability Baseline",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Reasoning About Non-Functional Requirements",
              completed: false,
            },
          ],
        },
        {
          id: "1001653b-77c8-4462-b6b8-b22386d8e5b6",
          title: "Back-of-the-Envelope Calculations & Capacity Planning",
          contentCounts: {
            pre_class: 5,
            lab: 4,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 10, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title:
                "Putting BOTEC numbers in perspective: latency numbers every engineer should know",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Server types, request estimation, QPS and peak-to-average ratios",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Resource estimation math: number of servers, storage, bandwidth",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                'Powers-of-two and time/throughput cheat sheet ("Numbers to Know")',
              completed: false,
            },
            {
              type: "pre_class",
              title: "Estimating cost alongside capacity",
              completed: false,
            },
            {
              type: "lab",
              title: "M4-L1 — Estimate a Photo-Sharing Backend",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M4-L2 — Server & Shard Count Planning",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M4-L3 — Cost-Aware Capacity Plan",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M4-L4 — Integration: Capacity Model",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Back-of-the-Envelope Estimation in Interviews",
              completed: false,
            },
          ],
        },
      ],
    },
    {
      id: "8a6416f7-baf0-4b26-b5f2-ba56f9fc7b2a",
      title: "Backend Engineering with Node.js & API Design",
      modules: [
        {
          id: "f79e8f0d-d533-4659-84e3-d13b456f2c89",
          title: "Node.js & Asynchronous Backend Development",
          contentCounts: {
            pre_class: 7,
            lab: 4,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 12, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title:
                "What is Node.js and why use it for backends; the event loop",
              completed: false,
            },
            {
              type: "pre_class",
              title: "ES6 essentials for Node.js",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Asynchronous programming: callbacks, promises, async/await",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Understanding data flow in a web application; data nature on the front end",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Application layer and database access with Express.js",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Connecting a PostgreSQL database from a Node.js backend",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Error handling, configuration, and graceful shutdown",
              completed: false,
            },
            {
              type: "lab",
              title: "M5-L1 — Express CRUD Service",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M5-L2 — Async Patterns & Backpressure",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M5-L3 — Modular Streaming Service",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M5-L4 — Integration: Production-Shaped Service",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Asynchronous Backend Engineering with Node.js",
              completed: false,
            },
          ],
        },
        {
          id: "10cd123e-d72e-4d4a-baca-b3ef0b27633f",
          title: "API Design & Networking Essentials",
          contentCounts: {
            pre_class: 6,
            lab: 4,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 11, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title:
                "Networking essentials: TCP/UDP, HTTP/1.1 vs HTTP/2 vs HTTP/3, TLS",
              completed: false,
            },
            {
              type: "pre_class",
              title: "REST, RPC/gRPC, and GraphQL trade-offs",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Resource modeling, versioning, pagination, idempotency, error contracts",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Authentication & authorization (tokens, sessions, OAuth basics)",
              completed: false,
            },
            {
              type: "pre_class",
              title: "API gateways, request/response lifecycle",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Designing for backward compatibility",
              completed: false,
            },
            {
              type: "lab",
              title: "M6-L1 — Contract-First API",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M6-L2 — Idempotent Write Endpoint",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M6-L3 — Gateway & Rate-Aware Routing",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M6-L4 — Integration: API Layer",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Designing Robust APIs",
              completed: false,
            },
          ],
        },
        {
          id: "aa8447f0-d252-413e-8c79-ec0857d8c409",
          title: "Enterprise Backend Architecture & Microservices Foundations",
          contentCounts: {
            pre_class: 6,
            lab: 4,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 11, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title:
                "Designing enterprise Node.js systems: application layers and structures",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Domain-driven boundaries; service decomposition",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Synchronous vs. asynchronous service communication",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Containerizing services; 12-factor configuration",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Inter-service contracts and shared libraries",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Introduction to microservices with Docker",
              completed: false,
            },
            {
              type: "lab",
              title: "M7-L1 — Layered Architecture Refactor",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M7-L2 — Three-Service Microservice Split",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M7-L3 — Inter-Service Communication",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M7-L4 — Integration: Microservice Stack",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "From Monolith to Microservices",
              completed: false,
            },
          ],
        },
      ],
    },
    {
      id: "78dc2242-0ecd-46c0-8385-4b16204e4fc6",
      title: "The Data Layer — Databases, Caching & Storage at Scale",
      modules: [
        {
          id: "e4696d47-d468-4800-82f3-cd3e52abc25f",
          title: "Databases & Data Modeling",
          contentCounts: {
            pre_class: 6,
            lab: 4,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 11, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title:
                "Introduction to databases; types of databases (relational, document, columnar, graph, time-series)",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Data modeling: normalization vs. denormalization, access-pattern-driven design",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Database indexing: B-tree, hash, composite, covering indexes",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "ACID: atomicity, consistency, isolation, durability — and how each is achieved",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Concurrency control: single-server and multi-server environments",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Trade-offs between SQL and NoSQL; choosing PostgreSQL vs. DynamoDB vs. Cassandra",
              completed: false,
            },
            {
              type: "lab",
              title: "M8-L1 — Access-Pattern-Driven Schema",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M8-L2 — Indexing & Query Plans",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M8-L3 — Isolation Levels in Action",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M8-L4 — Integration: Data-Tier Decision Record",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Choosing the Right Data Model",
              completed: false,
            },
          ],
        },
        {
          id: "d93e4575-9907-4e73-92bd-ba268cf51799",
          title: "Replication, Partitioning & Consistent Hashing",
          contentCounts: {
            pre_class: 6,
            lab: 4,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 11, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "Why replication; snapshot vs. transactional replication",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Master–slave and master–master architectures",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Synchronous vs. asynchronous replication; consistency and conflict resolution",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Data partitioning strategies (range, hash, directory)",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Consistent hashing and virtual nodes",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Rebalancing, hot partitions, and failover",
              completed: false,
            },
            {
              type: "lab",
              title: "M9-L1 — MySQL/Postgres Replication",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M9-L2 — Failover Drill",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M9-L3 — Consistent Hashing Ring",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M9-L4 — Integration: Scaling Data Layer",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Replication, Partitioning & Sharding Strategy",
              completed: false,
            },
          ],
        },
        {
          id: "cf687c22-079c-4d08-a07b-bcf1de5b4aa2",
          title: "Caching & Distributed Cache",
          contentCounts: {
            pre_class: 6,
            lab: 4,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 11, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title:
                "Why cache; cache-aside, read-through, write-through, write-back",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Eviction policies (LRU, LFU, TTL) and the thundering-herd problem",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Redis deep dive: strings, lists, sets, hashes, sorted sets, bitmaps, HyperLogLog, streams, geo",
              completed: false,
            },
            {
              type: "pre_class",
              title: "TTL/expiration, atomic operations, and transactions",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Designing a distributed cache: high-level and detailed design, evaluation",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Memcached vs. Redis; cache invalidation strategies",
              completed: false,
            },
            {
              type: "lab",
              title: "M10-L1 — Cache-Aside Layer",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M10-L2 — Redis Data-Structure Workout",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M10-L3 — Thundering-Herd Defense",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M10-L4 — Integration: Cache Layer",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Caching Strategy & Cache Invalidation",
              completed: false,
            },
          ],
        },
        {
          id: "d3ee9b07-0a85-4c8c-acfa-43aff5170b02",
          title: "Distributed Key-Value Stores",
          contentCounts: {
            pre_class: 5,
            lab: 4,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 10, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title:
                "Designing a scalable key-value store: scalability, replication, versioning (vector clocks), configurability",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Quorum reads/writes and the (N, R, W) trade-off",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Versioning with vector clocks: when, why, and the cost",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Fault tolerance and failure detection: gossip-based heartbeats, hinted handoff",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Evaluation and trade-offs of KV designs (Dynamo vs. Cassandra vs. etcd)",
              completed: false,
            },
            {
              type: "lab",
              title: "M11a-L1 — Mini Replicated Key-Value Store",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M11a-L2 — Vector-Clock Versioning",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M11a-L3 — Gossip Heartbeats & Hinted Handoff",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M11a-L4 — Integration: Replicated KV Store",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Designing Distributed Key-Value Stores",
              completed: false,
            },
          ],
        },
        {
          id: "4a3c7908-815a-4571-8535-1c2e12012390",
          title: "Blob & Object Stores",
          contentCounts: {
            pre_class: 5,
            lab: 4,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 10, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title:
                "Designing a blob store: requirements, storage layout, large-object handling",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Storage classes and tiering (hot / warm / cold / archive)",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Handling large blobs: chunking, multipart upload, resumable transfer, presigned URLs",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Lifecycle rules, retention, and storage-class transitions",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Evaluation and trade-offs (S3 vs. MinIO vs. GCS vs. Azure Blob)",
              completed: false,
            },
            {
              type: "lab",
              title: "M11b-L1 — Storage Layout & Tiering Walkthrough",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M11b-L2 — Multipart Upload with Resumable Transfer",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M11b-L3 — Tier-Transition Measurement",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M11b-L4 — Integration: Blob Storage Layer",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Object Stores at Scale",
              completed: false,
            },
          ],
        },
      ],
    },
    {
      id: "8f8dddca-5fb6-40ba-a1e7-2e58f7710727",
      title: "Distributed Building Blocks & Messaging",
      modules: [
        {
          id: "974ad204-b980-486a-9c1a-54967ff199bc",
          title: "DNS, Load Balancing & CDN",
          contentCounts: {
            pre_class: 5,
            lab: 4,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 10, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "How DNS works; resolution, caching, TTLs, GeoDNS",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Load balancers: placement, L4 vs. L7, global vs. local, tiers",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Load-balancing algorithms (round-robin, least-connections, hashing) and health checks",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Fault-tolerant load balancing",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "CDN design: caching strategies, consistency, push vs. pull, edge invalidation",
              completed: false,
            },
            {
              type: "lab",
              title: "M12-L1 — L4 vs L7 Load Balancing",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M12-L2 — Health Checks & Failover",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M12-L3 — Edge Cache Behavior",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M12-L4 — Integration: Traffic Layer",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Designing the Traffic Layer",
              completed: false,
            },
          ],
        },
        {
          id: "0cb1c6d5-354f-4fe7-a3f6-1fb70643970e",
          title: "Rate Limiting & Traffic Management",
          contentCounts: {
            pre_class: 5,
            lab: 4,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 10, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title:
                "Why rate limit; requirements and placement (edge, gateway, service)",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Algorithms: fixed window, sliding window log, sliding window counter, token bucket, leaky bucket",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Distributed rate limiting and shared counters",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Rate limiting in microservices and with Nginx",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Pattern: scaling reads and protecting writes",
              completed: false,
            },
            {
              type: "lab",
              title: "M13-L1 — Token Bucket from Scratch",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M13-L2 — Distributed Rate Limiter",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M13-L3 — Nginx Edge Rate Limiting",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M13-L4 — Integration: Rate Limiting Stack",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Rate Limiting Algorithms & Trade-offs",
              completed: false,
            },
          ],
        },
        {
          id: "a64d076e-14d8-4793-a82d-3bd6c1c0df53",
          title: "Messaging Queues & Pub-Sub",
          contentCounts: {
            pre_class: 6,
            lab: 4,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 11, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title:
                "Distributed message queue design: requirements, ordering, delivery semantics (at-least/at-most/exactly-once)",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Pub-sub abstraction and design; topics, partitions, consumer groups",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "RabbitMQ exchanges (direct, default, fanout, topic, headers) and multi-cluster",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Kafka fundamentals: log, partitions, offsets, replication, retention",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Stream processing concepts (Flink) and the role of ZooKeeper/coordination",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Patterns: multi-step processes, managing long-running tasks",
              completed: false,
            },
            {
              type: "lab",
              title: "M14-L1 — RabbitMQ Exchange Tour",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M14-L2 — Kafka Ordering & Consumer Groups",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M14-L3 — Exactly-Once-ish Processing",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M14-L4 — Integration: Messaging Pipeline",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Choosing the Right Messaging Backbone",
              completed: false,
            },
          ],
        },
        {
          id: "ca83a15e-3274-4dc4-86aa-ca2c09dcf47f",
          title: "Real-Time Communication with WebSockets",
          contentCounts: {
            pre_class: 6,
            lab: 4,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 11, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "Sockets: what and why; basic socket architecture",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "WebSocket vs. long-polling vs. SSE; choosing per use case",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Socket.io components: rooms, namespaces, broadcasting, acknowledgements",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Designing a chat system; presence and delivery receipts",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Scaling socket applications (sticky sessions, pub-sub fan-out)",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Pattern: real-time updates",
              completed: false,
            },
            {
              type: "lab",
              title: "M15-L1 — Basic Chat App",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M15-L2 — Presence & Delivery Receipts",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M15-L3 — Scaling Sockets with Redis Pub-Sub",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M15-L4 — Integration: Real-Time Tier",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Scaling Real-Time Systems",
              completed: false,
            },
          ],
        },
        {
          id: "3dca96a4-2797-4bef-a505-b9b23eeae5d1",
          title: "Distributed Search & Typeahead",
          contentCounts: {
            pre_class: 5,
            lab: 4,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 10, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title:
                "Distributed search: indexing, the inverted index, ranking, scaling search and indexing, replication",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Elasticsearch fundamentals: mappings, analyzers, tokenization, stemming, stop words, query DSL, relevance basics",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Typeahead / autocomplete at scale: trie/prefix structures, frequency ranking, top-K retrieval",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Assemblers and the data-flow problem: how updates propagate to the typeahead index",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Trade-offs: memory of tries vs. hash + heap, freshness vs. throughput, single-node vs. sharded typeahead",
              completed: false,
            },
            {
              type: "lab",
              title: "M16a-L1 — Build an Inverted Index with Ranking",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M16a-L2 — Typeahead Service with a Trie",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M16a-L3 — Elasticsearch Side-by-Side Comparison",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M16a-L4 — Integration: Search Layer",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Search at Scale: Indexing & Typeahead",
              completed: false,
            },
          ],
        },
        {
          id: "f398b5d6-d7ab-4073-ba8d-ef08839dc558",
          title: "Sequencers, Sharded Counters & Approximate Structures",
          contentCounts: {
            pre_class: 5,
            lab: 4,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 10, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title:
                "Sequencer & unique ID generation: causality, monotonicity, the Snowflake-style design (timestamp + machine ID + sequence)",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Clock skew and the failure modes of wall-clock-based IDs",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Sharded counters: the high-write-counter problem and the sharded-aggregate pattern",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Top-K and approximate structures: Count-Min Sketch, Count sketch, HyperLogLog",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "When to use approximate vs. exact; error vs. memory trade-offs",
              completed: false,
            },
            {
              type: "lab",
              title: "M16b-L1 — Snowflake-Style Unique-ID Generator",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M16b-L2 — Sharded Counter for High-Write QPS",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "M16b-L3 — Count-Min Sketch & HyperLogLog on Real Workloads",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M16b-L4 — Integration: Analytics Building Blocks",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Unique IDs, Sharded Counters & Approximations",
              completed: false,
            },
          ],
        },
      ],
    },
    {
      id: "96e575ed-66bf-4bd7-b0c8-fd69a0b95565",
      title: "AWS for System Design",
      modules: [
        {
          id: "dcc9206b-c841-458f-a6a1-43108a03f059",
          title: "AWS Networking & Compute Infrastructure",
          contentCounts: {
            pre_class: 6,
            lab: 4,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 11, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title: "AWS introduction and the shared-responsibility model",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "AWS networking basics; VPC design, subnets, route tables, IGW/NAT",
              completed: false,
            },
            {
              type: "pre_class",
              title: "VPC peering and security groups vs. NACLs",
              completed: false,
            },
            {
              type: "pre_class",
              title: "EC2 instance families; AMIs and user data",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Auto Scaling Groups and launch templates",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Elastic Load Balancing (ALB/NLB) in AWS",
              completed: false,
            },
            {
              type: "lab",
              title: "M17-L1 — Build a secure VPC with Public/Private Subnets",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M17-L2 — Auto-Scaling Web Tier",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M17-L3 — VPC Peering",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M17-L4 — Integration: Network Baseline",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "AWS Networking & Compute Decisions",
              completed: false,
            },
          ],
        },
        {
          id: "f3da326d-7338-4f60-b590-bfa6b1ee4af0",
          title: "Containers on AWS",
          contentCounts: {
            pre_class: 6,
            lab: 4,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 11, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title:
                "Docker for backend engineers: smart Dockerfiles, multi-stage builds, image optimisation, layer caching",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Docker Compose for full-stack local stacks",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "How Docker concepts map to AWS: images → ECR, containers → EC2, networks → VPC, volumes → EBS",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "ECR: pushing and pulling images, scan-on-push, lifecycle policies",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Managing config and secrets in containers: environment variables, SSM Parameter Store, Secrets Manager",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Container networking on EC2: bridge vs. host mode, port mapping, inter-container communication",
              completed: false,
            },
            {
              type: "lab",
              title: "Lab 18.1 — Optimised Multi-Stage Docker Image",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Lab 18.2 — Run Containerised Microservices on EC2",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Lab 18.3 — Manual Rolling Deploy & Rollback Drill",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "Lab 18.4 — Capstone: Container Deployment Pipeline",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Container Deployment on AWS",
              completed: false,
            },
          ],
        },
        {
          id: "675cbe79-c94a-40fe-9145-ecc40fb65094",
          title: "Kubernetes on EKS — Advanced Track",
          contentCounts: {
            pre_class: 7,
            lab: 4,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 12, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title:
                "Kubernetes architecture for application developers: pods, deployments, services, ingress, namespaces",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "EKS / k3s / local K8s: which to use, and trade-offs (managed control plane vs. local)",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "kubectl, kustomize / Helm, and the manifest-as-code workflow",
              completed: false,
            },
            {
              type: "pre_class",
              title: "HPA (Horizontal Pod Autoscaler), VPA, Cluster Autoscaler",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "StatefulSets, PersistentVolumeClaims, and running stateful services (Redis, RabbitMQ, databases) on K8s",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Blue-green and canary deploys (Argo Rollouts, Flagger); pod disruption budgets",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Production hardening: resource requests/limits, liveness vs. readiness probes, securityContext, secret management",
              completed: false,
            },
            {
              type: "lab",
              title: "M19-L1 — Deploy a Stateless Service to EKS (or k3s)",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M19-L2 — HPA-Driven Scale Demo for a WebSocket App",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M19-L3 — Stateful Service on K8s (or Canary Deploy)",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M19-L4 — Integration: Production K8s Stack",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Production Kubernetes on EKS",
              completed: false,
            },
          ],
        },
      ],
    },
    {
      id: "c8384a8f-331d-420b-a987-f166f7c51b5c",
      title: "Observability & Reliability in Production",
      modules: [
        {
          id: "1e00ce68-b2ae-47a8-8f96-16a90c4ae2e1",
          title: "Distributed Monitoring & Metrics",
          contentCounts: {
            pre_class: 6,
            lab: 4,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 11, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title:
                "Distributed monitoring: prerequisites, metric types, push vs. pull",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Designing a metrics monitoring system (server-side errors), detailed design and visualization",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Monitoring client-side errors",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Prometheus + Grafana; PromQL basics; exporters and service discovery",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Alerting, SLO dashboards, and burn-rate alerts",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Time-series databases for metrics",
              completed: false,
            },
            {
              type: "lab",
              title: "M20-L1 — Instrument a Service",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M20-L2 — SLO Dashboard & Alerts",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M20-L3 — Client-Side Error Capture",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M20-L4 — Integration: Metrics & Alerting",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Designing for Observability",
              completed: false,
            },
          ],
        },
        {
          id: "27fec9d7-ecf7-469a-a7f6-6da766527b0e",
          title: "Distributed Logging & Tracing",
          contentCounts: {
            pre_class: 6,
            lab: 4,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 11, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title:
                "Distributed logging: design of a logging service, structured logs, sampling",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Log aggregation with Loki; querying logs",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Distributed tracing concepts; context propagation",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "OpenTelemetry: instrumentation, MySQL/Redis instrumentation, exporters",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Tracing multi-service requests across AWS with Tempo/OTel",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Correlating logs, metrics, and traces",
              completed: false,
            },
            {
              type: "lab",
              title: "M21-L1 — Structured Logging + Loki",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M21-L2 — End-to-End Tracing",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M21-L3 — Correlated Debugging",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M21-L4 — Integration: Correlated Observability",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Correlating Logs, Metrics & Traces",
              completed: false,
            },
          ],
        },
        {
          id: "0e09cd17-eb97-4659-871b-3913b6691e5c",
          title: "Distributed Task Scheduling & Async Job Processing",
          contentCounts: {
            pre_class: 5,
            lab: 4,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 10, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title:
                "Distributed task scheduler: requirements, prioritization, idempotency, queuing",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Resource/capacity optimization and fairness",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Async job processing patterns; retries, backoff, dead-letter queues",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Cron at scale; leader election and coordination (ZooKeeper/etcd)",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Pattern: managing long-running tasks and multi-step processes",
              completed: false,
            },
            {
              type: "lab",
              title: "M22-L1 — Job Queue with Retries",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M22-L2 — Priority & Fair Scheduling",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M22-L3 — Distributed Cron with Leader Election",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M22-L4 — Integration: Async Job Tier",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Designing Async Job Systems",
              completed: false,
            },
          ],
        },
        {
          id: "fef0a21b-c442-46ad-8cb1-1699fc5a4419",
          title: "Lessons from System Failures & Resilience Engineering",
          contentCounts: {
            pre_class: 5,
            lab: 4,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 10, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title:
                "Case studies: the Facebook/WhatsApp/Instagram/Oculus outage; AWS Kinesis outage; AWS widespread outage",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Common failure modes: cascading failures, retry storms, gray failures",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Resilience patterns: circuit breakers, bulkheads, timeouts, backpressure, graceful degradation",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Chaos engineering fundamentals",
              completed: false,
            },
            {
              type: "pre_class",
              title: "Postmortems and blameless culture",
              completed: false,
            },
            {
              type: "lab",
              title: "M23-L1 — Circuit Breaker & Timeouts",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M23-L2 — Chaos Drill",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M23-L3 — Postmortem Write-Up",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title:
                "M23-L4 — Integration: Resilience Pack (graduation requirement)",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Resilience Engineering & Postmortems",
              completed: false,
            },
          ],
        },
      ],
    },
    {
      id: "eefccc8c-59de-4a1d-8ce4-fea341fab8b0",
      title: "Designing Real-World Systems (Case Studies)",
      modules: [
        {
          id: "5e448b40-9d67-4ff9-96a4-39d09b010d56",
          title: "The RESHADED Framework — URL Shortener as Worked Example",
          contentCounts: {
            pre_class: 4,
            lab: 4,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 9, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title:
                "The RESHADED approach for tackling unseen problems; the all-in-one master template",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "How to drive a 45-minute design interview; signals interviewers look for",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Full live walkthrough — URL Shortener / TinyURL / Bitly: Requirements, BOTEC, Encoding strategy, Schema, API, Scalability, Evaluation",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "How to use the AI-assisted design workflow throughout Modules 25–29",
              completed: false,
            },
            {
              type: "lab",
              title: "M24-L1 — Full RESHADED Write-Up",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M24-L2 — Encoding Math & Schema Walkthrough",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M24-L3 — Cache & Redirect Path Profile",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M24-L4 — Integration: Complete URL Shortener Design",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Driving a 45-Minute System Design Interview",
              completed: false,
            },
          ],
        },
        {
          id: "7bb5565f-51b3-4e5d-ac36-13c9e0ce2aa1",
          title: "YouTube — Media Streaming at Scale",
          contentCounts: {
            pre_class: 8,
            lab: 4,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 13, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title:
                "Requirements: upload, transcode, stream, search, recommendations — functional + non-functional",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "High-Level Design: upload service → message queue → transcoding workers → object storage → CDN → video player",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Chunked upload + resumable multipart — presigned URLs, chunk manifest, upload session state, retry on partial failure",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Async transcoding pipeline — job queue, worker pool, output format DAG, encoding parameters, DAG dependency tracking",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Video delivery + adaptive bitrate streaming — HLS/DASH, CDN edge caching, manifest file, bitrate ladder switching",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Metadata service: video catalog, search index, view-count ingestion (sharded counters from M16b)",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Recommendation signal ingestion: watch-time events → feature pipeline → offline model → serving",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Evaluation: storage cost model, transcoding fleet sizing, CDN cache efficiency, hotspot content handling",
              completed: false,
            },
            {
              type: "lab",
              title: "M25-L1 — Full YouTube Design Doc",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M25-L2 — Chunked Upload Prototype",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M25-L3 — Async Transcoding Worker",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M25-L4 — Integration: YouTube Vertical Slice",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Designing YouTube-Scale Media Streaming",
              completed: false,
            },
          ],
        },
        {
          id: "34516483-a2bf-4311-a35d-97b53eb01b20",
          title: "Twitter — Social Graph & News Feed",
          contentCounts: {
            pre_class: 8,
            lab: 4,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 13, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title:
                "Requirements: follow graph, tweet post, home timeline, search, notifications",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "High-Level Design: write path (fan-out-on-write), read path (fan-out-on-read), hybrid decision tree",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Fan-out strategies — pure push, pure pull, hybrid; when each strategy breaks",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Celebrity / hot-key problem — pull-on-read, bounded write amplification, cache warming",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Timeline cache — pre-computed feeds, TTL strategy, cold-start, pagination with cursor",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Client-side load balancing — why Twitter moved load-balancing to the client tier; consistent hashing across timeline servers",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Tweet storage schema; ranking signals; cursor-based pagination",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Evaluation: write amplification math at 100M DAU, cache hit ratio targets, replication lag budget",
              completed: false,
            },
            {
              type: "lab",
              title: "M26-L1 — Full Twitter Design Doc",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M26-L2 — Hybrid Fan-Out Prototype",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M26-L3 — Post Search Index",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M26-L4 — Integration: Twitter Vertical Slice",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Designing Twitter-Scale Feeds",
              completed: false,
            },
          ],
        },
        {
          id: "ba66e2fe-e18b-4c2d-a0d1-e48ed18d194a",
          title: "Uber — Real-Time Location & Matching",
          contentCounts: {
            pre_class: 8,
            lab: 4,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 13, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title:
                "Requirements: rider request, driver location ingestion, matching, dispatch, ETA, surge pricing",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "High-Level Design: location service, matching service, trip service, payment service, fraud service",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Location ingestion at scale — driver heartbeat write QPS, time-series store vs. current-position store, spatial index updates",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Geospatial indexing — geohash vs. quadtree vs. S2 cells; precision, coverage, update cost; when each breaks",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Driver-rider matching under contention — optimistic locking, double-assignment prevention, fairness policies, lock timeout",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "ETA computation — tiled road graph sharding, Dijkstra / A* at scale, real-time traffic weight updates, route caching",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Surge pricing: supply/demand ratio per geohash cell; smooth transitions",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Evaluation: location update QPS headroom, matching latency budget (< 500 ms), hot-city sharding",
              completed: false,
            },
            {
              type: "lab",
              title: "M27-L1 — Full Uber Design Doc",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M27-L2 — Geo-Index Prototype",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M27-L3 — Matching Under Contention",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M27-L4 — Integration: Uber Vertical Slice",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Designing Uber-Scale Real-Time Matching",
              completed: false,
            },
          ],
        },
        {
          id: "57a48f7a-3128-4c50-93f5-ef05a9f398aa",
          title: "WhatsApp — Messaging & Delivery Guarantees",
          contentCounts: {
            pre_class: 8,
            lab: 4,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 13, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title:
                "Requirements: 1-1 messaging, group messaging, delivery/read receipts, media sharing, E2E encryption (design level)",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "High-Level Design: client ↔ chat server (persistent WebSocket), message store, push notification gateway, media service, presence service",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Connection management at scale — persistent WebSocket sessions, consistent hash on user ID, reconnection thundering-herd prevention",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Delivery semantics — at-least-once with server-side dedup, sequence numbers, offline queue with TTL",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Group messaging fan-out — membership store, fan-out worker, amplification math, large group limits, receipt aggregation",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Message storage — hot store (Cassandra, recent 30 days) vs. cold archive (S3 + index), per-conversation vs. per-user schema, media dedup",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "End-to-end encryption at the design level: Signal Protocol, server sees only ciphertext — implications for routing, backup, group keys",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Evaluation: connection server capacity, storage cost per user-year, group fan-out amplification, media dedup savings",
              completed: false,
            },
            {
              type: "lab",
              title: "M28-L1 — Full WhatsApp Design Doc",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M28-L2 — 1-1 Messaging with Delivery Receipts",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M28-L3 — Group Fan-Out Worker",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M28-L4 — Integration: WhatsApp Vertical Slice",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Designing WhatsApp-Scale Messaging",
              completed: false,
            },
          ],
        },
        {
          id: "d71305f6-78e6-41e6-8a0b-59cec3955032",
          title: "Payment System — Financial Correctness & Contention",
          contentCounts: {
            pre_class: 8,
            lab: 4,
            ai_interview: 1,
          },
          progress: { completed: 0, total: 13, percentage: 0 },
          contents: [
            {
              type: "pre_class",
              title:
                "Requirements: send money, receive money, transaction history; non-functional: exactly-once, auditability, sub-second confirmation, regulatory constraints",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "High-Level Design: payment API → ledger service → bank connector (PSP) → notification service → reconciliation job",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Idempotency at every layer — idempotency keys, database-enforced uniqueness, client retry protocol, idempotency across service boundaries",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Double-entry ledger — credit/debit entries, immutable append-only rows, balance derivation vs. materialized balance cache, audit trail",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Reconciliation — periodic sweep comparing internal ledger to bank/PSP statement, discrepancy classification, resolution workflow",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Holds under contention — Ticketmaster-style: reserve → confirm/release lifecycle, optimistic vs. pessimistic locking, oversell prevention",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Distributed saga for multi-step transfers: forward steps, compensating transactions, saga log, failure recovery",
              completed: false,
            },
            {
              type: "pre_class",
              title:
                "Evaluation: consistency vs. availability on the write path (CP system), audit log retention cost, regulatory replay, ledger throughput",
              completed: false,
            },
            {
              type: "lab",
              title: "M29-L1 — Full Payment System Design Doc",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M29-L2 — Double-Entry Ledger with Reconciliation",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M29-L3 — Seat Hold Under Contention",
              completed: false,
              labId: null,
            },
            {
              type: "lab",
              title: "M29-L4 — Integration: Payment System Vertical Slice",
              completed: false,
              labId: null,
            },
            {
              type: "ai_interview",
              title: "Designing Payment-Scale Financial Systems",
              completed: false,
            },
          ],
        },
      ],
    },
  ],
};
