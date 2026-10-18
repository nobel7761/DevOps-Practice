import { describe, expect, it } from "vitest";
import { createShell, execute } from "./engine";

describe("ls hides dotfiles unless -a is given (matching real bash)", () => {
  it("bare ls does not list hidden (dotfile) entries", () => {
    let state = createShell();
    state = execute(state, "mkdir /tmp/x").state;
    state = execute(state, 'echo "hi" > /tmp/x/.hidden').state;
    state = execute(state, 'echo "hi" > /tmp/x/visible.txt').state;

    const result = execute(state, "ls /tmp/x");

    expect(result.output.split(/\s+/).filter(Boolean)).toEqual(["visible.txt"]);
  });

  it("ls -a lists hidden entries too, plus . and ..", () => {
    let state = createShell();
    state = execute(state, "mkdir /tmp/x").state;
    state = execute(state, 'echo "hi" > /tmp/x/.hidden').state;
    state = execute(state, 'echo "hi" > /tmp/x/visible.txt').state;

    const result = execute(state, "ls -a /tmp/x");

    expect(result.output.split(/\s+/).filter(Boolean).sort()).toEqual(
      [".", "..", ".hidden", "visible.txt"].sort(),
    );
  });
});
