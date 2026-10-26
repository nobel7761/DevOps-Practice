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

describe("ufw status", () => {
  it("is inactive on a fresh shell", () => {
    const result = run(createShell(), "ufw status verbose");
    expect(result.output).toContain("inactive");
  });

  it("shows active status with default policies after enabling", () => {
    const state = runAll([
      "ufw allow 22/tcp",
      "ufw default deny incoming",
      "ufw enable",
    ]);
    const result = run(state, "ufw status verbose");
    expect(result.output).toContain("active");
    expect(result.output.toLowerCase()).toContain("deny");
  });
});

describe("ufw default", () => {
  it("sets the default incoming/outgoing policy", () => {
    const result = run(createShell(), "ufw default deny incoming");
    expect(result.error).toBe(false);
    expect(result.state.firewall.ufw.defaultIncoming).toBe("deny");
  });
});

describe("ufw enable/disable/reset", () => {
  it("enable turns the firewall on", () => {
    const result = run(createShell(), "ufw enable");
    expect(result.state.firewall.ufw.enabled).toBe(true);
  });

  it("disable turns it off but keeps rules", () => {
    const state = runAll(["ufw allow 22/tcp", "ufw enable"]);
    const result = run(state, "ufw disable");
    expect(result.state.firewall.ufw.enabled).toBe(false);
    expect(result.state.firewall.ufw.rules).toHaveLength(1);
  });

  it("reset disables and wipes all rules", () => {
    const state = runAll(["ufw allow 22/tcp", "ufw enable"]);
    const result = run(state, "ufw reset");
    expect(result.state.firewall.ufw.enabled).toBe(false);
    expect(result.state.firewall.ufw.rules).toHaveLength(0);
  });
});

describe("ufw allow/deny rules", () => {
  it("allow <port>/<proto> adds a rule", () => {
    const result = run(createShell(), "ufw allow 22/tcp");
    expect(result.error).toBe(false);
    expect(result.state.firewall.ufw.rules).toContainEqual(
      expect.objectContaining({ action: "allow", port: "22", proto: "tcp" }),
    );
  });

  it("allow <port> without a protocol adds a rule with no proto restriction", () => {
    const result = run(createShell(), "ufw allow 8080");
    expect(result.state.firewall.ufw.rules).toContainEqual(
      expect.objectContaining({ action: "allow", port: "8080" }),
    );
  });

  it("allow <service-name> resolves to its known port/proto", () => {
    const result = run(createShell(), "ufw allow ssh");
    expect(result.state.firewall.ufw.rules).toContainEqual(
      expect.objectContaining({ action: "allow", port: "22", proto: "tcp" }),
    );
  });

  it("allow from <cidr> to any port <port> adds a scoped rule", () => {
    const result = run(
      createShell(),
      "ufw allow from 100.84.0.0/16 to any port 9090",
    );
    expect(result.error).toBe(false);
    expect(result.state.firewall.ufw.rules).toContainEqual(
      expect.objectContaining({
        action: "allow",
        from: "100.84.0.0/16",
        port: "9090",
      }),
    );
  });

  it("deny <port>/<proto> adds a deny rule", () => {
    const result = run(createShell(), "ufw deny 23/tcp");
    expect(result.state.firewall.ufw.rules).toContainEqual(
      expect.objectContaining({ action: "deny", port: "23", proto: "tcp" }),
    );
  });

  it("allow <AppProfile> resolves via the known application profiles", () => {
    const result = run(createShell(), "ufw allow OpenSSH");
    expect(result.error).toBe(false);
    expect(result.state.firewall.ufw.rules).toContainEqual(
      expect.objectContaining({ action: "allow", appProfile: "OpenSSH" }),
    );
  });
});

describe("ufw delete", () => {
  it("delete <number> removes the rule at that position", () => {
    const state = runAll(["ufw allow 22/tcp", "ufw allow 8080/tcp"]);
    const result = run(state, "ufw delete 1");
    expect(result.error).toBe(false);
    expect(result.state.firewall.ufw.rules).toHaveLength(1);
    expect(result.state.firewall.ufw.rules[0].port).toBe("8080");
  });

  it("delete <rule-spec> removes the matching rule", () => {
    const state = runAll(["ufw allow 22/tcp", "ufw deny 23/tcp"]);
    const result = run(state, "ufw delete deny 23/tcp");
    expect(result.error).toBe(false);
    expect(result.state.firewall.ufw.rules).toHaveLength(1);
  });

  it("delete on a nonexistent rule number fails", () => {
    const result = run(createShell(), "ufw delete 5");
    expect(result.error).toBe(true);
  });
});

describe("ufw app", () => {
  it("list shows known application profiles", () => {
    const result = run(createShell(), "ufw app list");
    expect(result.output).toContain("OpenSSH");
  });

  it("info shows a known profile's details", () => {
    const result = run(createShell(), "ufw app info OpenSSH");
    expect(result.error).toBe(false);
    expect(result.output).toContain("22");
  });

  it("info on an unknown profile fails", () => {
    const result = run(createShell(), "ufw app info NoSuchApp");
    expect(result.error).toBe(true);
  });
});

describe("evaluateCheck ufwState", () => {
  it("passes/fails on enabled and default policy", () => {
    const state = runAll([
      "ufw allow 22/tcp",
      "ufw default deny incoming",
      "ufw enable",
    ]);
    const ctx = {
      input: "ufw enable",
      prevState: state,
      result: { state, output: "", error: false },
    };
    expect(
      evaluateCheck(
        { ufwState: { enabled: true, defaultIncoming: "deny" } },
        ctx,
      ).pass,
    ).toBe(true);
    expect(evaluateCheck({ ufwState: { enabled: false } }, ctx).pass).toBe(
      false,
    );
  });

  it("passes/fails on ruleExists", () => {
    const state = runAll(["ufw allow from 100.84.0.0/16 to any port 9090"]);
    const ctx = {
      input: "ufw allow from 100.84.0.0/16 to any port 9090",
      prevState: state,
      result: { state, output: "", error: false },
    };
    expect(
      evaluateCheck(
        {
          ufwState: {
            ruleExists: [
              { action: "allow", port: "9090", from: "100.84.0.0/16" },
            ],
          },
        },
        ctx,
      ).pass,
    ).toBe(true);
    expect(
      evaluateCheck(
        { ufwState: { ruleExists: [{ action: "deny", port: "9090" }] } },
        ctx,
      ).pass,
    ).toBe(false);
  });
});
