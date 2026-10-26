import { describe, expect, it } from "vitest";
import { createShell, evaluateCheck, execute } from "./engine";
import type { ShellState } from "./engine";

function run(state: ShellState, cmd: string) {
  return execute(state, cmd);
}

function runAll(cmds: string[]): ShellState {
  let state = createShell();
  for (const cmd of cmds) {
    const result = run(state, cmd);
    state = result.state;
  }
  return state;
}

describe("git", () => {
  it("fails with 'not a git repository' outside a repo", () => {
    const result = run(createShell(), "git status");
    expect(result.error).toBe(true);
    expect(result.output).toContain("not a git repository");
  });

  it("init creates .git and sets main as the current branch", () => {
    const result = run(createShell(), "git init");
    expect(result.error).toBe(false);
    expect(result.state.fs["/root/.git"]).toBeDefined();
    expect(result.state.git.currentBranch).toBe("main");
    expect(result.state.git.root).toBe("/root");
  });

  it("running init twice reports 'Reinitialized' and does not error", () => {
    const once = run(createShell(), "git init").state;
    const result = run(once, "git init");
    expect(result.error).toBe(false);
    expect(result.output).toContain("Reinitialized");
  });

  it("add . stages every file under the repo root", () => {
    const state = runAll(["git init", 'echo "hello" > notes.txt', "git add ."]);
    expect(state.git.staged).toContain("/root/notes.txt");
  });

  it("add on a nonexistent path fails with a pathspec error", () => {
    const state = runAll(["git init"]);
    const result = run(state, "git add missing.txt");
    expect(result.error).toBe(true);
    expect(result.output).toContain("did not match any files");
  });

  it("commit with nothing staged fails", () => {
    const state = runAll(["git init"]);
    const result = run(state, 'git commit -m "first"');
    expect(result.error).toBe(true);
  });

  it("commit with staged files succeeds, advances branch history, and clears staged", () => {
    const state = runAll(["git init", 'echo "hello" > notes.txt', "git add ."]);
    const result = run(state, 'git commit -m "first commit"');
    expect(result.error).toBe(false);
    expect(result.state.git.staged).toEqual([]);
    expect(result.state.git.branches["main"]).toHaveLength(1);
    const commitId = result.state.git.branches["main"][0];
    expect(result.state.git.commits[commitId].message).toBe("first commit");
    expect(result.state.git.commits[commitId].files).toContain(
      "/root/notes.txt",
    );
  });

  it("commit with no -m value fails", () => {
    const state = runAll(["git init", 'echo "hello" > notes.txt', "git add ."]);
    const result = run(state, "git commit -m");
    expect(result.error).toBe(true);
  });

  it("log --oneline lists commits with id and message", () => {
    const state = runAll([
      "git init",
      'echo "hello" > notes.txt',
      "git add .",
      'git commit -m "first commit"',
    ]);
    const result = run(state, "git log --oneline");
    expect(result.error).toBe(false);
    expect(result.output).toContain("first commit");
  });

  it("log with zero commits fails", () => {
    const state = runAll(["git init"]);
    const result = run(state, "git log");
    expect(result.error).toBe(true);
    expect(result.output).toContain("does not have any commits yet");
  });

  it("status shows a staged-but-uncommitted file as 'Changes to be committed'", () => {
    const state = runAll(["git init", 'echo "hello" > notes.txt', "git add ."]);
    const result = run(state, "git status");
    expect(result.output).toContain("Changes to be committed");
  });

  it("status shows a committed-then-edited file as 'Changes not staged for commit'", () => {
    const state = runAll([
      "git init",
      'echo "hello" > notes.txt',
      "git add .",
      'git commit -m "first commit"',
      'echo "edited" > notes.txt',
    ]);
    const result = run(state, "git status");
    expect(result.output).toContain("Changes not staged for commit");
  });

  it("status reports a clean working tree after a commit with no further edits", () => {
    const state = runAll([
      "git init",
      'echo "hello" > notes.txt',
      "git add .",
      'git commit -m "first commit"',
    ]);
    const result = run(state, "git status");
    expect(result.output).toContain("nothing to commit, working tree clean");
  });

  it("branch <name> creates a new branch without switching to it", () => {
    const state = runAll(["git init", "git branch feature"]);
    const result = run(state, "git branch");
    expect(result.error).toBe(false);
    expect(state.git.currentBranch).toBe("main");
    const afterBranch = run(state, "git branch feature-x").state;
    expect(afterBranch.git.branches["feature-x"]).toBeDefined();
    expect(afterBranch.git.currentBranch).toBe("main");
  });

  it("branch <name> on a duplicate name fails", () => {
    const state = runAll(["git init", "git branch feature"]);
    const result = run(state, "git branch feature");
    expect(result.error).toBe(true);
  });

  it("checkout -b <name> creates and switches to a new branch", () => {
    const state = runAll(["git init"]);
    const result = run(state, "git checkout -b feature");
    expect(result.error).toBe(false);
    expect(result.state.git.currentBranch).toBe("feature");
    expect(result.state.git.branches["feature"]).toBeDefined();
  });

  it("checkout -b on a duplicate name fails", () => {
    const state = runAll(["git init", "git branch feature"]);
    const result = run(state, "git checkout -b feature");
    expect(result.error).toBe(true);
  });

  it("checkout <name> switches to an existing branch", () => {
    const state = runAll(["git init", "git branch feature"]);
    const result = run(state, "git checkout feature");
    expect(result.error).toBe(false);
    expect(result.state.git.currentBranch).toBe("feature");
  });

  it("checkout <name> on a nonexistent branch fails", () => {
    const state = runAll(["git init"]);
    const result = run(state, "git checkout nope");
    expect(result.error).toBe(true);
  });
});

describe("evaluateCheck gitState", () => {
  it("passes/fails on initialized", () => {
    const notInit = createShell();
    const init = runAll(["git init"]);

    expect(
      evaluateCheck(
        { gitState: { initialized: true } },
        {
          input: "git init",
          prevState: notInit,
          result: { state: init, output: "", error: false },
        },
      ).pass,
    ).toBe(true);

    expect(
      evaluateCheck(
        { gitState: { initialized: true } },
        {
          input: "pwd",
          prevState: notInit,
          result: { state: notInit, output: "", error: false },
        },
      ).pass,
    ).toBe(false);
  });

  it("passes/fails on lastCommitMessage", () => {
    const state = runAll([
      "git init",
      'echo "hello" > notes.txt',
      "git add .",
      'git commit -m "first commit"',
    ]);
    const ctx = {
      input: "git log",
      prevState: state,
      result: { state, output: "", error: false },
    };

    expect(
      evaluateCheck({ gitState: { lastCommitMessage: "first commit" } }, ctx)
        .pass,
    ).toBe(true);
    expect(
      evaluateCheck({ gitState: { lastCommitMessage: "wrong" } }, ctx).pass,
    ).toBe(false);
  });

  it("passes/fails on lastCommitIncludes", () => {
    const state = runAll([
      "git init",
      'echo "hello" > notes.txt',
      "git add .",
      'git commit -m "first commit"',
    ]);
    const ctx = {
      input: "git log",
      prevState: state,
      result: { state, output: "", error: false },
    };

    expect(
      evaluateCheck({ gitState: { lastCommitIncludes: ["~/notes.txt"] } }, ctx)
        .pass,
    ).toBe(true);
    expect(
      evaluateCheck(
        { gitState: { lastCommitIncludes: ["~/missing.txt"] } },
        ctx,
      ).pass,
    ).toBe(false);
  });

  it("fails on clean:true when something is staged", () => {
    const state = runAll(["git init", 'echo "hello" > notes.txt', "git add ."]);
    const ctx = {
      input: "git add .",
      prevState: state,
      result: { state, output: "", error: false },
    };

    expect(evaluateCheck({ gitState: { clean: true } }, ctx).pass).toBe(false);
  });
});
