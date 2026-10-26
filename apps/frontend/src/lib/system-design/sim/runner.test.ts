import { describe, expect, it } from "vitest";
import { stepsDue } from "./runner";

describe("stepsDue", () => {
  it("turns elapsed wall time into whole simulation ticks, carrying the remainder", () => {
    expect(
      stepsDue({ elapsedMs: 250, tickMs: 100, speed: 1, carryMs: 0 }),
    ).toEqual({
      steps: 2,
      carryMs: 50,
    });
  });

  it("runs more ticks at a higher speed", () => {
    expect(
      stepsDue({ elapsedMs: 250, tickMs: 100, speed: 4, carryMs: 0 }),
    ).toEqual({
      steps: 10,
      carryMs: 0,
    });
  });

  it("runs fewer ticks at a lower speed", () => {
    expect(
      stepsDue({ elapsedMs: 250, tickMs: 100, speed: 0.5, carryMs: 0 }),
    ).toEqual({
      steps: 1,
      carryMs: 25,
    });
  });

  it("adds the previous carry before dividing", () => {
    expect(
      stepsDue({ elapsedMs: 60, tickMs: 100, speed: 1, carryMs: 50 }),
    ).toEqual({
      steps: 1,
      carryMs: 10,
    });
  });

  it("caps the ticks per frame and drops the carry, so a backgrounded tab doesn't fast-forward", () => {
    expect(
      stepsDue({
        elapsedMs: 60_000,
        tickMs: 10,
        speed: 1,
        carryMs: 0,
        maxSteps: 50,
      }),
    ).toEqual({ steps: 50, carryMs: 0 });
  });
});
