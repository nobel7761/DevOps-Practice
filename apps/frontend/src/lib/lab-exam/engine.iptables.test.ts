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

describe("iptables -L", () => {
  it("lists the seeded INPUT chain with its default policy", () => {
    const result = run(createShell(), "iptables -L -v -n --line-numbers");
    expect(result.error).toBe(false);
    expect(result.output).toContain("Chain INPUT (policy ACCEPT)");
  });

  it("lists only the requested chain when one is named", () => {
    const result = run(createShell(), "iptables -L OUTPUT");
    expect(result.output).toContain("Chain OUTPUT");
    expect(result.output).not.toContain("Chain INPUT");
  });

  it("fails for an unknown chain", () => {
    const result = run(createShell(), "iptables -L NOPE");
    expect(result.error).toBe(true);
  });
});

describe("iptables -P", () => {
  it("sets a chain's default policy", () => {
    const result = run(createShell(), "iptables -P INPUT DROP");
    expect(result.error).toBe(false);
    expect(result.state.firewall.iptables.chains["INPUT"].policy).toBe("DROP");
  });
});

describe("iptables -I / -A", () => {
  it("-I inserts a rule at position 1, ahead of existing rules", () => {
    const result = run(
      createShell(),
      "iptables -I INPUT 1 -p tcp --dport 22 -j ACCEPT",
    );
    expect(result.error).toBe(false);
    expect(
      result.state.firewall.iptables.chains["INPUT"].rules[0],
    ).toMatchObject({
      target: "ACCEPT",
      proto: "tcp",
      dport: "22",
    });
  });

  it("-A appends a rule to the end of the chain", () => {
    const state = runAll(["iptables -I INPUT 1 -p tcp --dport 22 -j ACCEPT"]);
    const result = run(
      state,
      "iptables -A INPUT -p tcp --dport 8080 -j ACCEPT",
    );
    const rules = result.state.firewall.iptables.chains["INPUT"].rules;
    expect(rules[rules.length - 1]).toMatchObject({
      target: "ACCEPT",
      dport: "8080",
    });
  });

  it("supports -s to match a source CIDR", () => {
    const result = run(
      createShell(),
      "iptables -A INPUT -s 10.0.0.0/24 -p tcp --dport 9090 -j ACCEPT",
    );
    expect(result.state.firewall.iptables.chains["INPUT"].rules).toContainEqual(
      expect.objectContaining({ source: "10.0.0.0/24", dport: "9090" }),
    );
  });

  it("supports DROP, REJECT, and LOG targets", () => {
    const state = runAll([
      "iptables -A INPUT -p tcp --dport 23 -j DROP",
      "iptables -A INPUT -p tcp --dport 24 -j REJECT",
      "iptables -A INPUT -j LOG",
    ]);
    const targets = state.firewall.iptables.chains["INPUT"].rules.map(
      (r) => r.target,
    );
    expect(targets).toContain("DROP");
    expect(targets).toContain("REJECT");
    expect(targets).toContain("LOG");
  });

  it("stores -m limit --limit and -m conntrack --ctstate as rule metadata", () => {
    const result = run(
      createShell(),
      "iptables -A INPUT -p tcp --dport 22 -m limit --limit 5/min -j ACCEPT",
    );
    expect(result.error).toBe(false);
    const rule = result.state.firewall.iptables.chains["INPUT"].rules.find(
      (r) => r.dport === "22",
    );
    expect(rule?.extra?.join(" ")).toContain("5/min");
  });

  it("fails without a -j target", () => {
    const result = run(createShell(), "iptables -A INPUT -p tcp --dport 22");
    expect(result.error).toBe(true);
  });
});

describe("iptables -D", () => {
  it("deletes a rule by line number", () => {
    const state = runAll([
      "iptables -A INPUT -p tcp --dport 22 -j ACCEPT",
      "iptables -A INPUT -p tcp --dport 8080 -j ACCEPT",
    ]);
    const before = state.firewall.iptables.chains["INPUT"].rules.length;
    const result = run(state, "iptables -D INPUT 1");
    expect(result.error).toBe(false);
    expect(result.state.firewall.iptables.chains["INPUT"].rules).toHaveLength(
      before - 1,
    );
  });

  it("deletes a rule by its exact match spec", () => {
    const state = runAll(["iptables -A INPUT -p tcp --dport 23 -j DROP"]);
    const result = run(state, "iptables -D INPUT -p tcp --dport 23 -j DROP");
    expect(result.error).toBe(false);
    expect(
      result.state.firewall.iptables.chains["INPUT"].rules.some(
        (r) => r.dport === "23",
      ),
    ).toBe(false);
  });

  it("fails when no matching rule exists", () => {
    const result = run(
      createShell(),
      "iptables -D INPUT -p tcp --dport 9999 -j DROP",
    );
    expect(result.error).toBe(true);
  });
});

describe("iptables -N / -F", () => {
  it("-N creates a new, empty chain", () => {
    const result = run(createShell(), "iptables -N MYCHAIN");
    expect(result.error).toBe(false);
    expect(result.state.firewall.iptables.chains["MYCHAIN"]).toEqual({
      policy: "ACCEPT",
      rules: [],
    });
  });

  it("-F <chain> clears that chain's rules", () => {
    const state = runAll(["iptables -A INPUT -p tcp --dport 22 -j ACCEPT"]);
    const result = run(state, "iptables -F INPUT");
    expect(result.error).toBe(false);
    expect(result.state.firewall.iptables.chains["INPUT"].rules).toHaveLength(
      0,
    );
  });
});

describe("netfilter-persistent", () => {
  it("save succeeds as a recognized no-op", () => {
    const result = run(createShell(), "netfilter-persistent save");
    expect(result.error).toBe(false);
  });
});

describe("evaluateCheck iptablesRuleExists", () => {
  it("passes/fails on existence", () => {
    const state = runAll(["iptables -A INPUT -p tcp --dport 22 -j ACCEPT"]);
    const ctx = {
      input: "iptables -A INPUT -p tcp --dport 22 -j ACCEPT",
      prevState: state,
      result: { state, output: "", error: false },
    };
    expect(
      evaluateCheck(
        {
          iptablesRuleExists: [
            { chain: "INPUT", target: "ACCEPT", dport: "22" },
          ],
        },
        ctx,
      ).pass,
    ).toBe(true);
    expect(
      evaluateCheck(
        {
          iptablesRuleExists: [{ chain: "INPUT", target: "DROP", dport: "22" }],
        },
        ctx,
      ).pass,
    ).toBe(false);
  });

  it("exists:false requires the rule to be absent", () => {
    const state = runAll(["iptables -A INPUT -p tcp --dport 23 -j DROP"]);
    const afterDelete = run(
      state,
      "iptables -D INPUT -p tcp --dport 23 -j DROP",
    ).state;
    const ctx = {
      input: "iptables -D INPUT -p tcp --dport 23 -j DROP",
      prevState: state,
      result: { state: afterDelete, output: "", error: false },
    };
    expect(
      evaluateCheck(
        {
          iptablesRuleExists: [
            { chain: "INPUT", target: "DROP", dport: "23", exists: false },
          ],
        },
        ctx,
      ).pass,
    ).toBe(true);
  });
});
