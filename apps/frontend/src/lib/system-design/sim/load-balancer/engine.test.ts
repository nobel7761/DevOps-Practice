import { describe, expect, it } from "vitest";
import {
  createLoadBalancerLab,
  getMetrics,
  sendRequest,
  serverCpu,
  setPrimaryLbUp,
  setServerStatus,
  tick,
  updateConfig,
  type LbLabOptions,
  type LbState,
} from "./engine";

const three = (size: "small" | "medium" | "large" = "medium") => [
  { size },
  { size },
  { size },
];

function send(
  state: LbState,
  count: number,
  request: Parameters<typeof sendRequest>[1] = {},
) {
  let next = state;
  for (let i = 0; i < count; i++) next = sendRequest(next, request);
  return next;
}

/** Advances in small steps, the way the UI drives the engine. */
function run(state: LbState, ms: number, stepMs = 100) {
  let next = state;
  for (let t = 0; t < ms; t += stepMs) next = tick(next, stepMs);
  return next;
}

const lab = (options: Partial<LbLabOptions>) =>
  createLoadBalancerLab({ servers: three(), seed: 1, ...options });

describe("routing algorithms", () => {
  it("Round Robin sends requests to each server in turn and explains why in the log", () => {
    const state = send(lab({ algorithm: "round-robin" }), 6);
    expect(getMetrics(state).perServer).toEqual({
      "server-1": 2,
      "server-2": 2,
      "server-3": 2,
    });
    const last = state.log.at(-1)!;
    expect(last).toContain("Request #6");
    expect(last).toContain("Server 3");
    expect(last).toContain("Round Robin");
  });

  it("Weighted Round Robin sends by weight (Large 4 : Small 1)", () => {
    const state = send(
      lab({
        algorithm: "weighted-round-robin",
        servers: [{ size: "large" }, { size: "small" }, { size: "small" }],
      }),
      6,
    );
    expect(getMetrics(state).perServer).toEqual({
      "server-1": 4,
      "server-2": 1,
      "server-3": 1,
    });
  });

  it("Least Connections avoids the server still busy with a heavy request", () => {
    let state = lab({
      algorithm: "least-connections",
      servers: [{ size: "medium" }, { size: "medium" }],
    });
    state = sendRequest(state, { kind: "heavy" }); // → server-1 (tie, first)
    state = sendRequest(state, { kind: "light" }); // → server-2
    state = run(state, 100); // light done, heavy still running
    state = sendRequest(state, { kind: "light" }); // → server-2 again
    expect(getMetrics(state).perServer).toEqual({
      "server-1": 1,
      "server-2": 2,
    });
  });

  it("Least Connections weighs connections by server size (Large 2 of weight 4 beats Small 1 of weight 1)", () => {
    let state = lab({
      algorithm: "round-robin",
      servers: [{ size: "large" }, { size: "small" }],
    });
    state = send(state, 3, { kind: "heavy" }); // RR: large 2, small 1
    state = updateConfig(state, { algorithm: "least-connections" });
    state = sendRequest(state, { kind: "heavy" }); // per weight: large 2/4 < small 1/1
    expect(state.requests.at(-1)!.serverId).toBe("server-1");
  });

  it("IP Hash keeps one user on one server", () => {
    const state = send(lab({ algorithm: "ip-hash" }), 5, { userId: 5 });
    expect(
      Object.values(getMetrics(state).perServer).filter((n) => n > 0),
    ).toEqual([5]);
  });

  it("IP Hash still spreads different users across servers", () => {
    let state = lab({ algorithm: "ip-hash" });
    for (let user = 0; user < 20; user++)
      state = sendRequest(state, { userId: user });
    const used = Object.values(getMetrics(state).perServer).filter(
      (n) => n > 0,
    );
    expect(used.length).toBeGreaterThanOrEqual(2);
  });

  it("Random is repeatable with the same seed", () => {
    const routeOf = (seed: number) =>
      send(lab({ algorithm: "random", seed }), 20).requests.map(
        (r) => r.serverId,
      );
    expect(routeOf(7)).toEqual(routeOf(7));
    expect(routeOf(7)).not.toEqual(routeOf(8));
  });

  it("Power of Two Choices picks the less loaded of the two", () => {
    let state = lab({
      algorithm: "power-of-two",
      servers: [{ size: "medium" }, { size: "medium" }],
    });
    state = sendRequest(state, { kind: "heavy" });
    const busy = state.requests[0].serverId;
    state = sendRequest(state, { kind: "light" });
    expect(state.requests[1].serverId).not.toBe(busy);
  });

  it("Least Response Time sends most traffic away from a slow server", () => {
    let state = lab({
      algorithm: "least-response-time",
      servers: [{ size: "medium" }, { size: "medium" }],
    });
    state = setServerStatus(state, "server-2", "slow");
    for (let t = 0; t < 3000; t += 50) {
      state = sendRequest(state, { kind: "light" });
      state = tick(state, 50);
    }
    const { perServer } = getMetrics(state);
    expect(perServer["server-1"]).toBeGreaterThan(perServer["server-2"] * 2);
  });
});

describe("request timing and capacity", () => {
  it("a light request takes 50ms", () => {
    let state = sendRequest(lab({ servers: [{ size: "medium" }] }), {
      kind: "light",
    });
    state = tick(state, 49);
    expect(getMetrics(state).succeeded).toBe(0);
    state = tick(state, 1);
    expect(getMetrics(state)).toMatchObject({ succeeded: 1, p50: 50 });
  });

  it("a heavy request takes 500ms", () => {
    const state = tick(
      sendRequest(lab({ servers: [{ size: "medium" }] }), { kind: "heavy" }),
      500,
    );
    expect(getMetrics(state)).toMatchObject({ succeeded: 1, p50: 500 });
  });

  it("a slow server takes 5x longer", () => {
    let state = setServerStatus(
      lab({ servers: [{ size: "medium" }] }),
      "server-1",
      "slow",
    );
    state = tick(sendRequest(state, { kind: "light" }), 250);
    expect(getMetrics(state)).toMatchObject({ succeeded: 1, p50: 250 });
  });

  it("queues requests beyond a server's capacity (Small = 2 at a time)", () => {
    let state = send(lab({ servers: [{ size: "small" }] }), 3, {
      kind: "heavy",
    });
    state = tick(state, 500);
    expect(getMetrics(state).succeeded).toBe(2);
    state = tick(state, 500);
    expect(getMetrics(state)).toMatchObject({ succeeded: 3, p99: 1000 });
  });

  it("reports CPU as the share of capacity in use", () => {
    const state = sendRequest(lab({ servers: [{ size: "small" }] }), {
      kind: "heavy",
    });
    expect(serverCpu(state.servers[0])).toBe(50);
  });
});

describe("failures, health checks and retry", () => {
  const twoServers = {
    servers: [{ size: "medium" as const }, { size: "medium" as const }],
  };

  it("without health checks, a dead server keeps getting traffic and those requests fail", () => {
    let state = lab({
      ...twoServers,
      healthCheck: { enabled: false, intervalMs: 1000, failThreshold: 2 },
    });
    state = setServerStatus(state, "server-2", "down");
    state = run(send(state, 10), 100);
    expect(getMetrics(state)).toMatchObject({
      succeeded: 5,
      failed: 5,
      successRate: 50,
    });
  });

  it("health checks take a dead server out of rotation after the fail threshold", () => {
    let state = lab({
      ...twoServers,
      healthCheck: { enabled: true, intervalMs: 1000, failThreshold: 2 },
    });
    state = setServerStatus(state, "server-2", "down");
    state = run(state, 1000);
    expect(state.servers[1].inRotation).toBe(true);
    state = run(state, 1000);
    expect(state.servers[1].inRotation).toBe(false);
    // All 10 land on server-1 (4 slots), so the last ones queue: give them 200ms.
    state = run(send(state, 10), 200);
    expect(getMetrics(state)).toMatchObject({ succeeded: 10, failed: 0 });
  });

  it("health checks bring a recovered server back", () => {
    let state = lab({
      ...twoServers,
      healthCheck: { enabled: true, intervalMs: 1000, failThreshold: 1 },
    });
    state = run(setServerStatus(state, "server-2", "down"), 1000);
    expect(state.servers[1].inRotation).toBe(false);
    state = run(setServerStatus(state, "server-2", "healthy"), 1000);
    expect(state.servers[1].inRotation).toBe(true);
  });

  it("retry sends a failed request to another server", () => {
    let state = lab({
      ...twoServers,
      retry: true,
      healthCheck: { enabled: false, intervalMs: 1000, failThreshold: 2 },
    });
    state = setServerStatus(state, "server-2", "down");
    // Retries all end up on server-1 (4 slots), so the last ones queue: give them 200ms.
    state = run(send(state, 10), 200);
    expect(getMetrics(state)).toMatchObject({ succeeded: 10, failed: 0 });
  });
});

describe("sticky sessions", () => {
  const twoServers = {
    servers: [{ size: "medium" as const }, { size: "medium" as const }],
  };

  it("keeps a user on the same server", () => {
    const state = send(lab({ ...twoServers, sticky: true }), 3, { userId: 1 });
    expect(getMetrics(state).perServer).toEqual({
      "server-1": 3,
      "server-2": 0,
    });
  });

  it("loses the session when that server dies", () => {
    let state = lab({
      ...twoServers,
      sticky: true,
      healthCheck: { enabled: true, intervalMs: 1000, failThreshold: 1 },
    });
    state = sendRequest(state, { userId: 1 });
    state = run(setServerStatus(state, "server-1", "down"), 1000);
    state = sendRequest(state, { userId: 1 });
    expect(state.requests.at(-1)!.serverId).toBe("server-2");
    expect(getMetrics(state).sessionsLost).toBe(1);
  });
});

describe("load balancer redundancy", () => {
  it("without a second LB, losing the LB takes the whole site down", () => {
    let state = setPrimaryLbUp(lab({ lbRedundancy: false }), false);
    state = run(send(state, 5), 100);
    expect(getMetrics(state)).toMatchObject({ succeeded: 0, failed: 5 });
  });

  it("with active-passive LBs, traffic fails only until failover completes", () => {
    let state = setPrimaryLbUp(
      lab({ lbRedundancy: true, failoverMs: 3000 }),
      false,
    );
    state = sendRequest(state, {});
    state = run(state, 3000);
    state = run(sendRequest(state, {}), 100);
    expect(getMetrics(state)).toMatchObject({ succeeded: 1, failed: 1 });
  });
});

describe("L7 routing", () => {
  it("sends /video to the video pool and keeps other paths off it", () => {
    let state = lab({
      mode: "L7",
      servers: [
        { size: "medium" },
        { size: "medium" },
        { size: "large", pool: "video" },
      ],
      routes: { "/video": "video" },
    });
    state = send(state, 4, { path: "/video" });
    state = send(state, 4, { path: "/api" });
    expect(getMetrics(state).perServer).toEqual({
      "server-1": 2,
      "server-2": 2,
      "server-3": 4,
    });
  });
});

describe("traffic generator", () => {
  const traffic = (pattern: "steady" | "ramp" | "spike") => ({
    rps: 100,
    pattern,
    heavyRatio: 0,
    userCount: 10,
  });

  it("steady traffic sends rps requests per second", () => {
    const state = run(lab({ traffic: traffic("steady") }), 1000);
    expect(getMetrics(state).total).toBe(100);
  });

  it("ramp traffic starts low and reaches full rate", () => {
    let state = run(lab({ traffic: traffic("ramp") }), 1000);
    expect(getMetrics(state).total).toBeLessThan(20);
    state = run(state, 19_000);
    const before = getMetrics(state).total;
    state = run(state, 1000);
    expect(getMetrics(state).total - before).toBe(100);
  });

  it("spike traffic jumps to 5x for a few seconds", () => {
    let state = run(lab({ traffic: traffic("spike") }), 5000);
    const before = getMetrics(state).total;
    state = run(state, 1000);
    expect(getMetrics(state).total - before).toBe(500);
  });

  it("only sends heavy requests in proportion to heavyRatio", () => {
    const state = run(
      lab({ traffic: { ...traffic("steady"), heavyRatio: 0 } }),
      1000,
    );
    expect(state.requests.every((r) => r.kind === "light")).toBe(true);
  });
});
