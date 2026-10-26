import { describe, expect, it } from "vitest";
import { evaluateChallenges, type Challenge } from "./challenges";

interface State {
  failed: number;
  p99: number;
}

const challenges: Challenge<State>[] = [
  {
    id: "no-failures",
    title: "কোনো fail নয়",
    goal: "fail = 0",
    isComplete: (s) => s.failed === 0,
  },
  {
    id: "fast",
    title: "দ্রুত",
    goal: "p99 < 300ms",
    isComplete: (s) => s.p99 < 300,
  },
];

describe("evaluateChallenges", () => {
  it("marks a challenge complete when its goal is met", () => {
    expect(evaluateChallenges(challenges, { failed: 0, p99: 900 }, [])).toEqual(
      ["no-failures"],
    );
  });

  it("keeps a challenge complete even after the state stops meeting the goal", () => {
    expect(
      evaluateChallenges(challenges, { failed: 5, p99: 900 }, ["no-failures"]),
    ).toEqual(["no-failures"]);
  });

  it("returns completed ids in challenge order", () => {
    expect(
      evaluateChallenges(challenges, { failed: 0, p99: 100 }, ["fast"]),
    ).toEqual(["no-failures", "fast"]);
  });
});
