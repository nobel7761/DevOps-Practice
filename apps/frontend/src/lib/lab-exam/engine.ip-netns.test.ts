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

describe("ip netns", () => {
  it("add creates a namespace with only a down loopback", () => {
    const result = run(createShell(), "ip netns add lab-net");
    expect(result.error).toBe(false);
    expect(result.state.netns["lab-net"]).toBeDefined();
    expect(result.state.netns["lab-net"].interfaces["lo"].state).toBe("down");
  });

  it("add fails on a duplicate name", () => {
    const state = runAll(["ip netns add lab-net"]);
    const result = run(state, "ip netns add lab-net");
    expect(result.error).toBe(true);
  });

  it("list shows created namespaces", () => {
    const state = runAll(["ip netns add lab-net"]);
    const result = run(state, "ip netns list");
    expect(result.output).toContain("lab-net");
  });

  it("exec on an unknown namespace fails", () => {
    const result = run(createShell(), "ip netns exec nope ip link show");
    expect(result.error).toBe(true);
  });
});

describe("veth pairs", () => {
  it("ip link add type veth creates two linked, down interfaces on the host", () => {
    const result = run(
      createShell(),
      "ip link add veth-host type veth peer name veth-ns",
    );
    expect(result.error).toBe(false);
    expect(result.state.network.interfaces["veth-host"]).toMatchObject({
      state: "down",
      peer: "veth-ns",
    });
    expect(result.state.network.interfaces["veth-ns"]).toMatchObject({
      state: "down",
      peer: "veth-host",
    });
  });

  it("ip link show type veth lists only the veth pair", () => {
    const state = runAll(["ip link add veth-host type veth peer name veth-ns"]);
    const result = run(state, "ip link show type veth");
    expect(result.output).toContain("veth-host");
    expect(result.output).toContain("veth-ns");
    expect(result.output).not.toContain("eth0");
  });

  it("ip link set <iface> netns <name> moves the interface out of the host", () => {
    const state = runAll([
      "ip netns add lab-net",
      "ip link add veth-host type veth peer name veth-ns",
    ]);
    const result = run(state, "ip link set veth-ns netns lab-net");
    expect(result.error).toBe(false);
    expect(result.state.network.interfaces["veth-ns"]).toBeUndefined();
    expect(result.state.netns["lab-net"].interfaces["veth-ns"]).toBeDefined();
  });
});

describe("ip netns exec", () => {
  function setupMovedVeth(): ShellState {
    return runAll([
      "ip netns add lab-net",
      "ip link add veth-host type veth peer name veth-ns",
      "ip link set veth-ns netns lab-net",
      "ip link set veth-host up",
    ]);
  }

  it("ip link show inside the namespace sees only its own interfaces", () => {
    const state = setupMovedVeth();
    const result = run(state, "ip netns exec lab-net ip link show");
    expect(result.output).toContain("veth-ns");
    expect(result.output).toContain("lo");
    expect(result.output).not.toContain("eth0");
  });

  it("ip link set lo up inside the namespace only affects the namespace's lo", () => {
    const state = setupMovedVeth();
    const result = run(state, "ip netns exec lab-net ip link set lo up");
    expect(result.error).toBe(false);
    expect(result.state.netns["lab-net"].interfaces["lo"].state).toBe("up");
    expect(result.state.network.interfaces["lo"].state).toBe("up"); // host lo untouched (was already up)
  });

  it("ip addr add inside the namespace assigns to the namespace's interface", () => {
    const state = setupMovedVeth();
    const result = run(
      state,
      "ip netns exec lab-net ip addr add 10.10.0.100/24 dev veth-ns",
    );
    expect(result.error).toBe(false);
    expect(
      result.state.netns["lab-net"].interfaces["veth-ns"].addresses,
    ).toContainEqual({
      cidr: "10.10.0.100/24",
    });
    // host's own interfaces are untouched
    expect(result.state.network.interfaces["veth-ns"]).toBeUndefined();
  });

  it("changes inside the namespace persist across multiple netns exec calls", () => {
    const state = runAll([
      ...[
        "ip netns add lab-net",
        "ip link add veth-host type veth peer name veth-ns",
        "ip link set veth-ns netns lab-net",
      ],
      "ip netns exec lab-net ip link set veth-ns up",
    ]);
    const result = run(state, "ip netns exec lab-net ip link show veth-ns");
    expect(result.output).toContain("UP");
  });

  it("ip route add inside the namespace creates a route scoped to that namespace", () => {
    const state = runAll([
      "ip netns add lab-net",
      "ip link add veth-host type veth peer name veth-ns",
      "ip link set veth-ns netns lab-net",
      "ip addr add 10.10.0.1/24 dev veth-host",
      "ip netns exec lab-net ip addr add 10.10.0.100/24 dev veth-ns",
      "ip netns exec lab-net ip route add default via 10.10.0.1",
    ]);
    expect(
      state.netns["lab-net"].routes.find(
        (r) => r.dest === "default" && r.via === "10.10.0.1",
      ),
    ).toBeDefined();
    expect(
      state.network.routes.some(
        (r) => r.dest === "default" && r.via === "10.10.0.1",
      ),
    ).toBe(false);
  });
});

describe("evaluateCheck netnsExists / netIfaceState with context", () => {
  it("netnsExists passes/fails correctly", () => {
    const state = runAll(["ip netns add lab-net"]);
    const ctx = {
      input: "ip netns add lab-net",
      prevState: state,
      result: { state, output: "", error: false },
    };
    expect(evaluateCheck({ netnsExists: ["lab-net"] }, ctx).pass).toBe(true);
    expect(evaluateCheck({ netnsExists: ["nope"] }, ctx).pass).toBe(false);
  });

  it("netIfaceState with a context checks the namespace's stack, not the host's", () => {
    const state = runAll([
      "ip netns add lab-net",
      "ip link add veth-host type veth peer name veth-ns",
      "ip link set veth-ns netns lab-net",
      "ip netns exec lab-net ip link set veth-ns up",
    ]);
    const ctx = {
      input: "ip netns exec lab-net ip link set veth-ns up",
      prevState: state,
      result: { state, output: "", error: false },
    };
    expect(
      evaluateCheck(
        {
          netIfaceState: [{ name: "veth-ns", context: "lab-net", state: "up" }],
        },
        ctx,
      ).pass,
    ).toBe(true);
    // the interface doesn't exist on the host stack at all
    expect(
      evaluateCheck({ netIfaceState: [{ name: "veth-ns", state: "up" }] }, ctx)
        .pass,
    ).toBe(false);
  });
});
