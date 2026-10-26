// Copy and ready-made scenarios for the Load Balancer Lab (Plan doc Section 9.2).

import {
  createLoadBalancerLab,
  setPrimaryLbUp,
  setServerStatus,
  type LbAlgorithm,
  type LbLabOptions,
  type LbState,
} from "@/lib/system-design/sim/load-balancer/engine";

export const LB_SEED = 42;

export const ALGORITHM_INFO: Record<LbAlgorithm, string> = {
  "round-robin":
    "পালা করে একের পর এক server-এ পাঠায়, server কতটা ব্যস্ত তা দেখে না।",
  "weighted-round-robin":
    "পালা করে পাঠায়, কিন্তু বড় server (বেশি weight) বেশি পালা পায়।",
  "least-connections":
    "যে server-এ (তার আকারের তুলনায়) সবচেয়ে কম চলমান request, সেখানে পাঠায়।",
  "least-response-time":
    "যে server সম্প্রতি সবচেয়ে দ্রুত উত্তর দিয়েছে আর কম ব্যস্ত, সেখানে পাঠায়।",
  "ip-hash":
    "User-এর পরিচয় (IP) থেকে hash করে, তাই একই user সবসময় একই server-এ যায়।",
  random: "এলোমেলোভাবে যেকোনো একটা server বেছে নেয়।",
  "power-of-two":
    "এলোমেলো দুটো server বেছে, তাদের মধ্যে কম ব্যস্তটায় পাঠায়। সস্তা কিন্তু খুব কার্যকর।",
};

export const HOW_TO = [
  "▶️ Play চাপুন, তারপর Traffic tab-এ RPS বাড়ান বা Burst পাঠান।",
  "Algorithm বদলে দেখুন request কোথায় যায়, আর 'কী ঘটছে' log-এ কারণ পড়ুন।",
  "Servers tab-এ কোনো server বন্ধ বা ধীর করুন, metrics-এ কী বদলায় দেখুন।",
  "নিচের Challenge-গুলো পূরণ করুন। প্রতিটার পাশে 'সাজান' চাপলে পরিস্থিতি তৈরি হয়ে যাবে।",
];

export const LESSON =
  "Load Balancer শুধু request ভাগ করে না। কোন server কতটা ক্ষমতাশালী, কোনটা ধীর বা মারা গেছে, user-এর state কোথায় আছে, এসব বিবেচনা না করলে ভাগ করাটাই সমস্যা তৈরি করে। আর Load Balancer নিজেও একটা single point of failure, তাই তারও backup লাগে।";

const base = (options: Partial<LbLabOptions> = {}): LbState =>
  createLoadBalancerLab({
    servers: [{ size: "medium" }, { size: "medium" }, { size: "medium" }],
    seed: LB_SEED,
    traffic: { rps: 30, pattern: "steady", heavyRatio: 0.1, userCount: 8 },
    ...options,
  });

export const initialLabState = () => base();

export const LB_PRESETS: { id: string; label: string; build: () => LbState }[] =
  [
    {
      id: "slow-server",
      label: "একটা server ধীর হয়ে গেলে কী হয়?",
      build: () =>
        setServerStatus(
          base({
            traffic: {
              rps: 60,
              pattern: "steady",
              heavyRatio: 0,
              userCount: 8,
            },
          }),
          "server-2",
          "slow",
        ),
    },
    {
      id: "no-health-check",
      label: "Health check ছাড়া server মারা গেলে",
      build: () =>
        setServerStatus(
          base({
            healthCheck: { enabled: false, intervalMs: 2000, failThreshold: 2 },
          }),
          "server-3",
          "down",
        ),
    },
    {
      id: "lc-vs-rr",
      label: "ভারী request-এ Round Robin বনাম Least Connections",
      build: () =>
        base({
          traffic: {
            rps: 40,
            pattern: "steady",
            heavyRatio: 0.5,
            userCount: 8,
          },
        }),
    },
    {
      id: "spike",
      label: "হঠাৎ traffic spike",
      build: () =>
        base({
          traffic: { rps: 40, pattern: "spike", heavyRatio: 0.1, userCount: 8 },
        }),
    },
  ];

/** "সাজান" for each challenge: puts the lab into the challenge's starting situation. */
export const CHALLENGE_SETUPS: Record<string, () => LbState> = {
  "uneven-servers": () =>
    base({
      servers: [{ size: "large" }, { size: "small" }, { size: "small" }],
      traffic: { rps: 100, pattern: "steady", heavyRatio: 0.1, userCount: 10 },
    }),
  "lost-cart": () =>
    base({
      traffic: { rps: 20, pattern: "steady", heavyRatio: 0.1, userCount: 6 },
    }),
  "slow-server": () =>
    setServerStatus(
      base({
        traffic: { rps: 60, pattern: "steady", heavyRatio: 0, userCount: 8 },
      }),
      "server-2",
      "slow",
    ),
  "server-crash": () =>
    setServerStatus(
      base({
        traffic: { rps: 60, pattern: "steady", heavyRatio: 0, userCount: 8 },
        healthCheck: { enabled: true, intervalMs: 5000, failThreshold: 3 },
      }),
      "server-3",
      "down",
    ),
  "lb-failover": () =>
    setPrimaryLbUp(
      base({
        traffic: { rps: 20, pattern: "steady", heavyRatio: 0.1, userCount: 8 },
      }),
      false,
    ),
  "l7-video": () =>
    base({
      servers: [{ size: "medium" }, { size: "medium" }, { size: "large" }],
      traffic: { rps: 30, pattern: "steady", heavyRatio: 0.2, userCount: 8 },
    }),
};
