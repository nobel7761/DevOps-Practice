import { describe, expect, it } from "vitest";
import {
  addServer,
  createLoadBalancerLab,
  getMetrics,
  getRecentStats,
  getWindowMetrics,
  removeServer,
  sendRequest,
  setServerSize,
  setServerStatus,
  tick,
  updateConfig,
  type LbLabOptions,
  type LbState,
} from "./engine";

const lab = (options: Partial<LbLabOptions> = {}) =>
  createLoadBalancerLab({
    servers: [{ size: "medium" }, { size: "medium" }],
    seed: 1,
    ...options,
  });

function run(state: LbState, ms: number, stepMs = 100) {
  let next = state;
  for (let t = 0; t < ms; t += stepMs) next = tick(next, stepMs);
  return next;
}

describe("changing the setup", () => {
  it("adds and removes servers (2 to 8)", () => {
    let state = addServer(lab(), "large");
    expect(state.servers.map((s) => s.id)).toEqual([
      "server-1",
      "server-2",
      "server-3",
    ]);
    expect(state.servers[2].size).toBe("large");
    state = removeServer(state, "server-1");
    expect(state.servers.map((s) => s.id)).toEqual(["server-2", "server-3"]);
    expect(removeServer(state, "server-2").servers).toHaveLength(2);
    let full = lab();
    for (let i = 0; i < 10; i++) full = addServer(full, "small");
    expect(full.servers).toHaveLength(8);
  });

  it("fails the in-flight requests of a removed or crashed server", () => {
    let state = sendRequest(lab({ algorithm: "round-robin" }), {
      kind: "heavy",
    });
    state = setServerStatus(state, "server-1", "down");
    expect(getMetrics(state).failed).toBe(1);
  });

  it("changes a server's size", () => {
    expect(setServerSize(lab(), "server-1", "small").servers[0].size).toBe(
      "small",
    );
  });

  it("updates config, e.g. switching algorithm", () => {
    expect(updateConfig(lab(), { algorithm: "random" }).config.algorithm).toBe(
      "random",
    );
  });
});

describe("experiment window", () => {
  it("starts a fresh window on every setup change, so challenges measure the current experiment", () => {
    let state = run(
      lab({
        traffic: { rps: 100, pattern: "steady", heavyRatio: 0, userCount: 5 },
      }),
      2000,
    );
    expect(getWindowMetrics(state).total).toBe(200);
    state = updateConfig(state, { algorithm: "least-connections" });
    expect(getWindowMetrics(state)).toMatchObject({ total: 0, durationMs: 0 });
    state = run(state, 1000);
    expect(getWindowMetrics(state)).toMatchObject({
      total: 100,
      durationMs: 1000,
    });
    expect(getMetrics(state).total).toBe(300);
  });

  it("measures time-averaged CPU per server over the window", () => {
    // One medium server (4 slots) running one heavy request the whole time = 25%.
    let state = createLoadBalancerLab({
      servers: [{ size: "medium" }],
      seed: 1,
    });
    state = run(sendRequest(state, { kind: "heavy" }), 500);
    expect(getWindowMetrics(state).avgCpu["server-1"]).toBeCloseTo(25);
  });

  it("counts users who landed on a different server than last time", () => {
    let state = lab({ algorithm: "round-robin" });
    state = sendRequest(state, { userId: 1 });
    state = sendRequest(state, { userId: 1 });
    expect(getWindowMetrics(state).userSwitches).toBe(1);
  });

  it("counts /video requests that succeeded", () => {
    let state = lab({ mode: "L7" });
    state = run(sendRequest(state, { path: "/video" }), 100);
    expect(getWindowMetrics(state).videoSucceeded).toBe(1);
  });
});

describe("server queue limit", () => {
  it("rejects requests once a server's queue is full (503) instead of queueing forever", () => {
    let state = createLoadBalancerLab({
      servers: [{ size: "small" }],
      seed: 1,
    });
    for (let i = 0; i < 2 + 100 + 5; i++)
      state = sendRequest(state, { kind: "heavy" });
    expect(getMetrics(state).failed).toBe(5);
  });
});

describe("recent stats (for the live chart)", () => {
  it("reports throughput and p99 over the last second only", () => {
    let state = createLoadBalancerLab({
      servers: [{ size: "large" }],
      seed: 1,
    });
    state = run(sendRequest(state, { kind: "heavy" }), 500); // finishes at 500ms
    state = run(state, 1000); // now 1500ms: the heavy one is older than 1s
    for (let i = 0; i < 5; i++) state = sendRequest(state, { kind: "light" });
    state = run(state, 100);
    expect(getRecentStats(state, 1000)).toEqual({
      throughput: 5,
      p99: 50,
      failed: 0,
    });
  });

  it("counts recent failures", () => {
    let state = setServerStatus(
      createLoadBalancerLab({ servers: [{ size: "large" }], seed: 1 }),
      "server-1",
      "down",
    );
    state = run(sendRequest(state, {}), 100);
    expect(getRecentStats(state, 1000)).toMatchObject({
      throughput: 0,
      failed: 1,
    });
  });
});
