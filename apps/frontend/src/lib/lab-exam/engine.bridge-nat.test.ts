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

describe("ip link add type bridge", () => {
  it("creates a down bridge interface", () => {
    const result = run(createShell(), "ip link add br0 type bridge");
    expect(result.error).toBe(false);
    expect(result.state.network.interfaces["br0"]).toMatchObject({
      state: "down",
      kind: "bridge",
    });
  });

  it("fails on a duplicate name", () => {
    const state = runAll(["ip link add br0 type bridge"]);
    const result = run(state, "ip link add br0 type bridge");
    expect(result.error).toBe(true);
  });
});

describe("ip link set master/nomaster", () => {
  it("enslaves an interface to a bridge", () => {
    const state = runAll([
      "ip link add br0 type bridge",
      "ip link add veth-a type veth peer name veth-b",
    ]);
    const result = run(state, "ip link set veth-a master br0");
    expect(result.error).toBe(false);
    expect(result.state.network.interfaces["veth-a"].master).toBe("br0");
  });

  it("fails when the target isn't a bridge", () => {
    const state = runAll(["ip link add veth-a type veth peer name veth-b"]);
    const result = run(state, "ip link set veth-a master veth-b");
    expect(result.error).toBe(true);
  });

  it("nomaster clears bridge membership", () => {
    const state = runAll([
      "ip link add br0 type bridge",
      "ip link add veth-a type veth peer name veth-b",
      "ip link set veth-a master br0",
    ]);
    const result = run(state, "ip link set veth-a nomaster");
    expect(result.error).toBe(false);
    expect(result.state.network.interfaces["veth-a"].master).toBeUndefined();
  });

  it("ip link show reflects the master suffix", () => {
    const state = runAll([
      "ip link add br0 type bridge",
      "ip link add veth-a type veth peer name veth-b",
      "ip link set veth-a master br0",
    ]);
    const result = run(state, "ip link show veth-a");
    expect(result.output).toContain("master br0");
  });
});

describe("evaluateCheck netIfaceState master", () => {
  it("passes once the interface is enslaved to the named bridge", () => {
    const state = runAll([
      "ip link add br0 type bridge",
      "ip link add veth-a type veth peer name veth-b",
      "ip link set veth-a master br0",
    ]);
    const ctx = {
      input: "ip link set veth-a master br0",
      prevState: state,
      result: { state, output: "", error: false },
    };
    expect(
      evaluateCheck({ netIfaceState: [{ name: "veth-a", master: "br0" }] }, ctx)
        .pass,
    ).toBe(true);
    expect(
      evaluateCheck({ netIfaceState: [{ name: "veth-b", master: "br0" }] }, ctx)
        .pass,
    ).toBe(false);
  });
});

describe("iptables MASQUERADE / NAT", () => {
  it("-t nat -A POSTROUTING -o <iface> -j MASQUERADE adds a trackable rule", () => {
    const result = run(
      createShell(),
      "iptables -t nat -A POSTROUTING -o veth-host -j MASQUERADE",
    );
    expect(result.error).toBe(false);
    const chain = result.state.firewall.iptables.chains["POSTROUTING"];
    expect(chain.rules[0]).toMatchObject({
      target: "MASQUERADE",
      outIface: "veth-host",
    });
  });

  it("evaluateCheck iptablesRuleExists matches on outIface", () => {
    const state = runAll([
      "iptables -t nat -A POSTROUTING -o veth-host -j MASQUERADE",
    ]);
    const ctx = {
      input: "iptables -t nat -A POSTROUTING -o veth-host -j MASQUERADE",
      prevState: state,
      result: { state, output: "", error: false },
    };
    expect(
      evaluateCheck(
        {
          iptablesRuleExists: [
            {
              chain: "POSTROUTING",
              target: "MASQUERADE",
              outIface: "veth-host",
            },
          ],
        },
        ctx,
      ).pass,
    ).toBe(true);
    expect(
      evaluateCheck(
        {
          iptablesRuleExists: [
            {
              chain: "POSTROUTING",
              target: "MASQUERADE",
              outIface: "eth0",
            },
          ],
        },
        ctx,
      ).pass,
    ).toBe(false);
  });
});

describe("sysctl", () => {
  it("reads the seeded default", () => {
    const result = run(createShell(), "sysctl net.ipv4.ip_forward");
    expect(result.error).toBe(false);
    expect(result.output).toBe("net.ipv4.ip_forward = 0");
  });

  it("-w sets the value", () => {
    const result = run(createShell(), "sysctl -w net.ipv4.ip_forward=1");
    expect(result.error).toBe(false);
    expect(result.state.sysctl["net.ipv4.ip_forward"]).toBe("1");
  });

  it("key=value without -w also sets the value", () => {
    const result = run(createShell(), "sysctl net.ipv4.ip_forward=1");
    expect(result.error).toBe(false);
    expect(result.state.sysctl["net.ipv4.ip_forward"]).toBe("1");
  });

  it("unknown key fails", () => {
    const result = run(createShell(), "sysctl net.ipv4.nope");
    expect(result.error).toBe(true);
  });
});

describe("evaluateCheck sysctlState", () => {
  it("passes once the value matches", () => {
    const state = runAll(["sysctl -w net.ipv4.ip_forward=1"]);
    const ctx = {
      input: "sysctl -w net.ipv4.ip_forward=1",
      prevState: state,
      result: { state, output: "", error: false },
    };
    expect(
      evaluateCheck(
        {
          sysctlState: [{ key: "net.ipv4.ip_forward", value: "1" }],
        },
        ctx,
      ).pass,
    ).toBe(true);
    expect(
      evaluateCheck(
        {
          sysctlState: [{ key: "net.ipv4.ip_forward", value: "0" }],
        },
        ctx,
      ).pass,
    ).toBe(false);
  });
});
