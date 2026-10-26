// Server selection for each LB algorithm. Each returns the chosen server and
// a Bangla reason for the "কী ঘটছে" log. Mutates the draft state's cursors/rng.

import { nextRandom } from "../random";
import {
  DEFAULT_POOL,
  SERVER_SIZES,
  type LbServer,
  type LbState,
} from "./types";

export const ALGORITHM_LABELS: Record<LbState["config"]["algorithm"], string> =
  {
    "round-robin": "Round Robin",
    "weighted-round-robin": "Weighted Round Robin",
    "least-connections": "Least Connections",
    "least-response-time": "Least Response Time",
    "ip-hash": "IP Hash",
    random: "Random",
    "power-of-two": "Power of Two Choices",
  };

/** Latency assumed for a server that hasn't completed anything yet. */
const UNKNOWN_LATENCY_MS = 50;

export interface Pick {
  server: LbServer;
  reason: string;
}

export const serverLoad = (server: LbServer) =>
  server.active.length + server.queue.length;

export function random(draft: LbState): number {
  const { value, state } = nextRandom(draft.rngState);
  draft.rngState = state;
  return value;
}

function minBy(
  servers: LbServer[],
  score: (server: LbServer) => number,
): LbServer {
  return servers.reduce((best, server) =>
    score(server) < score(best) ? server : best,
  );
}

const responseScore = (server: LbServer) =>
  (serverLoad(server) + 1) * (server.avgLatencyMs ?? UNKNOWN_LATENCY_MS);

export function pickServer(
  draft: LbState,
  candidates: LbServer[],
  userId: number,
): Pick {
  const { algorithm, mode } = draft.config;
  const label = ALGORITHM_LABELS[algorithm];

  switch (algorithm) {
    case "round-robin": {
      const key = mode === "L7" ? candidates[0].pool : DEFAULT_POOL;
      const turn = draft.rrCursor[key] ?? 0;
      draft.rrCursor[key] = turn + 1;
      const server = candidates[turn % candidates.length];
      return { server, reason: `${label}: এবার ${server.name}-এর পালা।` };
    }
    case "weighted-round-robin": {
      // Smooth weighted round robin (as in nginx): spreads the heavier servers' turns out.
      let totalWeight = 0;
      let best: LbServer | null = null;
      for (const server of candidates) {
        const { weight } = SERVER_SIZES[server.size];
        totalWeight += weight;
        draft.wrrCurrent[server.id] =
          (draft.wrrCurrent[server.id] ?? 0) + weight;
        if (!best || draft.wrrCurrent[server.id] > draft.wrrCurrent[best.id])
          best = server;
      }
      draft.wrrCurrent[best!.id] -= totalWeight;
      return {
        server: best!,
        reason: `${label}: ${best!.name}-এর weight ${SERVER_SIZES[best!.size].weight}, বড় server বেশি পালা পায়।`,
      };
    }
    case "least-connections": {
      // Weighted, like HAProxy's leastconn: a Large server with 2 connections is less busy than a Small with 1.
      const server = minBy(
        candidates,
        (s) => serverLoad(s) / SERVER_SIZES[s.size].weight,
      );
      return {
        server,
        reason: `${label}: ${server.name}-এ এখন মাত্র ${serverLoad(server)}টা connection (weight ${SERVER_SIZES[server.size].weight})।`,
      };
    }
    case "least-response-time": {
      const server = minBy(candidates, responseScore);
      const avg = Math.round(server.avgLatencyMs ?? UNKNOWN_LATENCY_MS);
      return {
        server,
        reason: `${label}: ${server.name}-এর গড় response ${avg}ms, connection ${serverLoad(server)}টা।`,
      };
    }
    case "ip-hash": {
      const hash = Math.imul(userId + 1, 2654435761) >>> 0;
      const server = candidates[hash % candidates.length];
      return {
        server,
        reason: `${label}: User ${userId}-এর hash সবসময় ${server.name}-এ মেলে।`,
      };
    }
    case "random": {
      const server = candidates[Math.floor(random(draft) * candidates.length)];
      return {
        server,
        reason: `${label}: এলোমেলোভাবে ${server.name} বাছা হয়েছে।`,
      };
    }
    case "power-of-two": {
      if (candidates.length === 1)
        return { server: candidates[0], reason: `${label}: server একটাই।` };
      const i = Math.floor(random(draft) * candidates.length);
      let j = Math.floor(random(draft) * (candidates.length - 1));
      if (j >= i) j++;
      const [a, b] = [candidates[i], candidates[j]];
      const server = serverLoad(b) < serverLoad(a) ? b : a;
      return {
        server,
        reason: `${label}: ${a.name} আর ${b.name}-এর মধ্যে কম ব্যস্ত ${server.name}।`,
      };
    }
  }
}
