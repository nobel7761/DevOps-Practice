import { describe, expect, it } from "vitest";
import { createShell, evaluateCheck, execute } from "./engine";
import type { ShellState } from "./engine";

function run(state: ShellState, cmd: string) {
  return execute(state, cmd);
}

function runAll(cmds: string[]): ShellState {
  let state = createShell();
  for (const cmd of cmds) {
    state = run(state, cmd).state;
  }
  return state;
}

describe("ip link", () => {
  it("show lists seeded interfaces (lo, eth0)", () => {
    const result = run(createShell(), "ip link show");
    expect(result.error).toBe(false);
    expect(result.output).toContain("lo");
    expect(result.output).toContain("eth0");
  });

  it("show <iface> prints just that interface", () => {
    const result = run(createShell(), "ip link show eth0");
    expect(result.output).toContain("eth0");
    expect(result.output).not.toContain("lo:");
  });

  it("set <iface> down marks the interface down", () => {
    const result = run(createShell(), "ip link set eth0 down");
    expect(result.error).toBe(false);
    expect(result.state.network.interfaces["eth0"].state).toBe("down");
  });

  it("set <iface> up marks the interface up", () => {
    const state = runAll(["ip link set eth0 down"]);
    const result = run(state, "ip link set eth0 up");
    expect(result.state.network.interfaces["eth0"].state).toBe("up");
  });

  it("set on an unknown interface fails", () => {
    const result = run(createShell(), "ip link set nope up");
    expect(result.error).toBe(true);
  });
});

describe("ip addr", () => {
  it("show lists addresses on all interfaces", () => {
    const result = run(createShell(), "ip addr show");
    expect(result.output).toContain("127.0.0.1/8");
    expect(result.output).toContain("10.0.1.15/24");
  });

  it("add assigns a new address to an interface", () => {
    const result = run(createShell(), "ip addr add 10.10.0.100/24 dev eth0");
    expect(result.error).toBe(false);
    expect(result.state.network.interfaces["eth0"].addresses).toContainEqual({
      cidr: "10.10.0.100/24",
    });
  });

  it("add on an unknown interface fails", () => {
    const result = run(createShell(), "ip addr add 10.10.0.100/24 dev nope");
    expect(result.error).toBe(true);
  });

  it("del removes an address from an interface", () => {
    const state = runAll(["ip addr add 10.10.0.200/24 dev eth0"]);
    const result = run(state, "ip addr del 10.10.0.200/24 dev eth0");
    expect(result.error).toBe(false);
    expect(
      result.state.network.interfaces["eth0"].addresses,
    ).not.toContainEqual({
      cidr: "10.10.0.200/24",
    });
  });

  it("an interface can hold multiple addresses at once", () => {
    const state = runAll([
      "ip addr add 10.10.0.100/24 dev eth0",
      "ip addr add 10.10.0.200/24 dev eth0",
    ]);
    expect(state.network.interfaces["eth0"].addresses).toHaveLength(3); // seeded + 2
  });
});

describe("ip route", () => {
  it("show lists the seeded routes", () => {
    const result = run(createShell(), "ip route show");
    expect(result.output).toContain("default via 10.0.1.1 dev eth0");
    expect(result.output).toContain("10.0.1.0/24 dev eth0");
  });

  it("add creates a new route with an explicit dev", () => {
    const result = run(
      createShell(),
      "ip route add 10.20.0.0/24 via 10.0.1.1 dev eth0",
    );
    expect(result.error).toBe(false);
    expect(result.state.network.routes).toContainEqual({
      dest: "10.20.0.0/24",
      via: "10.0.1.1",
      dev: "eth0",
    });
  });

  it("add infers dev from a via address within a connected subnet", () => {
    const result = run(createShell(), "ip route add default via 10.0.1.1");
    expect(result.error).toBe(false);
    expect(
      result.state.network.routes.find(
        (r) => r.dest === "default" && r.via === "10.0.1.1",
      ),
    ).toBeDefined();
  });

  it("del removes a route by destination", () => {
    const state = runAll(["ip route add 10.20.0.0/24 via 10.0.1.1 dev eth0"]);
    const result = run(state, "ip route del 10.20.0.0/24");
    expect(result.error).toBe(false);
    expect(
      result.state.network.routes.some((r) => r.dest === "10.20.0.0/24"),
    ).toBe(false);
  });

  it("get finds the directly-connected route for an address on the local subnet", () => {
    const result = run(createShell(), "ip route get 10.0.1.200");
    expect(result.error).toBe(false);
    expect(result.output).toContain("dev eth0");
    expect(result.output).not.toContain("via");
  });

  it("get finds the default route for an address outside any connected subnet", () => {
    const result = run(createShell(), "ip route get 8.8.8.8");
    expect(result.error).toBe(false);
    expect(result.output).toContain("via 10.0.1.1");
    expect(result.output).toContain("dev eth0");
  });

  it("get fails when no route matches at all", () => {
    const state = runAll(["ip route del default"]);
    const result = run(state, "ip route get 8.8.8.8");
    expect(result.error).toBe(true);
  });
});

describe("ip neigh", () => {
  it("show on an empty table prints nothing and does not error", () => {
    const result = run(createShell(), "ip neigh show");
    expect(result.error).toBe(false);
  });

  it("flush dev clears neighbor entries for that interface without erroring", () => {
    const result = run(createShell(), "ip neigh flush dev eth0");
    expect(result.error).toBe(false);
  });
});

describe("evaluateCheck netIfaceState/routeExists", () => {
  it("passes/fails on interface state", () => {
    const state = runAll(["ip link set eth0 down"]);
    const ctx = {
      input: "ip link set eth0 down",
      prevState: state,
      result: { state, output: "", error: false },
    };
    expect(
      evaluateCheck({ netIfaceState: [{ name: "eth0", state: "down" }] }, ctx)
        .pass,
    ).toBe(true);
    expect(
      evaluateCheck({ netIfaceState: [{ name: "eth0", state: "up" }] }, ctx)
        .pass,
    ).toBe(false);
  });

  it("passes/fails on hasAddress", () => {
    const state = runAll(["ip addr add 10.10.0.100/24 dev eth0"]);
    const ctx = {
      input: "ip addr add 10.10.0.100/24 dev eth0",
      prevState: state,
      result: { state, output: "", error: false },
    };
    expect(
      evaluateCheck(
        { netIfaceState: [{ name: "eth0", hasAddress: "10.10.0.100/24" }] },
        ctx,
      ).pass,
    ).toBe(true);
    expect(
      evaluateCheck(
        { netIfaceState: [{ name: "eth0", hasAddress: "10.10.0.200/24" }] },
        ctx,
      ).pass,
    ).toBe(false);
  });

  it("passes/fails on routeExists", () => {
    const state = runAll(["ip route add 10.20.0.0/24 via 10.0.1.1 dev eth0"]);
    const ctx = {
      input: "ip route add 10.20.0.0/24 via 10.0.1.1 dev eth0",
      prevState: state,
      result: { state, output: "", error: false },
    };
    expect(
      evaluateCheck(
        { routeExists: [{ dest: "10.20.0.0/24", via: "10.0.1.1" }] },
        ctx,
      ).pass,
    ).toBe(true);
    expect(
      evaluateCheck({ routeExists: [{ dest: "10.30.0.0/24" }] }, ctx).pass,
    ).toBe(false);
  });

  it("routeExists with exists:false requires the route to be absent", () => {
    const state = runAll(["ip route del default"]);
    const ctx = {
      input: "ip route del default",
      prevState: state,
      result: { state, output: "", error: false },
    };
    expect(
      evaluateCheck({ routeExists: [{ dest: "default", exists: false }] }, ctx)
        .pass,
    ).toBe(true);
  });
});
