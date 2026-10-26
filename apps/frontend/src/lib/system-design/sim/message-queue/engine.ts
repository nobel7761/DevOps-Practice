// Message Queue Lab simulation engine (Plan doc Section 9.3). Pure: every
// public function takes a state and returns a new one. Time only moves in
// `tick`, and work finishes at its exact time inside a tick.

import { percentile } from "../metrics";

export const CONSUMER_RESTART_MS = 1000;
export const SPIKE_DURATION_MS = 5000;
export const SPIKE_FACTOR = 5;
export const MIN_CONSUMERS = 0;
export const MAX_CONSUMERS = 8;

const LOG_LIMIT = 200;
const MESSAGE_HISTORY_LIMIT = 600;
const EPSILON = 1e-9;

export type MqMessageStatus = "waiting" | "in-flight" | "done" | "dlq" | "lost";
export type MqCrashKind = "mid-work" | "before-ack";

export interface MqConfig {
  /** Messages per second from the producer; 0 = only manual sends. */
  producerRate: number;
  consumers: number;
  processingMs: number;
  /** Manual ack after the work. Off = auto-ack on delivery (at-most-once). */
  ackEnabled: boolean;
  /** How long an unacked message stays hidden before it's delivered again. */
  visibilityTimeoutMs: number;
  dlqEnabled: boolean;
  /** Redeliveries allowed before a failing message goes to the DLQ. */
  maxRetries: number;
  /** Consumer skips the side effect for an order it has already handled. */
  idempotency: boolean;
}

export type MqLabOptions = Partial<MqConfig>;

export interface MqMessage {
  id: number;
  orderId: number;
  poison: boolean;
  status: MqMessageStatus;
  attempts: number;
  enqueuedAt: number;
  /** While in-flight with ack on: when it becomes deliverable again if never acked. */
  visibleAt: number;
  finishedAt: number | null;
}

export interface MqConsumer {
  id: string;
  name: string;
  status: "idle" | "busy" | "crashed";
  messageId: number | null;
  remainingMs: number;
  restartAt: number | null;
}

export interface MqWindow {
  startMs: number;
  maxDepth: number;
  succeeded: number;
  lost: number;
  dlq: number;
  duplicateWork: number;
  spikes: number;
  crashes: number;
  midWorkCrashes: number;
  beforeAckCrashes: number;
}

export interface MqState {
  timeMs: number;
  config: MqConfig;
  messages: MqMessage[];
  consumers: MqConsumer[];
  nextMessageId: number;
  producerCarry: number;
  spikeUntil: number | null;
  /** How many times each order's side effect (the email) actually happened. */
  sideEffects: Record<number, number>;
  /** The idempotency store: orders whose side effect is already done. */
  processedOrders: number[];
  totals: {
    published: number;
    succeeded: number;
    retried: number;
    dlq: number;
    lost: number;
    duplicateWork: number;
  };
  waits: number[];
  log: string[];
  window: MqWindow;
}

const DEFAULT_CONFIG: MqConfig = {
  producerRate: 5,
  consumers: 3,
  processingMs: 200,
  ackEnabled: true,
  visibilityTimeoutMs: 3000,
  dlqEnabled: true,
  maxRetries: 3,
  idempotency: false,
};

const newConsumer = (n: number): MqConsumer => ({
  id: `consumer-${n}`,
  name: `Consumer ${n}`,
  status: "idle",
  messageId: null,
  remainingMs: 0,
  restartAt: null,
});

function emptyWindow(startMs: number, depth: number): MqWindow {
  return {
    startMs,
    maxDepth: depth,
    succeeded: 0,
    lost: 0,
    dlq: 0,
    duplicateWork: 0,
    spikes: 0,
    crashes: 0,
    midWorkCrashes: 0,
    beforeAckCrashes: 0,
  };
}

export function createMessageQueueLab(options: MqLabOptions = {}): MqState {
  const config = { ...DEFAULT_CONFIG, ...options };
  return {
    timeMs: 0,
    config,
    messages: [],
    consumers: Array.from({ length: config.consumers }, (_, i) =>
      newConsumer(i + 1),
    ),
    nextMessageId: 1,
    producerCarry: 0,
    spikeUntil: null,
    sideEffects: {},
    processedOrders: [],
    totals: {
      published: 0,
      succeeded: 0,
      retried: 0,
      dlq: 0,
      lost: 0,
      duplicateWork: 0,
    },
    waits: [],
    log: [],
    window: emptyWindow(0, 0),
  };
}

// ---------------------------------------------------------------------------
// Internal helpers — mutate a draft (structuredClone of the input).

const draftOf = (state: MqState): MqState => structuredClone(state);

function log(draft: MqState, message: string) {
  draft.log.push(message);
  if (draft.log.length > LOG_LIMIT)
    draft.log.splice(0, draft.log.length - LOG_LIMIT);
}

/** Waiting messages, plus unacked ones whose visibility timeout has run out. */
function isDeliverable(message: MqMessage, now: number) {
  return (
    message.status === "waiting" ||
    (message.status === "in-flight" && message.visibleAt <= now)
  );
}

function depthOf(state: MqState) {
  return state.messages.filter((m) => isDeliverable(m, state.timeMs)).length;
}

function trimHistory(draft: MqState) {
  if (draft.messages.length <= MESSAGE_HISTORY_LIMIT) return;
  // Drop the oldest finished messages first; never drop live ones.
  const excess = draft.messages.length - MESSAGE_HISTORY_LIMIT;
  let dropped = 0;
  draft.messages = draft.messages.filter((m) => {
    if (
      dropped < excess &&
      (m.status === "done" || m.status === "lost" || m.status === "dlq")
    ) {
      dropped++;
      return false;
    }
    return true;
  });
}

function publish(
  draft: MqState,
  { poison = false }: { poison?: boolean } = {},
) {
  const id = draft.nextMessageId++;
  draft.messages.push({
    id,
    orderId: id,
    poison,
    status: "waiting",
    attempts: 0,
    enqueuedAt: draft.timeMs,
    visibleAt: draft.timeMs,
    finishedAt: null,
  });
  draft.totals.published++;
}

function deliverTo(draft: MqState, consumer: MqConsumer, now: number) {
  const next = draft.messages
    .filter((m) => isDeliverable(m, now))
    .sort((a, b) => a.enqueuedAt - b.enqueuedAt || a.id - b.id)[0];
  if (!next) return;

  const redelivery = next.attempts > 0;
  next.attempts++;
  if (redelivery) draft.totals.retried++;
  else pushWait(draft, now - next.enqueuedAt);
  next.status = "in-flight";
  // Auto-ack removes the message from the queue the moment it's delivered.
  next.visibleAt = draft.config.ackEnabled
    ? now + draft.config.visibilityTimeoutMs
    : Infinity;
  consumer.status = "busy";
  consumer.messageId = next.id;
  consumer.remainingMs = draft.config.processingMs;
  log(
    draft,
    redelivery
      ? `↻ Message #${next.id} → ${consumer.name} (${next.attempts} নম্বর চেষ্টা)`
      : `Message #${next.id} → ${consumer.name}, কারণ queue-এর সবচেয়ে পুরনো message আর ${consumer.name} খালি।`,
  );
}

function pushWait(draft: MqState, wait: number) {
  draft.waits.push(wait);
  if (draft.waits.length > MESSAGE_HISTORY_LIMIT) draft.waits.shift();
}

function doSideEffect(draft: MqState, message: MqMessage) {
  if (
    draft.config.idempotency &&
    draft.processedOrders.includes(message.orderId)
  ) {
    log(
      draft,
      `🛡 Order #${message.orderId}-এর email আগেই গেছে, idempotency তাই আবার পাঠাল না।`,
    );
    return;
  }
  const count = (draft.sideEffects[message.orderId] ?? 0) + 1;
  draft.sideEffects[message.orderId] = count;
  if (!draft.processedOrders.includes(message.orderId))
    draft.processedOrders.push(message.orderId);
  if (count > 1) {
    draft.totals.duplicateWork++;
    draft.window.duplicateWork++;
    log(
      draft,
      `⚠ Order #${message.orderId}-এর email ${count} বার গেল (duplicate)!`,
    );
  }
}

function finish(draft: MqState, consumer: MqConsumer, now: number) {
  const message = draft.messages.find((m) => m.id === consumer.messageId);
  consumer.status = "idle";
  consumer.messageId = null;
  if (!message || message.status === "done" || message.status === "dlq") {
    // Another consumer already finished it (visibility timeout too short); the work still happened.
    if (message && !message.poison && message.status === "done")
      doSideEffect(draft, message);
    return;
  }

  if (message.poison) {
    if (draft.config.dlqEnabled && message.attempts > draft.config.maxRetries) {
      message.status = "dlq";
      message.finishedAt = now;
      draft.totals.dlq++;
      draft.window.dlq++;
      log(
        draft,
        `☠ Message #${message.id} ${message.attempts} বার fail করল, DLQ-তে সরানো হলো।`,
      );
    } else {
      message.status = "waiting";
      message.visibleAt = now;
      log(
        draft,
        `✕ Message #${message.id} fail করল, আবার queue-এর সামনে ফিরল।`,
      );
    }
    return;
  }

  doSideEffect(draft, message);
  message.status = "done";
  message.finishedAt = now;
  draft.totals.succeeded++;
  draft.window.succeeded++;
  log(
    draft,
    `✓ Message #${message.id} শেষ${draft.config.ackEnabled ? ", ack দেওয়া হলো" : ""}।`,
  );
}

function generate(draft: MqState, dtMs: number) {
  const spiking = draft.spikeUntil !== null && draft.timeMs < draft.spikeUntil;
  const rate = draft.config.producerRate * (spiking ? SPIKE_FACTOR : 1);
  draft.producerCarry += (rate * dtMs) / 1000;
  const count = Math.floor(draft.producerCarry + EPSILON);
  draft.producerCarry = Math.max(0, draft.producerCarry - count);
  for (let i = 0; i < count; i++) publish(draft);
}

function restartConsumers(draft: MqState, now: number) {
  for (const consumer of draft.consumers) {
    if (
      consumer.status === "crashed" &&
      consumer.restartAt !== null &&
      consumer.restartAt <= now + EPSILON
    ) {
      consumer.status = "idle";
      consumer.restartAt = null;
      log(draft, `⟳ ${consumer.name} আবার চালু হলো।`);
    }
  }
}

function dispatchIdle(draft: MqState, now: number) {
  for (const consumer of draft.consumers) {
    if (consumer.status === "idle") deliverTo(draft, consumer, now);
  }
}

/** The next moment something changes inside (now, end]: a job finishing, a message reappearing, a restart. */
function nextEventTime(draft: MqState, now: number, end: number) {
  let next = end;
  for (const consumer of draft.consumers) {
    if (consumer.status === "busy")
      next = Math.min(next, now + consumer.remainingMs);
    if (consumer.status === "crashed" && consumer.restartAt !== null)
      next = Math.min(next, Math.max(now, consumer.restartAt));
  }
  if (draft.consumers.some((c) => c.status === "idle")) {
    for (const message of draft.messages) {
      if (message.status === "in-flight" && message.visibleAt > now)
        next = Math.min(next, message.visibleAt);
    }
  }
  return next;
}

// ---------------------------------------------------------------------------
// Public API

export function tick(state: MqState, dtMs: number): MqState {
  const draft = draftOf(state);
  const end = draft.timeMs + dtMs;
  generate(draft, dtMs);

  let now = draft.timeMs;
  restartConsumers(draft, now);
  dispatchIdle(draft, now);
  while (now < end - EPSILON) {
    const next = nextEventTime(draft, now, end);
    const step = next - now;
    for (const consumer of draft.consumers) {
      if (consumer.status === "busy") consumer.remainingMs -= step;
    }
    now = next;
    for (const consumer of draft.consumers) {
      if (consumer.status === "busy" && consumer.remainingMs <= EPSILON)
        finish(draft, consumer, now);
    }
    restartConsumers(draft, now);
    dispatchIdle(draft, now);
  }

  draft.timeMs = end;
  draft.window.maxDepth = Math.max(draft.window.maxDepth, depthOf(draft));
  trimHistory(draft);
  return draft;
}

export function sendMessages(
  state: MqState,
  count: number,
  options: { poison?: boolean } = {},
): MqState {
  const draft = draftOf(state);
  for (let i = 0; i < count; i++) publish(draft, options);
  if (options.poison)
    log(
      draft,
      `☣ Poison message #${draft.nextMessageId - 1} পাঠানো হলো (এটা সবসময় fail করবে)।`,
    );
  return draft;
}

export function triggerSpike(state: MqState): MqState {
  const draft = draftOf(state);
  draft.spikeUntil = draft.timeMs + SPIKE_DURATION_MS;
  draft.window.spikes++;
  log(
    draft,
    `📈 Spike! পরের ${SPIKE_DURATION_MS / 1000} সেকেন্ড producer ${SPIKE_FACTOR} গুণ দ্রুত।`,
  );
  return draft;
}

/**
 * "mid-work": dies before finishing (nothing happened). "before-ack": the
 * side effect (email) happened, but the ack never left.
 */
export function crashConsumer(
  state: MqState,
  consumerId: string,
  kind: MqCrashKind,
): MqState {
  const draft = draftOf(state);
  const consumer = draft.consumers.find((c) => c.id === consumerId);
  if (!consumer || consumer.status === "crashed") return state;
  const message = draft.messages.find((m) => m.id === consumer.messageId);

  draft.window.crashes++;
  if (kind === "mid-work") draft.window.midWorkCrashes++;
  else draft.window.beforeAckCrashes++;

  if (message && message.status === "in-flight") {
    if (kind === "before-ack" && !message.poison) doSideEffect(draft, message);
    if (!draft.config.ackEnabled) {
      message.status = "lost";
      message.finishedAt = draft.timeMs;
      draft.totals.lost++;
      draft.window.lost++;
      log(
        draft,
        `💀 ${consumer.name} crash করল। Auto-ack ছিল, তাই Message #${message.id} চিরতরে হারাল।`,
      );
    } else {
      log(
        draft,
        `💥 ${consumer.name} crash করল। Message #${message.id}-এর ack আসেনি, visibility timeout শেষে আবার আসবে।`,
      );
    }
  } else {
    log(draft, `💥 ${consumer.name} crash করল (তখন কোনো কাজ ছিল না)।`);
  }

  consumer.status = "crashed";
  consumer.messageId = null;
  consumer.remainingMs = 0;
  consumer.restartAt = draft.timeMs + CONSUMER_RESTART_MS;
  return draft;
}

/** Any setup change starts a fresh experiment window. Consumer count changes add or remove workers. */
export function updateMqConfig(
  state: MqState,
  changes: Partial<MqConfig>,
): MqState {
  const draft = draftOf(state);
  draft.config = { ...draft.config, ...changes };
  const wanted = Math.min(
    MAX_CONSUMERS,
    Math.max(MIN_CONSUMERS, draft.config.consumers),
  );
  draft.config.consumers = wanted;
  while (draft.consumers.length < wanted)
    draft.consumers.push(newConsumer(draft.consumers.length + 1));
  while (draft.consumers.length > wanted) {
    const removed = draft.consumers.pop()!;
    const message = draft.messages.find((m) => m.id === removed.messageId);
    // A removed worker drops its message back on the queue (a graceful shutdown).
    if (message && message.status === "in-flight") {
      message.status = "waiting";
      message.visibleAt = draft.timeMs;
    }
  }
  draft.window = emptyWindow(draft.timeMs, depthOf(draft));
  return draft;
}

export function getMqMetrics(state: MqState) {
  const now = state.timeMs;
  const finishedRecently = state.messages.filter(
    (m) =>
      m.status === "done" && m.finishedAt !== null && m.finishedAt > now - 1000,
  );
  return {
    published: state.totals.published,
    queueDepth: depthOf(state),
    inFlight: state.messages.filter(
      (m) => m.status === "in-flight" && !isDeliverable(m, now),
    ).length,
    succeeded: state.totals.succeeded,
    retried: state.totals.retried,
    dlq: state.totals.dlq,
    lost: state.totals.lost,
    duplicateWork: state.totals.duplicateWork,
    throughput: finishedRecently.length,
    avgWaitMs:
      state.waits.length === 0
        ? 0
        : Math.round(
            state.waits.reduce((a, b) => a + b, 0) / state.waits.length,
          ),
    p95WaitMs: percentile(state.waits, 95),
  };
}

export function getMqWindow(state: MqState) {
  return {
    ...state.window,
    durationMs: state.timeMs - state.window.startMs,
    spikeActive: state.spikeUntil !== null && state.timeMs < state.spikeUntil,
  };
}
