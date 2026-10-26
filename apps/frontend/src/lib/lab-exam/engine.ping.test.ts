import { describe, expect, it } from "vitest";
import { createShell, execute } from "./engine";
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

describe("ping", () => {
  it("succeeds for a directly-connected address and populates the neighbor cache", () => {
    const result = run(createShell(), "ping -c 2 10.0.1.200");
    expect(result.error).toBe(false);
    expect(result.output).toContain("10.0.1.200");
    expect(result.state.network.neighbors["10.0.1.200"]).toMatchObject({
      dev: "eth0",
      state: "REACHABLE",
    });
  });

  it("succeeds for an address reachable only via the default route", () => {
    const result = run(createShell(), "ping -c 2 8.8.8.8");
    expect(result.error).toBe(false);
    expect(result.output).toContain("8.8.8.8");
  });

  it("fails with 'Network is unreachable' when no route matches at all", () => {
    const state = runAll(["ip route del default"]);
    const result = run(state, "ping -c 2 8.8.8.8");
    expect(result.error).toBe(true);
    expect(result.output.toLowerCase()).toContain("unreachable");
  });

  it("-c controls how many reply lines are printed", () => {
    const result = run(createShell(), "ping -c 3 10.0.1.200");
    const replyLines = result.output
      .split("\n")
      .filter((l) => l.includes("bytes from"));
    expect(replyLines).toHaveLength(3);
  });

  it("works inside a network namespace, against that namespace's own routes", () => {
    const state = runAll([
      "ip netns add lab-net",
      "ip link add veth-host type veth peer name veth-ns",
      "ip link set veth-ns netns lab-net",
      "ip addr add 10.10.0.1/24 dev veth-host",
      "ip netns exec lab-net ip addr add 10.10.0.100/24 dev veth-ns",
    ]);
    const result = run(state, "ip netns exec lab-net ping -c 2 10.10.0.1");
    expect(result.error).toBe(false);
    // the host's own route table never gained a route to the subnet that
    // only exists inside the namespace (isolation didn't leak)
    expect(
      result.state.network.routes.some(
        (r) => r.dest === "10.10.0.0/24" && r.dev === "veth-ns",
      ),
    ).toBe(false);
    expect(
      result.state.netns["lab-net"].routes.some(
        (r) => r.dest === "10.10.0.0/24" && r.dev === "veth-ns",
      ),
    ).toBe(true);
  });
});
