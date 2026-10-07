import { describe, expect, it } from "vitest";
import { formatTotalDuration } from "./duration";
import type { CourseSummary } from "@/lib/data/course-modules";

function courseWithDurations(
  durationLabels: (string | null | undefined)[],
): CourseSummary {
  return {
    courseTitle: "Test course",
    milestones: [
      {
        id: "m1",
        title: "Milestone 1",
        modules: [
          {
            id: "m1-mod",
            title: "Module 1",
            contentCounts: {},
            progress: { completed: 0, total: 0, percentage: 0 },
            contents: durationLabels.map((durationLabel) => ({
              type: "udemy_lecture",
              title: "Lecture",
              completed: false,
              durationLabel,
            })),
          },
        ],
      },
    ],
  };
}

describe("formatTotalDuration", () => {
  it("sums minute:second labels under an hour into an 'Xm' label", () => {
    const course = courseWithDurations(["12:28", "7:17", "9:01"]);
    expect(formatTotalDuration(course)).toBe("28m");
  });

  it("sums minute:second labels over an hour into an 'Xh Ym' label", () => {
    const course = courseWithDurations(["55:00", "10:00", "20:00"]);
    expect(formatTotalDuration(course)).toBe("1h 25m");
  });

  it("parses hour:minute:second labels", () => {
    const course = courseWithDurations(["1:02:15", "0:45:00"]);
    expect(formatTotalDuration(course)).toBe("1h 47m");
  });

  it("ignores items with no duration label", () => {
    const course = courseWithDurations(["12:28", null, undefined, "7:32"]);
    expect(formatTotalDuration(course)).toBe("20m");
  });

  it("returns null when no content item has a duration label", () => {
    const course = courseWithDurations([null, undefined]);
    expect(formatTotalDuration(course)).toBeNull();
  });
});
