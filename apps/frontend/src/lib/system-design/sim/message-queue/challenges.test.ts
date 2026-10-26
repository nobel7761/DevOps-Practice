import { describe, expect, it } from "vitest";
import { MQ_CHALLENGES } from "./challenges";
import {
  createMessageQueueLab,
  crashConsumer,
  sendMessages,
  tick,
  triggerSpike,
  type MqLabOptions,
  type MqState,
} from "./engine";

function run(state: MqState, ms: number, stepMs = 50) {
  let next = state;
  for (let t = 0; t < ms; t += stepMs) next = tick(next, stepMs);
  return next;
}

const challenge = (id: string) => MQ_CHALLENGES.find((c) => c.id === id)!;
/** Crash someone who is actually working, so the crash can lose or repeat a message. */
const busyConsumer = (state: MqState) =>
  state.consumers.find((c) => c.status === "busy")!.id;
const lab = (options: Partial<MqLabOptions>) =>
  createMessageQueueLab({
    producerRate: 10,
    consumers: 3,
    processingMs: 200,
    ...options,
  });

describe("MQ challenges", () => {
  it("has the four missions from the plan", () => {
    expect(MQ_CHALLENGES.map((c) => c.id)).toEqual([
      "spike",
      "no-loss",
      "poison",
      "duplicates",
    ]);
  });

  describe("1 · spike: queue depth stays under the limit during a spike", () => {
    const afterSpike = (consumers: number) =>
      run(triggerSpike(lab({ consumers })), 8000);

    it("passes with enough consumers", () => {
      expect(challenge("spike").isComplete(afterSpike(8))).toBe(true);
    });

    it("fails with too few consumers", () => {
      expect(challenge("spike").isComplete(afterSpike(2))).toBe(false);
    });
  });

  describe("2 · no-loss: a consumer crash loses no message", () => {
    const crashed = (ackEnabled: boolean) => {
      let state = run(lab({ ackEnabled, visibilityTimeoutMs: 1000 }), 1000);
      state = crashConsumer(state, busyConsumer(state), "mid-work");
      return run(state, 4000);
    };

    it("passes with ack on", () => {
      expect(challenge("no-loss").isComplete(crashed(true))).toBe(true);
    });

    it("fails with auto-ack", () => {
      expect(challenge("no-loss").isComplete(crashed(false))).toBe(false);
    });
  });

  describe("3 · poison: a poison message no longer blocks the queue", () => {
    const withPoison = (dlqEnabled: boolean) => {
      const state = sendMessages(
        lab({ consumers: 1, producerRate: 3, dlqEnabled, maxRetries: 3 }),
        1,
        { poison: true },
      );
      return run(state, 10_000);
    };

    it("passes with max retries + DLQ", () => {
      expect(challenge("poison").isComplete(withPoison(true))).toBe(true);
    });

    it("fails without a DLQ", () => {
      expect(challenge("poison").isComplete(withPoison(false))).toBe(false);
    });
  });

  describe("4 · duplicates: a crash before ack doesn't send the email twice", () => {
    const crashedBeforeAck = (idempotency: boolean) => {
      let state = run(
        lab({ ackEnabled: true, idempotency, visibilityTimeoutMs: 1000 }),
        1000,
      );
      state = crashConsumer(state, busyConsumer(state), "before-ack");
      return run(state, 4000);
    };

    it("passes with an idempotent consumer", () => {
      expect(challenge("duplicates").isComplete(crashedBeforeAck(true))).toBe(
        true,
      );
    });

    it("fails without idempotency", () => {
      expect(challenge("duplicates").isComplete(crashedBeforeAck(false))).toBe(
        false,
      );
    });
  });
});
