import { describe, expect, it } from "vitest";
import {
  CONSUMER_RESTART_MS,
  SPIKE_DURATION_MS,
  SPIKE_FACTOR,
  createMessageQueueLab,
  crashConsumer,
  getMqMetrics,
  getMqWindow,
  sendMessages,
  tick,
  triggerSpike,
  updateMqConfig,
  type MqLabOptions,
  type MqState,
} from "./engine";

/** Advances in small steps, the way the UI drives the engine. */
function run(state: MqState, ms: number, stepMs = 50) {
  let next = state;
  for (let t = 0; t < ms; t += stepMs) next = tick(next, stepMs);
  return next;
}

// No automatic producer traffic unless a test asks for it.
const lab = (options: Partial<MqLabOptions> = {}) =>
  createMessageQueueLab({
    producerRate: 0,
    consumers: 1,
    processingMs: 200,
    ...options,
  });

describe("producer and consumers", () => {
  it("the producer publishes producerRate messages per second", () => {
    const state = run(lab({ producerRate: 10, consumers: 0 }), 1000);
    expect(getMqMetrics(state)).toMatchObject({
      published: 10,
      queueDepth: 10,
    });
  });

  it("a consumer takes the oldest message first and finishes it after processingMs", () => {
    let state = sendMessages(lab(), 2);
    state = run(state, 200);
    expect(getMqMetrics(state)).toMatchObject({
      succeeded: 1,
      queueDepth: 0,
      inFlight: 1,
    });
    expect(state.messages.find((m) => m.status === "done")?.id).toBe(1);
  });

  it("more consumers work in parallel (competing consumers)", () => {
    const one = run(sendMessages(lab({ consumers: 1 }), 10), 1000);
    const five = run(sendMessages(lab({ consumers: 5 }), 10), 1000);
    expect(getMqMetrics(one).succeeded).toBe(5);
    expect(getMqMetrics(five).succeeded).toBe(10);
  });

  it("explains each delivery in the log", () => {
    const state = run(sendMessages(lab(), 1), 50);
    expect(state.log.join("\n")).toContain("Message #1 → Consumer 1");
  });

  it("a spike multiplies the producer rate for a few seconds", () => {
    let state = triggerSpike(lab({ producerRate: 10, consumers: 0 }));
    state = run(state, SPIKE_DURATION_MS);
    expect(getMqMetrics(state).published).toBe(
      10 * SPIKE_FACTOR * (SPIKE_DURATION_MS / 1000),
    );
    const before = getMqMetrics(state).published;
    state = run(state, 1000);
    expect(getMqMetrics(state).published - before).toBe(10);
  });
});

describe("acknowledgement and crashes", () => {
  it("with ack on, a crash mid-work makes the message visible again after the visibility timeout", () => {
    let state = run(
      sendMessages(lab({ ackEnabled: true, visibilityTimeoutMs: 1000 }), 1),
      100,
    );
    state = crashConsumer(state, "consumer-1", "mid-work");
    state = run(state, 900);
    expect(getMqMetrics(state)).toMatchObject({ succeeded: 0, retried: 0 });
    state = run(state, 1500);
    expect(getMqMetrics(state)).toMatchObject({
      succeeded: 1,
      retried: 1,
      lost: 0,
    });
  });

  it("with ack off (auto-ack), a crash mid-work loses the message", () => {
    let state = run(sendMessages(lab({ ackEnabled: false }), 1), 100);
    state = crashConsumer(state, "consumer-1", "mid-work");
    state = run(state, 3000);
    expect(getMqMetrics(state)).toMatchObject({ succeeded: 0, lost: 1 });
  });

  it("a crashed consumer comes back after a restart delay", () => {
    let state = crashConsumer(lab(), "consumer-1", "mid-work");
    expect(state.consumers[0].status).toBe("crashed");
    state = run(state, CONSUMER_RESTART_MS);
    expect(state.consumers[0].status).toBe("idle");
  });

  it("a crash after the work but before the ack repeats the side effect (the email goes twice)", () => {
    let state = run(
      sendMessages(lab({ ackEnabled: true, visibilityTimeoutMs: 1000 }), 1),
      100,
    );
    state = crashConsumer(state, "consumer-1", "before-ack");
    state = run(state, 3000);
    expect(getMqMetrics(state)).toMatchObject({
      succeeded: 1,
      duplicateWork: 1,
    });
  });

  it("an idempotent consumer skips the repeated side effect", () => {
    let state = run(
      sendMessages(
        lab({ ackEnabled: true, visibilityTimeoutMs: 1000, idempotency: true }),
        1,
      ),
      100,
    );
    state = crashConsumer(state, "consumer-1", "before-ack");
    state = run(state, 3000);
    expect(getMqMetrics(state)).toMatchObject({
      succeeded: 1,
      duplicateWork: 0,
    });
  });

  it("a visibility timeout shorter than the work lets a second consumer process the same message", () => {
    const state = run(
      sendMessages(
        lab({ consumers: 2, processingMs: 1000, visibilityTimeoutMs: 400 }),
        1,
      ),
      1500,
    );
    expect(getMqMetrics(state).duplicateWork).toBeGreaterThanOrEqual(1);
  });
});

describe("poison messages and the DLQ", () => {
  it("moves a poison message to the DLQ after maxRetries and keeps processing the rest", () => {
    let state = lab({ dlqEnabled: true, maxRetries: 3 });
    state = sendMessages(state, 1, { poison: true });
    state = sendMessages(state, 5);
    state = run(state, 3000);
    expect(getMqMetrics(state)).toMatchObject({ dlq: 1, succeeded: 5 });
    expect(state.messages.find((m) => m.poison)?.attempts).toBe(4);
  });

  it("without a DLQ, a poison message is retried forever and blocks a single consumer", () => {
    let state = lab({ dlqEnabled: false });
    state = sendMessages(state, 1, { poison: true });
    state = sendMessages(state, 5);
    state = run(state, 3000);
    expect(getMqMetrics(state)).toMatchObject({ dlq: 0, succeeded: 0 });
    expect(getMqMetrics(state).retried).toBeGreaterThan(5);
  });
});

describe("experiment window", () => {
  it("tracks the deepest the queue got and resets on any setup change", () => {
    let state = run(sendMessages(lab({ consumers: 1 }), 8), 100);
    expect(getMqWindow(state).maxDepth).toBe(7);
    state = updateMqConfig(state, { consumers: 4 });
    expect(getMqWindow(state)).toMatchObject({
      maxDepth: 7,
      durationMs: 0,
      succeeded: 0,
    });
  });

  it("counts crashes and spikes inside the window", () => {
    let state = triggerSpike(lab());
    state = crashConsumer(state, "consumer-1", "mid-work");
    expect(getMqWindow(state)).toMatchObject({ spikes: 1, crashes: 1 });
  });
});
