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

describe("socket-creating setup commands", () => {
  it("nc -lk <port> & adds a LISTEN socket", () => {
    const result = run(createShell(), "nc -lk 9090 &");
    expect(result.error).toBe(false);
    expect(result.state.sockets).toContainEqual(
      expect.objectContaining({
        localPort: 9090,
        state: "LISTEN",
        program: "nc",
      }),
    );
  });

  it("python3 -m http.server <port> & adds a LISTEN socket", () => {
    const result = run(createShell(), "python3 -m http.server 8080 &");
    expect(result.error).toBe(false);
    expect(result.state.sockets).toContainEqual(
      expect.objectContaining({
        localPort: 8080,
        state: "LISTEN",
        program: "python3",
      }),
    );
  });

  it("nc localhost <port> & against a live listener adds a paired ESTABLISHED connection", () => {
    const state = runAll(["nc -lk 9090 &"]);
    const before = state.sockets.length;
    const result = run(state, "nc localhost 9090 &");
    expect(result.error).toBe(false);
    expect(result.state.sockets.length).toBe(before + 2);
    const established = result.state.sockets.filter(
      (s) => s.state === "ESTABLISHED",
    );
    expect(established).toHaveLength(2);
  });

  it("nc to a port with no listener fails (connection refused)", () => {
    const result = run(createShell(), "nc localhost 9999");
    expect(result.error).toBe(true);
  });
});

describe("ss", () => {
  it("-tlnp lists only LISTEN sockets, including the seeded baseline", () => {
    const result = run(createShell(), "ss -tlnp");
    expect(result.output).toContain("22");
    expect(result.output).toContain("sshd");
    expect(result.output).not.toContain("ESTAB");
  });

  it("shows newly created listeners after the setup commands run", () => {
    const state = runAll(["nc -lk 9090 &", "python3 -m http.server 8080 &"]);
    const result = run(state, "ss -tlnp");
    expect(result.output).toContain("9090");
    expect(result.output).toContain("8080");
  });

  it("-tnp state established filters to only established connections", () => {
    const state = runAll(["nc -lk 9090 &", "nc localhost 9090 &"]);
    const result = run(state, "ss -tnp state established");
    expect(result.output).toContain("ESTABLISHED");
    expect(result.output).not.toContain("LISTEN");
  });

  it("the bracket port filter matches sockets touching that port from either direction", () => {
    const state = runAll(["nc -lk 9090 &", "nc localhost 9090 &"]);
    const result = run(state, "ss -tnp '( dport = :9090 or sport = :9090 )'");
    expect(result.error).toBe(false);
    const lines = result.output.split("\n").filter((l) => l.includes("9090"));
    expect(lines.length).toBeGreaterThan(0);
  });
});

describe("netstat", () => {
  it("-tlnp lists listening sockets with PID/program", () => {
    const result = run(createShell(), "netstat -tlnp");
    expect(result.output).toContain("sshd");
  });

  it("-tanp lists all states, not just LISTEN", () => {
    const state = runAll(["nc -lk 9090 &", "nc localhost 9090 &"]);
    const result = run(state, "netstat -tanp");
    expect(result.output).toContain("LISTEN");
    expect(result.output).toContain("ESTABLISHED");
  });

  it("-i shows a line per network interface", () => {
    const result = run(createShell(), "netstat -i");
    expect(result.output).toContain("eth0");
    expect(result.output).toContain("lo");
  });

  it("-rn shows the routing table", () => {
    const result = run(createShell(), "netstat -rn");
    expect(result.output).toContain("0.0.0.0");
  });
});

describe("filtering by port via grep (existing command, no new behavior needed)", () => {
  it("netstat -tanp piped through grep isolates one port's entries", () => {
    const state = runAll(["nc -lk 9090 &", "nc localhost 9090 &"]);
    const result = run(state, "netstat -tanp | grep :9090");
    expect(result.error).toBe(false);
    expect(result.output).toContain("9090");
    expect(result.output).not.toContain(":22");
  });
});

describe("evaluateCheck socketExists", () => {
  it("passes/fails on existence and state", () => {
    const state = runAll(["nc -lk 9090 &"]);
    const ctx = {
      input: "nc -lk 9090 &",
      prevState: state,
      result: { state, output: "", error: false },
    };
    expect(
      evaluateCheck(
        { socketExists: [{ localPort: 9090, state: "LISTEN" }] },
        ctx,
      ).pass,
    ).toBe(true);
    expect(
      evaluateCheck({ socketExists: [{ localPort: 9999 }] }, ctx).pass,
    ).toBe(false);
  });
});
