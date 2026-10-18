import { describe, expect, it } from "vitest";
import { mergeProgressIntoCourse } from "./merge-progress";
import type { CourseSummary } from "./course-modules";

function makeCourse(
  contents: CourseSummary["milestones"][0]["modules"][0]["contents"],
): CourseSummary {
  return {
    courseTitle: "Test",
    milestones: [
      {
        id: "m1",
        title: "Milestone 1",
        modules: [
          {
            id: "mod1",
            title: "Module 1",
            contentCounts: {},
            progress: { completed: 0, total: contents.length, percentage: 0 },
            contents,
          },
        ],
      },
    ],
  };
}

describe("mergeProgressIntoCourse", () => {
  it("marks a lab item completed when its labId is in completedKeys", () => {
    const course = makeCourse([
      { type: "lab", title: "Lab A", completed: false, labId: "lab-1" },
    ]);

    const result = mergeProgressIntoCourse(course, new Set(["lab-1"]));

    expect(result.milestones[0].modules[0].contents[0].completed).toBe(true);
  });

  it("marks a video item completed when its contentId is in completedKeys", () => {
    const course = makeCourse([
      {
        type: "live_class",
        title: "Video A",
        completed: false,
        contentId: "vid-1",
      },
    ]);

    const result = mergeProgressIntoCourse(course, new Set(["vid-1"]));

    expect(result.milestones[0].modules[0].contents[0].completed).toBe(true);
  });

  it("leaves an already-completed item completed even without a matching progress key", () => {
    const course = makeCourse([
      { type: "lab", title: "Lab A", completed: true, labId: "lab-1" },
    ]);

    const result = mergeProgressIntoCourse(course, new Set());

    expect(result.milestones[0].modules[0].contents[0].completed).toBe(true);
  });

  it("leaves an item unchanged when its key is not in completedKeys", () => {
    const course = makeCourse([
      { type: "lab", title: "Lab A", completed: false, labId: "lab-1" },
    ]);

    const result = mergeProgressIntoCourse(course, new Set(["other-key"]));

    expect(result.milestones[0].modules[0].contents[0].completed).toBe(false);
  });

  it("does not throw for an item without labId/contentId", () => {
    const course = makeCourse([
      {
        type: "lab",
        title: "Not yet provisioned",
        completed: false,
        labId: null,
      },
    ]);

    const result = mergeProgressIntoCourse(course, new Set(["lab-1"]));

    expect(result.milestones[0].modules[0].contents[0].completed).toBe(false);
  });
});
