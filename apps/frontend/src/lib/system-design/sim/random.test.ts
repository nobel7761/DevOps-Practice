import { describe, expect, it } from "vitest";
import { createRng } from "./random";

const take = (next: () => number, n: number) => Array.from({ length: n }, next);

describe("createRng", () => {
  it("gives the same sequence for the same seed, so a scenario can be replayed", () => {
    expect(take(createRng(42), 10)).toEqual(take(createRng(42), 10));
  });

  it("gives a different sequence for a different seed", () => {
    expect(take(createRng(1), 10)).not.toEqual(take(createRng(2), 10));
  });

  it("returns numbers in [0, 1)", () => {
    const values = take(createRng(7), 1000);
    expect(values.every((v) => v >= 0 && v < 1)).toBe(true);
  });

  it("is reasonably spread out", () => {
    const values = take(createRng(99), 1000);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    expect(mean).toBeGreaterThan(0.4);
    expect(mean).toBeLessThan(0.6);
  });
});
