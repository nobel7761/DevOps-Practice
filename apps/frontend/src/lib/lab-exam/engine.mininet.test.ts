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

describe("entering/exiting a Mininet session", () => {
  it("`sudo mn --topo=single,3 --controller=none --mac` builds a 3-host, 1-switch, empty flow table topology", () => {
    const result = run(
      createShell(),
      "sudo mn --topo=single,3 --controller=none --mac",
    );
    expect(result.error).toBe(false);
    expect(result.state.mininet).toBeDefined();
    expect(Object.keys(result.state.mininet!.hosts).sort()).toEqual([
      "h1",
      "h2",
      "h3",
    ]);
    expect(result.state.mininet!.switches.s1.failMode).toBe("secure");
    expect(result.state.mininet!.switches.s1.flows).toEqual([]);
    expect(result.state.mininet!.hosts.h2.attachments[0].ip).toBe("10.0.0.2/8");
  });

  it("`exit` leaves the session and returns to the normal shell", () => {
    const state = runAll(["sudo mn --topo=single,3 --controller=none --mac"]);
    const result = run(state, "exit");
    expect(result.error).toBe(false);
    expect(result.state.mininet).toBeUndefined();
    // back to normal dispatch afterwards
    const pwd = run(result.state, "pwd");
    expect(pwd.error).toBe(false);
  });

  it("every line while in session is routed to the mininet dispatcher, not the host shell", () => {
    const state = runAll(["sudo mn --topo=single,3 --controller=none --mac"]);
    const result = run(state, "pwd");
    expect(result.error).toBe(true);
    expect(result.output).toContain("Unknown command");
  });
});

describe("single,N topology — empty flow table drops everything until flows are added", () => {
  it("pingall with no flows: every pair fails", () => {
    const state = runAll(["sudo mn --topo=single,3 --controller=none --mac"]);
    const out = run(state, "pingall").output;
    expect(out).toContain("*** Results: 100% dropped (0/6 received)");
  });

  it("`action=normal` makes pingall fully succeed (lab 2: Configure and manage network flows)", () => {
    const state = runAll([
      "sudo mn --topo=single,3 --controller=none --mac",
      "sh ovs-ofctl add-flow s1 action=normal",
    ]);
    const out = run(state, "pingall").output;
    expect(out).toContain("*** Results: 0% dropped (6/6 received)");
  });

  it("`del-flows` clears the table back to all-drop", () => {
    const state = runAll([
      "sudo mn --topo=single,3 --controller=none --mac",
      "sh ovs-ofctl add-flow s1 action=normal",
      "sh ovs-ofctl del-flows s1",
    ]);
    const out = run(state, "pingall").output;
    expect(out).toContain("0/6 received");
  });

  it("directional in_port flows only connect the ports they name (lab 2's port-1<->port-2 example)", () => {
    const state = runAll([
      "sudo mn --topo=single,3 --controller=none --mac",
      "sh ovs-ofctl add-flow s1 priority=500,in_port=1,actions=output:2",
      "sh ovs-ofctl add-flow s1 priority=500,in_port=2,actions=output:1",
    ]);
    expect(run(state, "h1 ping -c2 h2").error).toBe(false);
    expect(run(state, "h3 ping -c2 h2").error).toBe(true);
    expect(run(state, "h3 ping -c2 h2").output).toContain(
      "Destination Host Unreachable",
    );
  });

  it("dump-flows lists added flows", () => {
    const state = runAll([
      "sudo mn --topo=single,3 --controller=none --mac",
      "sh ovs-ofctl add-flow s1 priority=500,in_port=1,actions=output:2",
    ]);
    const out = run(state, "sh ovs-ofctl dump-flows s1").output;
    expect(out).toContain("in_port=1");
    expect(out).toContain("output:2");
  });
});

describe("Layer 2 flows (MAC-based) — lab: Layer 2 Traffic Forwarding Setup", () => {
  const l2Flows = [
    "sudo mn --topo=single,3 --controller=none --mac",
    "sh ovs-ofctl add-flow s1 dl_src=00:00:00:00:00:01,dl_dst=00:00:00:00:00:02,actions=output:2",
    "sh ovs-ofctl add-flow s1 dl_src=00:00:00:00:00:02,dl_dst=00:00:00:00:00:01,actions=output:1",
  ];

  it("MAC flows alone still fail pingall — ARP itself has no matching flow", () => {
    const state = runAll(l2Flows);
    const out = run(state, "pingall").output;
    expect(out).toContain("0/6 received");
  });

  it("adding an ARP-flood flow makes h1<->h2 work, but h3 (no flow) stays unreachable", () => {
    const state = runAll([
      ...l2Flows,
      "sh ovs-ofctl add-flow s1 dl_type=0x806,nw_proto=1,action=flood",
    ]);
    expect(run(state, "h1 ping -c2 h2").error).toBe(false);
    expect(run(state, "h1 ping -c2 h3").error).toBe(true);
  });
});

describe("Layer 3 flows (subnet + QoS + per-host ARP) — lab: Layer 3 Traffic Forwarding Setup", () => {
  it("general IP + per-host ARP routing flows let h3 reach h1 and h2", () => {
    const state = runAll([
      "sudo mn --topo=single,3 --controller=none --mac",
      "sh ovs-ofctl add-flow s1 priority=500,dl_type=0x800,nw_src=10.0.0.0/24,nw_dst=10.0.0.0/24,actions=normal",
      "sh ovs-ofctl add-flow s1 priority=800,dl_type=0x800,nw_src=10.0.0.3,nw_dst=10.0.0.0/24,actions=mod_nw_tos:184,normal",
      "sh ovs-ofctl add-flow s1 arp,nw_dst=10.0.0.1,actions=output:1",
      "sh ovs-ofctl add-flow s1 arp,nw_dst=10.0.0.2,actions=output:2",
      "sh ovs-ofctl add-flow s1 arp,nw_dst=10.0.0.3,actions=output:3",
    ]);
    expect(run(state, "h3 ping h1").error).toBe(false);
    expect(run(state, "h3 ping h2").error).toBe(false);
  });

  it("without the ARP rules, the same IP flows still fail (ARP never resolves)", () => {
    const state = runAll([
      "sudo mn --topo=single,3 --controller=none --mac",
      "sh ovs-ofctl add-flow s1 priority=500,dl_type=0x800,nw_src=10.0.0.0/24,nw_dst=10.0.0.0/24,actions=normal",
    ]);
    expect(run(state, "h3 ping h1").error).toBe(true);
  });
});

describe("Layer 4 flows (TCP port) — lab: Layer 4 Traffic Forwarding Setup", () => {
  it("h3 serving on :80 + ARP/TCP/return flows lets h1 curl h3", () => {
    const state = runAll([
      "sudo mn --topo=single,3 --controller=none --mac",
      "h3 python -m SimpleHTTPServer 80 &",
      "sh ovs-ofctl add-flow s1 arp,actions=normal",
      "sh ovs-ofctl add-flow s1 priority=500,dl_type=0x800,nw_proto=6,tp_dst=80,actions=output:3",
      "sh ovs-ofctl add-flow s1 priority=800,ip,nw_src=10.0.0.3,actions=normal",
    ]);
    expect(run(state, "h1 curl h3").error).toBe(false);
  });

  it("without h3's return-traffic rule, curl fails (reply packets never find a matching flow)", () => {
    const state = runAll([
      "sudo mn --topo=single,3 --controller=none --mac",
      "h3 python -m SimpleHTTPServer 80 &",
      "sh ovs-ofctl add-flow s1 arp,actions=normal",
      "sh ovs-ofctl add-flow s1 priority=500,dl_type=0x800,nw_proto=6,tp_dst=80,actions=output:3",
    ]);
    expect(run(state, "h1 curl h3").error).toBe(true);
  });
});

describe("simple_topo.py — Two-Subnet Topology with One Standalone Switch", () => {
  it("same-subnet pings succeed immediately (standalone = normal switch, no flows needed)", () => {
    const state = runAll(["python3 simple_topo.py"]);
    expect(run(state, "h20 ping -c 3 h21").error).toBe(false);
    expect(run(state, "h10 ping -c 3 h11").error).toBe(false);
  });

  it("cross-subnet pings fail — no router, so the source host never routes off-link", () => {
    const state = runAll(["python3 simple_topo.py"]);
    expect(run(state, "h20 ping h10").error).toBe(true);
  });
});

describe("arp_topo.py — basic ARP cache behavior", () => {
  it("ping works immediately (Mininet's own default controller = normal switch)", () => {
    const state = runAll(["sudo python3 arp_topo.py"]);
    expect(run(state, "h1 ping -c1 10.0.0.2").error).toBe(false);
  });

  it("arp -n is empty before any traffic, populated after a ping", () => {
    const state = runAll(["sudo python3 arp_topo.py"]);
    expect(run(state, "h1 arp -n").output).not.toContain("00:00:00:00:00:02");
    const afterPing = run(state, "h1 ping -c1 10.0.0.2").state;
    expect(run(afterPing, "h1 arp -n").output).toContain("00:00:00:00:00:02");
  });

  it("ip neigh flush all clears the cache, arp -s adds a static entry", () => {
    const pinged = runAll(["sudo python3 arp_topo.py", "h1 ping -c1 10.0.0.2"]);
    const flushed = run(pinged, "h1 ip neigh flush all").state;
    expect(run(flushed, "h1 arp -n").output).not.toContain("00:00:00:00:00:02");
    const staticAdded = run(
      flushed,
      "h1 arp -s 10.0.0.2 00:00:00:00:00:02",
    ).state;
    expect(run(staticAdded, "h1 arp -n").output).toContain("00:00:00:00:00:02");
  });
});

describe("advanced_arp_topo.py — router between two subnets", () => {
  it("h1 (10.0.1.0/24) can reach h3 (10.0.2.0/24) via r1's ip_forward", () => {
    const state = runAll(["sudo python3 advanced_arp_topo.py"]);
    const result = run(state, "h1 ping -c1 10.0.2.1");
    expect(result.error).toBe(false);
  });

  it("h1 and h2 (same subnet, same switch) can reach each other directly", () => {
    const state = runAll(["sudo python3 advanced_arp_topo.py"]);
    expect(run(state, "h1 ping -c1 10.0.1.2").error).toBe(false);
  });
});

describe("simulate_vlan_network.py — VLAN isolation", () => {
  it("same-VLAN hosts reach each other, cross-VLAN pairs don't", () => {
    const state = runAll(["sudo python3 simulate_vlan_network.py"]);
    expect(run(state, "h1_100 ping -c 3 h2_100").error).toBe(false);
    expect(run(state, "h1_101 ping -c 3 h2_101").error).toBe(false);
    expect(run(state, "h1_100 ping -c 3 h1_101").error).toBe(true);
  });

  it("pingall matches the documented real-Mininet output format exactly", () => {
    const state = runAll(["sudo python3 simulate_vlan_network.py"]);
    const out = run(state, "pingall").output;
    expect(out).toBe(
      [
        "*** Ping: testing ping reachability",
        "h1_100 -> X h2_100 X ",
        "h1_101 -> X X h2_101 ",
        "h2_100 -> h1_100 X X ",
        "h2_101 -> X h1_101 X ",
        "*** Results: 66% dropped (4/12 received)",
      ].join("\n"),
    );
  });
});

describe("mininet CLI housekeeping commands", () => {
  it("nodes/net/dump/links all respond without erroring", () => {
    const state = runAll(["sudo mn --topo=single,3 --controller=none --mac"]);
    expect(run(state, "nodes").error).toBe(false);
    expect(run(state, "net").error).toBe(false);
    expect(run(state, "dump").error).toBe(false);
    expect(run(state, "links").error).toBe(false);
    expect(run(state, "nodes").output).toContain("h1");
  });

  it("h1 ifconfig shows its MAC and IP", () => {
    const state = runAll(["sudo mn --topo=single,3 --controller=none --mac"]);
    const out = run(state, "h1 ifconfig").output;
    expect(out).toContain("00:00:00:00:00:01");
    expect(out).toContain("10.0.0.1");
  });
});

describe("evaluateCheck mininetFlowExists / mininetReachable", () => {
  function ctxFor(state: ShellState, input: string) {
    return {
      input,
      prevState: state,
      result: { state, output: "", error: false },
    };
  }

  it("mininetFlowExists matches on switch + action, and loosely on match fields", () => {
    const state = runAll([
      "sudo mn --topo=single,3 --controller=none --mac",
      "sh ovs-ofctl add-flow s1 priority=500,in_port=1,actions=output:2",
    ]);
    const ctx = ctxFor(
      state,
      "sh ovs-ofctl add-flow s1 priority=500,in_port=1,actions=output:2",
    );
    expect(
      evaluateCheck(
        {
          mininetFlowExists: [
            { switch: "s1", match: { in_port: "1" }, action: "output:2" },
          ],
        },
        ctx,
      ).pass,
    ).toBe(true);
    expect(
      evaluateCheck(
        {
          mininetFlowExists: [
            { switch: "s1", match: { in_port: "2" }, action: "output:2" },
          ],
        },
        ctx,
      ).pass,
    ).toBe(false);
  });

  it("mininetFlowExists exists:false requires no matching flow (after del-flows)", () => {
    const state = runAll([
      "sudo mn --topo=single,3 --controller=none --mac",
      "sh ovs-ofctl add-flow s1 action=normal",
      "sh ovs-ofctl del-flows s1",
    ]);
    const ctx = ctxFor(state, "sh ovs-ofctl del-flows s1");
    expect(
      evaluateCheck(
        {
          mininetFlowExists: [
            { switch: "s1", action: "normal", exists: false },
          ],
        },
        ctx,
      ).pass,
    ).toBe(true);
  });

  it("mininetReachable agrees with pingall's own reachability computation", () => {
    const state = runAll(["sudo python3 simulate_vlan_network.py"]);
    const ctx = ctxFor(state, "pingall");
    expect(
      evaluateCheck(
        {
          mininetReachable: [{ from: "h1_100", to: "h2_100", reachable: true }],
        },
        ctx,
      ).pass,
    ).toBe(true);
    expect(
      evaluateCheck(
        {
          mininetReachable: [
            { from: "h1_100", to: "h1_101", reachable: false },
          ],
        },
        ctx,
      ).pass,
    ).toBe(true);
    expect(
      evaluateCheck(
        {
          mininetReachable: [{ from: "h1_100", to: "h1_101", reachable: true }],
        },
        ctx,
      ).pass,
    ).toBe(false);
  });
});
