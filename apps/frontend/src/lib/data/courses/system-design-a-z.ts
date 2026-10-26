// "System Design A-Z" — our own Bangla system design course, laid out per
// docs/SYSTEM_DESIGN_PLATFORM_PLAN.md Section 4: 117 topics across 15 phases,
// Day number = global topic number. Topics have no content yet (milestone M1);
// lessons, quizzes, recall maps and LinkedIn posts get attached per topic later.

import type {
  CourseContentItem,
  CourseModuleTag,
  CourseSummary,
} from "@/lib/data/course-modules";
import { WRITTEN_TOPIC_IDS } from "../system-design/written-topics";

export const SYSTEM_DESIGN_A_Z_COURSE_ID = "system-design-a-z";

interface TopicOutline {
  title: string;
  tags?: CourseModuleTag[];
}

interface PhaseOutline {
  title: string;
  topics: TopicOutline[];
}

const PUBLISHED: CourseModuleTag[] = ["published"];
const NEW: CourseModuleTag[] = ["new"];
const OPTIONAL: CourseModuleTag[] = ["optional"];

const phases: PhaseOutline[] = [
  {
    title: "Phase 1 · শুরু ও প্রথম ধারণা",
    topics: [
      { title: "সিস্টেম ডিজাইন আসলে কী?", tags: PUBLISHED },
      { title: "Client, Server ও Internet", tags: PUBLISHED },
      { title: "DNS, HTTP ও একটি URL-এর গল্প", tags: PUBLISHED },
      { title: "API কী? REST-এর বেসিক", tags: PUBLISHED },
      { title: "Scalability", tags: PUBLISHED },
      { title: "Availability", tags: PUBLISHED },
      { title: "Latency vs Throughput", tags: PUBLISHED },
      { title: "CAP Theorem", tags: PUBLISHED },
      { title: "Load Balancers", tags: PUBLISHED },
      { title: "Databases", tags: PUBLISHED },
      { title: "CDN", tags: PUBLISHED },
      { title: "Message Queues", tags: PUBLISHED },
    ],
  },
  {
    title: "Phase 2 · Scaling-এর মূল উপাদান",
    topics: [
      { title: "Vertical vs Horizontal Scaling" },
      { title: "Stateful vs Stateless" },
      { title: "Proxy Servers" },
      { title: "API Gateway" },
      { title: "Caching" },
      { title: "Rate Limiting" },
      { title: "Capacity Estimation (Napkin Math)" },
    ],
  },
  {
    title: "Phase 3 · Database ও Storage গভীরে",
    topics: [
      { title: "SQL vs NoSQL" },
      { title: "Data Modeling" },
      { title: "Database Indexes" },
      { title: "Storage Engines (LSM vs B-tree)" },
      { title: "Bloom Filters" },
      { title: "ACID vs BASE" },
      {
        title:
          "Transactions ও Isolation Levels (dirty read, phantom read, serializable)",
        tags: NEW,
      },
      { title: "Optimistic vs Pessimistic Locking", tags: NEW },
      { title: "Database Replication" },
      { title: "Database Sharding" },
      { title: "Data Partitioning Strategies" },
      { title: "Consistent Hashing" },
      { title: "Unique ID Generation (UUID, Snowflake)", tags: NEW },
      {
        title:
          "Object Storage ও File Upload (S3, pre-signed URL, multipart/chunked upload)",
        tags: NEW,
      },
      {
        title: "Search ও Inverted Index (Elasticsearch-এর মূল ধারণা)",
        tags: NEW,
      },
      { title: "Geo-spatial Indexing (Geohash, Quadtree)", tags: NEW },
    ],
  },
  {
    title: "Phase 4 · Computer ও Network-এর ভেতরে",
    topics: [
      { title: "Process, Thread ও Concurrency", tags: NEW },
      { title: "OSI ও TCP/IP Model" },
      { title: "IP, Port ও Subnet" },
      { title: "TCP vs UDP" },
      { title: "DNS গভীরে" },
      { title: "TLS/SSL Handshake" },
      { title: "HTTP/1.1 vs HTTP/2 vs HTTP/3" },
      { title: "WebSockets, SSE ও Long Polling" },
      { title: "REST vs RPC vs GraphQL" },
      { title: "gRPC ও Protocol Buffers" },
      {
        title:
          "API Design গভীরে (pagination, versioning, idempotency key, error format)",
        tags: NEW,
      },
    ],
  },
  {
    title: "Phase 5 · Distributed Systems Theory",
    topics: [
      { title: "Strong vs Eventual Consistency" },
      { title: "Consistency Models" },
      { title: "Quorum ও R+W>N" },
      { title: "Time, Lamport ও Vector Clocks" },
      { title: "Consensus Algorithms" },
      { title: "Leader Election" },
      { title: "Distributed Locking (Redis lock, fencing token)", tags: NEW },
      { title: "2PC vs 3PC" },
      { title: "CRDTs" },
    ],
  },
  {
    title: "Phase 6 · Messaging ও Reliability",
    topics: [
      {
        title:
          "Event Streaming গভীরে (Kafka: partition, consumer group, offset)",
        tags: NEW,
      },
      { title: "Idempotency, Retry ও Exactly-once", tags: NEW },
      { title: "Backpressure ও Batching" },
      { title: "Circuit Breaker & Bulkhead" },
    ],
  },
  {
    title: "Phase 7 · Architecture Patterns",
    topics: [
      { title: "Client-Server Architecture" },
      { title: "Monolith vs Microservices" },
      { title: "Microservices Architecture" },
      { title: "Service Discovery ও Service Mesh", tags: NEW },
      { title: "Serverless Architecture" },
      { title: "Event-Driven Architecture" },
      { title: "Outbox Pattern", tags: NEW },
      { title: "Saga & Distributed Transactions" },
      { title: "CQRS" },
      { title: "Fan-out ও News Feed Pattern", tags: NEW },
    ],
  },
  {
    title: "Phase 8 · Data Engineering",
    topics: [
      { title: "OLTP vs OLAP" },
      { title: "Warehouse, Lake ও Lakehouse" },
      { title: "ETL vs ELT" },
      { title: "Change Data Capture (CDC)" },
      { title: "Batch vs Stream Processing" },
    ],
  },
  {
    title: "Phase 9 · Security ও Privacy",
    topics: [
      { title: "Authentication vs Authorization" },
      { title: "OAuth 2.0 ও OpenID Connect" },
      { title: "JWT ও Session Management" },
      { title: "Encryption ও TLS" },
      { title: "Password Hashing (bcrypt, salt)" },
      { title: "API Security ও OWASP Top 10" },
      { title: "DDoS Mitigation" },
    ],
  },
  {
    title: "Phase 10 · Deployment ও Infrastructure",
    topics: [
      { title: "Containers ও Docker" },
      { title: "Kubernetes" },
      { title: "CI/CD Pipeline" },
      { title: "Blue-Green ও Canary Deploy" },
      { title: "Infrastructure as Code" },
      { title: "Autoscaling" },
      { title: "Multi-region ও Edge" },
    ],
  },
  {
    title: "Phase 11 · Observability ও SRE",
    topics: [
      { title: "Logging, Metrics, Tracing" },
      { title: "SLI, SLO, SLA ও Error Budget" },
      { title: "Alerting ও On-call" },
      { title: "Chaos Engineering" },
      { title: "Incident Response ও Postmortem" },
      { title: "Disaster Recovery (RPO/RTO)" },
    ],
  },
  {
    title: "Phase 12 · Low-Latency Engineering",
    topics: [
      { title: "Latency Budget ও Tail Latency" },
      { title: "Lock-free ও Concurrency" },
      { title: "Memory, Cache line ও NUMA", tags: OPTIONAL },
      { title: "Kernel Bypass ও Zero-copy", tags: OPTIONAL },
    ],
  },
  {
    title: "Phase 13 · ML / AI System Design",
    topics: [
      { title: "ML System Lifecycle" },
      { title: "Feature Store" },
      { title: "Model Serving (batch vs real-time)" },
      { title: "Recommendation Systems" },
      { title: "Ranking ও Embeddings" },
      { title: "Vector Database ও ANN Search" },
      { title: "RAG ও LLM Serving" },
      { title: "A/B Testing ও Experimentation" },
      { title: "Model Monitoring ও Drift" },
    ],
  },
  {
    title: "Phase 14 · Blockchain ও Decentralized (ঐচ্ছিক)",
    topics: [
      { title: "Byzantine Fault Tolerance", tags: OPTIONAL },
      { title: "Blockchain কীভাবে কাজ করে", tags: OPTIONAL },
      { title: "Consensus: PoW vs PoS", tags: OPTIONAL },
      { title: "Merkle Tree ও Hashing", tags: OPTIONAL },
      { title: "Wallet ও Key Management", tags: OPTIONAL },
      { title: "Smart Contracts (পরিচিতি)", tags: OPTIONAL },
      { title: "P2P ও Decentralization Trade-off", tags: OPTIONAL },
    ],
  },
  {
    title: "Phase 15 · Interview Prep",
    topics: [
      {
        title:
          "Low-Level Design (LLD) পরিচিতি (OOP, SOLID, state machine, design pattern)",
        tags: NEW,
      },
      {
        title:
          "System Design Interview-এর ৭ ধাপ (requirement → estimation → API → data model → HLD → deep dive → trade-off)",
        tags: NEW,
      },
      {
        title:
          "Trade-off নিয়ে কথা বলা ও সাধারণ ভুল (interviewer আসলে কী দেখতে চায়, red flag)",
        tags: NEW,
      },
    ],
  },
];

const LAST_DAY = phases.reduce((sum, phase) => sum + phase.topics.length, 0);

const topicIdForDay = (day: number) => `sd-day-${String(day).padStart(3, "0")}`;

// Day numbers run globally across phases (Phase 2 starts at Day 13, etc.).
let nextDay = 1;

export const systemDesignAToZCourse: CourseSummary = {
  courseTitle: "SYSTEM DESIGN A-Z",
  courseId: SYSTEM_DESIGN_A_Z_COURSE_ID,
  milestones: phases.map((phase, phaseIndex) => ({
    id: `sd-phase-${String(phaseIndex + 1).padStart(2, "0")}`,
    title: phase.title,
    modules: phase.topics.map((topic) => {
      const day = nextDay++;
      const id = topicIdForDay(day);
      const contents: CourseContentItem[] = WRITTEN_TOPIC_IDS.has(id)
        ? [
            {
              type: "sd_lesson",
              title: "Lesson · Quiz · Recall · LinkedIn post",
              completed: false,
              contentId: id,
            },
          ]
        : [];
      return {
        id,
        title: `Day ${day} · ${topic.title}`,
        tags: topic.tags,
        contentCounts: {},
        progress: { completed: 0, total: contents.length, percentage: 0 },
        contents,
      };
    }),
  })),
};

/** Day number, title and phase of a topic id like "sd-day-012". */
export function findSystemDesignTopic(topicId: string) {
  for (const milestone of systemDesignAToZCourse.milestones) {
    const topic = milestone.modules.find((m) => m.id === topicId);
    if (topic) {
      return {
        day: Number(topicId.slice(-3)),
        title: topic.title.replace(/^Day \d+ · /, ""),
        href: `/course/${SYSTEM_DESIGN_A_Z_COURSE_ID}?milestone=${milestone.id}&module=${topic.id}`,
      };
    }
  }
  return null;
}

/** The topics before and after this one, for "আগের / পরের lesson". */
export function adjacentTopicIds(topicId: string) {
  const day = Number(topicId.slice(-3));
  return {
    previous: day > 1 ? topicIdForDay(day - 1) : null,
    next: day < LAST_DAY ? topicIdForDay(day + 1) : null,
  };
}

/** Course-page link for a day, e.g. for lesson prerequisites and forward links ("Day 28-এ গভীরে যাব"). */
export function topicHrefForDay(day: number): string {
  return (
    findSystemDesignTopic(topicIdForDay(day))?.href ??
    `/course/${SYSTEM_DESIGN_A_Z_COURSE_ID}`
  );
}
