// Rate Limiter Simulator engine (Plan doc Section 9, Day 18). Pure: every
// public function takes a state and returns a new one. One client key is
// limited; traffic comes from a generator or manual sends.

export type RlAlgorithm =
  | "token-bucket"
  | "leaky-bucket"
  | "fixed-window"
  | "sliding-log"
  | "sliding-counter";
export type RlTrafficPattern = "steady" | "bursty" | "edge-attack";
/** What the limiter does while its shared store (Redis) is unreachable. */
export type RlFallback = "open" | "closed" | "local";

export const ALGORITHM_LABELS: Record<RlAlgorithm, string> = {
  "token-bucket": "Token Bucket",
  "leaky-bucket": "Leaky Bucket",
  "fixed-window": "Fixed Window",
  "sliding-log": "Sliding Window Log",
  "sliding-counter": "Sliding Window Counter",
};

export const BURST_EVERY_MS = 2000;
export const BURST_SIZE = 10;
const LOG_LIMIT = 200;
const REQUEST_HISTORY_LIMIT = 600;
const EPSILON = 1e-9;

export interface RlConfig {
  algorithm: RlAlgorithm;
  /** Window algorithms: requests allowed per window. */
  limit: number;
  windowMs: number;
  /** Token bucket: size (max burst) and refill per second. */
  bucketCapacity: number;
  refillPerSec: number;
  /** Leaky bucket: queue size and how many requests leave per second. */
  queueCapacity: number;
  leakPerSec: number;
  /** Generator: average requests per second (0 = manual only). */
  rps: number;
  pattern: RlTrafficPattern;
  redisDown: boolean;
  fallback: RlFallback;
}

export interface RlRequest {
  id: number;
  at: number;
  allowed: boolean;
  /** Leaky bucket only: when the request actually leaves the queue. */
  servedAt: number | null;
}

export interface RlState {
  timeMs: number;
  config: RlConfig;
  nextId: number;
  carry: number;
  tokens: number;
  lastRefill: number;
  /** Leaky bucket queue: when each waiting request will leave the bucket. */
  queue: number[];
  /** Leaky bucket: when the most recent request left (or will leave). */
  lastLeak: number;
  windowStart: number;
  windowCount: number;
  previousWindowCount: number;
  log: number[];
  requests: RlRequest[];
  events: string[];
  totals: { allowed: number; blocked: number };
  window: {
    startMs: number;
    allowed: number;
    blocked: number;
    allowedWhileDown: number;
    blockedWhileDown: number;
  };
}

const DEFAULT_CONFIG: RlConfig = {
  algorithm: "fixed-window",
  limit: 10,
  windowMs: 1000,
  bucketCapacity: 10,
  refillPerSec: 5,
  queueCapacity: 10,
  leakPerSec: 5,
  rps: 0,
  pattern: "steady",
  redisDown: false,
  fallback: "open",
};

function emptyWindow(startMs: number): RlState["window"] {
  return {
    startMs,
    allowed: 0,
    blocked: 0,
    allowedWhileDown: 0,
    blockedWhileDown: 0,
  };
}

export function createRateLimiterLab(options: Partial<RlConfig> = {}): RlState {
  const config = { ...DEFAULT_CONFIG, ...options };
  return {
    timeMs: 0,
    config,
    nextId: 1,
    carry: 0,
    tokens: config.bucketCapacity,
    lastRefill: 0,
    queue: [],
    lastLeak: -Infinity,
    windowStart: 0,
    windowCount: 0,
    previousWindowCount: 0,
    log: [],
    requests: [],
    events: [],
    totals: { allowed: 0, blocked: 0 },
    window: emptyWindow(0),
  };
}

const draftOf = (state: RlState): RlState => structuredClone(state);

function note(draft: RlState, message: string) {
  draft.events.push(message);
  if (draft.events.length > LOG_LIMIT)
    draft.events.splice(0, draft.events.length - LOG_LIMIT);
}

/** The algorithm's verdict for one request at `now`, mutating its counters. */
function decide(
  draft: RlState,
  now: number,
): { allowed: boolean; reason: string; servedAt: number | null } {
  const c = draft.config;
  switch (c.algorithm) {
    case "token-bucket": {
      draft.tokens = Math.min(
        c.bucketCapacity,
        draft.tokens + ((now - draft.lastRefill) * c.refillPerSec) / 1000,
      );
      draft.lastRefill = now;
      if (draft.tokens >= 1 - EPSILON) {
        draft.tokens -= 1;
        return {
          allowed: true,
          reason: `bucket-এ token ছিল, বাকি ${Math.floor(draft.tokens + EPSILON)}টা`,
          servedAt: null,
        };
      }
      const waitMs = Math.ceil(((1 - draft.tokens) * 1000) / c.refillPerSec);
      return {
        allowed: false,
        reason: `bucket খালি; পরের token ~${waitMs}ms পরে`,
        servedAt: null,
      };
    }
    case "leaky-bucket": {
      draft.queue = draft.queue.filter((servedAt) => servedAt > now);
      if (draft.queue.length >= c.queueCapacity)
        return {
          allowed: false,
          reason: `queue ভর্তি (${c.queueCapacity}টা অপেক্ষায়)`,
          servedAt: null,
        };
      // Requests leave one every 1000/leakPerSec ms, in arrival order.
      const servedAt = Math.max(now, draft.lastLeak + 1000 / c.leakPerSec);
      draft.lastLeak = servedAt;
      if (servedAt > now) draft.queue.push(servedAt);
      return {
        allowed: true,
        reason:
          servedAt > now
            ? `queue-তে ${draft.queue.length} নম্বরে, ${Math.round(servedAt - now)}ms পরে বের হবে`
            : "সাথে সাথে বের হলো",
        servedAt,
      };
    }
    case "fixed-window": {
      const start = Math.floor(now / c.windowMs) * c.windowMs;
      if (start !== draft.windowStart) {
        draft.windowStart = start;
        draft.windowCount = 0;
      }
      if (draft.windowCount < c.limit) {
        draft.windowCount++;
        return {
          allowed: true,
          reason: `এই window-এ ${draft.windowCount}/${c.limit}`,
          servedAt: null,
        };
      }
      return {
        allowed: false,
        reason: `এই window-এর ${c.limit}টা শেষ; নতুন window ${start + c.windowMs - now}ms পরে`,
        servedAt: null,
      };
    }
    case "sliding-log": {
      draft.log = draft.log.filter((t) => t > now - c.windowMs);
      if (draft.log.length < c.limit) {
        draft.log.push(now);
        return {
          allowed: true,
          reason: `গত ${c.windowMs}ms-এ ${draft.log.length}/${c.limit}`,
          servedAt: null,
        };
      }
      return {
        allowed: false,
        reason: `গত ${c.windowMs}ms-এ ইতিমধ্যে ${c.limit}টা`,
        servedAt: null,
      };
    }
    case "sliding-counter": {
      const start = Math.floor(now / c.windowMs) * c.windowMs;
      if (start !== draft.windowStart) {
        draft.previousWindowCount =
          start - draft.windowStart === c.windowMs ? draft.windowCount : 0;
        draft.windowStart = start;
        draft.windowCount = 0;
      }
      const weight = 1 - (now - start) / c.windowMs;
      const estimate = draft.previousWindowCount * weight + draft.windowCount;
      if (estimate < c.limit) {
        draft.windowCount++;
        return {
          allowed: true,
          reason: `আনুমানিক ${estimate.toFixed(1)} < ${c.limit}`,
          servedAt: null,
        };
      }
      return {
        allowed: false,
        reason: `আনুমানিক ${estimate.toFixed(1)} ≥ ${c.limit} (আগের window-এর ${Math.round(weight * 100)}% ধরে)`,
        servedAt: null,
      };
    }
  }
}

function handle(draft: RlState, now: number) {
  const id = draft.nextId++;
  const c = draft.config;
  let verdict: { allowed: boolean; reason: string; servedAt: number | null };
  if (c.redisDown && c.fallback === "open")
    verdict = {
      allowed: true,
      reason: "Redis নেই, fail-open: কিছু না গুনেই ছেড়ে দিলাম",
      servedAt: null,
    };
  else if (c.redisDown && c.fallback === "closed")
    verdict = {
      allowed: false,
      reason: "Redis নেই, fail-closed: সবাইকে আটকাচ্ছি",
      servedAt: null,
    };
  else {
    verdict = decide(draft, now);
    if (c.redisDown)
      verdict.reason = `Redis নেই, local fallback: ${verdict.reason}`;
  }

  draft.requests.push({
    id,
    at: now,
    allowed: verdict.allowed,
    servedAt: verdict.servedAt,
  });
  if (draft.requests.length > REQUEST_HISTORY_LIMIT) draft.requests.shift();
  if (verdict.allowed) {
    draft.totals.allowed++;
    draft.window.allowed++;
    if (c.redisDown) draft.window.allowedWhileDown++;
  } else {
    draft.totals.blocked++;
    draft.window.blocked++;
    if (c.redisDown) draft.window.blockedWhileDown++;
  }
  note(
    draft,
    `Request #${id} ${verdict.allowed ? "✓ ছাড়া হলো" : "✕ 429"}: ${verdict.reason}`,
  );
}

/** Arrival times inside (from, to] for the bursty and edge-attack patterns. */
function scheduledArrivals(
  pattern: RlTrafficPattern,
  from: number,
  to: number,
): number[] {
  // Bursty: BURST_SIZE at once every BURST_EVERY_MS. Edge attack: two half-bursts
  // straddling each 1s window boundary (at …950ms and …1050ms).
  const offsets =
    pattern === "bursty"
      ? [{ at: 0, n: BURST_SIZE }]
      : [
          { at: 950, n: BURST_SIZE },
          { at: 1050, n: BURST_SIZE },
        ];
  const times: number[] = [];
  const firstCycle = Math.floor(from / BURST_EVERY_MS) - 1;
  for (let cycle = firstCycle; cycle * BURST_EVERY_MS <= to; cycle++) {
    for (const { at, n } of offsets) {
      const t = cycle * BURST_EVERY_MS + at;
      if (t > from - EPSILON && t <= to - EPSILON)
        for (let i = 0; i < n; i++) times.push(t);
    }
  }
  return times;
}

export function tick(state: RlState, dtMs: number): RlState {
  const draft = draftOf(state);
  const from = draft.timeMs;
  const to = from + dtMs;
  if (draft.config.pattern === "steady") {
    draft.carry += (draft.config.rps * dtMs) / 1000;
    const n = Math.floor(draft.carry + EPSILON);
    draft.carry -= n;
    for (let i = 0; i < n; i++)
      handle(draft, from + ((i + 1) * dtMs) / (n + 1));
  } else {
    for (const t of scheduledArrivals(draft.config.pattern, from, to))
      handle(draft, t);
  }
  draft.timeMs = to;
  return draft;
}

export function sendRequests(state: RlState, count: number): RlState {
  const draft = draftOf(state);
  for (let i = 0; i < count; i++) handle(draft, draft.timeMs);
  return draft;
}

/** Any setup change resets the limiter's counters and starts a fresh experiment window. */
export function updateRlConfig(
  state: RlState,
  changes: Partial<RlConfig>,
): RlState {
  const draft = draftOf(state);
  const before = draft.config;
  draft.config = { ...before, ...changes };
  const limiterChanged = (Object.keys(changes) as (keyof RlConfig)[]).some(
    (k) =>
      !["rps", "pattern", "redisDown", "fallback"].includes(k) &&
      changes[k] !== before[k],
  );
  if (limiterChanged) {
    draft.tokens = draft.config.bucketCapacity;
    draft.lastRefill = draft.timeMs;
    draft.queue = [];
    draft.lastLeak = -Infinity;
    draft.windowCount = 0;
    draft.previousWindowCount = 0;
    draft.log = [];
  }
  if (
    changes.redisDown !== undefined &&
    changes.redisDown !== before.redisDown
  ) {
    note(
      draft,
      changes.redisDown
        ? "💥 Rate limiter-এর Redis বন্ধ হয়ে গেল!"
        : "⟳ Redis আবার চালু।",
    );
  }
  draft.window = emptyWindow(draft.timeMs);
  return draft;
}

/** Long-run allowed rate (requests/second) the current settings permit. */
export function sustainedRate(config: RlConfig): number {
  if (config.algorithm === "token-bucket") return config.refillPerSec;
  if (config.algorithm === "leaky-bucket") return config.leakPerSec;
  return (config.limit * 1000) / config.windowMs;
}

/** Most requests allowed inside any `spanMs`-long stretch of the recent history. */
export function maxAllowedInSpan(
  state: RlState,
  spanMs: number,
  sinceMs = 0,
): number {
  const times = state.requests
    .filter((r) => r.allowed && r.at >= sinceMs)
    .map((r) => r.at);
  let best = 0;
  let start = 0;
  for (let end = 0; end < times.length; end++) {
    while (times[end] - times[start] >= spanMs) start++;
    best = Math.max(best, end - start + 1);
  }
  return best;
}

export function getRlMetrics(state: RlState) {
  const { allowed, blocked } = state.totals;
  const total = allowed + blocked;
  const recent = state.requests.filter((r) => r.at > state.timeMs - 1000);
  return {
    allowed,
    blocked,
    blockedPercent: total === 0 ? 0 : Math.round((blocked / total) * 100),
    allowedLastSecond: recent.filter((r) => r.allowed).length,
    blockedLastSecond: recent.filter((r) => !r.allowed).length,
    maxAllowedIn1s: maxAllowedInSpan(state, 1000, state.window.startMs),
    // Tokens refill continuously; the stored count is only updated on requests.
    tokens: Math.floor(
      Math.min(
        state.config.bucketCapacity,
        state.tokens +
          ((state.timeMs - state.lastRefill) * state.config.refillPerSec) /
            1000,
      ) + EPSILON,
    ),
    queueLength: state.queue.filter((t) => t > state.timeMs).length,
  };
}

export const getRlWindow = (state: RlState) => ({
  ...state.window,
  durationMs: state.timeMs - state.window.startMs,
});
