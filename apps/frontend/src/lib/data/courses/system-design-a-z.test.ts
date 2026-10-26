import { describe, expect, it } from "vitest";
import { adjacentTopicIds, topicHrefForDay } from "./system-design-a-z";

describe("adjacentTopicIds", () => {
  it("gives the previous and next day's topic ids", () => {
    expect(adjacentTopicIds("sd-day-012")).toEqual({
      previous: "sd-day-011",
      next: "sd-day-013",
    });
  });

  it("has no previous topic for Day 1 and no next topic for Day 117", () => {
    expect(adjacentTopicIds("sd-day-001").previous).toBeNull();
    expect(adjacentTopicIds("sd-day-117").next).toBeNull();
  });
});

describe("topicHrefForDay", () => {
  it("links a day to its module inside the right phase tab", () => {
    expect(topicHrefForDay(12)).toBe(
      "/course/system-design-a-z?milestone=sd-phase-01&module=sd-day-012",
    );
    expect(topicHrefForDay(13)).toBe(
      "/course/system-design-a-z?milestone=sd-phase-02&module=sd-day-013",
    );
    expect(topicHrefForDay(117)).toBe(
      "/course/system-design-a-z?milestone=sd-phase-15&module=sd-day-117",
    );
  });
});
