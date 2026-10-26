// Copy and ready-made scenarios for the Rate Limiter Simulator (Day 18).

import {
  createRateLimiterLab,
  type RlAlgorithm,
  type RlConfig,
  type RlState,
} from "@/lib/system-design/sim/rate-limiter/engine";

export const ALGORITHM_INFO: Record<RlAlgorithm, string> = {
  "token-bucket":
    "Bucket-এ token জমে নির্দিষ্ট গতিতে; প্রতিটা request একটা token নেয়। জমানো token দিয়ে একসাথে burst যেতে পারে।",
  "leaky-bucket":
    "Request queue-তে ঢোকে আর স্থির গতিতে বের হয়। Output মসৃণ, কিন্তু burst-এ অপেক্ষা বাড়ে; queue ভর্তি হলে বাদ।",
  "fixed-window":
    "ঘড়ির প্রতিটা window-এ (যেমন প্রতি সেকেন্ড) একটা counter। সহজ আর সস্তা, কিন্তু দুই window-এর কিনারায় দ্বিগুণ ঢুকে যায়।",
  "sliding-log":
    "প্রতিটা request-এর সময় মনে রাখে, আর ঠিক গত W সময়ের মধ্যে গোনে। সবচেয়ে নির্ভুল, কিন্তু memory বেশি লাগে।",
  "sliding-counter":
    "এই window-এর count + আগের window-এর count-এর একটা অংশ দিয়ে আনুমানিক হিসাব। প্রায় নির্ভুল, memory খুব কম।",
};

export const HOW_TO = [
  "▶️ Play চাপুন। Traffic tab-এ গতি বা ধরন (স্থির / ঝাঁকে ঝাঁকে / window-এর কিনারায় আক্রমণ) বেছে নিন।",
  "Algorithm বদলে দেখুন কোন request ছাড়া পায় (সবুজ) আর কোনটা 429 পায় (লাল)। 'কী ঘটছে' log-এ প্রতিটার কারণ লেখা থাকে।",
  "Redis tab-এ rate limiter-এর store বন্ধ করে fail-open, fail-closed আর local fallback তুলনা করুন।",
  "নিচের challenge-এর পাশে 'সাজান' চাপলে পরিস্থিতি তৈরি হয়ে যাবে।",
];

export const LESSON =
  "কোনো algorithm সব দিক থেকে সেরা না। Token Bucket burst-কে জায়গা দেয়, Leaky Bucket output মসৃণ রাখে, Fixed Window সস্তা কিন্তু কিনারায় ফাঁক রাখে, Sliding Window নির্ভুল কিন্তু দামি। আর limiter-এর store পড়ে গেলে কী করবেন (খুলে দেবেন, বন্ধ করবেন, নাকি local-এ গুনবেন), সেটাও আগে থেকে ঠিক করে রাখতে হয়।";

const base = (options: Partial<RlConfig> = {}): RlState =>
  createRateLimiterLab({ rps: 8, pattern: "steady", ...options });

export const initialRlState = () => base();

export const RL_PRESETS: { id: string; label: string; build: () => RlState }[] =
  [
    {
      id: "edge",
      label: "Fixed Window-এর কিনারায় দ্বিগুণ",
      build: () =>
        base({ algorithm: "fixed-window", limit: 10, pattern: "edge-attack" }),
    },
    {
      id: "burst-token",
      label: "Token Bucket-এ burst",
      build: () => base({ algorithm: "token-bucket", pattern: "bursty" }),
    },
    {
      id: "leaky-smooth",
      label: "Leaky Bucket-এর মসৃণ output",
      build: () => base({ algorithm: "leaky-bucket", pattern: "bursty" }),
    },
    {
      id: "fail-open",
      label: "Redis বন্ধ, fail-open",
      build: () =>
        base({
          algorithm: "sliding-log",
          rps: 20,
          redisDown: true,
          fallback: "open",
        }),
    },
  ];

export const RL_CHALLENGE_SETUPS: Record<string, () => RlState> = {
  "friendly-bursts": () =>
    base({ algorithm: "fixed-window", limit: 5, pattern: "bursty" }),
  "window-edge": () =>
    base({ algorithm: "fixed-window", limit: 10, pattern: "edge-attack" }),
  "redis-down": () =>
    base({
      algorithm: "sliding-log",
      limit: 10,
      rps: 20,
      redisDown: true,
      fallback: "open",
    }),
};
