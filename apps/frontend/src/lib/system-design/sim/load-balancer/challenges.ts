// The six Load Balancer Lab missions (Plan doc Section 9.2). Each is checked
// against the current experiment window, so it measures the learner's latest
// setup rather than anything that happened before the last change.

import type { Challenge } from "../challenges";
import { getWindowMetrics, isLbAvailable } from "./engine";
import { DEFAULT_POOL, type LbState } from "./types";

const CPU_LIMIT = 90;
const CPU_WINDOW_MS = 10_000;
const MIN_WINDOW_MS = 5_000;

const sizesOf = (state: LbState) =>
  state.servers
    .map((s) => s.size)
    .sort()
    .join(",");

export const LB_CHALLENGES: Challenge<LbState>[] = [
  {
    id: "uneven-servers",
    title: "অসমান server",
    goal: "একটা Large আর দুটো Small server। 100 RPS-এ ১০ সেকেন্ড চালান, কোনো server-এর গড় CPU যেন 90% না ছাড়ায়।",
    hint: "সব server সমান না হলে সবাইকে সমান request দেওয়া কি ঠিক? Weighted Round Robin বা Least Connections চেষ্টা করুন।",
    isComplete: (state) => {
      const window = getWindowMetrics(state);
      return (
        sizesOf(state) === "large,small,small" &&
        state.config.traffic.rps >= 100 &&
        window.durationMs >= CPU_WINDOW_MS &&
        Object.values(window.avgCpu).every((cpu) => cpu <= CPU_LIMIT)
      );
    },
  },
  {
    id: "lost-cart",
    title: "Shopping cart হারিয়ে যাচ্ছে",
    goal: "একই user বারবার ভিন্ন server-এ যাচ্ছে, তাই cart হারাচ্ছে। অন্তত 20টা request-এ কোনো user যেন server না বদলায়। তারপর ওই server বন্ধ করে দেখুন কী হয়!",
    hint: "IP Hash algorithm, বা Sticky session চালু করুন। শেষে ভাবুন: কেন stateless server ভালো? (Day 14)",
    isComplete: (state) => {
      const window = getWindowMetrics(state);
      return (
        (state.config.sticky || state.config.algorithm === "ip-hash") &&
        state.servers.length >= 2 &&
        window.total >= 20 &&
        window.userSwitches === 0
      );
    },
  },
  {
    id: "slow-server",
    title: "একটা server ধীর",
    goal: "একটা server ধীর (×5)। হালকা request-এর p99 latency 300ms-এর নিচে আনুন, অন্তত 100টা request আর ৫ সেকেন্ড ধরে।",
    hint: "যে algorithm দেখে কোন server দ্রুত উত্তর দিচ্ছে: Least Response Time বা Power of Two Choices।",
    isComplete: (state) => {
      const window = getWindowMetrics(state);
      return (
        state.servers.some((s) => s.status === "slow") &&
        window.succeeded >= 100 &&
        window.durationMs >= MIN_WINDOW_MS &&
        window.lightP99 < 300
      );
    },
  },
  {
    id: "server-crash",
    title: "Server crash",
    goal: "একটা server বন্ধ থাকলেও fail হওয়া request যেন 1%-এর কম থাকে, অন্তত 200টা request আর ৫ সেকেন্ড ধরে।",
    hint: "Health check interval কমান, threshold কমান, আর Retry চালু করুন।",
    isComplete: (state) => {
      const window = getWindowMetrics(state);
      return (
        state.servers.some((s) => s.status === "down") &&
        window.total >= 200 &&
        window.durationMs >= MIN_WINDOW_MS &&
        window.failRate < 1
      );
    },
  },
  {
    id: "lb-failover",
    title: "Load Balancer নিজেই মারা গেল",
    goal: "Primary Load Balancer বন্ধ, পুরো site down! site আবার চালু করুন: LB বন্ধ অবস্থায় অন্তত 20টা request সফল হোক।",
    hint: "Load Balancer নিজেই single point of failure। দ্বিতীয় LB (active-passive) চালু করুন।",
    isComplete: (state) =>
      !state.lb.primaryUp &&
      state.config.lbRedundancy &&
      isLbAvailable(state) &&
      getWindowMetrics(state).succeeded >= 20,
  },
  {
    id: "l7-video",
    title: "Video-র জন্য আলাদা pool",
    goal: "L7 mode-এ /video request-গুলো আলাদা শক্তিশালী (Large) server pool-এ পাঠান, অন্য path যেন ওই pool-এ না যায়। অন্তত 20টা /video request সফল হোক।",
    hint: "L7 mode চালু করুন, একটা Large server-কে 'video' pool-এ দিন, তারপর /video → video route বানান।",
    isComplete: (state) => {
      const pool = state.config.routes["/video"];
      if (state.config.mode !== "L7" || !pool || pool === DEFAULT_POOL)
        return false;
      const poolServers = state.servers.filter((s) => s.pool === pool);
      const otherRoutesUsePool = (["/api", "/images"] as const).some(
        (p) => state.config.routes[p] === pool,
      );
      return (
        poolServers.length > 0 &&
        poolServers.every((s) => s.size === "large") &&
        !otherRoutesUsePool &&
        getWindowMetrics(state).videoSucceeded >= 20
      );
    },
  },
];
