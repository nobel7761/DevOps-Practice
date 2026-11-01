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

describe("mv", () => {
  it("renames a file", () => {
    const state = runAll(['echo "hi" > a.txt']);
    const result = run(state, "mv a.txt b.txt");
    expect(result.error).toBe(false);
    expect(result.state.fs["/root/a.txt"]).toBeUndefined();
    expect(result.state.fs["/root/b.txt"]?.content).toBe("hi");
  });

  it("moves a file into an existing directory, keeping its basename", () => {
    const state = runAll(["mkdir archive", 'echo "hi" > a.txt']);
    const result = run(state, "mv a.txt archive");
    expect(result.error).toBe(false);
    expect(result.state.fs["/root/a.txt"]).toBeUndefined();
    expect(result.state.fs["/root/archive/a.txt"]?.content).toBe("hi");
  });

  it("moves a directory and its contents", () => {
    const state = runAll(["mkdir src", 'echo "hi" > src/a.txt']);
    const result = run(state, "mv src dst");
    expect(result.error).toBe(false);
    expect(result.state.fs["/root/src"]).toBeUndefined();
    expect(result.state.fs["/root/dst"]).toBeDefined();
    expect(result.state.fs["/root/dst/a.txt"]?.content).toBe("hi");
  });

  it("fails on a missing source", () => {
    const result = run(createShell(), "mv nope.txt dest.txt");
    expect(result.error).toBe(true);
  });
});
