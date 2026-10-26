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

function setupTraffic(): ShellState {
  return runAll(["nc -lk 9090 &", "nc localhost 9090 &"]);
}

describe("tcpdump", () => {
  it("with no filter on lo shows the captured handshake", () => {
    const state = setupTraffic();
    const result = run(state, "tcpdump -i lo -n");
    expect(result.error).toBe(false);
    expect(result.output).toContain("Flags [S]");
    expect(result.output).toContain("9090");
  });

  it("before any traffic has happened, output is empty but not an error", () => {
    const result = run(createShell(), "tcpdump -i lo -n");
    expect(result.error).toBe(false);
    expect(result.output.trim()).toBe("");
  });

  it("port filter isolates only packets touching that port", () => {
    const state = runAll([
      "nc -lk 9090 &",
      "nc localhost 9090 &",
      "python3 -m http.server 8080 &",
      "nc localhost 8080 &",
    ]);
    const result = run(state, "tcpdump -i lo -n port 9090");
    expect(result.error).toBe(false);
    const lines = result.output.split("\n").filter(Boolean);
    expect(lines.length).toBeGreaterThan(0);
    expect(lines.every((l) => l.includes(".9090") || l.includes("9090 "))).toBe(
      true,
    );
  });

  it("'tcp and port 9090' combines protocol and port filters", () => {
    const state = setupTraffic();
    const result = run(state, "tcpdump -i lo -n tcp and port 9090");
    expect(result.error).toBe(false);
    expect(result.output).toContain("9090");
  });

  it("'not port 22' excludes SSH traffic (there is none captured anyway, so output is unaffected)", () => {
    const state = setupTraffic();
    const result = run(state, "tcpdump -i lo -n not port 22");
    expect(result.error).toBe(false);
    expect(result.output).toContain("9090");
  });

  it("-w writes the captured output to a file, -r reads it back identically", () => {
    const state = setupTraffic();
    const write = run(state, "tcpdump -i lo -n -w capture.pcap");
    expect(write.error).toBe(false);
    const direct = run(state, "tcpdump -i lo -n");
    const read = run(write.state, "tcpdump -r capture.pcap");
    expect(read.error).toBe(false);
    expect(read.output).toBe(direct.output);
  });

  it("-r on a nonexistent file fails", () => {
    const result = run(createShell(), "tcpdump -r missing.pcap");
    expect(result.error).toBe(true);
  });
});
