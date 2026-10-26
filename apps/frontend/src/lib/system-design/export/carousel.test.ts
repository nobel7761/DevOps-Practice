import { describe, expect, it } from "vitest";
import { buildRecapSlides, isRecapDay, weekOfDay } from "./carousel";

const topics = Array.from({ length: 7 }, (_, i) => ({
  day: i + 1,
  title: `Topic ${i + 1}`,
  definition: `Definition ${i + 1}`,
}));

describe("buildRecapSlides", () => {
  const slides = buildRecapSlides({
    week: 1,
    topics,
    nextTopics: ["Day 8", "Day 9", "Day 10"],
  });

  it("has a cover, one slide per topic, and a next-week slide", () => {
    expect(slides).toHaveLength(9);
    expect(slides.map((s) => s.kind)).toEqual([
      "cover",
      ...Array(7).fill("topic"),
      "next",
    ]);
  });

  it("shows the week number and day range on the cover", () => {
    expect(slides[0]).toMatchObject({
      kind: "cover",
      week: 1,
      firstDay: 1,
      lastDay: 7,
    });
  });

  it("keeps topics in day order", () => {
    expect(
      slides.slice(1, 8).map((s) => (s.kind === "topic" ? s.day : null)),
    ).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("lists what's coming next on the last slide", () => {
    expect(slides[8]).toEqual({
      kind: "next",
      topics: ["Day 8", "Day 9", "Day 10"],
    });
  });
});

describe("weekOfDay / isRecapDay", () => {
  it("maps days to 7-day weeks", () => {
    expect(weekOfDay(1)).toBe(1);
    expect(weekOfDay(7)).toBe(1);
    expect(weekOfDay(8)).toBe(2);
    expect(weekOfDay(117)).toBe(17);
  });

  it("has a recap every 7th day", () => {
    expect(isRecapDay(7)).toBe(true);
    expect(isRecapDay(14)).toBe(true);
    expect(isRecapDay(12)).toBe(false);
  });
});
