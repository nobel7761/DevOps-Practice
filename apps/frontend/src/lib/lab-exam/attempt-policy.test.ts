import { describe, expect, it } from "vitest";
import { continueTaskRetryState, shouldRevealAnswer } from "./attempt-policy";

describe("shouldRevealAnswer", () => {
  it("stays hidden before the 10th failed attempt", () => {
    expect(shouldRevealAnswer(9)).toBe(false);
  });

  it("reveals once attempts reach 10", () => {
    expect(shouldRevealAnswer(10)).toBe(true);
  });

  it("stays revealed beyond 10 attempts", () => {
    expect(shouldRevealAnswer(15)).toBe(true);
  });
});

describe("continueTaskRetryState", () => {
  it("clears this task's attempts and revealed hints but preserves task index and prior results", () => {
    const state = {
      attempts: 10,
      revealedHints: 2,
      taskIdx: 3,
      results: [true, true, false],
    };

    expect(continueTaskRetryState(state)).toEqual({
      attempts: 0,
      revealedHints: 0,
      taskIdx: 3,
      results: [true, true, false],
    });
  });
});
