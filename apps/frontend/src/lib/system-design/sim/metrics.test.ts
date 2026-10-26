import { describe, expect, it } from "vitest";
import { percentile } from "./metrics";

const oneToHundred = Array.from({ length: 100 }, (_, i) => i + 1);

describe("percentile (nearest-rank)", () => {
  it("returns p50 / p95 / p99 of 1..100", () => {
    expect(percentile(oneToHundred, 50)).toBe(50);
    expect(percentile(oneToHundred, 95)).toBe(95);
    expect(percentile(oneToHundred, 99)).toBe(99);
  });

  it("does not depend on input order and does not mutate it", () => {
    const shuffled = [30, 10, 50, 20, 40];
    expect(percentile(shuffled, 50)).toBe(30);
    expect(shuffled).toEqual([30, 10, 50, 20, 40]);
  });

  it("returns 0 for no samples", () => {
    expect(percentile([], 99)).toBe(0);
  });

  it("returns the only sample for a single value", () => {
    expect(percentile([123], 99)).toBe(123);
  });
});
