// Load Balancer Lab simulation engine (Plan doc Section 9.2). Pure: every
// public function takes a state and returns a new one; the UI only renders it.
// Time only moves in `tick`, so failures take real time to detect.

import { percentile } from "../metrics";
import { ALGORITHM_LABELS, pickServer, random } from "./algorithms";
import {
  DEFAULT_POOL,
  LB_PATHS,
  MAX_SERVERS,
  MIN_SERVERS,
  REQUEST_DURATION_MS,
  SERVER_QUEUE_LIMIT,
  SERVER_SIZES,
  SLOW_FACTOR,
  type LbConfig,
  type LbJob,
  type LbPath,
  type LbServer,
  type LbState,
  type LbWindow,
  type RequestKind,
  type ServerSize,
  type ServerStatus,
  type TrafficConfig,
} from "./types";

export * from "./types";
export { ALGORITHM_LABELS } from "./algorithms";

const LOG_LIMIT = 200;
const REQUEST_HISTORY_LIMIT = 1000;
const LATENCY_SAMPLE_LIMIT = 5000;
const RAMP_MS = 10_000;
const SPIKE_CYCLE_MS = 15_000;
const SPIKE_START_MS = 5_000;
const SPIKE_END_MS = 8_000;
const SPIKE_FACTOR = 5;
const LATENCY_SMOOTHING = 0.2;
const EPSILON = 1e-9;

export interface LbLabOptions extends Partial<
  Omit<LbConfig, "traffic" | "healthCheck">
> {
  servers: { size: ServerSize; pool?: string }[];
  seed?: number;
  healthCheck?: LbConfig["healthCheck"];
  traffic?: TrafficConfig;
}

const DEFAULT_CONFIG: LbConfig = {
  algorithm: "round-robin",
  healthCheck: { enabled: true, intervalMs: 2000, failThreshold: 2 },
  retry: false,
  sticky: false,
  mode: "L4",
  routes: {},
  lbRedundancy: false,
  failoverMs: 3000,
  traffic: { rps: 0, pattern: "steady", heavyRatio: 0.1, userCount: 10 },
};

function emptyWindow(startMs: number): LbWindow {
  return {
    startMs,
    total: 0,
    succeeded: 0,
    failed: 0,
    latencies: [],
    lightLatencies: [],
    userSwitches: 0,
    videoSucceeded: 0,
    busyMs: {},
  };
}

function newServer(
  number: number,
  size: ServerSize,
  pool = DEFAULT_POOL,
): LbServer {
  return {
    id: `server-${number}`,
    name: `Server ${number}`,
    size,
    status: "healthy",
    pool,
    inRotation: true,
    consecutiveFails: 0,
    active: [],
    queue: [],
    avgLatencyMs: null,
  };
}

export function createLoadBalancerLab({
  servers,
  seed = 1,
  ...config
}: LbLabOptions): LbState {
  return {
    timeMs: 0,
    config: { ...DEFAULT_CONFIG, ...config },
    servers: servers.map((server, index) =>
      newServer(index + 1, server.size, server.pool),
    ),
    nextServerNumber: servers.length + 1,
    nextRequestId: 1,
    rngState: seed >>> 0,
    trafficCarry: 0,
    rrCursor: {},
    wrrCurrent: {},
    stickyServer: {},
    lastServerByUser: {},
    lb: { primaryUp: true, primaryDownSince: null, failoverLogged: false },
    requests: [],
    log: [],
    totals: {
      total: 0,
      succeeded: 0,
      failed: 0,
      sessionsLost: 0,
      perServer: {},
      latencies: [],
    },
    window: emptyWindow(0),
  };
}

// ---------------------------------------------------------------------------
// Internal helpers — all mutate a draft (a structuredClone of the input state).

const draftOf = (state: LbState): LbState => structuredClone(state);

function pushCapped<T>(list: T[], item: T, limit: number) {
  list.push(item);
  if (list.length > limit) list.splice(0, list.length - limit);
}

const log = (draft: LbState, message: string) =>
  pushCapped(draft.log, message, LOG_LIMIT);

function resetWindow(draft: LbState) {
  draft.window = emptyWindow(draft.timeMs);
}

function lbAvailable(draft: LbState): boolean {
  const { primaryUp, primaryDownSince } = draft.lb;
  if (primaryUp) return true;
  return (
    draft.config.lbRedundancy &&
    primaryDownSince !== null &&
    draft.timeMs - primaryDownSince >= draft.config.failoverMs
  );
}

function poolFor(draft: LbState, path: LbPath): string | null {
  return draft.config.mode === "L7"
    ? (draft.config.routes[path] ?? DEFAULT_POOL)
    : null;
}

function candidatesFor(draft: LbState, path: LbPath): LbServer[] {
  const pool = poolFor(draft, path);
  return draft.servers.filter(
    (s) => s.inRotation && (pool === null || s.pool === pool),
  );
}

function findRequest(draft: LbState, id: number) {
  for (let i = draft.requests.length - 1; i >= 0; i--) {
    if (draft.requests[i].id === id) return draft.requests[i];
  }
  return undefined;
}

function recordFailure(
  draft: LbState,
  job: Pick<LbJob, "requestId">,
  message: string,
) {
  draft.totals.failed++;
  draft.window.failed++;
  const request = findRequest(draft, job.requestId);
  if (request) {
    request.status = "failed";
    request.finishedAt = draft.timeMs;
  }
  log(draft, message);
}

function recordSuccess(
  draft: LbState,
  server: LbServer,
  job: LbJob,
  finishedAt: number,
) {
  const latency = finishedAt - job.sentAt;
  draft.totals.succeeded++;
  draft.window.succeeded++;
  pushCapped(draft.totals.latencies, latency, LATENCY_SAMPLE_LIMIT);
  pushCapped(draft.window.latencies, latency, LATENCY_SAMPLE_LIMIT);
  if (job.kind === "light")
    pushCapped(draft.window.lightLatencies, latency, LATENCY_SAMPLE_LIMIT);
  if (job.path === "/video") draft.window.videoSucceeded++;
  server.avgLatencyMs =
    server.avgLatencyMs === null
      ? latency
      : server.avgLatencyMs +
        (latency - server.avgLatencyMs) * LATENCY_SMOOTHING;
  const request = findRequest(draft, job.requestId);
  if (request) {
    request.status = "succeeded";
    request.finishedAt = finishedAt;
  }
}

function failServerJobs(draft: LbState, server: LbServer, why: string) {
  for (const job of [...server.active, ...server.queue]) {
    recordFailure(
      draft,
      job,
      `Request #${job.requestId} ✕ ${server.name} ${why}, চলমান request হারিয়ে গেল।`,
    );
  }
  server.active = [];
  server.queue = [];
}

/** Hands a request to a server. Returns false when the server can't take it. */
function tryServer(
  draft: LbState,
  server: LbServer,
  job: LbJob,
  reason: string,
): boolean {
  const request = findRequest(draft, job.requestId);
  if (request) request.serverId = server.id;
  draft.totals.perServer[server.id] =
    (draft.totals.perServer[server.id] ?? 0) + 1;

  if (server.status === "down") {
    log(
      draft,
      `Request #${job.requestId} → ${server.name} ✕ server বন্ধ, connection refused।`,
    );
    return false;
  }
  const { capacity } = SERVER_SIZES[server.size];
  if (
    server.active.length >= capacity &&
    server.queue.length >= SERVER_QUEUE_LIMIT
  ) {
    log(
      draft,
      `Request #${job.requestId} → ${server.name} ✕ 503: server-এর সারি ভর্তি।`,
    );
    return false;
  }

  const previous = draft.lastServerByUser[job.userId];
  if (previous !== undefined && previous !== server.id)
    draft.window.userSwitches++;
  draft.lastServerByUser[job.userId] = server.id;
  if (draft.config.sticky) draft.stickyServer[job.userId] = server.id;

  const slow = server.status === "slow" ? SLOW_FACTOR : 1;
  const accepted = {
    ...job,
    remainingMs: REQUEST_DURATION_MS[job.kind] * slow,
  };
  if (server.active.length < capacity) server.active.push(accepted);
  else server.queue.push(accepted);
  log(draft, `Request #${job.requestId} → ${server.name}, কারণ ${reason}`);
  return true;
}

function chooseServer(draft: LbState, candidates: LbServer[], userId: number) {
  if (draft.config.sticky) {
    const stuckId = draft.stickyServer[userId];
    if (stuckId !== undefined) {
      const stuck = candidates.find((s) => s.id === stuckId);
      if (stuck) {
        return {
          server: stuck,
          reason: `Sticky session: User ${userId} আগেও ${stuck.name}-এ এসেছিল।`,
        };
      }
      draft.totals.sessionsLost++;
      delete draft.stickyServer[userId];
      log(
        draft,
        `⚠ User ${userId}-এর session হারাল: আগের server আর পাওয়া যাচ্ছে না।`,
      );
    }
  }
  return pickServer(draft, candidates, userId);
}

function dispatch(
  draft: LbState,
  { userId, kind, path }: { userId: number; kind: RequestKind; path: LbPath },
) {
  const id = draft.nextRequestId++;
  const job: LbJob = {
    requestId: id,
    userId,
    path,
    kind,
    sentAt: draft.timeMs,
    remainingMs: 0,
  };
  pushCapped(
    draft.requests,
    {
      id,
      userId,
      path,
      kind,
      serverId: null,
      sentAt: draft.timeMs,
      finishedAt: null,
      status: "in-flight",
    },
    REQUEST_HISTORY_LIMIT,
  );
  draft.totals.total++;
  draft.window.total++;

  if (!lbAvailable(draft)) {
    recordFailure(
      draft,
      job,
      `Request #${id} ✕ Load Balancer বন্ধ, request কোথাও যেতে পারল না।`,
    );
    return;
  }
  const candidates = candidatesFor(draft, path);
  if (candidates.length === 0) {
    recordFailure(
      draft,
      job,
      `Request #${id} ✕ ${path}-এর জন্য কোনো সুস্থ server নেই।`,
    );
    return;
  }

  const first = chooseServer(draft, candidates, userId);
  if (tryServer(draft, first.server, job, first.reason)) return;

  const others = candidates.filter((s) => s.id !== first.server.id);
  if (draft.config.retry && others.length > 0) {
    const second = pickServer(draft, others, userId);
    if (tryServer(draft, second.server, job, `retry ↻ (${second.reason})`))
      return;
  }
  recordFailure(draft, job, `Request #${id} ✕ fail হলো।`);
}

function trafficRate({ rps, pattern }: TrafficConfig, timeMs: number): number {
  if (pattern === "ramp") return rps * Math.min(1, timeMs / RAMP_MS);
  if (pattern === "spike") {
    const phase = timeMs % SPIKE_CYCLE_MS;
    return phase >= SPIKE_START_MS && phase < SPIKE_END_MS
      ? rps * SPIKE_FACTOR
      : rps;
  }
  return rps;
}

function generateTraffic(draft: LbState, dtMs: number) {
  const { traffic, mode } = draft.config;
  draft.trafficCarry += (trafficRate(traffic, draft.timeMs) * dtMs) / 1000;
  const arrivals = Math.floor(draft.trafficCarry + EPSILON);
  draft.trafficCarry = Math.max(0, draft.trafficCarry - arrivals);
  for (let i = 0; i < arrivals; i++) {
    const userId = Math.floor(random(draft) * traffic.userCount);
    const kind: RequestKind =
      random(draft) < traffic.heavyRatio ? "heavy" : "light";
    const path =
      mode === "L7"
        ? LB_PATHS[Math.floor(random(draft) * LB_PATHS.length)]
        : "/api";
    dispatch(draft, { userId, kind, path });
  }
}

/** Runs servers forward by dtMs, completing requests at their exact finish time. */
function processServers(draft: LbState, dtMs: number) {
  let now = draft.timeMs;
  let left = dtMs;
  while (left > EPSILON) {
    let nextFinish = Infinity;
    for (const server of draft.servers) {
      for (const job of server.active)
        nextFinish = Math.min(nextFinish, job.remainingMs);
    }
    const step = Math.min(nextFinish, left);
    for (const server of draft.servers) {
      draft.window.busyMs[server.id] =
        (draft.window.busyMs[server.id] ?? 0) + server.active.length * step;
      for (const job of server.active) job.remainingMs -= step;
    }
    now += step;
    left -= step;

    for (const server of draft.servers) {
      const finished = server.active.filter(
        (job) => job.remainingMs <= EPSILON,
      );
      if (finished.length === 0) continue;
      server.active = server.active.filter((job) => job.remainingMs > EPSILON);
      for (const job of finished) recordSuccess(draft, server, job, now);
      const { capacity } = SERVER_SIZES[server.size];
      while (server.active.length < capacity && server.queue.length > 0) {
        server.active.push(server.queue.shift()!);
      }
    }
  }
}

function runHealthChecks(draft: LbState, fromMs: number, toMs: number) {
  const { enabled, intervalMs, failThreshold } = draft.config.healthCheck;
  if (!enabled) return;
  const probes =
    Math.floor(toMs / intervalMs) - Math.floor(fromMs / intervalMs);
  for (let p = 0; p < probes; p++) {
    for (const server of draft.servers) {
      if (server.status === "down") {
        server.consecutiveFails++;
        if (server.inRotation && server.consecutiveFails >= failThreshold) {
          server.inRotation = false;
          log(
            draft,
            `🩺 Health check: ${server.name} পরপর ${server.consecutiveFails} বার সাড়া দেয়নি, rotation থেকে বাদ।`,
          );
        }
      } else {
        server.consecutiveFails = 0;
        if (!server.inRotation) {
          server.inRotation = true;
          log(
            draft,
            `🩺 Health check: ${server.name} আবার সুস্থ, rotation-এ ফিরল।`,
          );
        }
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Public API

export function sendRequest(
  state: LbState,
  request: { userId?: number; kind?: RequestKind; path?: LbPath },
): LbState {
  const draft = draftOf(state);
  const userId =
    request.userId ??
    Math.floor(random(draft) * draft.config.traffic.userCount);
  dispatch(draft, {
    userId,
    kind: request.kind ?? "light",
    path: request.path ?? "/api",
  });
  return draft;
}

export function tick(state: LbState, dtMs: number): LbState {
  const draft = draftOf(state);
  const start = draft.timeMs;
  generateTraffic(draft, dtMs);
  processServers(draft, dtMs);
  draft.timeMs = start + dtMs;
  runHealthChecks(draft, start, draft.timeMs);
  if (!draft.lb.primaryUp && !draft.lb.failoverLogged && lbAvailable(draft)) {
    draft.lb.failoverLogged = true;
    log(
      draft,
      "🔀 Failover: passive Load Balancer এখন active, site আবার চালু।",
    );
  }
  return draft;
}

export function setServerStatus(
  state: LbState,
  serverId: string,
  status: ServerStatus,
): LbState {
  const draft = draftOf(state);
  const server = draft.servers.find((s) => s.id === serverId);
  if (!server) return state;
  server.status = status;
  if (status === "down") failServerJobs(draft, server, "crash করল");
  if (!draft.config.healthCheck.enabled) server.inRotation = true;
  const labels: Record<ServerStatus, string> = {
    healthy: "আবার চালু",
    slow: "ধীর হয়ে গেল (×5)",
    down: "বন্ধ হয়ে গেল",
  };
  log(draft, `⚙ ${server.name} ${labels[status]}।`);
  resetWindow(draft);
  return draft;
}

export function setPrimaryLbUp(state: LbState, up: boolean): LbState {
  const draft = draftOf(state);
  draft.lb = {
    primaryUp: up,
    primaryDownSince: up ? null : draft.timeMs,
    failoverLogged: false,
  };
  log(
    draft,
    up
      ? "⚙ Primary Load Balancer আবার চালু।"
      : "⚙ Primary Load Balancer বন্ধ হয়ে গেল!",
  );
  resetWindow(draft);
  return draft;
}

export function updateConfig(
  state: LbState,
  changes: Partial<LbConfig>,
): LbState {
  const draft = draftOf(state);
  draft.config = { ...draft.config, ...changes };
  if (changes.algorithm)
    log(draft, `⚙ Algorithm: ${ALGORITHM_LABELS[changes.algorithm]}।`);
  if (changes.sticky === false) draft.stickyServer = {};
  if (changes.healthCheck && !changes.healthCheck.enabled) {
    for (const server of draft.servers) server.inRotation = true;
  }
  resetWindow(draft);
  return draft;
}

export function addServer(
  state: LbState,
  size: ServerSize,
  pool = DEFAULT_POOL,
): LbState {
  if (state.servers.length >= MAX_SERVERS) return state;
  const draft = draftOf(state);
  const server = newServer(draft.nextServerNumber++, size, pool);
  draft.servers.push(server);
  log(draft, `⚙ ${server.name} (${size}) যোগ হলো।`);
  resetWindow(draft);
  return draft;
}

export function removeServer(state: LbState, serverId: string): LbState {
  if (state.servers.length <= MIN_SERVERS) return state;
  const draft = draftOf(state);
  const server = draft.servers.find((s) => s.id === serverId);
  if (!server) return state;
  failServerJobs(draft, server, "সরিয়ে ফেলা হলো");
  draft.servers = draft.servers.filter((s) => s.id !== serverId);
  log(draft, `⚙ ${server.name} বাদ দেওয়া হলো।`);
  resetWindow(draft);
  return draft;
}

export function setServerSize(
  state: LbState,
  serverId: string,
  size: ServerSize,
): LbState {
  const draft = draftOf(state);
  const server = draft.servers.find((s) => s.id === serverId);
  if (!server) return state;
  server.size = size;
  resetWindow(draft);
  return draft;
}

export function setServerPool(
  state: LbState,
  serverId: string,
  pool: string,
): LbState {
  const draft = draftOf(state);
  const server = draft.servers.find((s) => s.id === serverId);
  if (!server) return state;
  server.pool = pool;
  resetWindow(draft);
  return draft;
}

/** Instantaneous CPU: share of the server's request slots in use. */
export function serverCpu(server: LbServer): number {
  return Math.min(
    100,
    (server.active.length / SERVER_SIZES[server.size].capacity) * 100,
  );
}

export function getMetrics(state: LbState) {
  const { total, succeeded, failed, sessionsLost, latencies } = state.totals;
  const completed = succeeded + failed;
  return {
    total,
    succeeded,
    failed,
    successRate:
      completed === 0 ? 0 : Math.round((succeeded / completed) * 1000) / 10,
    p50: percentile(latencies, 50),
    p95: percentile(latencies, 95),
    p99: percentile(latencies, 99),
    sessionsLost,
    perServer: Object.fromEntries(
      state.servers.map((s) => [s.id, state.totals.perServer[s.id] ?? 0]),
    ),
  };
}

/** Metrics for the current experiment (since the last setup change). */
export function getWindowMetrics(state: LbState) {
  const w = state.window;
  const durationMs = state.timeMs - w.startMs;
  const completed = w.succeeded + w.failed;
  return {
    durationMs,
    total: w.total,
    succeeded: w.succeeded,
    failed: w.failed,
    failRate: completed === 0 ? 0 : (w.failed / completed) * 100,
    p99: percentile(w.latencies, 99),
    lightP99: percentile(w.lightLatencies, 99),
    userSwitches: w.userSwitches,
    videoSucceeded: w.videoSucceeded,
    avgCpu: Object.fromEntries(
      state.servers.map((s) => [
        s.id,
        durationMs === 0
          ? 0
          : ((w.busyMs[s.id] ?? 0) /
              (SERVER_SIZES[s.size].capacity * durationMs)) *
            100,
      ]),
    ),
  };
}

export const isLbAvailable = (state: LbState) => lbAvailable(state);

/** Throughput (successes per second), p99 and failures among requests that finished in the last `windowMs`. */
export function getRecentStats(state: LbState, windowMs: number) {
  const since = state.timeMs - windowMs;
  const recent = state.requests.filter(
    (r) => r.finishedAt !== null && r.finishedAt > since,
  );
  const succeeded = recent.filter((r) => r.status === "succeeded");
  return {
    throughput: Math.round((succeeded.length / windowMs) * 1000),
    p99: percentile(
      succeeded.map((r) => r.finishedAt! - r.sentAt),
      99,
    ),
    failed: recent.length - succeeded.length,
  };
}
