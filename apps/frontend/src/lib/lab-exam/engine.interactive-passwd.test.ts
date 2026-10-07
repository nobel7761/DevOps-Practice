import { describe, expect, it } from "vitest";
import {
  createShell,
  evaluateCheck,
  execute,
  isAwaitingInput,
  submitInput,
} from "./engine";

function shellWithJoker() {
  const created = execute(createShell(), "useradd joker");
  return created.state;
}

describe("interactive passwd prompting", () => {
  it("does not finish immediately — it asks for the new password first", () => {
    const result = execute(shellWithJoker(), "passwd joker");

    expect(result.output).toBe("New password: ");
    expect(result.output).not.toContain("password updated successfully");
    expect(isAwaitingInput(result.state)).toBe(true);
  });

  it("asks to retype the password after the first entry", () => {
    const afterPrompt = execute(shellWithJoker(), "passwd joker");
    const afterFirstEntry = submitInput(afterPrompt.state, "s3cret!");

    expect(afterFirstEntry.output).toBe("Retype new password: ");
    expect(isAwaitingInput(afterFirstEntry.state)).toBe(true);
  });

  it("succeeds and marks the password set when both entries match", () => {
    const afterPrompt = execute(shellWithJoker(), "passwd joker");
    const afterFirstEntry = submitInput(afterPrompt.state, "s3cret!");
    const afterConfirm = submitInput(afterFirstEntry.state, "s3cret!");

    expect(afterConfirm.error).toBe(false);
    expect(afterConfirm.output).toBe("passwd: password updated successfully");
    expect(isAwaitingInput(afterConfirm.state)).toBe(false);
    expect(afterConfirm.state.users.joker.passwordSet).toBe(true);
  });

  it("fails and leaves the password unset when the entries don't match", () => {
    const afterPrompt = execute(shellWithJoker(), "passwd joker");
    const afterFirstEntry = submitInput(afterPrompt.state, "s3cret!");
    const afterConfirm = submitInput(afterFirstEntry.state, "different!");

    expect(afterConfirm.error).toBe(true);
    expect(afterConfirm.output).toContain("do not match");
    expect(isAwaitingInput(afterConfirm.state)).toBe(false);
    expect(afterConfirm.state.users.joker.passwordSet).toBeFalsy();
  });

  it('still grades a `ref: "passwd joker"` task correctly once the real flow completes', () => {
    const prevState = shellWithJoker();
    const afterPrompt = execute(prevState, "passwd joker");
    const afterFirstEntry = submitInput(afterPrompt.state, "s3cret!");
    const result = submitInput(afterFirstEntry.state, "s3cret!");

    const check = evaluateCheck(
      { require: ["passwd"], forbid: ["-l", "-u", "-S"], ref: "passwd joker" },
      { input: "passwd joker", prevState, result },
    );

    expect(check.pass).toBe(true);
  });
});
