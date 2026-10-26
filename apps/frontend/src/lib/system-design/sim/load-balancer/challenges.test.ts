import { describe, expect, it } from "vitest";
import { LB_CHALLENGES } from "./challenges";
import {
  createLoadBalancerLab,
  sendRequest,
  setPrimaryLbUp,
  setServerStatus,
  tick,
  updateConfig,
  type LbLabOptions,
  type LbState,
} from "./engine";

function run(state: LbState, ms: number, stepMs = 100) {
  let next = state;
  for (let t = 0; t < ms; t += stepMs) next = tick(next, stepMs);
  return next;
}

const challenge = (id: string) => {
  const found = LB_CHALLENGES.find((c) => c.id === id);
  if (!found) throw new Error(`no challenge ${id}`);
  return found;
};

const traffic = {
  rps: 100,
  pattern: "steady" as const,
  heavyRatio: 0.1,
  userCount: 10,
};

describe("LB challenges", () => {
  it("has the six missions from the plan", () => {
    expect(LB_CHALLENGES.map((c) => c.id)).toEqual([
      "uneven-servers",
      "lost-cart",
      "slow-server",
      "server-crash",
      "lb-failover",
      "l7-video",
    ]);
  });

  describe("1 · uneven servers: no server above 90% CPU at 100 RPS", () => {
    const setup = (algorithm: LbLabOptions["algorithm"]) =>
      run(
        createLoadBalancerLab({
          servers: [{ size: "large" }, { size: "small" }, { size: "small" }],
          algorithm,
          traffic,
          seed: 3,
        }),
        10_000,
      );

    it("passes with Weighted Round Robin", () => {
      expect(
        challenge("uneven-servers").isComplete(setup("weighted-round-robin")),
      ).toBe(true);
    });

    it("fails with plain Round Robin (the small servers overload)", () => {
      expect(challenge("uneven-servers").isComplete(setup("round-robin"))).toBe(
        false,
      );
    });

    it("needs the experiment to run a while first", () => {
      const brief = run(
        createLoadBalancerLab({
          servers: [{ size: "large" }, { size: "small" }, { size: "small" }],
          algorithm: "weighted-round-robin",
          traffic,
          seed: 3,
        }),
        1000,
      );
      expect(challenge("uneven-servers").isComplete(brief)).toBe(false);
    });
  });

  describe("2 · lost cart: every user keeps hitting the same server", () => {
    const setup = (options: Partial<LbLabOptions>) =>
      run(
        createLoadBalancerLab({
          servers: [{ size: "medium" }, { size: "medium" }, { size: "medium" }],
          traffic: { ...traffic, rps: 20 },
          seed: 4,
          ...options,
        }),
        3000,
      );

    it("passes with sticky sessions", () => {
      expect(challenge("lost-cart").isComplete(setup({ sticky: true }))).toBe(
        true,
      );
    });

    it("passes with IP Hash", () => {
      expect(
        challenge("lost-cart").isComplete(setup({ algorithm: "ip-hash" })),
      ).toBe(true);
    });

    it("fails with Round Robin and no stickiness", () => {
      expect(
        challenge("lost-cart").isComplete(setup({ algorithm: "round-robin" })),
      ).toBe(false);
    });
  });

  describe("3 · slow server: p99 under 300ms while Server 2 is slow", () => {
    const setup = (algorithm: LbLabOptions["algorithm"]) => {
      let state = createLoadBalancerLab({
        servers: [{ size: "medium" }, { size: "medium" }, { size: "medium" }],
        traffic: { ...traffic, rps: 50, heavyRatio: 0 },
        seed: 5,
      });
      state = setServerStatus(state, "server-2", "slow");
      return run(updateConfig(state, { algorithm }), 5000);
    };

    it("passes with Least Response Time", () => {
      expect(
        challenge("slow-server").isComplete(setup("least-response-time")),
      ).toBe(true);
    });

    it("fails with Round Robin", () => {
      expect(challenge("slow-server").isComplete(setup("round-robin"))).toBe(
        false,
      );
    });
  });

  describe("4 · server crash: under 1% failed requests", () => {
    const setup = (options: Partial<LbLabOptions>) => {
      const state = createLoadBalancerLab({
        servers: [{ size: "medium" }, { size: "medium" }, { size: "medium" }],
        traffic: { ...traffic, heavyRatio: 0 },
        seed: 6,
        ...options,
      });
      return run(setServerStatus(state, "server-3", "down"), 5000);
    };

    it("passes with fast health checks and retry", () => {
      const state = setup({
        retry: true,
        healthCheck: { enabled: true, intervalMs: 1000, failThreshold: 1 },
      });
      expect(challenge("server-crash").isComplete(state)).toBe(true);
    });

    it("fails without health checks or retry", () => {
      const state = setup({
        retry: false,
        healthCheck: { enabled: false, intervalMs: 1000, failThreshold: 1 },
      });
      expect(challenge("server-crash").isComplete(state)).toBe(false);
    });
  });

  describe("5 · LB failover: the site survives the LB dying", () => {
    const setup = (lbRedundancy: boolean) =>
      run(
        setPrimaryLbUp(
          createLoadBalancerLab({
            servers: [{ size: "medium" }],
            traffic: { ...traffic, rps: 20 },
            lbRedundancy,
            seed: 7,
          }),
          false,
        ),
        6000,
      );

    it("passes with a second LB", () => {
      expect(challenge("lb-failover").isComplete(setup(true))).toBe(true);
    });

    it("fails without one", () => {
      expect(challenge("lb-failover").isComplete(setup(false))).toBe(false);
    });
  });

  describe("6 · L7: /video goes to its own powerful pool", () => {
    const servers: LbLabOptions["servers"] = [
      { size: "medium" },
      { size: "medium" },
      { size: "large", pool: "video" },
    ];

    it("passes when /video is routed to a pool of large servers only video uses", () => {
      let state = createLoadBalancerLab({
        servers,
        mode: "L7",
        routes: { "/video": "video" },
        seed: 8,
      });
      for (let i = 0; i < 20; i++)
        state = run(sendRequest(state, { path: "/video" }), 100);
      expect(challenge("l7-video").isComplete(state)).toBe(true);
    });

    it("fails in L4 mode", () => {
      let state = createLoadBalancerLab({ servers, mode: "L4", seed: 8 });
      for (let i = 0; i < 20; i++)
        state = run(sendRequest(state, { path: "/video" }), 100);
      expect(challenge("l7-video").isComplete(state)).toBe(false);
    });
  });
});

describe("LB challenge 1 also accepts Least Connections", () => {
  it("passes uneven-servers with (weighted) Least Connections", () => {
    const state = run(
      createLoadBalancerLab({
        servers: [{ size: "large" }, { size: "small" }, { size: "small" }],
        algorithm: "least-connections",
        traffic,
        seed: 3,
      }),
      10_000,
    );
    expect(LB_CHALLENGES[0].isComplete(state)).toBe(true);
  });
});
